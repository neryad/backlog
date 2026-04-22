import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppState } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/theme";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/auth.store";
import { useUIStore } from "../../src/store/ui.store";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color }: { name: IoniconsName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const pendingFriendRequests = useUIStore((state) => state.pendingFriendRequests);
  const setPendingFriendRequests = useUIStore(
    (state) => state.setPendingFriendRequests,
  );

  useEffect(() => {
    let isMounted = true;

    async function refreshPendingRequestsCount() {
      if (!session) {
        if (isMounted) setPendingFriendRequests(0);
        return;
      }
      // No hacer requests si la app está en background.
      if (AppState.currentState !== "active") return;

      const { count, error } = await supabase
        .from("friend_requests")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", session.user.id)
        .eq("status", "pending");

      if (!error && typeof count === "number" && isMounted) {
        setPendingFriendRequests(count);
      }
    }

    refreshPendingRequestsCount();

    const intervalId = setInterval(refreshPendingRequestsCount, 15000);
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          refreshPendingRequestsCount();
        }
      },
    );

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [session, setPendingFriendRequests]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Playlogged",
          tabBarIcon: ({ color }) => (
            <TabIcon name="game-controller" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <TabIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color }) => <TabIcon name="people" color={color} />,
          tabBarBadge:
            pendingFriendRequests > 0 ? pendingFriendRequests : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <TabIcon name="bar-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}
