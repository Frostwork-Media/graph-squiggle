import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { Project as ProjectType } from "db";
import { IconButton } from "../ui/IconButton";
import { Gear, Trash } from "phosphor-react";
import { format } from "date-fns";
import { Project2 } from "../components/Project2";

export function Project() {
  const params = useParams<{ id: string }>();
  const project = useQuery<ProjectType>(
    ["project", params.id],
    async () => {
      const res = await fetch(`/api/project/byId`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: params.id }),
      });
      return await res.json();
    },
    {
      enabled: !!params.id,
      suspense: true,
    }
  );
  if (!project.data) return null;
  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)] border-t">
      <div className="flex gap-2 justify-between items-center p-4">
        <div className="flex gap-4 items-baseline">
          <h1 className="text-xl text-blue-500 font-bold">
            {project.data.name}
          </h1>
          <span className="text-sm text-gray-500">
            Updated {format(new Date(project.data.updatedAt), "MMMM dd, yyyy")}
          </span>
          <span className="text-sm text-gray-500">
            Created {format(new Date(project.data.createdAt), "MMMM dd, yyyy")}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <IconButton icon={Gear} onClick={() => {}} />
          <IconButton icon={Trash} onClick={() => {}} />
        </div>
      </div>
      <Project2 content={project.data.content} />
    </div>
  );
}