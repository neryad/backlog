import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useGameDetail } from "../../src/features/game-detail/useGameDetail";
import { GameStatus } from "../../src/types/game";
import { colors, spacing, radius } from "../../src/constants/theme";
import { PLATFORMS } from "../../src/constants/platforms";
import { GameShareCard } from "../../src/components/GameShareCard";
import { shareViewAsImage } from "../../src/utils/share";

const STATUSES: { value: GameStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: colors.textMuted },
  { value: "playing", label: "Playing", color: colors.primary },
  { value: "playing-social", label: "Playing (Social)", color: "#14b8a6" },
  { value: "completed", label: "Completed", color: colors.success },
  { value: "dropped", label: "Dropped", color: colors.danger },
  { value: "wishlist", label: "Wishlist", color: colors.warning },
];

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { entry, setStatus, setRating, setNotes, setHours, remove } =
    useGameDetail(id);
  const navigation = useNavigation();
  const shareCardRef = useRef<View>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(entry?.notes ?? "");
  const [hoursValue, setHoursValue] = useState(String(entry?.hoursPlayed ?? 0));
  const [isSharing, setIsSharing] = useState(false);

  if (!entry) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const game = entry.game;
  const platform = PLATFORMS.find((p) => p.id === entry.platformId);

  useEffect(() => {
    if (game?.title) {
      navigation.setOptions({ title: game.title }); // ← usa la variable, no el hook
    }
  }, [game?.title]);

  function handleDelete() {
    Alert.alert("Remove Game", `Remove "${game?.title}" from your backlog?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          remove();
          router.back();
        },
      },
    ]);
  }

  function handleSaveNotes() {
    setNotes(notesValue);
    setEditingNotes(false);
  }

  function handleSaveHours() {
    const parsed = parseFloat(hoursValue);
    if (!isNaN(parsed)) setHours(parsed);
  }

  async function handleShareCard() {
    if (!shareCardRef.current || isSharing) return;

    try {
      setIsSharing(true);
      await shareViewAsImage(shareCardRef, {
        dialogTitle: "Share your game card",
        width: 1080,
        height: 1920,
      });
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        {game?.coverUrl ? (
          <Image
            source={{ uri: game.coverUrl }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
        <View style={styles.heroInfo}>
          <Text style={styles.title}>{game?.title}</Text>
          {game?.releaseYear && (
            <Text style={styles.meta}>{game.releaseYear}</Text>
          )}
          {platform && <Text style={styles.meta}>{platform.name}</Text>}
        </View>
      </View>

      {/* Summary */}
      {game?.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.summary}>{game.summary}</Text>
        </View>
      )}

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.chips}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[
                styles.chip,
                entry.status === s.value && {
                  backgroundColor: s.color,
                  borderColor: s.color,
                },
              ]}
              onPress={() => setStatus(s.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  entry.status === s.value && styles.chipTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your Rating</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.ratingBtn,
                entry.personalRating === n && styles.ratingBtnActive,
              ]}
              onPress={() => setRating(entry.personalRating === n ? null : n)}
            >
              <Text
                style={[
                  styles.ratingText,
                  entry.personalRating === n && styles.ratingTextActive,
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hours Played</Text>
        <View style={styles.hoursRow}>
          <TextInput
            style={styles.hoursInput}
            value={hoursValue}
            onChangeText={setHoursValue}
            onBlur={handleSaveHours}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.hoursLabel}>hrs</Text>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Notes</Text>
          {!editingNotes && (
            <TouchableOpacity onPress={() => setEditingNotes(true)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        {editingNotes ? (
          <>
            <TextInput
              style={styles.notesInput}
              value={notesValue}
              onChangeText={setNotesValue}
              multiline
              autoFocus
              placeholderTextColor={colors.textMuted}
              placeholder="Add your thoughts..."
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotes}>
              <Text style={styles.saveBtnText}>Save Notes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={() => setEditingNotes(true)}>
            <Text style={entry.notes ? styles.notes : styles.notesEmpty}>
              {entry.notes || "Tap to add notes..."}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Share Card */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Share Game</Text>
        <View style={styles.sharePreviewFrame}>
          <View ref={shareCardRef} collapsable={false}>
            <GameShareCard entry={entry} platformName={platform?.name} />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
          onPress={handleShareCard}
          disabled={isSharing}
        >
          <Text style={styles.shareBtnText}>
            {isSharing ? "Generating..." : "Share Game Card"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>Remove from Backlog</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl * 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  hero: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cover: {
    width: 90,
    height: 120,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    width: 90,
    height: 120,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  summary: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
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
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  ratingBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  ratingTextActive: {
    color: colors.text,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  hoursInput: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    padding: spacing.sm,
    width: 80,
    textAlign: "center",
  },
  hoursLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  notesInput: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    padding: spacing.sm,
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  notes: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  notesEmpty: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: "italic",
  },
  editBtn: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  saveBtnText: {
    color: colors.text,
    fontWeight: "700",
  },
  sharePreviewFrame: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    alignItems: "center",
  },
  shareBtnDisabled: {
    opacity: 0.7,
  },
  shareBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  deleteBtn: {
    margin: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
  },
  deleteBtnText: {
    color: colors.danger,
    fontWeight: "600",
    fontSize: 15,
  },
});
