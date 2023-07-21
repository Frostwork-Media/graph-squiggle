import { Routes, Route, Link } from "react-router-dom";
import { Layout } from "./Layout";
import { Dashboard } from "../pages/Dashboard";
import { Profile } from "../pages/Profile";
import { Project } from "../pages/Project";
import { PublicView } from "../pages/PublicView";
import { AI } from "../pages/AI";
import { useLogRocket } from "../lib/initLogrocket";
import { NewProject } from "../pages/NewProject";

export function AuthRouter() {
  useLogRocket();

  return (
    <Routes>
      <Route path="_/:username/:slug" element={<PublicView />} />
      <Route path="/ai" element={<AI />} />
      <Route path="/new" element={<NewProject />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="project/:id" element={<Project />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
