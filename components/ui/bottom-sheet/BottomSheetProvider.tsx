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

interface OpenOptions {
  /**
   * true (default): content ScrollView er vitore render hobe.
   * false: FlatList/SectionList er jonno, list nijei scroll handle korbe.
   */
  scrollable?: boolean;
}

interface BottomSheetContextType {
  open: (content: React.ReactNode, options?: OpenOptions) => void;
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
  const [scrollable, setScrollable] = useState(true);

  // rapidly open → close → open hole content clear na hoy
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback((node: React.ReactNode, options?: OpenOptions) => {
    // purono close timer cancel kori (rapid re-open case)
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContent(node);
    setScrollable(options?.scrollable ?? true);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);

    // BottomSheet er close animation (180ms) shesh howar pore content clear kori.
    // Age clear korle children unmount hoye animation jerky dekhay.
    closeTimerRef.current = setTimeout(() => {
      setContent(null);
      setScrollable(true); // pore next open e default e ferot jabe
      closeTimerRef.current = null;
    }, 220);
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <BottomSheetContext.Provider value={value}>
      {children}

      <BottomSheet visible={visible} onClose={close} scrollable={scrollable}>
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
