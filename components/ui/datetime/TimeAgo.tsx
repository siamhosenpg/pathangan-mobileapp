import { toBanglaNumber } from "@/utils/toBanglaNumber";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

interface Props {
  date: string | Date;
  className?: string;
}

const TimeAgo = ({ date, className }: Props) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [label, setLabel] = useState("");

  const n = (num: number) => (isBn ? toBanglaNumber(num) : String(num));

  const getLabel = () => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // ৫ দিনের বেশি → তারিখ দেখাও
    if (days >= 5) {
      const day = past.getDate();
      const year = past.getFullYear();

      const monthsBn = [
        "জানুয়ারি",
        "ফেব্রুয়ারি",
        "মার্চ",
        "এপ্রিল",
        "মে",
        "জুন",
        "জুলাই",
        "আগস্ট",
        "সেপ্টেম্বর",
        "অক্টোবর",
        "নভেম্বর",
        "ডিসেম্বর",
      ];
      const monthsEn = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      if (isBn) {
        return `${n(day)} ${monthsBn[past.getMonth()]} ${n(year)}`;
      } else {
        return `${day} ${monthsEn[past.getMonth()]} ${year}`;
      }
    }

    // ২৪ ঘণ্টার বেশি → X দিন আগে
    if (hours >= 24) {
      return isBn ? `${n(days)} দিন আগে` : `${days}d ago`;
    }

    // ১ ঘণ্টার বেশি → X ঘণ্টা আগে
    if (minutes >= 60) {
      return isBn ? `${n(hours)} ঘণ্টা আগে` : `${hours}h ago`;
    }

    // ১ মিনিটের বেশি → X মিনিট আগে
    if (seconds >= 60) {
      return isBn ? `${n(minutes)} মিনিট আগে` : `${minutes}m ago`;
    }

    // এইমাত্র
    return isBn ? "এইমাত্র" : "just now";
  };

  useEffect(() => {
    setLabel(getLabel());

    // ৫ মিনিট পর্যন্ত প্রতি ৩০ সেকেন্ডে update
    const interval = setInterval(() => {
      setLabel(getLabel());
    }, 30000);

    return () => clearInterval(interval);
  }, [date, isBn]);

  return (
    <Text
      className={
        className ?? " text-text-tertiary dark:text-dark-text-tertiary"
      }
    >
      {label}
    </Text>
  );
};

export default TimeAgo;
