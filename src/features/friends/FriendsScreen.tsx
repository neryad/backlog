import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { useFriends } from "./useFriends";
import { Friend, FriendRequest } from "../../types/friends";

export default function FriendsScreen() {
  const {
    profile,
    friends,
    pendingRequests,
    shareInviteLink,
    handleAccept,
    handleReject,
    handleRemoveFriend,
    handleUpdateName,
  } = useFriends();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  function startEditName() {
    setNameInput(profile.name);
    setEditingName(true);
  }

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed.length === 0) return;
    handleUpdateName(trimmed);
    setEditingName(false);
  }

  function confirmRemoveFriend(friend: Friend) {
    Alert.alert(
      "Remove Friend",
      `Remove ${friend.name} from your friends list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => handleRemoveFriend(friend.id),
        },
      ],
    );
  }

  if (!profile.id) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile card ── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Your Profile</Text>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>

          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  maxLength={32}
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={saveName} style={styles.saveBtn}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.success}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={startEditName}
                style={styles.nameRow}
                activeOpacity={0.7}
              >
                <Text style={styles.profileName}>{profile.name}</Text>
                <Ionicons
                  name="pencil-outline"
                  size={14}
                  color={colors.textMuted}
                  style={styles.pencilIcon}
                />
              </TouchableOpacity>
            )}
            <Text style={styles.profileId} numberOfLines={1}>
              ID: {profile.id}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => shareInviteLink(profile)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="share-social-outline"
            size={18}
            color={colors.text}
            style={styles.shareIcon}
          />
          <Text style={styles.shareBtnText}>Share Friend Request Link</Text>
        </TouchableOpacity>
      </View>

      {/* ── Pending requests ── */}
      {pendingRequests.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Friend Requests ({pendingRequests.length})
          </Text>
          {pendingRequests.map((req: FriendRequest) => (
            <View key={req.id} style={styles.requestRow}>
              <View style={styles.requestAvatar}>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color={colors.warning}
                />
              </View>
              <Text style={styles.requestName} numberOfLines={1}>
                {req.fromName}
              </Text>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => handleAccept(req.id)}
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.success}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(req.id)}
                >
                  <Ionicons name="close" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Friends list ── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Friends ({friends.length})
        </Text>
        {friends.length === 0 ? (
          <View style={styles.emptyFriends}>
            <Ionicons
              name="people-outline"
              size={40}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubText}>
              Share your invite link so friends can send you a request
            </Text>
          </View>
        ) : (
          friends.map((friend: Friend) => (
            <View key={friend.id} style={styles.friendRow}>
              <View style={styles.friendAvatar}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <Text style={styles.friendName} numberOfLines={1}>
                {friend.name}
              </Text>
              <TouchableOpacity
                onPress={() => confirmRemoveFriend(friend)}
                style={styles.removeBtn}
              >
                <Ionicons
                  name="person-remove-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  profileName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  profileId: {
    color: colors.textMuted,
    fontSize: 11,
  },
  nameInput: {
    flex: 1,
    backgroundColor: colors.surfaceHigh,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  saveBtn: {
    padding: spacing.xs,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  shareBtnText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  requestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  requestName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptBtn: {
    backgroundColor: colors.success + "22",
  },
  rejectBtn: {
    backgroundColor: colors.danger + "22",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  friendName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  emptyFriends: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  pencilIcon: {
    marginLeft: 6,
  },
  shareIcon: {
    marginRight: spacing.sm,
  },
});
