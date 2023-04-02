import { useAppState } from "../lib/useAppState";
import produce from "immer";
import { useSquiggleState } from "../lib/useSquiggleState";

/**
 * Edit the squiggle code
 */
export function SquiggleEditor() {
  const squiggle = useAppState((state) => state.project?.squiggle);
  const error = useSquiggleState((state) => state.squiggleRunError);
  if (squiggle == null) return null;
  return (
    <div>
      <textarea
        style={{
          width: 400,
          height: 300,
        }}
        value={squiggle}
        onChange={(e) => {
          useAppState.setState(
            produce((draft) => {
              if (!draft.project) return;
              draft.project.squiggle = e.target.value;
            })
          );
        }}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
