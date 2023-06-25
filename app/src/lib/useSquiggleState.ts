import { create } from "zustand";
import { SqProject } from "@quri/squiggle-lang";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { isLetStatement } from "./sqProjectToCyElements";
import { getTextFromLocationRange } from "./getTextFromLocationRange";

/**
 * Stores the processed squiggle code, along with the code that was run
 */
export type SquiggleState = {
  /** The squiggle code that was run */
  squiggleCode?: string;
  /** The parsed squiggle object */
  squiggleRunResult?: SqProject;
  /** The error that occurred when running the code */
  squiggleRunError?: string;
};

const baseSquiggleState: SquiggleState = {};
export const useSquiggleState = create<SquiggleState>()(
  devtools(
    subscribeWithSelector((set) => baseSquiggleState),
    {
      name: "Squiggle State",
    }
  )
);

export function resetSquiggleState() {
  useSquiggleState.setState(baseSquiggleState);
}

export function lookupVariableValue(id: string) {
  const state = useSquiggleState.getState();
  if (!state.squiggleRunResult || !state.squiggleCode) {
    return undefined;
  }

  const items = state.squiggleRunResult["items"];
  const program = items.get("main");
  const statements = program.rawParse.value.statements;

  for (const statement of statements) {
    if (isLetStatement(statement)) {
      const variableName = statement.variable.value;
      if (variableName === id) {
        return getTextFromLocationRange(
          statement.value.location,
          state.squiggleCode
        );
      }
    }
  }

  return undefined;
}
