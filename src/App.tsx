import { useFileState } from "./lib/useFileState";
import { create, open, save } from "./lib/files";
import { useEffect } from "react";
import { SquiggleEditor } from "./components/SquiggleEditor";
import { Graph } from "./components/Graph";
import { useWatchProject } from "./lib/useSquiggleState";

export default function App() {
  const project = useFileState((state) => state.project);
  const isProjectOpen = project != null;
  const projectString = JSON.stringify(project, null, 2);
  const previousContents = useFileState(
    (state) => state.previousContents ?? ""
  );
  const isDirty = isProjectOpen
    ? projectString.trim() !== previousContents.trim()
    : false;

  const loadFileError = useFileState((state) => state.loadFileError);
  const fileHandle = useFileState((state) => state.fileHandle);

  // Add a before unload listener to warn the user if they have unsaved changes
  // and the squiggle code is not empty
  useEffect(() => {
    if (!isDirty) return;
    const listener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [isDirty]);

  return (
    <div className="h-screen grid grid-rows-[auto_minmax(0,1fr)]">
      <Nav
        isProjectOpen={isProjectOpen}
        isDirty={isDirty}
        fileHandle={fileHandle}
      />
      {loadFileError ? (
        <LoadFileError loadFileError={loadFileError} />
      ) : isProjectOpen ? (
        <Project key={fileHandle?.name} />
      ) : (
        <NoProjectOpen />
      )}
    </div>
  );
}

function Nav({
  isProjectOpen,
  isDirty,
  fileHandle,
}: {
  isProjectOpen: boolean;
  isDirty: boolean;
  fileHandle?: FileSystemFileHandle;
}) {
  return (
    <nav className="flex items-center gap-6 p-2 justify-between">
      {isProjectOpen ? (
        <ProjectNav isDirty={isDirty} fileHandle={fileHandle} />
      ) : (
        <div />
      )}
      <div className="flex items-center gap-6">
        <button
          onClick={() => {
            // if is dirty we warn user first
            if (isDirty) {
              if (
                !confirm(
                  "You have unsaved changes. Are you sure you want to close?"
                )
              )
                return;
            }
            create();
          }}
        >
          New Project
        </button>
        <button
          onClick={() => {
            // if is dirty we warn user first
            if (isDirty) {
              if (
                !confirm(
                  "You have unsaved changes. Are you sure you want to close?"
                )
              )
                return;
            }
            open();
          }}
        >
          Open Project
        </button>
      </div>
    </nav>
  );
}

/**
 * The editor to display when a project is open
 */
function LoadFileError({ loadFileError }: { loadFileError: Error | null }) {
  return (
    <div className="h-full grid justify-center content-center">
      <div className="p-2 bg-neutral-100 rounded">
        <h2 className="text-lg font-bold">Unable to Load File</h2>
        <pre className="text-xs font-mono overflow-auto">
          {JSON.stringify(loadFileError, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function NoProjectOpen() {
  return (
    <div className="h-full grid content-center justify-center">
      No Project Open
    </div>
  );
}

function ProjectNav({
  isDirty,
  fileHandle,
}: {
  isDirty: boolean;
  fileHandle?: FileSystemFileHandle;
}) {
  return (
    <div className="flex items-center gap-6">
      <h1 className="font-bold">
        {fileHandle ? fileHandle.name : "Untitled Project"}
        {isDirty ? "*" : ""}
      </h1>
      {isDirty && fileHandle && (
        <button onClick={() => save(fileHandle)}>Save</button>
      )}
      <button onClick={() => save()}>Save As</button>
    </div>
  );
}

/**
 * Mounted when a valid project is opened
 */
function Project() {
  useWatchProject();
  return (
    <div className="h-full relative">
      <div className="absolute top-0 left-2 z-10 rounded border">
        <SquiggleEditor />
      </div>
      <Graph />
    </div>
  );
}
