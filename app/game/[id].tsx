// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Switch,
// } from "react-native";
// import { Image } from "expo-image";
// import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
// import { useGameDetail } from "../../src/features/game-detail/useGameDetail";
// import { GameStatus } from "../../src/types/game";
// import { colors, spacing, radius } from "../../src/constants/theme";
// import { PLATFORMS } from "../../src/constants/platforms";
// import { GameShareCard } from "../../src/components/GameShareCard";
// import { shareViewAsImage } from "../../src/utils/share";
// import { fontFamily } from "../../src/constants/typography";

// const STATUSES: { value: GameStatus; label: string; color: string }[] = [
//   { value: "backlog", label: "Backlog", color: colors.foregroundMuted },
//   { value: "playing", label: "Playing", color: colors.primary },
//   { value: "playing-social", label: "Playing (Social)", color: colors.statusPlayingSocial },
//   { value: "paused", label: "Paused", color: colors.statusOnHold },
//   { value: "completed", label: "Completed", color: colors.success },
//   { value: "dropped", label: "Dropped", color: colors.danger },
//   { value: "wishlist", label: "Wishlist", color: colors.warning },
// ];

// export default function GameDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const { entry, setStatus, setRating, setNotes, setHours, setIsPublic, remove } =
//     useGameDetail(id);
//   const navigation = useNavigation();
//   const shareCardRef = useRef<View>(null);
//   const [editingNotes, setEditingNotes] = useState(false);
//   const [notesValue, setNotesValue] = useState(entry?.notes ?? "");
//   const [hoursValue, setHoursValue] = useState(String(entry?.hoursPlayed ?? 0));
//   const [isSharing, setIsSharing] = useState(false);

//   const game = entry?.game;
//   const platform = entry ? PLATFORMS.find((p) => p.id === entry.platformId) : undefined;

//   // useEffect(() => {
//   //   if (game?.title) {
//   //     navigation.setOptions({ title: game.title });
//   //   }
//   // }, [game?.title, navigation]);

//   // 👇 SOLO TE PONGO LO QUE CAMBIA CLAVE (no basura innecesaria)

// useEffect(() => {
//   if (entry) {
//     setNotesValue(entry.notes ?? "");
//     setHoursValue(String(entry.hoursPlayed ?? 0));
//   }
// }, [entry]);

//   if (!entry) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator color={colors.primary} />
//       </View>
//     );
//   }

//   function handleDelete() {
//     Alert.alert("Remove Game", `Remove "${game?.title}" from your backlog?`, [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Remove",
//         style: "destructive",
//         onPress: () => {
//           remove();
//           router.back();
//         },
//       },
//     ]);
//   }

//   function handleSaveNotes() {
//     setNotes(notesValue);
//     setEditingNotes(false);
//   }

//   function handleSaveHours() {
//     const parsed = parseFloat(hoursValue);
//     if (!isNaN(parsed) && parsed >= 0 && parsed <= 9999) {
//       setHours(parsed);
//     } else {
//       setHoursValue(String(entry?.hoursPlayed ?? 0));
//     }
//   }

//   async function handleShareCard() {
//     if (!shareCardRef.current || isSharing) return;

//     try {
//       setIsSharing(true);
//       await shareViewAsImage(shareCardRef, {
//         dialogTitle: "Share your game card",
//         width: 1080,
//         height: 1920,
//       });
//     } finally {
//       setIsSharing(false);
//     }
//   }

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       {/* Hero */}
//       <View style={styles.hero}>
//         {game?.coverUrl ? (
//           <Image
//             source={{ uri: game.coverUrl }}
//             style={styles.cover}
//             contentFit="cover"
//           />
//         ) : (
//           <View style={styles.coverPlaceholder} />
//         )}
//         <View style={styles.heroInfo}>
//           <Text style={styles.title}>{game?.title}</Text>
//           {game?.releaseYear && (
//             <Text style={styles.meta}>{game.releaseYear}</Text>
//           )}
//           {platform && <Text style={styles.meta}>{platform.name}</Text>}
//         </View>
//       </View>

