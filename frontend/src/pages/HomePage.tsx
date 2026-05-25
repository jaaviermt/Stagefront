import { FC, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Calendar, Ticket, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchEvents, fetchPublicStats, fetchResales } from "../lib/api.js";
import type { ResaleItem } from "../lib/api.js";
import { formatMXN, formatEventDateShort } from "../lib/format.js";
import type { Event } from "../types/index.js";

gsap.registerPlugin(ScrollTrigger);

const MEXICO_CITIES = [
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Puebla",
  "Querétaro",
  "Mérida",
  "Tijuana",
  "León",
];

function minZonePrice(event: Event): number {
  if (!event.zones?.length) return 0;
  return Math.min(...event.zones.map((z) => Number(z.price)));
}

const HomePage: FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [resales, setResales] = useState<ResaleItem[]>([]);
  const [stats, setStats] = useState<{
    activeEvents: number;
    ticketsSold: number;
    satisfaction: number;
    cities: number;
    hiddenFees: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const eventCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const [eventsData, statsData, resalesData] = await Promise.all([
          fetchEvents(),
          fetchPublicStats(),
          fetchResales(),
        ]);
        if (cancelled) return;
        setEvents(eventsData);
        setStats(statsData);
        setResales(resalesData);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo conectar con el servidor. ¿Está el backend y la BD activos?"
          );
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

  useEffect(() => {
    if (loading || events.length === 0) return;

    const ctx = gsap.context(() => {
      if (heroImgRef.current) {
        gsap.fromTo(
          heroImgRef.current,
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.5,
            },
          }
        );
      }

      const cards = eventCardsRef.current.filter(Boolean);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: eventsRef.current,
              start: "top 75%",
            },
          }
        );
      }

      if (marqueeRef.current) {
        const inner = marqueeRef.current.querySelector(".marquee-inner");
        if (inner) {
          gsap.to(inner, {
            x: "-50%",
            duration: 20,
            ease: "none",
            repeat: -1,
          });
        }
      }
    });

    return () => ctx.revert();
  }, [loading, events.length]);

  const bentoStats = stats
    ? [
        { value: `${stats.activeEvents}+`, label: "Eventos activos" },
        { value: stats.ticketsSold.toLocaleString("es-MX"), label: "Tickets vendidos" },
        { value: `${stats.satisfaction}%`, label: "Satisfacción" },
        { value: `${stats.cities}+`, label: "Ciudades en México" },
        { value: `${stats.hiddenFees}%`, label: "Comisión oculta" },
      ]
    : [];

  return (
    <main className="overflow-x-hidden w-full max-w-full">
      <section
        ref={heroRef}
        className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        <img
          ref={heroImgRef}
          src="https://picsum.photos/seed/stagefront-mexico/1920/1080"
          alt="Concierto en vivo en México"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(40%) brightness(0.45)", mixBlendMode: "luminosity" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/30 via-transparent to-brand-black" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <p className="text-brand-red font-mono text-xs tracking-[0.3em] uppercase mb-6">
            Boletos en vivo — México
          </p>
          <h1
            className="font-display font-extrabold text-brand-white leading-[0.95] tracking-tight mb-8"
            style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
          >
            Tu próximo
            <br />
            momento épico
            <br />
            <span className="text-brand-red">en México.</span>
          </h1>
          <p className="text-brand-gray/70 text-lg max-w-xl mx-auto mb-10">
            Compra, revende y vive experiencias únicas. Precios en MXN, sin sobrecostes ocultos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-white text-brand-black font-semibold hover:bg-brand-red hover:text-brand-white transition-all duration-200 cursor-pointer text-sm"
            >
              Ver eventos
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/resales"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-brand-white hover:bg-white/10 transition-all duration-200 cursor-pointer text-sm"
            >
              Reventas disponibles
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {bentoStats.length > 0 && (
        <section className="py-32 md:py-48 px-6 max-w-7xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/10"
            style={{ gridAutoFlow: "dense" }}
          >
            {bentoStats.map(({ value, label }, i) => (
              <div
                key={label}
                className={`bg-brand-black p-8 flex flex-col justify-end ${
                  i === 0 ? "col-span-2 md:col-span-1" : ""
                } ${i === 2 ? "row-span-2 md:row-span-1" : ""}`}
              >
                <data className="font-display text-4xl md:text-5xl font-extrabold text-brand-white block">
                  {value}
                </data>
                <span className="text-brand-gray/50 text-sm mt-2 font-mono">{label}</span>
              </div>
            ))}

            <div className="col-span-2 md:col-span-2 bg-brand-red/10 border border-brand-red/20 p-8 flex flex-col justify-between">
              <Ticket size={28} className="text-brand-red" />
              <div>
                <h3 className="font-display text-xl font-bold text-brand-white mb-2">
                  Reventa segura
                </h3>
                <p className="text-brand-gray/60 text-sm">
                  Máximo +30% sobre el precio original. Sin estafas, sin sorpresas.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="events" className="py-32 md:py-48 px-6" ref={eventsRef}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <h2
              className="font-display font-extrabold text-brand-white"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Próximos
              <br />
              eventos
            </h2>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-24 text-brand-gray/60">
              <Loader2 size={24} className="animate-spin" />
              Cargando eventos desde la base de datos…
            </div>
          )}

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/30 p-6 text-brand-white">
              <p className="font-semibold mb-2">Error al cargar eventos</p>
              <p className="text-sm text-brand-gray/70">{error}</p>
              <p className="text-xs text-brand-gray/50 mt-3 font-mono">
                Ejecuta: docker compose up -d && cd backend && npm run db:setup && npm run dev
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
              {events.map((event, i) => {
                const price = minZonePrice(event);
                const venueLabel = event.venue
                  ? `${event.venue.name}, ${event.venue.city}`
                  : "";
                return (
                  <div
                    key={event.id}
                    ref={(el) => {
                      eventCardsRef.current[i] = el;
                    }}
                    className="bg-brand-black group cursor-pointer"
                  >
                    <Link to={`/events/${event.id}`} className="block">
                      <div className="relative overflow-hidden aspect-[16/9]">
                        <img
                          src={event.image_url ?? "https://picsum.photos/seed/concert/1920/1080"}
                          alt={event.title}
                          className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent" />
                        <span className="absolute top-4 left-4 font-mono text-xs text-brand-gray/70 bg-brand-black/60 px-2 py-1">
                          {event.genre}
                        </span>
                        {price > 0 && (
                          <span className="absolute bottom-4 right-4 font-display font-bold text-brand-white text-lg">
                            desde {formatMXN(price)}
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display font-bold text-xl text-brand-white mb-3 group-hover:text-brand-red transition-colors duration-200">
                          {event.title}
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-2 text-sm text-brand-gray/60">
                            <MapPin size={13} />
                            {venueLabel}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-brand-gray/60">
                            <Calendar size={13} />
                            {formatEventDateShort(event.date)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="resales" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-extrabold text-brand-white text-2xl mb-8">
            Reventas activas
          </h2>
          {resales.length === 0 ? (
            <p className="text-brand-gray/50 text-sm">No hay reventas activas por el momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
              {resales.map((r) => (
                <div key={r.id} className="bg-brand-black p-6">
                  <p className="font-semibold text-brand-white">{r.seat.zone.event.title}</p>
                  <p className="text-sm text-brand-gray/60 mt-1">
                    {r.seat.zone.name} — {r.seat.zone.event.venue.name},{" "}
                    {r.seat.zone.event.venue.city}
                  </p>
                  <p className="font-display font-bold text-brand-red text-xl mt-3">
                    {formatMXN(Number(r.price))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div ref={marqueeRef} className="py-8 overflow-hidden border-y border-white/10">
        <div className="marquee-inner flex gap-16 whitespace-nowrap will-change-transform">
          {[...Array(2)].map((_, ri) =>
            MEXICO_CITIES.map((city, ci) => (
              <span
                key={`${ri}-${ci}`}
                className="font-display font-extrabold text-2xl text-brand-white/20 uppercase tracking-widest"
              >
                {city}
              </span>
            ))
          )}
        </div>
      </div>

      <section className="py-32 md:py-48 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="font-display font-extrabold text-brand-white mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Vive el momento.
            <br />
            <span className="text-brand-red">Sin intermediarios.</span>
          </h2>
          <p className="text-brand-gray/60 text-lg mb-10 max-w-lg mx-auto">
            Plataforma 100% transparente. Compra y revende con total confianza en México.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-3 px-10 py-5 bg-brand-red text-brand-white font-semibold hover:bg-brand-white hover:text-brand-black transition-all duration-200 cursor-pointer text-base"
          >
            Explorar eventos
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-brand-white/40 text-sm">
            STAGEFRONT © 2026 — México
          </span>
          <nav className="flex gap-6 items-center">
            {["Términos", "Privacidad", "Contacto"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-brand-gray/40 hover:text-brand-white transition-colors duration-200 cursor-pointer"
              >
                {item}
              </a>
            ))}
            <Link
              to="/admin"
              className="text-xs text-brand-gray/20 hover:text-brand-gray/50 transition-colors duration-200 cursor-pointer font-mono"
            >
              Admin
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
