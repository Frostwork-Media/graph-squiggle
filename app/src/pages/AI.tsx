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
          <p className="text-lg text-gray-700 mb-3">
            Many people have different views on how AI will progress. I have
            been interviewing them. This allows us to figure out where we agree
            and disagree.
          </p>
          <p className="text-lg text-gray-700 mb-8">
            Read through different expert models and if you want you can edit
            them by clicking the bottom right hand corner. Please send me what
            you make (
            <a
              href="https://twitter.com/NathanpmYoung"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500"
            >
              DM me on twitter
            </a>{" "}
            or email me at{" "}
            <a href="mailto:nathanpmyoung@gmail.com" className="text-blue-500">
              nathanpmyoung[@]gmail.com
            </a>
            )
          </p>
        </header>
        <div className="h-full">
          {projectsQuery.isLoading ? (
            <Spinner />
          ) : projectsQuery.isError ? (
            <div>Error loading projects</div>
          ) : projectsQuery.data.graphs.length ? (
            <ProjectsTabs
              projects={projectsQuery.data.graphs}
              username={projectsQuery.data.username}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-2xl font-bold text-gray-900 mb-4">
                No projects yet
              </div>
            </div>
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
