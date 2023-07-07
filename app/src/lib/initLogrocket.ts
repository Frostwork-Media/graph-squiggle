import { useUser } from "@clerk/clerk-react";
import LogRocket from "logrocket";
import { useEffect } from "react";

export function initLogrocket() {
  LogRocket.init("eydrav/estimaker");
}

/**
 * Sets up logrocket and identifies the current user
 */
export function useLogRocket() {
  if (import.meta.env.VITE_VERCEL_ENV !== "production") return;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const id = user?.id;
  const name = user?.fullName;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Init
    initLogrocket();

    // Identify User
    if (email && id && name) {
      LogRocket.identify(id, {
        name,
        email,
      });
    }
  }, [email, id, name]);
}

export { LogRocket };
