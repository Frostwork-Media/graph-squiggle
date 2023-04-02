import { useFileState } from "./lib/useFileState";
import { close, create, open, save } from "./lib/files";
import { useEffect } from "react";
import { SquiggleEditor } from "./components/SquiggleEditor";
import { Graph } from "./components/Graph";
import { useWatchProject } from "./lib/useSquiggleState";

export default function App() {
  return <Editor />;
}

/**
 * The editor to display when a project is open
 */
function Editor() {
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
    <div>
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
        Create New Project
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
        Open
      </button>
      <hr />
      {isProjectOpen ? (
        <Project isDirty={isDirty} />
      ) : loadFileError ? (
        <>
          <h2>Unable to Load File</h2>
          <pre>{JSON.stringify(loadFileError, null, 2)}</pre>
        </>
      ) : (
        <p>No project open</p>
      )}
    </div>
  );
}

/**
 * Mounted when a valid project is opened
 */
function Project({ isDirty }: { isDirty: boolean }) {
  const fileHandle = useFileState((state) => state.fileHandle);
  useWatchProject();
  return (
    <div>
      <h1>
        {fileHandle ? fileHandle.name : "Untitled Project"}
        {isDirty ? "*" : ""}
      </h1>
      {isDirty && fileHandle && (
        <button onClick={() => save(fileHandle)}>Save</button>
      )}
      <button onClick={() => save()}>Save As</button>
      <hr />
      <SquiggleEditor />
      <Graph />
    </div>
  );
}
