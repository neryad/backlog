// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   ListRenderItem,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useBacklog } from "../../src/features/backlog/useBacklog";
// import { useUIStore } from "../../src/store/ui.store";
// import SwipeableGameCard from "../../src/components/SwipeableGameCard";
// import FilterBar from "../../src/components/FilterBar";
// import ShareInlineCard from "../../src/components/ShareInlineCard";
// import { ShareModal } from "../../src/components/ShareModal";
// import { SortDropdown } from "../../src/components/SortDropdown";
// import { GameEntry } from "../../src/types/game";
// import { colors, radius, spacing, shadows } from "../../src/constants/theme";
// import { updateEntryStatus } from "../../src/db/queries/game";
// import NextToPlayModal from "../../src/features/next-to-play/NextToPlayModal";
// import { Ionicons } from "@expo/vector-icons";
// import AboutModal from "../../src/features/about/AboutModal";
// import { useNavigation } from "expo-router";
// import { fontFamily } from "../../src/constants/typography";

// const FAB_HEIGHT = 48;

// const SORT_OPTIONS = [
//   { value: "recently-added", label: "Recent" },
//   { value: "title-az", label: "A-Z" },
// ] as const;

// type FeedItem =
//   | { kind: "game"; entry: GameEntry }
//   | { kind: "share" };

// export default function BacklogScreen() {
//   const router = useRouter();
//   const {
//     activeFilter,
//     sortBy,
//     shareTemplate,
//     setFilter,
//     setSortBy,
//     setShareTemplate,
//   } = useUIStore();
//   const navigation = useNavigation();
//   const { bottom: safeBottom } = useSafeAreaInsets();
//   const { games: allGames, loading, reload } = useBacklog("all");

//   const [showAbout, setShowAbout] = useState(false);
//   const [showNextToPlay, setShowNextToPlay] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);

//   // Toast
//   const [toastMessage, setToastMessage] = useState("");
//   const toastOpacity = useRef(new Animated.Value(0)).current;
//   const toastTranslateY = useRef(new Animated.Value(8)).current;

//   const fabBottom = spacing.lg + safeBottom;
//   const listPaddingBottom = fabBottom + FAB_HEIGHT + spacing.lg;

//   useEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <TouchableOpacity
//           onPress={() => setShowAbout(true)}
//           style={{ marginRight: spacing.md }}
//         >
//           <Ionicons
//             name="information-circle-outline"
//             size={24}
//             color={colors.foregroundMuted}
//           />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   const showToast = useCallback(
//     (message: string) => {
//       setToastMessage(message);
//       Animated.sequence([
//         Animated.parallel([
//           Animated.timing(toastOpacity, {
//             toValue: 1,
//             duration: 180,
//             useNativeDriver: true,
//           }),
//           Animated.timing(toastTranslateY, {
//             toValue: 0,
//             duration: 180,
//             useNativeDriver: true,
//           }),
//         ]),
//         Animated.delay(1600),
//         Animated.parallel([
//           Animated.timing(toastOpacity, {
//             toValue: 0,
//             duration: 180,
//             useNativeDriver: true,
//           }),
//           Animated.timing(toastTranslateY, {
//             toValue: 8,
//             duration: 180,
//             useNativeDriver: true,
//           }),
//         ]),
//       ]).start();
//     },
//     [toastOpacity, toastTranslateY],
//   );

//   const filteredGames = useMemo(
//     () =>
//       activeFilter === "all"
//         ? allGames
//         : allGames.filter((g) => g.status === activeFilter),
//     [allGames, activeFilter],
//   );

//   const visibleGames = useMemo(() => {
//     return [...filteredGames].sort((a, b) => {
//       if (sortBy === "title-az") {
//         return (a.game?.title ?? "").localeCompare(b.game?.title ?? "");
//       }
//       return b.createdAt - a.createdAt;
//     });
//   }, [filteredGames, sortBy]);

//   const topShareGames = useMemo(() => {
//     return [...visibleGames]
//       .sort((a, b) => {
//         const ratingDiff = (b.personalRating ?? -1) - (a.personalRating ?? -1);
//         if (ratingDiff !== 0) return ratingDiff;
//         const hoursDiff = b.hoursPlayed - a.hoursPlayed;
//         if (hoursDiff !== 0) return hoursDiff;
//         return b.createdAt - a.createdAt;
//       })
//       .slice(0, 3);
//   }, [visibleGames]);

