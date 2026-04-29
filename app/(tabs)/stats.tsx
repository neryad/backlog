// import React, { useCallback, useMemo, useRef, useState } from "react";
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
// import { useFocusEffect } from "expo-router";
// import { getMonthlyRecap, getStats, BacklogStats, MonthlyRecap } from "../../src/db/queries/stats";
// import { colors, spacing, radius } from "../../src/constants/theme";
// import { Ionicons } from "@expo/vector-icons";
// import { StatsShareCard } from "../../src/components/StatsShareCard";
// import { shareViewAsImage } from "../../src/utils/share";
// import { fontFamily } from "../../src/constants/typography";

// const STATUS_META: Record<
//   string,
//   {
//     label: string;
//     color: string;
//     icon: React.ComponentProps<typeof Ionicons>["name"];
//   }
// > = {
//   backlog: { label: "Backlog", color: colors.foregroundMuted, icon: "time-outline" },
//   playing: {
//     label: "Playing",
//     color: colors.primary,
//     icon: "game-controller-outline",
//   },
//   "playing-social": {
//     label: "Playing (Social)",
//     color: colors.statusPlayingSocial,
//     icon: "people-outline",
//   },
//   paused: {
//     label: "Paused",
//     color: colors.statusOnHold,
//     icon: "pause-circle-outline",
//   },
//   completed: {
//     label: "Completed",
//     color: colors.success,
//     icon: "checkmark-circle-outline",
//   },
//   dropped: {
//     label: "Dropped",
//     color: colors.danger,
//     icon: "close-circle-outline",
//   },
//   wishlist: { label: "Wishlist", color: colors.warning, icon: "star-outline" },
// };

// function StatCard({
//   label,
//   value,
//   sub,
// }: {
//   label: string;
//   value: string;
//   sub?: string;
// }) {
//   return (
//     <View style={styles.statCard}>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//       {sub && <Text style={styles.statSub}>{sub}</Text>}
//     </View>
//   );
// }

// function ProgressBar({ value, color }: { value: number; color: string }) {
//   return (
//     <View style={styles.progressTrack}>
//       <View
//         style={[
//           styles.progressFill,
//           { width: `${value}%`, backgroundColor: color },
//         ]}
//       />
//     </View>
//   );
// }

// export default function StatsScreen() {
//   const [stats, setStats] = useState<BacklogStats | null>(null);
//   const [monthlyRecap, setMonthlyRecap] = useState<MonthlyRecap | null>(null);
//   const shareCardRef = useRef<View>(null);
//   const [isSharing, setIsSharing] = useState(false);
//   const [showSharePreview, setShowSharePreview] = useState(false);

//   useFocusEffect(
//     useCallback(() => {
//       setStats(getStats());
//       setMonthlyRecap(getMonthlyRecap());
//     }, []),
//   );

//   const handleShareStats = useCallback(async () => {
//     if (!shareCardRef.current || isSharing) return;

//     try {
//       setIsSharing(true);
//       await shareViewAsImage(shareCardRef, {
//         dialogTitle: "Share your stats card",
//         width: 1080,
//         height: 1920,
//       });
//     } finally {
//       setIsSharing(false);
//     }
//   }, [isSharing]);

//   const shareStatsSection = useMemo(() => {
//     if (!stats) return null;

//     return (
//       <View style={styles.shareSection}>
//         <View style={styles.shareHeaderRow}>
//           <View style={styles.shareHeaderText}>
//             <Text style={styles.shareSectionTitle}>Share Stats</Text>
//             <Text style={styles.shareSectionSub}>
//               Share your overall progress and this month's momentum
//             </Text>
//           </View>
//           <TouchableOpacity
//             style={styles.shareToggleBtn}
//             onPress={() => setShowSharePreview((prev) => !prev)}
//             activeOpacity={0.75}
//           >
//             <Ionicons
//               name={showSharePreview ? "chevron-up" : "chevron-down"}
//               size={16}
//               color={colors.foreground}
//             />
//             <Text style={styles.shareToggleText}>
//               {showSharePreview ? "Hide" : "Preview"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View
//           style={[
//             styles.sharePreviewFrame,
//             !showSharePreview && styles.sharePreviewHidden,
//           ]}
//         >
//           <View ref={shareCardRef} collapsable={false}>
//             <StatsShareCard stats={stats} monthlyRecap={monthlyRecap} />
//           </View>
//         </View>

