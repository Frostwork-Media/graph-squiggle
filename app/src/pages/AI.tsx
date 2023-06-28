import { Spinner } from "../components/Spinner";
import { useAIProjects } from "../lib/queries";
import * as Tabs from "@radix-ui/react-tabs";

export function AI() {
  const projectsQuery = useAIProjects();
  return (
    <div className="bg-gray-100">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-rows-[auto_minmax(0,1fr)] min-h-screen">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Probability Graphs - AI
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            The advancements in Artificial Intelligence (AI) are revolutionizing
            the way that people interact with technology. By measuring trends in
            AI through the use of probability graphs, we are able to better
            understand how AI is changing the way we think and interact. These
            graphs provide essential insight into the current state of AI in
            relation to various areas, such as business, health, and education,
            so that we can devise more efficient, intelligent, and effective
            strategies for the future.
          </p>
        </header>
        <div className="h-full">
          {projectsQuery.isLoading ? (
            <Spinner />
          ) : projectsQuery.isError ? (
            <div>Error loading projects</div>
          ) : (
            <ProjectsTabs
              projects={projectsQuery.data.graphs}
              username={projectsQuery.data.username}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectsTabs({
  projects,
  username,
}: {
  projects: { name: string; publicName: string }[];
  username: string;
}) {
  return (
    <Tabs.Root
      defaultValue={projects[0].name}
      className="h-full grid grid-rows-[auto_minmax(0,1fr)]"
    >
      <Tabs.List className="flex border-b border-gray-200">
        {projects.map((project) => (
          <Tabs.Trigger
            key={project.name}
            value={project.name}
            className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 aria-[selected='true']:text-gray-900 aria-[selected='true']:font-semibold focus-visible:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-50"
          >
            {project.name.slice(3)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {projects.map((project) => (
        <Tabs.Content key={project.name} value={project.name}>
          <div className="pt-6 h-full">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-full">
              <iframe
                src={`/_/${username}/${project.publicName}`}
                className="w-full h-full"
                title={project.name}
              />
            </div>
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
