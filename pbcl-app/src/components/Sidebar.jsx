import { useAuth } from "../utils/auth";

const navItems = [
  { path: "/", icon: "📊", label: "Dashboard" },
  { path: "/employees", icon: "👥", label: "Employees" },
  { path: "/timekeeping", icon: "⏱️", label: "Timekeeping" },
  { path: "/production", icon: "🏭", label: "Production" },
  { path: "/shifts", icon: "📅", label: "Shifts" },
  { path: "/leave", icon: "🌴", label: "Leave Records" },
  { path: "/violations", icon: "⚠️", label: "Violations" },
  { path: "/calendar", icon: "📆", label: "Calendar" },
  { path: "/notifications", icon: "🔔", label: "Notifications" },
];

const adminItems = [
  { path: "/violation-rules", icon: "📋", label: "Violation Rules" },
  { path: "/users", icon: "🔐", label: "Users" },
];

export default function Sidebar({ current, onNavigate, collapsed }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <aside style={{
      width: collapsed ? 64 : 230, minHeight: "100vh", background: "var(--sidebar)",
      borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
      transition: "width 0.2s", overflow: "hidden", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 14px" : "20px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🐄</div>
        {!collapsed && <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", letterSpacing: "-0.02em" }}>PBCL Team</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(item => (
          <NavLink key={item.path} item={item} active={current === item.path} onClick={() => onNavigate(item.path)} collapsed={collapsed} />
        ))}

        {isAdmin && (
          <>
            <div style={{ margin: "12px 8px 4px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", opacity: collapsed ? 0 : 1 }}>Admin</div>
            {adminItems.map(item => (
              <NavLink key={item.path} item={item} active={current === item.path} onClick={() => onNavigate(item.path)} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
            {user?.full_name?.[0] || "U"}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.full_name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user?.role}</div>
            </div>
          )}
        </div>
        <button onClick={logout} style={{
          width: "100%", padding: collapsed ? "8px 0" : "8px 10px", borderRadius: 8, border: "none",
          background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 12,
          fontWeight: 600, textAlign: "left", display: "flex", alignItems: "center", gap: 8,
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          🚪 {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, active, onClick, collapsed }) {
  return (
    <button onClick={onClick} title={collapsed ? item.label : ""} style={{
      width: "100%", padding: "9px 10px", borderRadius: 8, border: "none",
      background: active ? "var(--accent)" : "transparent",
      color: active ? "#fff" : "var(--text-muted)",
      cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500,
      textAlign: "left", display: "flex", alignItems: "center", gap: 10,
      transition: "all 0.15s", justifyContent: collapsed ? "center" : "flex-start",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--card2)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && item.label}
    </button>
  );
}
