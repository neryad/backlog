import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabase";
import { colors, spacing, radius } from "../../src/constants/theme";
import { fontFamily } from "../../src/constants/typography";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [dataExpanded, setDataExpanded] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  function getFriendlyAuthError(message: string) {
    const normalized = message.toLowerCase();
    if (
      normalized.includes("already registered") ||
      normalized.includes("already exists") ||
      normalized.includes("user already registered") ||
      normalized.includes("email")
    ) {
      return "Email already registered. Please sign in.";
    }
    return message;
  }

  async function handleRegister() {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedEmail || !normalizedUsername || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (normalizedUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      setError("Username can only contain letters, numbers and underscores.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", normalizedUsername)
      .single();

    if (existing) {
      setError("Username already taken.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: process.env.EXPO_PUBLIC_APP_URL,
        data: {
          username: normalizedUsername,
          display_name: normalizedUsername,
        },
      },
    });

    setLoading(false);
    if (error) {
      setError(getFriendlyAuthError(error.message));
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Create an account to enable cloud sync, backups, and community features
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.foregroundMuted}
          value={email}
          onChangeText={(t) => setEmail(t.trim().toLowerCase())}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => usernameRef.current?.focus()}
          submitBehavior="submit"
        />

        <View>
          <TextInput
            ref={usernameRef}
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.foregroundMuted}
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase())}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
          <Text style={styles.hint}>Letters, numbers and underscores only.</Text>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            ref={passwordRef}
            style={styles.passwordInput}
            placeholder="Password (min. 8 characters)"
            placeholderTextColor={colors.foregroundMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            submitBehavior="submit"
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.foregroundMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            ref={confirmRef}
            style={styles.passwordInput}
            placeholder="Confirm password"
            placeholderTextColor={colors.foregroundMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowConfirm((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showConfirm ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.foregroundMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.consentSection}>
          <TouchableOpacity
            style={styles.consentHeader}
            onPress={() => setDataExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={dataExpanded ? "chevron-down" : "chevron-forward"}
              size={16}
              color={colors.foregroundMuted}
            />
            <Text style={styles.consentHeaderText}>Data & Privacy</Text>
          </TouchableOpacity>

          {dataExpanded && (
            <View style={styles.consentBody}>
              <Text style={styles.consentBodyText}>
                When you create an account, the following data will be synced to
                the cloud to enable cross-device backup and community features:
              </Text>
              <View style={styles.dataList}>
                <Text style={styles.dataItem}>
                  • Email address (authentication only)
                </Text>
                <Text style={styles.dataItem}>
                  • Username and display name (visible in public reviews)
                </Text>
                <Text style={styles.dataItem}>
                  • Game library: titles, statuses, ratings, notes, hours played
                </Text>
                <Text style={styles.dataItem}>
                  • Platform IDs (PSN, Xbox, Steam, etc.)
                </Text>
              </View>
              <Text style={styles.consentBodyText}>
                Public reviews are optional — you control which entries are
                visible per-game.
              </Text>
              <Text style={styles.consentBodyText}>
                You can delete your account and all associated data at any time.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConsentChecked((v) => !v)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={consentChecked ? "checkbox" : "square-outline"}
            size={20}
            color={consentChecked ? colors.primary : colors.foregroundMuted}
          />
          <Text style={styles.checkboxLabel}>
            I agree to the{" "}
            <Text
              style={styles.linkAccent}
              onPress={() =>
                Linking.openURL("https://playlogged.neryad.dev/terms")
              }
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={styles.linkAccent}
              onPress={() =>
                Linking.openURL("https://playlogged.neryad.dev/privacy")
              }
            >
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, !consentChecked && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading || !consentChecked}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkAccent}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    padding: spacing.lg,
    justifyContent: "center",
    flexGrow: 1,
    gap: spacing.md,
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontFamily: fontFamily.displayBold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.foregroundMuted,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.foreground,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    color: colors.foreground,
    padding: spacing.md,
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
  },
  hint: {
    color: colors.foregroundMuted,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  btnText: {
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fontFamily.sansSemibold,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
  },
  link: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  linkText: {
    color: colors.foregroundMuted,
    fontSize: 14,
  },
  linkAccent: {
    color: colors.primary,
    fontFamily: fontFamily.sansSemibold,
  },
  consentSection: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  consentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  consentHeaderText: {
    color: colors.foregroundMuted,
    fontSize: 13,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  consentBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  consentBodyText: {
    color: colors.foregroundMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  dataList: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 2,
  },
  dataItem: {
    color: colors.foregroundMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  checkboxLabel: {
    color: colors.foregroundMuted,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
