import {
  baseFileState,
  deserializeProject,
  useFileState,
} from "./useFileState";
import { isError } from "./isError";
import { getEmptyProject, projectSchema } from "./schema";
import {
  baseGraphState,
  useGraphState,
} from "./completeGraphDataFromSquiggleState";

/**
 * Create a new project
 */
export function create() {
  useFileState.setState(
    {
      ...baseFileState,
      project: getEmptyProject(),
      previousContents: JSON.stringify(getEmptyProject(), null, 2),
    },
    false,
    "create"
  );
  useGraphState.setState(baseGraphState, true, "create");
}

export async function open() {
  try {
    // Open file picker and destructure the result the first handle
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "JSON Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    });
    const file = await fileHandle.getFile();

    // Read file contents
    const contents = await file.text();

    // try to parse it as JSON
    try {
      const json = JSON.parse(contents);
      const project = projectSchema.parse(json);
      useFileState.setState(
        {
          ...baseFileState,
          project,
          previousContents: contents,
          fileHandle,
        },
        false,
        "open"
      );
    } catch (error) {
      if (isError(error)) {
        console.log(error.message);
      }
      useFileState.setState(
        {
          ...baseFileState,
          loadFileError: isError(error)
            ? error
            : new Error("Unable to load file"),
        },
        false,
        "open/error"
      );

      return;
    }
    return file;
  } catch (error) {
    // console.error(error);
  }
}

/** Remove file and handle from client state. Back to main screen */
export function close() {
  useFileState.setState(baseFileState, false, "close");
}

/**
 * Save the current project to the file system
 * as a json file
 *
 * If called with a fileHandle, it will save to that file
 * If called without a fileHandle, it will open a file picker
 */
export async function save(_fileHandle?: FileSystemFileHandle) {
  const { project } = useFileState.getState();
  if (!project) return;

  try {
    // Open file picker and destructure the result the first handle
    const fileHandle =
      _fileHandle ||
      (await window.showSaveFilePicker({
        types: [
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
        excludeAcceptAllOption: true,
      }));

    const contents = JSON.stringify(project, null, 2);
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
    useFileState.setState(
      {
        ...baseFileState,
        project,
        previousContents: contents,
        fileHandle,
      },
      false,
      "saveAs"
    );
  } catch (error) {
    console.error(error);
  }
}

export async function loadFromHash() {
  try {
    const hash = window.location.hash;
    if (hash) {
      const base64 = hash.slice(1);
      const project = deserializeProject(base64);
      useFileState.setState(
        {
          ...baseFileState,
          project,
          projectUrl: window.location.href,
        },
        false,
        "loadFromHash"
      );
    }
  } catch (error) {
    if (isError(error)) {
      console.log(error.message);
    }

    useFileState.setState(
      {
        ...baseFileState,
        loadFileError: isError(error)
          ? error
          : new Error("Unable to load file"),
      },
      false,
      "loadFromHash/error"
    );
  } finally {
    // remove the hash from the url
    window.history.replaceState({}, document.title, "/");
  }
}
