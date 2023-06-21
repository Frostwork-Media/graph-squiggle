import { create } from "zustand";
import { ProjectContent, projectSchema } from "api";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { isError } from "./isError";
import type { Prisma, Project } from "db";
import { runSquiggle } from "./runSquiggle";
import { useSquiggleState } from "./useSquiggleState";
import { completeGraphDataFromSquiggleState } from "./completeGraphDataFromSquiggleState";
import { useNodeLocation } from "./useNodeLocation";
import { saveAs } from "file-saver";
import { queryClient } from "./queryClient";

export const useProject = create<{
  /** The current project's content () */
  projectContent?: ProjectContent;
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
    const projectContent = projectSchema.parse(content);
    useProject.setState(
      {
        projectContent,
        loadFileError: undefined,
      },
      false,
      "loadProject"
    );
    if (projectContent.nodeLocation) {
      useNodeLocation.setState(projectContent.nodeLocation);
    }
    const squiggle = projectContent.squiggle;
    runSquiggle(squiggle);
    const squiggleState = useSquiggleState.getState();
    completeGraphDataFromSquiggleState(squiggleState);
    return projectContent;
  } catch (error) {
    if (isError(error)) {
      console.error(error.message);
    }
    useProject.setState(
      {
        projectContent: undefined,
        loadFileError: isError(error)
          ? error
          : new Error("Unable to load file"),
      },
      false,
      "loadProject error"
    );
    return;
  }
}

/** Updates the squiggle code in the client-side project content */
export function updateSquiggle(squiggle: string) {
  useProject.setState(
    (state) => {
      if (!state.projectContent) return state;
      return {
        ...state,
        projectContent: {
          ...state.projectContent,
          squiggle,
        },
      };
    },
    false,
    "updateSquiggle"
  );
}

export function useRenderPercentages() {
  return useProject(
    (state) => state.projectContent?.renderPercentages ?? false
  );
}

export function downloadProjectAsFile() {
  const { projectContent } = useProject.getState();
  if (!projectContent) return;
  const blob = new Blob([JSON.stringify(projectContent)], {
    type: "application/json",
  });
  saveAs(blob, "project.json");
}

/**
 * Opens a file picker and loads the selected file
 * into the client-side state
 */
export async function openFile(id: string) {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const contents = await file.text();
  const json = JSON.parse(contents);
  const content = loadProject(json);
  // if (id) {
  //   queryClient.setQueryData<Project>(["project", id], (data) => {
  //     if (!data) return data;
  //     return {
  //       ...data,
  //       content: content ?? data.content,
  //     };
  //   });
  // }
  return file;
}
