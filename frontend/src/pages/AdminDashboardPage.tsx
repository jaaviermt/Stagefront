import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.js";
import {
  fetchAdminStats,
  fetchAdminOrders,
  fetchAdminEvents,
} from "../lib/api.js";
import type { AdminStats, AdminOrder, AdminEventRow } from "../lib/api.js";
import { formatMXN } from "../lib/format.js";

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    confirmed: "#4AF626",
    pending: "#EAEAEA",
    cancelled: "#E61919",
  };
  return (
    <samp
      style={{
        color: map[status] ?? "#EAEAEA",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {status}
    </samp>
  );
};

const AdminDashboardPage: FC = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const [s, o, e] = await Promise.all([
          fetchAdminStats(),
          fetchAdminOrders(),
          fetchAdminEvents(),
        ]);
        if (!cancelled) {
          setStats(s);
          setOrders(o);
          setEvents(e);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar panel admin");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#0A0A0A",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          color: "#666",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <Loader2 className="animate-spin" size={20} />
        Cargando telemetría desde BD…
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        style={{
          backgroundColor: "#0A0A0A",
          minHeight: "100vh",
          padding: "4rem 2rem",
          color: "#EAEAEA",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <p style={{ color: "#E61919" }}>{error ?? "Sin datos"}</p>
        <Link to="/" style={{ color: "#666", marginTop: "1rem", display: "inline-block" }}>
          ← Volver al sitio
        </Link>
      </div>
    );
  }

  const revenueK = stats.revenue >= 1000 ? `${(stats.revenue / 1000).toFixed(0)}K` : stats.revenue;

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        color: "#EAEAEA",
        minHeight: "100vh",
        fontFamily: "JetBrains Mono, monospace",
        position: "relative",
      }}
    >
      <div
        className="scanlines"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.4,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "1px",
            borderBottom: "1px solid #222",
            backgroundColor: "#222",
          }}
        >
          <div style={{ backgroundColor: "#0A0A0A", padding: "1.5rem 2rem" }}>
            <h1
              style={{
                fontFamily: "Archivo Black, sans-serif",
                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#EAEAEA",
                margin: 0,
              }}
            >
              [ STAGEFRONT — PANEL DE CONTROL ]
            </h1>
            <p style={{ color: "#444", fontSize: "0.65rem", marginTop: "0.25rem", letterSpacing: "0.15em" }}>
              MÉXICO — DATOS EN TIEMPO REAL (PostgreSQL + MongoDB)
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#0A0A0A",
              padding: "1.5rem 2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "#666" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#4AF626",
                  display: "inline-block",
                  boxShadow: "0 0 6px #4AF626",
                }}
              />
              SISTEMA ACTIVO
            </span>
            <Link
              to="/"
              style={{
                color: "#444",
                textDecoration: "none",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderBottom: "1px solid #333",
              }}
            >
              ← VOLVER AL SITIO
            </Link>
            <button
              onClick={() => { logout(); navigate("/admin/login", { replace: true }); }}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #E61919",
                color: "#E61919",
                fontFamily: "Archivo Black, sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "0.4rem 0.75rem",
                cursor: "pointer",
              }}
            >
              [ CERRAR SESIÓN ]
            </button>
          </div>
        </header>

        <section style={{ padding: "2rem" }}>
          <p
            style={{
              fontFamily: "Archivo Black, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: "#444",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            &lt; MÉTRICAS GLOBALES — {stats.currency} &gt;
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              backgroundColor: "#222",
            }}
          >
            {[
              { label: "[ EVENTOS ACTIVOS ]", value: stats.activeEvents, suffix: "" },
              { label: "[ TOTAL PEDIDOS ]", value: stats.totalOrders.toLocaleString("es-MX"), suffix: "" },
              { label: "[ INGRESOS TOTALES ]", value: revenueK, suffix: " MXN" },
              { label: "[ REVENTAS ACTIVAS ]", value: stats.activeResales, suffix: "" },
              { label: "[ EVENTOS AGOTADOS ]", value: stats.soldOutEvents, suffix: "" },
              { label: "[ PRECIO MEDIO ]", value: formatMXN(stats.avgTicketPrice), suffix: "" },
            ].map(({ label, value, suffix }) => (
              <div key={label} style={{ backgroundColor: "#0A0A0A", padding: "1.5rem 2rem" }}>
                <p
                  style={{
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    color: "#E61919",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  {label}
                </p>
                <output
                  style={{
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    color: "#EAEAEA",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  {value}
                  <span style={{ fontSize: "0.85rem", color: "#666", marginLeft: "4px" }}>{suffix}</span>
                </output>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            backgroundColor: "#222",
            padding: "0 2rem 2rem",
          }}
        >
          <div style={{ backgroundColor: "#0A0A0A", padding: "1.5rem" }}>
            <p
              style={{
                fontFamily: "Archivo Black, sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                color: "#E61919",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              [ PEDIDOS RECIENTES ]
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
              <thead>
                <tr>
                  {["ID", "EVENTO", "USUARIO", "IMPORTE", "ESTADO"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 0.75rem",
                        color: "#444",
                        fontWeight: "normal",
                        letterSpacing: "0.15em",
                        borderBottom: "1px solid #1a1a1a",
                        fontFamily: "Archivo Black, sans-serif",
                        fontSize: "0.6rem",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #111" }}>
                    <td style={{ padding: "0.75rem", color: "#E61919" }}>
                      <kbd style={{ fontSize: "0.65rem" }}>{order.id.slice(0, 10)}</kbd>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        color: "#888",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.event}
                    </td>
                    <td style={{ padding: "0.75rem", color: "#666", fontSize: "0.65rem" }}>
                      {order.user}
                    </td>
                    <td style={{ padding: "0.75rem", color: "#EAEAEA" }}>
                      <data>{formatMXN(order.amount)}</data>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ backgroundColor: "#0A0A0A", padding: "1.5rem" }}>
            <p
              style={{
                fontFamily: "Archivo Black, sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                color: "#E61919",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              [ TOP EVENTOS — OCUPACIÓN ]
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", backgroundColor: "#1a1a1a" }}>
              {events.map((event) => {
                const pct =
                  event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0;
                return (
                  <div key={event.id} style={{ backgroundColor: "#0A0A0A", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <div>
                        <p
                          style={{
                            fontFamily: "Archivo Black, sans-serif",
                            color: "#EAEAEA",
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {event.title}
                        </p>
                        <p style={{ color: "#444", fontSize: "0.65rem", marginTop: "0.2rem" }}>
                          {event.venue}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <output
                          style={{
                            fontFamily: "Archivo Black, sans-serif",
                            color: pct >= 90 ? "#E61919" : "#EAEAEA",
                            fontSize: "1.1rem",
                          }}
                        >
                          {pct}%
                        </output>
                        <p style={{ color: "#444", fontSize: "0.6rem" }}>
                          {event.sold.toLocaleString("es-MX")} / {event.capacity.toLocaleString("es-MX")}
                        </p>
                      </div>
                    </div>
                    <div style={{ height: "2px", backgroundColor: "#1a1a1a" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          backgroundColor: pct >= 90 ? "#E61919" : "#EAEAEA",
                        }}
                      />
                    </div>
                    <p style={{ color: "#444", fontSize: "0.6rem", marginTop: "0.4rem", textAlign: "right" }}>
                      <data>{formatMXN(event.revenue)}</data> recaudados
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <footer
          style={{
            borderTop: "1px solid #222",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <samp style={{ color: "#333", fontSize: "0.6rem", letterSpacing: "0.15em" }}>
            STAGEFRONT ADMIN — MÉXICO — PostgreSQL + MongoDB
          </samp>
          <samp style={{ color: "#333", fontSize: "0.6rem" }}>
            {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
          </samp>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
