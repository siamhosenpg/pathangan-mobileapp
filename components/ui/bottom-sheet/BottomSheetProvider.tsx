import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import BottomSheet from "./BottomSheet";

interface BottomSheetContextType {
  open: (content: React.ReactNode) => void;
  close: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(
  undefined,
);

export const BottomSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [visible, setVisible] = useState(false);

  // যদি rapidly open → close → open হয়, content clear না হোক
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback((node: React.ReactNode) => {
    // পুরনো close timer cancel করো (rapid re-open case)
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContent(node);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);

    // BottomSheet এর close animation (280ms) শেষ হওয়ার পরে content clear করো
    // এর আগে clear করলে children unmount হয়ে animation jerky দেখায়
    closeTimerRef.current = setTimeout(() => {
      setContent(null);
      closeTimerRef.current = null;
    }, 220); // 280ms animation + 40ms buffer
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  return (
    <BottomSheetContext.Provider value={value}>
      {children}

      <BottomSheet visible={visible} onClose={close}>
        {content}
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error("useBottomSheet must be used inside BottomSheetProvider");
  }

  return context;
};