//         {!showSharePreview && (
//           <Text style={styles.shareHintText}>
//             Open Preview to review the card
//           </Text>
//         )}

//         <TouchableOpacity
//           style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
//           onPress={handleShareStats}
//           disabled={isSharing}
//         >
//           <Text style={styles.shareBtnText}>
//             {isSharing ? "Generating..." : "Share Stats Card"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }, [handleShareStats, isSharing, monthlyRecap, showSharePreview, stats]);

//   if (!stats) return null;

//   const totalForBar = Math.max(stats.total, 1);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       {shareStatsSection}

//       {/* Top stats */}
//       <View style={styles.topCards}>
//         <StatCard label="Total Games" value={String(stats.total)} />
//         <StatCard
//           label="Hours Played"
//           value={
//             stats.totalHours > 0 ? `${Math.round(stats.totalHours)}h` : "—"
//           }
//         />
//         <StatCard
//           label="Avg Rating"
//           value={stats.avgRating ? `${stats.avgRating}/10` : "—"}
//         />
//         <StatCard
//           label="Completion"
//           value={`${stats.completionRate}%`}
//           sub={`${stats.byStatus["completed"] ?? 0} completed`}
//         />
//       </View>

//       {/* By status */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Breakdown</Text>
//         {Object.entries(STATUS_META).map(([key, meta]) => {
//           const count = stats.byStatus[key] ?? 0;
//           const percent = Math.round((count / totalForBar) * 100);
//           if (count === 0) return null;

//           return (
//             <View key={key} style={styles.statusRow}>
//               <View style={styles.statusHeader}>
//                 <Ionicons name={meta.icon} size={16} color={meta.color} />
//                 <Text style={styles.statusLabel}>{meta.label}</Text>
//                 <Text style={[styles.statusCount, { color: meta.color }]}>
//                   {count}
//                 </Text>
//                 <Text style={styles.statusPercent}>{percent}%</Text>
//               </View>
//               <ProgressBar value={percent} color={meta.color} />
//             </View>
//           );
//         })}
//       </View>

//       {/* Recently added */}
//       {stats.recentlyAdded.length > 0 && (
//         <View style={styles.section}>
//           <Text style={styles.sectionLabel}>Recently Added</Text>
//           {stats.recentlyAdded.map((g, i) => (
//             <View key={i} style={styles.recentRow}>
//               <Text style={styles.recentTitle} numberOfLines={1}>
//                 {g.title}
//               </Text>
//               <Text style={styles.recentDate}>
//                 {new Date(Number(g.createdAt)).toLocaleDateString()}
//               </Text>
//             </View>
//           ))}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   content: {
//     padding: spacing.md,
//     paddingBottom: spacing.xl * 2,
//   },
//   topCards: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: spacing.sm,
//     marginBottom: spacing.md,
//   },
//   shareSection: {
//     marginBottom: spacing.md,
//   },
//   shareHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: spacing.sm,
//     gap: spacing.sm,
//   },
//   shareHeaderText: {
//     flex: 1,
//     flexShrink: 1,
//   },
//   shareToggleBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.xs,
//     paddingHorizontal: spacing.sm + 2,
//     paddingVertical: spacing.xs + 2,
//     borderRadius: radius.lg,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   shareToggleText: {
//     color: colors.foreground,
//     fontSize: 12,
//     fontFamily: fontFamily.sansSemibold,
//   },
//   shareSectionTitle: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//     fontFamily: fontFamily.sansSemibold,
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//     marginBottom: spacing.xs,
//   },
//   shareSectionSub: {
//     color: colors.foregroundMuted,
//     fontSize: 13,
//     lineHeight: 18,
//   },
//   statCard: {
//     flex: 1,
//     minWidth: "45%",
//     backgroundColor: colors.card,
//     borderRadius: radius.md,
//     borderWidth: 1,
//     borderColor: colors.border,
//     padding: spacing.md,
//     alignItems: "center",
//     gap: spacing.xs,
//   },
//   statValue: {
//     color: colors.foreground,
//     fontSize: 28,
//     fontFamily: fontFamily.monoBold,
//     fontVariant: ["tabular-nums"],
//   },
//   statLabel: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//   },
//   statSub: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//   },
//   section: {
//     backgroundColor: colors.card,
//     borderRadius: radius.md,
//     borderWidth: 1,
//     borderColor: colors.border,
//     padding: spacing.md,
//     marginBottom: spacing.md,
//   },
//   sharePreviewFrame: {
//     borderRadius: radius.md,
//     padding: spacing.sm,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: spacing.md,
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
//   shareHintText: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//     marginTop: spacing.sm,
//   },
//   sharePreviewHidden: {
//     position: "absolute",
//     opacity: 0,
//     zIndex: -1,
//     pointerEvents: "none",
//   },
//   sectionLabel: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//     fontFamily: fontFamily.sansSemibold,
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//     marginBottom: spacing.md,
//   },
//   statusRow: {
//     marginBottom: spacing.md,
//   },
//   statusHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.sm,
//     marginBottom: spacing.xs,
//   },

