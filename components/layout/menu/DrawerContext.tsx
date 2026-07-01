import { createContext, useContext } from "react";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
type DrawerContextType = {
  drawerRef: React.RefObject<DrawerLayout | null>; // ← | null যোগ করো
  openDrawer: () => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used inside DrawerProvider");
  return ctx;
}

export { DrawerContext };
