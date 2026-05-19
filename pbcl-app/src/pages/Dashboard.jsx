import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { StatCard, Card, Loader, Badge } from "../components/ui";
import { formatDate, labelMap, today } from "../utils/helpers";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentTime, setRecentTime] = useState([]);
  const [todayProd, setTodayProd] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.Employee.list({ q: JSON.stringify({ status: "active" }), limit: 500 }),
      api.TimeRecord.list({ q: JSON.stringify({ date: today() }), limit: 100 }),
      api.ProductionSchedule.list({ q: JSON.stringify({ date: today() }), limit: 1 }),
      api.Notification.list({ q: JSON.stringify({ is_dismissed: false }), sort_by: "-created_date", limit: 5 }),
      api.LeaveRecord.list({ q: JSON.stringify({ approved: true }), limit: 500 }),
    ]).then(([emps, times, prod, notifs, leaves]) => {
      const clockedIn = times.filter(t => t.status === "clocked_in").length;
      const absent = times.filter(t => t.status === "absent").length;
      setStats({
        totalEmployees: emps.length,
        clockedIn,
        absent,
        onLeave: leaves.filter(l => {
          const t = today();
          return l.start_date <= t && l.end_date >= t;
        }).length,
      });
      setRecentTime(times.slice(0, 8));
      setTodayProd(prod[0] || null);
      setNotifications(notifs.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>{formatDate(today())} — Overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Employees" value={stats?.totalEmployees ?? 0} icon="👥" color="#3b82f6" />
        <StatCard label="Clocked In Today" value={stats?.clockedIn ?? 0} icon="✅" color="#22c55e" />
        <StatCard label="Absent Today" value={stats?.absent ?? 0} icon="❌" color="#ef4444" />
        <StatCard label="On Leave" value={stats?.onLeave ?? 0} icon="🌴" color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Today's Production */}
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>📦 Today's Production</h3>
          {todayProd ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Heads", todayProd.heads],
                ["Call Time", todayProd.call_time],
                ["Cut Off Post", todayProd.cut_off_post],
                ["Target Hang", todayProd.target_start_hang],
                ["Truck Arrival", todayProd.truck_arrival],
                ["Actual Hang", todayProd.actual_start_hang || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No production schedule for today.</p>
          )}
        </Card>

        {/* Notifications */}
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>🔔 Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No new notifications.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: "10px 14px", borderRadius: 8, background: "var(--card2)", borderLeft: `3px solid ${n.is_read ? "var(--border)" : "var(--accent)"}` }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Timekeeping */}
        <Card style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>⏱️ Today's Attendance</h3>
          {recentTime.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No time records for today.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {recentTime.map(t => (
                <div key={t.id} style={{ padding: "10px 14px", borderRadius: 8, background: "var(--card2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.employee_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {t.time_in ? new Date(t.time_in).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      {t.time_out ? " → " + new Date(t.time_out).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                  <Badge value={t.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
