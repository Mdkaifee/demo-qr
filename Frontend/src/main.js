import QRCode from "qrcode";
import "./styles.css";

const app = document.querySelector("#app");
const params = new URLSearchParams(location.search);
const isAdmin = params.get("demo") === "admin";
const scanId = params.get("scan");
const tabs = { menus: "Menus", categories: "Categories", items: "Menu Items", tables: "Tables", qrs: "QR Codes", restaurant: "Restaurant" };
const singular = { menus: "menu", categories: "category", items: "item", tables: "table", qrs: "QR code" };
let data, auth, tab = "menus", filter = "", query = "", guestData, guestMenu = "", guestCategory = "", guestQuery = "", guestSignature = "";
let dialogReturnFocus;
const icons = {
  logo: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3v3h-6z"/>',
  menus: '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2M7 8h3M7 12h3M16 8h2M16 12h2"/>',
  categories: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  items: '<path d="M5 3v7m3-7v7m-6-7v7c0 3 6 3 6 0M5 13v8M17 3v18m0-18c-5 3-5 10 0 10"/>',
  tables: '<path d="M3 8h18v5H3zM5 13v8M19 13v8M6 3v5M18 3v5M8 18h8"/>',
  qrs: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3v3h-6v-3M12 3v6M3 12h6M12 15v6"/>',
  restaurant: '<path d="M4 10v11h16V10M3 10l2-7h14l2 7M3 10c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0M9 21v-6h6v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  leaf: '<path d="M20 3C7 3 2 8 5 15c6 9 16 1 15-12ZM5 20 15 10"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-4-4L5 15z"/>',
  dot: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
  toggle: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>'
};
const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.menus}</svg>`;
const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const money = value => new Intl.NumberFormat("en", { style: "currency", currency: data?.restaurant.currency || guestData?.restaurant.currency || "SAR" }).format(value);
const badge = active => `<span class="badge ${active ? "active" : "inactive"}"><i></i>${active ? "Active" : "Inactive"}</span>`;
const nameOf = (kind, id) => data[kind].find(row => row.id === id)?.name || "Unassigned";
const qrUrl = id => `${data?.restaurant.publicBaseUrl || location.origin}/?scan=${encodeURIComponent(id)}`;

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function api(path, method = "GET", body) {
  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { "X-CSRF-Token": auth.csrfToken } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({ error: "The server returned an unexpected response." }));
  if (!response.ok) {
    if (response.status === 401 && isAdmin && !path.startsWith("/auth/")) { auth = null; closeDialog(); renderLogin(); }
    throw Object.assign(new Error(result.error || "Request failed."), { status: response.status });
  }
  return result;
}

function toast(message, error = false) {
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = `toast ${error ? "error" : ""}`;
  node.setAttribute("role", error ? "alert" : "status");
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 4500);
}
function brand(name = "Millenium Aqeeq") {
  return `<a class="brand" href="/"><span class="brand-mark">${icon("logo")}</span><span><strong>${esc(name)}</strong><small>RESTAURANT ${isAdmin ? "MANAGER" : "& DINING"}</small></span></a>`;
}
function header(name, admin = false) {
  return `<header class="site-header"><div class="header-inner">${brand(name)}<div class="header-right">${admin ? '<span class="workspace-label">Restaurant workspace</span><span class="avatar">A</span><button class="text-button" data-action="logout">Sign out</button>' : '<a class="button small" href="/?demo=admin">Admin login ' + icon("arrow") + '</a>'}</div></div></header>`;
}
function footer() { return `<footer class="footer"><span>Made for memorable dining.</span><span>One QR. Always your latest menu.</span></footer>`; }

function renderLogin(error = "") {
  app.innerHTML = `${header("Millenium Aqeeq")}<main class="login-shell"><section class="login-story"><span class="eyebrow light">YOUR RESTAURANT, CONNECTED</span><h1>A fresh menu.<br>A familiar QR.</h1><p>Everything you serve, beautifully organized.<br>Manage your menus and let every table see what's new.</p><div class="login-illustration">${icon("qrs")}<span class="float-tag">${icon("check")} Always up to date</span></div><span class="story-foot">MENUS &nbsp; / &nbsp; TABLES &nbsp; / &nbsp; DYNAMIC QR</span></section><section class="login-form-panel"><span class="eyebrow">WELCOME BACK</span><h2>Sign in to your restaurant</h2><p class="muted">Your menus, tables, and QR codes, all in one place.</p><form id="login-form" class="form"><label>Email address<input name="email" type="email" autocomplete="username" value="admin@restaurant.local" required maxlength="254"></label><label>Password<input name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required maxlength="200"></label><p class="form-error" role="alert">${esc(error)}</p><button class="button primary full" type="submit">Sign in ${icon("arrow")}</button></form><p class="login-note">Your restaurant data is saved securely in MongoDB.</p></section></main>${footer()}`;
  document.querySelector("#login-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    button.disabled = true; button.textContent = "Signing in...";
    try { auth = await api("/auth/login", "POST", Object.fromEntries(new FormData(form))); await refresh(); }
    catch (error) { form.querySelector(".form-error").textContent = error.message; }
    finally { button.disabled = false; button.innerHTML = `Sign in ${icon("arrow")}`; }
  });
}

