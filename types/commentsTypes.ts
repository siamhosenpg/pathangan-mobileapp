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
  isEdited?: boolean;
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

// postId ও parentCommentId লাগে cache ঠিক জায়গায় update করার জন্য
export interface UpdateCommentRequest {
  commentId: string;
  text: string;
  postId: string;
  parentCommentId?: string | null;
}

export interface UpdateCommentResponse {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    text: string;
    isEdited: boolean;
    updatedAt: string;
  };
}

export interface CommentCountResponse {
  success: boolean;
  count: number;
}
