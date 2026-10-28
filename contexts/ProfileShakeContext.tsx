import { createContext, useContext } from "react";

interface ProfileShakeContextValue {
  // এই screen এ যে user এর profile খোলা আছে তার username
  currentUsername: string | null;
  // একই profile এ আবার click করলে এটা call হবে
  triggerShake: () => void;
}

export const ProfileShakeContext = createContext<ProfileShakeContextValue>({
  // profile screen এর বাইরে (যেমন home feed) এটা null থাকবে,
  // তাই সেখানে আগের মতোই navigate হবে
  currentUsername: null,
  triggerShake: () => {},
});

export const useProfileShake = () => useContext(ProfileShakeContext);
