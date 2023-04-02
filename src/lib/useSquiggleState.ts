import { create } from "zustand";
import { SqProject, run } from "@quri/squiggle-lang";
import { useAppState } from "./useAppState";
import { isError } from "./isError";
import debounce from "lodash.debounce";

type SquiggleState = {
  /** The parsed squiggle object */
  squiggleRunResult?: SqProject;
  /** The error that occurred when running the code */
  squiggleRunError?: string;
};

export const useSquiggleState = create<SquiggleState>((set) => ({}));

/** On Load, we subscribe to the project squiggle code and run it when it changes */
useAppState.subscribe(
  (state) => state.project?.squiggle,
  debounce(runSquiggle, 650, { leading: false, trailing: true }),
  {
    fireImmediately: true,
  }
);

/**
 * Run the squiggle code and update the state
 */
function runSquiggle(code: string | undefined) {
  if (code) {
    try {
      const result = run(code).result;
      if (result.ok) {
        useSquiggleState.setState({
          squiggleRunResult: result.value.location.project,
          squiggleRunError: undefined,
        });
      } else {
        useSquiggleState.setState({
          squiggleRunError: result.value.toString(),
        });
      }
    } catch (e) {
      let message = isError(e) ? e.message : "Unknown error";
      useSquiggleState.setState({
        squiggleRunError: message,
      });
    }
  } else {
    useSquiggleState.setState({ squiggleRunResult: undefined });
  }
}
