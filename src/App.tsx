import { useFileState } from "./lib/useFileState";
import { create, open, save } from "./lib/files";
import { useEffect } from "react";
import { useGlobalSettings } from "./lib/useGlobalSettings";
import { Project } from "./components/Project";
import { Warning } from "phosphor-react";

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
        <Project key={fileHandle?.name ?? ""} />
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
  const apiKey = useGlobalSettings((state) => state.openAIAPIKey);
  return (
    <nav className="flex items-center gap-6 px-4 py-1 justify-between">
      {isProjectOpen ? (
        <ProjectNav isDirty={isDirty} fileHandle={fileHandle} />
      ) : (
        <div />
      )}
      <div className="flex items-center gap-6">
        <NavButton
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
        </NavButton>
        <NavButton
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
        </NavButton>
        <input
          type="password"
          className="bg-neutral-100 font-mono"
          placeholder="Paste OpenAI API Key"
          value={apiKey}
          onChange={(e) => {
            useGlobalSettings.setState({ openAIAPIKey: e.target.value });
          }}
        />
      </div>
    </nav>
  );
}

/**
 * If a file fails to load, this screen displays the error
 */
function LoadFileError({ loadFileError }: { loadFileError: Error | null }) {
  return (
    <div className="h-full grid justify-center content-center">
      <h2 className="text-xl flex items-center gap-2 mb-4 justify-self-center text-red-600">
        <Warning size={24} />
        Unable to Load File
      </h2>
      <div className="p-4 bg-red-50 text-red-700 rounded grid gap-2 min-w-[50vw]">
        <p>Read the error and edit the file accordingly.</p>
        <pre className="text-xs font-mono overflow-auto text-red-400">
          {JSON.stringify(loadFileError, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function NoProjectOpen() {
  return (
    <div className="h-full grid content-center justify-center">
      <span className="text-2xl text-neutral-400">
        Open a project or create a new one.
      </span>
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
      <h1 className="font-bold text-blue-600 tracking-wide">
        {fileHandle ? fileHandle.name : "Untitled Project"}
        {isDirty ? "*" : ""}
      </h1>
      {isDirty && fileHandle && (
        <NavButton onClick={() => save(fileHandle)}>Save</NavButton>
      )}
      <NavButton onClick={() => save()}>Save As</NavButton>
    </div>
  );
}

function NavButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-2 rounded hover:bg-neutral-100 active:bg-neutral-200"
    >
      {children}
    </button>
  );
}
