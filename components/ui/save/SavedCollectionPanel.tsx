import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import {
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionsQuery,
  type Collection,
} from "@/redux/api/save/savedCollectionApi";
import { getSaveErrorKey } from "@/utils/saveError";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import CollectionEditSheet from "./CollectionEditSheet";

// ── icons ──
import CreateIcon from "@/assets/icons/add.svg"; // @/assets/icons/add.svg
import BookMark from "@/assets/icons/bookmarkBold.svg"; // @/assets/icons/bookmarkBold.svg
import EditIcon from "@/assets/icons/file-edit.svg"; // @/assets/icons/file-edit.svg (rename বাটন)
import FolderIcon from "@/assets/icons/folder.svg"; // @/assets/icons/folder.svg
import LockIcon from "@/assets/icons/lock.svg"; // @/assets/icons/lock.svg (default collection-এর জন্য)
import TrashIcon from "@/assets/icons/trash.svg"; // @/assets/icons/trash.svg (delete বাটন)

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

const ACCENT = "#00914d";
const DANGER = "#ef4444";

export function SavedCollectionPanel({ activeId, onSelect }: Props) {
  const { t } = useTranslation();
  const { open } = useBottomSheet();

  // dark / light mode অনুযায়ী রং
  const isDark = useColorScheme() === "dark";
  const iconColor = isDark ? "#a3a3a3" : "#6d6d6d";
  const strongIconColor = isDark ? "#ffffff" : "#111111";
  const placeholderColor = isDark ? "#8a8a8a" : "#6d6d6d";

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
      {/* ── চিপ তালিকা + যোগ বাটন ── */}
      <View className="flex-row items-center gap-3 pl-4 pr-4 pt-3 pb-3">
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
              const CollectionIcon = col.default ? BookMark : FolderIcon;

              return (
                <TouchableOpacity
                  key={col._id}
                  onPress={() => onSelect(col._id)}
                  activeOpacity={0.8}
                  className={`h-10 flex-row items-center gap-2 px-4 rounded-full border ${
                    isActive
                      ? "bg-accent border-accent"
                      : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
                  }`}
                >
                  <CollectionIcon
                    width={16}
                    height={16}
                    color={isActive ? "#ffffff" : iconColor}
                  />
                  <Text
                    numberOfLines={1}
                    className={`text-sm font-semibold max-w-[140px] ${
                      isActive
                        ? "text-white"
                        : "text-text-secondary dark:text-dark-text-secondary"
                    }`}
                  >
                    {col.default ? t("saveData.defaultName") : col.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* যোগ বাটন — খোলা থাকলে ৪৫° ঘুরে "×" হয়ে যায় */}
        <TouchableOpacity
          onPress={toggleInput}
          activeOpacity={0.8}
          className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center shrink-0"
        >
          <View
            style={{ transform: [{ rotate: showInput ? "45deg" : "0deg" }] }}
          >
            <CreateIcon width={20} height={20} color={ACCENT} />
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
              placeholderTextColor={placeholderColor}
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
                  {t("saveData.add")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {inputError ? (
            <Text className="text-xs text-red-500 mt-1.5">{inputError}</Text>
          ) : null}
        </View>
      )}

      {/* ── বর্তমান collection-এর header + edit/delete বাটন ── */}
      {activeCol && (
        <View className="flex-row items-center justify-between px-4 pb-3">
          <View className="flex-1 flex-row items-center gap-3 mr-3">
            <View className="w-9 h-9 rounded-xl bg-accent/10 items-center justify-center">
              {activeCol.default ? (
                <BookMark width={18} height={18} color={ACCENT} />
              ) : (
                <FolderIcon width={18} height={18} color={ACCENT} />
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
              <LockIcon width={16} height={16} color={iconColor} />
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleEdit(activeCol)}
                activeOpacity={0.7}
                className="w-10 h-10 rounded-full bg-background-secondary dark:bg-dark-background-secondary items-center justify-center"
              >
                <EditIcon width={18} height={18} color={strongIconColor} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(activeCol)}
                disabled={!!deletingId}
                activeOpacity={0.7}
                className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center"
              >
                {deletingId === activeCol._id ? (
                  <ActivityIndicator size="small" color={DANGER} />
                ) : (
                  <TrashIcon width={18} height={18} color={DANGER} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
