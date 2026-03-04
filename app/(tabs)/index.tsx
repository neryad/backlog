import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ListRenderItem,
  TouchableOpacity,
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

const CARD_HEIGHT = 95 + 16;

export default function BacklogScreen() {
  const router = useRouter();
  const { activeFilter, setFilter } = useUIStore();
  const navigation = useNavigation();
  const [showAbout, setShowAbout] = useState(false);
  // Una sola instancia — siempre trae todos los juegos
  const { games: allGames, reload } = useBacklog("all");

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

  return (
    <GestureHandlerRootView style={styles.container}>
      <FilterBar active={activeFilter} onChange={setFilter} games={allGames} />
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
            : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎮</Text>
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

      {/* FAB */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNextToPlay(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>🎮</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNextToPlay(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="shuffle" size={26} color={colors.text} />
      </TouchableOpacity>

      {/* Next To Play Modal */}
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

  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
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
});
