import { useFileState } from "../lib/useFileState";
import { create, loadFromHash, loadFile, save } from "../lib/files";
import { CSSProperties, useEffect, useState } from "react";
import { useGlobalSettings } from "../lib/useGlobalSettings";
import { Project } from "../components/Project";
import { Check } from "phosphor-react";
import { NODE_WIDTH } from "../components/CustomNode";
import { LoadFileError } from "./LoadFileError";

export function Temp() {
  useEffect(() => {
    // check for hash
    const hash = window.location.hash;
    // if there is a hash that's longer then 1 character, then it may be a project
    if (hash.length > 1) {
      // check if it is "#new" and create a new chart if so
      if (hash === "#new") {
        create();
      } else {
        // try to load it
        loadFromHash();
      }
    }
  }, []);
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
    <div
      className="grid grid-rows-[auto_minmax(0,1fr)] border-t"
      style={{ "--node-width": NODE_WIDTH } as CSSProperties}
    >
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
                !window.confirm(
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
                !window.confirm(
                  "You have unsaved changes. Are you sure you want to close?"
                )
              )
                return;
            }
            loadFile();
          }}
        >
          Open Project
        </NavButton>
        <input
          type="password"
          className="bg-neutral-100 font-mono text-sm p-1 rounded text-neutral-500"
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
      <CopyShareUrl />
    </div>
  );
}

function CopyShareUrl() {
  const projectHash = useFileState((state) => state.projectHash);
  const [success, setSuccess] = useState(false);
  return (
    <>
      <NavButton
        onClick={async () => {
          // current url
          let url = new URL(window.location.href);
          // add projectHash as hash
          url.hash = projectHash ?? "";
          await navigator.clipboard.writeText(url.toString());
          setSuccess(true);
          setTimeout(() => setSuccess(false), 1500);
        }}
        className={success ? "text-green-500" : ""}
      >
        Copy Share URL
      </NavButton>
      {success && (
        <span className="animate-ping text-green-800 text-xs font-bold">
          <Check weight="bold" />
        </span>
      )}
    </>
  );
}

function NavButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors flex items-center gap-2 p-2 rounded hover:bg-neutral-100 active:bg-neutral-200 ${className}`}
    >
      {children}
    </button>
  );
}
