import { FONT_FAMILIES, FontWeightKey } from "@/constants/fonts";
import { useFontState } from "@/utils/fontStore";
import { resolveWeight } from "@/utils/fontUtils";
import React, { createContext, useContext } from "react";
import { StyleSheet, TextProps } from "react-native";

type Props = TextProps & { className?: string };

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RN = require("react-native");

// fast refresh-এ দুইবার প্যাচ হয়ে লুপ না হয়, তাই আসল Text globalThis-এ রাখা
const g = globalThis as any;
if (!g.__OriginalText) g.__OriginalText = RN.Text;

export const OriginalText = g.__OriginalText as React.ComponentType<Props>;

// নেস্টেড Text যেন বাবার weight (bold ইত্যাদি) পায়
const WeightContext = createContext<FontWeightKey | null>(null);

function GlobalText({ style, children, ...rest }: Props) {
  const { enabled, lang } = useFontState();
  const inherited = useContext(WeightContext);

  // সুইচ বন্ধ / অন্য ভাষা / কেউ নিজে fontFamily দিয়েছে → কিছু বদলাবে না
  if (!enabled || !lang || StyleSheet.flatten(style)?.fontFamily) {
    return (
      <OriginalText {...rest} style={style}>
        {children}
      </OriginalText>
    );
  }

  const weight = resolveWeight(rest.className, style) ?? inherited ?? 400;
  const family = FONT_FAMILIES[lang][weight];

  const node = (
    <OriginalText
      {...rest}
      style={[style, { fontFamily: family, fontWeight: "normal" }]}
    >
      {children}
    </OriginalText>
  );

  const hasElementChildren =
    children != null &&
    typeof children !== "string" &&
    typeof children !== "number";

  return hasElementChildren ? (
    <WeightContext.Provider value={weight}>{node}</WeightContext.Provider>
  ) : (
    node
  );
}

try {
  Object.defineProperty(RN, "Text", {
    configurable: true,
    enumerable: true,
    get: () => GlobalText,
  });
} catch (e) {
  console.warn("[patchText] Text প্যাচ করা যায়নি:", e);
}
