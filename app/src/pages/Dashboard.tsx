import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import {
  Page,
  PageTitle,
  Paragraph,
  Section,
  SectionTitle,
} from "../ui/Shared";
import { format } from "date-fns";
import type { Project as ProjectType } from "db";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { Globe } from "phosphor-react";

export function Dashboard() {
  const navigate = useNavigate();
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      // hit the /api/project/new endpoint
      const response = (await fetch("/api/project/new", {
        method: "POST",
      }).then((res) => res.json())) as { id: string };

      return response;
    },
    onSuccess: (data) => {
      // invalidate projects query
      queryClient.invalidateQueries(["projects"]);

      // redirect to the new project
      if (data) navigate(`/project/${data.id}`);
    },
  });

  const projects = useQuery<ProjectType[]>(
    ["projects"],
    () => fetch("/api/project/list").then((res) => res.json()),
    {
      retry: false,
    }
  );

  return (
    <Page>
      <Section>
        <PageTitle>Dashboard</PageTitle>
        <Paragraph>
          Open one of your projects to get started, or{" "}
          <span className="inline-flex items-center gap-2">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => {
                createProjectMutation.mutate();
              }}
            >
              create a new one.
            </button>
            {createProjectMutation.isLoading && <Spinner size="w-4 h-4" />}
          </span>
          <br />
          Or, go to the{" "}
          <Link to="/temp" className="text-blue-600 hover:underline">
            Temporary Editor
          </Link>
          .
        </Paragraph>
      </Section>
      <Section>
        <SectionTitle>Projects</SectionTitle>
        {projects.isLoading && <Spinner />}
        {projects.data && (
          <ul className="grid gap-2">
            {projects.data.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/project/${project.id}`}
                  className="flex items-center justify-between gap-2 rounded shadow-sm p-4 hover:bg-gray-100 border"
                >
                  <span className="flex items-center gap-2">
                    {project.public && (
                      <Globe size={20} className="text-blue-600" />
                    )}
                    <span className="text-neutral-800 text-xl">
                      {project.name}
                    </span>
                  </span>
                  <span className="text-neutral-400 text-sm">
                    {format(new Date(project.updatedAt), "MMM d, yyyy")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Page>
  );
}