//   statusLabel: {
//     flex: 1,
//     color: colors.foreground,
//     fontSize: 14,
//     fontFamily: fontFamily.sansMedium,
//   },
//   statusCount: {
//     fontSize: 14,
//     fontFamily: fontFamily.monoBold,
//     fontVariant: ["tabular-nums"],
//   },
//   statusPercent: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//     fontFamily: fontFamily.mono,
//     fontVariant: ["tabular-nums"],
//     width: 35,
//     textAlign: "right",
//   },
//   progressTrack: {
//     height: 6,
//     backgroundColor: colors.cardElevated,
//     borderRadius: 3,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: 6,
//     borderRadius: 3,
//   },
//   recentRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: spacing.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   recentTitle: {
//     flex: 1,
//     color: colors.foreground,
//     fontSize: 14,
//     fontFamily: fontFamily.sansMedium,
//   },
//   recentDate: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//   },
// });
// import React, { useCallback, useMemo, useRef, useState } from "react";
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
// import { useFocusEffect } from "expo-router";
// import { getMonthlyRecap, getStats, BacklogStats, MonthlyRecap } from "../../src/db/queries/stats";
// import { colors, spacing, radius } from "../../src/constants/theme";
// import { Ionicons } from "@expo/vector-icons";
// import { StatsShareCard } from "../../src/components/StatsShareCard";
// import { shareViewAsImage } from "../../src/utils/share";
// import { fontFamily } from "../../src/constants/typography";

// const STATUS_META: Record<
//   string,
//   {
//     label: string;
//     color: string;
//     icon: React.ComponentProps<typeof Ionicons>["name"];
//   }
// > = {
//   backlog: { label: "Backlog", color: colors.foregroundMuted, icon: "time-outline" },
//   playing: {
//     label: "Playing",
//     color: colors.primary,
//     icon: "game-controller-outline",
//   },
//   "playing-social": {
//     label: "Playing (Social)",
//     color: colors.statusPlayingSocial,
//     icon: "people-outline",
//   },
//   paused: {
//     label: "Paused",
//     color: colors.statusOnHold,
//     icon: "pause-circle-outline",
//   },
//   completed: {
//     label: "Completed",
//     color: colors.success,
//     icon: "checkmark-circle-outline",
//   },
//   dropped: {
//     label: "Dropped",
//     color: colors.danger,
//     icon: "close-circle-outline",
//   },
//   wishlist: { label: "Wishlist", color: colors.warning, icon: "star-outline" },
// };

// function StatCard({
//   label,
//   value,
//   sub,
// }: {
//   label: string;
//   value: string;
//   sub?: string;
// }) {
//   return (
//     <View style={styles.statCard}>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//       {sub && <Text style={styles.statSub}>{sub}</Text>}
//     </View>
//   );
// }

// function ProgressBar({ value, color }: { value: number; color: string }) {
//   return (
//     <View style={styles.progressTrack}>
//       <View
//         style={[
//           styles.progressFill,
//           { width: `${value}%`, backgroundColor: color },
//         ]}
//       />
//     </View>
//   );
// }

// export default function StatsScreen() {
//   const [stats, setStats] = useState<BacklogStats | null>(null);
//   const [monthlyRecap, setMonthlyRecap] = useState<MonthlyRecap | null>(null);
//   const shareCardRef = useRef<View>(null);
//   const [isSharing, setIsSharing] = useState(false);
//   const [showSharePreview, setShowSharePreview] = useState(false);

