import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./utils/auth";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Timekeeping from "./pages/Timekeeping";
import Production from "./pages/Production";
import Shifts from "./pages/Shifts";
import Leave from "./pages/Leave";
import Violations from "./pages/Violations";
import { CalendarPage, NotificationsPage, UsersPage } from "./pages/Misc";

const ROUTES = {
  "/": Dashboard,
  "/employees": Employees,
  "/timekeeping": Timekeeping,
  "/production": Production,
  "/shifts": Shifts,
  "/leave": Leave,
  "/violations": Violations,
  "/violation-rules": Violations,
  "/calendar": CalendarPage,
  "/notifications": NotificationsPage,
  "/users": UsersPage,
};

function AppInner() {
  const { user, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname || "/");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  if (!user) return <Login />;

  const Page = ROUTES[path] || Dashboard;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar current={path} onNavigate={navigate} collapsed={collapsed} />

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(c => !c)} style={{
        position: "fixed", left: collapsed ? 52 : 218, top: 20, zIndex: 100,
        width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--border)",
        background: "var(--card)", cursor: "pointer", fontSize: 12, display: "flex",
        alignItems: "center", justifyContent: "center", transition: "left 0.2s",
      }}>{collapsed ? "›" : "‹"}</button>

      <main style={{ flex: 1, padding: 28, overflowY: "auto", minWidth: 0 }}>
        <Page />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
