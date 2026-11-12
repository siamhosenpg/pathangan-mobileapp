export type HandoutCategory =
  | "story"
  | "history"
  | "religious"
  | "experience"
  | "educational"
  | "science"
  | "technology"
  | "self_development"
  | "biography"
  | "travel"
  | "other";
export type HandoutStatus =
  | "draft"
  | "published"
  | "auto_hidden"
  | "under_review";

export type ModerationFlagType =
  | "none"
  | "obscene"
  | "harmful"
  | "obscene_and_harmful";

// create / update / chapter save / publish-এর response-এ আসে
export interface ModerationInfo {
  flagged: boolean;
  flagType: ModerationFlagType;
  message: string | null;
  chapterId?: string | null;
}

export interface HandoutAuthor {
  _id: string;
  username: string;
  name: string;
  profileImage: string | null;
  greenmarkVerified: boolean;
}

export interface Handout {
  _id: string;
  user: HandoutAuthor;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  category: HandoutCategory;
  tags: string[];
  price?: number;
  status: HandoutStatus;
  publishedAt: string | null;
  chaptersCount: number;
  wordCount: number;
  estimatedReadTime: number;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  readCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterSummary {
  _id: string;
  title: string;
  order: number;
  wordCount: number;
}

export interface HandoutWithChapters extends Handout {
  chapters: ChapterSummary[];
}

// ===================== রিকোয়েস্ট টাইপ =====================

export interface CreateHandoutRequest {
  title: string;
  description: string;
  coverImage?: string | null;
  category: HandoutCategory;
  tags?: string[];
}

export interface UpdateHandoutRequest {
  id: string;
  title?: string;
  description?: string;
  coverImage?: string | null;
  category?: HandoutCategory;
  tags?: string[];
}

export interface GetHandoutsArgs {
  category?: HandoutCategory | null;
  search?: string;
}

// ===================== রেসপন্স টাইপ =====================

export interface GetHandoutsResponse {
  success: boolean;
  data: Handout[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface HandoutResponse {
  success: boolean;
  data: Handout;
  moderation?: ModerationInfo;
}

export interface GetHandoutBySlugResponse {
  success: boolean;
  data: HandoutWithChapters;
}

export interface SimpleSuccessResponse {
  success: boolean;
  message: string;
}
