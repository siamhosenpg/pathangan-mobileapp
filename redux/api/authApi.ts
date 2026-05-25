import type {
  AuthResponse,
  GetMeResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
} from "@/types/authTypes";

import * as SecureStore from "expo-secure-store";
import { clearUser, setUser } from "../features/auth/authSlice";
import { baseApi } from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== রেজিস্ট্রেশন =====================
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          // টোকেন SecureStore এ সেভ করো
          if (data.token) {
            await SecureStore.setItemAsync("token", data.token);
          }

          // Redux state এ user সেট করো
          if (data.user) {
            dispatch(setUser(data.user));
          }
        } catch {}
      },
    }),

    // ===================== লগইন =====================
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          // টোকেন SecureStore এ সেভ করো
          if (data.token) {
            await SecureStore.setItemAsync("token", data.token);
          }

          // Redux state এ user সেট করো
          if (data.user) {
            dispatch(setUser(data.user));
          }
        } catch {}
      },
    }),

    // ===================== বর্তমান ইউজার তথ্য =====================
    getMe: builder.query<GetMeResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          // সফল হলে Redux state আপডেট করো
          if (data.user) {
            dispatch(setUser(data.user));
          }
        } catch {
          // টোকেন invalid বা expire হলে user clear করো
          dispatch(clearUser());
        }
      },
    }),

    // ===================== লগআউট =====================
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;

          // SecureStore থেকে টোকেন মুছে দাও
          await SecureStore.deleteItemAsync("token");

          // Redux state clear করো
          dispatch(clearUser());
        } catch {}
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
