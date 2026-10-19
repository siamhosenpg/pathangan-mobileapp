// types/privateQuestionTypes.ts

export type QuestionStatus = "pending" | "answered" | "ignored";

// inbox / sent এর কোন দিক থেকে দেখছি
export type QuestionMode = "inbox" | "sent";

export interface PrivateQuestionUser {
  _id: string;
  name?: string;
  username?: string;
  profileImage?: string;
}

// ===================== PRIVATE ANSWER =====================
// public Answer থেকে আলাদা: vote / badge / bestAnswer নেই
export interface PrivateAnswer {
  _id: string;
  questionId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  editedAt?: string | null;
}

// thread API তে প্রশ্নের সাথে আসা উত্তরের সংক্ষিপ্ত রূপ
export type PrivateAnswerPreview = Pick<
  PrivateAnswer,
  "_id" | "text" | "createdAt" | "isEdited"
>;

export interface PrivateQuestion {
  _id: string;
  // ইউজার ডিলিট / ব্যান / ডিঅ্যাকটিভ হলে backend null পাঠায়
  senderId: PrivateQuestionUser | null;
  receiverId: PrivateQuestionUser | null;
  questionText: string;
  status: QuestionStatus;
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // শুধু single question API (GET /private-questions/:id) তে আসে
  isSender?: boolean;
  isReceiver?: boolean;

  // শুধু thread API (GET /private-questions/with/:userId) তে আসে
  answer?: PrivateAnswerPreview | null;
}

// ===================== PEOPLE LIST =====================
export interface PrivateQuestionPerson {
  userId: string;
  user: PrivateQuestionUser | null; // ডিলিট হলে null
  totalCount: number;
  unreadCount: number;
  lastQuestionText: string;
  lastQuestionAt: string;
  lastStatus: QuestionStatus;
}

// ===================== REQUEST TYPES =====================
export interface SendPrivateQuestionRequest {
  receiverId: string;
  questionText: string;
}

export interface EditPrivateQuestionRequest {
  id: string;
  questionText: string;
}

// "answered" হাতে সেট করা যায় না, উত্তর দিলে নিজে থেকে হয়
export interface UpdateQuestionStatusRequest {
  id: string;
  status: Extract<QuestionStatus, "ignored" | "pending">;
}

export interface GetQuestionsParams {
  limit?: number;
  cursor?: string;
  status?: QuestionStatus; // inbox filter এর জন্য
}

export interface GetPeopleParams {
  mode: QuestionMode;
  limit?: number;
}

export interface GetThreadParams {
  userId: string;
  mode: QuestionMode;
  limit?: number;
}

export interface CreatePrivateAnswerPayload {
  questionId: string;
  text: string;
}

export interface EditPrivateAnswerPayload {
  answerId: string;
  text: string;
}

// ===================== RESPONSE TYPES =====================
export interface PrivateQuestionListResponse {
  success: boolean;
  questions: PrivateQuestion[];
  nextCursor: string | null;
}

export interface PrivateQuestionPeopleResponse {
  success: boolean;
  people: PrivateQuestionPerson[];
  nextCursor: string | null;
}

export interface PrivateQuestionThreadResponse {
  success: boolean;
  user: PrivateQuestionUser | null;
  questions: PrivateQuestion[];
  nextCursor: string | null;
}

export interface PrivateQuestionSingleResponse {
  success: boolean;
  question: PrivateQuestion;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface DeleteQuestionResponse {
  success: boolean;
  message: string;
  answerUserId?: string | null;
}

export interface UpdateStatusResponse {
  success: boolean;
  question: PrivateQuestion;
}

export interface GetPrivateAnswerResponse {
  success: boolean;
  answer: PrivateAnswer | null;
}

export interface CreatePrivateAnswerResponse {
  success: boolean;
  message: string;
  answer: PrivateAnswer;
}

export interface EditPrivateAnswerResponse {
  success: boolean;
  answer: PrivateAnswer;
}

export interface DeletePrivateAnswerResponse {
  success: boolean;
  message: string;
}
