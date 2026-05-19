import type {
  AuthResponse,
  GetMeResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
} from "@/types/authTypes";
import * as SecureStore from "expo-secure-store";
import { baseApi } from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            await SecureStore.setItemAsync("token", data.token);
          }
        } catch {}
      },
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            await SecureStore.setItemAsync("token", data.token);
          }
        } catch {}
      },
    }),

    getMe: builder.query<GetMeResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await SecureStore.deleteItemAsync("token");
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
