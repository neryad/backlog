import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";

const LINKS = [
  {
    label: "Twitter / X",
    handle: "@yourhandle",
    url: "https://twitter.com/yourhandle",
    icon: "logo-twitter" as const,
    color: "#1DA1F2",
  },
  {
    label: "Instagram",
    handle: "@yourhandle",
    url: "https://instagram.com/yourhandle",
    icon: "logo-instagram" as const,
    color: "#E1306C",
  },
  {
    label: "GitHub",
    handle: "yourhandle",
    url: "https://github.com/yourhandle",
    icon: "logo-github" as const,
    color: colors.text,
  },
  {
    label: "Ko-fi",
    handle: "Buy me a coffee",
    url: "https://ko-fi.com/yourhandle",
    icon: "cafe" as const,
    color: "#FF5E5B",
  },
  {
    label: "PayPal",
    handle: "Donate via PayPal",
    url: "https://paypal.me/yourhandle",
    icon: "card" as const,
    color: "#003087",
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AboutModal({ visible, onClose }: Props) {
  function openLink(url: string) {
    Linking.openURL(url).catch(() => null);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* App info */}
            <View style={styles.appInfo}>
              <View style={styles.appIcon}>
                <Ionicons
                  name="game-controller"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.appName}>Playlogged</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDesc}>
                A minimal game backlog tracker built for gamers who want to
                spend more time playing and less time managing lists.
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Developer */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Developer</Text>
              <Text style={styles.devName}>Your Name</Text>
              <Text style={styles.devBio}>
                Building tools for gamers. If you enjoy the app, consider
                supporting the project.
              </Text>
            </View>

            {/* Links */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Find me online</Text>
              {LINKS.map((link) => (
                <TouchableOpacity
                  key={link.label}
                  style={styles.linkRow}
                  onPress={() => openLink(link.url)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.linkIcon,
                      { backgroundColor: link.color + "22" },
                    ]}
                  >
                    <Ionicons name={link.icon} size={18} color={link.color} />
                  </View>
                  <View style={styles.linkInfo}>
                    <Text style={styles.linkLabel}>{link.label}</Text>
                    <Text style={styles.linkHandle}>{link.handle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Made with ❤️ for gamers everywhere
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  closeBtn: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  appName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  appVersion: {
    color: colors.textMuted,
    fontSize: 13,
  },
  appDesc: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  devName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  devBio: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  linkInfo: {
    flex: 1,
  },
  linkLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  linkHandle: {
    color: colors.textMuted,
    fontSize: 12,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
