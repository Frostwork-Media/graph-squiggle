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

export function Profile() {
  const { user } = useUser();
  const openAiKey = useGlobalSettings((store) => store.openAIAPIKey);
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
