import { baseAppState, useAppState } from "./useAppState";
import { isError } from "./isError";
import { getEmptyProject, projectSchema } from "./schema";

/**
 * Create a new project
 */
export function create() {
  useAppState.setState(
    {
      ...baseAppState,
      project: getEmptyProject(),
      previousContents: JSON.stringify(getEmptyProject(), null, 2),
    },
    false,
    "create"
  );
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
      useAppState.setState(
        {
          ...baseAppState,
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
      useAppState.setState(
        {
          ...baseAppState,
          loadFileError: isError(error)
            ? error
            : new Error("Unable to load file"),
        },
        false,
        "open/error"
      );

      return;
    }

    console.log(contents);
    return file;
  } catch (error) {
    // console.error(error);
  }
}

/** Remove file and handle from client state. Back to main screen */
export function close() {
  useAppState.setState(baseAppState, false, "close");
}

/**
 * Save the current project to the file system
 * as a json file
 *
 * If called with a fileHandle, it will save to that file
 * If called without a fileHandle, it will open a file picker
 */
export async function save(_fileHandle?: FileSystemFileHandle) {
  const { project } = useAppState.getState();
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
    useAppState.setState(
      {
        ...baseAppState,
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
