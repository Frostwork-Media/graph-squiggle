import { Link } from "react-router-dom";
import {
  Page,
  PageTitle,
  Paragraph,
  Section,
  SectionTitle,
} from "../ui/Shared";

export function Dashboard() {
  return (
    <Page>
      <Section>
        <PageTitle>Dashboard</PageTitle>
        <Paragraph>
          Open one of your projects to get started, or{" "}
          <Link to="/projects/new" className="text-blue-600 hover:underline">
            create a new one.
          </Link>
        </Paragraph>
      </Section>
      <Section>
        <SectionTitle>Projects</SectionTitle>
      </Section>
    </Page>
  );
}