//       {/* Summary */}
//       {game?.summary && (
//         <View style={styles.section}>
//           <Text style={styles.sectionLabel}>About</Text>
//           <Text style={styles.summary}>{game.summary}</Text>
//         </View>
//       )}

//       {/* Status */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Status</Text>
//         <View style={styles.chips}>
//           {STATUSES.map((s) => (
//             <TouchableOpacity
//               key={s.value}
//               style={[
//                 styles.chip,
//                 entry.status === s.value && {
//                   backgroundColor: s.color,
//                   borderColor: s.color,
//                 },
//               ]}
//               onPress={() => setStatus(s.value)}
//             >
//               <Text
//                 style={[
//                   styles.chipText,
//                   entry.status === s.value && styles.chipTextActive,
//                 ]}
//               >
//                 {s.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Rating */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Your Rating</Text>
//         <View style={styles.ratingRow}>
//           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
//             <TouchableOpacity
//               key={n}
//               style={[
//                 styles.ratingBtn,
//                 entry.personalRating === n && styles.ratingBtnActive,
//               ]}
//               onPress={() => setRating(entry.personalRating === n ? null : n)}
//             >
//               <Text
//                 style={[
//                   styles.ratingText,
//                   entry.personalRating === n && styles.ratingTextActive,
//                 ]}
//               >
//                 {n}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Hours */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Hours Played</Text>
//         <View style={styles.hoursRow}>
//           <TextInput
//             style={styles.hoursInput}
//             value={hoursValue}
//             onChangeText={setHoursValue}
//             onBlur={handleSaveHours}
//             keyboardType="decimal-pad"
//             placeholderTextColor={colors.foregroundMuted}
//           />
//           <Text style={styles.hoursLabel}>hrs</Text>
//         </View>
//       </View>

//       {/* Notes */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionLabel}>Notes</Text>
//           {!editingNotes && (
//             <TouchableOpacity onPress={() => setEditingNotes(true)}>
//               <Text style={styles.editBtn}>Edit</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//         {editingNotes ? (
//           <>
//             <TextInput
//               style={styles.notesInput}
//               value={notesValue}
//               onChangeText={setNotesValue}
//               multiline
//               autoFocus
//               placeholderTextColor={colors.foregroundMuted}
//               placeholder="Add your thoughts..."
//             />
//             <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotes}>
//               <Text style={styles.saveBtnText}>Save Notes</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <TouchableOpacity onPress={() => setEditingNotes(true)}>
//             <Text style={entry.notes ? styles.notes : styles.notesEmpty}>
//               {entry.notes || "Tap to add notes..."}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Visibility */}
//       <View style={styles.section}>
//         <View style={styles.visibilityRow}>
//           <View>
//             <Text style={styles.sectionLabel}>Visible to friends</Text>
//             <Text style={styles.visibilityHint}>
//               {entry.isPublic ? "Appears on your public profile" : "Hidden from your profile"}
//             </Text>
//           </View>
//           <Switch
//             value={entry.isPublic}
//             onValueChange={setIsPublic}
//             trackColor={{ false: colors.cardElevated, true: colors.primary }}
//           />
//         </View>
//       </View>

//       {/* Share Card */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Share Game</Text>
//         <View style={styles.sharePreviewFrame}>
//           <View ref={shareCardRef} collapsable={false}>
//             <GameShareCard entry={entry} platformName={platform?.name} />
//           </View>
//         </View>
//         <TouchableOpacity
//           style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
//           onPress={handleShareCard}
//           disabled={isSharing}
//         >
//           <Text style={styles.shareBtnText}>
//             {isSharing ? "Generating..." : "Share Game Card"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Delete */}
//       <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
//         <Text style={styles.deleteBtnText}>Remove from Backlog</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   content: {
//     paddingBottom: spacing.xl * 2,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: colors.background,
//   },
//   // hero: {
//   //   flexDirection: "row",
//   //   gap: spacing.md,
//   //   padding: spacing.md,
//   //   backgroundColor: colors.card,
//   //   borderBottomWidth: 1,
//   //   borderBottomColor: colors.border,
//   // },
//   hero: {
//   flexDirection: "row",
//   gap: spacing.md,
//   padding: spacing.md,
// },

