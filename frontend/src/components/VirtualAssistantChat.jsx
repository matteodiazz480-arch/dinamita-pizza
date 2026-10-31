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

export default function VirtualAssistantChat({
  onOpenConsultationModal,
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
    "¿Qué servicios ofrecen?",
    "¿Cómo es el proceso?",
    "Asesoramiento gratuito",
    "Privacidad de datos",
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

    const botMsg = {
      id: `bot-${botId}`,
      sender: "bot",
      text: res.ok
        ? res.data.reply
        : res.data?.error ||
          "En este momento no pude procesar la consulta. Podés usar el formulario de contacto.",
      action: res.ok ? res.data.action : null,
      time: "Ahora",
    };

    setMessages((prev) => [...prev.slice(-18), botMsg]);
  };

  const handleActionClick = (action) => {
    if (action?.type === "consultation") {
      setIsOpen(false);
      onOpenConsultationModal?.("Asesoramiento Gratuito General");
    }
  };

  return (
    <>
      <div className="fixed bottom-18 md:bottom-5 right-4 sm:right-5 z-40 flex items-center justify-end">
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          onClick={toggleChat}
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#17181c] hover:bg-[#1f2127] text-white border border-white/15 flex items-center justify-center shadow-lg cursor-pointer transition-colors"
          aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
        >
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#BCE838] border-2 border-[#111111]" />
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <MessageSquare className="w-5 h-5 text-[#BCE838]" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-32 md:bottom-20 right-4 sm:right-5 w-[calc(100vw-2rem)] sm:w-[360px] h-[420px] sm:h-[480px] max-h-[calc(100vh-9.5rem)] bg-[#141519] border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden text-white"
          >
            <div className="px-4 py-3 bg-[#111111] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#BCE838]" />
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
                          ? "bg-[#BCE838] text-[#111111] font-semibold rounded-br-xs"
                          : "bg-[#1c1e24] text-gray-200 border border-white/5 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}

                      {msg.action && (
                        <div className="mt-2.5 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => handleActionClick(msg.action)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold text-[11px] transition-colors cursor-pointer"
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
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#BCE838]/12 hover:text-[#BCE838] border border-white/10 text-[11px] text-gray-300 font-medium whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
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
                  className="flex-1 bg-[#17181c] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#BCE838] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-[#BCE838] hover:bg-[#add92b] disabled:opacity-30 text-[#111111] flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
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
