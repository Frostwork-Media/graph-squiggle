import { useQuery } from "@tanstack/react-query";
import { User } from "db";

export function useUsername() {
  return useQuery<User>(["username"], async () => {
    const res = await fetch(`/api/user/username`);
    return await res.json();
  });
}

export type PublicProjectResponse = {
  name: string;
  content: string;
  updatedAt: string;
} & (
  | {
      isOwner: true;
      id: string;
    }
  | {
      isOwner: false;
    }
);

export function usePublicProject(username?: string, publicName?: string) {
  return useQuery<PublicProjectResponse>(
    ["public-project", username, publicName],
    async () => {
      const fetchUrl = new URL("/api/project/getPublic", window.location.href);
      fetchUrl.searchParams.append("username", username!);
      fetchUrl.searchParams.append("publicName", publicName!);
      const res = await fetch(fetchUrl.href, {
        method: "GET",
      });
      return await res.json();
    },
    {
      enabled: !!username && !!publicName,
    }
  );
}

export function useAIProjects() {
  return useQuery<{
    graphs: { name: string; publicName: string }[];
    username: string;
  }>(["ai-projects"], async () => {
    const res = await fetch(`/api/ai-graphs`);
    return await res.json();
  });
}
