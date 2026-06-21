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
  "Todas",
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Puebla",
  "Querétaro",
  "Mérida",
  "Tijuana",
  "León",
];

const WHY_ITEMS = [
  {
    title: "Sin comisiones ocultas",
    desc: "El precio que ves es el que pagas. Sin cargos de servicio de último momento.",
    img: "/images/dolarucos.jpg",
  },
  {
    title: "Reventa con límite justo",
    desc: "Los revendedores no pueden subir el precio más del 30% sobre el original.",
    img: "/images/tickets.jpg",
  },
  {
    title: "Eventos verificados",
    desc: "Todos los eventos pasan por revisión antes de publicarse en la plataforma.",
    img: "/images/kendric.jpeg",
  },
  {
    title: "Boletos garantizados",
    desc: "Cada compra está asegurada. Si el evento se cancela, te devolvemos tu dinero.",
    img: "/images/stagebeyy.jpg",
  },
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [visibleHomeCount, setVisibleHomeCount] = useState(6);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const eventCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const prevHomeVisibleRef = useRef(6);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const whyItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaTextRef = useRef<HTMLParagraphElement>(null);

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

  // Hero GSAP — independent of API data
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

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
        gsap.to(heroImgRef.current, {
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "60% top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Data-dependent GSAP
  useEffect(() => {
    if (loading) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Event cards stagger
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

      // Marquee
      if (marqueeRef.current) {
        const inner = marqueeRef.current.querySelector(".marquee-inner");
        if (inner) {
          gsap.to(inner, { x: "-50%", duration: 20, ease: "none", repeat: -1 });
        }
      }

      // Why items: image scale 0.8 → 1.0 on scroll-in, fade-out on scroll-out
      whyItemsRef.current.filter(Boolean).forEach((item) => {
        const img = item?.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { scale: 0.8, opacity: 0.6 },
          {
            scale: 1.0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              end: "top 30%",
              scrub: 1,
            },
          }
        );
        gsap.to(img, {
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "bottom 60%",
            end: "bottom 10%",
            scrub: 1,
          },
        });
      });

      // Scrubbing text reveal on CTA paragraph
      if (ctaTextRef.current) {
        const text = ctaTextRef.current.textContent ?? "";
        const words = text.split(" ");
        ctaTextRef.current.innerHTML = words
          .map((w) => `<span style="opacity:0.1;display:inline-block;margin-right:0.3em">${w}</span>`)
          .join("");
        gsap.to(ctaTextRef.current.querySelectorAll("span"), {
          opacity: 1,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: ctaTextRef.current,
            start: "top 80%",
            end: "bottom 55%",
            scrub: 1,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [loading]);

  // Animate only newly revealed cards when clicking "Ver más"
  useEffect(() => {
    if (loading) return;
    const prev = prevHomeVisibleRef.current;
    if (visibleHomeCount <= prev) return;
    const newCards = eventCardsRef.current.slice(prev).filter(Boolean) as HTMLDivElement[];
    prevHomeVisibleRef.current = visibleHomeCount;
    if (!newCards.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      newCards,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
    );
  }, [loading, visibleHomeCount]);

  const filteredEvents =
    selectedCity === "Todas"
      ? events
      : events.filter((e) => e.venue?.city === selectedCity);

  const visibleEvents = filteredEvents.slice(0, visibleHomeCount);
  const hasMoreHomeEvents = visibleHomeCount < filteredEvents.length;

  return (
    <main className="overflow-x-hidden w-full max-w-full">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        <img
          ref={heroImgRef}
          src="/images/stage.avif"
          alt="Concierto en vivo en México"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(40%) brightness(0.55)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/30 via-transparent to-brand-black" />

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto w-full">
          <p className="text-brand-red font-mono text-xs tracking-[0.3em] uppercase mb-6">
            Boletos en vivo
          </p>
          <h1
            className="font-display font-extrabold text-brand-white leading-[0.95] tracking-tight mb-8 w-full"
            style={{ fontSize: "clamp(3rem, 6.5vw, 5.5rem)" }}
          >
            Tu próximo momento épico
            <br />
            <span className="text-brand-red">en México.</span>
          </h1>
          <p className="text-brand-gray/70 text-lg max-w-xl mx-auto mb-10">
            Compra, revende y vive experiencias únicas.
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

      {/* Bento Stats — 6-col perfect grid: 6×3 = 18 cells, zero empty */}
      {stats && (
        <section className="py-32 md:py-48 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-white/10 grid-flow-dense">
            {/* Big image card: 4 cols × 2 rows = 8 cells */}
            <div className="col-span-2 md:col-span-4 md:row-span-2 relative overflow-hidden min-h-[280px] group">
              <img
                src="/images/ariana.jpg"
                alt="Escenario"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                style={{ filter: "grayscale(50%) brightness(0.55) contrast(1.1)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="font-mono text-xs text-brand-gray/60 mb-2 uppercase tracking-widest">
                  Plataforma
                </p>
                <p className="font-display font-extrabold text-brand-white text-2xl leading-tight">
                  Vive sin
                  <br />
                  intermediarios.
                </p>
              </div>
            </div>

            {/* Right column: 2 stats (2 cols each) filling rows 1–2 */}
            <div className="col-span-1 md:col-span-2 bg-brand-black p-8 flex flex-col justify-end">
              <data className="font-display text-4xl md:text-5xl font-extrabold text-brand-white block">
                {stats.activeEvents}+
              </data>
              <span className="text-brand-gray/50 text-sm mt-2 font-mono">Eventos activos</span>
            </div>
            <div className="col-span-1 md:col-span-2 bg-brand-black p-8 flex flex-col justify-end">
              <data className="font-display text-4xl md:text-5xl font-extrabold text-brand-white block">
                {stats.ticketsSold.toLocaleString("es-MX")}
              </data>
              <span className="text-brand-gray/50 text-sm mt-2 font-mono">Tickets vendidos</span>
            </div>

            {/* Bottom row: 3 cards × 2 cols = 6 cols */}
            <div className="col-span-1 md:col-span-2 bg-brand-black p-8 flex flex-col justify-end">
              <data className="font-display text-4xl md:text-5xl font-extrabold text-brand-white block">
                {stats.satisfaction}%
              </data>
              <span className="text-brand-gray/50 text-sm mt-2 font-mono">Satisfacción</span>
            </div>
            <div className="col-span-1 md:col-span-2 bg-brand-black p-8 flex flex-col justify-end">
              <data className="font-display text-4xl md:text-5xl font-extrabold text-brand-white block">
                {stats.cities}+
              </data>
              <span className="text-brand-gray/50 text-sm mt-2 font-mono">Ciudades en México</span>
            </div>
            <div className="col-span-2 md:col-span-2 bg-brand-red/10 border border-brand-red/20 p-8 flex flex-col justify-between">
              <Ticket size={28} className="text-brand-red" />
              <div>
                <h3 className="font-display text-xl font-bold text-brand-white mb-2">
                  Reventa segura
                </h3>
                <p className="text-brand-gray/60 text-sm">
                  Máximo +30% sobre el precio original. Sin estafas.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events — with city filter */}
      <section id="events" className="py-32 md:py-48 px-6" ref={eventsRef}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <h2
              className="font-display font-extrabold text-brand-white"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Próximos
              <br />
              eventos
            </h2>
            <div className="flex flex-wrap gap-2">
              {MEXICO_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setVisibleHomeCount(6);
                    prevHomeVisibleRef.current = 6;
                  }}
                  className={`px-4 py-2 text-xs font-mono transition-all duration-200 cursor-pointer ${
                    selectedCity === city
                      ? "bg-brand-white text-brand-black"
                      : "border border-white/20 text-brand-gray/60 hover:border-white/50 hover:text-brand-white"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px">
              {visibleEvents.map((event, i) => {
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
              {filteredEvents.length === 0 && (
                <div className="col-span-2 py-16 text-center text-brand-gray/40 font-mono text-sm">
                  Sin eventos disponibles en {selectedCity}.
                </div>
              )}
            </div>
          )}

          {!loading && !error && hasMoreHomeEvents && (
            <div className="flex flex-col items-center gap-3 mt-12">
              <p className="font-mono text-xs text-brand-gray/30">
                Mostrando {visibleEvents.length} de {filteredEvents.length}
              </p>
              <button
                onClick={() => setVisibleHomeCount((c) => c + 6)}
                className="border border-white/20 text-brand-white text-sm font-mono px-10 py-3 hover:border-brand-red hover:text-brand-red transition-colors duration-200 cursor-pointer"
              >
                Ver más eventos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Stagefront */}
      <section className="py-32 md:py-48 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p className="font-mono text-xs text-brand-red tracking-[0.3em] uppercase mb-6">
                Por qué Stagefront
              </p>
              <h2
                className="font-display font-extrabold text-brand-white"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Transparencia
                <br />
                total.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {WHY_ITEMS.map(({ title, desc, img }, i) => (
              <div
                key={title}
                ref={(el) => {
                  whyItemsRef.current[i] = el;
                }}
                className="bg-brand-black group cursor-pointer"
              >
                <div className="relative overflow-hidden aspect-[16/9]">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-display font-bold text-xl text-brand-white mb-3 group-hover:text-brand-red transition-colors duration-200">
                    {title}
                  </h3>
                  <p className="text-brand-gray/50 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resales */}
      <section id="resales" className="py-32 md:py-48 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-display font-extrabold text-brand-white mb-16"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Reventas
            <br />
            activas
          </h2>
          {resales.length === 0 ? (
            <p className="text-brand-gray/50 text-sm font-mono">
              No hay reventas activas por el momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px">
              {resales.map((r) => (
                <Link
                  key={r.id}
                  to={`/events/${r.seat.zone.event.id}`}
                  className="block bg-brand-black overflow-hidden hover:bg-white/5 transition-colors duration-300 cursor-pointer"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={r.seat.zone.event.image_url ?? "/images/rosalia.jpg"}
                      alt={r.seat.zone.event.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: "grayscale(30%) brightness(0.75)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent" />
                  </div>
                  <div className="p-8">
                    <p className="font-semibold text-brand-white text-lg">
                      {r.seat.zone.event.title}
                    </p>
                    <p className="text-sm text-brand-gray/60 mt-1 font-mono">
                      {r.seat.zone.name} — {r.seat.zone.event.venue.name},{" "}
                      {r.seat.zone.event.venue.city}
                    </p>
                    <p className="font-display font-bold text-brand-red text-2xl mt-4">
                      {formatMXN(Number(r.price))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Marquee */}
      <div ref={marqueeRef} className="py-8 overflow-hidden border-y border-white/10">
        <div className="marquee-inner flex gap-16 whitespace-nowrap will-change-transform">
          {[...Array(2)].map((_, ri) =>
            MEXICO_CITIES.filter((c) => c !== "Todas").map((city, ci) => (
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

      {/* CTA */}
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
          <p ref={ctaTextRef} className="text-brand-gray/60 text-lg mb-10 max-w-lg mx-auto">
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
            {[
              { label: "Términos", to: "/terms" },
              { label: "Privacidad", to: "/privacy" },
              { label: "Contacto", to: "/contact" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-xs text-brand-gray/40 hover:text-brand-white transition-colors duration-200 cursor-pointer"
              >
                {label}
              </Link>
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
