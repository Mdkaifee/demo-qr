import { defineConfig } from "vite";

const defaultState = {
  qrId: "MAH-TABLE-12",
  tableName: "Table 12",
  destination: "breakfast",
  active: true,
  announcement: "Welcome. Scan, browse the menu, and place your order with the waiter.",
  scans: 0,
  lastUpdated: new Date().toISOString()
};

let state = { ...defaultState };

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// Dev-only shared state API so every device on the same Wi-Fi (admin laptop,
// guest phone) reads/writes the same demo state instead of separate
// per-browser localStorage. Resets when `npm run dev` restarts.
function sharedStateApi() {
  return {
    name: "dynamic-qr-shared-state",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/state")) {
          next();
          return;
        }

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        if (req.method === "GET") {
          res.end(JSON.stringify(state));
          return;
        }

        if (req.method === "PATCH" || req.method === "PUT") {
          try {
            const body = await readJsonBody(req);
            state =
              req.method === "PUT"
                ? { ...defaultState, ...body, lastUpdated: new Date().toISOString() }
                : { ...state, ...body, lastUpdated: new Date().toISOString() };
            res.end(JSON.stringify(state));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "invalid body" }));
          }
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: "method not allowed" }));
      });
    }
  };
}

export default defineConfig({
  plugins: [sharedStateApi()]
});
