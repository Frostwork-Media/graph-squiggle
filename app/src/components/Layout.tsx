import { useAuth, useUser, SignOutButton } from "@clerk/clerk-react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect } from "react";

export function Layout() {
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  // if there is a user and the person has come to /#new then redirect them to /temp/#new
  // this is because the editor is not yet ready
  useEffect(() => {
    if (!user) return;
    if (window.location.hash === "#new") {
      navigate("/temp/#new");
    }
  }, [navigate, user]);

  // In case the user signs out while on the page.
  if (!isLoaded || !user) {
    return null;
  }
  return (
    <div className="h-screen grid grid-rows-[auto_minmax(0,1fr)]">
      <nav className="p-4 flex items-center gap-2 justify-between w-full bg-gradient-to-t from-white to-slate-50">
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className="text-neutral-500 hover:text-black aria-[current=page]:text-blue-600"
          >
            Dashboard
          </NavLink>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="rounded-full hover:outline hover:outline-neutral-200">
              <img
                src={user.profileImageUrl}
                className="rounded-full w-8 h-8"
                alt="Profile"
              />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="p-2 border rounded bg-white shadow will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade grid gap-1 min-w-[6rem]"
              align="end"
              sideOffset={5}
            >
              <DropdownMenu.Item asChild>
                <Link
                  to="/profile"
                  className="hover:outline-none hover:text-blue-600"
                >
                  Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="hover:outline-none">
                <SignOutButton>
                  <button className="hover:outline-none hover:text-blue-600 text-left">
                    Sign Out
                  </button>
                </SignOutButton>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </nav>
      <Outlet />
    </div>
  );
}