async function refresh() { data = await api("/admin/data"); renderAdmin(); }
function renderAdmin() {
  const counts = [["menus", "Total menus"], ["items", "Menu items"], ["tables", "Tables & rooms"], ["qrs", "Active QR codes"]];
  app.innerHTML = `${header(data.restaurant.name, true)}<main class="workspace"><div class="page-intro"><div><span class="eyebrow">YOUR RESTAURANT AT A GLANCE</span><h1>Menu management<span class="title-dot">.</span></h1><p class="muted">Fresh ideas on the menu. The same QR on every table.</p></div><span class="live-label"><i></i> Changes are live</span></div><section class="stats" aria-label="Restaurant overview">${counts.map(([key, label]) => `<div class="stat"><span class="stat-icon">${icon(key)}</span><div><span>${label}</span><strong>${key === "qrs" ? data.qrs.filter(q => q.active).length : data[key].length}</strong></div></div>`).join("")}</section><nav class="tabs" aria-label="Restaurant sections">${Object.entries(tabs).map(([key, label]) => `<button type="button" data-tab="${key}" class="tab ${tab === key ? "selected" : ""}" aria-current="${tab === key ? "page" : "false"}">${icon(key)}${label}${key !== "restaurant" ? `<span>${data[key].length}</span>` : ""}</button>`).join("")}</nav><section class="section-content" id="section-content">${tab === "restaurant" ? settingsContent() : collectionContent()}</section><div class="workspace-note">${icon("qrs")} Menu updates appear automatically. Your printed QR codes stay the same.</div></main>${footer()}`;
  if (tab === "restaurant") bindSettings();
  bindFilters();
}
function collectionContent() {
  const descriptions = { menus: "Create your menus and choose the tables that serve them.", categories: "Give every dish its place. Organize categories within your menus.", items: "The dishes, drinks, and little extras your guests will love.", tables: "Choose multiple menus for each table. Every table gets its own QR.", qrs: "Permanent links to your menus. View, download, or change their destination." };
  return `<div class="section-heading"><div><h2>${tabs[tab]}</h2><p class="muted">${descriptions[tab]}</p></div><button class="button primary" data-action="add">${icon("plus")} Add ${singular[tab]}</button></div><div class="filter-bar"><label class="search-field">${icon("search")}<input id="search" aria-label="Search ${tabs[tab]}" placeholder="Search ${tabs[tab].toLowerCase()}..." value="${esc(query)}"></label>${["categories", "items"].includes(tab) ? `<select id="menu-filter" aria-label="Filter by menu"><option value="">All menus</option>${data.menus.map(m => `<option value="${m.id}" ${filter === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select>` : '<span class="filter-hint">Manage what your guests see</span>'}</div><div id="cards" class="card-grid">${cardsContent()}</div>`;
}
function cardsContent() {
  const rows = data[tab].filter(row => {
    const menuId = tab === "items" ? data.categories.find(c => c.id === row.categoryId)?.menuId : row.menuId;
    return row.name.toLowerCase().includes(query.toLowerCase()) && (!filter || menuId === filter);
  });
  if (!rows.length) return `<div class="empty-state">${icon(tab)}<h3>${query || filter ? "No matches found" : `Your next ${singular[tab]} starts here`}</h3><p>${query || filter ? "Try another search or menu filter." : `Use Add ${singular[tab]} to get started.`}</p></div>`;
  return rows.map(row => {
    let detail = "", meta = "", top = icon(tab), view = "";
    if (tab === "menus") {
      const categories = data.categories.filter(c => c.menuId === row.id);
      const itemCount = data.items.filter(i => categories.some(c => c.id === i.categoryId)).length;
      const tables = data.tables.filter(t => t.menuIds.includes(row.id));
      detail = `<p class="card-description">${esc(row.description || "Your next delicious chapter.")}</p><span class="hours">${icon("clock")}${esc(row.hours || "All day")}</span>`;
      meta = `<div class="card-counts"><span><strong>${categories.length}</strong> categories</span><span><strong>${itemCount}</strong> items</span></div><div class="assignment">${icon("tables")} ${tables.length ? esc(tables.slice(0, 2).map(t => t.name).join(", ")) + (tables.length > 2 ? ` +${tables.length - 2}` : "") : "No tables assigned"}</div>`;
      view = `<button class="button small" data-action="view" data-id="${row.id}">${icon("qrs")} View QR</button>`;
    } else if (tab === "categories") {
      detail = `<span class="context-label">${esc(nameOf("menus", row.menuId))}</span><p class="card-description">${esc(row.description || "A collection of your restaurant favorites.")}</p>`;
      meta = `<div class="card-counts"><span><strong>${data.items.filter(i => i.categoryId === row.id).length}</strong> items</span><span>Order ${row.sortOrder}</span></div>`;
      view = `<button class="button small" data-action="browse" data-id="${row.menuId}">Manage items ${icon("arrow")}</button>`;
    } else if (tab === "items") {
      const category = data.categories.find(c => c.id === row.categoryId);
      if (row.imageUrl) top = `<img src="${esc(row.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`;
      detail = `<span class="context-label">${esc(nameOf("menus", category?.menuId))} / ${esc(category?.name)}</span><p class="card-description">${esc(row.description || "Freshly prepared for you.")}</p>`;
      meta = `<div class="price-line"><strong>${money(row.price)}</strong>${row.vegetarian ? `<span class="vegetarian">${icon("leaf")} Vegetarian</span>` : ""}</div>${row.allergens ? `<p class="allergens">Allergens: ${esc(row.allergens)}</p>` : ""}`;
      view = `<button class="button small" data-action="edit" data-id="${row.id}">${icon("edit")} Edit item</button>`;
    } else if (tab === "tables") {
      detail = `<span class="context-label">${esc(row.location || "Restaurant floor")}</span><p class="card-description">${row.menuIds.length} ${row.menuIds.length === 1 ? "menu" : "menus"} assigned to this table</p>`;
      meta = `<div class="chips">${row.menuIds.length ? row.menuIds.map(id => `<span>${esc(nameOf("menus", id))}</span>`).join("") : '<span class="warning-chip">No menus assigned</span>'}</div>`;
      view = `<button class="button small" data-action="view" data-id="${row.id}">${icon("qrs")} View QR</button>`;
    } else {
      detail = `<span class="context-label">${row.targetType === "table" ? "TABLE QR" : "MENU QR"}</span><p class="card-description">${row.targetType === "table" ? esc(nameOf("tables", row.tableId)) : row.menuIds.map(id => esc(nameOf("menus", id))).join(", ") || "No menus assigned"}</p>`;
      meta = `<div class="qr-id">${esc(row.id)}</div><span class="hours">Permanent link - Editable destination</span>`;
      view = `<button class="button small" data-action="view" data-id="${row.id}">${icon("qrs")} View QR</button>`;
    }
    return `<article class="record-card ${row.active ? "" : "is-inactive"}" data-record="${row.id}"><div class="card-top"><span class="card-icon ${tab === "items" && row.imageUrl ? "with-image" : ""}">${top}</span>${badge(row.active)}</div><h3>${esc(row.name)}</h3>${detail}<div class="card-meta">${meta}</div><div class="card-actions">${view}<details class="actions-menu"><summary class="button small" aria-label="Actions for ${esc(row.name)}">Actions ${icon("dot")}</summary><div class="actions-popover"><button type="button" data-action="edit" data-id="${row.id}">${icon("edit")} Edit ${singular[tab]}</button><button type="button" data-action="toggle" data-id="${row.id}">${icon("toggle")} ${row.active ? "Deactivate" : "Activate"}</button><button type="button" class="danger-text" data-action="delete" data-id="${row.id}">${icon("trash")} Delete ${singular[tab]}</button></div></details></div></article>`;
  }).join("");
}
function bindFilters() {
  document.querySelector("#search")?.addEventListener("input", event => { query = event.target.value; document.querySelector("#cards").innerHTML = cardsContent(); });
  document.querySelector("#menu-filter")?.addEventListener("change", event => { filter = event.target.value; document.querySelector("#cards").innerHTML = cardsContent(); });
}

