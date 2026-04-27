// // import React, { memo } from "react";
// // import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
// // import { GameStatus } from "../types/game";
// // import { colors, spacing, radius } from "../constants/theme";

// // const FILTERS: { label: string; value: GameStatus | "all" }[] = [
// //   { label: "All", value: "all" },
// //   { label: "Backlog", value: "backlog" },
// //   { label: "Playing", value: "playing" },
// //   { label: "Completed", value: "completed" },
// //   { label: "Dropped", value: "dropped" },
// //   { label: "Wishlist", value: "wishlist" },
// // ];

// // type Props = {
// //   active: GameStatus | "all";
// //   onChange: (value: GameStatus | "all") => void;
// // };

// // function FilterBar({ active, onChange }: Props) {
// //   return (
// //     <ScrollView
// //       horizontal
// //       showsHorizontalScrollIndicator={false}
// //       contentContainerStyle={styles.container}
// //     >
// //       {FILTERS.map((f) => (
// //         <TouchableOpacity
// //           key={f.value}
// //           style={[styles.chip, active === f.value && styles.chipActive]}
// //           onPress={() => onChange(f.value)}
// //           activeOpacity={0.7}
// //         >
// //           <Text
// //             style={[styles.label, active === f.value && styles.labelActive]}
// //           >
// //             {f.label}
// //           </Text>
// //         </TouchableOpacity>
// //       ))}
// //     </ScrollView>
// //   );
// // }

// // export default memo(FilterBar);

// // const styles = StyleSheet.create({
// //   container: {
// //     paddingHorizontal: spacing.md,
// //     paddingVertical: spacing.sm,
// //     gap: spacing.sm,
// //   },
// //   chip: {
// //     paddingHorizontal: spacing.md,
// //     paddingVertical: spacing.xs + 2,
// //     borderRadius: radius.lg,
// //     backgroundColor: colors.card,
// //     borderWidth: 1,
// //     borderColor: colors.border,
// //   },
// //   chipActive: {
// //     backgroundColor: colors.primary,
// //     borderColor: colors.primary,
// //   },
// //   label: {
// //     color: colors.foregroundMuted,
// //     fontSize: 13,
// //     fontFamily: fontFamily.sansMedium,
// //   },
// //   labelActive: {
// //     color: colors.foreground,
// //   },
// // });
// import React, { memo } from "react";
// import {
//   ScrollView,
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   View,
// } from "react-native";
// import { GameStatus, GameEntry } from "../types/game";
// import { colors, spacing, radius } from "../constants/theme";

// const FILTERS: { label: string; value: GameStatus | "all" }[] = [
//   { label: "All", value: "all" },
//   { label: "Backlog", value: "backlog" },
//   { label: "Playing", value: "playing" },
//   { label: "Completed", value: "completed" },
//   { label: "Dropped", value: "dropped" },
//   { label: "Wishlist", value: "wishlist" },
// ];

// type Props = {
//   active: GameStatus | "all";
//   onChange: (value: GameStatus | "all") => void;
//   games: GameEntry[];
// };

// function getCount(games: GameEntry[], value: GameStatus | "all"): number {
//   if (value === "all") return games.length;
//   return games.filter((g) => g.status === value).length;
// }

// function FilterBar({ active, onChange, games }: Props) {
//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={styles.container}
//     >
//       {FILTERS.map((f) => {
//         const count = getCount(games, f.value);
//         if (f.value !== "all" && count === 0) return null;

//         return (
//           <TouchableOpacity
//             key={f.value}
//             style={[styles.chip, active === f.value && styles.chipActive]}
//             onPress={() => onChange(f.value)}
//             activeOpacity={0.7}
//           >
//             <Text
//               style={[styles.label, active === f.value && styles.labelActive]}
//             >
//               {f.label}
//             </Text>
//             <View
//               style={[styles.badge, active === f.value && styles.badgeActive]}
//             >
//               <Text
//                 style={[
//                   styles.badgeText,
//                   active === f.value && styles.badgeTextActive,
//                 ]}
//               >
//                 {count}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   );
// }

// export default memo(FilterBar);

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     gap: spacing.sm,
//   },
//   chip: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.xs + 2,
//     borderRadius: radius.lg,
//     backgroundColor: colors.card,
//     borderWidth: 1,
//     borderColor: colors.border,
//     gap: spacing.xs,
//   },
//   chipActive: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   label: {
//     color: colors.foregroundMuted,
//     fontSize: 13,
//     fontFamily: fontFamily.sansMedium,
//   },
//   labelActive: {
//     color: colors.foreground,
//   },
//   badge: {
//     backgroundColor: colors.cardElevated,
//     borderRadius: 10,
//     paddingHorizontal: 6,
//     paddingVertical: 1,
//   },
//   badgeActive: {
//     backgroundColor: colors.surfaceOverlayMd,
//   },
//   badgeText: {
//     color: colors.foregroundMuted,
//     fontSize: 11,
//     fontFamily: fontFamily.sansSemibold,
//   },
//   badgeTextActive: {
//     color: colors.foreground,
//   },
// });
import React, { memo } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { GameStatus, GameEntry } from "../types/game";
import { colors, spacing, radius } from "../constants/theme";
import { fontFamily } from "../constants/typography";

const FILTERS: { label: string; value: GameStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Backlog", value: "backlog" },
  { label: "Playing", value: "playing" },
  { label: "Social", value: "playing-social" },
  { label: "Completed", value: "completed" },
  { label: "Dropped", value: "dropped" },
  { label: "Wishlist", value: "wishlist" },
];

type Props = {
  active: GameStatus | "all";
  onChange: (value: GameStatus | "all") => void;
  games: GameEntry[];
};

function getCount(games: GameEntry[], value: GameStatus | "all"): number {
  if (value === "all") return games.length;
  return games.filter((g) => g.status === value).length;
}

function FilterBar({ active, onChange, games }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const count = getCount(games, f.value);
        if (f.value !== "all" && count === 0) return null;
        const isActive = active === f.value;

        return (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(f.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {f.label}
            </Text>
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text
                style={[styles.badgeText, isActive && styles.badgeTextActive]}
              >
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default memo(FilterBar);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.foregroundMuted,
    fontSize: 13,
    fontFamily: fontFamily.sansMedium,
  },
  labelActive: {
    color: colors.foreground,
  },
  badge: {
    backgroundColor: colors.cardElevated,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeActive: {
    backgroundColor: colors.surfaceOverlayMd,
  },
  badgeText: {
    color: colors.foregroundMuted,
    fontSize: 11,
    fontFamily: fontFamily.sansSemibold,
  },
  badgeTextActive: {
    color: colors.foreground,
  },
});
