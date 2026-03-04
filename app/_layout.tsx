import "react-native-get-random-values"; // ← primera línea, antes de todo
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeDatabase } from "../src/db/schema";
import { colors } from "../src/constants/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    initializeDatabase();
    setDbReady(true);
  }, []);
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
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
