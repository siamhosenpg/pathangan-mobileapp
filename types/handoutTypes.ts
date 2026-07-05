export type HandoutCategory =
  | "golpo"
  | "itihash"
  | "dharmiyo"
  | "kobita"
  | "ovizoggota"
  | "onnanno";

export type HandoutStatus = "draft" | "published";

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
}

export interface GetHandoutBySlugResponse {
  success: boolean;
  data: HandoutWithChapters;
}

export interface SimpleSuccessResponse {
  success: boolean;
  message: string;
}
