import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { Image } from "expo-image";
import { GameSearchResult } from "../../src/types/igdb.types";
import { useDebounce } from "../../src/hooks/useDebounce";
import { useGameSearch } from "../../src/features/search/useGameSearch";
import { colors, radius, spacing } from "../../src/constants/theme";
import AddGameSheet from "../../src/features/search/AddGameSheet";
import { fontFamily } from "../../src/constants/typography";

export default function DiscoverScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GameSearchResult | null>(null);
  const debouncedQuery = useDebounce(query, 400);
  const { data, isFetching, error } = useGameSearch(debouncedQuery);

  const handleAdded = useCallback(() => setSelected(null), []);

  const renderItem: ListRenderItem<GameSearchResult> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
      >
        {item.coverUrl ? (
          <Image
            source={{ uri: item.coverUrl }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.releaseYear && (
            <Text style={styles.year}>{item.releaseYear}</Text>
          )}
          {item.summary && (
            <Text style={styles.summary} numberOfLines={2}>
              {item.summary}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search games..."
          placeholderTextColor={colors.foregroundMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {isFetching && (
          <ActivityIndicator color={colors.primary} style={styles.spinner} />
        )}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Search unavailable</Text>
          <Text style={styles.errorSub}>
            Check your connection and try again
          </Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.igdbId)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          debouncedQuery.length > 2 && !isFetching ? (
            <Text style={styles.empty}>No results for "{debouncedQuery}"</Text>
          ) : null
        }
      />

      {/* Add Game Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {selected && (
            <AddGameSheet
              game={selected}
              onAdded={handleAdded}
              onCancel={() => setSelected(null)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.foreground,
    fontSize: 15,
    paddingVertical: spacing.md,
  },
  spinner: {
    marginLeft: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  resultCard: {
    flexDirection: "row",
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
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
    backgroundColor: colors.cardElevated,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.foreground,
    fontSize: 15,
    fontFamily: fontFamily.sansSemibold,
  },
  year: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },
  summary: {
    color: colors.foregroundMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
    padding: spacing.md,
  },
  empty: {
    color: colors.foregroundMuted,
    textAlign: "center",
    padding: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },

  errorContainer: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  errorEmoji: {
    fontSize: 32,
  },
  errorTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fontFamily.sansSemibold,
  },
  errorSub: {
    color: colors.foregroundMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
