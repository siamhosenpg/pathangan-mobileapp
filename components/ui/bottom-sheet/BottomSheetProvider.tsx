import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, BackHandler, Keyboard } from "react-native";
import BottomSheet from "./BottomSheet";

interface OpenOptions {
  /**
   * true (default): content ScrollView er vitore render hobe.
   * false: FlatList/SectionList er jonno, list nijei scroll handle korbe.
   */
  scrollable?: boolean;
}

interface BottomSheetContextType {
  /** নতুন sheet আগেরটার উপরে খোলে (আগেরটা নিচে থেকে যায়) */
  open: (content: React.ReactNode, options?: OpenOptions) => void;
  /** এখন যে sheet উপরে আছে তার content বদলে দেয় (menu → report এর মতো) */
  replace: (content: React.ReactNode, options?: OpenOptions) => void;
  /** শুধু উপরের sheet বন্ধ করে */
  close: () => void;
}

export interface CloseGuardOptions {
  /** true হলে বন্ধ করার আগে confirm চাইবে */
  when: boolean;
  title: string;
  message: string;
  confirmText: string; // বন্ধ করে দাও
  cancelText: string; // থাকো
}

interface SheetEntry {
  id: number;
  contentKey: number;
  content: React.ReactNode;
  scrollable: boolean;
  visible: boolean;
}

const REMOVE_DELAY = 260; // close animation শেষ হওয়ার পর unmount
const OPEN_THROTTLE = 250; // double tap এ দুইবার sheet খোলা আটকানো

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(
  undefined,
);

// প্রতিটা sheet এর নিজস্ব context — sheet এর ভেতরের component guard সেট করে
interface SheetEntryContextType {
  setGuard: (guard: CloseGuardOptions | null) => void;
}
const SheetEntryContext = createContext<SheetEntryContextType | null>(null);

/**
 * Sheet এর ভেতরের component এ ব্যবহার করুন।
 * when=true থাকলে user backdrop/drag/back button দিয়ে বন্ধ করতে গেলে Alert আসবে।
 * code থেকে close() call করলে guard কাজ করে না (যেমন submit এর পর)।
 */
export const useSheetCloseGuard = (options: CloseGuardOptions) => {
  const ctx = useContext(SheetEntryContext);
  const { when, title, message, confirmText, cancelText } = options;

  useEffect(() => {
    if (!ctx) return;
    ctx.setGuard(
      when ? { when, title, message, confirmText, cancelText } : null,
    );
    return () => ctx.setGuard(null);
  }, [ctx, when, title, message, confirmText, cancelText]);
};

// ===================== একটা sheet এর host =====================
interface HostProps {
  entry: SheetEntry;
  onRequestClose: (id: number) => boolean;
  onSetGuard: (id: number, guard: CloseGuardOptions | null) => void;
}

const SheetHost = ({ entry, onRequestClose, onSetGuard }: HostProps) => {
  const { id } = entry;

  const entryCtx = useMemo<SheetEntryContextType>(
    () => ({ setGuard: (guard) => onSetGuard(id, guard) }),
    [id, onSetGuard],
  );

  const handleClose = useCallback(
    () => onRequestClose(id),
    [id, onRequestClose],
  );

  return (
    <BottomSheet
      visible={entry.visible}
      onClose={handleClose}
      scrollable={entry.scrollable}
    >
      <SheetEntryContext.Provider value={entryCtx}>
        <React.Fragment key={entry.contentKey}>{entry.content}</React.Fragment>
      </SheetEntryContext.Provider>
    </BottomSheet>
  );
};

