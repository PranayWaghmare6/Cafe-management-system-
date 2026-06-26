/* ═══════════════════════════════════════════
   KITCHEN OPS — script.js
   ═══════════════════════════════════════════ */
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/frontend/login/index.html";
}

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "/frontend/login/index.html";
}

if (user.role !== "admin" && user.role !== "kitchen") {
  alert("Access Denied");
  window.location.href = "/frontend/login/index.html";
}

("use strict");

/* ── DATA ── */
let orders = [];
async function fetchOrders() {
  try {
    console.log("Fetching orders...");

    const res = await fetch(
      "https://cafe-management-system-1-uc3b.onrender.com/api/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();

    console.log("Orders received:", data.orders);

    orders = data.orders || [];

    renderOrders();
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
}
/* ── STATE ── */
let currentFilter = "all"; // "all" | "pending" | "completed"
let currentSearch = ""; // live search string
let activeTab = "pending"; // which panel is visible

/* ── CLOCK ── */
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour12: true });
  const date = now.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeEl = document.getElementById("clockTime");
  const dateEl = document.getElementById("clockDate");
  if (timeEl) timeEl.textContent = time;
  if (dateEl) dateEl.textContent = date;
}
setInterval(updateClock, 1000);
updateClock();

/* ── FILTER HELPER ── */
/**
 * Returns orders filtered by status, current filter mode, and search query.
 * @param {"pending"|"completed"} status
 */
function getFilteredOrders(status) {
  return orders
    .filter((order) => {
      if (order.status !== status) return false;

      if (currentFilter !== "all" && currentFilter !== status) return false;

      if (currentSearch) {
        const q = currentSearch.toLowerCase();

        const matchId = (order.orderId || "").toLowerCase().includes(q);

        const matchTable = String(order.tableNumber || "").includes(q);

        if (!matchId && !matchTable) return false;
      }

      return true;
    })
    .sort((a, b) => a.orderId.localeCompare(b.orderId));
}

/* ── RENDER ── */
function renderOrders() {
  const pendingList = getFilteredOrders("pending");
  const completedList = getFilteredOrders("completed");

  // Render each list
  renderList("pendingOrders", pendingList, "pending");
  renderList("completedOrders", completedList, "completed");

  // Update badge counts on the toggle tabs
  const pendingBadge = document.getElementById("pendingSectionCount");
  const completedBadge = document.getElementById("completedSectionCount");
  if (pendingBadge) pendingBadge.textContent = pendingList.length;
  if (completedBadge) completedBadge.textContent = completedList.length;

  // Update the global stats counters
  updateCounters();
}

/**
 * Renders a list of orders into a container.
 * @param {string} containerId
 * @param {Array}  list
 * @param {"pending"|"completed"} type
 */
function renderList(containerId, list, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (list.length === 0) {
    const icon = type === "pending" ? "🍽️" : "✅";
    const label =
      type === "pending" ? "No Pending Orders" : "No Completed Orders";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">${icon}</div>
        <div class="empty-msg">${label}</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list
    .map((order, i) => orderCardHTML(order, i))
    .join("");
}

/**
 * Builds the HTML string for a single order card.
 * @param {Object} order
 * @param {number} index  used for staggered animation delay
 */
function orderCardHTML(order, index) {
  const isPending = order.status === "pending";

  const orderTime = new Date(order.created_at).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const itemsHTML = (order.items || [])
    .map(
      (item) => `
    <li>
      <span class="item-name">${item.name}</span>
      <span class="item-qty">× ${item.qty}</span>
    </li>
  `,
    )
    .join("");

  const actionHTML = isPending
    ? `<button class="ready-btn" onclick="markOrderReady(${order.id})">✓ Mark Ready</button>`
    : `<div class="completed-stamp">✓ Completed Successfully</div>`;

  return `
    <div class="order-card ${isPending ? "" : "completed"}"
         data-id="${order.id}"
         style="animation-delay:${index * 0.05}s">

      <div class="order-head">
        <div class="order-id-block">
          <div class="order-id-label">Order ID</div>
          <div class="order-id-val">${order.orderId}</div>
        </div>
        <span class="badge ${order.status}">${order.status}</span>
      </div>

      <div class="order-meta">
        <span class="meta-chip table">🪑 Table ${order.tableNumber}</span>
        <span class="meta-chip">🕒 ${orderTime}</span>
      </div>

      <div class="items-label">Items</div>
      <ul class="items-list">${itemsHTML}</ul>

      <div class="order-totals">
        <span class="totals-qty">Items: ${order.totalQuantity}</span>
        <span class="totals-amount">₹${order.totalAmount}</span>
      </div>

      ${actionHTML}
    </div>
  `;
}

/* ── ACTIONS ── */
/**
 * Animates a card out, then marks the order as completed and re-renders.
 * @param {number} id - order id
 */
async function markOrderReady(id) {
  const card = document.querySelector(`.order-card[data-id="${id}"]`);

  if (card) {
    card.classList.add("removing");
  }

  try {
    await fetch(
      `https://cafe-management-system-1-uc3b.onrender.com/api/orders/${id}/complete`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setTimeout(async () => {
      await fetchOrders();
    }, 400);
  } catch (error) {
    console.error(error);
    alert("Failed to update order");
  }
}

/* ── STATS ── */
function updateCounters() {
  const pending = orders.filter((o) => o.status === "pending").length;
  const completed = orders.filter((o) => o.status === "completed").length;

  const pendingEl = document.getElementById("pendingCount");
  const completedEl = document.getElementById("completedCount");
  const totalEl = document.getElementById("totalCount");

  if (pendingEl) pendingEl.textContent = pending;
  if (completedEl) completedEl.textContent = completed;
  if (totalEl) totalEl.textContent = orders.length;
}

/* ── SECTION TOGGLE ── */
/**
 * Switches the visible panel between "pending" and "completed".
 * @param {"pending"|"completed"} tab
 */
function switchTab(tab) {
  activeTab = tab;

  // Toggle panel visibility
  const pendingPanel = document.getElementById("panelPending");
  const completedPanel = document.getElementById("panelCompleted");

  if (pendingPanel) pendingPanel.classList.toggle("hidden", tab !== "pending");
  if (completedPanel)
    completedPanel.classList.toggle("hidden", tab !== "completed");

  // Update tab button active state
  document.querySelectorAll(".toggle-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
}

// Attach toggle tab listeners
document.querySelectorAll(".toggle-tab").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

/* ── FILTER BUTTONS ── */
function filterOrders(filter) {
  currentFilter = filter;

  // Sync active state on filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  // If a specific status is selected, also switch to that tab
  if (filter === "pending") switchTab("pending");
  if (filter === "completed") switchTab("completed");

  renderOrders();
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => filterOrders(btn.dataset.filter));
});

/* ── SEARCH ── */
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    renderOrders();
  });
}
// real time

/* ── INIT ── */
fetchOrders();
// initRealtime();

// Refresh every 3 seconds
setInterval(() => {
  fetchOrders();
}, 2000);
