import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";

import { PLATFORMS } from "../../constants/platforms";
import { colors, spacing, radius } from "../../constants/theme";
import { GameSearchResult } from "../../types/igdb.types";
import { GameStatus } from "../../types/game";
import {
  gameExistsByIgdbId,
  insertGame,
  insertGameEntry,
} from "../../db/queries/game";

const STATUSES: { value: GameStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "playing", label: "Playing" },
  { value: "playing-social", label: "Playing (Social)" },
  { value: "completed", label: "Completed" },
  { value: "wishlist", label: "Wishlist" },
];

type Props = {
  game: GameSearchResult;
  onAdded: () => void;
  onCancel: () => void;
};

export default function AddGameSheet({ game, onAdded, onCancel }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<number>(1);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>("backlog");
  const [loading, setLoading] = useState(false);

  function handleAdd() {
    setLoading(true);
    try {
      let gameId = gameExistsByIgdbId(game.igdbId);
      if (!gameId) gameId = insertGame(game);
      insertGameEntry(gameId, selectedPlatform, selectedStatus);
      onAdded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Game header */}
      <View style={styles.header}>
        {game.coverUrl ? (
          <Image
            source={{ uri: game.coverUrl }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {game.title}
          </Text>
          {game.releaseYear && (
            <Text style={styles.year}>{game.releaseYear}</Text>
          )}
        </View>
      </View>

      {/* Platform picker */}
      <Text style={styles.sectionLabel}>Platform</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {PLATFORMS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.chip,
              selectedPlatform === p.id && styles.chipActive,
            ]}
            onPress={() => setSelectedPlatform(p.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedPlatform === p.id && styles.chipTextActive,
              ]}
            >
              {p.shortName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status picker */}
      <Text style={styles.sectionLabel}>Status</Text>
      <View style={styles.chips}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[
              styles.chip,
              selectedStatus === s.value && styles.chipActive,
            ]}
            onPress={() => setSelectedStatus(s.value)}
          >
            <Text
              style={[
                styles.chipText,
                selectedStatus === s.value && styles.chipTextActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.addText}>Add to Backlog</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: spacing.md,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cover: {
    width: 60,
    height: 80,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    width: 60,
    height: 80,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  year: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
  },
  cancelText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  addBtn: {
    flex: 2,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  addText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
});