// cover: {
//   width: 100,
//   height: 140,
//   borderRadius: radius.md,
// },

// heroInfo: {
//   flex: 1,
//   justifyContent: "center",
//   gap: spacing.xs,
// },
//   // cover: {
//   //   width: 90,
//   //   height: 120,
//   //   borderRadius: radius.sm,
//   // },
//   coverPlaceholder: {
//     width: 90,
//     height: 120,
//     borderRadius: radius.sm,
//     backgroundColor: colors.cardElevated,
//   },
//   // heroInfo: {
//   //   flex: 1,
//   //   justifyContent: "center",
//   //   gap: spacing.xs,
//   // },
//   title: {
//     color: colors.foreground,
//     fontSize: 20,
//     fontFamily: fontFamily.displayBold,
//     lineHeight: 26,
//   },
//   meta: {
//     color: colors.foregroundMuted,
//     fontSize: 13,
//   },
//   // section: {
//   //   padding: spacing.md,
//   //   borderBottomWidth: 1,
//   //   borderBottomColor: colors.border,
//   // },
//   section: {
//   marginHorizontal: spacing.md,
//   marginBottom: spacing.md,
//   padding: spacing.md,
//   backgroundColor: colors.card,
//   borderRadius: radius.md,
//   borderWidth: 1,
//   borderColor: colors.border,
// },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: spacing.sm,
//   },
//   sectionLabel: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//     fontFamily: fontFamily.sansSemibold,
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//     marginBottom: spacing.sm,
//   },
//   summary: {
//     color: colors.foreground,
//     fontSize: 14,
//     lineHeight: 21,
//   },
//   chip: {
//   paddingHorizontal: spacing.md,
//   paddingVertical: spacing.xs + 2,
//   borderRadius: radius.lg,
//   backgroundColor: colors.cardElevated,
//   borderWidth: 1,
//   borderColor: colors.border,
// },

// chipActive: {
//   backgroundColor: colors.primary + "22",
//   borderColor: colors.primary,
// },
//   chips: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: spacing.sm,
//   },
//   // chip: {
//   //   paddingHorizontal: spacing.md,
//   //   paddingVertical: spacing.xs + 2,
//   //   borderRadius: radius.lg,
//   //   backgroundColor: colors.cardElevated,
//   //   borderWidth: 1,
//   //   borderColor: colors.border,
//   // },
//   chipText: {
//     color: colors.foregroundMuted,
//     fontSize: 13,
//     fontFamily: fontFamily.sansMedium,
//   },
//   chipTextActive: {
//     color: colors.foreground,
//   },
//   ratingRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: spacing.sm,
//   },
//   ratingBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: radius.sm,
//     backgroundColor: colors.cardElevated,
//     borderWidth: 1,
//     borderColor: colors.border,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   ratingBtnActive: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   ratingText: {
//     color: colors.foregroundMuted,
//     fontSize: 13,
//     fontFamily: fontFamily.mono,
//     fontVariant: ["tabular-nums"],
//   },
//   ratingTextActive: {
//     color: colors.foreground,
//   },
//   hoursRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.sm,
//   },
//   hoursInput: {
//     backgroundColor: colors.cardElevated,
//     borderRadius: radius.sm,
//     borderWidth: 1,
//     borderColor: colors.border,
//     color: colors.foreground,
//     fontSize: 16,
//     padding: spacing.sm,
//     width: 80,
//     textAlign: "center",
//   },
//   hoursLabel: {
//     color: colors.foregroundMuted,
//     fontSize: 14,
//   },
//   notesInput: {
//     backgroundColor: colors.cardElevated,
//     borderRadius: radius.sm,
//     borderWidth: 1,
//     borderColor: colors.border,
//     color: colors.foreground,
//     fontSize: 14,
//     padding: spacing.sm,
//     minHeight: 100,
//     textAlignVertical: "top",
//     lineHeight: 20,
//   },
//   notes: {
//     color: colors.foreground,
//     fontSize: 14,
//     lineHeight: 21,
//   },
//   notesEmpty: {
//     color: colors.foregroundMuted,
//     fontSize: 14,
//     fontStyle: "italic",
//   },
//   editBtn: {
//     color: colors.primary,
//     fontSize: 14,
//     fontFamily: fontFamily.sansSemibold,
//   },
//   saveBtn: {
//     marginTop: spacing.sm,
//     backgroundColor: colors.primary,
//     borderRadius: radius.md,
//     padding: spacing.sm,
//     alignItems: "center",
//   },
//   saveBtnText: {
//     color: colors.foreground,
//     fontFamily: fontFamily.sansBold,
//   },
//   sharePreviewFrame: {
//     marginTop: spacing.xs,
//     borderRadius: radius.md,
//     padding: spacing.sm,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   shareBtn: {
//     marginTop: spacing.md,
//     backgroundColor: colors.primary,
//     borderRadius: radius.md,
//     padding: spacing.sm + 2,
//     alignItems: "center",
//   },
//   shareBtnDisabled: {
//     opacity: 0.7,
//   },
//   shareBtnText: {
//     color: colors.foreground,
//     fontFamily: fontFamily.sansBold,
//     fontSize: 15,
//   },
//   deleteBtn: {
//     margin: spacing.md,
//     marginTop: spacing.lg,
//     padding: spacing.md,
//     borderRadius: radius.md,
//     borderWidth: 1,
//     borderColor: colors.danger,
//     alignItems: "center",
//   },
//   deleteBtnText: {
//     color: colors.danger,
//     fontFamily: fontFamily.sansSemibold,
//     fontSize: 15,
//   },
//   visibilityRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   visibilityHint: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//     marginTop: 2,
//   },
// });
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
  Switch,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGameDetail } from "../../src/features/game-detail/useGameDetail";
