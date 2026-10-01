export interface FollowUser {
  _id: string;
  name: string;
  username?: string;
  profileImage?: string;
  profilePicture?: string;
  bio?: string;
  greenmarkVerified?: boolean; // backend populate-e select korle tabei ashbe
}

export interface FollowRecord {
  _id: string;
  followerId: string | FollowUser;
  followingId: string | FollowUser;
  createdAt: string;
  updatedAt: string;
}

export interface FollowResponse {
  success: boolean;
  message: string;
  follow: FollowRecord;
}

export interface UnfollowResponse {
  success: boolean;
  message: string;
}

export interface FollowersCountResponse {
  success: boolean;
  followersCount: number;
}

export interface FollowingCountResponse {
  success: boolean;
  followingCount: number;
}

export interface FollowErrorResponse {
  message: string;
}

export interface FollowerItem {
  _id: string; // follow document id (cursor eta theke ashe)
  followerId: FollowUser; // populated
  followingId: string;
  createdAt?: string;
}

export interface FollowingItem {
  _id: string;
  followerId: string;
  followingId: FollowUser; // populated
  createdAt?: string;
}

export interface FollowListResponse {
  success: boolean;
  count: number;
  followers: FollowerItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FollowingListResponse {
  success: boolean;
  count: number;
  following: FollowingItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FollowListArgs {
  userId: string;
  cursor?: string;
  limit?: number;
}
