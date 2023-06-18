import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Spinner } from "../components/Spinner";
import { useGlobalSettings } from "../lib/useGlobalSettings";
import {
  Page,
  PageTitle,
  Paragraph,
  Section,
  SectionTitle,
} from "../ui/Shared";
import { useMutation } from "@tanstack/react-query";
import type { User } from "db";
import { queryClient } from "../lib/queryClient";
import { useState } from "react";
import { slugify } from "shared";
import { useUsername } from "../lib/queries";

export function Profile() {
  const { user } = useUser();
  const openAiKey = useGlobalSettings((store) => store.openAIAPIKey);
  const username = useUsername();

  if (!user) return <Spinner />;
  return (
    <Page>
      <Section>
        <PageTitle>Profile</PageTitle>
        <Paragraph>You are signed in as {user.fullName}.</Paragraph>
        <p>
          <SignOutButton>
            <button className="text-blue-600 hover:underline">Sign Out</button>
          </SignOutButton>
        </p>
      </Section>
      <Section>
        <SectionTitle>Username</SectionTitle>
        <Paragraph>
          Your username is used to identify you in the community. It is required
          to publish your projects.
        </Paragraph>
        {username.isLoading ? (
          <Spinner />
        ) : (
          <ChangeUsername username={username.data?.username ?? ""} />
        )}
      </Section>
      <Section>
        <SectionTitle>Open AI API Key</SectionTitle>
        <Paragraph>
          This key is used to access the OpenAI API. It is stored in your
          browser's local storage.
        </Paragraph>
        <input
          type="password"
          className="bg-neutral-100 font-mono p-3 rounded text-neutral-500 mt-1"
          placeholder="Paste OpenAI API Key"
          autoComplete="off"
          value={openAiKey}
          onChange={(e) => {
            useGlobalSettings.setState({ openAIAPIKey: e.target.value });
          }}
        />
      </Section>
    </Page>
  );
}

function ChangeUsername({ username: initialUsername }: { username: string }) {
  const [username, setUsername] = useState(initialUsername);
  const setUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch(`/api/user/setUsername`, {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await res.json();
    },
    onSuccess(data) {
      // update the query cache
      queryClient.setQueryData<User>(["username"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          username: data.username,
        };
      });
    },
  });
  return (
    <div className="grid grid-cols-[1fr,auto] gap-2">
      <input
        type="text"
        className="bg-neutral-100 font-mono p-3 rounded text-neutral-500"
        placeholder="Username"
        autoComplete="off"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={setUsernameMutation.isLoading}
      />
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded p-3 disabled:opacity-50"
        disabled={setUsernameMutation.isLoading || !isValidUsername(username)}
        onClick={() => setUsernameMutation.mutate(username)}
      >
        {setUsernameMutation.isLoading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

// test whether the username is valid, more than 5 characters, slug only
function isValidUsername(username: string) {
  if (username.length < 5) return false;
  if (username !== slugify(username)) return false;
  return true;
}
