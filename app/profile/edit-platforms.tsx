import { useState, useEffect, useRef, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../src/constants/theme";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/auth.store";
import { useUIStore } from "../../src/store/ui.store";
import { GamingIdsShareCard } from "../../src/components/GamingIdsShareCard";
import { shareViewAsImage } from "../../src/utils/share";
import { BACKLOG_SHARE_TEMPLATES } from "../../src/constants/shareCardThemes";
import { fontFamily } from "../../src/constants/typography";

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
  { key: "psn_id", label: "PlayStation Network", placeholder: "PSN ID", badge: "PS", color: colors.platformPSN },
  { key: "xbox_gamertag", label: "Xbox", placeholder: "Gamertag", badge: "XB", color: colors.platformXbox },
  { key: "switch_code", label: "Nintendo Switch", placeholder: "SW-XXXX-XXXX-XXXX", badge: "NSW", color: colors.platformSwitch },
  { key: "steam_id", label: "Steam", placeholder: "Username", badge: "STM", color: colors.platformSteam },
  { key: "epic_id", label: "Epic Games", placeholder: "Display Name", badge: "EPC", color: colors.platformEpic },
];

export default function EditPlatformsScreen() {
  const { session } = useAuthStore();
  const { shareTemplate, setShareTemplate } = useUIStore();
  const shareCardRef = useRef<View>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [username, setUsername] = useState("");
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
        .select("username, psn_id, xbox_gamertag, switch_code, steam_id, epic_id")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setUsername(data.username ?? "");
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

  const hasAnyId = PLATFORMS.some((p) => ids[p.key].trim());

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current || isSharing) return;
    if (!hasAnyId) {
      Alert.alert("No IDs to share", "Add at least one gaming ID first.");
      return;
    }
    try {
      setIsSharing(true);
      await shareViewAsImage(shareCardRef, {
        dialogTitle: "Share your gaming IDs",
        width: 1080,
        height: 1080,
      });
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, hasAnyId]);

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
                placeholderTextColor={colors.foregroundMuted}
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
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>

        {/* Share section */}
        {hasAnyId && (
          <View style={styles.shareSection}>
            <View style={styles.shareHeaderRow}>
              <View>
                <Text style={styles.shareSectionTitle}>Share Gaming IDs</Text>
                <Text style={styles.shareSectionSub}>
                  Let your friends find you everywhere
                </Text>
              </View>
              <TouchableOpacity
                style={styles.shareToggleBtn}
                onPress={() => setShowSharePreview((v) => !v)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={showSharePreview ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.foreground}
                />
                <Text style={styles.shareToggleText}>
                  {showSharePreview ? "Hide" : "Preview"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.sharePreviewFrame,
                !showSharePreview && styles.sharePreviewHidden,
              ]}
            >
              <View ref={shareCardRef} collapsable={false}>
                <GamingIdsShareCard
                  username={username}
                  ids={ids}
                  template={shareTemplate}
                />
              </View>
            </View>

            {showSharePreview && (
              <View style={styles.templateRow}>
                {BACKLOG_SHARE_TEMPLATES.map((option) => {
                  const isActive = option.value === shareTemplate;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.templateChip, isActive && styles.templateChipActive]}
                      onPress={() => setShareTemplate(option.value)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.templateChipText, isActive && styles.templateChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {!showSharePreview && (
              <Text style={styles.shareHintText}>
                Open Preview to review the card and change style
              </Text>
            )}

            <TouchableOpacity
              style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
              onPress={handleShare}
              disabled={isSharing}
              activeOpacity={0.8}
            >
              <Text style={styles.shareBtnText}>
                {isSharing ? "Generating..." : "Share Gaming IDs Card"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: spacing.xl * 2,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: colors.foregroundMuted,
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
    fontFamily: fontFamily.sansBold,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flex: 1,
    gap: 4,
  },
  platformLabel: {
    color: colors.foregroundMuted,
    fontSize: 11,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.foreground,
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
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fontFamily.sansSemibold,
  },
  shareSection: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  shareHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  shareSectionTitle: {
    color: colors.foregroundMuted,
    fontSize: 11,
    fontFamily: fontFamily.sansSemibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  shareSectionSub: {
    color: colors.foregroundMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  shareToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareToggleText: {
    color: colors.foreground,
    fontSize: 12,
    fontFamily: fontFamily.sansSemibold,
  },
  sharePreviewFrame: {
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  sharePreviewHidden: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    pointerEvents: "none",
  },
  templateRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  templateChip: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  templateChipActive: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.primary,
  },
  templateChipText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    fontFamily: fontFamily.sansSemibold,
  },
  templateChipTextActive: {
    color: colors.foreground,
  },
  shareHintText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  shareBtnDisabled: {
    opacity: 0.7,
  },
  shareBtnText: {
    color: colors.foreground,
    fontFamily: fontFamily.sansBold,
    fontSize: 15,
  },
});
