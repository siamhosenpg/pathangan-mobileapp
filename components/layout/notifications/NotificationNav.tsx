import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import NotificationBadge from "./NotificationBadge";
import NotificationPanel from "./NotificationPanel";

import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";

import { useGetUnreadNotificationCountQuery } from "@/redux/api/notification/notificationApi";

const NotificationNav = () => {
  // card-এ ক্লিক করলে sheet বন্ধ করার জন্য close দরকার
  const { open, close } = useBottomSheet();

  const { data } = useGetUnreadNotificationCountQuery();

  const unreadCount = data?.count ?? 0;

  const handleOpen = () => {
    open(
      <View style={{ flex: 1 }}>
        {/* card-এ ক্লিক করলে এই close চলবে, তারপর নেভিগেশন হবে */}
        <NotificationPanel onClose={close} />
      </View>,
    );
  };

  return (
    <Pressable onPress={handleOpen}>
      <View
        style={{
          position: "relative",
        }}
      >
        <Ionicons name="notifications-outline" size={28} color="white" />

        <NotificationBadge count={unreadCount} />
      </View>
    </Pressable>
  );
};

export default NotificationNav;
