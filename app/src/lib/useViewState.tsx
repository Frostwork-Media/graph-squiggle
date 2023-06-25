import { create } from "zustand";
import { OnMount } from "@monaco-editor/react";
export type Tab = "prompt" | "code" | "bindings" | "settings";

export const useViewState = create<{
  isCollapsed: boolean;
  collapse: () => void;
  editorFocused: boolean;
  tab: Tab;
  isSyncing: boolean;
  editor: null | Parameters<OnMount>[0];
}>(() => ({
  isCollapsed: true,
  collapse: () => {},
  editorFocused: false,
  tab: "code",
  isSyncing: false,
  editor: null,
}));