//   // Keep ref so renderItem doesn't depend on topShareGames
//   const topShareGamesRef = useRef(topShareGames);
//   topShareGamesRef.current = topShareGames;

//   const listData = useMemo<FeedItem[]>(() => {
//     const items: FeedItem[] = visibleGames.map((entry) => ({
//       kind: "game",
//       entry,
//     }));
//     if (topShareGames.length > 0 && items.length > 0) {
//       const insertAt = Math.min(3, items.length);
//       items.splice(insertAt, 0, { kind: "share" });
//     }
//     return items;
//   }, [visibleGames, topShareGames.length]);

//   const handlePress = useCallback(
//     (item: GameEntry) => {
//       router.push(`/game/${item.id}`);
//     },
//     [router],
//   );

//   const handleSwipeRight = useCallback(
//     (item: GameEntry) => {
//       updateEntryStatus(item.id, "playing");
//       reload();
//       showToast("Moved to Playing 🎮");
//     },
//     [reload, showToast],
//   );

//   const handleSwipeLeft = useCallback(
//     (item: GameEntry) => {
//       updateEntryStatus(item.id, "completed");
//       reload();
//       showToast("Marked as Completed ✅");
//     },
//     [reload, showToast],
//   );

//   const renderItem: ListRenderItem<FeedItem> = useCallback(
//     ({ item }) => {
//       if (item.kind === "share") {
//         return (
//           <ShareInlineCard
//             entries={topShareGamesRef.current}
//             onPress={() => setShowShareModal(true)}
//           />
//         );
//       }
//       return (
//         <SwipeableGameCard
//           item={item.entry}
//           onPress={handlePress}
//           onSwipeLeft={handleSwipeLeft}
//           onSwipeRight={handleSwipeRight}
//         />
//       );
//     },
//     [handlePress, handleSwipeLeft, handleSwipeRight],
//   );

//   const shareLabel =
//     activeFilter === "all" ? "Top 3 Right Now" : `Top ${activeFilter}`;

//   return (
//     <GestureHandlerRootView style={styles.container}>
//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       ) : (
//         <>
//           {allGames.length > 0 && (
//             <View style={styles.controls}>
//               <FilterBar
//                 active={activeFilter}
//                 onChange={setFilter}
//                 games={allGames}
//               />
//               <View style={styles.sortRow}>
//                 <SortDropdown
//                   value={sortBy}
//                   options={SORT_OPTIONS}
//                   onChange={setSortBy}
//                 />
//               </View>
//             </View>
//           )}

//           <FlatList
//             data={listData}
//             keyExtractor={(item) =>
//               item.kind === "game" ? item.entry.id : "__share__"
//             }
//             renderItem={renderItem}
//             removeClippedSubviews
//             maxToRenderPerBatch={10}
//             windowSize={5}
//             initialNumToRender={12}
//             contentContainerStyle={
//               listData.length === 0
//                 ? styles.emptyContainer
//                 : [styles.listContent, { paddingBottom: listPaddingBottom }]
//             }
//             ListEmptyComponent={
//               <View style={styles.empty}>
//                 <Ionicons
//                   name="game-controller-outline"
//                   size={64}
//                   color={colors.foregroundSubtle}
//                   style={{ marginBottom: spacing.lg }}
//                 />
//                 <Text style={styles.emptyTitle}>
//                   {activeFilter === "all"
//                     ? "Your backlog is quiet"
//                     : "Nothing here yet"}
//                 </Text>
//                 <Text style={styles.emptySub}>
//                   {activeFilter === "all"
//                     ? "Start tracking games you want to play, are playing, or have finished."
//                     : "You haven't added any games to this category."}
//                 </Text>
//                 {activeFilter === "all" && (
//                   <TouchableOpacity
//                     style={styles.emptyBtn}
//                     onPress={() => router.push("/(tabs)/discover")}
//                     activeOpacity={0.8}
//                   >
//                     <Text style={styles.emptyBtnText}>Find Games</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             }
//           />
//         </>
//       )}

//       {/* Toast */}
//       <Animated.View
//         style={[
//           styles.toast,
//           {
//             bottom: fabBottom + FAB_HEIGHT + spacing.sm,
//             opacity: toastOpacity,
//             transform: [{ translateY: toastTranslateY }],
//           },
//         ]}
//         pointerEvents="none"
//       >
//         <Text style={styles.toastText}>{toastMessage}</Text>
//       </Animated.View>

