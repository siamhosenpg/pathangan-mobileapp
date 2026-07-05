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
}

export interface GetChaptersResponse {
  success: boolean;
  data: Chapter[];
}

export interface ChapterResponse {
  success: boolean;
  data: Chapter;
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
