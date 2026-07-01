import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, ToastAndroid } from "react-native";

export function useExitConfirm() {
  const { t } = useTranslation();
  const backPressedOnce = useRef(false);

  // ← useFocusEffect — শুধু এই screen focused থাকলেই active হবে
  // screen blur হলে (অন্য page এ গেলে) automatically remove হয়ে যাবে
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (backPressedOnce.current) {
            BackHandler.exitApp();
            return true;
          }

          backPressedOnce.current = true;
          ToastAndroid.show(t("pressAgainToExit"), ToastAndroid.SHORT);

          setTimeout(() => {
            backPressedOnce.current = false;
          }, 2000);

          return true;
        },
      );

      // screen থেকে চলে গেলে listener remove হবে
      return () => subscription.remove();
    }, [t]),
  );
}
