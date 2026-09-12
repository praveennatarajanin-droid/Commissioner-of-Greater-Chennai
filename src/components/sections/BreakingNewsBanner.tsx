"use client";

import React from "react";
import TopUtilityBar from "@/components/layout/TopUtilityBar";

export interface BreakingNewsBannerProps {
  breakingNews?: { id: number; title_en: string; title_ta: string; slug?: string }[];
  language?: "en" | "ta";
}

export default function BreakingNewsBanner({ breakingNews = [] }: BreakingNewsBannerProps) {
  return <TopUtilityBar breakingNews={breakingNews} />;
}
