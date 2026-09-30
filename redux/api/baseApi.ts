import { clearUser } from "@/redux/features/auth/authSlice";
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  credentials: "include",
  timeout: 15000, // ১৫ সেকেন্ডের বেশি ঝুলে থাকবে না -> TIMEOUT_ERROR
  prepareHeaders: async (headers) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// ===================== ১. 401 হলে session শেষ =====================
// শুধু তখনই logout করবো যখন user এর আগে থেকে token ছিল।
// (না হলে login এ ভুল password দিলেও 401 আসে, তখন logout করা ভুল হবে)
const baseQueryWithAuth: typeof rawBaseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);

  if (result.error?.status === 401) {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      await SecureStore.deleteItemAsync("token");
      api.dispatch(clearUser());
    }
  }

  return result;
};

// ===================== ২. Retry: শুধু network/server error এ =====================
// 4xx (client ভুল) এ retry করে লাভ নেই, তাই সাথে সাথে থামিয়ে দিই।
// retry এর ভেতরে exponential backoff নিজে থেকেই আছে।
const baseQueryWithRetry = retry(
  async (args, api, extra) => {
    const result = await baseQueryWithAuth(args, api, extra);
    const status = result.error?.status;

    if (typeof status === "number" && status >= 400 && status < 500) {
      retry.fail(result.error);
    }

    return result;
  },
  { maxRetries: 2 },
);

// ===================== ৩. Mutation এ কখনো auto retry না =====================
// like, report, payment এর মতো action দুইবার যেতে পারে, তাই mutation
// সরাসরি চলবে। শুধু query (data আনা) retry হবে।
const baseQuery: typeof baseQueryWithAuth = (args, api, extra) =>
  api.type === "mutation"
    ? baseQueryWithAuth(args, api, extra)
    : baseQueryWithRetry(args, api, extra);

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  refetchOnReconnect: true, // net ফিরলে পুরনো/failed query নিজে reload হবে
  tagTypes: [
    "Post",
    "User",
    "Reaction",
    "Collection",
    "SavedItem",
    "Comment",
    "Answer",
    "Follow",
    "Rating",
    "Notification",
    "PrivateQuestion",
    "PrivateAnswer",
    "Handout",
    "Chapter",
    "Report",
  ],
  endpoints: () => ({}),
});
