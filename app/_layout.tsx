import "react-native-get-random-values"; // ← primera línea, antes de todo
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeDatabase } from "../src/db/schema";
import { colors } from "../src/constants/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { isSupabaseConfigured, supabase } from "../src/lib/supabase";
import { useAuthStore } from "../src/store/auth.store";
import { syncBacklogToSupabase } from "../src/lib/sync";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const { setSession } = useAuthStore();

  // Inicializar DB
  useEffect(() => {
    initializeDatabase();
    setDbReady(true);
  }, []);

  // Restaurar sesión de Supabase al abrir la app
  // Reemplaza el useEffect de auth existente con este:
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

      if (user.id) {
        syncBacklogToSupabase(user.id);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Sincronizar backlog al hacer login
      if (_event === "SIGNED_IN" && session?.user?.id) {
        syncBacklogToSupabase(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);
  // useEffect(() => {
  //   // Obtener sesión actual
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session);
  //   });

  //   // Escuchar cambios de sesión (login, logout, token refresh)
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  if (!dbReady) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen
            name="profile/[username]"
            options={{
              headerShown: true,
              title: "Profile",
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
