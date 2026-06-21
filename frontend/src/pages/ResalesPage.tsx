import { FC, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Tag, ShieldCheck, Loader2, ArrowRight, Search, X } from "lucide-react";
import gsap from "gsap";
import { fetchResales } from "../lib/api.js";
import { formatMXN } from "../lib/format.js";
import type { ResaleItem } from "../lib/api.js";

const ResalesPage: FC = () => {
  const [resales, setResales] = useState<ResaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Todas");

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const data = await fetchResales();
        if (!cancelled) {
          setResales(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error al cargar reventas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
        );
      }
      const cards = cardsRef.current.filter(Boolean);
      if (cards.length) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
      }
    });
    return () => ctx.revert();
  }, [loading]);

  const cities = [
    "Todas",
    ...Array.from(new Set(resales.map((r) => r.seat.zone.event.venue.city))).sort(),
  ];

  const filtered = resales.filter((r) => {
    const matchesCity = city === "Todas" || r.seat.zone.event.venue.city === city;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.seat.zone.event.title.toLowerCase().includes(q) ||
      r.seat.zone.name.toLowerCase().includes(q) ||
      r.seat.zone.event.venue.name.toLowerCase().includes(q) ||
      r.seat.zone.event.venue.city.toLowerCase().includes(q);
    return matchesCity && matchesSearch;
  });

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-brand-black">
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">

        <div ref={headerRef} className="mb-16">
          <p className="font-mono text-xs text-brand-red tracking-[0.3em] uppercase mb-4">
            Mercado secundario — México
          </p>
          <h1
            className="font-display font-extrabold text-brand-white leading-[0.95] mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Reventas
            <br />
            <span className="text-brand-red">activas</span>
          </h1>
          <p className="text-brand-gray/50 text-base max-w-lg">
            Boletos verificados de otros usuarios. Precio máximo +30% sobre el valor original.
          </p>
        </div>

        {/* Banner garantía */}
        <div className="flex items-start gap-4 bg-white/5 border border-white/10 p-5 mb-12">
          <ShieldCheck size={20} className="text-brand-red shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-brand-white mb-0.5">
              Reventa regulada por Stagefront
            </p>
            <p className="text-xs text-brand-gray/50">
              Ningún boleto puede superar el 30% sobre el precio de venta original. Transacciones protegidas.
            </p>
          </div>
        </div>

        {/* Carga */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-32 text-brand-gray/50">
            <Loader2 size={22} className="animate-spin" />
            Cargando reventas…
          </div>
        )}

        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 p-6 text-brand-white">
            <p className="font-semibold mb-1">Error al cargar reventas</p>
            <p className="text-sm text-brand-gray/60">{error}</p>
          </div>
        )}

        {/* Sin reventas */}
        {!loading && !error && resales.length === 0 && (
          <div className="py-32 text-center border border-white/10">
            <Tag size={32} className="text-brand-gray/20 mx-auto mb-4" />
            <p className="text-brand-gray/40 text-lg mb-2">Sin reventas activas</p>
            <p className="text-brand-gray/30 text-sm mb-8">
              Todavía no hay boletos en reventa. Vuelve más tarde.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm text-brand-red hover:text-brand-white transition-colors duration-200 cursor-pointer"
            >
              Ver eventos disponibles
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Filtros */}
        {!loading && !error && resales.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray/40" />
              <input
                type="text"
                placeholder="Evento, zona o ciudad…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-brand-white placeholder:text-brand-gray/40 text-sm pl-10 pr-10 py-3 focus:outline-none focus:border-brand-red transition-colors duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray/40 hover:text-brand-white cursor-pointer transition-colors duration-150"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-brand-white text-sm px-4 py-3 focus:outline-none focus:border-brand-red transition-colors duration-200 cursor-pointer min-w-[200px]"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-brand-black">
                  {c === "Todas" ? "Todas las ciudades" : c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Grid de reventas */}
        {!loading && !error && resales.length > 0 && (
          <>
            <p className="font-mono text-xs text-brand-gray/40 mb-8">
              {filtered.length}{" "}
              {filtered.length === 1 ? "boleto disponible" : "boletos disponibles"}
            </p>

            {filtered.length === 0 ? (
              <div className="py-20 text-center border border-white/10">
                <p className="text-brand-gray/40 text-base mb-2">Sin resultados</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCity("Todas");
                  }}
                  className="text-xs font-mono text-brand-red hover:text-brand-white transition-colors duration-200 cursor-pointer underline underline-offset-4"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
              {filtered.map((r, i) => {
                const eventTitle = r.seat.zone.event.title;
                const zoneName = r.seat.zone.name;
                const venueName = r.seat.zone.event.venue.name;
                const venueCity = r.seat.zone.event.venue.city;
                const price = Number(r.price);

                return (
                  <div
                    key={r.id}
                    ref={(el) => { cardsRef.current[i] = el; }}
                    className="bg-brand-black group"
                  >
                    <div className="p-6 h-full flex flex-col justify-between border-l-2 border-transparent group-hover:border-brand-red transition-colors duration-300">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <h3 className="font-display font-bold text-brand-white text-base leading-tight group-hover:text-brand-red transition-colors duration-200">
                            {eventTitle}
                          </h3>
                          <span className="shrink-0 font-mono text-xs text-brand-red border border-brand-red/30 px-2 py-0.5 bg-brand-red/10">
                            REVENTA
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 mb-6">
                          <span className="flex items-center gap-2 text-xs text-brand-gray/50">
                            <Tag size={11} />
                            Zona: {zoneName}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-brand-gray/50">
                            <MapPin size={11} />
                            {venueName}, {venueCity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between pt-4 border-t border-white/10">
                        <div>
                          <p className="font-mono text-xs text-brand-gray/40 mb-1">precio reventa</p>
                          <p className="font-display font-extrabold text-2xl text-brand-white">
                            {formatMXN(price)}
                          </p>
                        </div>
                        <Link
                          to={`/events/${r.seat.zone.event.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-brand-white text-xs font-semibold hover:bg-brand-white hover:text-brand-black transition-all duration-200 cursor-pointer"
                        >
                          Ver evento
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ResalesPage;
