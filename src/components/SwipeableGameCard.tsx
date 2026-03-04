import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import * as Haptics from "expo-haptics";
import GameCard from "./GameCard";
import { GameEntry } from "../types/game";
import { colors, spacing, radius } from "../constants/theme";

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
      <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
        ✅ Done
      </Animated.Text>
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
      <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
        🎮 Playing
      </Animated.Text>
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

  function handleSwipeLeft() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onSwipeLeft(item);
  }

  function handleSwipeRight() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onSwipeRight(item);
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightAction}
      renderLeftActions={renderLeftAction}
      onSwipeableOpen={(direction) => {
        if (direction === "left") handleSwipeLeft();
        if (direction === "right") handleSwipeRight();
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