//   useFocusEffect(
//     useCallback(() => {
//       setStats(getStats());
//       setMonthlyRecap(getMonthlyRecap());
//     }, []),
//   );

//   const handleShareStats = useCallback(async () => {
//     if (!shareCardRef.current || isSharing) return;

//     try {
//       setIsSharing(true);
//       await shareViewAsImage(shareCardRef, {
//         dialogTitle: "Share your stats card",
//         width: 1080,
//         height: 1920,
//       });
//     } finally {
//       setIsSharing(false);
//     }
//   }, [isSharing]);

//   const shareStatsSection = useMemo(() => {
//     if (!stats) return null;

//     return (
//       <View style={styles.shareSection}>
//         <View style={styles.shareHeaderRow}>
//           <View style={styles.shareHeaderText}>
//             <Text style={styles.shareSectionTitle}>Share Stats</Text>
//             <Text style={styles.shareSectionSub}>
//               Share your overall progress and this month's momentum
//             </Text>
//           </View>
//           <TouchableOpacity
//             style={styles.shareToggleBtn}
//             onPress={() => setShowSharePreview((prev) => !prev)}
//             activeOpacity={0.75}
//           >
//             <Ionicons
//               name={showSharePreview ? "chevron-up" : "chevron-down"}
//               size={16}
//               color={colors.foreground}
//             />
//             <Text style={styles.shareToggleText}>
//               {showSharePreview ? "Hide" : "Preview"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View
//           style={[
//             styles.sharePreviewFrame,
//             !showSharePreview && styles.sharePreviewHidden,
//           ]}
//         >
//           <View ref={shareCardRef} collapsable={false}>
//             <StatsShareCard stats={stats} monthlyRecap={monthlyRecap} />
//           </View>
//         </View>

//         {!showSharePreview && (
//           <Text style={styles.shareHintText}>
//             Open Preview to review the card
//           </Text>
//         )}

//         <TouchableOpacity
//           style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
//           onPress={handleShareStats}
//           disabled={isSharing}
//         >
//           <Text style={styles.shareBtnText}>
//             {isSharing ? "Generating..." : "Share Stats Card"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }, [handleShareStats, isSharing, monthlyRecap, showSharePreview, stats]);

//   if (!stats) return null;

//   const totalForBar = Math.max(stats.total, 1);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       {shareStatsSection}

//       {/* Top stats */}
//       <View style={styles.topCards}>
//         <StatCard label="Total Games" value={String(stats.total)} />
//         <StatCard
//           label="Hours Played"
//           value={
//             stats.totalHours > 0 ? `${Math.round(stats.totalHours)}h` : "—"
//           }
//         />
//         <StatCard
//           label="Avg Rating"
//           value={stats.avgRating ? `${stats.avgRating}/10` : "—"}
//         />
//         <StatCard
//           label="Completion"
//           value={`${stats.completionRate}%`}
//           sub={`${stats.byStatus["completed"] ?? 0} completed`}
//         />
//       </View>

//       {/* By status */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Breakdown</Text>
//         {Object.entries(STATUS_META).map(([key, meta]) => {
//           const count = stats.byStatus[key] ?? 0;
//           const percent = Math.round((count / totalForBar) * 100);
//           if (count === 0) return null;

//           return (
//             <View key={key} style={styles.statusRow}>
//               <View style={styles.statusHeader}>
//                 <Ionicons name={meta.icon} size={16} color={meta.color} />
//                 <Text style={styles.statusLabel}>{meta.label}</Text>
//                 <Text style={[styles.statusCount, { color: meta.color }]}>
//                   {count}
//                 </Text>
//                 <Text style={styles.statusPercent}>{percent}%</Text>
//               </View>
//               <ProgressBar value={percent} color={meta.color} />
//             </View>
//           );
//         })}
//       </View>

