import "react-native-get-random-values";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeDatabase } from "../src/db/schema";
import { colors } from "../src/constants/theme";
import { fontFamily } from "../src/constants/typography";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { isSupabaseConfigured, supabase } from "../src/lib/supabase";
import { useAuthStore } from "../src/store/auth.store";
import { syncBacklogToSupabase } from "../src/lib/sync";
import { useAppFonts } from "../src/constants/useAppFonts";

// React Native has no global font setting (unlike CSS).
// This sets Inter as the default font for every <Text> in the app.
// Individual styles can still override with fontFamily.sansBold, displayBold, mono, etc.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Text as any).defaultProps = { style: { fontFamily: fontFamily.sans } };

const queryClient = new QueryClient();

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const [dbReady, setDbReady] = useState(false);
  const { setSession } = useAuthStore();

  useEffect(() => {
    try {
      initializeDatabase();
    } catch (e) {
      if (__DEV__) console.error("DB init failed", e);
    } finally {
      setDbReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      return;
    }

    let isMounted = true;

    async function restoreSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (isMounted) setSession(null);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        await supabase.auth.signOut({ scope: "local" }).catch(() => null);
        if (isMounted) setSession(null);
        return;
      }

      if (isMounted) {
        setSession(session);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === "SIGNED_IN" && session?.user?.id) {
        syncBacklogToSupabase(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!dbReady || !fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.foreground,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen
            name="profile/[username]"
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="profile/edit-platforms"
            options={{ headerShown: true }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
