import React, { useEffect, useRef } from "react";
import {
  Animated,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing } from "../constants/theme";
import { fontFamily, fontSize } from "../constants/typography";
import type { UpdateCheckResult } from "../hooks/useAppUpdateCheck";

type Props = Pick<
  UpdateCheckResult,
  "storeUrl" | "isForceUpdate" | "shouldShowModal" | "dismissModal"
>;

export function UpdateModal({ storeUrl, isForceUpdate, shouldShowModal, dismissModal }: Props) {
  const translateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldShowModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          mass: 0.9,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(400);
      backdropOpacity.setValue(0);
    }
  }, [shouldShowModal, translateY, backdropOpacity]);

  async function handleUpdate() {
    if (!storeUrl) return;
    try {
      await Linking.openURL(storeUrl);
    } catch {
      // ignore
    }
  }

  return (
    <Modal
      visible={shouldShowModal}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={isForceUpdate ? undefined : dismissModal}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          {/* Purple glow bar */}
          <View style={styles.accentBar} />

          <View style={styles.content}>
            <Text style={styles.emoji}>🚀</Text>

            <Text style={styles.title}>New version available</Text>

            <Text style={styles.description}>
              {isForceUpdate
                ? "This update is required to continue using Playlogged. It includes important performance improvements and new features."
                : "A new version of Playlogged is available. Update now to enjoy the latest improvements and features."}
            </Text>

            {isForceUpdate && (
              <View style={styles.forceBadge}>
                <Text style={styles.forceBadgeText}>• Required update</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleUpdate}
            >
              <Text style={styles.primaryButtonText}>Update now</Text>
            </Pressable>

            {!isForceUpdate && (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
                onPress={dismissModal}
              >
                <Text style={styles.secondaryButtonText}>Maybe later</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: "center",
    marginTop: spacing.sm + 2,
  },
  accentBar: {
    height: 2,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    // Glow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: "center",
  },
  emoji: {
    fontSize: 52,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize["2xl"],
    color: colors.foreground,
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  description: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    color: colors.foregroundMuted,
    textAlign: "center",
    lineHeight: fontSize.md * 1.55,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  forceBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  forceBadgeText: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 7,
  },
  primaryButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  primaryButtonText: {
    fontFamily: fontFamily.sansBold,
    fontSize: fontSize.lg,
    color: colors.primaryForeground,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonPressed: {
    opacity: 0.55,
  },
  secondaryButtonText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    color: colors.foregroundSubtle,
  },
});
