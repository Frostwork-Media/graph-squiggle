import { run } from "@quri/squiggle-lang";
import { isError } from "./isError";
import { SquiggleState, useSquiggleState } from "./useSquiggleState";

/**
 * Run the squiggle code and update the state
 */
export function runSquiggle(code: string | undefined) {
  if (code) {
    try {
      const result = run(code).result;
      // When it ran successfully
      if (result.ok) {
        useSquiggleState.setState(
          {
            squiggleCode: code,
            squiggleRunResult: result.value.location.project,
            squiggleRunError: undefined,
          },
          false,
          "run squiggle / ok"
        );
      } else {
        useSquiggleState.setState(
          {
            squiggleRunError: `${result.value.toStringWithStackTrace()}`,
          },
          false,
          "run squiggle / error"
        );
      }
    } catch (e) {
      // When there is a syntax error
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
    // When there is no code at all
    useSquiggleState.setState(
      {
        squiggleCode: undefined,
        squiggleRunResult: undefined,
        squiggleRunError: undefined,
      },
      false,
      "run squiggle / no code"
    );
  }
}

// rewrite runSquiggle below but return the new state instead of setting it
export function runSquiggle2(code: string | undefined): SquiggleState {
  if (code) {
    try {
      const result = run(code).result;
      // When it ran successfully
      if (result.ok) {
        return {
          squiggleCode: code,
          squiggleRunResult: result.value.location.project,
          squiggleRunError: undefined,
        };
      } else {
        return {
          squiggleRunError: `${result.value.toStringWithStackTrace()}`,
        };
      }
    } catch (e) {
      // When there is a syntax error
      let message = isError(e) ? e.message : "Unknown error";
      return {
        squiggleRunError: message,
      };
    }
  } else {
    // When there is no code at all
    return {
      squiggleCode: undefined,
      squiggleRunResult: undefined,
      squiggleRunError: undefined,
    };
  }
}
