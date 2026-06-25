import { useSavePushTokenMutation } from "@/redux/api/userApi";
import { useAppSelector } from "@/redux/hooks";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async (
    _notification: Notifications.Notification,
  ): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export const usePushNotification = () => {
  const { user } = useAppSelector((state) => state.auth);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const [savePushToken] = useSavePushTokenMutation();

  useEffect(() => {
    if (!user) return;

    registerForPushNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(
        (notification: Notifications.Notification) => {
          console.log("Notification received:", notification);
        },
      );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
          const data = response.notification.request.content.data;
          console.log("Notification tapped:", data);
        },
      );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user]);

  const registerForPushNotifications = async (): Promise<void> => {
    if (!Device.isDevice) {
      console.log("Physical device required for push notifications");
      return;
    }

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

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as
      | string
      | undefined;

    if (!projectId) {
      console.log("Project ID not found");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    console.log("Expo Push Token:", token);

    await savePushToken({ pushToken: token });
  };
};
