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
    <div className="p-2 bg-white/50 h-full grid grid-rows-[minmax(0,1fr)_auto]">
      <textarea
        className="font-mono text-sm leading-5 resize-none h-full w-full min-h-[700px] bg-neutral-700 text-white p-4 whitespace-pre overflow-auto"
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
      {error && (
        <div className="text-red-500 max-w-[360px] text-sm">{error}</div>
      )}
    </div>
  );
}