//       {/* Recently added */}
//       {stats.recentlyAdded.length > 0 && (
//         <View style={styles.section}>
//           <Text style={styles.sectionLabel}>Recently Added</Text>
//           {stats.recentlyAdded.map((g, i) => (
//             <View key={i} style={styles.recentRow}>
//               <Text style={styles.recentTitle} numberOfLines={1}>
//                 {g.title}
//               </Text>
//               <Text style={styles.recentDate}>
//                 {new Date(Number(g.createdAt)).toLocaleDateString()}
//               </Text>
//             </View>
//           ))}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   content: {
//     padding: spacing.md,
//     paddingBottom: spacing.xl * 2,
//   },
//   topCards: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: spacing.sm,
//     marginBottom: spacing.md,
//   },
//   shareSection: {
//     marginBottom: spacing.md,
//   },
//   shareHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: spacing.sm,
//     gap: spacing.sm,
//   },
//   shareHeaderText: {
//     flex: 1,
//     flexShrink: 1,
//   },
//   shareToggleBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.xs,
//     paddingHorizontal: spacing.sm + 2,
//     paddingVertical: spacing.xs + 2,
//     borderRadius: radius.lg,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   shareToggleText: {
//     color: colors.foreground,
//     fontSize: 12,
//     fontFamily: fontFamily.sansSemibold,
//   },
//   shareSectionTitle: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//     fontFamily: fontFamily.sansSemibold,
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//     marginBottom: spacing.xs,
//   },
//   shareSectionSub: {
//     color: colors.foregroundMuted,
//     fontSize: 13,
//     lineHeight: 18,
//   },
//   statCard: {
//     flex: 1,
//     minWidth: "45%",
//     backgroundColor: colors.card,
//     borderRadius: radius.md,
//     borderWidth: 1,
//     borderColor: colors.border,
//     padding: spacing.md,
//     alignItems: "center",
//     gap: spacing.xs,
//   },
//   statValue: {
//     color: colors.foreground,
//     fontSize: 28,
//     fontFamily: fontFamily.monoBold,
//     fontVariant: ["tabular-nums"],
//   },
//   statLabel: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//   },
//   statSub: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//   },
//   section: {
//     backgroundColor: colors.card,
//     borderRadius: radius.md,
//     borderWidth: 1,
//     borderColor: colors.border,
//     padding: spacing.md,
//     marginBottom: spacing.md,
//   },
//   sharePreviewFrame: {
//     borderRadius: radius.md,
//     padding: spacing.sm,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: spacing.md,
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
//   shareHintText: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//     marginTop: spacing.sm,
//   },
//   sharePreviewHidden: {
//     position: "absolute",
//     opacity: 0,
//     zIndex: -1,
//     pointerEvents: "none",
//   },
//   sectionLabel: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//     fontFamily: fontFamily.sansSemibold,
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//     marginBottom: spacing.md,
//   },
//   statusRow: {
//     marginBottom: spacing.md,
//   },
//   statusHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.sm,
//     marginBottom: spacing.xs,
//   },

//   statusLabel: {
//     flex: 1,
//     color: colors.foreground,
//     fontSize: 14,
//     fontFamily: fontFamily.sansMedium,
//   },
//   statusCount: {
//     fontSize: 14,
//     fontFamily: fontFamily.monoBold,
//     fontVariant: ["tabular-nums"],
//   },
//   statusPercent: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//     fontFamily: fontFamily.mono,
//     fontVariant: ["tabular-nums"],
//     width: 35,
//     textAlign: "right",
//   },
//   progressTrack: {
//     height: 6,
//     backgroundColor: colors.cardElevated,
//     borderRadius: 3,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: 6,
//     borderRadius: 3,
//   },
//   recentRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: spacing.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   recentTitle: {
//     flex: 1,
//     color: colors.foreground,
//     fontSize: 14,
//     fontFamily: fontFamily.sansMedium,
//   },
//   recentDate: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//   },
// });
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import {
  getMonthlyRecap,
  getStats,
  BacklogStats,
  MonthlyRecap,
} from "../../src/db/queries/stats";
import { colors, spacing, radius } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatsShareCard } from "../../src/components/StatsShareCard";
import { shareViewAsImage } from "../../src/utils/share";
import { fontFamily } from "../../src/constants/typography";

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: React.ComponentProps<typeof Ionicons>["name"] }
> = {
  backlog: { label: "Backlog", color: colors.foregroundMuted, icon: "time-outline" },
  playing: { label: "Playing", color: colors.primary, icon: "game-controller-outline" },
  "playing-social": { label: "Playing (Social)", color: colors.statusPlayingSocial, icon: "people-outline" },
  paused: { label: "Paused", color: colors.statusOnHold, icon: "pause-circle-outline" },
  completed: { label: "Completed", color: colors.success, icon: "checkmark-circle-outline" },
  dropped: { label: "Dropped", color: colors.danger, icon: "close-circle-outline" },
  wishlist: { label: "Wishlist", color: colors.warning, icon: "star-outline" },
};

