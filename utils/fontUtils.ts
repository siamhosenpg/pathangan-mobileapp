import { FONT_FAMILIES, FontWeightKey } from "@/constants/fonts";
import { StyleProp, StyleSheet, TextStyle } from "react-native";

export type Script = "bn" | "en" | "other";
export type Segment = { text: string; script: Script };

// বাংলা ব্লক + দাঁড়ি (।)
const BN_RE = /[\u0980-\u09FF\u0964\u0965]/;
// ল্যাটিন অক্ষর (ইংরেজি + accent সহ)
const LATIN_RE = /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/;
// নিরপেক্ষ: স্পেস, ASCII সংখ্যা, ASCII চিহ্ন, ZWJ/ZWNJ, combining mark, typographic চিহ্ন
const NEUTRAL_RE =
  /[\s\d\u200C\u200D\u0300-\u036F\u2010-\u2027\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;

function classify(ch: string): Script | null {
  if (BN_RE.test(ch)) return "bn";
  if (LATIN_RE.test(ch)) return "en";
  if (NEUTRAL_RE.test(ch)) return null; // আগের অংশের সাথে যাবে
  return "other"; // আরবি, হিন্দি, emoji ইত্যাদি → ডিভাইস ডিফল্ট
}

const cache = new Map<string, Segment[]>();

export function splitByScript(text: string): Segment[] {
  const cached = cache.get(text);
  if (cached) return cached;

  const segments: Segment[] = [];
  let current: Script | null = null;
  let run = "";

  for (const ch of text) {
    const script = classify(ch);

    if (script === null) {
      run += ch;
      continue;
    }
    if (current === null) {
      current = script;
      run += ch;
      continue;
    }
    if (script === current) {
      run += ch;
      continue;
    }
    segments.push({ text: run, script: current });
    run = ch;
    current = script;
  }

  if (run) segments.push({ text: run, script: current ?? "en" });

  if (cache.size > 500) cache.clear();
  cache.set(text, segments);
  return segments;
}

/* ───────── weight ───────── */

const CLASS_WEIGHTS: Record<string, FontWeightKey> = {
  thin: 400,
  extralight: 400,
  light: 400,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 700,
  black: 700,
};

function normalizeWeight(w: string | number): FontWeightKey {
  if (w === "normal") return 400;
  if (w === "bold") return 700;
  const n = typeof w === "number" ? w : parseInt(w, 10);
  if (Number.isNaN(n)) return 400;
  if (n < 450) return 400;
  if (n < 550) return 500;
  if (n < 650) return 600;
  return 700;
}

export function resolveWeight(
  className?: string,
  style?: StyleProp<TextStyle>,
): FontWeightKey | null {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  if (flat?.fontWeight) return normalizeWeight(flat.fontWeight);

  if (className) {
    const re =
      /(?:^|\s)font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?=\s|$)/g;
    let last: string | null = null;
    let m: RegExpExecArray | null;
    while ((m = re.exec(className)) !== null) last = m[1];
    if (last) return CLASS_WEIGHTS[last];
  }
  return null;
}

export function toRNWeight(w: FontWeightKey): TextStyle["fontWeight"] {
  return String(w) as TextStyle["fontWeight"];
}

export function getFontFamily(
  script: Script,
  weight: FontWeightKey,
): string | undefined {
  if (script === "other") return undefined;
  return FONT_FAMILIES[script][weight];
}
