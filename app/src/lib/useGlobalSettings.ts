import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

type GlobalSettings = {
  openAIAPIKey: string;
};

const baseGlobalSettings: GlobalSettings = {
  openAIAPIKey: "",
};
export const useGlobalSettings = create<GlobalSettings>()(
  devtools(
    persist((set) => baseGlobalSettings, {
      name: "global-squiggle-app-settings",
    }),
    {
      name: "Global Settings",
    }
  )
);
