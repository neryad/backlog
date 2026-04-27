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

const DONATION_LABELS = ["Ko-fi", "PayPal"];
const LINKS = [
  {
    label: "Twitter / X",
    handle: "@NeryadG",
    url: "https://x.com/NeryadG",
    icon: "logo-twitter" as const,
    color: "#1DA1F2",
  },
  {
    label: "Instagram",
    handle: "@neryad_dev",
    url: "https://www.instagram.com/neryad_dev",
    icon: "logo-instagram" as const,
    color: "#E1306C",
  },
  {
    label: "GitHub",
    handle: "neryad",
    url: "https://github.com/neryad",
    icon: "logo-github" as const,
    color: colors.text,
  },
  {
    label: "Ko-fi",
    handle: "Buy me a coffee",
    url: "https://ko-fi.com/neryad",
    icon: "cafe" as const,
    color: "#FF5E5B",
  },
  {
    label: "PayPal",
    handle: "Donate via PayPal",
    url: "https://paypal.me/neryad",
    icon: "card" as const,
    color: "#003087",
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AboutModal({ visible, onClose }: Props) {
  const { session } = useAuthStore();
  const [deletingAccount, setDeletingAccount] = useState(false);

  function openLink(url: string) {
    Linking.openURL(url).catch(() => null);
  }

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
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
        Alert.alert(
          "Delete failed",
          error.message ?? "We could not delete your account right now.",
        );
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      onClose();
      router.replace("/auth/login");

      Alert.alert(
        "Account deleted",
        "Your full cloud account was removed. Local backlog and stats stay on this device.",
      );
    } catch (error) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => null);
      Alert.alert(
        "Delete failed",
        error instanceof Error
          ? error.message
          : "We could not delete your account right now.",
      );
    } finally {
      setDeletingAccount(false);
    }
  }

  function handleDeleteAccount() {
    if (!session || deletingAccount) return;

    Alert.alert(
      "Delete account",
      "This will permanently delete your cloud account. You will not be able to sign in again with this account. Local backlog and stats on this device will stay.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert("Final confirmation", "This action cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete account",
                style: "destructive",
                onPress: confirmDeleteAccount,
              },
            ]);
          },
        },
      ],
    );
  }

  function handleLogin() {
    onClose();
    router.push("/auth/login");
  }

  function handleRegister() {
    onClose();
    router.push("/auth/register");
  }

  const visibleLinks =
    Platform.OS === "ios"
      ? LINKS.filter((link) => !DONATION_LABELS.includes(link.label))
      : LINKS;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* App info */}
            <View style={styles.appInfo}>
              <View style={styles.appIcon}>
                <ExpoImage
                  source={require("../../../assets/icons/ios-dark.jpg")}
                  style={styles.appIconImage}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.appName}>Playlogged</Text>
              <Text style={styles.appVersion}>
                Version {Constants.expoConfig?.version ?? "1.0.0"}
              </Text>
              <Text style={styles.appDesc}>
                A minimal game backlog tracker built for gamers who want to
                spend more time playing and less time managing lists.
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Account section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Account</Text>
              {session ? (
                <View style={styles.accountRow}>
                  <View style={styles.accountInfo}>
                    <Ionicons
                      name="person-circle"
                      size={36}
                      color={colors.primary}
                    />
                    <View>
                      <Text style={styles.accountEmail}>
                        {session.user.email}
                      </Text>
                      <Text style={styles.accountStatus}>Syncing backlog</Text>
                    </View>
                  </View>
                  <View style={styles.accountActions}>
                    <TouchableOpacity
                      style={styles.gamingIdsBtn}
                      onPress={() => {
                        onClose();
                        router.push("/profile/edit-platforms");
                      }}
                    >
                      <Text style={styles.gamingIdsText}>Gaming IDs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.logoutBtn}
                      onPress={handleLogout}
                      disabled={deletingAccount}
                    >
                      <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteAccountBtn}
                      onPress={handleDeleteAccount}
                      disabled={deletingAccount}
                    >
                      <Text style={styles.deleteAccountText}>
                        {deletingAccount ? "Deleting..." : "Delete Account"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.authButtons}>
                  <Text style={styles.authDesc}>
                    Create an account to sync your backlog and connect with
                    friends.
                  </Text>
                  <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.signInText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.registerBtn}
                    onPress={handleRegister}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.registerText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Developer */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Developer</Text>
              <Text style={styles.devName}>Neryad</Text>
              <Text style={styles.devBio}>
                Building tools for gamers. If you enjoy the app, consider
                supporting the project.
              </Text>
            </View>

            {/* Links */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Find me online</Text>
              {visibleLinks.map((link) => (
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
  appIconImage: {
    width: 80,
    height: 80,
    borderRadius: 18,
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
  // Account
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  accountEmail: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  accountStatus: {
    color: colors.primary,
    fontSize: 12,
  },
  gamingIdsBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + "22",
  },
  gamingIdsText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  logoutBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  accountActions: {
    gap: spacing.xs,
    alignItems: "flex-end",
  },
  deleteAccountBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.danger + "22",
  },
  deleteAccountText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  authButtons: {
    gap: spacing.sm,
  },
  authDesc: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  signInText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  registerBtn: {
    backgroundColor: "transparent",
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  registerText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  // Developer
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
