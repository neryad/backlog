import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { GameEntry } from "../../types/game";
import { pickNextGame, PickStrategy } from "./pickNextGame";
import { colors, spacing, radius } from "../../constants/theme";
import { updateEntryStatus } from "../../db/queries/game";
import { fontFamily } from "../../constants/typography";

type StrategyOption = {
  value: PickStrategy;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
};

const STRATEGIES: StrategyOption[] = [
  { value: "random", label: "Random", description: "Surprise me", icon: "shuffle-outline", iconColor: colors.primary },
  { value: "oldest", label: "Oldest Added", description: "Clear the backlog", icon: "time-outline", iconColor: colors.foregroundMuted },
  { value: "highest-rated", label: "Top Rated", description: "Your highest wishlist", icon: "star-outline", iconColor: colors.warning },
];

type Props = {
  visible: boolean;
  games: GameEntry[];
  onClose: () => void;
  onStatusChange: () => void;
};

export default function NextToPlayModal({
  visible,
  games,
  onClose,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [strategy, setStrategy] = useState<PickStrategy>("random");
  const [picked, setPicked] = useState<GameEntry | null>(null);
  const [phase, setPhase] = useState<"pick" | "result">("pick");

  function handlePick() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = pickNextGame(games, strategy);
    setPicked(result);
    setPhase("result");
  }

  function handlePickAgain() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = pickNextGame(games, strategy);
    setPicked(result);
  }

  function handleLetsPlay() {
    if (!picked) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    updateEntryStatus(picked.id, "playing");
    onStatusChange();
    onClose();
    router.push(`/game/${picked.id}`);
  }

  function handleClose() {
    setPhase("pick");
    setPicked(null);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {phase === "pick" ? (
            <>
              <Text style={styles.title}>What should I play?</Text>
              <Text style={styles.subtitle}>Choose a strategy</Text>

              {/* Strategy picker */}
              <View style={styles.strategies}>
                {STRATEGIES.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.strategyBtn,
                      strategy === s.value && styles.strategyBtnActive,
                    ]}
                    onPress={() => setStrategy(s.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.strategyHeader}>
                      <View
                        style={[
                          styles.strategyIconWrap,
                          strategy === s.value && styles.strategyIconWrapActive,
                        ]}
                      >
                        <Ionicons
                          name={s.icon}
                          size={16}
                          color={strategy === s.value ? colors.foreground : s.iconColor}
                        />
                      </View>
                      <Text
                        style={[
                          styles.strategyLabel,
                          strategy === s.value && styles.strategyLabelActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </View>
                    <Text style={styles.strategyDesc}>{s.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.pickBtn} onPress={handlePick}>
                <Text style={styles.pickBtnText}>Pick a Game</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Tonight, play this:</Text>

              {picked ? (
                <View style={styles.result}>
                  {picked.game?.coverUrl ? (
                    <Image
                      source={{ uri: picked.game.coverUrl }}
                      style={styles.cover}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.coverPlaceholder} />
                  )}
                  <Text style={styles.gameName}>{picked.game?.title}</Text>
                  {picked.game?.releaseYear && (
                    <Text style={styles.gameYear}>
                      {picked.game.releaseYear}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.noGames}>
                  <Text style={styles.noGamesText}>No games in backlog.</Text>
                </View>
              )}

              {picked && (
                <>
                  <TouchableOpacity
                    style={styles.letsPlayBtn}
                    onPress={handleLetsPlay}
                  >
                    <View style={styles.letsPlayContent}>
                      <Ionicons name="play-circle-outline" size={18} color={colors.foreground} />
                      <Text style={styles.letsPlayText}>Let's Play</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickBtn}
                    onPress={handlePickAgain}
                  >
                    <Text style={styles.pickBtnText}>Pick Again</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontFamily: fontFamily.displayBold,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.foregroundMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  strategies: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  strategyBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strategyBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  strategyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  strategyIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceOverlayXs,
  },
  strategyIconWrapActive: {
    backgroundColor: colors.surfaceOverlaySm,
  },
  strategyLabel: {
    color: colors.foregroundMuted,
    fontSize: 15,
    fontFamily: fontFamily.sansSemibold,
  },
  strategyLabelActive: {
    color: colors.foreground,
  },
  strategyDesc: {
    color: colors.foregroundMuted,
    fontSize: 12,
    marginTop: 2,
  },
  result: {
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  cover: {
    width: 140,
    height: 190,
    borderRadius: radius.md,
  },
  coverPlaceholder: {
    width: 140,
    height: 190,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  gameName: {
    color: colors.foreground,
    fontSize: 20,
    fontFamily: fontFamily.displaySemibold,
    textAlign: "center",
  },
  gameYear: {
    color: colors.foregroundMuted,
    fontSize: 14,
  },
  noGames: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  noGamesText: {
    color: colors.foregroundMuted,
    fontSize: 16,
  },
  pickBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  pickBtnText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansBold,
    fontSize: 16,
  },
  letsPlayBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  letsPlayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  letsPlayText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansBold,
    fontSize: 16,
  },
  cancelBtn: {
    padding: spacing.md,
    alignItems: "center",
  },
  cancelText: {
    color: colors.foregroundMuted,
    fontSize: 15,
  },
});
