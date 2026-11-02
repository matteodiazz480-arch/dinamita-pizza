import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { securePost, sanitizeClientText } from "../utils/securityClient";
import { playSound } from "../utils/sound";
import { WhatsAppIcon } from "./Icons";
import { NEXO_CONFIG, getWhatsAppUrl } from "../data/nexoData";

const DAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const FULL_DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const FULL_MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const AVAILABLE_SLOTS = [
  "09:30",
  "10:15",
  "11:00",
  "11:45",
  "12:30",
  "14:00",
  "14:45",
  "15:30",
  "16:15",
  "17:00",
  "17:45",
  "18:30",
];

function generateAvailableDays(count = 14) {
  const days = [];
  const start = new Date();
  let added = 0;
  let offset = 1;

  while (added < count && offset < 30) {
    const d = new Date(start);
    d.setDate(start.getDate() + offset);
    if (d.getDay() !== 0) {
      days.push({
        dateObj: d,
        isoString: d.toISOString().split("T")[0],
        dayOfWeek: DAY_NAMES[d.getDay()],
        fullDayName: FULL_DAY_NAMES[d.getDay()],
        dayNumber: d.getDate(),
        monthName: MONTH_NAMES[d.getMonth()],
        fullMonthName: FULL_MONTH_NAMES[d.getMonth()],
        year: d.getFullYear(),
        isTomorrow: offset === 1,
      });
      added++;
    }
    offset++;
  }
  return days;
}

