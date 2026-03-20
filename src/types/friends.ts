export type UserProfile = {
  id: string;
  name: string;
};

export type Friend = {
  id: string;
  name: string;
  addedAt: number;
};

export type FriendRequest = {
  id: string;
  fromId: string;
  fromName: string;
  receivedAt: number;
};
