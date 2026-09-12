import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { passwordHash } from "./store.js";

const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};

const SESSION_MS = 12 * 60 * 60 * 1000;
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "https://qr-menu-demo-9vhn.onrender.com";

function text(value, label, max = 200, required = false) {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  ) {
    fail(
      400,
      `${label} ${required ? "is required and " : ""}must be text of at most ${max} characters.`
    );
  }
  return value.trim();
}

function boolean(value) {
  if (typeof value !== "boolean") fail(400, "Status must be true or false.");
  return value;
}

function number(value, label, max) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max
  ) {
    fail(400, `${label} must be between 0 and ${max}.`);
  }
  return value;
}

function httpUrl(value, label, base = false) {
  value = text(value, label, 2000);
  if (!value) return "";

  let url;
  try {
    url = new URL(value);
  } catch {
    fail(400, `${label} must be a full http:// or https:// URL.`);
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (base && (url.search || url.hash || url.pathname !== "/"))
  ) {
    fail(
      400,
      `${label} must be an HTTP(S) ${
        base ? "origin without a path, query, or fragment" : "URL without credentials"
      }.`
    );
  }

  return base ? url.origin : url.href;
}

function ids(value, collection, label) {
  if (
    !Array.isArray(value) ||
    value.length > 500 ||
    value.some(
      (id) => typeof id !== "string" || !collection.some((row) => row.id === id)
    )
  ) {
    fail(400, `Select valid ${label}.`);
  }

  return [...new Set(value)];
}

function validate(kind, body, data, current) {
  const input = { ...current, ...body };
  const result = {
    name: text(input.name, "Name", 120, true),
    active: boolean(input.active ?? true),
  };

  if (["menus", "categories", "items"].includes(kind)) {
    result.description = text(input.description ?? "", "Description", 1000);
  }

  if (kind === "menus") {
    result.hours = text(input.hours ?? "", "Opening hours", 120);
  }

  if (kind === "categories") {
    if (!data.menus.some((menu) => menu.id === input.menuId)) {
      fail(400, "Choose an existing menu.");
    }

    result.menuId = input.menuId;
  }

  if (["categories", "items"].includes(kind)) {
    result.sortOrder = number(input.sortOrder ?? 0, "Display order", 100000);
  }

  if (kind === "items") {
    if (!data.categories.some((category) => category.id === input.categoryId)) {
      fail(400, "Choose an existing category.");
    }

    result.categoryId = input.categoryId;
    result.price = Math.round(number(input.price, "Price", 1000000) * 100) / 100;
    result.vegetarian = boolean(input.vegetarian ?? false);
    result.allergens = text(input.allergens ?? "", "Allergens", 300);
    result.imageUrl = httpUrl(input.imageUrl ?? "", "Image URL");
  }

  if (kind === "tables") {
    result.location = text(input.location ?? "", "Location", 200);
    result.menuIds = ids(input.menuIds ?? [], data.menus, "menus");
  }

  if (kind === "qrs") {
    if (!["table", "menus"].includes(input.targetType)) {
      fail(400, "Choose a QR destination type.");
    }

    result.targetType = input.targetType;

    if (input.targetType === "table") {
      if (!data.tables.some((table) => table.id === input.tableId)) {
        fail(400, "Choose an existing table.");
      }

      result.tableId = input.tableId;
      result.menuIds = [];
    } else {
      result.tableId = "";
      result.menuIds = ids(input.menuIds ?? [], data.menus, "menus");

      if (!result.menuIds.length) {
        fail(400, "Choose at least one menu for this QR.");
      }
    }
  }

  return result;
}

function publicRestaurant(data) {
  const { publicBaseUrl, ...restaurant } = data.restaurant;
  return restaurant;
}

function publicQr(data, qrId) {
  const qr = data.qrs.find((item) => item.id === qrId);

  if (!qr) {
    fail(
      404,
      "This QR code does not exist or has been deleted. Please ask a member of staff."
    );
  }

  const table =
    qr.targetType === "table"
      ? data.tables.find((item) => item.id === qr.tableId)
      : null;

  if (!qr.active || (qr.targetType === "table" && !table?.active)) {
    fail(
      410,
      "This QR code is temporarily unavailable. Please ask a member of staff."
    );
  }

  const menuIds = table ? table.menuIds : qr.menuIds;

  const menus = menuIds
    .map((id) => data.menus.find((menu) => menu.id === id && menu.active))
    .filter(Boolean);

  if (!menus.length) {
    fail(
      410,
      "There are no active menus at this location right now. Please ask a member of staff."
    );
  }

  return {
    restaurant: publicRestaurant(data),
    qr: { id: qr.id, name: qr.name },
    table: table ? { name: table.name, location: table.location } : null,
    menus: menus.map((menu) => ({
      ...menu,
      categories: data.categories
        .filter((category) => category.menuId === menu.id && category.active)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          ...category,
          items: data.items
            .filter((item) => item.categoryId === category.id && item.active)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        })),
    })),
  };
}

