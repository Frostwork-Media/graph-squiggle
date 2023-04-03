import { create } from "zustand";
import { SqProject, run } from "@quri/squiggle-lang";
import { useFileState } from "./useFileState";
import { isError } from "./isError";
import debounce from "lodash.debounce";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { useEffect } from "react";

type SquiggleState = {
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
}

/**
 * Run the squiggle code and update the state
 */
function runSquiggle(code: string | undefined) {
  if (code) {
    try {
      const result = run(code).result;
      if (result.ok) {
        useSquiggleState.setState(
          {
            squiggleRunResult: result.value.location.project,
            squiggleRunError: undefined,
          },
          false,
          "run squiggle / ok"
        );
      } else {
        useSquiggleState.setState(
          {
            squiggleRunError: result.value.toString(),
          },
          false,
          "run squiggle / error"
        );
      }
    } catch (e) {
      let message = isError(e) ? e.message : "Unknown error";
      useSquiggleState.setState(
        {
          squiggleRunError: message,
        },
        false,
        "run squiggle / Unknown error"
      );
    }
  } else {
    useSquiggleState.setState(
      { squiggleRunResult: undefined },
      false,
      "run squiggle / no code"
    );
  }
}