import { GameStatus } from "../../src/types/game";
import { colors, spacing, radius } from "../../src/constants/theme";
import { PLATFORMS } from "../../src/constants/platforms";
import { GameShareCard } from "../../src/components/GameShareCard";
import { shareViewAsImage } from "../../src/utils/share";
import { fontFamily } from "../../src/constants/typography";

const STATUSES: { value: GameStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: colors.foregroundMuted },
  { value: "playing", label: "Playing", color: colors.primary },
  { value: "playing-social", label: "Social", color: colors.statusPlayingSocial },
  { value: "paused", label: "Paused", color: colors.statusOnHold },
  { value: "completed", label: "Completed", color: colors.success },
  { value: "dropped", label: "Dropped", color: colors.danger },
  { value: "wishlist", label: "Wishlist", color: colors.warning },
];

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    entry,
    setStatus,
    setRating,
    setNotes,
    setHours,
    setIsPublic,
    remove,
  } = useGameDetail(id);

  const shareCardRef = useRef<View>(null);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [hoursValue, setHoursValue] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const game = entry?.game;
  const platform = entry
    ? PLATFORMS.find((p) => p.id === entry.platformId)
    : undefined;

  // Sync UI with entry
  useEffect(() => {
    if (entry) {
      setNotesValue(entry.notes ?? "");
      setHoursValue(String(entry.hoursPlayed ?? 0));
    }
  }, [entry]);

  if (!entry) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  function handleDelete() {
    Alert.alert("Remove Game", `Remove "${game?.title}"?`, [
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

  async function handleSaveHours() {
    const parsed = parseFloat(hoursValue);

    if (isNaN(parsed) || parsed < 0 || parsed > 9999) {
      setHoursValue(String(entry?.hoursPlayed ?? 0));
      return;
    }

    setSavingHours(true);
    setHours(parsed);

    setTimeout(() => setSavingHours(false), 600);
  }

  async function handleShareCard() {
    if (!shareCardRef.current || isSharing) return;

    try {
      setIsSharing(true);
      await shareViewAsImage(shareCardRef, {
        dialogTitle: "Share your game",
        width: 1080,
        height: 1920,
      });
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HERO */}
      <View style={styles.hero}>
        {game?.coverUrl ? (
          <Image source={{ uri: game.coverUrl }} style={styles.cover} />
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

      {/* SUMMARY */}
      {game?.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.summary}>{game.summary}</Text>
        </View>
      )}

      {/* STATUS */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Status</Text>

        <View style={styles.chips}>
          {STATUSES.map((s) => {
            const active = entry.status === s.value;

            return (
              <TouchableOpacity
                key={s.value}
                activeOpacity={0.8}
                style={[
                  styles.chip,
                  active && {
                    borderColor: s.color,
                    backgroundColor: s.color + "22",
                  },
                ]}
                onPress={() => setStatus(s.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && { color: s.color },
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* RATING */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your Rating</Text>

        <View style={styles.ratingRow}>
          {[1,2,3,4,5,6,7,8,9,10].map((n) => {
            const active = entry.personalRating === n;

            return (
              <TouchableOpacity
                key={n}
                activeOpacity={0.8}
                style={[
                  styles.ratingBtn,
                  active && styles.ratingBtnActive,
                ]}
                onPress={() =>
                  setRating(active ? null : n)
                }
              >
                <Text
                  style={[
                    styles.ratingText,
                    active && styles.ratingTextActive,
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* HOURS */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hours Played</Text>

        <View style={styles.hoursRow}>
          <TextInput
            style={styles.hoursInput}
            value={hoursValue}
            onChangeText={setHoursValue}
            onBlur={handleSaveHours}
            keyboardType="decimal-pad"
          />
          <Text style={styles.hoursLabel}>hrs</Text>

          {savingHours && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      </View>

      {/* NOTES */}
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
              placeholder="Add your thoughts..."
              placeholderTextColor={colors.foregroundMuted}
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

      {/* VISIBILITY */}
      <View style={styles.section}>
        <View style={styles.visibilityRow}>
          <View>
            <Text style={styles.sectionLabel}>Visible to friends</Text>
            <Text style={styles.visibilityHint}>
              {entry.isPublic
                ? "Visible on your profile"
                : "Hidden"}
            </Text>
          </View>

          <Switch
            value={entry.isPublic}
            onValueChange={setIsPublic}
          />
        </View>
      </View>

      {/* SHARE */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Share</Text>

        <View style={styles.sharePreview}>
          <View ref={shareCardRef} collapsable={false}>
            <GameShareCard entry={entry} platformName={platform?.name} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, isSharing && styles.disabled]}
          disabled={isSharing}
          onPress={handleShareCard}
        >
          <Text style={styles.primaryBtnText}>
            {isSharing ? "Generating..." : "Share Game"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DELETE */}
      <TouchableOpacity style={styles.dangerBtn} onPress={handleDelete}>
        <Text style={styles.dangerText}>Remove from Backlog</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl * 2 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  hero: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },

  cover: {
    width: 100,
    height: 140,
    borderRadius: radius.md,
  },

  coverPlaceholder: {
    width: 100,
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },

  heroInfo: { flex: 1, justifyContent: "center" },

  title: {
    fontSize: 20,
    color: colors.foreground,
    fontFamily: fontFamily.displayBold,
  },

  meta: { color: colors.foregroundMuted },

  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    color: colors.foregroundMuted,
    marginBottom: spacing.sm,
  },

  summary: { color: colors.foreground },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },

  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chipText: { color: colors.foregroundMuted },

  ratingRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },

  ratingBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cardElevated,
  },

  ratingBtnActive: {
    backgroundColor: colors.primary,
  },

  ratingText: { color: colors.foregroundMuted },

  ratingTextActive: { color: colors.foreground },

  hoursRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },

  hoursInput: {
    width: 80,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.foreground,
  },

  hoursLabel: { color: colors.foregroundMuted },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.foreground,
  },

  notes: { color: colors.foreground },
  notesEmpty: { color: colors.foregroundMuted, fontStyle: "italic" },

  editBtn: { color: colors.primary },

  saveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },

  saveBtnText: { color: colors.foreground },

  visibilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  visibilityHint: { color: colors.foregroundMuted },

  sharePreview: {
    marginBottom: spacing.sm,
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },

  primaryBtnText: { color: colors.foreground },

  dangerBtn: {
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },

  dangerText: { color: colors.danger },

  disabled: { opacity: 0.6 },
});