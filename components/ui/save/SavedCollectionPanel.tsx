import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import {
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionsQuery,
  type Collection,
} from "@/redux/api/save/savedCollectionApi";
import { getSaveErrorKey } from "@/utils/saveError";
import { Ionicons } from "@expo/vector-icons";
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

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export function SavedCollectionPanel({ activeId, onSelect }: Props) {
  const { t } = useTranslation();
  const { open } = useBottomSheet();

  const [newName, setNewName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputError, setInputError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: collections, isLoading } = useGetCollectionsQuery();
  const [createCollection, { isLoading: creating }] =
    useCreateCollectionMutation();
  const [deleteCollection] = useDeleteCollectionMutation();

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
      {/* ── চিপ + যোগ বাটন এক row এ ── */}
      <View className="flex-row items-center gap-2 px-4 py-3">
        {isLoading ? (
          <View className="flex-1 flex-row gap-2">
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                className="h-8 w-20 rounded-full bg-background-secondary dark:bg-dark-background-secondary"
              />
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-2"
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            {collections?.map((col) => {
              const isActive = activeId === col._id;
              const isDeleting = deletingId === col._id;

              return (
                <TouchableOpacity
                  key={col._id}
                  onPress={() => onSelect(col._id)}
                  activeOpacity={0.75}
                  style={{ opacity: isDeleting ? 0.5 : 1 }}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                    isActive
                      ? "bg-accent border-accent"
                      : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
                  }`}
                >
                  <Ionicons
                    name={col.default ? "bookmark" : "folder-outline"}
                    size={13}
                    color={isActive ? "#fff" : "#6d6d6d"}
                  />
                  <Text
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-white"
                        : "text-text-secondary dark:text-dark-text-secondary"
                    }`}
                  >
                    {col.default ? t("saveData.defaultName") : col.name}
                  </Text>

                  {/* এডিট ও ডিলিট — ডিফল্টে দেখাবে না */}
                  {!col.default && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleEdit(col)}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        className="ml-0.5"
                      >
                        <Ionicons
                          name="pencil"
                          size={13}
                          color={isActive ? "rgba(255,255,255,0.8)" : "#9CA3AF"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(col)}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={14}
                          color={isActive ? "rgba(255,255,255,0.8)" : "#9CA3AF"}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* যোগ বাটন — সবসময় right এ */}
        <TouchableOpacity
          onPress={() => {
            setShowInput((p) => !p);
            setNewName("");
            setInputError("");
          }}
          className="w-8 h-8 rounded-full bg-background-secondary dark:bg-dark-background-secondary items-center justify-center shrink-0"
        >
          <Ionicons
            name={showInput ? "close" : "add"}
            size={18}
            color="#00914d"
          />
        </TouchableOpacity>
      </View>

      {/* ── ইনপুট — শুধু showInput এ দেখাবে ── */}
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
    </View>
  );
}
