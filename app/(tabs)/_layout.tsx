import { useEffect } from "react";
import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppState, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../../src/constants/theme";
import { fontFamily } from "../../src/constants/typography";
import { isSupabaseConfigured, supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/auth.store";
import { useUIStore } from "../../src/store/ui.store";
import { useDeviceSize } from "../../src/hooks/useDeviceSize";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_ROUTES: { name: string; title: string; icon: IoniconsName }[] = [
  { name: "index", title: "Backlog", icon: "game-controller" },
  { name: "discover", title: "Discover", icon: "search" },
  { name: "friends", title: "Friends", icon: "people" },
  { name: "stats", title: "Stats", icon: "bar-chart" },
  { name: "top", title: "Top", icon: "podium" },
];

function TabIcon({ name, color, size = 22 }: { name: IoniconsName; color: string; size?: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function SidebarItem({
  route,
  isActive,
  onPress,
}: {
  route: { name: string; title: string; icon: IoniconsName };
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TabIcon
        name={route.icon}
        color={isActive ? colors.primary : colors.foregroundMuted}
        size={24}
      />
      <Text
        style={[
          styles.sidebarItemText,
          isActive && styles.sidebarItemTextActive,
        ]}
      >
        {route.title}
      </Text>
    </TouchableOpacity>
  );
}

function TabletLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuthStore();
  const pendingFriendRequests = useUIStore((state) => state.pendingFriendRequests);
  const insets = useSafeAreaInsets();

  const currentTab = TAB_ROUTES.find(
    (r) => pathname.includes(`/${r.name}`) || (pathname === "/" && r.name === "index"),
  )?.name || "index";

  return (
    <View style={styles.tabletContainer}>
      <View style={styles.sidebar}>
        <View style={[styles.sidebarHeader, { paddingTop: insets.top + spacing.md }]}>
          <Ionicons name="game-controller" size={32} color={colors.primary} />
          <Text style={styles.sidebarTitle}>Playlogged</Text>
        </View>
        <View style={styles.sidebarContent}>
          {TAB_ROUTES.map((route) => (
            <SidebarItem
              key={route.name}
              route={route}
              isActive={currentTab === route.name}
              onPress={() => router.push(`/(tabs)/${route.name}`)}
            />
          ))}
        </View>
        {pendingFriendRequests > 0 && (
          <View style={styles.sidebarBadge}>
            <Text style={styles.sidebarBadgeText}>{pendingFriendRequests}</Text>
          </View>
        )}
      </View>
      <View style={styles.tabletContent}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="discover" />
          <Tabs.Screen name="friends" />
          <Tabs.Screen name="stats" />
          <Tabs.Screen name="top" />
        </Tabs>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { isTablet } = useDeviceSize();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const pendingFriendRequests = useUIStore((state) => state.pendingFriendRequests);
  const setPendingFriendRequests = useUIStore(
    (state) => state.setPendingFriendRequests,
  );

  useEffect(() => {
    let isMounted = true;

    async function refreshPendingRequestsCount() {
      if (!session || !isSupabaseConfigured) {
        if (isMounted) setPendingFriendRequests(0);
        return;
      }
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

    const intervalId = setInterval(refreshPendingRequestsCount, 60000);
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

  if (isTablet) {
    return <TabletLayout />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.foregroundMuted,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
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
            color: colors.foreground,
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
      <Tabs.Screen
        name="top"
        options={{
          title: "Top",
          tabBarIcon: ({ color }) => <TabIcon name="podium" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabletContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    position: "relative",
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  sidebarTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.foreground,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },
  sidebarItemActive: {
    backgroundColor: colors.primary + "20",
  },
  sidebarItemText: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 16,
    color: colors.foregroundMuted,
  },
  sidebarItemTextActive: {
    color: colors.primary,
  },
  sidebarBadge: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  sidebarBadgeText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansBold,
    fontSize: 12,
  },
  tabletContent: {
    flex: 1,
  },
});