// ===================== PROVIDER =====================
export const BottomSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sheets, setSheets] = useState<SheetEntry[]>([]);

  // সবসময় সর্বশেষ stack এখানে থাকে (callback গুলো stale হয় না)
  const sheetsRef = useRef<SheetEntry[]>([]);
  const idRef = useRef(0);
  const lastOpenRef = useRef(0);
  const guardsRef = useRef(new Map<number, CloseGuardOptions>());
  const removeTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const commit = useCallback((next: SheetEntry[]) => {
    sheetsRef.current = next;
    setSheets(next);
  }, []);

  const getTopVisible = () =>
    [...sheetsRef.current].reverse().find((s) => s.visible);

  const setGuard = useCallback(
    (id: number, guard: CloseGuardOptions | null) => {
      if (guard) guardsRef.current.set(id, guard);
      else guardsRef.current.delete(id);
    },
    [],
  );

  // একটা sheet কে animation সহ বন্ধ করে, তারপর stack থেকে সরায়
  const closeEntry = useCallback(
    (id: number) => {
      guardsRef.current.delete(id);

      commit(
        sheetsRef.current.map((s) =>
          s.id === id ? { ...s, visible: false } : s,
        ),
      );

      const timer = setTimeout(() => {
        commit(sheetsRef.current.filter((s) => s.id !== id));
        removeTimers.current.delete(id);
      }, REMOVE_DELAY);
      removeTimers.current.set(id, timer);
    },
    [commit],
  );

  const open = useCallback(
    (node: React.ReactNode, options?: OpenOptions) => {
      const now = Date.now();
      if (now - lastOpenRef.current < OPEN_THROTTLE) return;
      lastOpenRef.current = now;

      // নতুন sheet এর জন্য keyboard নামিয়ে নিই (না হলে sheet keyboard এর পেছনে চলে যায়)
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const id = ++idRef.current;
      commit([
        ...sheetsRef.current,
        {
          id,
          contentKey: id,
          content: node,
          scrollable: options?.scrollable ?? true,
          visible: true,
        },
      ]);
    },
    [commit],
  );

  const replace = useCallback(
    (node: React.ReactNode, options?: OpenOptions) => {
      const top = getTopVisible();
      if (!top) {
        open(node, options);
        return;
      }

      guardsRef.current.delete(top.id);
      commit(
        sheetsRef.current.map((s) =>
          s.id === top.id
            ? {
                ...s,
                content: node,
                contentKey: ++idRef.current,
                scrollable: options?.scrollable ?? true,
              }
            : s,
        ),
      );
    },
    [commit, open],
  );

  const close = useCallback(() => {
    const top = getTopVisible();
    if (top) closeEntry(top.id);
  }, [closeEntry]);

  // user বন্ধ করতে চাইলে (backdrop / drag / back button) — guard থাকলে confirm
  const requestClose = useCallback(
    (id: number): boolean => {
      const entry = sheetsRef.current.find((s) => s.id === id);
      if (!entry || !entry.visible) return true;

      // নিচের sheet backdrop দিয়ে বন্ধ হবে না, শুধু উপরেরটা
      const top = getTopVisible();
      if (top && top.id !== id) return false;

      const guard = guardsRef.current.get(id);
      if (guard?.when) {
        Alert.alert(guard.title, guard.message, [
          { text: guard.cancelText, style: "cancel" },
          {
            text: guard.confirmText,
            style: "destructive",
            onPress: () => closeEntry(id),
          },
        ]);
        return false;
      }

      closeEntry(id);
      return true;
    },
    [closeEntry],
  );

  // Android back button: আগে উপরের sheet বন্ধ হবে
  const hasSheets = sheets.length > 0;
  useEffect(() => {
    if (!hasSheets) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const top = getTopVisible();
      if (!top) return false;
      requestClose(top.id);
      return true;
    });

    return () => sub.remove();
  }, [hasSheets, requestClose]);

  // unmount হলে timer পরিষ্কার
  useEffect(() => {
    const timers = removeTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ open, replace, close }),
    [open, replace, close],
  );

  return (
    <BottomSheetContext.Provider value={value}>
      {children}

      {sheets.map((entry) => (
        <SheetHost
          key={entry.id}
          entry={entry}
          onRequestClose={requestClose}
          onSetGuard={setGuard}
        />
      ))}
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
