import { baseApi } from "@/redux/api/baseApi";
import { useSavePushTokenMutation } from "@/redux/api/userApi";
import { useAppSelector } from "@/redux/hooks";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useDispatch } from "react-redux";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type PushData = {
  type?: string;
  postId?: string;
  commentId?: string;
  actorId?: string;
};

// ===================== MODULE-LEVEL GUARD =====================
// hook কয়বার mount হলো বা user object কয়বার বদলালো, তাতে কিছু যায় আসে না
let isRegistering = false;
let lastSavedKey: string | null = null; // "userId:token"

export const usePushNotification = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userId: string | undefined = (user as any)?._id ?? (user as any)?.id;

  const dispatch = useDispatch();
  const router = useRouter();
  const [savePushToken] = useSavePushTokenMutation();

  const handledResponseId = useRef<string | null>(null);

  // ===================== REGISTER + SAVE TOKEN =====================
  const registerForPushNotifications = async (uid: string): Promise<void> => {
    if (isRegistering) return;
    isRegistering = true;

    try {
      if (!Device.isDevice) return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn("EAS projectId not found");
        return;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const key = `${uid}:${token}`;

      // এই user + এই token আগেই save হয়ে থাকলে আর পাঠাবে না
      if (!token || lastSavedKey === key) return;

      // আগে key সেট করছি, যাতে fail হলেও লুপে retry না হয়
      lastSavedKey = key;

      await savePushToken({ pushToken: token }).unwrap();
    } catch (err: any) {
      if (err?.status === 429) {
        console.warn("Push token save: rate limited (429), পরে আবার হবে");
      } else {
        console.warn("registerForPushNotifications error:", err);
        // 429 ছাড়া অন্য error হলে পরের বার আবার চেষ্টা করতে দাও
        lastSavedKey = null;
      }
    } finally {
      isRegistering = false;
    }
  };

  // ===================== NAVIGATION ON TAP =====================
  const navigateFromData = (data: PushData) => {
    switch (data?.type) {
      case "follow":
        if (data.actorId) router.push(`/user/${data.actorId}` as any);
        break;
      case "like":
      case "comment":
      case "reply":
      case "rating":
      case "share":
        if (data.postId) router.push(`/post/${data.postId}` as any);
        break;
      default:
        router.push("/notifications" as any);
    }
  };

  // ===================== SETUP (শুধু userId বদলালে চলবে) =====================
  useEffect(() => {
    if (!userId) {
      lastSavedKey = null; // logout হলে reset
      return;
    }

    registerForPushNotifications(userId);

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      dispatch(baseApi.util.invalidateTags(["Notification"]));
    });

    const tokenSub = Notifications.addPushTokenListener(() => {
      registerForPushNotifications(userId);
    });

    return () => {
      receivedSub.remove();
      tokenSub.remove();
    };
  }, [userId]);

  // ===================== TAP HANDLING =====================
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!userId || !lastResponse) return;
    if (
      lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      return;
    }

    const id = lastResponse.notification.request.identifier;
    if (handledResponseId.current === id) return;
    handledResponseId.current = id;

    const data = lastResponse.notification.request.content.data as PushData;

    dispatch(baseApi.util.invalidateTags(["Notification"]));
    navigateFromData(data);
  }, [lastResponse, userId]);
};
