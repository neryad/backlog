import { View, StyleSheet, ViewStyle } from "react-native";
import { useDeviceSize } from "../hooks/useDeviceSize";
import { spacing } from "../constants/theme";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ResponsiveContainer({
  children,
  style,
}: ResponsiveContainerProps) {
  const { isTablet, isLargeTablet } = useDeviceSize();

  const contentWidth = isLargeTablet
    ? "50%"
    : isTablet
      ? "65%"
      : "100%";

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(isTablet && {
      maxWidth: 1200,
      alignSelf: "center",
      width: "100%",
    }),
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
}

export function TwoColumnContainer({
  left,
  right,
  leftStyle,
  rightStyle,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  leftStyle?: ViewStyle;
  rightStyle?: ViewStyle;
}) {
  const { isTablet, isLargeTablet } = useDeviceSize();

  if (!isTablet) {
    return <>{left}</>;
  }

  return (
    <View style={styles.twoColumn}>
      <View style={[styles.leftColumn, leftStyle]}>{left}</View>
      <View style={styles.divider} />
      <View style={[styles.rightColumn, rightStyle]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  twoColumn: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  rightColumn: {
    flex: 1,
  },
});