function input(name, label, value = "", type = "text", extra = "") {
  return `<label class="field-label">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
}
function textarea(name, label, value = "", max = 1000) {
  return `<label class="field-label">${label}<textarea name="${name}" rows="3" maxlength="${max}">${esc(value)}</textarea></label>`;
}
function select(name, label, rows, value, optional = false) {
  return `<label class="field-label">${label}<select name="${name}" ${optional ? "" : "required"}><option value="">Select ${label.toLowerCase()}</option>${rows.map(row => `<option value="${esc(row.id)}" ${row.id === value ? "selected" : ""}>${esc(row.name)}</option>`).join("")}</select></label>`;
}
function multi(name, label, rows, values = []) {
  return `<div class="multi-field"><span class="field-label">${label}</span><details class="multi-select"><summary aria-label="${label}"><span class="selection-count">${values.length ? `<strong>${values.length}</strong> selected` : `Select ${label.toLowerCase()}`}</span><span class="multi-chevron">${icon("arrow")}</span></summary><div class="multi-options">${rows.length ? rows.map(row => `<label class="multi-option ${values.includes(row.id) ? "is-checked" : ""}"><input type="checkbox" name="${name}" value="${row.id}" ${values.includes(row.id) ? "checked" : ""}><span>${esc(row.name)}${row.active ? "" : ' <small class="muted">(inactive)</small>'}</span></label>`).join("") : '<p class="muted empty-multi">Create one first to select it here.</p>'}</div></details><small class="field-hint">Select as many as you need.</small></div>`;
}
function toggleField(name, label, value, hint = "") {
  return `<label class="toggle-card"><div class="toggle-text"><span class="toggle-label">${label}</span>${hint ? `<small class="toggle-hint">${hint}</small>` : ""}</div><div class="toggle-switch"><input type="checkbox" name="${name}" ${value ? "checked" : ""}><span class="toggle-slider"></span></div></label>`;
}
function showDialog(title, body, subtitle = "", eyebrow = "RESTAURANT WORKSPACE") {
  closeDialog();
  dialogReturnFocus = document.activeElement;
  const dialog = document.createElement("dialog");
  dialog.id = "editor-dialog";
  dialog.className = "app-dialog";
  dialog.innerHTML = `<div class="dialog-card"><div class="dialog-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h2 id="dialog-title">${esc(title)}</h2>${subtitle ? `<p class="dialog-subtitle">${esc(subtitle)}</p>` : ""}</div><button class="icon-button dialog-close" data-action="close" aria-label="Close dialog">${icon("close")}</button></div><div class="dialog-body">${body}</div></div>`;
  dialog.setAttribute("aria-labelledby", "dialog-title");
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener("click", event => { if (event.target === dialog && !dialog.querySelector("button[type=submit]:disabled")) closeDialog(); });
  dialog.addEventListener("cancel", event => { event.preventDefault(); if (!dialog.querySelector("button[type=submit]:disabled")) closeDialog(); });
  dialog.querySelectorAll(".multi-options input").forEach(box => box.addEventListener("change", () => {
    const container = box.closest(".multi-select");
    const count = container.querySelectorAll("input:checked").length;
    container.querySelector(".selection-count").innerHTML = count ? `<strong>${count}</strong> selected` : `Select ${box.name}`;
    box.closest(".multi-option")?.classList.toggle("is-checked", box.checked);
  }));
  return dialog;
}
function closeDialog() { const dialog = document.querySelector("#editor-dialog"); if (dialog) { dialog.close(); dialog.remove(); dialogReturnFocus?.focus(); } }

