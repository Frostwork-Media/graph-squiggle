import { Routes, Route } from "react-router-dom";
import { PublicView } from "../pages/PublicView";
import { RedirectToSignIn, SignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { AI } from "../pages/AI";
import { NewProjectUnauth } from "../pages/NewProject";

export function UnauthRouter() {
  return (
    <Routes>
      <Route path="_/:username/:slug" element={<PublicView />} />
      <Route path="/ai" element={<AI />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/new" element={<NewProjectUnauth />} />
      <Route path="*" element={<RedirectToSignIn />} />
    </Routes>
  );
}

function SignInPage() {
  const [redirectUrl] = useState(() => {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get("redirect");
    if (redirect) {
      return redirect;
    }
    return "/";
  });
  console.log(redirectUrl);
  return (
    <div className="h-screen grid place-content-center bg-neutral-100">
      <SignIn routing="path" path="/sign-in" redirectUrl={redirectUrl} />
    </div>
  );
}
