import { createSlice } from "@reduxjs/toolkit";

interface VideoState {
  isMuted: boolean;
}

const initialState: VideoState = {
  isMuted: false,
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },
  },
});

export const { toggleMute } = videoSlice.actions;
export default videoSlice.reducer;
