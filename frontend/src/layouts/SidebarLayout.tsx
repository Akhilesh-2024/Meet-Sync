import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/schedule/new", label: "New Meeting" },
  { to: "/calendar", label: "Calendar" },
];

export function SidebarLayout() {
  const { user, logout } = useAuthStore();
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
        <div className="mb-8 px-2 text-lg font-bold text-brand-700">MeetSync</div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
