import { Globe, Warning } from "phosphor-react";
import { Paragraph } from "../ui/Shared";
import { useMutation } from "@tanstack/react-query";
import { forwardRef, useCallback, useRef } from "react";
import { queryClient } from "../lib/queryClient";
import type { Project as ProjectType } from "db";
import { useViewState } from "../lib/useViewState";
import { useUsername } from "../lib/queries";
import { Link, useNavigate } from "react-router-dom";
import * as AlertDialog from "../ui/Dialog";

export const Settings = forwardRef<
  HTMLDivElement,
  { id: string; isPublic: boolean; publicName: string }
>(({ id, isPublic, publicName }, ref) => {
  const publicNameRef = useRef<HTMLInputElement>(null);
  const username = useUsername();
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

      // update the input value
      if (publicNameRef.current) {
        publicNameRef.current.value = data.publicName;
      }
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
            ref={publicNameRef}
            defaultValue={publicName}
            disabled={changePublicName.isLoading}
            className="w-full p-2 border border-neutral-300 rounded-md font-mono text-sm bg-neutral-50 text-neutral-700 disabled:opacity-50"
            onKeyDown={handlePublicNameKeyDown}
            onBlur={(e) => {
              handleChangePublicName(e.currentTarget.value);
            }}
            // slug regex
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          />
        )}
        {isPublic && username.data?.username && (
          <Link
            to={`/_/${username.data.username}/${publicName}`}
            className="text-xs text-neutral-500 underline"
            target="_blank"
          >
            {username.data.username}/{publicName}
          </Link>
        )}
      </div>
      <div className="grid gap-1">
        <SmallTitleWithIcon icon={<Warning size={24} />}>
          Delete
        </SmallTitleWithIcon>
        <Paragraph>Delete this project.</Paragraph>
        <DeleteProject id={id} />
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

function DeleteProject({ id }: { id: string }) {
  const navigate = useNavigate();
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/project/delete`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await res.json();
    },
    onSuccess() {
      queryClient.invalidateQueries(["projects"]);
      // remove the project from the cache
      queryClient.removeQueries(["project", id]);
      // filter out the project from the projects list
      queryClient.setQueryData<ProjectType[] | undefined>(
        ["projects"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((project) => project.id !== id);
        }
      );
      navigate("/");
    },
  });
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md font-bold hover:bg-red-600 mt-3">
          Delete
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Project</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </AlertDialog.Description>
          <div className="flex gap-2 justify-end mt-5">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md font-bold hover:bg-red-600 disabled:opacity-50"
              disabled={deleteProjectMutation.isLoading}
              onClick={() => {
                deleteProjectMutation.mutate();
              }}
            >
              {deleteProjectMutation.isLoading ? "Deleting..." : "Delete"}
            </button>
            <AlertDialog.Close className="px-4 py-2 bg-neutral-500 text-white rounded-md font-bold hover:bg-neutral-600">
              Cancel
            </AlertDialog.Close>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
