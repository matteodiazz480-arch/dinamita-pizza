import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Volume2,
  VolumeX,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";
import { securePost, sanitizeClientText } from "../utils/securityClient";

function getLocalAssistantReply(rawQuery) {
  const q = rawQuery.toLowerCase();

  if (
    q.includes("comercio") ||
    q.includes("comercios") ||
    q.includes("local") ||
    q.includes("locales") ||
    q.includes("tienda") ||
    q.includes("gastronomia") ||
    q.includes("gastronomía") ||
    q.includes("restaurante")
  ) {
    return {
      reply:
        "Para comercios y locales (gastronomía, indumentaria, tiendas) armamos campañas geolocalizadas en tu radio de venta y contenido constante para atraer clientes y aumentar tus pedidos.",
      action: { label: "Ver soluciones para comercios", type: "consultation", service: "Planes Comercios y Negocios" },
    };
  }

  if (
    q.includes("oficio") ||
    q.includes("oficios") ||
    q.includes("electricista") ||
    q.includes("plomero") ||
    q.includes("gasista") ||
    q.includes("carpintero") ||
    q.includes("tecnico") ||
    q.includes("técnico") ||
    q.includes("instalador") ||
    q.includes("pintor")
  ) {
    return {
      reply:
        "Para oficios (electricistas, plomeros, técnicos, instaladores) en NEXO desarrollamos planes directos para captar clientes en tu zona de trabajo y mostrar tus trabajos reales con reputación verificada.",
      action: { label: "Ver planes para oficios", type: "consultation", service: "Planes NEXO Oficios" },
    };
  }

  if (
    q.includes("profesional") ||
    q.includes("profesionales") ||
    q.includes("medico") ||
    q.includes("médico") ||
    q.includes("abogado") ||
    q.includes("abogada") ||
    q.includes("arquitecto") ||
    q.includes("arquitecta") ||
    q.includes("contador") ||
    q.includes("contadora") ||
    q.includes("nutricionista") ||
    q.includes("psicologo") ||
    q.includes("psicólogo") ||
    q.includes("consultor")
  ) {
    return {
      reply:
        "Para profesionales independientes (médicos, abogados, arquitectos, contadores) construimos una presencia digital de autoridad, posicionando tu marca personal y facilitando la agenda de consultas.",
      action: { label: "Ver planes para profesionales", type: "consultation", service: "Planes NEXO Profesionales" },
    };
  }

  if (
    q.includes("privacidad") ||
    q.includes("datos") ||
    q.includes("cookie") ||
    q.includes("ley 25326") ||
    q.includes("25.326")
  ) {
    return {
      reply:
        "Protegemos tus datos personales conforme a la Ley 25.326 (Argentina). No compartimos tu información con terceros para fines comerciales y podés ejercer tus derechos de acceso, rectificación o supresión desde las Políticas Legales en el pie de página.",
    };
  }

  if (
    q.includes("gratis") ||
    q.includes("gratuito") ||
    q.includes("asesoramiento") ||
    q.includes("diagnóstico") ||
    q.includes("diagnostico")
  ) {
    return {
      reply:
        "Ofrecemos una sesión de diagnóstico gratuita donde revisamos tu presencia digital o campañas actuales y definimos un plan de acción sin compromiso.",
      action: { label: "Solicitar asesoramiento", type: "consultation", service: "Asesoramiento Gratuito General" },
    };
  }

  if (
    q.includes("plan") ||
    q.includes("planes") ||
    q.includes("propuesta")
  ) {
    return {
      reply:
        "Contamos con planes adaptados a cada tipo de negocio:\n• Planes NEXO Oficios y NEXO Profesionales.\n• Plan Presencia & Contenido (Redes + Diseño).\n• Plan Captación Meta Ads.\n• Plan Crecimiento Integral.\n\nTodos se ajustan al alcance que necesites.",
      action: { label: "Solicitar cotización de plan", type: "consultation", service: "Plan Crecimiento Integral" },
    };
  }

  if (
    q.includes("precio") ||
    q.includes("cuesta") ||
    q.includes("costo") ||
    q.includes("tarifa") ||
    q.includes("presupuesto")
  ) {
    return {
      reply:
        "Armamos cada presupuesto según los objetivos y el volumen de tu negocio. Podés pedir una cotización personalizada completando nuestro formulario de asesoramiento.",
      action: { label: "Solicitar cotización", type: "consultation", service: "Asesoramiento Gratuito General" },
    };
  }

  if (
    q.includes("web") ||
    q.includes("pagina") ||
    q.includes("página") ||
    q.includes("landing") ||
    q.includes("sitio")
  ) {
    return {
      reply:
        "Desarrollamos páginas web y landing pages 100% personalizables para tu negocio: sin plantillas genéricas, con carga ultra rápida (<1s en celular), botones directos a WhatsApp y conexión automática a tu CRM. ¿Te gustaría solicitar una cotización a medida?",
      action: {
        label: "Solicitar presupuesto web",
        type: "quote",
        service: "Páginas Web Totalmente Personalizables & Landing Pages",
      },
    };
  }

  if (
    q.includes("servicio") ||
    q.includes("hacen") ||
    q.includes("ofrecen") ||
    q.includes("publicidad") ||
    q.includes("meta") ||
    q.includes("redes") ||
    q.includes("diseño") ||
    q.includes("diseno")
  ) {
    return {
      reply:
        "Trabajamos en 5 áreas principales:\n1. Páginas Web Totalmente Personalizables & Landing Pages.\n2. Publicidad Digital (Meta Ads en Facebook e Instagram).\n3. Gestión de Redes Sociales.\n4. Diseño de Contenido.\n5. Estrategia Digital y Soluciones por Rubro.",
    };
  }

  if (
    q.includes("proceso") ||
    q.includes("pasos") ||
    q.includes("etapas") ||
    q.includes("trabajan")
  ) {
    return {
      reply:
        "Trabajamos en 4 etapas claras:\n01. Análisis del negocio.\n02. Estrategia a medida.\n03. Implementación de anuncios y piezas.\n04. Optimización de resultados.",
    };
  }

  if (
    q.includes("contacto") ||
    q.includes("whatsapp") ||
    q.includes("telefono") ||
    q.includes("teléfono") ||
    q.includes("email")
  ) {
    return {
      reply:
        "Podés escribirnos directamente por WhatsApp o completar el formulario para que nos comuniquemos con vos a la brevedad.",
      action: { label: "Abrir formulario", type: "consultation", service: "Asesoramiento Gratuito General" },
    };
  }

  if (
    q.includes("tiempo") ||
    q.includes("tardan") ||
    q.includes("resultado")
  ) {
    return {
      reply:
        "Las campañas de Meta Ads y estrategias digitales empiezan a generar consultas y visibilidad desde las primeras semanas de circulación activa.",
    };
  }

  return {
    reply:
      "En NEXO Creative nos especializamos en publicidad en Meta Ads, gestión de redes, diseño y soluciones para comercios, oficios y profesionales. ¿Querés coordinar un asesoramiento gratuito?",
    action: { label: "Solicitar asesoramiento", type: "consultation", service: "Asesoramiento Gratuito General" },
  };
}

