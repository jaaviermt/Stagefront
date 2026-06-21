import { FC, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Lock, ChevronLeft, CreditCard, Check, Loader2 } from "lucide-react";
import { createOrder, DEMO_USER_ID } from "../lib/api.js";
import { formatMXN } from "../lib/format.js";

interface CheckoutState {
  zone?: { id: string; name: string; price: number };
  quantity?: number;
  event?: { id: string; title: string; date: string; venue: string };
}

type Step = "details" | "payment" | "confirmation";

const CheckoutPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;
  const { zone, quantity = 1, event } = state ?? {};

  const [step, setStep] = useState<Step>("details");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const subtotal = (zone?.price ?? 0) * quantity;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handlePromo = (): void => {
    if (promoCode.trim().toLowerCase() === "stagefront10") {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoError("Código promocional inválido.");
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (step === "details") {
      if (!form.name.trim()) {
        setSubmitError("Ingresa tu nombre completo.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setSubmitError("Ingresa un email válido.");
        return;
      }
      setSubmitError(null);
      setStep("payment");
      return;
    }

    if (!/^\d{13,19}$/.test(form.cardNumber.replace(/\s/g, ""))) {
      setSubmitError("Ingresa un número de tarjeta válido (13 a 19 dígitos).");
      return;
    }

    const expiryMatch = form.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      setSubmitError("Ingresa la fecha de caducidad en formato MM/AA.");
      return;
    }
    const expMonth = Number(expiryMatch[1]);
    const expYear = 2000 + Number(expiryMatch[2]);
    if (expMonth < 1 || expMonth > 12) {
      setSubmitError("El mes de caducidad no es válido.");
      return;
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setSubmitError("La tarjeta está vencida.");
      return;
    }

    if (!/^\d{3,4}$/.test(form.cvv)) {
      setSubmitError("El CVV debe tener 3 o 4 dígitos.");
      return;
    }

    if (!event?.id || !zone?.id) {
      setSubmitError("Selecciona un evento y zona desde la página del concierto.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const order = await createOrder({
        user_id: DEMO_USER_ID,
        event_id: event.id,
        zone_id: zone.id,
        quantity,
        promo_code: promoApplied ? "STAGEFRONT10" : undefined,
      });
      setOrderRef(order.id);
      setStep("confirmation");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al crear el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (!zone || !event) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <p className="text-brand-white mb-4">No hay datos de compra.</p>
        <Link to="/events" className="text-brand-red text-sm cursor-pointer hover:underline">
          Explorar eventos
        </Link>
      </main>
    );
  }

  if (step === "confirmation") {
    return (
      <main className="overflow-x-hidden w-full min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-brand-red/20 border border-brand-red/40 flex items-center justify-center mx-auto mb-8">
            <Check size={28} className="text-brand-red" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-brand-white mb-4">
            ¡Pedido confirmado!
          </h1>
          <p className="text-brand-gray/60 mb-2">
            Recibirás tus entradas en{" "}
            <strong className="text-brand-white">{form.email || "tu email"}</strong>
          </p>
          <p className="text-brand-gray/40 text-sm mb-10 font-mono">
            Referencia: {orderRef?.slice(0, 12).toUpperCase() ?? "—"}
          </p>
          <p className="text-brand-white font-display text-xl mb-8">{formatMXN(total)}</p>
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-white text-brand-black font-semibold hover:bg-brand-red hover:text-brand-white transition-all duration-200 cursor-pointer text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center gap-2 text-brand-gray/50 hover:text-brand-white transition-colors duration-200 text-sm mb-10 cursor-pointer"
        >
          <ChevronLeft size={16} />
          Volver al evento
        </Link>

        <div className="flex items-center gap-0 mb-12">
          {(["details", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 text-sm font-mono ${
                  s === step
                    ? "bg-brand-red text-brand-white"
                    : step === "payment" && s === "details"
                    ? "bg-white/10 text-brand-gray/50 line-through"
                    : "bg-white/5 text-brand-gray/40"
                }`}
              >
                <span>{i + 1}</span>
                <span className="capitalize">{s === "details" ? "Datos" : "Pago"}</span>
              </div>
              {i === 0 && <div className="w-8 h-px bg-white/20" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
              {step === "details" && (
                <>
                  <h2 className="font-display font-bold text-xl text-brand-white mb-6">
                    Datos personales
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-brand-gray/60 mb-2" htmlFor="name">
                        Nombre completo
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200"
                        placeholder="Ana García López"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-brand-gray/60 mb-2" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200"
                        placeholder="ana@ejemplo.mx"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm text-brand-gray/60 mb-2">
                      Código promocional
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        disabled={promoApplied}
                        className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200 font-mono text-sm disabled:opacity-50"
                        placeholder="STAGEFRONT10"
                      />
                      <button
                        type="button"
                        onClick={handlePromo}
                        disabled={promoApplied || !promoCode}
                        className={`px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          promoApplied
                            ? "bg-brand-green/20 text-brand-green border border-brand-green/30"
                            : "bg-white/10 text-brand-white hover:bg-white/20"
                        } disabled:cursor-not-allowed`}
                      >
                        {promoApplied ? <Check size={16} /> : "Aplicar"}
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-xs text-brand-green mt-2 font-mono">
                        ¡10% de descuento aplicado!
                      </p>
                    )}
                    {promoError && !promoApplied && (
                      <p className="text-xs text-brand-red mt-2 font-mono">
                        {promoError}
                      </p>
                    )}
                  </div>
                </>
              )}

              {step === "payment" && (
                <>
                  <h2 className="font-display font-bold text-xl text-brand-white mb-6">
                    Datos de pago
                  </h2>
                  <p className="text-xs text-brand-gray/50 mb-4 font-mono">
                    Simulación de pago — el pedido se guarda en PostgreSQL al confirmar.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-brand-gray/60 mb-2" htmlFor="card">
                        Número de tarjeta
                      </label>
                      <div className="relative">
                        <input
                          id="card"
                          type="text"
                          required
                          maxLength={19}
                          value={form.cardNumber}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                            setForm({ ...form, cardNumber: formatted });
                          }}
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 pr-12 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200 font-mono"
                          placeholder="0000 0000 0000 0000"
                        />
                        <CreditCard
                          size={16}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray/30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-brand-gray/60 mb-2" htmlFor="expiry">
                          Caducidad
                        </label>
                        <input
                          id="expiry"
                          type="text"
                          required
                          maxLength={5}
                          value={form.expiry}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const formatted =
                              raw.length >= 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                            setForm({ ...form, expiry: formatted });
                          }}
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200 font-mono"
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-brand-gray/60 mb-2" htmlFor="cvv">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          type="text"
                          required
                          maxLength={4}
                          value={form.cvv}
                          onChange={(e) =>
                            setForm({ ...form, cvv: e.target.value.replace(/\D/g, "") })
                          }
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-brand-white placeholder-brand-gray/30 focus:outline-none focus:border-brand-red transition-colors duration-200 font-mono"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-gray/40 mt-4">
                    <Lock size={12} />
                    Pago seguro encriptado con SSL
                  </div>
                </>
              )}

              {submitError && (
                <p className="text-brand-red text-sm bg-brand-red/10 border border-brand-red/30 p-3">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-brand-red text-brand-white font-semibold hover:bg-brand-white hover:text-brand-black transition-all duration-200 cursor-pointer mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {step === "details"
                  ? "Continuar al pago"
                  : submitting
                  ? "Procesando…"
                  : `Pagar ${formatMXN(total)}`}
              </button>

              {step === "payment" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setSubmitError(null);
                  }}
                  className="w-full py-4 border border-white/20 text-brand-white font-semibold hover:border-brand-red hover:text-brand-red transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Atrás
                </button>
              )}
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 p-6">
              <h3 className="font-display font-bold text-base text-brand-white mb-6">
                Resumen del pedido
              </h3>
              <div className="border-b border-white/10 pb-4 mb-4">
                <p className="font-semibold text-brand-white text-sm">{event.title}</p>
                <p className="text-brand-gray/50 text-xs mt-1">{event.date}</p>
                <p className="text-brand-gray/50 text-xs">{event.venue}</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-brand-gray/60">
                  <span>
                    {zone.name} × {quantity}
                  </span>
                  <span>{formatMXN(subtotal)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-brand-green">
                    <span>Descuento (10%)</span>
                    <span>−{formatMXN(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-gray/60">
                  <span>Gestión</span>
                  <span>{formatMXN(0)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-semibold text-brand-white">Total</span>
                  <span className="font-display font-bold text-xl text-brand-white">
                    {formatMXN(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
