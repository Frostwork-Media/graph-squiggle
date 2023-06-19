import { Link, useNavigate, useParams } from "react-router-dom";
import { usePublicProject } from "../lib/queries";
import { FullScreenSpinner } from "../components/Spinner";
import { Prisma } from "db";
import { useEffect } from "react";
import { loadProject } from "../lib/useProject";
import { runSquiggle } from "../lib/runSquiggle";
import { useSquiggleState } from "../lib/useSquiggleState";
import { completeGraphDataFromSquiggleState } from "../lib/completeGraphDataFromSquiggleState";
import { Graph } from "../components/Graph";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";

const bottomRightBtnClasses =
  "absolute bottom-4 right-4 z-10 text-sm py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600";
export function PublicView() {
  const params = useParams<{ username: string; slug: string }>();
  const { isLoaded, isSignedIn } = useUser();
  const project = usePublicProject(params.username, params.slug);
  if (!project.data)
    return (
      <div className="h-screen bg-[#F7F7F7]">
        <FullScreenSpinner />
      </div>
    );
  return (
    <FullPageGraph content={project.data.content} name={project.data.name}>
      {!isLoaded ? null : !isSignedIn ? (
        <Link
          to={`/sign-in?redirect=${encodeURIComponent(
            `/_/${params.username}/${params.slug}`
          )}`}
          className={bottomRightBtnClasses}
        >
          Login to Edit
        </Link>
      ) : project.data.isOwner ? (
        <Link
          to={`/project/${project.data.id}`}
          className={bottomRightBtnClasses}
        >
          Edit
        </Link>
      ) : (
        <CopyEditButton
          content={project.data.content}
          name={project.data.name}
        />
      )}
    </FullPageGraph>
  );
}

function FullPageGraph({
  content,
  name,
  children,
}: {
  content: Prisma.JsonValue;
  name: string;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const project = loadProject(content);
    runSquiggle(project?.squiggle);
    const squiggleState = useSquiggleState.getState();
    completeGraphDataFromSquiggleState(squiggleState);
  }, [content]);
  return (
    <div className="h-screen relative">
      <Graph />
      <h1 className="md:text-2xl font-bold absolute top-4 left-4 z-10 bg-white p-3 rounded shadow">
        {name}
      </h1>
      {children}
    </div>
  );
}

function CopyEditButton({
  content,
  name,
}: {
  content: Prisma.JsonValue;
  name: string;
}) {
  const navigate = useNavigate();
  const copyProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/project/copy", {
        method: "POST",
        body: JSON.stringify({
          name,
          content,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      return response;
    },
    onSuccess(data) {
      if (!data.id) throw new Error("No id returned");
      navigate(`/project/${data.id}`);
    },
  });

  return (
    <button
      className={bottomRightBtnClasses}
      onClick={() => copyProjectMutation.mutate()}
      disabled={copyProjectMutation.isLoading}
    >
      {copyProjectMutation.isLoading ? <>Copying...</> : <>Copy and Edit</>}
    </button>
  );
}
