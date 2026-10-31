import { createSecurityMiddleware } from "../backend/securityApi.js";

const middleware = createSecurityMiddleware();

export default function handler(req, res) {
  return middleware(req, res, () => {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "Recurso no encontrado." }));
  });
}
