import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, radius } from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/auth.store";
import { useUIStore } from "../../src/store/ui.store";
import { supabase } from "../../src/lib/supabase";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
};

type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
};

type Friend = {
  user_id: string;
  friend_id: string;
  created_at: string;
  profile?: Profile;
};

export default function FriendsScreen() {
  const { session } = useAuthStore();
  const setPendingFriendRequests = useUIStore(
    (state) => state.setPendingFriendRequests,
  );
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ hooks siempre se llaman — el check de sesión va al final
  useFocusEffect(
    useCallback(() => {
      if (!session) {
        setPendingFriendRequests(0);
        return;
      }
      loadFriends();
    }, [session, setPendingFriendRequests]),
  );

  async function loadFriends() {
    setLoading(true);
    const userId = session!.user.id;

    try {
      // Amigos: 2 queries en total (friends + batch de perfiles) en vez de N+1.
      const { data: friendsData } = await supabase
        .from("friends")
        .select("user_id, friend_id, created_at")
        .eq("user_id", userId);

      if (friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map((f) => f.friend_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", friendIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]));
        setFriends(
          friendsData.map((f) => ({
            ...f,
            profile: profileMap.get(f.friend_id) ?? undefined,
          })),
        );
      } else {
        setFriends([]);
      }

      // Solicitudes pendientes: 2 queries en total en vez de N+1.
      const { data: requestsData } = await supabase
        .from("friend_requests")
        .select("id, sender_id, receiver_id, status, created_at")
        .eq("receiver_id", userId)
        .eq("status", "pending");

      if (requestsData && requestsData.length > 0) {
        const senderIds = requestsData.map((r) => r.sender_id);
        const { data: senderProfiles } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", senderIds);

        const senderMap = new Map(senderProfiles?.map((p) => [p.id, p]));
        const enriched = requestsData.map((r) => ({
          ...r,
          sender: senderMap.get(r.sender_id) ?? undefined,
        }));
        setPendingRequests(enriched);
        setPendingFriendRequests(enriched.length);
      } else {
        setPendingRequests([]);
        setPendingFriendRequests(0);
      }
    } catch (err) {
      if (__DEV__) console.error("loadFriends error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (search.trim().length < 2) return;
    setSearching(true);
    setSearchResults([]);

    // Strip PostgREST filter-syntax characters to prevent query injection.
    const safe = search.trim().replace(/[(),."']/g, "");

    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`)
      .neq("id", session!.user.id)
      .limit(10);

    setSearchResults(data ?? []);
    setSearching(false);
  }

  async function sendRequest(receiverId: string) {
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: session!.user.id,
      receiver_id: receiverId,
    });

    if (error) {
      if (error.code === "23505") {
        Alert.alert("Already sent", "You already sent a request to this user.");
      } else {
        Alert.alert("Error", error.message);
      }
    } else {
      Alert.alert("Request sent", "Friend request sent successfully.");
      setSearch("");
      setSearchResults([]);
    }
  }

  async function acceptRequest(requestId: string, senderId: string) {
    try {
      // Eliminar la solicitud
      const { error: deleteError } = await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId);

      if (deleteError) {
        if (__DEV__) console.error("Delete error:", deleteError);
        Alert.alert(
          "Error",
          `Failed to delete request: ${deleteError.message}`,
        );
        return;
      }

      // Agregar amigos
      const { error: insertError } = await supabase.from("friends").insert([
        { user_id: session!.user.id, friend_id: senderId },
        { user_id: senderId, friend_id: session!.user.id },
      ]);

      if (insertError) {
        if (__DEV__) console.error("Insert error:", insertError);
        Alert.alert("Error", `Failed to add friend: ${insertError.message}`);
        return;
      }

      setPendingRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        setPendingFriendRequests(next.length);
        return next;
      });

      await loadFriends();
      Alert.alert("Success", "Friend added!");
    } catch (err) {
      if (__DEV__) console.error("acceptRequest error:", err);
      Alert.alert("Error", String(err));
    }
  }

  async function rejectRequest(requestId: string) {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId);

      if (error) {
        if (__DEV__) console.error("Reject error:", error);
        Alert.alert("Error", `Failed to reject: ${error.message}`);
        return;
      }

      setPendingRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        setPendingFriendRequests(next.length);
        return next;
      });

      await loadFriends();
    } catch (err) {
      if (__DEV__) console.error("rejectRequest error:", err);
      Alert.alert("Error", String(err));
    }
  }

  async function removeFriend(friendId: string) {
    Alert.alert("Remove Friend", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const me = session!.user.id;

            // Always remove the current user's row first.
            const { error: ownDeleteError } = await supabase
              .from("friends")
              .delete()
              .eq("user_id", me)
              .eq("friend_id", friendId);

            if (ownDeleteError) {
              Alert.alert(
                "Error",
                `Failed to remove friend: ${ownDeleteError.message}`,
              );
              return;
            }

            // Try to remove the mirrored row too (may be blocked by strict RLS).
            const { error: mirrorDeleteError } = await supabase
              .from("friends")
              .delete()
              .eq("user_id", friendId)
              .eq("friend_id", me);

            if (mirrorDeleteError) {
              if (__DEV__) console.warn("Mirror row cleanup failed:", mirrorDeleteError.message);
            }

            await loadFriends();
          } catch (err) {
            Alert.alert("Error", String(err));
          }
        },
      },
    ]);
  }

  const isFriend = (profileId: string) =>
    friends.some((f) => f.user_id === profileId || f.friend_id === profileId);

  // ✅ check de sesión al final, después de todos los hooks
  if (!session) {
    return (
      <View style={styles.guestContainer}>
        <Ionicons name="people-outline" size={64} color={colors.textMuted} />
        <Text style={styles.guestTitle}>Connect with friends</Text>
        <Text style={styles.guestDesc}>
          Create an account to add friends and see their backlogs.
        </Text>
        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.guestBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.guestLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          {searching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="search" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search results */}
      {searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Search Results</Text>
          {searchResults.map((profile) => (
            <View key={profile.id} style={styles.userRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{profile.username}</Text>
                {profile.display_name && (
                  <Text style={styles.displayName}>{profile.display_name}</Text>
                )}
              </View>
              {isFriend(profile.id) ? (
                <Text style={styles.alreadyFriend}>Friends</Text>
              ) : (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => sendRequest(profile.id)}
                >
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xl }}
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* Pending requests */}
              {pendingRequests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>
                    Pending Requests ({pendingRequests.length})
                  </Text>
                  {pendingRequests.map((req) => (
                    <View key={req.id} style={styles.userRow}>
                      <View style={styles.avatar}>
                        <Ionicons
                          name="person"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.username}>
                          {req.sender?.username ?? "Unknown"}
                        </Text>
                        <Text style={styles.displayName}>
                          wants to be your friend
                        </Text>
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => acceptRequest(req.id, req.sender_id)}
                        >
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => rejectRequest(req.id)}
                        >
                          <Ionicons
                            name="close"
                            size={18}
                            color={colors.textMuted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Friends list */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Friends ({friends.length})
                </Text>
                {friends.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No friends yet. Search for someone to add.
                  </Text>
                ) : (
                  friends.map((f) => (
                    <TouchableOpacity
                      key={`${f.user_id}-${f.friend_id}`}
                      style={styles.userRow}
                      onPress={() => {
                        if (!f.profile?.username) return;
                        router.navigate(`/profile/${f.profile.username}`);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.avatar}>
                        <Ionicons
                          name="person"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.username}>
                          {f.profile?.username ?? "Unknown"}
                        </Text>
                        {f.profile?.display_name && (
                          <Text style={styles.displayName}>
                            {f.profile.display_name}
                          </Text>
                        )}
                      </View>
                      {/* ✅ Botón remove friend */}
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => {
                          const friendId =
                            f.user_id === session.user.id
                              ? f.friend_id
                              : f.user_id;
                          removeFriend(friendId);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="person-remove-outline"
                          size={18}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  guestTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  guestDesc: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  guestBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  guestBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  guestLink: {
    color: colors.primary,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "22",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  displayName: {
    color: colors.textMuted,
    fontSize: 12,
  },
  alreadyFriend: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  removeBtn: {
    padding: spacing.xs,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
