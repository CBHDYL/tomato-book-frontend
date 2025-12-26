import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { NAV_ITEMS } from "./nav";
import { ADMIN_NAV_ITEMS } from "./adminNav";
import { cx } from "../utils/cx";
import { ProfileModal } from "./ProfileModal";
import { PomodoroProvider } from "../features/pomodoro/pomodoroStore";
import { useAuthStore } from "../features/auth/authStore";
import { useProfileQuery } from "../features/profile/profileQueries";
import { useToast } from "../components/common/ToastHost";


import { useUIModeStore } from "../app/uiModeStore";

function isAdminRole(role: string | null | undefined) {
  if (!role) return false;
  const r = role.toUpperCase();
  return r === "ADMIN" || r === "ROLE_ADMIN";
}

function SmallTitle({ title }: { title: string }) {
  return (
    <div className="text-base md:text-lg font-semibold tracking-tight truncate">
      {title}
    </div>
  );
}

function Avatar({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  return (
    <img
      src={src}
      alt={alt}
      className={cx(
        cls,
        "rounded-full border border-neutral-200 object-cover bg-white"
      )}
    />
  );
}

function ProfileMenu({
  avatarSrc,
  displayName,
  username,
  onOpenProfile,
  onOpenSettings,
  onLogout,

  // ✅ NEW
  showModeSwitch,
  modeLabel,
  onToggleMode,
}: {
  avatarSrc: string;
  displayName: string;
  username?: string;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;

  // ✅ NEW
  showModeSwitch?: boolean;
  modeLabel?: "user" | "admin";
  onToggleMode?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const inAdmin = modeLabel === "admin";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "rounded-full border border-neutral-200 bg-white/80 backdrop-blur",
          "p-1 shadow-sm hover:shadow-md transition",
          "focus:outline-none focus:ring-2 focus:ring-red-200"
        )}
        aria-label="Open profile menu"
      >
        <Avatar src={avatarSrc} alt="avatar" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
          <div className="p-3 bg-gradient-to-b from-neutral-50 to-white">
            <div className="flex items-center gap-3">
              <Avatar src={avatarSrc} alt="avatar" size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900 truncate">
                  {displayName}
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  @{username || "user"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-1">
            {/* ✅ NEW: Mode switch (only for admin-role users) */}
            {showModeSwitch && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onToggleMode?.();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-left hover:bg-neutral-50 transition"
                >
                  <span className="text-neutral-700 font-medium">
                    Switch to {inAdmin ? "User Mode" : "Admin Mode"}
                  </span>
                  <span className="ml-auto text-[11px] text-neutral-400">
                    {inAdmin ? "Admin" : "User"}
                  </span>
                </button>
                <div className="my-1 h-px bg-neutral-100" />
              </>
            )}

            <button
              type="button"
              onClick={() => {
                onOpenProfile();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-left hover:bg-neutral-50 transition"
            >
              <User className="h-4 w-4 text-neutral-500" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-left hover:bg-neutral-50 transition"
            >
              <Settings className="h-4 w-4 text-neutral-500" />
              <span>Settings</span>
              <span className="ml-auto text-[11px] text-neutral-400">
                Coming soon
              </span>
            </button>

            <div className="my-1 h-px bg-neutral-100" />

            <button
              type="button"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-left hover:bg-neutral-50 transition text-red-700"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Shell.
 */
export function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const logout = useAuthStore((s) => s.logout);
  const { data: profile } = useProfileQuery(true);

  // ✅ NEW: UI mode
  const mode = useUIModeStore((s) => s.mode);
  const setMode = useUIModeStore((s) => s.setMode);
  const resetMode = useUIModeStore((s) => s.reset);

  
  const isAdminRoleUser = isAdminRole(profile?.role ?? null);

  
  const isAdminMode = isAdminRoleUser && mode === "admin";

  
  const navItems = isAdminMode ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  
  const title =
    [...NAV_ITEMS, ...(isAdminRoleUser ? ADMIN_NAV_ITEMS : [])].find((n) =>
      location.pathname.startsWith(n.to)
    )?.label ?? "Tomato Book";

  const [profileOpen, setProfileOpen] = React.useState(false);

  const displayName = profile?.nickname || profile?.username || "Account";
  const username = profile?.username || "user";
  const avatarSrc =
    profile?.avatar?.trim() ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" +
      encodeURIComponent(displayName || "User");

  function toggleMode() {
    
    if (!isAdminRoleUser) {
      setMode("user");
      return;
    }

    const next = mode === "admin" ? "user" : "admin";
    setMode(next);

    
    if (next === "admin") {
      navigate(ADMIN_NAV_ITEMS[0]?.to ?? "/admin/dashboard");
    } else {
      navigate(NAV_ITEMS[0]?.to ?? "/");
    }
  }

  function doLogout() {
    
    resetMode();

    logout();
    qc.removeQueries({ queryKey: ["profile"] });
    qc.removeQueries({ queryKey: ["tasks"] });
    navigate("/login");
  }

  return (
    <PomodoroProvider>
      <div className="min-h-screen bg-red-50 text-neutral-900">
        {/* ===== Desktop Layout ===== */}
        <div className="hidden md:flex">
          {/* Sidebar */}
          <aside className="w-72 sticky shrink-0 h-screen left-0 top-0 border-r bg-white flex flex-col border-neutral-200">
            {/* Brand */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-red-500" />
                </div>
                <div>
                  <div className="text-lg font-semibold leading-tight">
                    Tomato Book
                  </div>
                  <div className="text-sm text-neutral-500">Task Manager</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="px-3 pb-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cx(
                          "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition border",
                          isActive
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-white text-neutral-700 border-transparent hover:text-black hover:bg-neutral-50"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cx(
                              "h-5 w-5",
                              isActive ? "text-red-600" : "text-neutral-500"
                            )}
                          />
                          <span className="font-medium">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="mt-auto p-4 border-t border-neutral-200">
              <div className="text-xs text-neutral-500">
                © {new Date().getFullYear()} Tomato Book
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-red-50/70 backdrop-blur border-b border-neutral-200">
              <div className="px-6 py-2.5 flex items-center justify-between">
                <SmallTitle title={title} />
                <ProfileMenu
                  avatarSrc={avatarSrc}
                  displayName={displayName}
                  username={username}
                  onOpenProfile={() => setProfileOpen(true)}
                  onOpenSettings={() => toast.push("Settings: Coming soon")}
                  onLogout={doLogout}
                  // ✅ NEW
                  showModeSwitch={isAdminRoleUser}
                  modeLabel={isAdminMode ? "admin" : "user"}
                  onToggleMode={toggleMode}
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* ===== Mobile Layout ===== */}
        <div className="md:hidden">
          {/* Compact top bar */}
          <div className="sticky top-0 z-40 bg-red-50/75 backdrop-blur border-b border-neutral-200">
            <div className="px-4 py-2.5 flex items-center justify-between">
              <SmallTitle title={title} />
              <ProfileMenu
                avatarSrc={avatarSrc}
                displayName={displayName}
                username={username}
                onOpenProfile={() => setProfileOpen(true)}
                onOpenSettings={() => toast.push("Settings: Coming soon")}
                onLogout={doLogout}
                // ✅ NEW
                showModeSwitch={isAdminRoleUser}
                modeLabel={isAdminMode ? "admin" : "user"}
                onToggleMode={toggleMode}
              />
            </div>
          </div>

          {/* Content (leave space for bottom nav) */}
          <div className="px-4 py-4 pb-24">
            <Outlet />
          </div>

          {/* Bottom Tab Bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur">
            <div className="px-2 py-2">
              <div className="flex items-stretch gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cx(
                          "flex-1",
                          "flex flex-col items-center justify-center rounded-2xl px-2 py-2 transition",
                          isActive ? "bg-red-50" : "hover:bg-neutral-50"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cx(
                              "h-5 w-5",
                              isActive ? "text-red-600" : "text-neutral-500"
                            )}
                          />
                          <div
                            className={cx(
                              "mt-1 text-[11px] font-medium truncate w-full text-center",
                              isActive ? "text-red-700" : "text-neutral-600"
                            )}
                          >
                            {item.label}
                          </div>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      </div>
    </PomodoroProvider>
  );
}