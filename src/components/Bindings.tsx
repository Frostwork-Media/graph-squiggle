import { SquiggleChart } from "@quri/squiggle-components";
import { forwardRef } from "react";
import { useFileState } from "../lib/useFileState";

export const Bindings = forwardRef<HTMLDivElement, {}>((props, ref) => {
  const code = useFileState((state) => state.project?.squiggle ?? "");
  if (!code)
    return <span className="p-4 text-neutral-500 text-sm block">No Code</span>;
  return (
    <div ref={ref} className="h-full overflow-auto p-2 pl-4">
      <SquiggleChart code={code} enableLocalSettings />
    </div>
  );
});
