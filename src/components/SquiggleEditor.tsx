import { useFileState } from "../lib/useFileState";
import produce from "immer";
import { useSquiggleState } from "../lib/useSquiggleState";

/**
 * Edit the squiggle code
 */
export function SquiggleEditor() {
  const squiggle = useFileState((state) => state.project?.squiggle);
  const error = useSquiggleState((state) => state.squiggleRunError);
  if (squiggle == null) return null;
  return (
    <div className="p-2 bg-white/50">
      <textarea
        className="font-mono text-xs leading-5 resize-none bg-transparent"
        style={{
          width: 400,
          height: 300,
        }}
        value={squiggle}
        onChange={(e) => {
          useFileState.setState(
            produce((draft) => {
              if (!draft.project) return;
              draft.project.squiggle = e.target.value;
            }),
            false,
            "squiggle editor"
          );
        }}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
