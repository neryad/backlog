import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { colors, spacing } from "../constants/theme";

type Props = {
  children: React.ReactNode;
  style?: TextStyle;
};

export default function SectionLabel({ children, style }: Props) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export const sectionLabelStyle: TextStyle = {
  color: colors.textMuted,
  fontSize: 11,
  fontWeight: "600",
  letterSpacing: 0.8,
  textTransform: "uppercase",
  marginBottom: spacing.md,
};

const styles = StyleSheet.create({
  label: sectionLabelStyle,
});
