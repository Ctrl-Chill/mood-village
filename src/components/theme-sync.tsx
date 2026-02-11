"use client";

import { useEffect } from "react";

const STORAGE_KEY = "mood-village-theme";

export function ThemeSync() {
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
    };

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      applyTheme(storedTheme === "dark");
      return;
    }

    applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  return null;
}
