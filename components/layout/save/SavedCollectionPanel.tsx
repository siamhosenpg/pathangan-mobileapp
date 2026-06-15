import {
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionsQuery,
} from "@/redux/api/save/savedCollectionApi";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export function SavedCollectionPanel({ activeId, onSelect }: Props) {
  const [newName, setNewName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const { data: collections, isLoading } = useGetCollectionsQuery();
  const [createCollection, { isLoading: creating }] =
    useCreateCollectionMutation();
  const [deleteCollection] = useDeleteCollectionMutation();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCollection({ name: newName.trim() });
    setNewName("");
    setShowInput(false);
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) return;
    await deleteCollection(id);
  };

  return (
    <View className="bg-background dark:bg-dark-background border-b border-border dark:border-dark-border">
      {/* ── chips + add button এক row এ ── */}
      <View className="flex-row items-center gap-2 px-4 py-3">
        {/* Collection chips */}
        {isLoading ? (
          <View className="flex-1 flex-row gap-2">
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                className="h-8 w-20 rounded-full bg-background-secondary"
              />
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-2"
            className="flex-1"
          >
            {collections?.map((col) => {
              const isActive = activeId === col._id;
              return (
                <TouchableOpacity
                  key={col._id}
                  onPress={() => onSelect(col._id)}
                  activeOpacity={0.75}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                    isActive
                      ? "bg-accent border-accent"
                      : "bg-background-secondary border-border"
                  }`}
                >
                  <Ionicons
                    name={col.default ? "bookmark" : "folder-outline"}
                    size={13}
                    color={isActive ? "#fff" : "#6d6d6d"}
                  />
                  <Text
                    className={`text-sm font-medium ${
                      isActive ? "text-white" : "text-text-secondary"
                    }`}
                  >
                    {col.name}
                  </Text>

                  {!col.default && (
                    <TouchableOpacity
                      onPress={() => handleDelete(col._id, col.default)}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      className="ml-0.5"
                    >
                      <Ionicons
                        name="close-circle"
                        size={14}
                        color={isActive ? "rgba(255,255,255,0.8)" : "#9CA3AF"}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Add button — সবসময় right এ */}
        <TouchableOpacity
          onPress={() => {
            setShowInput((p) => !p);
            setNewName("");
          }}
          className="w-8 h-8 rounded-full bg-background-secondary items-center justify-center shrink-0"
        >
          <Ionicons
            name={showInput ? "close" : "add"}
            size={18}
            color="#00914d"
          />
        </TouchableOpacity>
      </View>

      {/* ── Input — শুধু showInput এ দেখাবে ── */}
      {showInput && (
        <View className="flex-row gap-2 px-4 pb-3">
          <TextInput
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleCreate}
            placeholder="নতুন ফোল্ডারের নাম লিখো"
            placeholderTextColor="#6d6d6d"
            autoFocus
            returnKeyType="done"
            className="flex-1 text-sm border border-border rounded-xl px-3 py-2.5 bg-background-secondary text-text"
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
              <Text className="text-white text-sm font-semibold">যোগ</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
