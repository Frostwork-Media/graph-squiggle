import { RedirectToSignIn } from "@clerk/clerk-react";
import { Spinner } from "../components/Spinner";
import { useEffect, useRef } from "react";
import { useCreateProjectMutation } from "../lib/mutations";

export function NewProject() {
  const isCreating = useRef(false);
  const createProjectMutation = useCreateProjectMutation();
  useEffect(() => {
    if (isCreating.current) {
      return;
    }
    isCreating.current = true;
    createProjectMutation.mutate();
  }, [createProjectMutation]);
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex gap-2 items-center">
        <Spinner />
        <span>Creating your project...</span>
      </div>
    </div>
  );
}

export function NewProjectUnauth() {
  return <RedirectToSignIn redirectUrl="/new" />;
}
