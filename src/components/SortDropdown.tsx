import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { fontFamily } from "../constants/typography";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

export function SortDropdown<T extends string>({ value, options, onChange }: Props<T>) {
  const [open, setOpen] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const current = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>Sort: {current?.label}</Text>
        <Ionicons name="chevron-down" size={13} color={colors.foregroundMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetLabel}>Sort by</Text>

          {options.map((opt, index) => {
            const isActive = opt.value === value;
            const isLast = index === options.length - 1;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, !isLast && styles.optionBorder]}
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {opt.label}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: bottom }} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 32,
  },
  triggerText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    fontFamily: fontFamily.sansSemibold,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetLabel: {
    color: colors.foregroundMuted,
    fontSize: 11,
    fontFamily: fontFamily.sansSemibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  optionText: {
    color: colors.foreground,
    fontSize: 15,
    fontFamily: fontFamily.sansMedium,
  },
  optionTextActive: {
    color: colors.primary,
    fontFamily: fontFamily.sansBold,
  },
});
