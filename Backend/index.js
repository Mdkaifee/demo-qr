import { createServer } from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { networkInterfaces } from "node:os";
import { createStore } from "./store.js";
import { createApi } from "./app.js";

const root = fileURLToPath(new URL("../Frontend/", import.meta.url));
const dev = process.argv.includes("--dev");
const port = Number(process.env.PORT || (dev ? 5173 : 3000));
let store;
try { store = await createStore(); }
catch (error) { console.error(`MongoDB connection failed (${error.name}). Check MONGODB_URI, database credentials, and Atlas Network Access. The server has not started.`); process.exit(1); }
const api = createApi(store);
const dist = resolve(root, "dist");
if (!dev && !existsSync(resolve(dist, "index.html"))) { console.error("Build the frontend first: npm run build"); await store.close(); process.exit(1); }
const server = createServer();
const vite = dev ? await (await import("vite")).createServer({ root, server: { middlewareMode: true, hmr: { server } }, appType: "spa" }) : null;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
server.on("request", (req, res) => {
  if (req.url.startsWith("/api/") || req.url === "/api") return void api(req, res);
  if (vite) return vite.middlewares(req, res);
  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let path;
  try { path = decodeURIComponent(new URL(req.url, "http://localhost").pathname); } catch { res.writeHead(400); res.end(); return; }
  let file = resolve(dist, `.${path}`);
  if (!file.startsWith(`${dist}${sep}`) && file !== dist) { res.writeHead(403); res.end(); return; }
  if (!existsSync(file) || !statSync(file).isFile()) {
    if (extname(path)) { res.writeHead(404); res.end("Not found"); return; }
    file = resolve(dist, "index.html");
  }
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Cache-Control": file.includes(`${sep}assets${sep}`) ? "public, max-age=31536000, immutable" : "no-cache" });
  if (req.method === "HEAD") res.end();
  else createReadStream(file).on("error", () => res.destroy()).pipe(res);
});
server.on("error", error => { console.error(error.code === "EADDRINUSE" ? `Port ${port} is already in use. Stop the existing server or set PORT to another port.` : error.code); process.exit(1); });
server.listen(port, "0.0.0.0", () => {
  console.log(`\nMongoDB connected. Restaurant frontend + backend running.\nAdmin: http://localhost:${port}/?demo=admin\nGuest: http://localhost:${port}/?scan=MAH-TABLE-12`);
  for (const entries of Object.values(networkInterfaces())) for (const entry of entries || []) if (entry.family === "IPv4" && !entry.internal) console.log(`Phone / Wi-Fi: http://${entry.address}:${port}/?demo=admin`);
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, async () => { await vite?.close(); server.close(async () => { await store.close(); process.exit(0); }); server.closeIdleConnections(); });
