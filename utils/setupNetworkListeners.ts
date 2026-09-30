import NetInfo from "@react-native-community/netinfo";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

/**
 * React Native এ browser এর online/offline event নেই,
 * তাই NetInfo দিয়ে RTK Query কে জানাই। এতে refetchOnReconnect কাজ করে।
 *
 * store.ts এ configureStore এর ঠিক পরে একবার ডাকো:
 *   setupNetworkListeners(store.dispatch);
 */
export const setupNetworkListeners = (
  dispatch: ThunkDispatch<any, any, UnknownAction>,
) =>
  setupListeners(dispatch, (dispatch, { onOnline, onOffline }) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable শুরুতে null থাকতে পারে, তাই শুধু false হলে offline ধরি
      if (state.isConnected && state.isInternetReachable !== false) {
        dispatch(onOnline());
      } else {
        dispatch(onOffline());
      }
    });

    return unsubscribe;
  });
