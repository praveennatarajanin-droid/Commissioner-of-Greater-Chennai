"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type TextSize = "small" | "normal" | "large" | "xlarge";
export type ThemeMode = "light" | "dark";

interface AccessibilityContextType {
  isHighContrast: boolean;
  theme: ThemeMode;
  textSize: TextSize;
  isPanelOpen: boolean;
  isScreenReaderModalOpen: boolean;
  toggleHighContrast: () => void;
  setHighContrast: (enabled: boolean) => void;
  setLightMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  decreaseTextSize: () => void;
  resetTextSize: () => void;
  increaseTextSize: () => void;
  resetAll: () => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  openScreenReaderModal: () => void;
  closeScreenReaderModal: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isHighContrast, setIsHighContrastState] = useState<boolean>(false);
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isScreenReaderModalOpen, setIsScreenReaderModalOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Initialize from localStorage and inline head script settings
  useEffect(() => {
    try {
      const savedHC = localStorage.getItem("accessibility-high-contrast");
      if (savedHC === "true") {
        setIsHighContrastState(true);
      }

      const savedSize = localStorage.getItem("accessibility-text-size") as TextSize | null;
      if (savedSize && ["small", "normal", "large", "xlarge"].includes(savedSize)) {
        setTextSizeState(savedSize);
      }

      const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
      }
    } catch (e) {
      console.warn("Accessibility settings read error:", e);
    }
    setMounted(true);
  }, []);

  // Synchronize High Contrast with DOM
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add("high-contrast");
      root.setAttribute("data-high-contrast", "true");
      try {
        localStorage.setItem("accessibility-high-contrast", "true");
      } catch {}
    } else {
      root.classList.remove("high-contrast");
      root.removeAttribute("data-high-contrast");
      try {
        localStorage.setItem("accessibility-high-contrast", "false");
      } catch {}
    }
  }, [isHighContrast, mounted]);

  // Synchronize Text Sizing with DOM
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-font-size", textSize);
    try {
      localStorage.setItem("accessibility-text-size", textSize);
    } catch {}
  }, [textSize, mounted]);

  // Synchronize Theme (Light / Dark) with DOM when not High Contrast
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    }
  }, [theme, mounted]);

  // High Contrast Handler
  const setHighContrast = useCallback((enabled: boolean) => {
    setIsHighContrastState(enabled);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrastState((prev) => !prev);
  }, []);

  // Light Mode Handler
  const setLightMode = useCallback(() => {
    setIsHighContrastState(false);
    setThemeState("light");
    const root = document.documentElement;
    root.classList.remove("dark", "high-contrast");
    root.removeAttribute("data-high-contrast");
    root.style.colorScheme = "light";
    try {
      localStorage.setItem("theme", "light");
      localStorage.setItem("accessibility-high-contrast", "false");
    } catch {}
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    if (mode === "light") {
      setIsHighContrastState(false);
    }
  }, []);

  // Text Sizing Handlers
  const setTextSize = useCallback((size: TextSize) => {
    setTextSizeState(size);
  }, []);

  const decreaseTextSize = useCallback(() => {
    setTextSizeState((prev) => {
      if (prev === "xlarge") return "large";
      if (prev === "large") return "normal";
      return "small";
    });
  }, []);

  const resetTextSize = useCallback(() => {
    setTextSizeState("normal");
  }, []);

  const increaseTextSize = useCallback(() => {
    setTextSizeState((prev) => {
      if (prev === "small") return "normal";
      if (prev === "normal") return "large";
      return "xlarge";
    });
  }, []);

  // Reset All to Default
  const resetAll = useCallback(() => {
    setIsHighContrastState(false);
    setThemeState("light");
    setTextSizeState("normal");
    const root = document.documentElement;
    root.classList.remove("dark", "high-contrast");
    root.removeAttribute("data-high-contrast");
    root.setAttribute("data-font-size", "normal");
    root.style.colorScheme = "light";
    try {
      localStorage.setItem("accessibility-high-contrast", "false");
      localStorage.setItem("accessibility-text-size", "normal");
      localStorage.setItem("theme", "light");
    } catch {}
  }, []);

  // Panel Handlers
  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  // Screen Reader Modal Handlers
  const openScreenReaderModal = useCallback(() => {
    setIsScreenReaderModalOpen(true);
  }, []);

  const closeScreenReaderModal = useCallback(() => {
    setIsScreenReaderModalOpen(false);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        isHighContrast,
        theme,
        textSize,
        isPanelOpen,
        isScreenReaderModalOpen,
        toggleHighContrast,
        setHighContrast,
        setLightMode,
        setThemeMode,
        setTextSize,
        decreaseTextSize,
        resetTextSize,
        increaseTextSize,
        resetAll,
        togglePanel,
        openPanel,
        closePanel,
        openScreenReaderModal,
        closeScreenReaderModal,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
