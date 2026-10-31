import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { BrandLogo, InstagramIcon, FacebookIcon } from "./Icons";
import { motion, useReducedMotion } from "framer-motion";

export default function Footer({ onOpenLegalDoc, onOpenCookieSettings }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="bg-[#0b0c0e] text-white pt-4 pb-24 md:pb-10 relative">
      <div className="h-px w-full max-w-5xl mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent mb-7" />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-6 border-b border-white/[0.05]">
          <a href="#inicio" className="transition-opacity hover:opacity-90" aria-label="NEXO Creative">
            <BrandLogo />
          </a>

          <div className="flex items-center gap-3">
            <a
              href={NEXO_CONFIG.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-[#BCE838]/12 hover:text-[#BCE838] border border-white/[0.08] text-xs font-semibold text-gray-300 transition-colors"
              aria-label="Instagram oficial de NEXO Creative"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram</span>
            </a>

            <a
              href={NEXO_CONFIG.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-[#BCE838]/12 hover:text-[#BCE838] border border-white/[0.08] text-xs font-semibold text-gray-300 transition-colors"
              aria-label="Facebook oficial de NEXO Creative"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        <div className="py-5 border-b border-white/[0.05] flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-2 text-xs text-gray-400">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => onOpenLegalDoc?.("privacidad")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Política de privacidad
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalDoc?.("cookies")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Política de cookies
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalDoc?.("terminos")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Términos y condiciones
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalDoc?.("seguridad")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Política de seguridad
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenCookieSettings?.()}
            className="text-gray-400 hover:text-[#BCE838] font-semibold transition-colors cursor-pointer"
          >
            Configurar cookies
          </button>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>{NEXO_CONFIG.footer.copyright}</p>
          <p className="text-gray-400 font-medium">{NEXO_CONFIG.footer.servicesList}</p>
        </div>
      </motion.div>
    </footer>
  );
}
