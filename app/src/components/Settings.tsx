import { Globe, Warning } from "phosphor-react";
import { Paragraph } from "../ui/Shared";
import { useMutation } from "@tanstack/react-query";
import { forwardRef, useCallback } from "react";
import { queryClient } from "../lib/queryClient";
import type { Project as ProjectType } from "db";
import { useViewState } from "../lib/useViewState";

export const Settings = forwardRef<
  HTMLDivElement,
  { id: string; isPublic: boolean; publicName: string }
>(({ id, isPublic, publicName }, ref) => {
  const togglePublic = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/project/togglePublic`, {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await res.json();
    },
    onSuccess(data, variables, context) {
      // update the query cache
      queryClient.setQueryData<ProjectType>(["project", id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          public: data.public,
        };
      });
    },
    onSettled() {
      useViewState.setState({ isSyncing: false });
    },
  });

  const changePublicName = useMutation({
    mutationFn: async (publicName: string) => {
      useViewState.setState({ isSyncing: true });
      const res = await fetch(`/api/project/changePublicName`, {
        method: "POST",
        body: JSON.stringify({ id, publicName }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await res.json();
    },
    onSuccess(data, variables, context) {
      // update the query cache
      queryClient.setQueryData<ProjectType>(["project", id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          publicName: data.publicName,
        };
      });
    },
    onSettled() {
      useViewState.setState({ isSyncing: false });
    },
  });

  const handleChangePublicName = useCallback(
    (publicName: string) => {
      const cachedProject = queryClient.getQueryData<ProjectType>([
        "project",
        id,
      ]);
      if (!cachedProject) return;
      if (cachedProject.publicName === publicName) return;
      changePublicName.mutate(publicName);
    },
    [changePublicName, id]
  );

  const handlePublicNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleChangePublicName(e.currentTarget.value);
        // blur
        e.currentTarget.blur();
      }
    },
    [handleChangePublicName]
  );

  return (
    <div className="p-5 grid gap-10" ref={ref}>
      <div className="grid gap-1">
        <SmallTitleWithIcon icon={<Globe size={24} />}>
          Public
        </SmallTitleWithIcon>
        <Paragraph>Should this project be publically visible?</Paragraph>
        <label className="flex items center gap-2 select-none justify-self-start">
          <span>Public</span>
          <input
            type="checkbox"
            disabled={togglePublic.isLoading}
            checked={isPublic}
            onChange={(e) => {
              useViewState.setState({ isSyncing: true });
              togglePublic.mutate();
            }}
          />
        </label>
        {isPublic && (
          <input
            type="text"
            defaultValue={publicName}
            className="w-full p-2 border border-neutral-300 rounded-md font-mono text-sm bg-neutral-50 text-neutral-700"
            onKeyDown={handlePublicNameKeyDown}
            onBlur={(e) => {
              handleChangePublicName(e.currentTarget.value);
            }}
            // slug regex
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          />
        )}
      </div>
      <div className="grid gap-1">
        <SmallTitleWithIcon icon={<Warning size={24} />}>
          Delete
        </SmallTitleWithIcon>
        <Paragraph>Delete this project.</Paragraph>
      </div>
    </div>
  );
});

function SmallTitleWithIcon({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 items-center">
      {icon}
      <h3 className="text-2xl font-bold text-neutral-700">{children}</h3>
    </div>
  );
}
