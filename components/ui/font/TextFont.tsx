import type { FontWeightKey } from "@/constants/fonts";
import { useFontState } from "@/utils/fontStore";
import {
  getFontFamily,
  resolveWeight,
  splitByScript,
  toRNWeight,
} from "@/utils/fontUtils";
import { OriginalText } from "@/utils/patchText";
import React from "react";
import { StyleSheet, TextProps } from "react-native";

type Props = TextProps & { className?: string };

function renderChildren(
  children: React.ReactNode,
  weight: FontWeightKey,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return splitByScript(String(child)).map((seg, i) => {
        const family = getFontFamily(seg.script, weight);
        return (
          <OriginalText
            key={i}
            style={
              family
                ? { fontFamily: family, fontWeight: "normal" }
                : { fontWeight: toRNWeight(weight) }
            }
          >
            {seg.text}
          </OriginalText>
        );
      });
    }

    if (React.isValidElement(child) && child.type === React.Fragment) {
      return renderChildren(
        (child.props as { children?: React.ReactNode }).children,
        weight,
      );
    }

    return child;
  });
}

export default function TextFont({ children, style, ...rest }: Props) {
  const { enabled } = useFontState();

  const hasOwnFamily = !!StyleSheet.flatten(style)?.fontFamily;

  if (!enabled || hasOwnFamily) {
    return (
      <OriginalText {...rest} style={style}>
        {children}
      </OriginalText>
    );
  }

  const weight = resolveWeight(rest.className, style) ?? 400;

  if (typeof children === "string" || typeof children === "number") {
    const segs = splitByScript(String(children));
    if (segs.length === 1) {
      const family = getFontFamily(segs[0].script, weight);
      return (
        <OriginalText
          {...rest}
          style={
            family
              ? [style, { fontFamily: family, fontWeight: "normal" }]
              : style
          }
        >
          {children}
        </OriginalText>
      );
    }
  }

  return (
    <OriginalText {...rest} style={style}>
      {renderChildren(children, weight)}
    </OriginalText>
  );
}
