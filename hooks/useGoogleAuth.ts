import { useGoogleMobileAuthMutation } from "@/redux/api/authApi";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [googleMobileAuth, { isLoading }] = useGoogleMobileAuthMutation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    // iOS ID না থাকলে placeholder, যাতে "iosClientId must be defined" error না আসে
    iosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
      "placeholder-ios-client-id",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken =
        response.authentication?.accessToken ??
        (response.params?.access_token as string | undefined);

      if (accessToken) {
        handleGoogleLogin(accessToken);
      } else {
        console.log("Google auth: accessToken পাওয়া যায়নি", response);
      }
    } else if (response?.type === "error") {
      console.log("Google auth error:", response.error);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      await googleMobileAuth({ accessToken }).unwrap();
    } catch (e) {
      console.log("Google login failed:", e);
    }
  };

  return { promptAsync, request, isLoading };
}
