import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Ticket, ArrowRight, Tag, Check, X } from "lucide-react";
import {
  fetchUserOrders,
  createResale,
  DEMO_USER_ID,
} from "../lib/api.js";
import type { UserOrder } from "../lib/api.js";
import { formatMXN, formatEventDate, formatEventDateShort } from "../lib/format.js";

const MAX_MARKUP = 0.3;

const OrdersPage: FC = () => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openResaleFor, setOpenResaleFor] = useState<string | null>(null);
  const [resalePrice, setResalePrice] = useState("");
  const [resaleError, setResaleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resoldSeats, setResoldSeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const data = await fetchUserOrders(DEMO_USER_ID);
        if (!cancelled) {
          setOrders(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error al cargar tus compras");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openResale = (seatId: string): void => {
    setOpenResaleFor(seatId);
    setResalePrice("");
    setResaleError(null);
  };

  const handleResale = async (seatId: string, originalPrice: number): Promise<void> => {
    const price = Number(resalePrice);
    if (!Number.isFinite(price) || price <= 0) {
      setResaleError("Ingresa un precio válido.");
      return;
    }
    const maxAllowed = originalPrice * (1 + MAX_MARKUP);
    if (price > maxAllowed) {
      setResaleError(
        `El precio no puede superar ${formatMXN(maxAllowed)} (+30% sobre el original).`
      );
      return;
    }

    setSubmitting(true);
    setResaleError(null);
    try {
      await createResale({ seat_id: seatId, seller_id: DEMO_USER_ID, price });
      setResoldSeats((prev) => new Set(prev).add(seatId));
      setOpenResaleFor(null);
    } catch (e) {
      setResaleError(e instanceof Error ? e.message : "No se pudo crear la reventa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-brand-black">
      <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="font-mono text-xs text-brand-red tracking-[0.3em] uppercase mb-4">
            Tu cuenta — México
          </p>
          <h1
            className="font-display font-extrabold text-brand-white leading-[0.95]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Mis
            <br />
            <span className="text-brand-red">compras</span>
          </h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-32 text-brand-gray/50">
            <Loader2 size={22} className="animate-spin" />
            Cargando tus compras…
          </div>
        )}

        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 p-6 text-brand-white">
            <p className="font-semibold mb-1">Error al cargar tus compras</p>
            <p className="text-sm text-brand-gray/60">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="py-32 text-center border border-white/10">
            <Ticket size={32} className="text-brand-gray/20 mx-auto mb-4" />
            <p className="text-brand-gray/40 text-lg mb-2">Aún no tienes compras</p>
            <p className="text-brand-gray/30 text-sm mb-8">
              Cuando compres boletos aparecerán aquí.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm text-brand-red hover:text-brand-white transition-colors duration-200 cursor-pointer"
            >
              Explorar eventos
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-px bg-white/10">
            {orders.map((order) => (
              <div key={order.id} className="bg-brand-black p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <Link
                      to={`/events/${order.event.id}`}
                      className="font-display font-bold text-xl text-brand-white hover:text-brand-red transition-colors duration-200"
                    >
                      {order.event.title}
                    </Link>
                    <p className="text-sm text-brand-gray/50 mt-1 font-mono">
                      {order.event.venue
                        ? `${order.event.venue.name}, ${order.event.venue.city} — `
                        : ""}
                      {formatEventDateShort(order.event.date)}
                    </p>
                    <p className="text-xs text-brand-gray/40 mt-2 font-mono">
                      Pedido {order.id.slice(0, 12).toUpperCase()} ·{" "}
                      {formatEventDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-2xl text-brand-white">
                      {formatMXN(Number(order.total))}
                    </p>
                    <span className="inline-block mt-1 font-mono text-xs text-brand-green border border-brand-green/30 px-2 py-0.5 bg-brand-green/10 uppercase">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="font-mono text-xs text-brand-gray/40 uppercase tracking-widest mb-3">
                    Boletos ({order.order_items.length})
                  </p>
                  <div className="flex flex-col gap-px bg-white/5">
                    {order.order_items.map((item) => {
                      const originalPrice = Number(item.price);
                      const isResold = resoldSeats.has(item.seat_id);
                      const isOpen = openResaleFor === item.seat_id;
                      return (
                        <div key={item.id} className="bg-brand-black p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-brand-gray/70">
                              <Ticket size={14} className="text-brand-gray/40" />
                              <span className="font-mono">
                                Asiento {item.seat_id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-brand-gray/40">
                                · {formatMXN(originalPrice)}
                              </span>
                            </div>
                            {isResold ? (
                              <span className="inline-flex items-center gap-1 font-mono text-xs text-brand-green">
                                <Check size={13} /> En reventa
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  isOpen ? setOpenResaleFor(null) : openResale(item.seat_id)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-brand-white text-xs font-semibold hover:bg-brand-red transition-colors duration-200 cursor-pointer"
                              >
                                {isOpen ? <X size={13} /> : <Tag size={13} />}
                                {isOpen ? "Cancelar" : "Revender"}
                              </button>
                            )}
                          </div>

                          {isOpen && !isResold && (
                            <div className="mt-4 bg-white/5 border border-white/10 p-4">
                              <label className="block text-xs text-brand-gray/60 mb-2 font-mono">
                                Precio de reventa (máx.{" "}
                                {formatMXN(originalPrice * (1 + MAX_MARKUP))})
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  value={resalePrice}
                                  onChange={(e) => {
                                    setResalePrice(e.target.value);
                                    setResaleError(null);
                                  }}
                                  className="flex-1 bg-brand-black border border-white/10 px-3 py-2 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200 font-mono text-sm"
                                  placeholder={String(Math.round(originalPrice))}
                                />
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() =>
                                    void handleResale(item.seat_id, originalPrice)
                                  }
                                  className="px-4 py-2 bg-brand-red text-brand-white text-sm font-semibold hover:bg-brand-white hover:text-brand-black transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                >
                                  {submitting && (
                                    <Loader2 size={14} className="animate-spin" />
                                  )}
                                  Publicar
                                </button>
                              </div>
                              {resaleError && (
                                <p className="text-xs text-brand-red mt-2 font-mono">
                                  {resaleError}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
