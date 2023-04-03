import { create } from "zustand";
import { persist } from "zustand/middleware";

type GlobalSettings = {
  openAIAPIKey: string;
};

const baseGlobalSettings: GlobalSettings = {
  openAIAPIKey: "",
};
export const useGlobalSettings = create<GlobalSettings>()(
  persist((set) => baseGlobalSettings, {
    name: "global-squiggle-app-settings",
  })
);
