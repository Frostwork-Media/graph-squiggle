import { create } from "zustand";
import { ProjectContent, projectSchema } from "shared";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { isError } from "./isError";
import type { Prisma } from "db";
import { runSquiggle } from "./runSquiggle";
import { useSquiggleState } from "./useSquiggleState";
import { completeGraphDataFromSquiggleState } from "./completeGraphDataFromSquiggleState";

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
    useProject.setState({
      projectContent,
      loadFileError: undefined,
    });
    const squiggle = projectContent.squiggle;
    runSquiggle(squiggle);
    const squiggleState = useSquiggleState.getState();
    completeGraphDataFromSquiggleState(squiggleState);
  } catch (error) {
    if (isError(error)) {
      console.error(error.message);
    }
    useProject.setState({
      projectContent: undefined,
      loadFileError: isError(error) ? error : new Error("Unable to load file"),
    });
    return;
  }
}

/** Updates the squiggle code in the client-side project content */
export function updateSquiggle(squiggle: string) {
  useProject.setState((state) => {
    if (!state.projectContent) return state;
    return {
      ...state,
      projectContent: {
        ...state.projectContent,
        squiggle,
      },
    };
  });
}
