// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { colors } from "../../src/constants/theme";

// type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// function TabIcon({ name, color }: { name: IoniconsName; color: string }) {
//   return <Ionicons name={name} size={22} color={color} />;
// }

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarStyle: {
//           backgroundColor: colors.surface,
//           borderTopColor: colors.border,
//           height: 60,
//           paddingBottom: 8,
//         },
//         tabBarActiveTintColor: colors.primary,
//         tabBarInactiveTintColor: colors.textMuted,
//         headerStyle: { backgroundColor: colors.background },
//         headerTintColor: colors.text,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Playlogged",
//           tabBarIcon: ({ color }) => (
//             <TabIcon name="game-controller" color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="discover"
//         options={{
//           title: "Discover",
//           tabBarIcon: ({ color }) => <TabIcon name="search" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="stats"
//         options={{
//           title: "Stats",
//           tabBarIcon: ({ color }) => <TabIcon name="bar-chart" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color }: { name: IoniconsName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom, // ← respeta navegación del celular
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
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <TabIcon name="bar-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color }) => <TabIcon name="people" color={color} />,
        }}
      />
    </Tabs>
  );
}
