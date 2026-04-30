/**
 * Gaming Backlog — useAppFonts hook
 *
 * Carga las 3 familias necesarias (Inter + Space Grotesk + JetBrains Mono).
 *
 * Uso (en App.tsx o root layout):
 *
 *   import { useAppFonts } from "./theme/useAppFonts";
 *   import * as SplashScreen from "expo-splash-screen";
 *
 *   SplashScreen.preventAutoHideAsync();
 *
 *   export default function App() {
 *     const fontsLoaded = useAppFonts();
 *     useEffect(() => {
 *       if (fontsLoaded) SplashScreen.hideAsync();
 *     }, [fontsLoaded]);
 *
 *     if (!fontsLoaded) return null;
 *     return <RootNavigator />;
 *   }
 */

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";

export function useAppFonts() {
  const [loaded] = useFonts({
    // Inter — UI
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Space Grotesk — Display
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    // JetBrains Mono — Data
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  return loaded;
}

export default useAppFonts;
