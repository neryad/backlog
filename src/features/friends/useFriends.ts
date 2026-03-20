import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Share } from "react-native";
import {
  getUserProfile,
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  updateUserName,
} from "../../db/queries/friends";
import { Friend, FriendRequest, UserProfile } from "../../types/friends";

export function useFriends() {
  const [profile, setProfile] = useState<UserProfile>({ id: "", name: "" });
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  const load = useCallback(() => {
    setProfile(getUserProfile());
    setFriends(getFriends());
    setPendingRequests(getPendingRequests());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function shareInviteLink(p: UserProfile) {
    const link = `playlogged://add-friend?id=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}`;
    Share.share({
      message: `Add me as a friend on Playlogged! Tap the link to send me a friend request:\n${link}`,
      url: link,
    });
  }

  function handleAccept(requestId: string) {
    acceptFriendRequest(requestId);
    load();
  }

  function handleReject(requestId: string) {
    rejectFriendRequest(requestId);
    load();
  }

  function handleRemoveFriend(friendId: string) {
    removeFriend(friendId);
    load();
  }

  function handleUpdateName(name: string) {
    updateUserName(name);
    load();
  }

  return {
    profile,
    friends,
    pendingRequests,
    shareInviteLink,
    handleAccept,
    handleReject,
    handleRemoveFriend,
    handleUpdateName,
    reload: load,
  };
}
