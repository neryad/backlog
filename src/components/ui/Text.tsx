import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { fontFamily } from "../../constants/typography";

const base = StyleSheet.create({
  root: { fontFamily: fontFamily.sans },
});

/**
 * Drop-in replacement for RN Text.
 * Applies Inter_400Regular as default; any passed style overrides it.
 * Use fontFamily tokens for bold/display/mono overrides.
 */
export function Text({ style, ...props }: TextProps) {
  return <RNText style={[base.root, style]} {...props} />;
}
