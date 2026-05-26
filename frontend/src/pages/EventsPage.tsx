import { FC, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Search, SlidersHorizontal, Loader2, X } from "lucide-react";
import gsap from "gsap";
import { fetchEvents } from "../lib/api.js";
import { formatMXN, formatEventDateShort } from "../lib/format.js";
import type { Event } from "../types/index.js";

const CITIES = [
  "Todas las ciudades",
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
];

function minZonePrice(event: Event): number {
  if (!event.zones?.length) return 0;
  return Math.min(...event.zones.map((z) => Number(z.price)));
}

const PAGE_SIZE = 6;

const EventsPage: FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Todas las ciudades");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const gridRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const prevVisibleRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const data = await fetchEvents();
        if (!cancelled) {
          setEvents(data);
          setFiltered(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error al cargar eventos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let result = events;
    if (city !== "Todas las ciudades") {
      result = result.filter((e) => e.venue?.city === city);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.artist_name?.toLowerCase().includes(q) ||
          e.genre?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setVisibleCount(PAGE_SIZE);
    prevVisibleRef.current = 0;
  }, [search, city, events]);

  useEffect(() => {
    if (loading || filtered.length === 0) return;
    const newCards = cardsRef.current
      .slice(prevVisibleRef.current)
      .filter(Boolean) as HTMLDivElement[];
    prevVisibleRef.current = Math.min(visibleCount, filtered.length);
    if (!newCards.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        newCards,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [loading, filtered, visibleCount]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-brand-black">
      <div className="pt-32 pb-16 px-6 max-w-7xl mx-auto">

        <div className="mb-16">
          <p className="font-mono text-xs text-brand-red tracking-[0.3em] uppercase mb-4">
            Cartelera — México
          </p>
          <h1
            className="font-display font-extrabold text-brand-white leading-[0.95]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Todos los
            <br />
            <span className="text-brand-red">eventos</span>
          </h1>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray/40" />
            <input
              type="text"
              placeholder="Artista, evento o género…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-brand-white placeholder:text-brand-gray/40 text-sm pl-10 pr-10 py-3 focus:outline-none focus:border-brand-red transition-colors duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray/40 hover:text-brand-white cursor-pointer transition-colors duration-150"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray/40 pointer-events-none" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-brand-white text-sm pl-10 pr-8 py-3 focus:outline-none focus:border-brand-red transition-colors duration-200 cursor-pointer min-w-[220px]"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-brand-black">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador */}
        {!loading && !error && (
          <p className="font-mono text-xs text-brand-gray/40 mb-8">
            {filtered.length === events.length
              ? `${events.length} eventos disponibles`
              : `${filtered.length} de ${events.length} eventos`}
          </p>
        )}

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-32 text-brand-gray/50">
            <Loader2 size={22} className="animate-spin" />
            Cargando eventos…
          </div>
        )}

        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 p-6 text-brand-white">
            <p className="font-semibold mb-1">Error al cargar eventos</p>
            <p className="text-sm text-brand-gray/60">{error}</p>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && filtered.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-brand-gray/40 text-lg mb-3">Sin resultados</p>
            <p className="text-brand-gray/30 text-sm">
              Prueba con otro artista o ciudad
            </p>
            <button
              onClick={() => { setSearch(""); setCity("Todas las ciudades"); }}
              className="mt-6 text-xs font-mono text-brand-red hover:text-brand-white transition-colors duration-200 cursor-pointer underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Grid de eventos */}
        {!loading && !error && visible.length > 0 && (
          <>
            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10"
            >
              {visible.map((event, i) => {
                const price = minZonePrice(event);
                const venueLabel = event.venue
                  ? `${event.venue.name}, ${event.venue.city}`
                  : "";
                return (
                  <div
                    key={event.id}
                    ref={(el) => { cardsRef.current[i] = el; }}
                    className="bg-brand-black group cursor-pointer"
                  >
                    <Link to={`/events/${event.id}`} className="block">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={event.image_url ?? "https://picsum.photos/seed/concert/1920/1080"}
                          alt={event.title}
                          className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
                        {event.genre && (
                          <span className="absolute top-4 left-4 font-mono text-xs text-brand-gray/70 bg-brand-black/60 px-2 py-1">
                            {event.genre}
                          </span>
                        )}
                        {price > 0 && (
                          <span className="absolute bottom-4 right-4 font-display font-bold text-brand-white text-base">
                            desde {formatMXN(price)}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-bold text-lg text-brand-white mb-3 group-hover:text-brand-red transition-colors duration-200 leading-tight">
                          {event.title}
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-2 text-xs text-brand-gray/50">
                            <MapPin size={11} />
                            {venueLabel}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-brand-gray/50">
                            <Calendar size={11} />
                            {formatEventDateShort(event.date)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Ver más */}
            {hasMore && (
              <div className="flex flex-col items-center gap-3 mt-12">
                <p className="font-mono text-xs text-brand-gray/30">
                  Mostrando {visible.length} de {filtered.length}
                </p>
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="border border-white/20 text-brand-white text-sm font-mono px-10 py-3 hover:border-brand-red hover:text-brand-red transition-colors duration-200 cursor-pointer"
                >
                  Ver más eventos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default EventsPage;