function StatCard({ label, value, highlight }: any) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value, color }: any) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${value}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export default function StatsScreen() {
  const [stats, setStats] = useState<BacklogStats | null>(null);
  const [monthlyRecap, setMonthlyRecap] = useState<MonthlyRecap | null>(null);

  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setStats(getStats());
      setMonthlyRecap(getMonthlyRecap());
    }, []),
  );

  const handleShare = async () => {
    if (!shareCardRef.current || isSharing) return;
    try {
      setIsSharing(true);
      await shareViewAsImage(shareCardRef, {
        dialogTitle: "Share your stats",
        width: 1080,
        height: 1920,
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!stats) return null;

  const total = Math.max(stats.total, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* 🔥 TOP STATS */}
      <View style={styles.topCards}>
        <StatCard label="Total Games" value={stats.total} highlight />
        <StatCard label="Hours" value={`${Math.round(stats.totalHours)}h`} />
        <StatCard label="Avg Rating" value={stats.avgRating || "—"} />
        <StatCard label="Completion" value={`${stats.completionRate}%`} />
      </View>

      {/* 📊 BREAKDOWN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>

        {Object.entries(STATUS_META).map(([key, meta]) => {
          const count = stats.byStatus[key] ?? 0;
          if (!count) return null;

          const percent = Math.round((count / total) * 100);

          return (
            <View key={key} style={styles.statusRow}>
              <View style={styles.statusHeader}>
                <Ionicons name={meta.icon} size={16} color={meta.color} />
                <Text style={styles.statusLabel}>{meta.label}</Text>
                <Text style={[styles.statusCount, { color: meta.color }]}>
                  {count}
                </Text>
                <Text style={styles.statusPercent}>{percent}%</Text>
              </View>
              <ProgressBar value={percent} color={meta.color} />
            </View>
          );
        })}
      </View>

      {/* 🕒 RECENT */}
      {stats.recentlyAdded.slice(0, 3).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
          {stats.recentlyAdded.slice(0, 3).map((g, i) => (
            <View key={i} style={styles.recentRow}>
              <Text style={styles.recentTitle} numberOfLines={1}>
                {g.title}
              </Text>
              <Text style={styles.recentDate}>
                {new Date(Number(g.createdAt)).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 📤 SHARE (AL FINAL) */}
      <View style={styles.shareSection}>
        <Text style={styles.sectionTitle}>Share Your Stats</Text>

        <View style={styles.sharePreview}>
          <View ref={shareCardRef} collapsable={false}>
            <StatsShareCard stats={stats} monthlyRecap={monthlyRecap} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          disabled={isSharing}
        >
          <Text style={styles.shareBtnText}>
            {isSharing ? "Generating..." : "Share Stats"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },

  topCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },

  statCardHighlight: {
    backgroundColor: colors.cardElevated,
  },

  statValue: {
    fontSize: 32,
    color: colors.foreground,
    fontFamily: fontFamily.monoBold,
  },

  statLabel: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },

  section: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontFamily: fontFamily.sansSemibold,
    marginBottom: spacing.md,
  },

  statusRow: {
    marginBottom: spacing.lg,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  statusLabel: {
    flex: 1,
    color: colors.foreground,
  },

  statusCount: {
    fontFamily: fontFamily.monoBold,
  },

  statusPercent: {
    color: colors.foregroundMuted,
    fontSize: 12,
    width: 40,
    textAlign: "right",
  },

  progressTrack: {
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 4,
  },

  progressFill: {
    height: 8,
    borderRadius: 4,
  },

  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },

  recentTitle: {
    flex: 1,
    color: colors.foreground,
  },

  recentDate: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },

  shareSection: {
    marginTop: spacing.lg,
  },

  sharePreview: {
    marginBottom: spacing.md,
  },

  shareBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },

  shareBtnText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansBold,
  },
});