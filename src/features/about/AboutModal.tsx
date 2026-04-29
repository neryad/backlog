
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Constants from "expo-constants";
import { colors, spacing, radius } from "../../constants/theme";
import { Image as ExpoImage } from "expo-image";
import { useAuthStore } from "../../store/auth.store";
import { supabase } from "../../lib/supabase";
import { fontFamily } from "../../constants/typography";

const DONATION_LABELS = ["Ko-fi", "PayPal"];

const LINKS = [
  {
    label: "Twitter / X",
    handle: "@NeryadG",
    url: "https://x.com/NeryadG",
    icon: "logo-twitter" as const,
    color: colors.socialTwitter,
  },
  {
    label: "Instagram",
    handle: "@neryad_dev",
    url: "https://www.instagram.com/neryad_dev",
    icon: "logo-instagram" as const,
    color: colors.socialInstagram,
  },
  {
    label: "GitHub",
    handle: "neryad",
    url: "https://github.com/neryad",
    icon: "logo-github" as const,
    color: colors.foreground,
  },
  {
    label: "Ko-fi",
    handle: "Buy me a coffee",
    url: "https://ko-fi.com/neryad",
    icon: "cafe" as const,
    color: colors.socialKofi,
  },
  {
    label: "PayPal",
    handle: "Donate via PayPal",
    url: "https://paypal.me/neryad",
    icon: "card" as const,
    color: colors.socialPaypal,
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AboutModal({ visible, onClose }: Props) {
  const { session } = useAuthStore();
  const [deletingAccount, setDeletingAccount] = useState(false);

  const visibleLinks =
    Platform.OS === "ios"
      ? LINKS.filter((l) => !DONATION_LABELS.includes(l.label))
      : LINKS;

  function openLink(url: string) {
    Linking.openURL(url).catch(() => null);
  }

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          onClose();
        },
      },
    ]);
  }

  async function confirmDeleteAccount() {
    if (!session || deletingAccount) return;

    setDeletingAccount(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      onClose();
      router.replace("/auth/login");

      Alert.alert("Account deleted", "Your account was removed.");
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setDeletingAccount(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ],
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.foregroundMuted} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <View style={styles.header}>
              <ExpoImage
                source={require("../../../assets/icons/ios-dark.jpg")}
                style={styles.appIcon}
              />
              <Text style={styles.appName}>Playlogged</Text>
              <Text style={styles.version}>
                v{Constants.expoConfig?.version ?? "1.0.0"}
              </Text>
              <Text style={styles.description}>
                Track your backlog. Play more, manage less.
              </Text>
            </View>

            {/* ACCOUNT */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Account</Text>

              {session ? (
                <>
                  <View style={styles.accountRow}>
                    <Ionicons
                      name="person-circle"
                      size={36}
                      color={colors.primary}
                    />
                    <Text style={styles.email} numberOfLines={1}>
                      {session.user.email}
                    </Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => {
                        onClose();
                        router.push("/profile/edit-platforms");
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Gaming IDs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={handleLogout}
                    >
                      <Text style={styles.secondaryBtnText}>Sign Out</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.dangerBtn}
                    onPress={handleDeleteAccount}
                  >
                    <Text style={styles.dangerText}>
                      {deletingAccount ? "Deleting..." : "Delete Account"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.helper}>
                    Create an account to sync and add friends
                  </Text>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                      onClose();
                      router.push("/auth/login");
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      onClose();
                      router.push("/auth/register");
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* LINKS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Links</Text>

              {visibleLinks.map((link) => (
                <TouchableOpacity
                  key={link.label}
                  style={styles.linkRow}
                  onPress={() => openLink(link.url)}
                >
                  <Ionicons name={link.icon} size={18} color={link.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkLabel}>{link.label}</Text>
                    <Text style={styles.linkHandle}>{link.handle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.foregroundMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.footer}>
              Made for gamers 🎮
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
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.md,
    borderRadius: 2,
  },
  closeBtn: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg,
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: spacing.sm,
  },
  appName: {
    color: colors.foreground,
    fontSize: 22,
    fontFamily: fontFamily.displayBold,
  },
  version: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },
  description: {
    color: colors.foregroundMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    color: colors.foregroundMuted,
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  email: {
    color: colors.foreground,
    flex: 1,
  },

  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  primaryBtnText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansSemibold,
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: colors.foreground,
  },

  dangerBtn: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.danger + "22",
    alignItems: "center",
  },
  dangerText: {
    color: colors.danger,
  },

  helper: {
    color: colors.foregroundMuted,
    marginBottom: spacing.sm,
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  linkLabel: {
    color: colors.foreground,
  },
  linkHandle: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },

  footer: {
    textAlign: "center",
    color: colors.foregroundMuted,
    marginTop: spacing.lg,
  },
});