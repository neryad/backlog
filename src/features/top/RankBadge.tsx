import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { fontFamily, fontSize } from "../../constants/typography";

type Props = {
  change: number | null;
  size?: "sm" | "md";
};

export function RankBadge({ change, size = "md" }: Props) {
  const isNew = change === null;
  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;
  const isSame = change !== null && change === 0;

  const color = isUp
    ? colors.success
    : isDown
      ? colors.danger
      : colors.foregroundMuted;

  const iconName: React.ComponentProps<typeof Ionicons>["name"] = isUp
    ? "arrow-up"
    : isDown
      ? "arrow-down"
      : "remove";

  const label = isNew
    ? "NEW"
    : isSame
      ? "—"
      : `${Math.abs(change ?? 0)}`;

  const textSize = size === "sm" ? fontSize.xxs : fontSize.xs;
  const padding = size === "sm" ? 4 : 6;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + "22", paddingHorizontal: padding },
      ]}
    >
      {!isNew && !isSame && (
        <Ionicons
          name={iconName}
          size={size === "sm" ? 10 : 12}
          color={color}
        />
      )}
      <Text style={[styles.text, { color, fontSize: textSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
});
