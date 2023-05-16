import { create } from "zustand";
import { Project } from "./schema";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import pako from "pako";

type FileState = {
  /** The current project */
  project?: Project;
  /** The previous contents of the file */
  previousContents?: string;
  /** The file handle for the current project */
  fileHandle?: FileSystemFileHandle;
  /** The error that occurred when loading the file */
  loadFileError?: Error;
  /** Project encoded in a base64 string (does not include `#`) */
  projectHash?: string;
};

export const baseFileState: FileState = {
  project: undefined,
  previousContents: undefined,
  fileHandle: undefined,
  loadFileError: undefined,
  projectHash: undefined,
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

export function serializeProject(project: Project) {
  const json = JSON.stringify(project);
  const compressed = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return base64;
}

export function deserializeProject(base64: string) {
  const compressed = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const json = pako.inflate(compressed, { to: "string" });
  const project = JSON.parse(json);
  return project;
}
