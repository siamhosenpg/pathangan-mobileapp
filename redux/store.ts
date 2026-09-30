import { setupNetworkListeners } from "@/utils/setupNetworkListeners"; // ফাইলটা যেখানে রেখেছো সেই path দাও
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./features/auth/authSlice";
import uploadReducer from "./features/upload/uploadSlice";
import videoReducer from "./features/video/videoSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    video: videoReducer,
    upload: uploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// net গেলে/এলে RTK Query কে জানাবে, যাতে refetchOnReconnect কাজ করে
setupNetworkListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
