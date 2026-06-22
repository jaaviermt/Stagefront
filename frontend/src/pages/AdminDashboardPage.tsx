import { FC, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.js";
import {
  fetchAdminStats,
  fetchAdminOrders,
  fetchAdminEvents,
  fetchAdminVenues,
  fetchAllAdminEvents,
  fetchAllAdminOrders,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  updateAdminOrder,
  deleteAdminOrder,
} from "../lib/api.js";
import type {
  AdminStats,
  AdminOrder,
  AdminEventRow,
  AdminEventFull,
  AdminVenue,
} from "../lib/api.js";
import { formatMXN } from "../lib/format.js";

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    confirmed: "#4AF626",
    published: "#4AF626",
    pending: "#EAEAEA",
    draft: "#888",
    cancelled: "#E61919",
    refunded: "#E61919",
    completed: "#888",
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

const inputStyle: React.CSSProperties = {
  backgroundColor: "#111",
  border: "1px solid #333",
  color: "#EAEAEA",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "0.75rem",
  padding: "0.5rem 0.75rem",
  width: "100%",
  outline: "none",
  borderRadius: 0,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Archivo Black, sans-serif",
  fontSize: "0.6rem",
  letterSpacing: "0.2em",
  color: "#E61919",
  textTransform: "uppercase" as const,
  marginBottom: "0.35rem",
  display: "block",
};

// ─── modal types ──────────────────────────────────────────────────────────────

type Modal =
  | { type: "create-event" }
  | { type: "edit-event"; ev: AdminEventFull }
  | { type: "delete-event"; ev: AdminEventFull }
  | { type: "edit-order"; ord: AdminOrder }
  | { type: "delete-order"; ord: AdminOrder };

const EVENT_STATUSES = ["draft", "published", "cancelled", "completed"];
const ORDER_STATUSES = ["pending", "confirmed", "cancelled", "refunded"];

// ─── page ─────────────────────────────────────────────────────────────────────

const AdminDashboardPage: FC = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  // dashboard data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // management data
  const [mgmtTab, setMgmtTab] = useState<"events" | "orders">("events");
  const [allEvents, setAllEvents] = useState<AdminEventFull[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);
  const [venues, setVenues] = useState<AdminVenue[]>([]);

  // modal
  const [modal, setModal] = useState<Modal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // ── initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const [s, o, e, v, ae, ao] = await Promise.all([
          fetchAdminStats(),
          fetchAdminOrders(),
          fetchAdminEvents(),
          fetchAdminVenues(),
          fetchAllAdminEvents(),
          fetchAllAdminOrders(),
        ]);
        if (!cancelled) {
          setStats(s);
          setOrders(o);
          setEvents(e);
          setVenues(v);
          setAllEvents(ae);
          setAllOrders(ao);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar panel admin");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  // ── modal helpers ─────────────────────────────────────────────────────────

  function openCreateEvent(): void {
    setFormData({
      title: "",
      artist_name: "",
      venue_id: venues[0]?.id ?? "",
      date: "",
      total_capacity: "500",
      genre: "",
      description: "",
      image_url: "",
      status: "draft",
    });
    setActionError(null);
    setModal({ type: "create-event" });
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }

  function openEditEvent(ev: AdminEventFull): void {
    const localDate = new Date(ev.date).toISOString().slice(0, 16);
    setFormData({
      title: ev.title,
      artist_name: ev.artist_name,
      venue_id: ev.venue_id,
      date: localDate,
      total_capacity: String(ev.total_capacity),
      genre: ev.genre,
      description: ev.description,
      image_url: ev.image_url,
      status: ev.status,
    });
    setActionError(null);
    setModal({ type: "edit-event", ev });
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }

  function openEditOrder(ord: AdminOrder): void {
    setFormData({ status: ord.status });
    setActionError(null);
    setModal({ type: "edit-order", ord });
  }

  function closeModal(): void {
    setModal(null);
    setActionError(null);
  }

  const setField = (key: string, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  // ── CRUD actions ──────────────────────────────────────────────────────────

  async function handleCreateEvent(): Promise<void> {
    setSubmitting(true);
    setActionError(null);
    try {
      await createAdminEvent({
        title: formData.title,
        artist_name: formData.artist_name,
        venue_id: formData.venue_id,
        date: formData.date,
        total_capacity: Number(formData.total_capacity),
        genre: formData.genre,
        description: formData.description,
        image_url: formData.image_url || undefined,
        status: formData.status,
      });
      const updated = await fetchAllAdminEvents();
      setAllEvents(updated);
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al crear evento");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditEvent(id: string): Promise<void> {
    setSubmitting(true);
    setActionError(null);
    try {
      await updateAdminEvent(id, {
        title: formData.title,
        artist_name: formData.artist_name,
        venue_id: formData.venue_id,
        date: formData.date,
        total_capacity: Number(formData.total_capacity),
        genre: formData.genre,
        description: formData.description,
        image_url: formData.image_url || undefined,
        status: formData.status,
      });
      setAllEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                title: formData.title,
                artist_name: formData.artist_name,
                venue_id: formData.venue_id,
                date: formData.date,
                total_capacity: Number(formData.total_capacity),
                genre: formData.genre,
                description: formData.description,
                image_url: formData.image_url,
                status: formData.status,
              }
            : e
        )
      );
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al editar evento");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEvent(id: string): Promise<void> {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteAdminEvent(id);
      setAllEvents((prev) => prev.filter((e) => e.id !== id));
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar evento");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditOrder(id: string): Promise<void> {
    setSubmitting(true);
    setActionError(null);
    try {
      await updateAdminOrder(id, formData.status);
      setAllOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: formData.status } : o))
      );
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar pedido");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteOrder(id: string): Promise<void> {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteAdminOrder(id);
      setAllOrders((prev) => prev.filter((o) => o.id !== id));
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar pedido");
    } finally {
      setSubmitting(false);
    }
  }

  // ── loading / error states ────────────────────────────────────────────────

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

  const revenueK =
    stats.revenue >= 1000 ? `${(stats.revenue / 1000).toFixed(0)}K` : stats.revenue;

  // ── render ────────────────────────────────────────────────────────────────

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
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.4 }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── header ── */}
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
            <p
              style={{ color: "#444", fontSize: "0.65rem", marginTop: "0.25rem", letterSpacing: "0.15em" }}
            >
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
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "#666" }}
            >
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
              to="/admin/logs"
              style={{
                color: "#E61919",
                textDecoration: "none",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderBottom: "1px solid #E61919",
              }}
            >
              [ SYSTEM LOGS ]
            </Link>
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
              onClick={() => {
                logout();
                navigate("/admin/login", { replace: true });
              }}
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

        {/* ── metrics ── */}
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

        {/* ── telemetry (orders + events capacity) ── */}
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1px", backgroundColor: "#1a1a1a" }}
            >
              {events.map((event) => {
                const pct =
                  event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0;
                return (
                  <div key={event.id} style={{ backgroundColor: "#0A0A0A", padding: "1rem" }}>
                    <div
                      style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}
                    >
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
                    <p
                      style={{
                        color: "#444",
                        fontSize: "0.6rem",
                        marginTop: "0.4rem",
                        textAlign: "right",
                      }}
                    >
                      <data>{formatMXN(event.revenue)}</data> recaudados
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CRUD management ── */}
        <section style={{ padding: "2rem" }}>
          <p
            style={{
              fontFamily: "Archivo Black, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: "#444",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            &lt; GESTIÓN DE DATOS — CRUD &gt;
          </p>

          {/* tab switcher */}
          <div
            style={{
              display: "flex",
              gap: "1px",
              backgroundColor: "#222",
              marginBottom: "1px",
            }}
          >
            {(["events", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMgmtTab(tab)}
                style={{
                  backgroundColor: mgmtTab === tab ? "#E61919" : "#0A0A0A",
                  color: mgmtTab === tab ? "#EAEAEA" : "#444",
                  border: "none",
                  fontFamily: "Archivo Black, sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                  transition: "background-color 150ms",
                }}
              >
                [ {tab === "events" ? "EVENTOS" : "PEDIDOS"} ]
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: "#0A0A0A", border: "1px solid #1a1a1a", padding: "1.5rem" }}>
            {/* ── EVENTS tab ── */}
            {mgmtTab === "events" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Archivo Black, sans-serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.25em",
                      color: "#E61919",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    [ TODOS LOS EVENTOS — {allEvents.length} ]
                  </p>
                  <button
                    onClick={openCreateEvent}
                    style={{
                      backgroundColor: "#E61919",
                      border: "none",
                      color: "#EAEAEA",
                      fontFamily: "Archivo Black, sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                    }}
                  >
                    [ + CREAR EVENTO ]
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                    <thead>
                      <tr>
                        {["TÍTULO", "ARTISTA", "VENUE", "FECHA", "ESTADO", "AFORO", "ACCIONES"].map(
                          (h) => (
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
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {allEvents.map((ev) => (
                        <tr key={ev.id} style={{ borderBottom: "1px solid #111" }}>
                          <td
                            style={{
                              padding: "0.75rem",
                              color: "#EAEAEA",
                              maxWidth: "160px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ev.title}
                          </td>
                          <td style={{ padding: "0.75rem", color: "#888", whiteSpace: "nowrap" }}>
                            {ev.artist_name}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              color: "#666",
                              fontSize: "0.65rem",
                              maxWidth: "140px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ev.venue}
                          </td>
                          <td style={{ padding: "0.75rem", color: "#666", whiteSpace: "nowrap", fontSize: "0.65rem" }}>
                            {new Date(ev.date).toLocaleDateString("es-MX", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <StatusBadge status={ev.status} />
                          </td>
                          <td style={{ padding: "0.75rem", color: "#666", fontSize: "0.65rem" }}>
                            <data>
                              {ev.sold.toLocaleString("es-MX")} /{" "}
                              {ev.total_capacity.toLocaleString("es-MX")}
                            </data>
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => openEditEvent(ev)}
                                style={{
                                  backgroundColor: "transparent",
                                  border: "1px solid #444",
                                  color: "#EAEAEA",
                                  fontFamily: "Archivo Black, sans-serif",
                                  fontSize: "0.55rem",
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  padding: "0.3rem 0.6rem",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                EDITAR
                              </button>
                              <button
                                onClick={() => {
                                  setActionError(null);
                                  setModal({ type: "delete-event", ev });
                                }}
                                style={{
                                  backgroundColor: "transparent",
                                  border: "1px solid #E61919",
                                  color: "#E61919",
                                  fontFamily: "Archivo Black, sans-serif",
                                  fontSize: "0.55rem",
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  padding: "0.3rem 0.6rem",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ELIMINAR
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── ORDERS tab ── */}
            {mgmtTab === "orders" && (
              <>
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
                  [ TODOS LOS PEDIDOS — {allOrders.length} ]
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                    <thead>
                      <tr>
                        {["ID", "EVENTO", "USUARIO", "IMPORTE", "ESTADO", "FECHA", "ACCIONES"].map(
                          (h) => (
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
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map((ord) => (
                        <tr key={ord.id} style={{ borderBottom: "1px solid #111" }}>
                          <td style={{ padding: "0.75rem", color: "#E61919" }}>
                            <kbd style={{ fontSize: "0.65rem" }}>{ord.id.slice(0, 10)}</kbd>
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
                            {ord.event}
                          </td>
                          <td style={{ padding: "0.75rem", color: "#666", fontSize: "0.65rem" }}>
                            {ord.user}
                          </td>
                          <td style={{ padding: "0.75rem", color: "#EAEAEA" }}>
                            <data>{formatMXN(ord.amount)}</data>
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <StatusBadge status={ord.status} />
                          </td>
                          <td style={{ padding: "0.75rem", color: "#666", fontSize: "0.65rem", whiteSpace: "nowrap" }}>
                            {new Date(ord.created_at).toLocaleDateString("es-MX", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => openEditOrder(ord)}
                                style={{
                                  backgroundColor: "transparent",
                                  border: "1px solid #444",
                                  color: "#EAEAEA",
                                  fontFamily: "Archivo Black, sans-serif",
                                  fontSize: "0.55rem",
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  padding: "0.3rem 0.6rem",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ESTADO
                              </button>
                              <button
                                onClick={() => {
                                  setActionError(null);
                                  setModal({ type: "delete-order", ord });
                                }}
                                style={{
                                  backgroundColor: "transparent",
                                  border: "1px solid #E61919",
                                  color: "#E61919",
                                  fontFamily: "Archivo Black, sans-serif",
                                  fontSize: "0.55rem",
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  padding: "0.3rem 0.6rem",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ELIMINAR
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── footer ── */}
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

      {/* ── modals ── */}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* CREATE / EDIT EVENT */}
          {(modal.type === "create-event" || modal.type === "edit-event") && (
            <div
              style={{
                backgroundColor: "#0A0A0A",
                border: "1px solid #333",
                width: "100%",
                maxWidth: "640px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #222",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.25em",
                    color: "#E61919",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  {modal.type === "create-event" ? "[ CREAR EVENTO ]" : "[ EDITAR EVENTO ]"}
                </p>
                <button
                  onClick={closeModal}
                  style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: 0 }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { key: "title", label: "TÍTULO" },
                  { key: "artist_name", label: "ARTISTA" },
                  { key: "genre", label: "GÉNERO" },
                  { key: "image_url", label: "URL IMAGEN (opcional)" },
                ].map(({ key, label }, i) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      ref={i === 0 ? firstInputRef : undefined}
                      style={inputStyle}
                      value={formData[key] ?? ""}
                      onChange={(e) => setField(key, e.target.value)}
                    />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>VENUE</label>
                  <select
                    style={{ ...inputStyle, appearance: "none" as const }}
                    value={formData.venue_id ?? ""}
                    onChange={(e) => setField("venue_id", e.target.value)}
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>FECHA</label>
                    <input
                      type="datetime-local"
                      style={inputStyle}
                      value={formData.date ?? ""}
                      onChange={(e) => setField("date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>CAPACIDAD TOTAL</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={formData.total_capacity ?? ""}
                      onChange={(e) => setField("total_capacity", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>ESTADO</label>
                  <select
                    style={{ ...inputStyle, appearance: "none" as const }}
                    value={formData.status ?? "draft"}
                    onChange={(e) => setField("status", e.target.value)}
                  >
                    {EVENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>DESCRIPCIÓN</label>
                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: "80px",
                      resize: "vertical",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    value={formData.description ?? ""}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                </div>

                {actionError && (
                  <p style={{ color: "#E61919", fontSize: "0.7rem", fontFamily: "JetBrains Mono, monospace" }}>
                    {actionError}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    onClick={closeModal}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #333",
                      color: "#666",
                      fontFamily: "Archivo Black, sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                    }}
                  >
                    CANCELAR
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => {
                      if (modal.type === "create-event") void handleCreateEvent();
                      else void handleEditEvent(modal.ev.id);
                    }}
                    style={{
                      backgroundColor: submitting ? "#333" : "#E61919",
                      border: "none",
                      color: "#EAEAEA",
                      fontFamily: "Archivo Black, sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "0.5rem 1.25rem",
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? "GUARDANDO…" : "[ GUARDAR ]"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE EVENT */}
          {modal.type === "delete-event" && (
            <div
              style={{
                backgroundColor: "#0A0A0A",
                border: "1px solid #E61919",
                width: "100%",
                maxWidth: "420px",
                padding: "2rem",
              }}
            >
              <p
                style={{
                  fontFamily: "Archivo Black, sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.25em",
                  color: "#E61919",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                [ CONFIRMAR ELIMINACIÓN ]
              </p>
              <p style={{ color: "#888", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                ¿Eliminar{" "}
                <span style={{ color: "#EAEAEA", fontFamily: "Archivo Black, sans-serif" }}>
                  {modal.ev.title}
                </span>
                ?
              </p>
              <p style={{ color: "#444", fontSize: "0.65rem", marginBottom: "1.5rem" }}>
                Se eliminarán todos los pedidos, asientos y zonas asociadas. Esta acción no se puede
                deshacer.
              </p>
              {actionError && (
                <p style={{ color: "#E61919", fontSize: "0.7rem", marginBottom: "1rem" }}>{actionError}</p>
              )}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  onClick={closeModal}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #333",
                    color: "#666",
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  CANCELAR
                </button>
                <button
                  disabled={submitting}
                  onClick={() => void handleDeleteEvent(modal.ev.id)}
                  style={{
                    backgroundColor: submitting ? "#333" : "#E61919",
                    border: "none",
                    color: "#EAEAEA",
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1.25rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "ELIMINANDO…" : "[ ELIMINAR ]"}
                </button>
              </div>
            </div>
          )}

          {/* EDIT ORDER STATUS */}
          {modal.type === "edit-order" && (
            <div
              style={{
                backgroundColor: "#0A0A0A",
                border: "1px solid #333",
                width: "100%",
                maxWidth: "380px",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.25em",
                    color: "#E61919",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  [ CAMBIAR ESTADO ]
                </p>
                <button
                  onClick={closeModal}
                  style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: 0 }}
                >
                  <X size={16} />
                </button>
              </div>
              <p style={{ color: "#444", fontSize: "0.65rem", marginBottom: "0.35rem" }}>
                PEDIDO:{" "}
                <kbd style={{ color: "#E61919", fontSize: "0.65rem" }}>{modal.ord.id.slice(0, 14)}</kbd>
              </p>
              <p style={{ color: "#444", fontSize: "0.65rem", marginBottom: "1.25rem" }}>
                EVENTO: <span style={{ color: "#888" }}>{modal.ord.event}</span>
              </p>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>NUEVO ESTADO</label>
                <select
                  style={{ ...inputStyle, appearance: "none" as const }}
                  value={formData.status ?? modal.ord.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              {actionError && (
                <p style={{ color: "#E61919", fontSize: "0.7rem", marginBottom: "1rem" }}>{actionError}</p>
              )}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  onClick={closeModal}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #333",
                    color: "#666",
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  CANCELAR
                </button>
                <button
                  disabled={submitting}
                  onClick={() => void handleEditOrder(modal.ord.id)}
                  style={{
                    backgroundColor: submitting ? "#333" : "#E61919",
                    border: "none",
                    color: "#EAEAEA",
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1.25rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "ACTUALIZANDO…" : "[ ACTUALIZAR ]"}
                </button>
              </div>
            </div>
          )}

          {/* DELETE ORDER */}
          {modal.type === "delete-order" && (
            <div
              style={{
                backgroundColor: "#0A0A0A",
                border: "1px solid #E61919",
                width: "100%",
                maxWidth: "380px",
                padding: "2rem",
              }}
            >
              <p
                style={{
                  fontFamily: "Archivo Black, sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.25em",
                  color: "#E61919",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                [ CONFIRMAR ELIMINACIÓN ]
              </p>
              <p style={{ color: "#888", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                ¿Eliminar el pedido{" "}
                <kbd style={{ color: "#E61919" }}>{modal.ord.id.slice(0, 14)}</kbd>?
              </p>
              <p style={{ color: "#444", fontSize: "0.65rem", marginBottom: "1.5rem" }}>
                Se eliminarán también todos los ítems del pedido. Esta acción no se puede deshacer.
              </p>
              {actionError && (
                <p style={{ color: "#E61919", fontSize: "0.7rem", marginBottom: "1rem" }}>{actionError}</p>
              )}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  onClick={closeModal}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #333",
                    color: "#666",
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  CANCELAR
                </button>
                <button
                  disabled={submitting}
                  onClick={() => void handleDeleteOrder(modal.ord.id)}
                  style={{
                    backgroundColor: submitting ? "#333" : "#E61919",
                    border: "none",
                    color: "#EAEAEA",
                    fontFamily: "Archivo Black, sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1.25rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "ELIMINANDO…" : "[ ELIMINAR ]"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
