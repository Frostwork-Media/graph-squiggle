import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { Project as ProjectType } from "db";
import { format } from "date-fns";
import { ActiveProject } from "../components/ActiveProject";
import { loadProject, useProject } from "../lib/useProject";
import { LoadFileError } from "./LoadFileError";
import { FullScreenSpinner } from "../components/Spinner";
import AutosizeInput from "react-input-autosize";
import { useCallback, useEffect, useState } from "react";
import { queryClient } from "../lib/queryClient";
import { useViewState } from "../lib/useViewState";
import { resetSquiggleState } from "../lib/useSquiggleState";
import { resetGraphState } from "../lib/completeGraphDataFromSquiggleState";
import { ErrorBoundary } from "react-error-boundary";

export function Project() {
  /**
   * Unload the project when the component unmounts
   */
  useEffect(() => {
    return () => {
      // unset the project content
      useProject.setState(
        {
          projectContent: undefined,
          loadFileError: undefined,
        },
        false,
        "unload project"
      );

      resetSquiggleState();
      resetGraphState();
    };
  }, []);

  const params = useParams<{ id: string }>();
  const project = useQuery<ProjectType>(
    ["project", params.id],
    async () => {
      const res = await fetch(`/api/project/byId`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: params.id }),
      });
      return await res.json();
    },
    {
      enabled: !!params.id,
      staleTime: 20000,
      cacheTime: Infinity,
    }
  );

  // load project data into state the first time only
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (!project.data || hasLoaded) return;
    setHasLoaded(true);
    loadProject(project.data.content);
  }, [project.data, hasLoaded]);

  const loadProjectError = useProject((state) => state.loadFileError);

  if (!project.data || !params.id) return <FullScreenSpinner />;
  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)] border-t">
      <div className="flex gap-2 justify-between items-center p-2 px-4 shadow-sm">
        <div className="flex gap-4 items-baseline">
          <RenameTitle projectTitle={project.data.name} id={params.id} />
          <span className="text-sm text-gray-500">
            Updated {format(new Date(project.data.updatedAt), "MMMM dd, yyyy")}
          </span>
          <span className="text-sm text-gray-500">
            Created {format(new Date(project.data.createdAt), "MMMM dd, yyyy")}
          </span>
        </div>
      </div>
      {project.isLoading ? (
        <FullScreenSpinner />
      ) : loadProjectError ? (
        <LoadFileError loadFileError={loadProjectError} />
      ) : (
        <ErrorBoundary FallbackComponent={fallbackRender}>
          <ActiveProject
            id={params.id}
            isPublic={project.data.public}
            publicName={project.data.publicName}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

function RenameTitle({
  projectTitle,
  id,
}: {
  projectTitle: string;
  id: string;
}) {
  const [inputValue, setInputValue] = useState(projectTitle);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const updateName = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/project/updateNameById`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, id }),
      });
      return await res.json();
    },
    onSettled: () => {
      useViewState.setState({ isSyncing: false });
    },
    onSuccess: (_data, name) => {
      queryClient.setQueryData<ProjectType>(["project", id], (oldData) => {
        if (!oldData) throw new Error("Project not found");
        return {
          ...oldData,
          name,
        };
      });
    },
  });

  const handleBlur = useCallback(() => {
    // if the name is not the same as the one in the query cache, update it
    const cachedProject = queryClient.getQueryData<ProjectType>([
      "project",
      id,
    ]);
    if (!cachedProject) return;
    if (cachedProject.name === inputValue) return;
    useViewState.setState({ isSyncing: true });
    updateName.mutate(inputValue);
  }, [id, inputValue, updateName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        inputRef?.blur();
        handleBlur();
      }
    },
    [handleBlur, inputRef]
  );

  return (
    <AutosizeInput
      value={inputValue}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
      }}
      inputClassName="focus:outline-none"
      className="text-xl text-blue-500 font-bold p-2 -ml-2 cursor-text border rounded border-transparent hover:border-neutral-300 focus-within:border-neutral-300 focus-within:shadow-inner"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      inputRef={setInputRef}
    />
  );
}

function fallbackRender({ error }: { error: Error }) {
  return (
    <div className="text-red-500 w-full h-full grid place-content-center">
      <div className="grid gap-1">
        <strong>Something went wrong:</strong>
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}
