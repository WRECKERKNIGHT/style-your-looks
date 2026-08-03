"use client";

import { create } from "zustand";

export interface AppSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  reducedMotion: boolean;
  showLandmarks: boolean;
  exportOnSave: boolean;
  soundEffects: boolean;
  dashboardLayout: "grid" | "list";
}

const STORAGE_KEY = "zervey_settings";

const DEFAULTS: AppSettings = {
  autoSave: true,
  autoSaveInterval: 30,
  reducedMotion: false,
  showLandmarks: true,
  exportOnSave: false,
  soundEffects: false,
  dashboardLayout: "grid",
};

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function persistSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULTS,
  loaded: false,
  updateSetting: (key, value) => {
    set((state) => {
      const next = { ...state.settings, [key]: value };
      persistSettings(next);
      return { settings: next };
    });
  },
  resetSettings: () => {
    persistSettings(DEFAULTS);
    set({ settings: DEFAULTS });
  },
  exportData: () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("zervey_")) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key)!);
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return JSON.stringify(data, null, 2);
  },
  importData: (json: string) => {
    try {
      const data = JSON.parse(json);
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith("zervey_")) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
      set({ settings: loadSettings() });
      return true;
    } catch {
      return false;
    }
  },
}));

export function useSettings() {
  const { settings, updateSetting, resetSettings, exportData, importData } =
    useSettingsStore();

  return { settings, updateSetting, resetSettings, exportData, importData };
}
