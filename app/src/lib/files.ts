import {
  baseFileState,
  deserializeProject,
  serializeProject,
  useFileState,
} from "./useFileState";
import { isError } from "./isError";
import { getEmptyProject, projectSchema } from "./schema";
import {
  baseGraphState,
  useGraphState,
} from "./completeGraphDataFromSquiggleState";
import { useNodeLocation } from "./useNodeLocation";

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
  // clear hash if it exists
  window.history.replaceState({}, document.title, "/");
}

/**
 * loadFile load a file
 */
export async function loadFile() {
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

      // if no subject, add empty one
      if (!json.subject) {
        json.subject = "";
      }

      // delete old unused "context" property if it exists
      if (json.context) {
        delete json.context;
      }

      // if no nodeLocation exists, add an empty one
      if (!json.nodeLocation) {
        json.nodeLocation = {};
      }

      const project = projectSchema.parse(json);

      // set the nodeLocation state
      useNodeLocation.setState(json.nodeLocation);

      const projectHash = serializeProject(project);

      useFileState.setState(
        {
          ...baseFileState,
          project,
          previousContents: contents,
          fileHandle,
          projectHash,
        },
        false,
        "open"
      );

      // set the project url
    } catch (error) {
      if (isError(error)) {
        console.error(error.message);
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

    // update the project url
    const projectHash = serializeProject(project);
    useFileState.setState({ projectHash }, false, "saveAs");
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
          projectHash: base64,
        },
        false,
        "loadFromHash"
      );

      // set the nodeLocation state
      useNodeLocation.setState(project.nodeLocation ?? {});
    }
  } catch (error) {
    if (isError(error)) {
      console.error(error.message);
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
