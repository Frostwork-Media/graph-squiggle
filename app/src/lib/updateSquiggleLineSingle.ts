import throttle from "lodash.throttle";
import produce from "immer";
import { useProject } from "./useProject";
/**
 * Takes in a code string and updates the value of a line
 * that sets a single variable to a new value.
 */
export function updateSquiggleLineSingle(
  code: string,
  lineNumber: number,
  newValue: any
): string {
  const lines = code.split("\n");
  const lineToUpdate = lines[lineNumber - 1];

  const regex = /^(\s*\w+\s*=\s*)([\d\w.]+)(\s*;?\s*)$/;

  if (regex.test(lineToUpdate)) {
    const updatedLine = lineToUpdate.replace(regex, `$1${newValue}$3`);
    lines[lineNumber - 1] = updatedLine;
    return lines.join("\n");
  } else {
    console.error("Line does not match the required format");
  }

  return code;
}

/**
 * Takes in a code string and updates the value of a line
 * that sets a distribution (a to b) to new values.
 */
export function updateSquiggleLineDistribution(
  code: string,
  lineNumber: number,
  lowerBound: number,
  upperBound: number
) {
  const lines = code.split("\n");
  const lineToUpdate = lines[lineNumber - 1];

  const regex = /^(\s*\w+\s*=\s*)(\d*\.?\d+)(\s*to\s*)(\d*\.?\d+)(\s*;?\s*)$/;

  if (regex.test(lineToUpdate)) {
    const updatedLine = lineToUpdate.replace(
      regex,
      `$1${lowerBound}$3${upperBound}$5`
    );
    lines[lineNumber - 1] = updatedLine;
    return lines.join("\n");
  } else {
    console.error("Line does not match the required format");
  }

  return code;
}

/**
 * Update the current code when changing a single value in the graph
 */
export const throttleSingleUpdate = throttle((line: number, value: string) => {
  const newCode = updateSquiggleLineSingle(
    useProject.getState().projectContent?.squiggle ?? "",
    line,
    value
  );
  useProject.setState(
    produce((draft) => {
      if (!draft.projectContent) return;
      draft.projectContent.squiggle = newCode;
    }),
    false,
    "throttleSingleUpdate"
  );
}, 250);

export const throttleDistributionUpdate = throttle(
  (line: number, lowerBound: number, upperBound: number) => {
    const newCode = updateSquiggleLineDistribution(
      useProject.getState().projectContent?.squiggle ?? "",
      line,
      lowerBound,
      upperBound
    );
    useProject.setState(
      produce((draft) => {
        if (!draft.projectContent) return;
        draft.projectContent.squiggle = newCode;
      }),
      false,
      "throttleDistributionUpdate"
    );
  },
  250
);
