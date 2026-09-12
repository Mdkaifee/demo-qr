import QRCode from "qrcode";
import "./styles.css";

const destinations = {
  breakfast: {
    label: "Breakfast Menu",
    badge: "6:30 AM - 10:30 AM",
    title: "Millenium Aqeeq Breakfast",
    subtitle: "Fresh bakery, Arabic coffee, eggs, fruit bowls, and morning specials.",
    items: [
      ["Arabic Breakfast Platter", "SAR 42"],
      ["Omelette Station", "SAR 28"],
      ["Date Pancakes", "SAR 24"],
      ["Fresh Juice Flight", "SAR 18"]
    ],
    accent: "#0f766e"
  },
  lunch: {
    label: "Lunch Menu",
    badge: "12:30 PM - 4:00 PM",
    title: "Lunch Dining",
    subtitle: "Rice dishes, grilled mains, salads, soups, and chef recommendations.",
    items: [
      ["Chicken Kabsa", "SAR 48"],
      ["Mixed Grill", "SAR 64"],
      ["Lentil Soup", "SAR 20"],
      ["Fattoush Salad", "SAR 22"]
    ],
    accent: "#b45309"
  },
  roomService: {
    label: "Room Service",
    badge: "24 hours",
    title: "In-Room Dining",
    subtitle: "Late-night meals, drinks, desserts, and comfort food delivered to the room.",
    items: [
      ["Club Sandwich", "SAR 38"],
      ["Margherita Pizza", "SAR 44"],
      ["Chocolate Fondant", "SAR 26"],
      ["Mint Lemonade", "SAR 16"]
    ],
    accent: "#1d4ed8"
  }
};

const defaultState = {
  qrId: "MAH-TABLE-12",
  tableName: "Table 12",
  destination: "breakfast",
  active: true,
  announcement: "Welcome. Scan, browse the menu, and place your order with the waiter.",
  scans: 0,
  lastUpdated: new Date().toISOString()
};

// State lives on the dev server (see vite.config.js), not localStorage, so
// every device on the same Wi-Fi (admin laptop, guest phone) sees the same
// live destination instead of each browser keeping its own copy.
let state = { ...defaultState };

async function fetchState() {
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (!res.ok) throw new Error("bad response");
    return await res.json();
  } catch {
    return { ...defaultState };
  }
}

async function patchState(partial) {
  try {
    const res = await fetch("/api/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial)
    });
    if (!res.ok) throw new Error("bad response");
    state = await res.json();
  } catch {
    state = { ...state, ...partial, lastUpdated: new Date().toISOString() };
  }
  return state;
}

async function resetState() {
  try {
    const res = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scans: 0 })
    });
    if (!res.ok) throw new Error("bad response");
    state = await res.json();
  } catch {
    state = { ...defaultState, scans: 0 };
  }
  return state;
}

function getBaseUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url;
}

function getQrUrl() {
  const url = getBaseUrl();
  url.searchParams.set("scan", state.qrId);
  return url.toString();
}

function getAdminUrl() {
  const url = getBaseUrl();
  url.searchParams.set("demo", "admin");
  return url.toString();
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function render() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("scan")) {
    renderScanView(params.get("scan"));
    return;
  }

  if (params.get("demo") === "admin") {
    renderAdminView();
    return;
  }

  renderPresentationView();
}

