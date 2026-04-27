import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Share,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useGlobalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../src/constants/theme";
import { supabase } from "../../src/lib/supabase";
import { fontFamily } from "../../src/constants/typography";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  psn_id: string | null;
  xbox_gamertag: string | null;
  switch_code: string | null;
  steam_id: string | null;
  epic_id: string | null;
};

const PLATFORM_META: { key: keyof Profile; label: string; badge: string; color: string }[] = [
  { key: "psn_id", label: "PlayStation", badge: "PS", color: colors.platformPSN },
  { key: "xbox_gamertag", label: "Xbox", badge: "XB", color: colors.platformXbox },
  { key: "switch_code", label: "Switch", badge: "NSW", color: colors.platformSwitch },
  { key: "steam_id", label: "Steam", badge: "STM", color: colors.platformSteam },
  { key: "epic_id", label: "Epic", badge: "EPC", color: colors.platformEpic },
];

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
  playing:           colors.primary,
  "playing-social":  colors.statusPlayingSocial,
  completed:         colors.success,
  backlog:           colors.foregroundMuted,
  dropped:           colors.danger,
  wishlist:          colors.warning,
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

  const handleShare = useCallback(async () => {
    if (!profile) return;

    const lines: string[] = [`@${profile.username} on Playlogged`];
    if (profile.psn_id) lines.push(`PlayStation: ${profile.psn_id}`);
    if (profile.xbox_gamertag) lines.push(`Xbox: ${profile.xbox_gamertag}`);
    if (profile.switch_code) lines.push(`Nintendo Switch: ${profile.switch_code}`);
    if (profile.steam_id) lines.push(`Steam: ${profile.steam_id}`);
    if (profile.epic_id) lines.push(`Epic Games: ${profile.epic_id}`);
    lines.push(`\nhttps://playlogged.neryad.dev/profile/${profile.username}`);

    await Share.share({ message: lines.join("\n") });
  }, [profile]);

  async function loadProfile() {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, display_name, psn_id, xbox_gamertag, switch_code, steam_id, epic_id")
        .eq("username", username)
        .single();

      if (!profileData) {
        setNotFound(true);
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
    } catch (err) {
      if (__DEV__) console.error("loadProfile error:", err);
    } finally {
      setLoading(false);
    }
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
        <Ionicons name="person-outline" size={48} color={colors.foregroundMuted} />
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
    <>
      <Stack.Screen
        options={{
          title: `@${profile?.username ?? username}`,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="share-outline" size={22} color={colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
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
              <Text style={styles.statLabel}>Public</Text>
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

          {PLATFORM_META.some((p) => profile?.[p.key]) && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: spacing.sm }]}>
                Find me on
              </Text>
              <View style={styles.platformsRow}>
                {PLATFORM_META.filter((p) => profile?.[p.key]).map((p) => (
                  <View key={p.key} style={styles.platformChip}>
                    <View style={[styles.platformBadge, { backgroundColor: p.color + "22" }]}>
                      <Text style={[styles.platformBadgeText, { color: p.color }]}>
                        {p.badge}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.platformLabel}>{p.label}</Text>
                      <Text style={styles.platformId} numberOfLines={1}>
                        {profile?.[p.key] as string}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>Public backlog</Text>
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
                color={colors.foregroundMuted}
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
                      (STATUS_COLORS[item.status] ?? colors.foregroundMuted) + "33",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[item.status] ?? colors.foregroundMuted },
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
    </>
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
    color: colors.foregroundMuted,
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
    color: colors.foreground,
    fontSize: 22,
    fontFamily: fontFamily.displayBold,
  },
  displayName: {
    color: colors.foregroundMuted,
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
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statNumber: {
    color: colors.foreground,
    fontSize: 20,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: colors.foregroundMuted,
    fontSize: 11,
    textAlign: "center",
  },
  sectionLabel: {
    color: colors.foregroundMuted,
    fontSize: 11,
    fontFamily: fontFamily.sansSemibold,
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
    backgroundColor: colors.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  entryInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  entryTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontFamily: fontFamily.sansSemibold,
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
    fontFamily: fontFamily.sansSemibold,
  },
  rating: {
    color: colors.warning,
    fontSize: 12,
    fontFamily: fontFamily.mono,
    fontVariant: ["tabular-nums"],
  },
  hours: {
    color: colors.foregroundMuted,
    fontSize: 12,
    fontFamily: fontFamily.mono,
    fontVariant: ["tabular-nums"],
  },
  emptyText: {
    color: colors.foregroundMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  platformsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  platformChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  platformBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.sansBold,
    letterSpacing: 0.5,
  },
  platformLabel: {
    color: colors.foregroundMuted,
    fontSize: 10,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  platformId: {
    color: colors.foreground,
    fontSize: 13,
    fontFamily: fontFamily.sansMedium,
    maxWidth: 120,
  },
});
