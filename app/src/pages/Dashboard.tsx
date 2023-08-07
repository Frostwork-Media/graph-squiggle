import { Link } from "react-router-dom";
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

import { useQuery } from "@tanstack/react-query";
import { Globe } from "phosphor-react";
import { useCreateProjectMutation } from "../lib/mutations";

export function Dashboard() {
  const createProjectMutation = useCreateProjectMutation();

  const projects = useQuery<ProjectType[]>(
    ["projects"],
    () => fetch("/api/project/list").then((res) => res.json()),
    {
      retry: false,
      refetchOnWindowFocus: false,
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
        </Paragraph>
      </Section>
      <Section>
        <div className="flex items-center gap-4">
          <SectionTitle>Projects</SectionTitle>
          {projects.isFetching && <Spinner size="w-6 h-6" />}
        </div>
        {projects.data && (
          <ul className="grid gap-2 pb-8">
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
