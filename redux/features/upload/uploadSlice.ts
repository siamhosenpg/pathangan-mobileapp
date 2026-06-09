import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UploadState {
  isUploading: boolean;
  progress: number; // 0-100
  status: "idle" | "uploading" | "done" | "error";
}

const initialState: UploadState = {
  isUploading: false,
  progress: 0,
  status: "idle",
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    startUpload(state) {
      state.isUploading = true;
      state.progress = 0;
      state.status = "uploading";
    },
    setProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    finishUpload(state) {
      state.isUploading = false;
      state.progress = 100;
      state.status = "done";
    },
    failUpload(state) {
      state.isUploading = false;
      state.progress = 0;
      state.status = "error";
    },
    resetUpload(state) {
      state.isUploading = false;
      state.progress = 0;
      state.status = "idle";
    },
  },
});

export const {
  startUpload,
  setProgress,
  finishUpload,
  failUpload,
  resetUpload,
} = uploadSlice.actions;

export default uploadSlice.reducer;
