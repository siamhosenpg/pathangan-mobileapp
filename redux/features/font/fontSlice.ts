import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FontState {
  customFontEnabled: boolean;
}

const initialState: FontState = {
  customFontEnabled: true,
};

const fontSlice = createSlice({
  name: "font",
  initialState,
  reducers: {
    setCustomFont(state, action: PayloadAction<boolean>) {
      state.customFontEnabled = action.payload;
    },
  },
});

export const { setCustomFont } = fontSlice.actions;
export default fontSlice.reducer;