export default function CtaContactSection({ onOpenLegalDoc }) {
  const prefersReducedMotion = useReducedMotion();
  const daysList = useMemo(() => generateAvailableDays(12), []);
  const formLoadedAtRef = useRef(0);

  useEffect(() => {
    formLoadedAtRef.current = Date.now();
  }, []);

  const [step, setStep] = useState(1); // 1: Turno | 2: Datos | 3: Confirmado
  const [selectedDay, setSelectedDay] = useState(daysList[0] || null);
  const [selectedTime, setSelectedTime] = useState("15:30");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    businessName: "",
    notes: "",
    privacyConsent: true,
    website_url: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const daysScrollRef = useRef(null);

  const scrollDays = (direction) => {
    if (!daysScrollRef.current) return;
    const scrollAmount = direction === "left" ? -160 : 160;
    daysScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    playSound("click");
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    playSound("click");
  };

  const handleGoToStep2 = () => {
    if (!selectedDay || !selectedTime) return;
    playSound("click");
    setStep(2);
  };

  const handleBackToStep1 = () => {
    playSound("click");
    setStep(1);
  };

  const validate = () => {
    const errs = {};
    const name = sanitizeClientText(formData.fullName, 80).trim();
    const phone = sanitizeClientText(formData.phone, 30).trim();
    const email = sanitizeClientText(formData.email, 120).trim();

    if (name.length < 2) {
      errs.fullName = "Ingresá tu nombre y apellido.";
    }
    const phoneDigits = phone.replace(/[^0-9]/g, "");
    if (!phone) {
      errs.phone = "Ingresá tu WhatsApp para coordinar.";
    } else if (phoneDigits.length < 6 || phoneDigits.length > 16) {
      errs.phone = "Número de teléfono inválido.";
    }
    if (!email) {
      errs.email = "Ingresá tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errs.email = "Correo electrónico inválido.";
    }
    if (!formData.privacyConsent) {
      errs.privacyConsent = "Debés aceptar la política de privacidad.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "submitting") return;
    setServerError("");

    if (!validate()) {
      playSound("error");
      return;
    }

    setStatus("submitting");

    const meetingDateStr = `${selectedDay.fullDayName} ${selectedDay.dayNumber} de ${selectedDay.fullMonthName} ${selectedDay.year}`;
    const constructedMessage = `Reserva de reunión estratégica de 20 min para el ${meetingDateStr} a las ${selectedTime} hs.${
      formData.notes ? ` Nota: ${formData.notes}` : ""
    }`;

    try {
      const response = await securePost("/api/contact", {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        businessName: formData.businessName || "No especificado",
        service: "Reunión Gratuita 20 min",
        message: constructedMessage,
        privacyConsent: true,
        website_url: formData.website_url,
        formLoadedAt: formLoadedAtRef.current,
        meetingDate: selectedDay.isoString,
        meetingTime: selectedTime,
      });

      if (!response.ok) {
        setStatus("error");
        setServerError(
          response.error || "No pudimos agendar tu reunión. Por favor reintentá."
        );
        playSound("error");
        return;
      }

      playSound("success");
      setStatus("success");
      setStep(3);
      setConfirmedBooking({
        refId: response.refId || "NEXO-MEET",
        dateString: meetingDateStr,
        timeString: selectedTime,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        businessName: formData.businessName,
      });
    } catch {
      setStatus("error");
      setServerError("Error de conexión. Verificá tu red y probá nuevamente.");
      playSound("error");
    }
  };

  const getWhatsAppBookingUrl = () => {
    if (!confirmedBooking) return "#";
    const text = encodeURIComponent(
      `Hola NEXO Creative, acabo de agendar una reunión estratégica de 20 min para el ${confirmedBooking.dateString} a las ${confirmedBooking.timeString} hs (Ref: ${confirmedBooking.refId}). Mi negocio es: ${confirmedBooking.businessName || "Mi proyecto"}.`
    );
    const cleanNumber = (NEXO_CONFIG.whatsappNumber || "").replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  return (
    <section
      id="contacto"
      className="bg-gradient-to-b from-[#111111] via-[#0d0f12] to-[#0b0c0e] text-white relative overflow-hidden pt-8 sm:pt-14 pb-14 sm:pb-20"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#BCE838]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-3.5 sm:px-6">
        {/* Cabecera limpia y concisa */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {NEXO_CONFIG.cta.title}
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 font-normal mt-2 leading-relaxed">
            Agendá una reunión estratégica gratuita de{" "}
            <span className="text-[#BCE838] font-bold">20 minutos</span>.
          </p>
        </motion.div>

        {/* Tarjeta del Calendario por Etapas */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* ETAPA 1: Elegir Día y Horario */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#BCE838] text-[#111111] font-black flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Elegí tu día y horario</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#BCE838]/15 text-[#BCE838] border border-[#BCE838]/30">
                    Duración: 20 min
                  </span>
                </div>

                {/* Selector de Días */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#BCE838]" />
                      <span>Días disponibles</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => scrollDays("left")}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Anteriores"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollDays("right")}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Siguientes"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={daysScrollRef}
                    className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
                  >
                    {daysList.map((day) => {
                      const isSelected =
                        selectedDay && selectedDay.isoString === day.isoString;
                      return (
                        <button
                          key={day.isoString}
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[58px] py-1.5 sm:py-2 px-1 rounded-xl border transition-all cursor-pointer flex-shrink-0 select-none ${
                            isSelected
                              ? "bg-[#BCE838] border-[#BCE838] text-[#111111] shadow-[0_0_12px_rgba(188,232,56,0.35)] scale-102 font-black"
                              : "bg-[#181a20] border-white/10 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold tracking-tight">
                            {day.isTomorrow ? "Mañ" : day.dayOfWeek}
                          </span>
                          <span className="text-sm sm:text-base font-black my-0.2">
                            {day.dayNumber}
                          </span>
                          <span className="text-[8px] uppercase font-medium">
                            {day.monthName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selector de Horarios en Grilla Compacta */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1 mb-2">
                    <Clock className="w-3.5 h-3.5 text-[#BCE838]" />
                    <span>Horario disponible</span>
                  </label>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {AVAILABLE_SLOTS.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleSelectTime(time)}
                          className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? "bg-[#BCE838] border-[#BCE838] text-[#111111] shadow-[0_0_10px_rgba(188,232,56,0.3)] font-black"
                              : "bg-[#181a20] border-white/10 text-gray-300 hover:border-white/25"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen y Botón para Continuar a Etapa 2 */}
                {selectedDay && (
                  <div className="pt-2">
                    <div className="p-2.5 rounded-xl bg-[#181a20] border border-[#BCE838]/25 flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#BCE838] animate-pulse" />
                        <span className="font-bold text-white text-[11px] sm:text-xs">
                          {selectedDay.dayOfWeek} {selectedDay.dayNumber} {selectedDay.monthName} · {selectedTime} hs
                        </span>
                      </div>
                      <span className="text-[10px] text-[#BCE838] font-bold">
                        Paso 1 listo
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoToStep2}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-black text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_18px_rgba(188,232,56,0.35)] active:scale-98"
                    >
                      <span>Continuar con este horario</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ETAPA 2: Datos de Contacto */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a horario</span>
                  </button>
                  <span className="font-extrabold text-[#BCE838] text-[11px]">
                    {selectedDay?.dayOfWeek} {selectedDay?.dayNumber} {selectedDay?.monthName} · {selectedTime} hs
                  </span>
                </div>

                {serverError && (
                  <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
                  {/* Honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website_url}
                      onChange={(e) =>
                        setFormData({ ...formData, website_url: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        maxLength={80}
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Nombre y Apellido *"
                        className={`w-full bg-[#181a20] border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.fullName
                            ? "border-red-500"
                            : "border-white/12 focus:border-[#BCE838]"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-[9px] mt-0.5">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        maxLength={30}
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="WhatsApp con código *"
                        className={`w-full bg-[#181a20] border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.phone
                            ? "border-red-500"
                            : "border-white/12 focus:border-[#BCE838]"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-[9px] mt-0.5">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="email"
                        maxLength={120}
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Correo electrónico *"
                        className={`w-full bg-[#181a20] border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.email
                            ? "border-red-500"
                            : "border-white/12 focus:border-[#BCE838]"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-[9px] mt-0.5">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        maxLength={80}
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({ ...formData, businessName: e.target.value })
                        }
                        placeholder="Nombre de tu negocio (opcional)"
                        className="w-full bg-[#181a20] border border-white/12 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#BCE838] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Consentimiento */}
                  <label className="flex items-start gap-1.5 cursor-pointer select-none pt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.privacyConsent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          privacyConsent: e.target.checked,
                        })
                      }
                      className="mt-0.5 rounded border-gray-600 text-[#BCE838] focus:ring-[#BCE838]"
                    />
                    <span className="text-[10px] text-gray-400 leading-tight">
                      Acepto el uso de mis datos para coordinar la reunión según la{" "}
                      <button
                        type="button"
                        onClick={() => onOpenLegalDoc?.("privacidad")}
                        className="text-gray-300 underline hover:text-[#BCE838] cursor-pointer"
                      >
                        Política de Privacidad
                      </button>
                      .
                    </span>
                  </label>
                  {errors.privacyConsent && (
                    <p className="text-red-400 text-[9px]">
                      {errors.privacyConsent}
                    </p>
                  )}

                  {/* Botón de envío */}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full mt-1.5 inline-flex items-center justify-center gap-1.5 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-black text-xs sm:text-sm px-4 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_18px_rgba(188,232,56,0.35)] active:scale-98 disabled:opacity-50"
                  >
                    {status === "submitting" ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Confirmar reunión de 20 min</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#BCE838]" />
                    <span>Datos protegidos · Ley 25.326</span>
                  </span>
                  <span>100% Sin Costo</span>
                </div>
              </motion.div>
            )}

            {/* ETAPA 3: Confirmación Exitosa */}
            {step === 3 && confirmedBooking && (
              <motion.div
                key="step-3"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4 space-y-3.5"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#BCE838]/15 border-2 border-[#BCE838] flex items-center justify-center mx-auto text-[#BCE838]">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#BCE838] uppercase">
                    Código: {confirmedBooking.refId}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    ¡Reunión de 20 min agendada!
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Tu turno quedó registrado con éxito en nuestro CRM. Nos conectaremos puntualmente.
                  </p>
                </div>

                <div className="bg-[#181a20] border border-white/10 rounded-xl p-3 text-left text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Fecha y hora</span>
                    <span className="font-bold text-[#BCE838]">
                      {confirmedBooking.dateString} · {confirmedBooking.timeString} hs
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Contacto</span>
                    <span className="font-semibold text-white">
                      {confirmedBooking.fullName}
                    </span>
                  </div>
                  {confirmedBooking.businessName && (
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Negocio</span>
                      <span className="font-semibold text-white">
                        {confirmedBooking.businessName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <a
                    href={getWhatsAppBookingUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-98"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    <span>Confirmar por WhatsApp directo</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setConfirmedBooking(null);
                      setStep(1);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors border border-white/12"
                  >
                    <span>Agendar otra fecha</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enlace discreto a WhatsApp */}
        <div className="mt-4 text-center">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-[#BCE838] transition-colors"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#BCE838]" />
            <span>O contactanos por WhatsApp directo</span>
          </a>
        </div>
      </div>
    </section>
  );
}
