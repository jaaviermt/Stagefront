import { FC, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Clock, ArrowRight, Star, ChevronLeft, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchEvent, fetchEventReviews, createReview, DEMO_USER_ID } from "../lib/api.js";
import type { ApiEventDetail } from "../lib/api.js";
import { formatMXN, formatEventDate, formatEventDateShort } from "../lib/format.js";
import type { Review, Zone } from "../types/index.js";

gsap.registerPlugin(ScrollTrigger);

const MAX_TICKETS_PER_ORDER = 10;

const EventDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ApiEventDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventId = id;
    if (!eventId) return;
    let cancelled = false;

    const resolvedId: string = eventId;

    async function load(): Promise<void> {
      try {
        const [eventData, reviewsData] = await Promise.all([
          fetchEvent(resolvedId),
          fetchEventReviews(resolvedId),
        ]);
        if (!cancelled) {
          setEvent({
            ...eventData,
            zones: eventData.zones?.map((z) => ({
              ...z,
              price: Number(z.price),
            })),
          });
          setReviews(reviewsData);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Evento no encontrado");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!event) return;

    const ctx = gsap.context(() => {
      if (heroImgRef.current) {
        gsap.fromTo(
          heroImgRef.current,
          { scale: 1.1 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 2,
            },
          }
        );
      }

      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }
    });
    return () => ctx.revert();
  }, [event]);

  const handleReviewSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!event) return;
    if (!newComment.trim()) {
      setReviewError("Escribe un comentario.");
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const created = await createReview({
        user_id: DEMO_USER_ID,
        event_id: event.id,
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la reseña. Puede que ya hayas reseñado este evento."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center gap-3 text-brand-gray/60 pt-20">
        <Loader2 className="animate-spin" size={24} />
        Cargando evento…
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <p className="text-brand-white font-semibold mb-2">{error ?? "Evento no encontrado"}</p>
        <Link to="/events" className="text-brand-red text-sm hover:underline cursor-pointer">
          Ver todos los eventos
        </Link>
      </main>
    );
  }

  const eventTime = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(new Date(event.date));

  const total = selectedZone ? Number(selectedZone.price) * quantity : 0;

  return (
    <main className="overflow-x-hidden w-full max-w-full">
      <section ref={heroRef} className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img
          ref={heroImgRef}
          src={event.image_url}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(50%) brightness(0.4)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />

        <div className="absolute top-20 left-6 z-10">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-3 py-2 bg-brand-black/60 backdrop-blur-sm text-brand-gray/80 hover:text-brand-white hover:bg-brand-black/80 transition-all duration-200 text-sm cursor-pointer"
          >
            <ChevronLeft size={15} />
            Volver
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto" ref={infoRef}>
          <span className="inline-block font-mono text-xs text-brand-red tracking-widest uppercase mb-4">
            {event.genre}
          </span>
          <h1
            className="font-display font-extrabold text-brand-white mb-4 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-brand-gray/60 text-sm">
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              {event.venue.name}, {event.venue.city}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={14} />
              {formatEventDateShort(event.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={14} />
              {eventTime}
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <div>
              <h2 className="font-display font-bold text-xl text-brand-white mb-4">
                Sobre el evento
              </h2>
              <p className="text-brand-gray/60 leading-relaxed">{event.description}</p>
              <p className="text-brand-gray/40 text-sm mt-4 font-mono">
                Artista: {event.artist_name}
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-brand-white mb-6">
                Selecciona tu zona
              </h2>
              <div className="space-y-px">
                {(event.zones ?? []).map((zone) => {
                  const availability =
                    zone.total_seats > 0
                      ? (zone.available_seats / zone.total_seats) * 100
                      : 0;
                  const isSelected = selectedZone?.id === zone.id;
                  const soldOut = zone.available_seats === 0;

                  return (
                    <button
                      key={zone.id}
                      disabled={soldOut}
                      onClick={() => {
                        setSelectedZone(zone);
                        setQuantity((q) =>
                          Math.min(q, zone.available_seats, MAX_TICKETS_PER_ORDER)
                        );
                      }}
                      className={`w-full flex items-center justify-between p-5 transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? "bg-brand-white/10 border-l-2 border-brand-red"
                          : soldOut
                          ? "bg-brand-black/40 opacity-50 cursor-not-allowed"
                          : "bg-white/5 hover:bg-white/8 border-l-2 border-transparent"
                      }`}
                      aria-label={`Seleccionar zona ${zone.name}`}
                    >
                      <div>
                        <p className="font-semibold text-brand-white">{zone.name}</p>
                        <p className="text-sm text-brand-gray/50 mt-1">
                          {soldOut
                            ? "Agotado"
                            : `${zone.available_seats} entradas disponibles`}
                        </p>
                        <div className="mt-2 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              availability > 50
                                ? "bg-brand-green"
                                : availability > 20
                                ? "bg-yellow-500"
                                : "bg-brand-red"
                            }`}
                            style={{ width: `${availability}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-display font-bold text-xl text-brand-white">
                        {formatMXN(Number(zone.price))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-brand-white mb-6">
                Reseñas
              </h2>
              {reviews.length === 0 ? (
                <p className="text-brand-gray/50 text-sm">Aún no hay reseñas para este evento.</p>
              ) : (
                <div className="space-y-px">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white/5 p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star
                              key={s}
                              size={14}
                              className={
                                s < review.rating ? "text-brand-red" : "text-white/20"
                              }
                              fill={s < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </span>
                        <span className="text-sm text-brand-gray/50 font-mono">
                          Usuario {review.user_id.slice(-6)}
                        </span>
                      </div>
                      <p className="text-brand-gray/70 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => void handleReviewSubmit(e)}
                className="mt-8 bg-white/5 border border-white/10 p-5"
              >
                <h3 className="font-display font-bold text-base text-brand-white mb-4">
                  Escribe una reseña
                </h3>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s + 1)}
                      className="cursor-pointer p-0.5"
                      aria-label={`${s + 1} estrellas`}
                    >
                      <Star
                        size={20}
                        className={s < newRating ? "text-brand-red" : "text-white/20"}
                        fill={s < newRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    setReviewError(null);
                  }}
                  rows={3}
                  maxLength={2000}
                  className="w-full bg-brand-black border border-white/10 px-4 py-3 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200 text-sm resize-none"
                  placeholder="Comparte tu experiencia…"
                />
                {reviewError && (
                  <p className="text-xs text-brand-red mt-2 font-mono">{reviewError}</p>
                )}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-brand-white text-sm font-semibold hover:bg-brand-white hover:text-brand-black transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {reviewSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Publicar reseña
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/5 p-6 border border-white/10">
              <h3 className="font-display font-bold text-lg text-brand-white mb-6">
                Tu pedido
              </h3>

              {selectedZone ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray/60">Zona</span>
                    <span className="text-brand-white font-medium">{selectedZone.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-brand-gray/60">Cantidad</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 bg-white/10 hover:bg-white/20 flex items-center justify-center text-brand-white transition-colors duration-200 cursor-pointer"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <output className="font-mono text-brand-white min-w-[2rem] text-center">
                        {quantity}
                      </output>
                      <button
                        onClick={() =>
                          setQuantity((q) =>
                            Math.min(
                              selectedZone.available_seats,
                              MAX_TICKETS_PER_ORDER,
                              q + 1
                            )
                          )
                        }
                        className="w-7 h-7 bg-white/10 hover:bg-white/20 flex items-center justify-center text-brand-white transition-colors duration-200 cursor-pointer"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {quantity >=
                    Math.min(selectedZone.available_seats, MAX_TICKETS_PER_ORDER) && (
                    <p className="text-xs text-brand-gray/40 font-mono text-right">
                      Máximo{" "}
                      {Math.min(selectedZone.available_seats, MAX_TICKETS_PER_ORDER)} boletos
                      por compra
                    </p>
                  )}
                  <div className="border-t border-white/10 pt-4 flex justify-between">
                    <span className="text-brand-gray/60 text-sm">Total</span>
                    <span className="font-display font-bold text-2xl text-brand-white">
                      {formatMXN(total)}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    state={{
                      zone: selectedZone,
                      quantity,
                      event: {
                        id: event.id,
                        title: event.title,
                        date: formatEventDate(event.date),
                        venue: `${event.venue.name}, ${event.venue.city}`,
                      },
                    }}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-brand-red text-brand-white font-semibold hover:bg-brand-white hover:text-brand-black transition-all duration-200 cursor-pointer text-sm mt-2"
                  >
                    Proceder al pago
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <p className="text-brand-gray/40 text-sm text-center py-8">
                  Selecciona una zona para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EventDetailPage;
