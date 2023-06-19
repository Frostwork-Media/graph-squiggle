import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { AuthRouter } from "./components/AuthRouter";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { UnauthRouter } from "./components/UnauthRouter";

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
            <AuthRouter />
          </SignedIn>
          <SignedOut>
            <UnauthRouter />
          </SignedOut>
          <ReactQueryDevtools initialIsOpen={false} />
        </BrowserRouter>
      </ClerkProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