export default function VirtualAssistantChat({
  onOpenConsultationModal,
  onOpenQuoteModal,
  onOpenLegalDoc,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Hola, soy el asistente automatizado de NEXO Creative. ¿En qué puedo orientarte sobre nuestros servicios o el asesoramiento gratuito?",
      time: "Ahora",
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    playSound(nextState ? "open" : "close", isMuted);
  };

  const suggestions = [
    "Planes para oficios y profesionales",
    "¿Qué servicios ofrecen?",
    "¿Cómo es el proceso?",
    "Asesoramiento gratuito",
  ];

  const msgCounter = useRef(1);

  const handleSendMessage = async (textToSend) => {
    const raw = textToSend !== undefined ? textToSend : inputMessage;
    const text = sanitizeClientText(raw, 300).trim();
    if (!text || isTyping) return;

    playSound("send", isMuted);
    const nextId = msgCounter.current++;

    const userMsg = {
      id: `user-${nextId}`,
      sender: "user",
      text,
      time: "Ahora",
    };

    setMessages((prev) => [...prev.slice(-18), userMsg]);
    setInputMessage("");
    setIsTyping(true);

    const res = await securePost("/api/assistant", { message: text });

    playSound("receive", isMuted);
    setIsTyping(false);
    const botId = msgCounter.current++;

    let botReply = "";
    let botAction = null;

    if (res.ok && res.data?.reply) {
      botReply = res.data.reply;
      botAction = res.data.action || null;
    } else {
      // Local fallback in case backend is offline, static hosting, or cold start
      const fallback = getLocalAssistantReply(text);
      botReply = fallback.reply;
      botAction = fallback.action || null;
    }

    const botMsg = {
      id: `bot-${botId}`,
      sender: "bot",
      text: botReply,
      action: botAction,
      time: "Ahora",
    };

    setMessages((prev) => [...prev.slice(-18), botMsg]);
  };

  const handleActionClick = (action) => {
    if (action?.type === "consultation") {
      setIsOpen(false);
      onOpenConsultationModal?.(action.service || "Asesoramiento Gratuito General");
    } else if (action?.type === "quote") {
      setIsOpen(false);
      onOpenQuoteModal?.(action.service || "Plan Crecimiento Integral");
    }
  };

  return (
    <>
      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-5 right-3 sm:right-6 z-40 flex items-center justify-end">
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          onClick={toggleChat}
          className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#17181c] hover:bg-[#1f2127] text-white border border-white/15 flex items-center justify-center shadow-lg cursor-pointer transition-colors"
          aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
        >
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#111111]" />
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <MessageSquare className="w-5 h-5 text-white" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-[calc(8.1rem+env(safe-area-inset-bottom,0px))] md:bottom-19 right-3 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[380px] h-[440px] max-h-[68vh] md:max-h-[520px] bg-[#141519] border border-white/12 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] z-40 flex flex-col overflow-hidden text-white origin-bottom-right"
          >
            <div className="px-4 py-3 bg-[#111111] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <div>
                  <h4 className="text-xs font-extrabold text-white tracking-wide">
                    Asistente NEXO Creative
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Sesión efímera · No ingreses datos sensibles
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title={isMuted ? "Activar sonido" : "Silenciar sonido"}
                  aria-label="Alternar sonido"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleChat}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Cerrar chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs sm:text-sm">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line ${
                        isUser
                          ? "bg-[#16A34A] text-white font-semibold rounded-br-xs"
                          : "bg-[#1c1e24] text-gray-200 border border-white/5 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}

                      {msg.action && (
                        <div className="mt-2.5 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => handleActionClick(msg.action)}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs sm:text-sm transition-colors cursor-pointer shadow-sm min-h-[40px]"
                          >
                            <span>{msg.action.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-[#1c1e24] w-14 text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.3s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="px-3.5 py-2 border-t border-white/5 bg-[#111111]/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSendMessage(item)}
                  className="px-3.5 py-2 rounded-full bg-white/8 hover:bg-white/20 hover:text-white border border-white/12 text-xs text-gray-200 font-semibold whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 min-h-[36px] flex items-center"
                >
                  {item}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-[#111111] border-t border-white/10 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={300}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribí tu consulta..."
                  className="flex-1 bg-[#17181c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-30 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
                <span>Asistente automatizado en servidor seguro</span>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.("seguridad")}
                  className="hover:text-gray-300 underline underline-offset-2 cursor-pointer"
                >
                  Política de IA y seguridad
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
