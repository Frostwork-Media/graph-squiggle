import { create } from "zustand";
import { ProjectContent } from "api";
import { devtools, subscribeWithSelector } from "zustand/middleware";

type FileState = {
  /** The current project */
  project?: ProjectContent;
  /** The previous contents of the file */
  previousContents?: string;
  /** The file handle for the current project */
  fileHandle?: FileSystemFileHandle;
  /** The error that occurred when loading the file */
  loadFileError?: Error;
  /** Project encoded in a base64 string (does not include `#`) */
  projectHash?: string;
};

/**
 * This is global app state that is not persisted. It's wiped when the app
 * restarts.
 */
export const useFileState = create<FileState>()(
  devtools(
    subscribeWithSelector((set) => ({})),
    {
      name: "File State",
    }
  )
);
