import { create } from "zustand";
import { SqProject } from "@quri/squiggle-lang";
import { devtools, subscribeWithSelector } from "zustand/middleware";

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
