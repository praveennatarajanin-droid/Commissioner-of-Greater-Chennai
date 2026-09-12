"use client";

import React from "react";
import TopUtilityBar from "@/components/layout/TopUtilityBar";

export interface NewsTickerProps {
  customTickerItems?: { id: number; text_en: string; text_ta: string; url?: string }[];
}

export default function NewsTicker({ customTickerItems }: NewsTickerProps = {}) {
  return <TopUtilityBar customTickerItems={customTickerItems} />;
}
