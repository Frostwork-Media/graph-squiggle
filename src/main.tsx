import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { Router } from "./Router";

const queryClient = new QueryClient();

if (!import.meta.env.VITE_CLERK_PUBLIC_KEY) {
  throw new Error("VITE_CLERK_PUBLIC_KEY is not defined");
}
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLIC_KEY;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={clerkPubKey}>
        <BrowserRouter>
          <SignedIn>
            <Router />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </BrowserRouter>
      </ClerkProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
