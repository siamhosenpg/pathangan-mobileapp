import { createContext, useContext } from "react";

interface SavedCollectionContextValue {
  // সেভড পেজে এখন যে কালেকশন খোলা আছে তার id
  // সেভড পেজের বাইরে (হোম ফিড ইত্যাদি) এটা null থাকে
  collectionId: string | null;
}

export const SavedCollectionContext =
  createContext<SavedCollectionContextValue>({ collectionId: null });

export const useSavedCollection = () => useContext(SavedCollectionContext);
