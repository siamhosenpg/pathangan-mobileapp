import { createSlice } from "@reduxjs/toolkit";

interface VideoState {
  isMuted: boolean;
  isAutoPlay: boolean;
}

const initialState: VideoState = {
  isMuted: false,
  isAutoPlay: true, // default: auto-play চালু
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },
    toggleAutoPlay(state) {
      state.isAutoPlay = !state.isAutoPlay;
    },
  },
});

export const { toggleMute, toggleAutoPlay } = videoSlice.actions;
export default videoSlice.reducer;
