import React from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";
import { generateAvatarUrl } from "../utils/avatar";

interface AvatarProps {
  avatarUrl: string | null | undefined;
  username: string | null | undefined;
  displayName?: string | null;
  size?: number;
  style?: any;
}

export function Avatar({
  avatarUrl,
  username,
  displayName,
  size = 80,
  style,
}: AvatarProps) {
  const borderRadius = size / 2;
  const fallbackAvatarUrl = generateAvatarUrl(username, displayName);
  const source = avatarUrl || fallbackAvatarUrl;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: source }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius,
          },
        ]}
        onError={() => {
          // Fallback to icon if image fails to load
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: colors.primary + "22",
  },
  image: {
    backgroundColor: colors.primary + "22",
  },
});
