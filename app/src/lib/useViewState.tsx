import { create } from "zustand";

export type Tab = "prompt" | "code" | "bindings";

export const useViewState = create<{
  isCollapsed: boolean;
  collapse: () => void;
  editorFocused: boolean;
  tab: Tab;
  isSyncing: boolean;
}>(() => ({
  isCollapsed: true,
  collapse: () => {},
  editorFocused: false,
  tab: "code",
  isSyncing: false,
}));
