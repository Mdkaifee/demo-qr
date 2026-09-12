import { randomBytes, scryptSync } from "node:crypto";
import { MongoClient } from "mongodb";

export const passwordHash = (password, salt) => scryptSync(password, salt, 64).toString("hex");

const COLLECTIONS = ["admins", "restaurant", "menus", "categories", "items", "tables", "qrs"];

function seedData() {
  const salt = randomBytes(16).toString("hex");
  const menus = [
    { id: "breakfast", name: "Breakfast Menu", description: "Slow mornings, freshly baked bread, and your favorite first bites.", hours: "6:30 AM - 10:30 AM", active: true },
    { id: "lunch", name: "Lunch Menu", description: "From the grill to your table. Discover our signature afternoon dishes.", hours: "12:30 PM - 4:00 PM", active: true },
    { id: "room-service", name: "Room Service", description: "A little comfort, delivered. Fresh favorites any time of day.", hours: "Available 24 hours", active: true }
  ];
  const categories = [
    { id: "morning", menuId: "breakfast", name: "Morning favorites", description: "A delicious start to your day", sortOrder: 0, active: true },
    { id: "breakfast-drinks", menuId: "breakfast", name: "Coffee & juice", description: "Freshly poured", sortOrder: 1, active: true },
    { id: "mains", menuId: "lunch", name: "Signature mains", description: "Made with care, served with love", sortOrder: 0, active: true },
    { id: "sides", menuId: "lunch", name: "Soups & salads", description: "Something fresh on the side", sortOrder: 1, active: true },
    { id: "comfort", menuId: "room-service", name: "Comfort food", description: "Your all-day favorites", sortOrder: 0, active: true },
    { id: "desserts", menuId: "room-service", name: "Sweet & refreshing", description: "Save a little room", sortOrder: 1, active: true }
  ];
  const dishes = [
    ["morning", "Arabic Breakfast Platter", 42, "Creamy hummus, labneh, olives, warm pita, and seasonal vegetables.", true],
    ["morning", "Omelette Station", 28, "Three eggs with your choice of cheese, herbs, and vegetables.", true],
    ["morning", "Date Pancakes", 24, "Fluffy pancakes, date syrup, and a sprinkle of toasted nuts.", true],
    ["breakfast-drinks", "Fresh Juice Flight", 18, "A refreshing trio of freshly squeezed seasonal juices.", true],
    ["mains", "Chicken Kabsa", 48, "Aromatic basmati rice, tender chicken, and our signature spices.", false],
    ["mains", "Mixed Grill", 64, "A selection of grilled meats, warm bread, and house sauces.", false],
    ["sides", "Lentil Soup", 20, "Slow-cooked lentils, warming spices, and a squeeze of lemon.", true],
    ["sides", "Fattoush Salad", 22, "Crisp greens, toasted pita, sumac, and pomegranate dressing.", true],
    ["comfort", "Club Sandwich", 38, "Grilled chicken, fresh lettuce, tomato, and golden fries.", false],
    ["comfort", "Margherita Pizza", 44, "Tomato, fresh mozzarella, and basil on a hand-stretched base.", true],
    ["desserts", "Chocolate Fondant", 26, "Warm chocolate cake with a molten center and vanilla ice cream.", true],
    ["desserts", "Mint Lemonade", 16, "Fresh lemon, garden mint, and a little sweetness.", true]
  ];
  const tables = [
    { id: "table-12", name: "Table 12", location: "Main dining room", menuIds: ["breakfast", "lunch"], active: true },
    { id: "table-1", name: "Table 1", location: "Terrace", menuIds: ["breakfast", "lunch"], active: true },
    { id: "room-101", name: "Room 101", location: "First floor", menuIds: ["room-service"], active: true }
  ];

  return {
    admins: [{ id: "seed-admin", email: (process.env.ADMIN_EMAIL || "admin@restaurant.local").toLowerCase(), salt, hash: passwordHash(process.env.ADMIN_PASSWORD || "Admin@12345", salt), role: "owner", active: true, createdAt: new Date().toISOString() }],
    restaurant: [{ id: "settings", name: "Millenium Aqeeq", tagline: "Good food. A warm welcome.", currency: "SAR", announcement: "Welcome! Browse our menu and place your order with your waiter.", address: "Madinah, Saudi Arabia", phone: "", publicBaseUrl: "" }],
    menus,
    categories,
    items: dishes.map(([categoryId, name, price, description, vegetarian], index) => ({ id: `dish-${index + 1}`, categoryId, name, price, description, vegetarian, allergens: "", imageUrl: "", sortOrder: index, active: true })),
    tables,
    qrs: [
      { id: "MAH-TABLE-12", name: "Table 12 QR", targetType: "table", tableId: "table-12", menuIds: [], active: true },
      { id: "MAH-TABLE-1", name: "Table 1 QR", targetType: "table", tableId: "table-1", menuIds: [], active: true },
      { id: "MAH-ROOM-101", name: "Room 101 QR", targetType: "table", tableId: "room-101", menuIds: [], active: true },
      ...menus.map(menu => ({ id: `MENU-${menu.id.toUpperCase()}`, name: `${menu.name} QR`, targetType: "menus", tableId: "", menuIds: [menu.id], active: true }))
    ]
  };
}

