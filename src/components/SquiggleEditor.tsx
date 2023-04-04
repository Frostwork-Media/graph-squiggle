import { useFileState } from "../lib/useFileState";
import produce from "immer";
import { useSquiggleState } from "../lib/useSquiggleState";
import { forwardRef } from "react";
import Editor from "@monaco-editor/react";

/**
 * Edit the squiggle code
 */
export const SquiggleEditor = forwardRef<HTMLDivElement, {}>(
  function SquiggleEditor(_props, ref) {
    const squiggle = useFileState((state) => state.project?.squiggle);
    const error = useSquiggleState((state) => state.squiggleRunError);
    if (squiggle == null) return null;
    return (
      <div
        className="relative pt-4 pl-4 bg-white/50 h-full grid grid-rows-[minmax(0,1fr)_auto] max-w-[100%] overflow-hidden"
        ref={ref}
      >
        <Editor
          wrapperProps={{
            className: "w-full max-w-[100%] h-full overflow-hidden",
          }}
          width="100%"
          language="squiggle"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "off",
            lineDecorationsWidth: 0,
            folding: false,
            fontSize: 14,
            renderLineHighlight: "none",
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            wordWrap: "on",
          }}
          value={squiggle}
          onChange={(value) => {
            useFileState.setState(
              produce((draft) => {
                if (!draft.project) return;
                draft.project.squiggle = value ?? "";
              }),
              false,
              "squiggle editor"
            );
          }}
          beforeMount={(monaco) => {
            // register a custom language "my-lang"
            // that supports C-style comments
            monaco.languages.register({ id: "squiggle" });
            monaco.languages.setMonarchTokensProvider("squiggle", {
              tokenizer: {
                root: [
                  // comments
                  [/\/\/.*$/, "comment"],
                ],
              },
            });
            // set the default language
            monaco.editor.setTheme("vs-dark");
            monaco.languages.setLanguageConfiguration("squiggle", {
              comments: {
                lineComment: "//",
              },
            });
          }}
        />
        {error && (
          <div className="absolute z-10 bottom-2 left-2 right-2 p-2 rounded bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }
);
