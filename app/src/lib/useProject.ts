import { create } from "zustand";
import { Project, projectSchema } from "shared";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { isError } from "./isError";
import type { Prisma } from "db";

export const useProject = create<{
  /** The current project */
  project?: Project;
  /** The error that occurred when loading the file */
  loadFileError?: Error;
}>()(
  devtools(
    subscribeWithSelector((set) => ({})),
    { name: "useProject" }
  )
);

/**
 * Takes the content from the hosted project and makes sure that it is valid
 * before setting it in client-side state.
 */
export function loadProject(content: Prisma.JsonValue) {
  try {
    const project = projectSchema.parse(content);
    useProject.setState({
      project,
      loadFileError: undefined,
    });
  } catch (error) {
    if (isError(error)) {
      console.error(error.message);
    }
    useProject.setState({
      project: undefined,
      loadFileError: isError(error) ? error : new Error("Unable to load file"),
    });
    return;
  }
}
