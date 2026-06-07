import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    credentials: "include",
    prepareHeaders: async (headers) => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
  ],
  endpoints: () => ({}),
});
