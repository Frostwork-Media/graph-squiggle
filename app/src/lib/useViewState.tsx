import { create } from "zustand";

export const useViewState = create<{
  isCollapsed: boolean;
  collapse: () => void;
  editorFocused: boolean;
}>(() => ({ isCollapsed: true, collapse: () => {}, editorFocused: false }));
