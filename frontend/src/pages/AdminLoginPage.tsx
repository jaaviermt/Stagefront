import { FC, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.js";

const AdminLoginPage: FC = () => {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        navigate("/admin", { replace: true });
      } else {
        setError(true);
        setSubmitting(false);
      }
    }, 600);
  };

  const scanlines: React.CSSProperties = {
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.5,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#111",
    border: `1px solid ${error ? "#E61919" : "#2a2a2a"}`,
    color: "#EAEAEA",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "0.85rem",
    padding: "0.75rem 1rem",
    outline: "none",
    letterSpacing: "0.05em",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "JetBrains Mono, monospace",
        position: "relative",
        padding: "2rem",
      }}
    >
      <div style={scanlines} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "Archivo Black, sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              color: "#333",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            STAGEFRONT — SISTEMA RESTRINGIDO
          </p>
          <h1
            style={{
              fontFamily: "Archivo Black, sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#EAEAEA",
              margin: 0,
            }}
          >
            [ ACCESO ADMIN ]
          </h1>
          <div style={{ width: "40px", height: "1px", backgroundColor: "#E61919", margin: "1rem auto 0" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <div style={{ backgroundColor: "#111", padding: "1.25rem 1.5rem", border: "1px solid #1a1a1a" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.55rem",
                letterSpacing: "0.25em",
                color: "#444",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                fontFamily: "Archivo Black, sans-serif",
              }}
            >
              [ EMAIL ]
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              placeholder="admin@stagefront.mx"
              style={inputStyle}
            />
          </div>

          <div style={{ backgroundColor: "#111", padding: "1.25rem 1.5rem", border: "1px solid #1a1a1a", borderTop: "none" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.55rem",
                letterSpacing: "0.25em",
                color: "#444",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                fontFamily: "Archivo Black, sans-serif",
              }}
            >
              [ CONTRASEÑA ]
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#E61919",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textAlign: "center",
                padding: "0.75rem",
                border: "1px solid #E61919",
                borderTop: "none",
                backgroundColor: "rgba(230,25,25,0.05)",
              }}
            >
              CREDENCIALES INVÁLIDAS — ACCESO DENEGADO
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "1px",
              padding: "1rem",
              backgroundColor: submitting ? "#1a1a1a" : "#E61919",
              color: "#EAEAEA",
              fontFamily: "Archivo Black, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "VERIFICANDO…" : "[ AUTENTICAR ]"}
          </button>
        </form>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #1a1a1a",
            backgroundColor: "#0d0d0d",
          }}
        >
          <p style={{ color: "#333", fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
            &gt; CREDENCIALES DEMO
          </p>
          <p style={{ color: "#444", fontSize: "0.65rem", fontFamily: "JetBrains Mono, monospace" }}>
            EMAIL: <span style={{ color: "#666" }}>admin@stagefront.mx</span>
          </p>
          <p style={{ color: "#444", fontSize: "0.65rem", fontFamily: "JetBrains Mono, monospace" }}>
            PASS:&nbsp;&nbsp;<span style={{ color: "#666" }}>admin123</span>
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a
            href="/"
            style={{
              color: "#2a2a2a",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
