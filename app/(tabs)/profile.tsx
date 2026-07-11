import { useAppSelector } from "@/redux/hooks";
import { Redirect } from "expo-router";

export default function ProfileTab() {
  const currentUser = useAppSelector((state) => state.auth.user);

  if (!currentUser?.username) return null;

  return <Redirect href={`/(pages)/${currentUser.username}`} />;
}
