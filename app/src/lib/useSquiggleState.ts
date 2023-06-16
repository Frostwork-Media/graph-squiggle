import { create } from "zustand";
import { SqProject } from "@quri/squiggle-lang";
import { useFileState } from "./useFileState";
import debounce from "lodash.debounce";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { useEffect } from "react";
import { completeGraphDataFromSquiggleState } from "./completeGraphDataFromSquiggleState";
import { useNodeLocation, writeNodeLocation } from "./useNodeLocation";
import { runSquiggle } from "./runSquiggle";

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

export const baseSquiggleState: SquiggleState = {};
export const useSquiggleState = create<SquiggleState>()(
  devtools(
    subscribeWithSelector((set) => baseSquiggleState),
    {
      name: "Squiggle State",
    }
  )
);

export function useWatchProject() {
  useEffect(() => {
    // here we will subscribe to the squiggle state and update the graph
    return useSquiggleState.subscribe((state) => {
      completeGraphDataFromSquiggleState(state);
    });
  }, []);

  useEffect(() => {
    const squiggle = useFileState.getState().project?.squiggle;
    runSquiggle(squiggle);
    /** On Load, we subscribe to the project squiggle code and run it when it changes */
    const unsub = useFileState.subscribe(
      (state) => state.project?.squiggle,
      debounce(runSquiggle, 650, { leading: false, trailing: true })
    );

    return () => {
      unsub();
    };
  }, []);

  // here we watch our nodeLocation store and write it back the project in a debounced way
  useEffect(() => {
    const unsubscribe = useNodeLocation.subscribe((state) => {
      writeNodeLocation(state);
    });
    return unsubscribe;
  }, []);
}