function clean(record) {
  if (!record) return record;
  const { _id, ...rest } = record;
  return rest;
}

function normalizeSeed(source) {
  return {
    admins: source.admin ? [{ id: "seed-admin", ...source.admin, role: "owner", active: true }] : source.admins || [],
    restaurant: Array.isArray(source.restaurant) ? source.restaurant : [{ id: "settings", ...source.restaurant }],
    menus: source.menus || [],
    categories: source.categories || [],
    items: source.items || [],
    tables: source.tables || [],
    qrs: source.qrs || []
  };
}

async function ensureIndexes(db) {
  await Promise.all(COLLECTIONS.map(name => db.collection(name).createIndex({ id: 1 }, { unique: true })));
  await db.collection("admins").createIndex({ email: 1 }, { unique: true });
  await db.collection("categories").createIndex({ menuId: 1 });
  await db.collection("items").createIndex({ categoryId: 1 });
  await db.collection("qrs").createIndex({ targetType: 1, tableId: 1 });
}

async function insertRows(db, rowsByCollection) {
  for (const name of COLLECTIONS) {
    const rows = (rowsByCollection[name] || []).map(row => ({ ...clean(row), updatedAt: new Date().toISOString() }));
    if (!rows.length) continue;
    await db.collection(name).insertMany(rows, { ordered: false }).catch(error => {
      if (error.code !== 11000 && error.code !== 11001) throw error;
    });
  }
}

async function seedOrMigrate(db) {
  if (await db.collection("menus").findOne({})) return;
  const oldCatalog = await db.collection("catalog").findOne({ _id: "restaurant" });
  await insertRows(db, normalizeSeed(oldCatalog || seedData()));
}

async function snapshot(db) {
  const [admin, restaurant, menus, categories, items, tables, qrs] = await Promise.all([
    db.collection("admins").findOne({ active: { $ne: false } }, { projection: { _id: 0 } }),
    db.collection("restaurant").findOne({ id: "settings" }, { projection: { _id: 0 } }),
    db.collection("menus").find({}, { projection: { _id: 0 } }).toArray(),
    db.collection("categories").find({}, { projection: { _id: 0 } }).toArray(),
    db.collection("items").find({}, { projection: { _id: 0 } }).toArray(),
    db.collection("tables").find({}, { projection: { _id: 0 } }).toArray(),
    db.collection("qrs").find({}, { projection: { _id: 0 } }).toArray()
  ]);
  return { admin, restaurant, menus, categories, items, tables, qrs };
}

function diffCollection(name, beforeRows, afterRows) {
  const operations = [];
  const before = new Map(beforeRows.map(row => [row.id, row]));
  const after = new Map(afterRows.map(row => [row.id, row]));
  for (const id of before.keys()) if (!after.has(id)) operations.push(db => db.collection(name).deleteOne({ id }));
  for (const [id, row] of after) {
    operations.push(db => db.collection(name).replaceOne({ id }, { ...row, updatedAt: new Date().toISOString() }, { upsert: true }));
  }
  return operations;
}

function diff(current, next) {
  const operations = [];
  for (const name of ["menus", "categories", "items", "tables", "qrs"]) {
    operations.push(...diffCollection(name, current[name], next[name]));
  }
  operations.push(db => db.collection("restaurant").replaceOne({ id: "settings" }, { ...next.restaurant, id: "settings", updatedAt: new Date().toISOString() }, { upsert: true }));
  return operations;
}

export async function createStore({ uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017", dbName = process.env.MONGODB_DB || "restaurant_dynamic_qr" } = {}) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try { await client.connect(); } catch (error) { await client.close(); throw error; }
  const db = client.db(dbName);
  await ensureIndexes(db);
  await seedOrMigrate(db);

  return {
    client,
    get: () => snapshot(db),
    async update(change) {
      const current = await snapshot(db);
      const next = structuredClone(current);
      const result = change(next);
      await Promise.all(diff(current, next).map(operation => operation(db)));
      return result;
    },
    close: () => client.close()
  };
}