function renderPresentationView() {
  const app = document.querySelector("#app");
  const current = destinations[state.destination];

  app.innerHTML = `
    <main class="presentation-shell">
      <nav class="presentation-nav" aria-label="Presentation navigation">
        <div>
          <strong>Dynamic QR Ordering</strong>
          <span>Tech demo for hotel restaurant operations</span>
        </div>
        <div class="nav-actions">
          <button class="secondary-button" id="openWalkthrough" type="button">View flow</button>
          <a class="primary-button" href="${getAdminUrl()}">Open live admin</a>
        </div>
      </nav>

      <section class="presentation-hero">
        <div class="hero-copy">
          <p class="eyebrow">Client preview</p>
          <h1>Update the guest menu without reprinting QR codes.</h1>
          <p class="hero-lede">
            This demo shows one permanent QR code connected to a live destination that hotel staff can change any time.
          </p>
          <div class="hero-actions">
            <button class="primary-button" id="openScanFromPresentation" type="button">Open guest view</button>
            <button class="secondary-button" id="copyPresentationQr" type="button">Copy scan link</button>
          </div>
        </div>

        <div class="presentation-board">
          <div class="qr-showcase">
            <div>
              <p class="eyebrow">Printed QR remains same</p>
              <h2>${state.qrId}</h2>
            </div>
            <canvas id="presentationQr" width="250" height="250" aria-label="Dynamic QR code"></canvas>
            <span class="showcase-note">Current target: ${current.label}</span>
          </div>

          <div class="guest-mini" style="--accent:${current.accent}">
            <div class="phone-bar"></div>
            <div class="menu-hero">
              <span>${current.badge}</span>
              <h3>${current.title}</h3>
              <p>${current.subtitle}</p>
            </div>
            <div class="notice">${escapeHtml(state.announcement)}</div>
            <div class="menu-list">
              ${renderMenuItems(current.items.slice(0, 3), "div")}
            </div>
          </div>
        </div>
      </section>

      <section class="compare-section" aria-label="Static QR vs dynamic QR">
        <div class="section-head">
          <p class="eyebrow">What is a dynamic QR code?</p>
          <h2>Same printed code. Content the restaurant keeps changing.</h2>
          <p>A static QR code has its destination baked into the black-and-white pattern forever. A dynamic QR code
          points to one short, permanent link on our server, and that link's destination can be changed anytime —
          so the printed code itself never has to change.</p>
        </div>
        <div class="compare-grid">
          <article class="compare-card static">
            <h3>Static QR</h3>
            <ul>
              <li>Destination is encoded directly into the QR image</li>
              <li>Any content change means printing a brand-new code</li>
              <li>Old codes left on tables can quietly go stale</li>
            </ul>
          </article>
          <article class="compare-card dynamic">
            <h3>Dynamic QR <span>This demo</span></h3>
            <ul>
              <li>QR always points to one stable link, e.g. <em>yoursite.com/?scan=${state.qrId}</em></li>
              <li>Staff change what that link shows from the admin panel</li>
              <li>Same printed code, always up to date — nothing to reprint</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="value-grid" aria-label="Demo highlights">
        <article>
          <span>1</span>
          <h2>Guest scans fixed QR</h2>
          <p>The QR can be printed for tables, rooms, reception counters, or restaurant entrances.</p>
        </article>
        <article>
          <span>2</span>
          <h2>System checks live target</h2>
          <p>The same QR ID can open breakfast, lunch, room service, offers, or a paused page.</p>
        </article>
        <article>
          <span>3</span>
          <h2>Admin updates instantly</h2>
          <p>Staff change the destination from the dashboard. No QR reprint is needed.</p>
        </article>
      </section>

      <section class="client-summary">
        <div>
          <p class="eyebrow">What this proves</p>
          <h2>Dynamic QR logic is ready to demonstrate</h2>
        </div>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>${state.active ? "Active" : "Paused"}</dd>
          </div>
          <div>
            <dt>Destination</dt>
            <dd>${current.label}</dd>
          </div>
          <div>
            <dt>Scan count</dt>
            <dd>${state.scans}</dd>
          </div>
          <div>
            <dt>Last update</dt>
            <dd>${formatDate(state.lastUpdated)}</dd>
          </div>
        </dl>
      </section>

      <div class="modal-backdrop" id="walkthroughModal" hidden>
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="walkthroughTitle">
          <div class="modal-head">
            <div>
              <p class="eyebrow">Presentation flow</p>
              <h2 id="walkthroughTitle">How to explain this to the client</h2>
            </div>
            <button class="icon-button" id="closeWalkthrough" type="button" aria-label="Close walkthrough">x</button>
          </div>
          <ol class="walkthrough-list">
            <li>
              <strong>Show the QR first.</strong>
              <span>Explain that the printed code contains only a stable QR ID, not a hardcoded menu.</span>
            </li>
            <li>
              <strong>Open the guest view.</strong>
              <span>The guest sees the current live destination for that table or room.</span>
            </li>
            <li>
              <strong>Open live admin.</strong>
              <span>Change the target to lunch or room service and save it.</span>
            </li>
            <li>
              <strong>Scan again.</strong>
              <span>The same QR now opens the new destination, proving the dynamic behavior.</span>
            </li>
          </ol>
          <div class="modal-actions">
            <a class="primary-button" href="${getAdminUrl()}">Go to live admin</a>
            <button class="secondary-button" id="modalScan" type="button">Open guest view</button>
          </div>
        </section>
      </div>
    </main>
  `;

  drawQr("#presentationQr", 250);
  bindPresentationEvents();
}