function openEditor(kind, id, defaults = {}) {
  const row = data[kind].find(row => row.id === id) || { active: true, ...defaults };
  let fields = input("name", kind === "tables" ? "Table / room name" : "Name", row.name, "text", 'required maxlength="120" placeholder="e.g. ' + (kind === "tables" ? "Table 12" : kind === "menus" ? "Dinner Menu" : kind === "items" ? "Chicken Kabsa" : "Appetizers") + '"');
  if (["menus", "categories", "items"].includes(kind)) fields += textarea("description", "Description (optional)", row.description);
  if (kind === "menus") fields += input("hours", "Serving hours (optional)", row.hours, "text", 'maxlength="120" placeholder="e.g. 6:30 AM - 10:30 AM or All day"') + multi("tableIds", "Assigned Tables", data.tables, data.tables.filter(t => t.menuIds.includes(row.id)).map(t => t.id));
  if (kind === "categories") fields += select("menuId", "Parent Menu", data.menus, row.menuId || filter) + input("sortOrder", "Display order", row.sortOrder ?? 0, "number", 'min="0" max="100000" step="1" required');
  if (kind === "items") fields += `<div class="form-row">${select("categoryId", "Category", data.categories.map(c => ({ ...c, name: `${nameOf("menus", c.menuId)} / ${c.name}` })), row.categoryId)}${input("price", `Price (${data.restaurant.currency})`, row.price ?? "", "number", 'min="0" max="1000000" step="0.01" required placeholder="0.00"')}</div>${input("imageUrl", "Photo URL (optional)", row.imageUrl, "url", 'maxlength="2000" placeholder="https://images.unsplash.com/..."')}${input("allergens", "Allergens (optional)", row.allergens, "text", 'maxlength="300" placeholder="e.g. Milk, eggs, nuts, gluten"')}${input("sortOrder", "Display order", row.sortOrder ?? 0, "number", 'min="0" max="100000" step="1" required')}${toggleField("vegetarian", "Vegetarian dish", row.vegetarian, "Displays a green vegetarian badge on the digital menu")}`;
  if (kind === "tables") fields += input("location", "Location / Area (optional)", row.location, "text", 'maxlength="200" placeholder="e.g. Terrace, Main Dining Room, Rooftop"') + multi("menuIds", "Assigned Menus", data.menus, row.menuIds);
  if (kind === "qrs") fields += `${select("targetType", "Destination type", [{ id: "table", name: "Table (dynamically shows all menus assigned to the table)" }, { id: "menus", name: "Selected menus (direct menu link)" }], row.targetType || "table")}<div id="table-target">${select("tableId", "Target Table", data.tables, row.tableId, true)}</div><div id="menu-target">${multi("menuIds", "Target Menus", data.menus, row.menuIds)}</div>`;
  fields += toggleField("active", "Active status", row.active, "Available immediately for guests when scanned or browsed");
  const isAutoQr = ["menus", "tables"].includes(kind) && !id;
  const dialog = showDialog(
    `${id ? "Edit" : "Add"} ${singular[kind]}`,
    `<form id="record-form" class="form dialog-form">${fields}<p class="form-error" role="alert"></p><div class="dialog-actions"><button class="button" type="button" data-action="close">Cancel</button><button class="button primary" type="submit">${id ? icon("check") + " Save changes" : icon("plus") + ` Create ${singular[kind]}`}</button></div></form>`,
    isAutoQr ? "A dynamic QR code will be created automatically for this record." : "Changes publish automatically to the guest menu in real-time.",
    `${kind.toUpperCase()} MANAGEMENT`
  );
  if (kind === "qrs") {
    const target = dialog.querySelector('[name="targetType"]');
    const update = () => { dialog.querySelector("#table-target").hidden = target.value !== "table"; dialog.querySelector("#menu-target").hidden = target.value !== "menus"; };
    target.addEventListener("change", update); update();
  }
  dialog.querySelector("form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, formData = new FormData(form), payload = Object.fromEntries(formData);
    payload.active = formData.has("active");
    if (kind === "menus") payload.tableIds = formData.getAll("tableIds");
    if (["tables", "qrs"].includes(kind)) payload.menuIds = formData.getAll("menuIds");
    if (["categories", "items"].includes(kind)) payload.sortOrder = Number(payload.sortOrder);
    if (kind === "items") { payload.price = Number(payload.price); payload.vegetarian = formData.has("vegetarian"); }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try { await api(`/admin/${kind}${id ? `/${id}` : ""}`, id ? "PATCH" : "POST", payload); closeDialog(); await refresh(); toast(`${singular[kind]} ${id ? "updated" : "created"}.`); }
    catch (error) { form.querySelector(".form-error").textContent = error.message; }
    finally { button.disabled = false; }
  });
}

