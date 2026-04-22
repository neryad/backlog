import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ListRenderItem,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

const CARD_HEIGHT = 95 + 16;
const FAB_SIZE = 56;

export default function BacklogScreen() {
  const router = useRouter();
  const { activeFilter, setFilter } = useUIStore();
  const navigation = useNavigation();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const [showAbout, setShowAbout] = useState(false);
  const { games: allGames, loading, reload } = useBacklog("all");
  const [showNextToPlay, setShowNextToPlay] = useState(false);

  // FAB bottom respects device safe area (iPhone home indicator, etc.)
  const fabBottom = spacing.xl + safeBottom;
  const listPaddingBottom = fabBottom + FAB_SIZE + spacing.sm;

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

  const filteredGames = useMemo(
    () =>
      activeFilter === "all"
        ? allGames
        : allGames.filter((g) => g.status === activeFilter),
    [allGames, activeFilter],
  );

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
    },
    [reload],
  );

  const handleSwipeLeft = useCallback(
    (item: GameEntry) => {
      updateEntryStatus(item.id, "completed");
      reload();
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

  return (
    <GestureHandlerRootView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {allGames.length > 0 && (
            <FilterBar
              active={activeFilter}
              onChange={setFilter}
              games={allGames}
            />
          )}
          <FlatList
            data={filteredGames}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={12}
            contentContainerStyle={
              filteredGames.length === 0
                ? styles.emptyContainer
                : [styles.listContent, { paddingBottom: listPaddingBottom }]
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

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => setShowNextToPlay(true)}
        activeOpacity={0.8}
        accessibilityLabel="Pick next game to play"
        accessibilityRole="button"
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
    right: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
});
