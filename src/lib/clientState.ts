import { create } from "zustand";
import { Project } from "./schema";
import { devtools } from "zustand/middleware";

type ClientState = {
  /** The current project */
  project?: Project;
  /** The previous contents of the file */
  previousContents?: string;
  /** The file handle for the current project */
  fileHandle?: FileSystemFileHandle;
  /** The error that occurred when loading the file */
  loadFileError?: Error;
};

export const baseClientState: ClientState = {
  project: undefined,
  previousContents: undefined,
  fileHandle: undefined,
  loadFileError: undefined,
};

/**
 * This is global app state that is not persisted. It's wiped when the app
 * restarts.
 */
export const useClientState = create<ClientState>()(
  devtools((set) => ({}), {
    name: "Client State",
  })
);
