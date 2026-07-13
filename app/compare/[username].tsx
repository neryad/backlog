import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../src/constants/theme";
import { fontFamily } from "../../src/constants/typography";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/auth.store";
import { getGameEntries } from "../../src/db/queries/game";
import type { GameEntry } from "../../src/types/game";

type RemoteEntry = {
  id: string;
  igdb_id: number | null;
  title: string;
  cover_url: string | null;
  status: string;
  personal_rating: number | null;
  hours_played: number;
  notes: string | null;
};

type CommonGame = {
  igdbId: number;
  title: string;
  coverUrl: string | null;
  mine: GameEntry;
  theirs: RemoteEntry;
};

const STATUS_COLORS: Record<string, string> = {
  playing:          colors.primary,
  "playing-social": colors.statusPlayingSocial,
  completed:        colors.success,
  backlog:          colors.foregroundMuted,
  paused:           colors.statusOnHold,
  dropped:          colors.danger,
  wishlist:         colors.warning,
};

const STATUS_LABELS: Record<string, string> = {
  playing:          "Playing",
  "playing-social": "Playing (Social)",
  completed:        "Completed",
  backlog:          "Backlog",
  paused:           "Paused",
  dropped:          "Dropped",
  wishlist:         "Wishlist",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? colors.foregroundMuted;
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + "33" }]}>
      <Text style={[styles.statusText, { color }]}>
        {STATUS_LABELS[status] ?? status}
      </Text>
    </View>
  );
}

function CommonGameCard({
  item,
  friendUsername,
}: {
  item: CommonGame;
  friendUsername: string;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const hasNotes = !!(item.mine.notes || item.theirs.notes);
  const myHours = item.mine.hoursPlayed;
  const theirHours = item.theirs.hours_played;
  const myRating = item.mine.personalRating;
  const theirRating = item.theirs.personal_rating;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="game-controller" size={18} color={colors.foregroundMuted} />
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.rowLabel} />
        <Text style={[styles.colHeader, { textAlign: "center" }]}>Tú</Text>
        <Text style={[styles.colHeader, { textAlign: "center" }]}>@{friendUsername}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Estado</Text>
        <View style={styles.cell}><StatusBadge status={item.mine.status} /></View>
        <View style={styles.cell}><StatusBadge status={item.theirs.status} /></View>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Horas</Text>
        <Text style={[styles.value, myHours > theirHours && styles.winner]}>
          {myHours > 0 ? `${myHours}h` : "—"}
        </Text>
        <Text style={[styles.value, theirHours > myHours && styles.winner]}>
          {theirHours > 0 ? `${theirHours}h` : "—"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Rating</Text>
        <Text style={[
          styles.value, styles.ratingValue,
          myRating != null && theirRating != null && myRating > theirRating && styles.winner,
        ]}>
          {myRating != null ? `★ ${myRating}` : "—"}
        </Text>
        <Text style={[
          styles.value, styles.ratingValue,
          myRating != null && theirRating != null && theirRating > myRating && styles.winner,
        ]}>
          {theirRating != null ? `★ ${theirRating}` : "—"}
        </Text>
      </View>

      {hasNotes && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => setNotesOpen((v) => !v)}
            style={styles.notesToggle}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.foregroundMuted} />
            <Text style={styles.notesToggleText}>
              {notesOpen ? "Ocultar notas" : "Ver notas"}
            </Text>
            <Ionicons
              name={notesOpen ? "chevron-up" : "chevron-down"}
              size={12}
              color={colors.foregroundMuted}
            />
          </TouchableOpacity>
          {notesOpen && (
            <View style={styles.notesRow}>
              <View style={styles.noteBox}>
                <Text style={styles.noteBoxLabel}>Tú</Text>
                <Text style={styles.noteText}>{item.mine.notes || "—"}</Text>
              </View>
              <View style={styles.noteBox}>
                <Text style={styles.noteBoxLabel}>@{friendUsername}</Text>
                <Text style={styles.noteText}>{item.theirs.notes || "—"}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

export default function CompareScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { session } = useAuthStore();
  const [theirEntries, setTheirEntries] = useState<RemoteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [username]);

  async function load() {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from("game_entries")
        .select("id, igdb_id, title, cover_url, status, personal_rating, hours_played, notes")
        .eq("user_id", profile.id)
        .eq("is_public", true)
        .limit(50);

      setTheirEntries(data ?? []);
    } catch (err) {
      if (__DEV__) console.error("compare load error:", err);
    } finally {
      setLoading(false);
    }
  }

  const myEntries = getGameEntries();

  const myByIgdbId = new Map<number, GameEntry>();
  for (const e of myEntries) {
    if (e.game?.igdbId != null) myByIgdbId.set(e.game.igdbId, e);
  }

  const commonGames: CommonGame[] = [];
  for (const entry of theirEntries) {
    if (entry.igdb_id == null) continue;
    const mine = myByIgdbId.get(entry.igdb_id);
    if (mine) {
      commonGames.push({
        igdbId: entry.igdb_id,
        title: entry.title,
        coverUrl: entry.cover_url,
        mine,
        theirs: entry,
      });
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `En común con @${username}` }} />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.container}
          data={commonGames}
          keyExtractor={(item) => String(item.igdbId)}
          renderItem={({ item }) => (
            <CommonGameCard item={item} friendUsername={username ?? ""} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="game-controller-outline" size={40} color={colors.foregroundMuted} />
              <Text style={styles.emptyText}>No tienen juegos en común todavía.</Text>
              <Text style={styles.emptyHint}>
                Los juegos se comparan por ID de IGDB y el amigo debe tener su backlog público.
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}
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
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cover: {
    width: 40,
    height: 54,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    backgroundColor: colors.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    color: colors.foreground,
    fontSize: 15,
    fontFamily: fontFamily.sansSemibold,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
  },
  rowLabel: {
    width: 52,
    color: colors.foregroundMuted,
    fontSize: 10,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cell: {
    flex: 1,
    alignItems: "center",
  },
  colHeader: {
    flex: 1,
    color: colors.foregroundMuted,
    fontSize: 10,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingBottom: 2,
  },
  value: {
    flex: 1,
    color: colors.foreground,
    fontSize: 13,
    fontFamily: fontFamily.mono,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  winner: {
    color: colors.primary,
    fontFamily: fontFamily.monoBold,
  },
  ratingValue: {
    color: colors.warning,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamily.sansSemibold,
  },
  notesToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  notesToggleText: {
    flex: 1,
    color: colors.foregroundMuted,
    fontSize: 11,
    fontFamily: fontFamily.sansMedium,
  },
  notesRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  noteBox: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 3,
  },
  noteBoxLabel: {
    color: colors.foregroundMuted,
    fontSize: 9,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noteText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.xl * 2,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.foregroundMuted,
    fontSize: 15,
    fontFamily: fontFamily.sansSemibold,
    textAlign: "center",
  },
  emptyHint: {
    color: colors.foregroundMuted,
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 18,
  },
});
