import { Link } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import {
  Page,
  PageTitle,
  Paragraph,
  Section,
  SectionTitle,
} from "../ui/Shared";

import { useMutation, useQuery } from "@tanstack/react-query";

export function Dashboard() {
  const createProjectMutation = useMutation(async () => {
    // hit the /api/project/new endpoint
    const response = await fetch("/api/project/new", {
      method: "POST",
    }).then((res) => res.json());
    console.log(response);
    return response;
  });

  const projects = useQuery(
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
        <Link to="/temp" className="text-blue-600 hover:underline">
          Open the Editor
        </Link>
        {/* <Paragraph>
          Open one of your projects to get started, or{" "}
          <button
            className="text-blue-600 hover:underline"
            onClick={() => createProjectMutation.mutate()}
          >
            create a new one.
          </button>
        </Paragraph> */}
      </Section>
      {/* <Section>
        <SectionTitle>Projects</SectionTitle>
        {projects.isLoading && <Spinner />}
        {projects.data && (
          <ul>
            {projects.data.map((project: any) => (
              <li key={project.id}>
                <Link
                  to={`/project/${project.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section> */}
    </Page>
  );
}