async function viewQr(id) {
  let qr = tab === "qrs" ? data.qrs.find(q => q.id === id) : tab === "tables" ? data.qrs.find(q => q.targetType === "table" && q.tableId === id) : data.qrs.find(q => q.targetType === "menus" && q.menuIds.includes(id));
  if (!qr) { openEditor("qrs", null, tab === "tables" ? { targetType: "table", tableId: id, name: `${nameOf("tables", id)} QR` } : { targetType: "menus", menuIds: [id], name: `${nameOf("menus", id)} QR` }); return; }
  const url = qrUrl(qr.id);
  const dialog = showDialog(
    qr.name,
    `<div class="qr-modal-body"><div class="qr-preview-wrapper"><div class="qr-paper"><span class="qr-paper-brand">${esc(data.restaurant.name)}</span><div class="qr-canvas-frame"><canvas id="qr-canvas" aria-label="QR code for ${esc(qr.name)}"></canvas></div><strong class="qr-paper-tag">Scan. Explore. Enjoy.</strong><span class="qr-paper-code">${esc(qr.id)}</span></div></div><div class="qr-modal-status">${badge(qr.active)}<span>The printed code stays the same when menus change.</span></div><div class="url-copy-box"><label class="field-label" for="qr-url">Permanent guest link</label><div class="url-input-group"><input id="qr-url" readonly value="${esc(url)}"><button class="button url-copy-btn" id="copy-qr" type="button">${icon("check")} Copy</button></div></div>${/^(localhost|127\.0\.0\.1)$/.test(new URL(url).hostname) ? '<div class="local-note-banner"><span>📱</span><span>Scanning with phone? Open this admin using your Wi-Fi address, then view this QR again.</span></div>' : ""}<div class="dialog-actions qr-buttons"><button class="button" id="download-qr" type="button">${icon("download")} Download PNG</button><a class="button primary" target="_blank" rel="noopener" href="${esc(url)}">Open guest view ${icon("arrow")}</a></div></div>`,
    "One permanent link. Your latest menus, every time.",
    "DYNAMIC QR CODE"
  );
  await QRCode.toCanvas(dialog.querySelector("canvas"), url, { width: 300, margin: 2, errorCorrectionLevel: "M", color: { dark: "#143e35", light: "#ffffff" } });
  dialog.querySelector("#copy-qr").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      const copyBtn = dialog.querySelector("#copy-qr");
      copyBtn.innerHTML = `${icon("check")} Copied!`;
      copyBtn.classList.add("copied");
      setTimeout(() => {
        if (copyBtn) {
          copyBtn.innerHTML = `${icon("check")} Copy`;
          copyBtn.classList.remove("copied");
        }
      }, 2000);
      toast("Guest link copied.");
    } catch {
      const field = dialog.querySelector("#qr-url");
      field.select();
      toast("Select and copy the link above.");
    }
  });
  dialog.querySelector("#download-qr").addEventListener("click", async () => {
    const a = document.createElement("a");
    a.href = await QRCode.toDataURL(url, { width: 1000, margin: 4, errorCorrectionLevel: "M" });
    a.download = `${qr.id}.png`;
    a.click();
  });
}
function deleteDialog(kind, id) {
  const row = data[kind].find(row => row.id === id);
  const consequence = {
    menus: "Its categories and items will also be deleted, and it will be removed from all tables and QR destinations.",
    categories: "All items in this category will also be deleted.",
    items: "This item will be removed from the guest menu.",
    tables: "Its QR codes will also be deleted. Menus will be kept.",
    qrs: "Anyone scanning this printed code will see an unavailable message."
  };
  const dialog = showDialog(
    `Delete ${singular[kind]}?`,
    `<div class="delete-modal-body"><div class="danger-callout"><span class="danger-callout-icon">${icon("trash")}</span><div><p class="delete-copy">Delete <strong>${esc(row.name)}</strong>?</p><p class="delete-consequence">${consequence[kind]}</p></div></div><p class="delete-warning-note">⚠️ This cannot be undone.</p><p class="form-error" role="alert"></p><div class="dialog-actions"><button class="button" type="button" data-action="close">Cancel</button><button class="button danger-btn" id="confirm-delete" type="button">${icon("trash")} Delete ${singular[kind]}</button></div></div>`,
    "Please confirm before removing this record.",
    "CONFIRM DELETION"
  );
  dialog.querySelector("#confirm-delete").addEventListener("click", async event => {
    event.target.disabled = true;
    try { await api(`/admin/${kind}/${id}`, "DELETE"); closeDialog(); await refresh(); toast(`${singular[kind]} deleted.`); }
    catch (error) { dialog.querySelector(".form-error").textContent = error.message; event.target.disabled = false; }
  });
}