function renderAdminView() {
  const app = document.querySelector("#app");
  const current = destinations[state.destination];

  app.innerHTML = `
    <main class="shell">
      <section class="topbar" aria-label="Demo header">
        <div>
          <p class="eyebrow">Live admin demo</p>
          <h1>One QR code, changeable destination</h1>
        </div>
        <div class="nav-actions">
          <a class="secondary-button" href="${window.location.pathname}">Presentation</a>
          <button class="ghost-button" id="resetDemo" type="button">Reset demo</button>
        </div>
      </section>

      <section class="layout">
        <article class="panel qr-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Fixed QR</p>
              <h2>${state.qrId}</h2>
            </div>
            <span class="status ${state.active ? "active" : "paused"}">
              ${state.active ? "Active" : "Paused"}
            </span>
          </div>

          <div class="qr-frame">
            <canvas id="qrCanvas" width="280" height="280" aria-label="Dynamic QR code"></canvas>
          </div>

          <div class="readonly-url">
            <span>QR always opens</span>
            <strong id="qrValue">${getQrUrl()}</strong>
          </div>

          <div class="button-row">
            <button class="primary-button" id="openScan" type="button">Open scan view</button>
            <button class="secondary-button" id="copyQr" type="button">Copy QR URL</button>
          </div>
        </article>

        <article class="panel control-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Admin controls</p>
              <h2>Change what the QR resolves to</h2>
            </div>
          </div>

          <form id="settingsForm" class="form-grid">
            <label>
              Table or location
              <input id="tableName" name="tableName" value="${escapeHtml(state.tableName)}" />
            </label>

            <label>
              Guest message
              <textarea id="announcement" name="announcement" rows="3">${escapeHtml(state.announcement)}</textarea>
            </label>

            <fieldset>
              <legend>Current destination</legend>
              <div class="segmented">
                ${Object.entries(destinations).map(([key, value]) => `
                  <label class="${state.destination === key ? "selected" : ""}">
                    <input type="radio" name="destination" value="${key}" ${state.destination === key ? "checked" : ""} />
                    <span>${value.label}</span>
                  </label>
                `).join("")}
              </div>
            </fieldset>

            <label class="toggle">
              <input id="active" name="active" type="checkbox" ${state.active ? "checked" : ""} />
              <span>QR is active</span>
            </label>

            <button class="primary-button" type="submit">Save QR target</button>
          </form>
        </article>

        <article class="panel preview-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Live result</p>
              <h2>${current.label}</h2>
            </div>
            <span class="metric">${state.scans} scans</span>
          </div>

          <div class="phone-preview" style="--accent:${current.accent}">
            <div class="phone-bar"></div>
            <div class="menu-hero">
              <span>${current.badge}</span>
              <h3>${current.title}</h3>
              <p>${current.subtitle}</p>
            </div>
            <div class="notice">${escapeHtml(state.announcement)}</div>
            <div class="menu-list">
              ${renderMenuItems(current.items, "div")}
            </div>
          </div>

          <dl class="meta-list">
            <div>
              <dt>Last changed</dt>
              <dd>${formatDate(state.lastUpdated)}</dd>
            </div>
            <div>
              <dt>QR ID</dt>
              <dd>${state.qrId}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  `;

  drawQr("#qrCanvas", 280);
  bindAdminEvents();
}