async function readBody(req) {
  if (!req.headers["content-type"]?.startsWith("application/json")) {
    fail(415, "Send JSON with Content-Type: application/json.");
  }

  let length = 0;
  const chunks = [];

  for await (const chunk of req) {
    length += chunk.length;

    if (length > 32000) {
      fail(413, "Request is too large.");
    }

    chunks.push(chunk);
  }

  try {
    const body = JSON.parse(Buffer.concat(chunks).toString());

    if (!body || Array.isArray(body) || typeof body !== "object") {
      fail(400, "A JSON object is required.");
    }

    return body;
  } catch (error) {
    if (error.status) throw error;
    fail(400, "Invalid JSON.");
  }
}

const newQr = (fields) => ({
  id: `QR-${randomBytes(6).toString("hex").toUpperCase()}`,
  active: true,
  createdAt: new Date().toISOString(),
  ...fields,
});

export function createApi(store) {
  const sessions = new Map();
  const attempts = new Map();

  function session(req) {
    const token = req.headers.cookie
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("restaurant_session="))
      ?.slice("restaurant_session=".length);

    const entry = sessions.get(token);

    if (!entry || entry.expires < Date.now()) {
      if (token) sessions.delete(token);
      return null;
    }

    return { ...entry, token };
  }

  function send(res, status, data) {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });

    res.end(JSON.stringify(data));
  }

  return async (req, res) => {
    try {
      const origin = req.headers.origin;

      if (origin && origin !== FRONTEND_ORIGIN) {
        return send(res, 403, { error: "Request origin is not allowed." });
      }

      if (origin === FRONTEND_ORIGIN) {
        res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
      }

      if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, X-CSRF-Token"
        );
        res.setHeader("Vary", "Origin");
        res.writeHead(204);
        res.end();
        return;
      }

      const path = new URL(req.url, "http://localhost").pathname;
      const method = req.method;
      const data = await store.get();

      if (path === "/api/health" && method === "GET") {
        return send(res, 200, { ok: true, database: "connected" });
      }

      if (path === "/api/auth/login" && method === "POST") {
        const now = Date.now();

        for (const [key, value] of attempts) {
          if (value.until < now) attempts.delete(key);
        }

        for (const [key, value] of sessions) {
          if (value.expires < now) sessions.delete(key);
        }

        const ip = req.socket.remoteAddress;
        const attempt = attempts.get(ip) || {
          count: 0,
          until: now + 15 * 60 * 1000,
        };

        if (attempt.count >= 10) {
          fail(429, "Too many login attempts. Try again in 15 minutes.");
        }

        const body = await readBody(req);
        const email = text(body.email, "Email", 254, true).toLowerCase();
        const password = text(body.password, "Password", 200, true);

        const valid = timingSafeEqual(
          Buffer.from(passwordHash(password, data.admin.salt), "hex"),
          Buffer.from(data.admin.hash, "hex")
        );

        if (!valid || email !== data.admin.email) {
          attempt.count++;
          attempts.set(ip, attempt);
          fail(401, "Email or password is incorrect.");
        }

        attempts.delete(ip);

        const token = randomBytes(32).toString("hex");
        const csrfToken = randomBytes(24).toString("hex");

        sessions.set(token, {
          csrfToken,
          expires: now + SESSION_MS,
        });

        res.setHeader(
          "Set-Cookie",
          `restaurant_session=${token}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=${
            SESSION_MS / 1000
          }`
        );

        return send(res, 200, {
          email: data.admin.email,
          csrfToken,
        });
      }

      if (path === "/api/public/catalog" && method === "GET") {
        const menus = data.menus
          .filter((menu) => menu.active)
          .map((menu) => {
            const qr = data.qrs.find(
              (item) =>
                item.targetType === "menus" &&
                item.menuIds.includes(menu.id) &&
                item.active
            );

            return qr ? { ...menu, qrId: qr.id } : null;
          })
          .filter(Boolean);

        return send(res, 200, {
          restaurant: publicRestaurant(data),
          menus,
        });
      }

      const guest = path.match(/^\/api\/public\/qr\/([^/]+)$/);

      if (guest && method === "GET") {
        return send(res, 200, publicQr(data, decodeURIComponent(guest[1])));
      }

      const auth = session(req);

      if (!auth) {
        fail(401, "Please sign in to manage your restaurant.");
      }

      if (method !== "GET" && req.headers["x-csrf-token"] !== auth.csrfToken) {
        fail(403, "Your session could not be verified. Sign in again.");
      }

      if (path === "/api/auth/session" && method === "GET") {
        return send(res, 200, {
          email: data.admin.email,
          csrfToken: auth.csrfToken,
        });
      }

      if (path === "/api/auth/logout" && method === "POST") {
        sessions.delete(auth.token);

        res.setHeader(
          "Set-Cookie",
          "restaurant_session=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0"
        );

        return send(res, 200, { ok: true });
      }

      if (path === "/api/admin/data" && method === "GET") {
        const { admin, _id, ...safe } = data;
        return send(res, 200, safe);
      }

      if (path === "/api/admin/restaurant" && method === "PATCH") {
        const body = await readBody(req);

        const restaurant = await store.update((next) => {
          const input = { ...next.restaurant, ...body };

          const record = {
            name: text(input.name, "Restaurant name", 120, true),
            tagline: text(input.tagline, "Tagline", 200),
            announcement: text(input.announcement, "Guest message", 1000),
            address: text(input.address, "Address", 300),
            phone: text(input.phone, "Phone", 50),
            publicBaseUrl: httpUrl(
              input.publicBaseUrl,
              "Public website URL",
              true
            ),
            currency: text(input.currency, "Currency", 3, true).toUpperCase(),
          };

          if (!["SAR", "INR", "USD", "AED", "EUR", "GBP"].includes(record.currency)) {
            fail(400, "Choose a supported currency.");
          }

          next.restaurant = record;
          return record;
        });

        return send(res, 200, restaurant);
      }

      const match = path.match(
        /^\/api\/admin\/(menus|categories|items|tables|qrs)(?:\/([^/]+))?$/
      );

      if (match) {
        const [, kind, id] = match;

        if ((method === "POST" && !id) || (method === "PATCH" && id)) {
          const body = await readBody(req);

          const result = await store.update((next) => {
            const current = next[kind].find((row) => row.id === id);

            if (id && !current) {
              fail(404, "This record no longer exists. Refresh and try again.");
            }

            const fields = validate(kind, body, next, current);

            const record = current
              ? { ...current, ...fields }
              : {
                  ...fields,
                  id: kind === "qrs" ? newQr({}).id : randomUUID(),
                  createdAt: new Date().toISOString(),
                };

            if (id) {
              next[kind] = next[kind].map((row) =>
                row.id === id ? record : row
              );
            } else {
              next[kind].push(record);

              if (kind === "menus") {
                next.qrs.push(
                  newQr({
                    name: `${record.name} QR`,
                    targetType: "menus",
                    menuIds: [record.id],
                    tableId: "",
                  })
                );
              }

              if (kind === "tables") {
                next.qrs.push(
                  newQr({
                    name: `${record.name} QR`,
                    targetType: "table",
                    tableId: record.id,
                    menuIds: [],
                  })
                );
              }
            }

            if (kind === "menus" && Object.hasOwn(body, "tableIds")) {
              const selected = ids(body.tableIds, next.tables, "tables");

              for (const table of next.tables) {
                table.menuIds = selected.includes(table.id)
                  ? [...new Set([...table.menuIds, record.id])]
                  : table.menuIds.filter((menuId) => menuId !== record.id);
              }
            }

            return record;
          });

          return send(res, id ? 200 : 201, result);
        }

        if (method === "DELETE" && id) {
          await store.update((next) => {
            if (!next[kind].some((row) => row.id === id)) {
              fail(404, "This record no longer exists.");
            }

            if (kind === "menus") {
              const removed = new Set(
                next.categories
                  .filter((category) => category.menuId === id)
                  .map((category) => category.id)
              );

              next.items = next.items.filter(
                (item) => !removed.has(item.categoryId)
              );

              next.categories = next.categories.filter(
                (category) => category.menuId !== id
              );

              for (const table of next.tables) {
                table.menuIds = table.menuIds.filter((menuId) => menuId !== id);
              }

              for (const qr of next.qrs) {
                qr.menuIds = qr.menuIds.filter((menuId) => menuId !== id);
              }
            }

            if (kind === "categories") {
              next.items = next.items.filter((item) => item.categoryId !== id);
            }

            if (kind === "tables") {
              next.qrs = next.qrs.filter(
                (qr) => qr.targetType !== "table" || qr.tableId !== id
              );
            }

            next[kind] = next[kind].filter((row) => row.id !== id);
          });

          return send(res, 200, { ok: true });
        }

        fail(405, "Method not allowed.");
      }

      fail(404, "Endpoint not found.");
    } catch (error) {
      if (!error.status) {
        console.error("API failure:", error.name);
      }

      if (!res.headersSent) {
        send(res, error.status || 503, {
          error: error.status
            ? error.message
            : "The database is temporarily unavailable. Your change was not confirmed; please try again.",
        });
      } else {
        res.end();
      }
    }
  };
}