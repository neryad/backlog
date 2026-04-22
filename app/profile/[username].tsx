import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useGlobalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../src/constants/theme";
import { supabase } from "../../src/lib/supabase";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
};

type RemoteEntry = {
  id: string;
  title: string;
  cover_url: string | null;
  status: string;
  personal_rating: number | null;
  hours_played: number;
  platform_id: number | null;
};

const STATUS_COLORS: Record<string, string> = {
  playing:   colors.primary,
  completed: colors.success,
  backlog:   colors.textMuted,
  dropped:   colors.danger,
  wishlist:  colors.warning,
};

export default function ProfileScreen() {
  const { username } = useGlobalSearchParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<RemoteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  async function loadProfile() {
    setLoading(true);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .eq("username", username)
      .single();

    if (!profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: entriesData } = await supabase
      .from("game_entries")
      .select(
        "id, title, cover_url, status, personal_rating, hours_played, platform_id",
      )
      .eq("user_id", profileData.id)
      .eq("is_public", true)
      .order("updated_at", { ascending: false });

    setEntries(entriesData ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Ionicons name="person-outline" size={48} color={colors.textMuted} />
        <Text style={styles.notFoundText}>User not found</Text>
      </View>
    );
  }

  // Stats rápidas
  const total = entries.length;
  const completed = entries.filter((e) => e.status === "completed").length;
  const playing = entries.filter((e) => e.status === "playing").length;
  const rated = entries.filter((e) => e.personal_rating != null);
  const avgRating =
    rated.length > 0
      ? (
          rated.reduce((sum, e) => sum + e.personal_rating!, 0) / rated.length
        ).toFixed(1)
      : null;

  return (
    <FlatList
      style={styles.container}
      data={entries}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          {/* Profile header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={colors.primary} />
            </View>
            <Text style={styles.username}>{profile?.username}</Text>
            {profile?.display_name && (
              <Text style={styles.displayName}>{profile.display_name}</Text>
            )}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{total}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{playing}</Text>
              <Text style={styles.statLabel}>Playing</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{avgRating ?? "—"}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Backlog</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.entryRow}>
          {item.cover_url ? (
            <Image
              source={{ uri: item.cover_url }}
              style={styles.cover}
              contentFit="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons
                name="game-controller"
                size={20}
                color={colors.textMuted}
              />
            </View>
          )}
          <View style={styles.entryInfo}>
            <Text style={styles.entryTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.entryMeta}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      (STATUS_COLORS[item.status] ?? "#888") + "33",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[item.status] ?? "#888" },
                  ]}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
              {item.personal_rating && (
                <Text style={styles.rating}>★ {item.personal_rating}</Text>
              )}
              {item.hours_played > 0 && (
                <Text style={styles.hours}>{item.hours_played}h</Text>
              )}
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No public games yet.</Text>
      }
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  notFoundText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "22",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  username: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  displayName: {
    color: colors.textMuted,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statNumber: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  entryRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  cover: {
    width: 44,
    height: 60,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    width: 44,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  entryInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  entryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  entryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  rating: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "600",
  },
  hours: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
