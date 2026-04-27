import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { colors, spacing, radius } from "../../src/constants/theme";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/auth.store";

type PlatformIds = {
  psn_id: string;
  xbox_gamertag: string;
  switch_code: string;
  steam_id: string;
  epic_id: string;
};

const PLATFORMS: {
  key: keyof PlatformIds;
  label: string;
  placeholder: string;
  badge: string;
  color: string;
}[] = [
  { key: "psn_id", label: "PlayStation Network", placeholder: "PSN ID", badge: "PS", color: "#0070D1" },
  { key: "xbox_gamertag", label: "Xbox", placeholder: "Gamertag", badge: "XB", color: "#107C10" },
  { key: "switch_code", label: "Nintendo Switch", placeholder: "SW-XXXX-XXXX-XXXX", badge: "NSW", color: "#E60012" },
  { key: "steam_id", label: "Steam", placeholder: "Username", badge: "STM", color: "#66C0F4" },
  { key: "epic_id", label: "Epic Games", placeholder: "Display Name", badge: "EPC", color: "#c8c8c8" },
];

export default function EditPlatformsScreen() {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ids, setIds] = useState<PlatformIds>({
    psn_id: "",
    xbox_gamertag: "",
    switch_code: "",
    steam_id: "",
    epic_id: "",
  });

  useEffect(() => {
    loadPlatformIds();
  }, []);

  async function loadPlatformIds() {
    if (!session) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("psn_id, xbox_gamertag, switch_code, steam_id, epic_id")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setIds({
          psn_id: data.psn_id ?? "",
          xbox_gamertag: data.xbox_gamertag ?? "",
          switch_code: data.switch_code ?? "",
          steam_id: data.steam_id ?? "",
          epic_id: data.epic_id ?? "",
        });
      }
    } catch (err) {
      if (__DEV__) console.error("loadPlatformIds error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          psn_id: ids.psn_id.trim() || null,
          xbox_gamertag: ids.xbox_gamertag.trim() || null,
          switch_code: ids.switch_code.trim() || null,
          steam_id: ids.steam_id.trim() || null,
          epic_id: ids.epic_id.trim() || null,
        })
        .eq("id", session.user.id);

      if (error) {
        Alert.alert("Error", "Could not save your gaming IDs.");
        if (__DEV__) console.error("savePlatformIds error:", error.message);
      } else {
        Alert.alert("Saved", "Your gaming profiles have been updated.");
      }
    } catch (err) {
      if (__DEV__) console.error("savePlatformIds error:", err);
      Alert.alert("Error", "Could not save your gaming IDs.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Gaming Profiles" }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Add your IDs so friends can find you on other platforms.
        </Text>

        {PLATFORMS.map((platform) => (
          <View key={platform.key} style={styles.platformRow}>
            <View style={[styles.badge, { backgroundColor: platform.color + "22" }]}>
              <Text style={[styles.badgeText, { color: platform.color }]}>
                {platform.badge}
              </Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.platformLabel}>{platform.label}</Text>
              <TextInput
                style={styles.input}
                value={ids[platform.key]}
                onChangeText={(t) =>
                  setIds((prev) => ({ ...prev, [platform.key]: t }))
                }
                placeholder={platform.placeholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flex: 1,
    gap: 4,
  },
  platformLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  saveBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
