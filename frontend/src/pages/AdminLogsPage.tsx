import { FC, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, RefreshCw } from "lucide-react";
import { fetchAdminLogs, fetchAdminLogStats } from "../lib/api.js";
import type { LogEntry, LogStats } from "../lib/api.js";

const LEVEL_COLOR: Record<string, string> = {
  error: "#E61919",
  warn: "#E6A019",
  info: "#EAEAEA",
  http: "#666",
};

const LEVELS = ["all", "error", "warn", "info", "http"] as const;

const mono = "JetBrains Mono, monospace";

const kpiLabel: React.CSSProperties = {
  fontFamily: "Archivo Black, sans-serif",
  fontSize: "0.6rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};

const AdminLogsPage: FC = () => {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (lvl: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([fetchAdminLogStats(), fetchAdminLogs(lvl, 200)]);
      setStats(s);
      setLogs(l.data);
      setTotal(l.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(level);
  }, [level, load]);

  const maxHour = stats ? Math.max(1, ...stats.errorsByHour.map((h) => h.count)) : 1;

  return (
    <main
      style={{
        backgroundColor: "#0A0A0A",
        color: "#EAEAEA",
        minHeight: "100vh",
        fontFamily: mono,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #333",
            paddingBottom: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              fontFamily: "Archivo Black, sans-serif",
              textTransform: "uppercase",
              fontSize: "clamp(1.2rem, 3vw, 2rem)",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            [ SYSTEM LOGS ]
          </h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              onClick={() => void load(level)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #333",
                color: "#EAEAEA",
                fontFamily: mono,
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.4rem 0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <RefreshCw size={12} /> REFRESH
            </button>
            <Link
              to="/admin"
              style={{
                color: "#444",
                textDecoration: "none",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderBottom: "1px solid #333",
              }}
            >
              ← DASHBOARD
            </Link>
          </div>
        </header>

        {error && (
          <p style={{ color: "#E61919", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
            ERROR: {error}
          </p>
        )}

        {loading && !stats ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1px",
                backgroundColor: "#333",
                border: "1px solid #333",
                marginBottom: "2rem",
              }}
            >
              {(["error", "warn", "info", "http"] as const).map((lvl) => (
                <div key={lvl} style={{ backgroundColor: "#0A0A0A", padding: "1.25rem" }}>
                  <span style={{ ...kpiLabel, color: LEVEL_COLOR[lvl] }}>{`[ ${lvl} ]`}</span>
                  <output
                    style={{
                      display: "block",
                      fontFamily: "Archivo Black, sans-serif",
                      fontSize: "2rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {stats?.counts[lvl] ?? 0}
                  </output>
                </div>
              ))}
            </section>

            {/* error rate chart */}
            <section style={{ border: "1px solid #333", padding: "1.25rem", marginBottom: "2rem" }}>
              <span style={{ ...kpiLabel, color: "#E61919" }}>
                {"< ERROR RATE — ÚLTIMAS 24H >"}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "2px",
                  height: "80px",
                  marginTop: "1rem",
                }}
              >
                {stats?.errorsByHour.map((h) => (
                  <div
                    key={h.hour}
                    title={`${h.hour} — ${h.count}`}
                    style={{
                      flex: 1,
                      height: `${(h.count / maxHour) * 100}%`,
                      minHeight: h.count > 0 ? "3px" : "1px",
                      backgroundColor: h.count > 0 ? "#E61919" : "#222",
                    }}
                  />
                ))}
              </div>
            </section>

            {/* top errors */}
            {stats && stats.topErrors.length > 0 && (
              <section style={{ border: "1px solid #333", padding: "1.25rem", marginBottom: "2rem" }}>
                <span style={{ ...kpiLabel, color: "#E61919" }}>[ TOP ERRORS HOY ]</span>
                <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0" }}>
                  {stats.topErrors.map((t) => (
                    <li
                      key={t.message}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        padding: "0.3rem 0",
                        borderBottom: "1px solid #1a1a1a",
                      }}
                    >
                      <samp>{t.message}</samp>
                      <samp style={{ color: "#E61919" }}>{t.count}</samp>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* filters */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  style={{
                    backgroundColor: level === lvl ? "#E61919" : "transparent",
                    border: "1px solid #333",
                    color: level === lvl ? "#0A0A0A" : "#EAEAEA",
                    fontFamily: mono,
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "0.35rem 0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {lvl}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#666", alignSelf: "center" }}>
                {logs.length} / {total} ENTRADAS
              </span>
            </div>

            {/* logs table */}
            <section style={{ border: "1px solid #333", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#111", textAlign: "left" }}>
                    {["TIMESTAMP", "LEVEL", "MESSAGE", "META"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.6rem 0.75rem",
                          color: "#666",
                          fontFamily: "Archivo Black, sans-serif",
                          fontSize: "0.55rem",
                          letterSpacing: "0.15em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                        SIN REGISTROS PARA ESTE FILTRO
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, i) => {
                      const { timestamp, level: lvl, message, service, ...meta } = log;
                      void service;
                      return (
                        <tr key={i} style={{ borderTop: "1px solid #1a1a1a" }}>
                          <td style={{ padding: "0.5rem 0.75rem", color: "#666", whiteSpace: "nowrap" }}>
                            <samp>{timestamp ? new Date(timestamp).toLocaleTimeString() : "—"}</samp>
                          </td>
                          <td style={{ padding: "0.5rem 0.75rem" }}>
                            <samp style={{ color: LEVEL_COLOR[lvl ?? "info"] }}>
                              {(lvl ?? "info").toUpperCase()}
                            </samp>
                          </td>
                          <td style={{ padding: "0.5rem 0.75rem" }}>
                            <samp>{message}</samp>
                          </td>
                          <td style={{ padding: "0.5rem 0.75rem", color: "#888" }}>
                            <samp>{Object.keys(meta).length ? JSON.stringify(meta) : "—"}</samp>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminLogsPage;
