import { useWindowDimensions } from "react-native";

const TABLET_BREAKPOINT = 768;

export function useDeviceSize() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const isLandscape = width > height;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    isLargeTablet: width >= 1024,
  };
}

export const TABLET_BREAKPOINT_VALUE = TABLET_BREAKPOINT;