import { useGoogleMobileAuthMutation } from "@/redux/api/authApi";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [googleMobileAuth, { isLoading }] = useGoogleMobileAuthMutation();

  const redirectUri = makeRedirectUri({
    scheme: "pathangan",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!, // ← নতুন
    scopes: ["profile", "email"],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) handleGoogleLogin(accessToken);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const googleUser = await res.json();

      await googleMobileAuth({
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        photo: googleUser.picture,
      });
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return { promptAsync, request, isLoading };
}
