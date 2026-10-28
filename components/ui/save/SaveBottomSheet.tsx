import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import {
  useCreateCollectionMutation,
  useGetCollectionsQuery,
  type Collection,
} from "@/redux/api/save/savedCollectionApi";
import {
  useCheckIfSavedQuery,
  useSavePostMutation,
} from "@/redux/api/save/savedItemApi";
import { getSaveErrorKey } from "@/utils/saveError";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  postId: string;
}

export default function SaveBottomSheet({ postId }: Props) {
  const { t } = useTranslation();
  const { close } = useBottomSheet();

  const { data: collections, isLoading } = useGetCollectionsQuery();
  const { data: savedStatus } = useCheckIfSavedQuery(postId, {
    skip: !postId,
  });
  const [savePost] = useSavePostMutation();
  const [createCollection, { isLoading: creating }] =
    useCreateCollectionMutation();

  const [savingId, setSavingId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [inputError, setInputError] = useState("");
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // শিট বন্ধ হলে টাইমার পরিষ্কার
  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  // যে যে কালেকশনে পোস্টটা আগে থেকেই সেভ আছে
  const savedIds = useMemo(
    () => new Set(savedStatus?.collectionIds ?? []),
    [savedStatus],
  );

  const showNotice = (message: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(""), 2500);
  };

  const handleSelect = async (col: Collection) => {
    if (savingId) return;

    // আগে থেকেই সেভ থাকলে শুধু জানিয়ে দিই
    if (savedIds.has(col._id)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
      showNotice(t("saveData.alreadySavedNotice"));
      return;
    }

    setSavingId(col._id);
    try {
      await savePost({ collectionId: col._id, postId }).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      close();
    } catch (error) {
      showNotice(t(getSaveErrorKey(error, "saveData.saveFailed")));
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || creating) return;

    try {
      await createCollection({ name }).unwrap();
      setNewName("");
      setInputError("");
      setShowInput(false);
    } catch (error) {
      setInputError(t(getSaveErrorKey(error, "saveData.createFailed")));
    }
  };

  return (
    <View className="px-4 pb-2">
      <Text className="text-base font-semibold text-text dark:text-dark-text pb-2">
        {t("saveData.saveTo")}
      </Text>

      {/* "ইতিমধ্যে সেভ আছে" বা ব্যর্থ হলে বার্তা */}
      {notice ? (
        <View className="mb-2 px-3 py-2 rounded-xl bg-background-secondary dark:bg-dark-background-secondary">
          <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
            {notice}
          </Text>
        </View>
      ) : null}

      {/* কালেকশন তালিকা */}
      {isLoading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" color="#00914d" />
        </View>
      ) : (
        collections?.map((col) => {
          const alreadySaved = savedIds.has(col._id);
          const isSavingThis = savingId === col._id;

          return (
            <TouchableOpacity
              key={col._id}
              onPress={() => handleSelect(col)}
              disabled={!!savingId}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-3 border-b border-border/50 dark:border-dark-border/50"
            >
              <Ionicons
                name={col.default ? "bookmark" : "folder-outline"}
                size={20}
                color={alreadySaved ? "#00914d" : "#6d6d6d"}
              />

              <View className="flex-1">
                <Text
                  className="text-base text-text dark:text-dark-text"
                  numberOfLines={1}
                >
                  {col.default ? t("saveData.defaultName") : col.name}
                </Text>
                {alreadySaved ? (
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                    {t("saveData.alreadySaved")}
                  </Text>
                ) : null}
              </View>

              {isSavingThis ? (
                <ActivityIndicator size="small" color="#00914d" />
              ) : alreadySaved ? (
                <Ionicons name="checkmark-circle" size={20} color="#00914d" />
              ) : null}
            </TouchableOpacity>
          );
        })
      )}

      {/* নতুন কালেকশন তৈরি */}
      {showInput ? (
        <View className="pt-3">
          <View className="flex-row gap-2">
            <TextInput
              value={newName}
              onChangeText={(text) => {
                setNewName(text);
                if (inputError) setInputError("");
              }}
              onSubmitEditing={handleCreate}
              placeholder={t("saveData.collectionNamePlaceholder")}
              placeholderTextColor="#6d6d6d"
              maxLength={40}
              autoFocus
              returnKeyType="done"
              className="flex-1 text-sm border border-border dark:border-dark-border rounded-xl px-3 py-2.5 bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text"
            />
            <TouchableOpacity
              onPress={handleCreate}
              disabled={creating || !newName.trim()}
              className="bg-accent px-4 rounded-xl items-center justify-center"
              style={{ opacity: creating || !newName.trim() ? 0.5 : 1 }}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-sm font-semibold">
                  {t("saveData.create")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {inputError ? (
            <Text className="text-xs text-red-500 mt-1.5">{inputError}</Text>
          ) : null}
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowInput(true)}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 py-3"
        >
          <Ionicons name="add-circle-outline" size={20} color="#00914d" />
          <Text className="text-base font-medium text-accent-secondary dark:text-dark-accent-secondary">
            {t("saveData.newCollection")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
