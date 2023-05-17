import { SquiggleEditor } from "./SquiggleEditor";
import { Graph } from "./Graph";
import { useSquiggleState, useWatchProject } from "../lib/useSquiggleState";
import { PromptEditor } from "./PromptEditor";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { X, Code, ArrowLineRight, Chats, ChartBar } from "phosphor-react";
import { IconButton } from "../ui/IconButton";
import { useEffect, useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { serializeProject, useFileState } from "../lib/useFileState";
import { Bindings } from "./Bindings";
import { Project as ProjectType } from "../lib/schema";
import debounce from "lodash.debounce";
import { GraphControls } from "./GraphControls";
import { create } from "zustand";

const useViewState = create<{
  isCollapsed: boolean;
  collapse: () => void;
}>(() => ({ isCollapsed: true, collapse: () => {} }));

/**
 * Mounted when a valid project is opened
 */
export function Project() {
  // Use watch project sets up all the subscriptions necessary for keeping derived state up to date
  useWatchProject();
  const fileHandle = useFileState((state) => state.fileHandle);
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
   * Subscribe to changes in the project, and serialize the project data in a url using pako
   */
  useEffect(() => {
    const debounceSetProjectHash = debounce((project?: ProjectType) => {
      if (!project) return;
      const base64 = serializeProject(project);
      useFileState.setState({ projectHash: base64 });
    }, 1000);

    const unsub = useFileState.subscribe(
      (state) => state.project,
      debounceSetProjectHash
    );

    return unsub;
  }, []);

  return (
    <Tabs.Root defaultValue="code">
      <PanelGroup
        className="h-full relative border-t border-neutral-200"
        direction="horizontal"
      >
        <Panel
          defaultSize={0}
          collapsible
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
            <PromptEditor key={fileHandle?.name ?? ""} />
          </Tabs.Content>
          <Tabs.Content value="code" asChild>
            <SquiggleEditor />
          </Tabs.Content>
          <Tabs.Content value="bindings" asChild>
            <Bindings />
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
          <GraphControls />
          <ErrorNotice />
        </Panel>
      </PanelGroup>
    </Tabs.Root>
  );
}

function ErrorNotice() {
  const error = useSquiggleState((state) => state.squiggleRunError);
  if (!error) return null;
  return (
    <>
      <div className="backdrop absolute inset-0 bg-white/50 z-10 blur"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 text-center bg-red-100 text-red z-10 p-4 rounded-lg border-2 border-red-500 border-dashed">
        {error}
      </div>
    </>
  );
}
