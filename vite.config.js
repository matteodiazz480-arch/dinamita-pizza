import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createSecurityMiddleware } from "./backend/securityApi.js";

function nexoSecurityPlugin() {
  const middleware = createSecurityMiddleware();
  return {
    name: "nexo-security-middleware",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  root: "frontend",
  publicDir: "public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [nexoSecurityPlugin(), tailwindcss(), react()],
  server: {
    fs: {
      deny: [".env", ".env.*", "*.{crt,pem}", "backend/storage/**"],
    },
  },
});
