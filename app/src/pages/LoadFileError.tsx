import { Warning } from "phosphor-react";

/**
 * If a file fails to load, this screen displays the error
 */
export function LoadFileError({
  loadFileError,
}: {
  loadFileError: Error | null;
}) {
  return (
    <div className="h-full grid justify-center content-center">
      <h2 className="text-xl flex items-center gap-2 mb-4 justify-self-center text-red-600">
        <Warning size={24} />
        Unable to Load File
      </h2>
      <div className="p-4 bg-red-50 text-red-700 rounded grid gap-2 min-w-[50vw]">
        <pre className="text-xs font-mono overflow-auto text-red-400">
          {JSON.stringify(loadFileError, null, 2)}
        </pre>
      </div>
    </div>
  );
}
