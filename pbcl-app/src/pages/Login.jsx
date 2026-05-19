import { useState } from "react";
import { useAuth } from "../utils/auth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", fontFamily: "inherit",
    }}>
      <div style={{
        width: 400, background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: 40, boxShadow: "0 20px 60px #0006",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "var(--accent)", borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 12 }}>🐄</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>PBCL Team</h1>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>Workforce Management System</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#ef444420", border: "1px solid #ef444440", color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit",
            marginTop: 4,
          }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