function renderScanView(scanId) {
  const isKnownQr = scanId === state.qrId;
  if (isKnownQr && !sessionStorage.getItem(`scan-counted-${scanId}`)) {
    sessionStorage.setItem(`scan-counted-${scanId}`, "true");
    patchState({ scans: state.scans + 1 }).catch(() => {});
  }

  const current = destinations[state.destination];
  const app = document.querySelector("#app");

  app.innerHTML = `
    <main class="guest-shell" style="--accent:${current.accent}">
      <section class="guest-card">
        <div class="guest-top">
          <div>
            <p class="eyebrow">${escapeHtml(state.tableName)}</p>
            <h1>${state.active && isKnownQr ? current.title : "QR unavailable"}</h1>
          </div>
          <a class="admin-link" href="${getAdminUrl()}">Admin</a>
        </div>

        ${state.active && isKnownQr ? `
          <div class="menu-hero">
            <span>${current.badge}</span>
            <h2>${current.label}</h2>
            <p>${current.subtitle}</p>
          </div>
          <div class="notice">${escapeHtml(state.announcement)}</div>
          <div class="menu-list large">
            ${renderMenuItems(current.items, "button")}
          </div>
        ` : `
          <p class="closed-message">This QR code is paused or unknown. Please ask a staff member for assistance.</p>
        `}
      </section>
    </main>
  `;
}

function bindPresentationEvents() {
  const modal = document.querySelector("#walkthroughModal");

  document.querySelector("#openScanFromPresentation").addEventListener("click", () => {
    window.open(getQrUrl(), "_blank", "noopener,noreferrer");
  });

  document.querySelector("#modalScan").addEventListener("click", () => {
    window.open(getQrUrl(), "_blank", "noopener,noreferrer");
  });

  document.querySelector("#copyPresentationQr").addEventListener("click", async (event) => {
    await copyQrUrl(event.currentTarget, "Copy scan link");
  });

  document.querySelector("#openWalkthrough").addEventListener("click", () => {
    modal.hidden = false;
  });

  document.querySelector("#closeWalkthrough").addEventListener("click", () => {
    modal.hidden = true;
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.hidden = true;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      modal.hidden = true;
    }
  });
}

function bindAdminEvents() {
  document.querySelector("#settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await patchState({
      tableName: form.get("tableName").trim() || defaultState.tableName,
      announcement: form.get("announcement").trim() || defaultState.announcement,
      destination: form.get("destination"),
      active: form.get("active") === "on"
    });
    render();
  });

  document.querySelector("#openScan").addEventListener("click", () => {
    window.open(getQrUrl(), "_blank", "noopener,noreferrer");
  });

  document.querySelector("#copyQr").addEventListener("click", async (event) => {
    await copyQrUrl(event.currentTarget, "Copy QR URL");
  });

  document.querySelector("#resetDemo").addEventListener("click", async () => {
    await resetState();
    sessionStorage.clear();
    render();
  });
}

function copyQrUrl(button, resetLabel) {
  return navigator.clipboard.writeText(getQrUrl())
    .then(() => {
      button.textContent = "Copied";
    })
    .catch(() => {
      button.textContent = "Copy manually";
    })
    .finally(() => {
      setTimeout(() => {
        button.textContent = resetLabel;
      }, 1200);
    });
}

async function drawQr(selector, width) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  await QRCode.toCanvas(canvas, getQrUrl(), {
    width,
    margin: 2,
    color: {
      dark: "#111827",
      light: "#ffffff"
    }
  });
}

function renderMenuItems(items, tagName) {
  return items.map(([name, price]) => `
    <${tagName} ${tagName === "button" ? 'type="button"' : ""}>
      <span>${name}</span>
      <strong>${price}</strong>
    </${tagName}>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();

async function init() {
  state = await fetchState();
  render();
}
