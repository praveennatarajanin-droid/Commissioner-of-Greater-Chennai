"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ContentProtection() {
  const pathname = usePathname();

  useEffect(() => {
    // 🔓 Bypass content protection for Admin Controller pages so admins can edit CMS text normally
    if (pathname && pathname.startsWith("/controller")) {
      return;
    }

    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Prevent Text Copy & Cut
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Prevent Image / Element Dragging
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 4. Prevent Text Selection Start
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow select in text input fields if any exist
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // 5. Intercept Security Key Combinations (DevTools, View Source, Print, Save, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // F12 (DevTools)
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // PrintScreen Key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("");
        }
        e.preventDefault();
        return false;
      }

      if (ctrlOrCmd) {
        const key = e.key.toLowerCase();
        // Ctrl+Shift+I / J / C (DevTools)
        if (e.shiftKey && (key === "i" || key === "j" || key === "c")) {
          e.preventDefault();
          return false;
        }
        // Ctrl+U (View Source)
        if (key === "u") {
          e.preventDefault();
          return false;
        }
        // Ctrl+S (Save Webpage)
        if (key === "s") {
          e.preventDefault();
          return false;
        }
        // Ctrl+P (Print Webpage)
        if (key === "p") {
          e.preventDefault();
          return false;
        }
        // Ctrl+C / Ctrl+X (Copy / Cut)
        if (key === "c" || key === "x") {
          const target = e.target as HTMLElement;
          if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
            return true;
          }
          e.preventDefault();
          return false;
        }
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("selectstart", handleSelectStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("selectstart", handleSelectStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname]);

  return null;
}
