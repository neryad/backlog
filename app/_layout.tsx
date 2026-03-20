import "react-native-get-random-values"; // ← primera línea, antes de todo
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeDatabase } from "../src/db/schema";
import { colors } from "../src/constants/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { Alert } from "react-native";
import {
  saveFriendRequest,
  getUserProfile,
} from "../src/db/queries/friends";

const queryClient = new QueryClient();

function parseFriendRequestUrl(url: string): { id: string; name: string } | null {
  try {
    const parsed = Linking.parse(url);
    if (parsed.path !== "add-friend") return null;
    const id = parsed.queryParams?.id;
    const name = parsed.queryParams?.name;
    if (typeof id === "string" && id && typeof name === "string" && name) {
      return { id, name };
    }
  } catch {
    // ignore malformed URLs
  }
  return null;
}

function handleFriendRequestUrl(url: string) {
  const params = parseFriendRequestUrl(url);
  if (!params) return;

  const myProfile = getUserProfile();
  if (params.id === myProfile.id) {
    // The user opened their own invite link — nothing to do
    return;
  }

  saveFriendRequest(params.id, params.name);
  Alert.alert(
    "Friend Request",
    `${params.name} wants to be your friend! Open the Friends tab to accept or decline.`,
    [{ text: "OK" }],
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    initializeDatabase();
    setDbReady(true);
  }, []);

  // Handle deep links while the app is already open
  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleFriendRequestUrl(url);
    });
    return () => subscription.remove();
  }, []);

  // Handle the deep link that launched the app (cold start)
  useEffect(() => {
    if (!dbReady) return;
    Linking.getInitialURL().then((url) => {
      if (url) handleFriendRequestUrl(url);
    });
  }, [dbReady]);

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
