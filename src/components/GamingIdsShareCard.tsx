import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { APP_NAME, BacklogShareTemplate, BACKLOG_TEMPLATE_PALETTE } from "../constants/shareCardThemes";
import { colors } from "../constants/colors";

type Props = {
  username: string;
  ids: {
    psn_id?: string | null;
    xbox_gamertag?: string | null;
    switch_code?: string | null;
    steam_id?: string | null;
    epic_id?: string | null;
  };
  template?: BacklogShareTemplate;
};

const PLATFORMS = [
  { key: "psn_id" as const,       label: "PlayStation", badge: "PS",  color: colors.platformPSN },
  { key: "xbox_gamertag" as const, label: "Xbox",        badge: "XB",  color: colors.platformXbox },
  { key: "switch_code" as const,   label: "Switch",      badge: "NSW", color: colors.platformSwitch },
  { key: "steam_id" as const,      label: "Steam",       badge: "STM", color: colors.platformSteam },
  { key: "epic_id" as const,       label: "Epic Games",  badge: "EPC", color: colors.platformEpic },
];

export function GamingIdsShareCard({ username, ids, template = "neon" }: Props) {
  const palette = BACKLOG_TEMPLATE_PALETTE[template];
  const activePlatforms = PLATFORMS.filter((p) => ids[p.key]);

  return (
    <View style={[styles.card, { backgroundColor: palette.cardBg, borderColor: palette.border }]}>
      <View style={[styles.glowTop, { backgroundColor: palette.glowTop }]} />
      <View style={[styles.glowBottom, { backgroundColor: palette.glowBottom }]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appName, { color: palette.kicker }]}>{APP_NAME}</Text>
        <Text style={styles.headline}>Find me on</Text>
        <Text style={[styles.username, { color: palette.kicker }]}>@{username}</Text>
      </View>

      {/* Platform rows */}
      <View style={styles.list}>
        {activePlatforms.map((p) => (
          <View key={p.key} style={[styles.row, { backgroundColor: palette.rowBg, borderColor: palette.rowBorder }]}>
            <View style={[styles.badge, { backgroundColor: p.color + "22" }]}>
              <Text style={[styles.badgeText, { color: p.color }]}>{p.badge}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.platformLabel, { color: palette.kicker }]}>{p.label}</Text>
              <Text style={styles.platformId}>{ids[p.key]}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <Text style={[styles.footer, { color: palette.kicker }]}>playlogged.neryad.dev</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    overflow: "hidden",
    gap: 24,
  },
  glowTop: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  glowBottom: {
    position: "absolute",
    bottom: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  header: {
    gap: 4,
  },
  appName: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  headline: {
    color: colors.primaryForeground,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.85,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  platformLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    opacity: 0.7,
  },
  platformId: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.5,
    letterSpacing: 0.5,
  },
});