function settingsContent() {
  const r = data.restaurant;
  return `<div class="section-heading"><div><h2>Your restaurant</h2><p class="muted">The details that make every guest feel welcome.</p></div></div><form id="settings-form" class="settings-card form"><div class="form-row">${input("name", "Restaurant name", r.name, "text", 'required maxlength="120"')}${input("tagline", "Tagline", r.tagline, "text", 'maxlength="200"')}</div>${textarea("announcement", "Guest welcome message", r.announcement)}<div class="form-row">${input("address", "Address", r.address, "text", 'maxlength="300"')}${input("phone", "Phone", r.phone, "tel", 'maxlength="50"')}</div>${select("currency", "Currency", ["SAR", "INR", "USD", "AED", "EUR", "GBP"].map(c => ({ id: c, name: c })), r.currency)}<div class="settings-divider"><h3>QR website address</h3><p class="muted">Leave blank to use the address you opened this admin with. For phone scans, use your computer's Wi-Fi address or your deployed website. Keep this address stable after printing your QR codes.</p></div>${input("publicBaseUrl", "Public website URL (optional)", r.publicBaseUrl, "url", 'maxlength="2000" placeholder="e.g. https://your-restaurant.onrender.com"')}<p class="form-error" role="alert"></p><div class="dialog-actions"><button class="button primary" type="submit">Save restaurant details</button></div></form>`;
}
function bindSettings() {
  document.querySelector("#settings-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, button = form.querySelector("button"); button.disabled = true;
    try { await api("/admin/restaurant", "PATCH", Object.fromEntries(new FormData(form))); await refresh(); toast("Restaurant details updated."); }
    catch (error) { form.querySelector(".form-error").textContent = error.message; }
    finally { button.disabled = false; }
  });
}

