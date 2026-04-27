// import React, { memo } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
// import { GameEntry } from "../types/game";
// import { colors, spacing, radius } from "../constants/theme";

// const STATUS_COLORS: Record<string, string> = {
//   backlog: colors.foregroundMuted,
//   playing: colors.primary,
//   completed: colors.success,
//   dropped: colors.danger,
//   wishlist: colors.warning,
// };

// type Props = {
//   item: GameEntry;
//   onPress: (item: GameEntry) => void;
// };

// function GameCard({ item, onPress }: Props) {
//   return (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => onPress(item)}
//       activeOpacity={0.7}
//     >
//       {item.cover_url ? (
//         <Image
//           source={{ uri: item.cover_url }}
//           style={styles.cover}
//           resizeMode="cover"
//         />
//       ) : (
//         <View style={styles.coverPlaceholder}>
//           <Text style={styles.coverPlaceholderText}>?</Text>
//         </View>
//       )}

//       <View style={styles.info}>
//         <Text style={styles.title} numberOfLines={2}>
//           {item.title}
//         </Text>
//         {item.release_year && (
//           <Text style={styles.year}>{item.release_year}</Text>
//         )}
//         <View style={styles.footer}>
//           <View
//             style={[
//               styles.statusDot,
//               { backgroundColor: STATUS_COLORS[item.status] },
//             ]}
//           />
//           <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>
//             {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
//           </Text>
//         </View>
//       </View>

//       {item.personal_rating && (
//         <Text style={styles.rating}>⭐ {item.personal_rating}</Text>
//       )}
//     </TouchableOpacity>
//   );
// }

// export default memo(GameCard);

// const styles = StyleSheet.create({
//   card: {
//     flexDirection: "row",
//     backgroundColor: colors.card,
//     borderRadius: radius.md,
//     marginHorizontal: spacing.md,
//     marginBottom: spacing.sm,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   cover: {
//     width: 70,
//     height: 95,
//   },
//   coverPlaceholder: {
//     width: 70,
//     height: 95,
//     backgroundColor: colors.cardElevated,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   coverPlaceholderText: {
//     color: colors.foregroundMuted,
//     fontSize: 24,
//   },
//   info: {
//     flex: 1,
//     padding: spacing.sm,
//     justifyContent: "space-between",
//   },
//   title: {
//     color: colors.foreground,
//     fontSize: 15,
//     fontFamily: fontFamily.sansSemibold,
//   },
//   year: {
//     color: colors.foregroundMuted,
//     fontSize: 12,
//     marginTop: 2,
//   },
//   footer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: spacing.xs,
//   },
//   statusDot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//   },
//   status: {
//     fontSize: 12,
//     fontFamily: fontFamily.sansMedium,
//   },
//   rating: {
//     color: colors.warning,
//     fontSize: 13,
//     padding: spacing.sm,
//     alignSelf: "flex-start",
//   },
// });
import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { GameEntry } from "../types/game";
import { colors, spacing, radius } from "../constants/theme";
import { fontFamily } from "../constants/typography";

const STATUS_COLORS: Record<string, string> = {
  backlog: colors.foregroundMuted,
  playing: colors.primary,
  "playing-social": colors.statusPlayingSocial,
  completed: colors.success,
  dropped: colors.danger,
  wishlist: colors.warning,
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  playing: "Playing",
  "playing-social": "Playing (Social)",
  completed: "Completed",
  dropped: "Dropped",
  wishlist: "Wishlist",
};

type Props = {
  item: GameEntry;
  onPress: (item: GameEntry) => void;
};

function GameCard({ item, onPress }: Props) {
  const game = item.game;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {game?.coverUrl ? (
        <Image
          source={{ uri: game.coverUrl }}
          style={styles.cover}
          contentFit="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverPlaceholderText}>?</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {game?.title ?? "Unknown"}
        </Text>

        {game?.releaseYear && (
          <Text style={styles.year}>{game.releaseYear}</Text>
        )}

        <View style={styles.footer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[item.status] },
            ]}
          />
          <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>
            {STATUS_LABELS[item.status] ?? item.status}
          </Text>

          {item.platform && (
            <Text style={styles.platform}>· {item.platform.shortName}</Text>
          )}
        </View>
      </View>

      {item.personalRating && (
        <Text style={styles.rating}>⭐ {item.personalRating}</Text>
      )}
    </TouchableOpacity>
  );
}

export default memo(GameCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cover: {
    width: 70,
    height: 95,
  },
  coverPlaceholder: {
    width: 70,
    height: 95,
    backgroundColor: colors.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  coverPlaceholderText: {
    color: colors.foregroundMuted,
    fontSize: 24,
  },
  info: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: "space-between",
  },
  title: {
    color: colors.foreground,
    fontSize: 15,
    fontFamily: fontFamily.sansSemibold,
  },
  year: {
    color: colors.foregroundMuted,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  status: {
    fontSize: 12,
    fontFamily: fontFamily.sansMedium,
  },
  platform: {
    fontSize: 12,
    color: colors.foregroundMuted,
  },
  rating: {
    color: colors.warning,
    fontSize: 13,
    fontFamily: fontFamily.mono,
    fontVariant: ["tabular-nums"],
    padding: spacing.sm,
    alignSelf: "flex-start",
  },
});
