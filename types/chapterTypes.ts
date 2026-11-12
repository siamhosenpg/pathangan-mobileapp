import type { ModerationInfo } from "@/types/handoutTypes";

export interface Chapter {
  _id: string;
  handout: string;
  user: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  // শুধু owner এর response এ আসে (খারাপ লেখা আছে কিনা)
  hasBadText?: boolean;
}

export interface GetChaptersResponse {
  success: boolean;
  data: Chapter[];
}

export interface ChapterResponse {
  success: boolean;
  data: Chapter;
  // chapter save এর পর খারাপ লেখা পাওয়া গেলে backend এটা পাঠায়
  moderation?: ModerationInfo;
}

export interface AddChapterRequest {
  handoutId: string;
  title: string;
  content: string;
}

export interface UpdateChapterRequest {
  id: string;
  handoutId: string; // cache invalidate করার জন্য দরকার
  title?: string;
  content?: string;
}

export interface DeleteChapterRequest {
  id: string;
  handoutId: string;
}

export interface ReorderChaptersRequest {
  handoutId: string;
  orderedChapterIds: string[];
}

export interface SimpleSuccessResponse {
  success: boolean;
  message: string;
}
