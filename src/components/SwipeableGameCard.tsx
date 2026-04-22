import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import * as Haptics from "expo-haptics";
import GameCard from "./GameCard";
import { GameEntry } from "../types/game";
import { colors, spacing, radius } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  item: GameEntry;
  onPress: (item: GameEntry) => void;
  onSwipeLeft: (item: GameEntry) => void;
  onSwipeRight: (item: GameEntry) => void;
};

function renderRightAction(progress: Animated.AnimatedInterpolation<number>) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.rightAction}>
      <Animated.View
        style={{ transform: [{ scale }], alignItems: "center", gap: 4 }}
      >
        <Ionicons name="checkmark-circle" size={28} color={colors.text} />
        <Text style={styles.actionText}>Done</Text>
      </Animated.View>
    </View>
  );
}

function renderLeftAction(progress: Animated.AnimatedInterpolation<number>) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.leftAction}>
      <Animated.View
        style={{ transform: [{ scale }], alignItems: "center", gap: 4 }}
      >
        <Ionicons name="game-controller" size={28} color={colors.text} />
        <Text style={styles.actionText}>Playing</Text>
      </Animated.View>
    </View>
  );
}

export default function SwipeableGameCard({
  item,
  onPress,
  onSwipeLeft,
  onSwipeRight,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  // Swipeable reporta la dirección del PANEL que se abrió, no del gesto:
  // direction="left"  → panel izquierdo visible → gesto fue hacia la derecha → "Playing"
  // direction="right" → panel derecho visible  → gesto fue hacia la izquierda → "Completed"
  function handleLeftPanelOpen() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onSwipeRight(item); // swipe derecha = "Playing"
  }

  function handleRightPanelOpen() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onSwipeLeft(item); // swipe izquierda = "Completed"
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightAction}
      renderLeftActions={renderLeftAction}
      onSwipeableOpen={(direction) => {
        if (direction === "left") handleLeftPanelOpen();
        if (direction === "right") handleRightPanelOpen();
      }}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <GameCard item={item} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightAction: {
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
  },
  leftAction: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
  },
  actionText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
});
