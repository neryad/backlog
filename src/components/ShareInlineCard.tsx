import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { GameEntry } from "../types/game";
import { colors, spacing, radius } from "../constants/theme";
import { fontFamily } from "../constants/typography";

type Props = {
  entries: GameEntry[];
  onPress: () => void;
};

function ShareInlineCard({ entries, onPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.label}>TOP 3 RIGHT NOW</Text>
          <View style={styles.covers}>
            {entries.map((entry) =>
              entry.game?.coverUrl ? (
                <Image
                  key={entry.id}
                  source={{ uri: entry.game.coverUrl }}
                  style={styles.cover}
                  contentFit="cover"
                />
              ) : (
                <View key={entry.id} style={[styles.cover, styles.coverFallback]} />
              )
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.btnText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(ShareInlineCard);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    color: colors.foregroundMuted,
    fontSize: 10,
    fontFamily: fontFamily.sansSemibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  covers: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  cover: {
    width: 44,
    height: 58,
    borderRadius: radius.sm,
  },
  coverFallback: {
    backgroundColor: colors.cardElevated,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  btnText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
  },
});
