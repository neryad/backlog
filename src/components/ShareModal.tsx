import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { BacklogShareCard } from "./BacklogShareCard";
import { shareViewAsImage } from "../utils/share";
import { BACKLOG_SHARE_TEMPLATES } from "../constants/shareCardThemes";
import { colors, spacing, radius } from "../constants/theme";
import { fontFamily } from "../constants/typography";
import { GameEntry } from "../types/game";
import { BacklogShareTemplate } from "../constants/shareCardThemes";

type Props = {
  visible: boolean;
  onClose: () => void;
  entries: GameEntry[];
  totalGames: number;
  template: BacklogShareTemplate;
  label: string;
  onChangeTemplate: (value: BacklogShareTemplate) => void;
};

export function ShareModal({
  visible,
  onClose,
  entries,
  totalGames,
  template,
  label,
  onChangeTemplate,
}: Props) {
  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { bottom } = useSafeAreaInsets();

  async function handleShare() {
    if (!shareCardRef.current || isSharing) return;
    try {
      setIsSharing(true);
      await shareViewAsImage(shareCardRef, {
        dialogTitle: "Share your top card",
        width: 1080,
        height: 1920,
      });
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Share Top List</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={colors.foregroundMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View ref={shareCardRef} collapsable={false}>
            <BacklogShareCard
              entries={entries}
              totalGames={totalGames}
              template={template}
              label={label}
            />
          </View>

          <View style={styles.templateRow}>
            {BACKLOG_SHARE_TEMPLATES.map((option) => {
              const isActive = option.value === template;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => onChangeTemplate(option.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: bottom || spacing.md }]}>
          <TouchableOpacity
            style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
            onPress={handleShare}
            disabled={isSharing}
            activeOpacity={0.85}
          >
            <Text style={styles.shareBtnText}>
              {isSharing ? "Generating..." : "Share Card"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "88%",
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fontFamily.sansBold,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  templateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipActive: {
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    fontFamily: fontFamily.sansSemibold,
  },
  chipTextActive: {
    color: colors.foreground,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  shareBtnDisabled: {
    opacity: 0.6,
  },
  shareBtnText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansBold,
    fontSize: 16,
  },
});
