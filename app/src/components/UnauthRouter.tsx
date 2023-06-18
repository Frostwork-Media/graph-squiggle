import { Routes, Route } from "react-router-dom";
import { PublicView } from "../pages/PublicView";
import { RedirectToSignIn } from "@clerk/clerk-react";

export function UnauthRouter() {
  return (
    <Routes>
      <Route path="public/:username/:slug" element={<PublicView />} />
      <Route path="*" element={<RedirectToSignIn />} />
    </Routes>
  );
}
