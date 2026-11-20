import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import TextFont from "@/components/ui/font/TextFont";
import { useIconColor } from "@/hooks/useIconColor";
import {
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionsQuery,
  type Collection,
} from "@/redux/api/save/savedCollectionApi";
import { getSaveErrorKey } from "@/utils/saveError";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CollectionEditSheet from "./CollectionEditSheet";

// ── সব আইকন এক জায়গা (index) থেকে ──
import {
  AddIcon,
  ArrowRightIcon,
  BookmarkBoldIcon,
  EditIcon,
  FolderIcon,
  LockIcon,
  TrashIcon,
} from "@/assets/icon";

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export function SavedCollectionPanel({ activeId, onSelect }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { open } = useBottomSheet();

  // শুধু theme-এর দুটো রং: primary (গাঢ়) আর tertiary (হালকা)
  const { primary, tertiary } = useIconColor();

  const [newName, setNewName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputError, setInputError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: collections, isLoading } = useGetCollectionsQuery();
  const [createCollection, { isLoading: creating }] =
    useCreateCollectionMutation();
  const [deleteCollection] = useDeleteCollectionMutation();

  // বর্তমানে খোলা collection
  const activeCol = collections?.find((c) => c._id === activeId);

  const toggleInput = () => {
    setShowInput((p) => !p);
    setNewName("");
    setInputError("");
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

  // ডিলিটের আগে কনফার্ম — ভেতরের সব পোস্টও চিরতরে মুছে যাবে
  const handleDelete = (col: Collection) => {
    if (col.default || deletingId) return;

    Alert.alert(
      t("saveData.deleteTitle"),
      t("saveData.deleteMessage", { name: col.name }),
      [
        { text: t("saveData.cancel"), style: "cancel" },
        {
          text: t("saveData.delete"),
          style: "destructive",
          onPress: async () => {
            setDeletingId(col._id);
            try {
              await deleteCollection(col._id).unwrap();
              // যে কালেকশন খোলা ছিল সেটাই মুছলে ডিফল্টে ফিরে যাবে
              if (activeId === col._id) onSelect("");
            } catch {
              Alert.alert(t("saveData.deleteFailed"));
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleEdit = (col: Collection) => {
    if (col.default) return;
    open(<CollectionEditSheet collection={col} />);
  };

  return (
    <View className="bg-background dark:bg-dark-background border-b border-border dark:border-dark-border">
      {/* ── back বাটন + চিপ তালিকা + যোগ বাটন ── */}
      <View className="flex-row items-center gap-3 pl-4 pr-4 pt-3 pb-3">
        {/* back বাটন — ArrowRightIcon ১৮০° ঘুরিয়ে বাঁ-তীর */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-background-secondary dark:bg-dark-background-secondary items-center justify-center shrink-0"
        >
          <View style={{ transform: [{ rotate: "180deg" }] }}>
            <ArrowRightIcon width={22} height={22} color={primary} />
          </View>
        </TouchableOpacity>

        {isLoading ? (
          <View className="flex-1 flex-row gap-2">
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                className="h-10 w-24 rounded-full bg-background-secondary dark:bg-dark-background-secondary animate-pulse"
              />
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-2 pr-2"
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            {collections?.map((col) => {
              const isActive = activeId === col._id;
              const CollectionIcon = col.default
                ? BookmarkBoldIcon
                : FolderIcon;

              return (
                <TouchableOpacity
                  key={col._id}
                  onPress={() => onSelect(col._id)}
                  activeOpacity={0.8}
                  className={`h-10 flex-row items-center gap-2 px-4 rounded-full border ${
                    isActive
                      ? "bg-background-tertiary dark:bg-dark-background-tertiary border-text dark:border-dark-text"
                      : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
                  }`}
                >
                  <CollectionIcon
                    width={16}
                    height={16}
                    color={isActive ? primary : tertiary}
                  />
                  <TextFont
                    numberOfLines={1}
                    className={`text-sm leading-9 font-semibold max-w-[140px] ${
                      isActive
                        ? "text-text dark:text-dark-text"
                        : "text-text-secondary dark:text-dark-text-secondary"
                    }`}
                  >
                    {col.default ? t("saveData.defaultName") : col.name}
                  </TextFont>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* যোগ বাটন — খোলা থাকলে ৪৫° ঘুরে "×" হয়ে যায় */}
        <TouchableOpacity
          onPress={toggleInput}
          activeOpacity={0.8}
          className="w-10 h-10 rounded-full bg-background-secondary dark:bg-dark-background-secondary items-center justify-center shrink-0"
        >
          <View
            style={{ transform: [{ rotate: showInput ? "45deg" : "0deg" }] }}
          >
            <AddIcon width={20} height={20} color={primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── নতুন collection-এর ইনপুট ── */}
      {showInput && (
        <View className="px-4 pb-3">
          <View className="flex-row gap-2">
            <TextInput
              value={newName}
              onChangeText={(text) => {
                setNewName(text);
                if (inputError) setInputError("");
              }}
              onSubmitEditing={handleCreate}
              placeholder={t("saveData.collectionNamePlaceholder")}
              placeholderTextColor={tertiary}
              maxLength={40}
              autoFocus
              returnKeyType="done"
              className="flex-1 text-sm border border-border dark:border-dark-border rounded-xl px-3 py-2.5 bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text"
            />
            <TouchableOpacity
              onPress={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-4 rounded-xl items-center justify-center border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary"
              style={{ opacity: creating || !newName.trim() ? 0.5 : 1 }}
            >
              {creating ? (
                <ActivityIndicator size="small" color={primary} />
              ) : (
                <Text className="text-text dark:text-dark-text text-sm font-semibold">
                  {t("saveData.add")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {inputError ? (
            <Text className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1.5">
              {inputError}
            </Text>
          ) : null}
        </View>
      )}

      {/* ── বর্তমান collection-এর header + edit/delete বাটন ── */}
      {activeCol && (
        <View className="flex-row items-center justify-between px-4 pb-3">
          <View className="flex-1 flex-row items-center gap-3 mr-3">
            <View className="w-9 h-9 rounded-xl bg-background-secondary dark:bg-dark-background-secondary items-center justify-center">
              {activeCol.default ? (
                <BookmarkBoldIcon width={18} height={18} color={primary} />
              ) : (
                <FolderIcon width={18} height={18} color={primary} />
              )}
            </View>

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-base font-bold text-text dark:text-dark-text"
              >
                {activeCol.default ? t("saveData.defaultName") : activeCol.name}
              </Text>
              {activeCol.default ? (
                <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                  {t("saveData.defaultProtected")}
                </Text>
              ) : null}
            </View>
          </View>

          {activeCol.default ? (
            // ডিফল্ট collection বদলানো/মোছা যায় না
            <View className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary items-center justify-center">
              <LockIcon width={16} height={16} color={tertiary} />
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleEdit(activeCol)}
                activeOpacity={0.7}
                className="w-10 h-10 rounded-full bg-background-secondary dark:bg-dark-background-secondary items-center justify-center"
              >
                <EditIcon width={18} height={18} color={primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(activeCol)}
                disabled={!!deletingId}
                activeOpacity={0.7}
                className="w-10 h-10 rounded-full bg-background-secondary dark:bg-dark-background-secondary items-center justify-center"
              >
                {deletingId === activeCol._id ? (
                  <ActivityIndicator size="small" color={primary} />
                ) : (
                  <TrashIcon width={18} height={18} color={primary} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