//       {/* Extended FAB */}
//       <View style={[styles.fabContainer, { bottom: fabBottom }]}>
//         <TouchableOpacity
//           style={styles.fab}
//           onPress={() => setShowNextToPlay(true)}
//           activeOpacity={0.85}
//           accessibilityLabel="Pick next game to play"
//           accessibilityRole="button"
//         >
//           <Ionicons name="shuffle" size={20} color={colors.foreground} />
//           <Text style={styles.fabText}>Pick Next Game</Text>
//         </TouchableOpacity>
//       </View>

//       <NextToPlayModal
//         visible={showNextToPlay}
//         games={allGames}
//         onClose={() => setShowNextToPlay(false)}
//         onStatusChange={reload}
//       />

//       <ShareModal
//         visible={showShareModal}
//         onClose={() => setShowShareModal(false)}
//         entries={topShareGames}
//         totalGames={visibleGames.length}
//         template={shareTemplate}
//         label={shareLabel}
//         onChangeTemplate={setShareTemplate}
//       />

//       <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   controls: {
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   sortRow: {
//     paddingHorizontal: spacing.md,
//     paddingBottom: spacing.sm,
//   },
//   listContent: {
//     paddingTop: spacing.xs,
//   },
//   emptyContainer: {
//     flex: 1,
//   },
//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: spacing.xl,
//     paddingTop: 100,
//   },
//   emptyTitle: {
//     color: colors.foreground,
//     fontSize: 20,
//     fontFamily: fontFamily.displayBold,
//     textAlign: "center",
//     marginBottom: spacing.sm,
//   },
//   emptySub: {
//     color: colors.foregroundMuted,
//     fontSize: 14,
//     textAlign: "center",
//     lineHeight: 21,
//   },
//   emptyBtn: {
//     marginTop: spacing.xl,
//     backgroundColor: colors.primary,
//     paddingHorizontal: spacing.xl,
//     paddingVertical: spacing.md,
//     borderRadius: radius.lg,
//   },
//   emptyBtnText: {
//     color: colors.foreground,
//     fontFamily: fontFamily.sansBold,
//     fontSize: 15,
//   },
//   toast: {
//     position: "absolute",
//     alignSelf: "center",
//     backgroundColor: colors.cardElevated,
//     borderRadius: radius.lg,
//     borderWidth: 1,
//     borderColor: colors.border,
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.sm,
//   },
//   toastText: {
//     color: colors.foreground,
//     fontSize: 13,
//     fontFamily: fontFamily.sansSemibold,
//   },
//   fabContainer: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     alignItems: "center",
//   },
//   fab: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.sm,
//     backgroundColor: colors.primary,
//     borderRadius: radius.lg,
//     paddingHorizontal: spacing.xl,
//     height: FAB_HEIGHT,
//     ...shadows.elevated,
//   },
//   fabText: {
//     color: colors.foreground,
//     fontFamily: fontFamily.sansBold,
//     fontSize: 15,
//   },
// });
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ListRenderItem,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBacklog } from "../../src/features/backlog/useBacklog";
import { useUIStore } from "../../src/store/ui.store";
import SwipeableGameCard from "../../src/components/SwipeableGameCard";
import FilterBar from "../../src/components/FilterBar";
import ShareInlineCard from "../../src/components/ShareInlineCard";
import { ShareModal } from "../../src/components/ShareModal";
import { SortDropdown } from "../../src/components/SortDropdown";
import { GameEntry } from "../../src/types/game";
import { colors, radius, spacing, shadows } from "../../src/constants/theme";
import { updateEntryStatus } from "../../src/db/queries/game";
import NextToPlayModal from "../../src/features/next-to-play/NextToPlayModal";
import { Ionicons } from "@expo/vector-icons";
import AboutModal from "../../src/features/about/AboutModal";
import { useNavigation } from "expo-router";
import { fontFamily } from "../../src/constants/typography";

const FAB_SIZE = 48;

const SORT_OPTIONS = [
  { value: "recently-added", label: "Recent" },
  { value: "title-az", label: "A-Z" },
  { value: "top-rated", label: "Top Rated" },
  { value: "most-played", label: "Most Played" },
] as const;

type FeedItem =
  | { kind: "game"; entry: GameEntry }
  | { kind: "share" };

