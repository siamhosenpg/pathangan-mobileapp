export interface CommentUser {
  _id: string;
  name: string;
  username: string;
  userid: number;
  profileImage?: string;
  gender?: string;
  badges?: string[];
  greenmarkVerified?: boolean;
}

// reply কার উদ্দেশ্যে (@mention)
export interface ReplyToUser {
  _id: string;
  name: string;
  username: string;
}

export interface Comment {
  _id: string;
  postId: string;
  commentUserId: CommentUser;
  text: string;
  parentCommentId: string | null;
  replyToUserId?: ReplyToUser | null;
  repliesCount?: number;
  reportCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetCommentsResponse {
  success: boolean;
  page: number;
  total: number;
  count: number;
  hasMore: boolean;
  data: Comment[];
}

export interface GetRepliesResponse {
  success: boolean;
  page: number;
  count: number;
  totalReplies: number;
  hasMore: boolean;
  data: Comment[];
}

export interface CreateCommentRequest {
  postId: string;
  text: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  commentId: string;
  text: string;
}

export interface CommentCountResponse {
  success: boolean;
  count: number;
}
