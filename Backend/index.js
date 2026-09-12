import { createServer } from "node:http";
import { createStore } from "./store.js";
import { createApi } from "./app.js";

const port = Number(process.env.PORT || 3000);

let store;

try {
  store = await createStore();
} catch (error) {
  console.error(
    `MongoDB connection failed (${error.name}). Check MONGODB_URI, database credentials, and Atlas Network Access.`
  );
  process.exit(1);
}

const api = createApi(store);

const server = createServer((req, res) => {
  if (req.url.startsWith("/api/") || req.url === "/api") {
    return api(req, res);
  }

  res.writeHead(404, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify({ message: "Not found" }));
});

server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${port} is already in use.`
      : error
  );
  process.exit(1);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Backend running on port ${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(async () => {
      await store.close();
      process.exit(0);
    });
  });
}