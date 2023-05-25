import { useFileState } from "../lib/useFileState";
import produce from "immer";
import { forwardRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { create } from "zustand";
import { useViewState } from "../lib/useViewState";

// Tiny client-side store to know when the code has been edited
export const useCodeEdited = create<{ lastEdited: string }>((set) => ({
  lastEdited: Date.now().toString(),
}));

/**
 * Edit the squiggle code
 */
export const SquiggleEditor = forwardRef<HTMLDivElement, {}>(
  function SquiggleEditor(_props, ref) {
    const squiggle = useFileState((state) => state.project?.squiggle);
    const onChange = useCallback((value: string | undefined) => {
      useFileState.setState(
        produce((draft) => {
          if (!draft.project) return;
          draft.project.squiggle = value ?? "";
        }),
        false,
        "squiggle editor"
      );
    }, []);
    const editorFocused = useViewState((state) => state.editorFocused);
    if (squiggle == null) return null;
    return (
      <div
        className={`relative pt-4 pl-4 bg-white/50 h-full grid grid-rows-[minmax(0,1fr)_auto] max-w-[100%] ${
          editorFocused ? "" : "overflow-hidden"
        }`}
        ref={ref}
      >
        <Editor
          wrapperProps={{
            className: `w-full max-w-[100%] h-full ${
              editorFocused ? "" : "overflow-hidden"
            }`,
          }}
          width="100%"
          language="squiggle"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            lineDecorationsWidth: 14,
            folding: false,
            fontSize: 14,
            lineNumbersMinChars: 3,
            renderLineHighlight: "none",
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            wordWrap: "on",
          }}
          value={squiggle}
          onChange={onChange}
          beforeMount={(monaco) => {
            // register a custom language "my-lang"
            // that supports C-style comments
            monaco.languages.register({ id: "squiggle" });
            monaco.languages.setMonarchTokensProvider("squiggle", {
              tokenizer: {
                root: [
                  // comments
                  [/\/\/.*$/, "comment"],
                  // multi-line comments
                  [/\/\*/, "comment", "@comment"],
                ],
                comment: [
                  [/\*\//, "comment", "@pop"],
                  [/./, "comment"],
                ],
              },
            });
            // set the default language
            monaco.editor.setTheme("vs-dark");
            monaco.languages.setLanguageConfiguration("squiggle", {
              comments: {
                lineComment: "//",
                blockComment: ["/*", "*/"],
              },
            });
          }}
          onMount={(editor) => {
            // bind a keydown event to the editor
            editor.onKeyDown((e) => {
              useCodeEdited.setState({ lastEdited: Date.now().toString() });
            });
            // bind on focus and onblur events to the editor
            editor.onDidFocusEditorText(() => {
              useViewState.setState({ editorFocused: true });
            });
            editor.onDidBlurEditorText(() => {
              useViewState.setState({ editorFocused: false });
            });
          }}
        />
      </div>
    );
  }
);
