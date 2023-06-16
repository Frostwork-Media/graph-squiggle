import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { useViewState } from "../lib/useViewState";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { IconButton } from "../ui/IconButton";
import { ArrowLineRight, ChartBar, Chats, Code, X } from "phosphor-react";
import { SquiggleEditor } from "./SquiggleEditor";
import { updateSquiggle, useProject } from "../lib/useProject";
import debounce from "lodash.debounce";
import { useMutation } from "@tanstack/react-query";
import { ProjectContent as ProjectType } from "shared";
import { runSquiggle } from "../lib/runSquiggle";
import { completeGraphDataFromSquiggleState } from "../lib/completeGraphDataFromSquiggleState";
import { useSquiggleState } from "../lib/useSquiggleState";
import { Graph } from "./Graph";

/**
 * This will eventually replace the Project component.
 */
export function Project2({ id }: { id: string }) {
  const ref = useRef<ImperativePanelHandle>(null);
  const isCollapsed = useViewState((state) => state.isCollapsed);

  const collapsePanel = () => {
    const panel = ref.current;
    if (panel) {
      panel.collapse();
      useViewState.setState({ isCollapsed: true });
    }
  };

  const expandPanel = () => {
    const panel = ref.current;
    if (panel) {
      panel.expand();
      useViewState.setState({ isCollapsed: false });
    }
  };

  /**
   * Whether the editor is focused. If it is, with allow overflow
   * to accomodate the autocomplete menu
   */
  const editorFocused = useViewState((state) => state.editorFocused);

  /**
   * Mutation that syncs data back to the server
   */
  const syncProjectContent = useMutation({
    mutationFn: (content: ProjectType) => {
      return fetch("/api/project/updateById", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          content,
        }),
      });
    },
  });

  const debounceSyncProjectContent = useMemo(
    () =>
      debounce((content: ProjectType) => {
        syncProjectContent.mutate(content);
      }, 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const runCode = useCallback((squiggle: string) => {
    console.log("running code");
    runSquiggle(squiggle);
    const squiggleState = useSquiggleState.getState();
    completeGraphDataFromSquiggleState(squiggleState);
  }, []);
  const debounceRunCode = useMemo(() => debounce(runCode, 1000), [runCode]);

  const content = useProject((state) => state.projectContent?.squiggle ?? "");
  const onChange = useCallback(
    (squiggle = "") => {
      // Update the squiggle in the store
      updateSquiggle(squiggle);
      debounceRunCode(squiggle);
    },
    [debounceRunCode]
  );

  /**
   * Subscribe to changes on the on the content
   * and debounce updates to the server
   */
  useEffect(() => {
    const unsubscribe = useProject.subscribe(
      (state) => state.projectContent,
      (projectContent) => {
        if (!projectContent) return;
        debounceSyncProjectContent(projectContent);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [debounceSyncProjectContent]);

  return (
    <Tabs.Root defaultValue="code">
      <PanelGroup
        className="h-full relative border-t border-neutral-200"
        direction="horizontal"
      >
        <Panel
          defaultSize={0}
          collapsible
          style={editorFocused ? { overflow: "visible" } : {}}
          ref={ref}
          onResize={(size) => {
            if (size === 0) {
              useViewState.setState({ isCollapsed: true });
            } else if (isCollapsed) {
              useViewState.setState({ isCollapsed: false });
            }
          }}
        >
          <Tabs.Content value="prompt" asChild>
            Prompt
            {/* <PromptEditor /> */}
          </Tabs.Content>
          <Tabs.Content value="code" asChild>
            <SquiggleEditor content={content} onChange={onChange} />
          </Tabs.Content>
          <Tabs.Content value="bindings" asChild>
            Bindings
            {/* <Bindings /> */}
          </Tabs.Content>
        </Panel>
        <PanelResizeHandle className="border-x border-neutral-300 grid content-start p-1 gap-2">
          {isCollapsed ? (
            <IconButton icon={ArrowLineRight} onClick={expandPanel} />
          ) : (
            <IconButton icon={X} onClick={collapsePanel} />
          )}
          <Tabs.List className="grid gap-2">
            <Tabs.Trigger value="code" asChild>
              <IconButton
                icon={Code}
                className="data-[state=active]:bg-neutral-300"
              />
            </Tabs.Trigger>
            <Tabs.Trigger value="bindings" asChild>
              <IconButton
                icon={ChartBar}
                className="data-[state=active]:bg-neutral-300"
              />
            </Tabs.Trigger>
            <Tabs.Trigger value="prompt" asChild>
              <IconButton
                icon={Chats}
                className="data-[state=active]:bg-neutral-300"
              />
            </Tabs.Trigger>
          </Tabs.List>
        </PanelResizeHandle>
        <Panel className="relative">
          <Graph />
          {/* <GraphControls />
          <ErrorNotice /> */}
          Graph
        </Panel>
      </PanelGroup>
    </Tabs.Root>
  );
}
