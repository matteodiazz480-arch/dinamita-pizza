import http from "node:http";
import { createSecurityMiddleware } from "./securityApi.js";

const PORT = Number(process.env.PORT || 4000);
const middleware = createSecurityMiddleware();

const server = http.createServer((req, res) => {
  middleware(req, res, () => {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "Ruta no encontrada." }));
  });
});

server.listen(PORT);
