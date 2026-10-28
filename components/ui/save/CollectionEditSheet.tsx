import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import {
  useUpdateCollectionMutation,
  type Collection,
} from "@/redux/api/save/savedCollectionApi";
import { getSaveErrorKey } from "@/utils/saveError";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  collection: Collection;
}

export default function CollectionEditSheet({ collection }: Props) {
  const { t } = useTranslation();
  const { close } = useBottomSheet();
  const [updateCollection, { isLoading }] = useUpdateCollectionMutation();

  const [name, setName] = useState(collection.name);
  const [error, setError] = useState("");

  const trimmed = name.trim();
  // খালি বা আগের নামের সমান হলে সেভ বাটন বন্ধ
  const canSave = !!trimmed && trimmed !== collection.name && !isLoading;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      await updateCollection({ id: collection._id, name: trimmed }).unwrap();
      close();
    } catch (err) {
      setError(t(getSaveErrorKey(err, "saveData.renameFailed")));
    }
  };

  return (
    <View className="px-4 pb-2">
      <Text className="text-base font-semibold text-text dark:text-dark-text pb-3">
        {t("saveData.renameTitle")}
      </Text>

      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (error) setError("");
        }}
        onSubmitEditing={handleSave}
        placeholder={t("saveData.collectionNamePlaceholder")}
        placeholderTextColor="#6d6d6d"
        maxLength={40}
        autoFocus
        selectTextOnFocus
        returnKeyType="done"
        className="text-sm border border-border dark:border-dark-border rounded-xl px-3 py-2.5 bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text"
      />

      {error ? (
        <Text className="text-xs text-red-500 mt-1.5">{error}</Text>
      ) : null}

      <View className="flex-row gap-2 mt-4">
        <TouchableOpacity
          onPress={close}
          className="flex-1 py-3 rounded-xl items-center border border-border dark:border-dark-border"
        >
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            {t("saveData.cancel")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          className="flex-1 py-3 rounded-xl items-center bg-accent"
          style={{ opacity: canSave ? 1 : 0.5 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-sm font-semibold">
              {t("saveData.save")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
