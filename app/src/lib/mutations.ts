import { useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useNavigate } from "react-router-dom";

export function useCreateProjectMutation() {
  const navigate = useNavigate();
  return useMutation({
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
}