export default function BacklogScreen() {
  const router = useRouter();
  const {
    activeFilter,
    sortBy,
    shareTemplate,
    setFilter,
    setSortBy,
    setShareTemplate,
  } = useUIStore();
  const navigation = useNavigation();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const { games: allGames, loading, reload } = useBacklog("all");

  const [showAbout, setShowAbout] = useState(false);
  const [showNextToPlay, setShowNextToPlay] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(8)).current;

  const fabBottom = spacing.lg + safeBottom;
  const listPaddingBottom = fabBottom + FAB_SIZE + spacing.lg;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowAbout(true)}
          style={{ marginRight: spacing.md }}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.foregroundMuted}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1600),
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 8,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const filteredGames = useMemo(
    () =>
      activeFilter === "all"
        ? allGames
        : allGames.filter((g) => g.status === activeFilter),
    [allGames, activeFilter],
  );

  const visibleGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      if (sortBy === "title-az") {
        return (a.game?.title ?? "").localeCompare(b.game?.title ?? "");
      }
      if (sortBy === "top-rated") {
        return (b.personalRating ?? -1) - (a.personalRating ?? -1);
      }
      if (sortBy === "most-played") {
        return b.hoursPlayed - a.hoursPlayed;
      }
      return b.createdAt - a.createdAt;
    });
  }, [filteredGames, sortBy]);

  const topShareGames = useMemo(() => {
    return [...visibleGames]
      .sort((a, b) => {
        const ratingDiff = (b.personalRating ?? -1) - (a.personalRating ?? -1);
        if (ratingDiff !== 0) return ratingDiff;
        const hoursDiff = b.hoursPlayed - a.hoursPlayed;
        if (hoursDiff !== 0) return hoursDiff;
        return b.createdAt - a.createdAt;
      })
      .slice(0, 3);
  }, [visibleGames]);

  const topShareGamesRef = useRef(topShareGames);
  topShareGamesRef.current = topShareGames;

  const listData = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = visibleGames.map((entry) => ({
      kind: "game",
      entry,
    }));

    if (topShareGames.length > 0 && items.length > 0) {
      const insertAt = Math.min(3, items.length);
      items.splice(insertAt, 0, { kind: "share" });
    }

    return items;
  }, [visibleGames, topShareGames.length]);

  const handlePress = useCallback(
    (item: GameEntry) => {
      router.push(`/game/${item.id}`);
    },
    [router],
  );

  const handleSwipeRight = useCallback(
    (item: GameEntry) => {
      updateEntryStatus(item.id, "playing");
      reload();
      showToast("Moved to Playing 🎮");
    },
    [reload, showToast],
  );

  const handleSwipeLeft = useCallback(
    (item: GameEntry) => {
      updateEntryStatus(item.id, "completed");
      reload();
      showToast("Marked as Completed ✅");
    },
    [reload, showToast],
  );

  const renderItem: ListRenderItem<FeedItem> = useCallback(
    ({ item }) => {
      if (item.kind === "share") {
        return (
          <ShareInlineCard
            entries={topShareGamesRef.current}
            onPress={() => setShowShareModal(true)}
          />
        );
      }

      return (
        <SwipeableGameCard
          item={item.entry}
          onPress={handlePress}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      );
    },
    [handlePress, handleSwipeLeft, handleSwipeRight],
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {allGames.length > 0 && (
            <View style={styles.controls}>
              <FilterBar
                active={activeFilter}
                onChange={setFilter}
                games={allGames}
              />

              <View style={styles.sortRow}>
                <SortDropdown
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={setSortBy}
                />
              </View>
            </View>
          )}

          <FlatList
            data={listData}
            keyExtractor={(item) =>
              item.kind === "game" ? item.entry.id : "__share__"
            }
            renderItem={renderItem}
            ItemSeparatorComponent={() => (
              <View style={{ height: spacing.sm }} />
            )}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: listPaddingBottom },
            ]}
          />
        </>
      )}

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            bottom: fabBottom + FAB_SIZE + spacing.sm,
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      {/* FAB (FIX REAL) */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            bottom: fabBottom,
            right: spacing.lg,
          },
        ]}
        onPress={() => setShowNextToPlay(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="shuffle" size={18} color={colors.foreground} />
      </TouchableOpacity>

      <NextToPlayModal
        visible={showNextToPlay}
        games={allGames}
        onClose={() => setShowNextToPlay(false)}
        onStatusChange={reload}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        entries={topShareGames}
        totalGames={visibleGames.length}
        template={shareTemplate}
        label="Your Top Games"
        onChangeTemplate={setShareTemplate}
      />

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  controls: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  sortRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  listContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  fab: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.elevated,
  },

  toast: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  toastText: {
    color: colors.foreground,
    fontSize: 13,
    fontFamily: fontFamily.sansSemibold,
  },
});