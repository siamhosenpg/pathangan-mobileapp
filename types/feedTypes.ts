import type { Post } from "@/types/postTypes";

export interface FeedCategory {
  slug: string;
  en: string;
  bn: string;
}

export interface GetForYouFeedResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GetFeedCategoriesResponse {
  success: boolean;
  categories: FeedCategory[];
}

export interface InterestTopItem {
  category: string;
  en: string;
  bn: string;
  score: number;
}

export interface GetMyInterestsResponse {
  success: boolean;
  selected: string[];
  top: InterestTopItem[];
  hasInterests: boolean;
}

export interface SetInterestsPayload {
  categories: string[];
}
