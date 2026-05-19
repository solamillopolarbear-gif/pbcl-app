import { useState } from "react";
import { labelMap, statusColor } from "../utils/helpers";

export function Badge({ value, color }) {
  const bg = color || statusColor(value);
  return (
    <span style={{
      background: bg + "22", color: bg, border: `1px solid ${bg}44`,
      padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap"
    }}>
      {labelMap(value) || value}
    </span>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: 24, ...style
    }}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", size = "md", disabled, style = {}, type = "button" }) {
  const base = {
    border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8,
    fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s", display: "inline-flex",
    alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1,
    padding: size === "sm" ? "6px 14px" : size === "lg" ? "12px 28px" : "9px 20px",
    fontSize: size === "sm" ? 12 : size === "lg" ? 16 : 14,
  };
  const variants = {
    primary: { background: "var(--accent)", color: "#fff" },
    secondary: { background: "var(--card2)", color: "var(--text)", border: "1px solid var(--border)" },
    danger: { background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" },
    ghost: { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = "text", placeholder, required, options, style = {} }) {
  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--card2)",
    color: "var(--text)", fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && " *"}</label>}
      {options ? (
        <select value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle} required={required}>
          <option value="">— Select —</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ ...inputStyle, resize: "vertical" }} required={required} />
      ) : (
        <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={inputStyle} required={required} />
      )}
    </div>
  );
}

export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000a", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
        width, maxWidth: "100%", maxHeight: "90vh", overflow: "auto", padding: 28,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <Button variant="ghost" onClick={onClose} size="sm">✕</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 11,
                textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No records found</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick && onRowClick(row)}
              style={{ borderBottom: "1px solid var(--border)", cursor: onRowClick ? "pointer" : "default",
                transition: "background 0.1s" }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = "var(--card2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = ""; }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: "11px 14px", color: "var(--text)" }}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({ label, value, icon, color = "var(--accent)" }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{label}</div>
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, success: msg => add(msg, "success"), error: msg => add(msg, "error") };
}

export function ToastContainer({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? "#ef4444" : "#22c55e", color: "#fff",
          padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14,
          boxShadow: "0 4px 20px #0004", animation: "slideIn 0.2s ease",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}
