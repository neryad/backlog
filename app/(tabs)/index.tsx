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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useBacklog } from "../../src/features/backlog/useBacklog";
import { useUIStore } from "../../src/store/ui.store";
import SwipeableGameCard from "../../src/components/SwipeableGameCard";
import FilterBar from "../../src/components/FilterBar";
import { GameEntry } from "../../src/types/game";
import { colors, radius, spacing } from "../../src/constants/theme";
import { updateEntryStatus } from "../../src/db/queries/game";
import NextToPlayModal from "../../src/features/next-to-play/NextToPlayModal";
import { Ionicons } from "@expo/vector-icons";
import AboutModal from "../../src/features/about/AboutModal";
import { useNavigation } from "expo-router";
import { ActivityIndicator } from "react-native";
import { BacklogShareCard } from "../../src/components/BacklogShareCard";
import { shareViewAsImage } from "../../src/utils/share";

const CARD_HEIGHT = 95 + 16;
const SORT_OPTIONS = [
  { value: "recently-added", label: "Recent" },
  { value: "title-az", label: "A-Z" },
] as const;

export default function BacklogScreen() {
  const router = useRouter();
  const { activeFilter, sortBy, setFilter, setSortBy } = useUIStore();
  const navigation = useNavigation();
  const shareCardRef = useRef<View>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  // Una sola instancia — siempre trae todos los juegos
  const { games: allGames, loading, reload } = useBacklog("all");

  const [showNextToPlay, setShowNextToPlay] = useState(false);

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
            color={colors.textMuted}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Filtra localmente, sin segundo hook
  const filteredGames =
    activeFilter === "all"
      ? allGames
      : allGames.filter((g) => g.status === activeFilter);

  const visibleGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "title-az") {
      const aTitle = a.game?.title ?? "";
      const bTitle = b.game?.title ?? "";
      return aTitle.localeCompare(bTitle);
    }

    return b.createdAt - a.createdAt;
  });

  const topShareGames = useMemo(() => {
    const ratedGames = [...visibleGames].sort((a, b) => {
      const ratingDiff = (b.personalRating ?? -1) - (a.personalRating ?? -1);
      if (ratingDiff !== 0) return ratingDiff;

      const hoursDiff = b.hoursPlayed - a.hoursPlayed;
      if (hoursDiff !== 0) return hoursDiff;

      return b.createdAt - a.createdAt;
    });

    return ratedGames.slice(0, 3);
  }, [visibleGames]);

  const handlePress = useCallback(
    (item: GameEntry) => {
      router.push(`/game/${item.id}`);
    },
    [router],
  );

  const handleSwipeRight = useCallback(
    (item: GameEntry) => {
      updateEntryStatus(item.id, "playing");
      reload(); // ← mismo reload de la única instancia
    },
    [reload],
  );

  const handleSwipeLeft = useCallback(
    (item: GameEntry) => {
      updateEntryStatus(item.id, "completed");
      reload(); // ← mismo reload
    },
    [reload],
  );

  const renderItem: ListRenderItem<GameEntry> = useCallback(
    ({ item }) => (
      <SwipeableGameCard
        item={item}
        onPress={handlePress}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    ),
    [handlePress, handleSwipeLeft, handleSwipeRight],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [],
  );

  async function handleShareTopCard() {
    if (!shareCardRef.current || isSharing) return;

    if (topShareGames.length === 0) {
      Alert.alert("No games to share", "Add some games to your backlog first.");
      return;
    }

    try {
      setIsSharing(true);
      await shareViewAsImage(shareCardRef, {
        dialogTitle: "Share your top backlog games",
        width: 1080,
        height: 1920,
      });
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {allGames.length > 0 && (
            <>
              <FilterBar
                active={activeFilter}
                onChange={setFilter}
                games={allGames}
              />
              <View style={styles.sortRow}>
                {SORT_OPTIONS.map((option) => {
                  const isActive = sortBy === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortChip,
                        isActive && styles.sortChipActive,
                      ]}
                      onPress={() => setSortBy(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.sortChipText,
                          isActive && styles.sortChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
          <FlatList
            data={visibleGames}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={12}
            contentContainerStyle={
              visibleGames.length === 0
                ? styles.emptyContainer
                : styles.listContent
            }
            ListHeaderComponent={
              topShareGames.length > 0 ? (
                <View style={styles.shareSection}>
                  <View style={styles.shareHeaderRow}>
                    <View>
                      <Text style={styles.shareSectionTitle}>
                        Share Top List
                      </Text>
                      <Text style={styles.shareSectionSub}>
                        {activeFilter === "all"
                          ? "Share your current top picks"
                          : `Share your best ${activeFilter} games`}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.shareToggleBtn}
                      onPress={() => setShowSharePreview((prev) => !prev)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showSharePreview ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.text}
                      />
                      <Text style={styles.shareToggleText}>
                        {showSharePreview ? "Hide" : "Preview"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.sharePreviewFrame,
                      !showSharePreview && styles.sharePreviewHidden,
                    ]}
                  >
                    <View ref={shareCardRef} collapsable={false}>
                      <BacklogShareCard
                        entries={topShareGames}
                        totalGames={visibleGames.length}
                        label={
                          activeFilter === "all"
                            ? "Top 3 Right Now"
                            : `Top ${activeFilter}`
                        }
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.shareBtn,
                      isSharing && styles.shareBtnDisabled,
                    ]}
                    onPress={handleShareTopCard}
                    disabled={isSharing}
                  >
                    <Text style={styles.shareBtnText}>
                      {isSharing ? "Generating..." : "Share Top Card"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons
                  name="game-controller-outline"
                  size={64}
                  color={colors.textMuted}
                  style={{ marginBottom: spacing.md }}
                />
                <Text style={styles.emptyTitle}>
                  {activeFilter === "all"
                    ? "Your backlog is empty"
                    : `No games in ${activeFilter}`}
                </Text>
                <Text style={styles.emptySub}>
                  {activeFilter === "all"
                    ? "Go to Discover to add your first game"
                    : "Swipe a game or change the filter"}
                </Text>
                {activeFilter === "all" && (
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => router.push("/(tabs)/discover")}
                  >
                    <Text style={styles.emptyBtnText}>Search Games</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </>
      )}

      {/* FAB siempre visible */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNextToPlay(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="shuffle" size={26} color={colors.text} />
      </TouchableOpacity>

      <NextToPlayModal
        visible={showNextToPlay}
        games={allGames}
        onClose={() => setShowNextToPlay(false)}
        onStatusChange={reload}
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
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  shareSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  shareSectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  sharePreviewFrame: {
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
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  sortChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  sortChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sortChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  sortChipTextActive: {
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },

  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
  },

  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  emptyBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  shareHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  shareSectionSub: {
    color: colors.textMuted,
    fontSize: 13,
  },
  shareToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareToggleText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  sharePreviewHidden: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    pointerEvents: "none",
  },
});
