import { useQuery } from "@tanstack/react-query";
import { User } from "db";

export function useUsername() {
  return useQuery<User>(["username"], async () => {
    const res = await fetch(`/api/user/username`);
    return await res.json();
  });
}