document.addEventListener("click", async event => {
  const tabButton = event.target.closest("[data-tab]");
  if (tabButton) { tab = tabButton.dataset.tab; query = ""; filter = ""; renderAdmin(); return; }
  const target = event.target.closest("[data-action]");
  if (!target || target.disabled) return;
  const { action, id } = target.dataset;
  try {
    if (action === "close") return closeDialog();
    if (action === "logout") { await api("/auth/logout", "POST"); auth = null; renderLogin(); }
    if (action === "add") openEditor(tab);
    if (action === "edit") openEditor(tab, id);
    if (action === "view") await viewQr(id);
    if (action === "delete") deleteDialog(tab, id);
    if (action === "browse") { tab = "items"; filter = id; query = ""; renderAdmin(); }
    if (action === "toggle") { target.disabled = true; const row = data[tab].find(row => row.id === id); await api(`/admin/${tab}/${id}`, "PATCH", { active: !row.active }); await refresh(); toast(`${row.name} ${row.active ? "deactivated" : "activated"}.`); }
  } catch (error) { toast(error.message, true); target.disabled = false; }
});
document.addEventListener("click", event => { document.querySelectorAll(".actions-menu[open]").forEach(details => { if (!details.contains(event.target)) details.open = false; }); });

async function renderHome() {
  const catalog = await api("/public/catalog");
  app.innerHTML = `${header(catalog.restaurant.name)}<main class="home-shell"><section class="home-hero"><span class="eyebrow">WELCOME TO ${esc(catalog.restaurant.name)}</span><h1>Good food.<br><em>Great company.</em></h1><p>${esc(catalog.restaurant.tagline)}</p><span class="home-location">${esc(catalog.restaurant.address)}</span></section><div class="section-heading"><div><h2>A menu for every moment</h2><p class="muted">Fresh from our kitchen, ready for your table.</p></div></div><div class="card-grid">${catalog.menus.map(menu => `<article class="record-card"><span class="card-icon">${icon("menus")}</span><h3>${esc(menu.name)}</h3><p class="card-description">${esc(menu.description)}</p><span class="hours">${icon("clock")}${esc(menu.hours)}</span><a class="button primary" href="/?scan=${encodeURIComponent(menu.qrId)}">Explore menu ${icon("arrow")}</a></article>`).join("") || '<div class="empty-state"><h3>Our menus are taking a short break.</h3><p>Please check with a member of staff.</p></div>'}</div></main>${footer()}`;
}
function renderGuest() {
  const r = guestData.restaurant;
  if (!guestData.menus.some(menu => menu.id === guestMenu)) guestMenu = guestData.menus[0].id;
  const menu = guestData.menus.find(m => m.id === guestMenu);
  if (!menu.categories.some(c => c.id === guestCategory)) guestCategory = "";
  const focused = document.activeElement?.id === "guest-search";
  const selection = focused ? document.activeElement.selectionStart : null;
  app.innerHTML = `<div class="guest-page">${header(r.name)}<main class="guest-shell"><div class="guest-location"><span>${icon("tables")}${esc(guestData.table?.name || "Welcome to our restaurant")}</span><span class="live-label"><i></i> Live menu</span></div><section class="guest-hero"><span class="eyebrow">FRESHLY PREPARED, JUST FOR YOU</span><h1>${esc(r.name)}</h1><p>${esc(r.tagline)}</p><span>${esc(r.address)}</span></section>${r.announcement ? `<div class="guest-notice">${icon("leaf")}<span>${esc(r.announcement)}</span></div>` : ""}<nav class="guest-menu-tabs" aria-label="Available menus">${guestData.menus.map(m => `<button data-guest-menu="${m.id}" class="${guestMenu === m.id ? "selected" : ""}" aria-pressed="${guestMenu === m.id}">${esc(m.name)}</button>`).join("")}</nav><div class="guest-menu-heading"><div><h2>${esc(menu.name)}</h2><p class="muted">${esc(menu.description)}</p></div><span class="hours">${icon("clock")}${esc(menu.hours || "All day")}</span></div><div class="guest-controls"><nav class="category-tabs" aria-label="Menu categories"><button data-guest-category="" class="${!guestCategory ? "selected" : ""}">All items</button>${menu.categories.map(c => `<button data-guest-category="${c.id}" class="${guestCategory === c.id ? "selected" : ""}">${esc(c.name)}</button>`).join("")}</nav><label class="search-field">${icon("search")}<input id="guest-search" placeholder="Find your favorite..." aria-label="Search dishes" value="${esc(guestQuery)}"></label></div><div id="guest-items">${guestItems(menu)}</div><p class="guest-footnote">Please let your waiter know about any allergies before ordering.<br>${esc(r.phone ? `Contact us: ${r.phone}` : "Ready to order? Your waiter is happy to help.")}</p></main>${footer()}</div>`;
  document.querySelectorAll("[data-guest-menu]").forEach(button => button.addEventListener("click", () => { guestMenu = button.dataset.guestMenu; guestCategory = ""; renderGuest(); }));
  document.querySelectorAll("[data-guest-category]").forEach(button => button.addEventListener("click", () => { guestCategory = button.dataset.guestCategory; renderGuest(); }));
  document.querySelector("#guest-search").addEventListener("input", event => { guestQuery = event.target.value; document.querySelector("#guest-items").innerHTML = guestItems(menu); });
  if (focused) { const input = document.querySelector("#guest-search"); input.focus({ preventScroll: true }); input.setSelectionRange(selection, selection); }
}
function guestItems(menu) {
  const categories = menu.categories.filter(c => !guestCategory || c.id === guestCategory).map(c => ({ ...c, items: c.items.filter(i => `${i.name} ${i.description}`.toLowerCase().includes(guestQuery.toLowerCase())) })).filter(c => c.items.length);
  if (!categories.length) return `<div class="empty-state">${icon("items")}<h3>${guestQuery ? "No dishes found" : "Something delicious is on its way"}</h3><p>${guestQuery ? "Try another search." : "Please check with your waiter for today's selections."}</p></div>`;
  return categories.map(category => `<section class="guest-category"><div class="category-title"><h3>${esc(category.name)} <span>${category.items.length}</span></h3><p>${esc(category.description)}</p></div><div class="dish-grid">${category.items.map(item => `<article class="dish-card"><div class="dish-copy">${item.vegetarian ? `<span class="vegetarian">${icon("leaf")} Vegetarian</span>` : '<span class="dish-label">FROM OUR KITCHEN</span>'}<h4>${esc(item.name)}</h4><p>${esc(item.description)}</p>${item.allergens ? `<small>Contains: ${esc(item.allergens)}</small>` : ""}<strong>${money(item.price)}</strong></div>${item.imageUrl ? `<img class="dish-photo" src="${esc(item.imageUrl)}" alt="${esc(item.name)}" loading="lazy" referrerpolicy="no-referrer">` : `<div class="dish-placeholder">${icon("items")}</div>`}</article>`).join("")}</div></section>`).join("");
}
function unavailable(message, temporary = false) {
  app.innerHTML = `${header("Restaurant menu")}<main class="unavailable"><span class="card-icon">${icon("qrs")}</span><span class="eyebrow">${temporary ? "CONNECTION INTERRUPTED" : "A LITTLE PAUSE"}</span><h1>${temporary ? "Reconnecting to the menu" : "Menu unavailable"}</h1><p>${esc(message)}</p><p class="muted">This page checks automatically for updates.</p><a class="button" href="/">Back to restaurant</a></main>${footer()}`;
}
async function pollGuest() {
  try {
    const result = await api(`/public/qr/${encodeURIComponent(scanId)}`);
    const signature = JSON.stringify(result);
    guestData = result;
    if (signature !== guestSignature) { guestSignature = signature; renderGuest(); }
  } catch (error) {
    const signature = `error:${error.message}`;
    if (signature !== guestSignature) { guestSignature = signature; unavailable(error.message, ![404, 410].includes(error.status)); }
  } finally { setTimeout(pollGuest, 3000); }
}
async function init() {
  app.innerHTML = '<main class="loading" role="status"><span class="loader"></span>Preparing your restaurant...</main>';
  try {
    if (scanId !== null) return await pollGuest();
    if (isAdmin) {
      try { auth = await api("/auth/session"); } catch (error) { if (error.status !== 401) throw error; }
      if (auth) await refresh(); else renderLogin();
    } else await renderHome();
  } catch (error) { app.innerHTML = `<main class="unavailable"><h1>We couldn't connect</h1><p>${esc(error.message)}</p><button class="button primary" id="retry">Try again</button></main>`; document.querySelector("#retry").addEventListener("click", init); }
}
init();
