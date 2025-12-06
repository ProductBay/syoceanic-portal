import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* =====================================================
   SUPABASE CONFIG
===================================================== */
const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =====================================================
   GLOBAL STATE
===================================================== */
let currentUser = null;
let realtimeChannel = null;

let currentSearch = "";
let currentFilter = "all";

let notifUnread = 0;

/* =====================================================
   DOM REFERENCES (Populated on DOMContentLoaded)
===================================================== */
let shipmentsList,
  alertBox,
  avatar,
  sidebar,
  menuToggle,
  logoutBtn,
  profileMenuBtn,
  profileDropdown,
  notifBell,
  notifCount,
  notifDropdown,
  notifListDiv,
  timelineModal,
  timelineClose,
  timelineList,
  timelineTracking;

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Load references
  shipmentsList = document.getElementById("shipmentsList");
  alertBox = document.getElementById("customerAlert");
  avatar = document.getElementById("customerAvatar");
  sidebar = document.getElementById("sidebar");
  menuToggle = document.getElementById("menuToggle");
  logoutBtn = document.getElementById("customerLogoutBtn");

  profileMenuBtn = document.getElementById("profileMenuBtn");
  profileDropdown = document.getElementById("profileDropdown");

  notifBell = document.getElementById("notifBell");
  notifCount = document.getElementById("notifCount");
  notifDropdown = document.getElementById("notifDropdown");
  notifListDiv = document.getElementById("notifList");

  timelineModal = document.getElementById("timelineModal");
  timelineClose = document.getElementById("timelineClose");
  timelineList = document.getElementById("timelineList");
  timelineTracking = document.getElementById("timelineTracking");

  // Initialize components
  initSidebar();
  initProfileMenu();
  setupNotificationBell();
  setupSearchBar();
  setupFilterButtons();

  protectRoute(); // Validates auth, loads shipments, starts realtime

  if (logoutBtn) logoutBtn.addEventListener("click", logoutCustomer);
});

/* =====================================================
   AUTH GUARD + LOAD USER
===================================================== */
async function protectRoute() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  currentUser = user;

  avatar.textContent = user.email[0].toUpperCase();
  document.getElementById("customerEmailLabel").textContent = user.email;

  await loadShipments();
  setupRealtime();
}

/* =====================================================
   SIDEBAR TOGGLE
===================================================== */
function initSidebar() {
  if (!menuToggle) return;
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("so-sidebar-open");
  });
}

/* =====================================================
   PROFILE MENU
===================================================== */
function initProfileMenu() {
  if (!profileMenuBtn) return;

  profileMenuBtn.addEventListener("click", () => {
    profileDropdown.classList.toggle("hidden");
    notifDropdown.classList.add("hidden");
  });
}

/* =====================================================
   LOGOUT
===================================================== */
async function logoutCustomer() {
  await supabase.auth.signOut();
  window.location.href = "./login.html";
}

/* =====================================================
   SEARCH BAR
===================================================== */
function setupSearchBar() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    loadShipments();
  });
}

/* =====================================================
   FILTER BUTTONS
===================================================== */
function setupFilterButtons() {
  const filterButtons = document.querySelectorAll(".so-filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("so-filter-active"));

      btn.classList.add("so-filter-active");
      currentFilter = btn.dataset.filter;

      loadShipments();
    });
  });
}

/* =====================================================
   LOAD SHIPMENTS
===================================================== */
async function loadShipments() {
  shipmentsList.innerHTML = `
    <div class="so-card so-card-panel">
      <p class="so-activity-placeholder">Loading your shipments...</p>
    </div>
  `;

  // RLS ensures user only sees their shipments
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    shipmentsList.innerHTML = `
      <div class="so-card so-card-panel">
        <p class="so-activity-placeholder">Error loading shipments.</p>
      </div>
    `;
    return;
  }

  let items = data || [];

  /* -------------------------------
      SEARCH FILTER
  -------------------------------- */
  if (currentSearch.length > 0) {
    items = items.filter((s) =>
      (s.tracking_number || "").toLowerCase().includes(currentSearch)
    );
  }

  /* -------------------------------
      STATUS FILTER
  -------------------------------- */
  items = items.filter((s) => {
    const st = (s.status || "").toLowerCase();

    if (currentFilter === "all") return true;
    if (currentFilter === "in-transit") return st.includes("transit");
    if (currentFilter === "ready") return st.includes("ready");
    if (currentFilter === "delivered") return st.includes("deliver");
    if (currentFilter === "created") return st.includes("created");

    return true;
  });

  /* -------------------------------
      RENDER
  -------------------------------- */
  if (!items.length) {
    shipmentsList.innerHTML = `
      <div class="so-card so-card-panel">
        <p class="so-activity-placeholder">No shipments found.</p>
      </div>
    `;
    return;
  }

  shipmentsList.innerHTML = "";

  items.forEach((ship) => {
    const card = document.createElement("div");
    card.className = "so-card so-card-panel";

    card.innerHTML = `
      <div class="so-card-header">
        <div>
          <div class="so-card-label">Tracking #</div>
          <div class="so-card-metric">${ship.tracking_number}</div>
        </div>
        ${statusPill(ship.status)}
      </div>

      ${progressBar(ship.status)}

      <p class="so-card-label">Last updated: ${formatDate(ship.updated_at)}</p>
      <p class="so-card-label">Location: ${ship.location || "—"}</p>

      <button class="so-btn so-btn-outline"
        onclick="openTimeline('${ship.id}', '${ship.tracking_number}')">
        View Timeline
      </button>
    `;

    shipmentsList.appendChild(card);
  });
}

/* =====================================================
   REALTIME LISTENERS
===================================================== */
function setupRealtime() {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);

  realtimeChannel = supabase
    .channel("customer-events-" + currentUser.id)

    // Reload shipments on update
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shipments" },
      () => loadShipments()
    )

    // NEW event = notification
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "shipment_events" },
      async (payload) => {
        const ev = payload.new;

        const { data: shipment } = await supabase
          .from("shipments")
          .select("*")
          .eq("id", ev.shipment_id)
          .single();

        if (!shipment || shipment.customer_email !== currentUser.email) return;

        addNotification({
          title: `Shipment Update: ${ev.status}`,
          time: new Date(ev.event_time).toLocaleString(),
        });
      }
    )

    .subscribe();
}

/* =====================================================
   NOTIFICATIONS
===================================================== */
function addNotification({ title, time }) {
  notifUnread++;
  notifCount.textContent = notifUnread;
  notifCount.classList.remove("hidden");

  const empty = notifListDiv.querySelector(".so-notif-empty");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = "so-notif-item";
  item.innerHTML = `
    <div class="so-notif-title">${title}</div>
    <div class="so-notif-time">${time}</div>
  `;
  notifListDiv.prepend(item);
}

function setupNotificationBell() {
  notifBell.addEventListener("click", () => {
    notifDropdown.classList.toggle("hidden");
    profileDropdown.classList.add("hidden");

    notifUnread = 0;
    notifCount.textContent = "0";
    notifCount.classList.add("hidden");
  });
}

/* =====================================================
   TIMELINE MODAL
===================================================== */
window.openTimeline = async (id, trackingNumber) => {
  timelineTracking.textContent = `Tracking #: ${trackingNumber}`;
  timelineModal.classList.add("so-modal-open");

  timelineList.innerHTML = `
    <li class="so-activity-placeholder">Loading...</li>
  `;

  const { data } = await supabase
    .from("shipment_events")
    .select("*")
    .eq("shipment_id", id)
    .order("event_time", { ascending: false });

  if (!data || !data.length) {
    timelineList.innerHTML = `
      <li class="so-activity-placeholder">No events available.</li>
    `;
    return;
  }

  timelineList.innerHTML = "";

  data.forEach((ev) => {
    const li = document.createElement("li");
    li.className = "so-activity-item";
    li.innerHTML = `
      <div class="so-activity-title">${ev.status}</div>
      <div class="so-activity-meta">${ev.location || ""}</div>
      <div class="so-activity-meta">${new Date(ev.event_time).toLocaleString()}</div>
      <div class="so-activity-meta">${ev.details || ""}</div>
    `;
    timelineList.appendChild(li);
  });
};

timelineClose.addEventListener("click", () => {
  timelineModal.classList.remove("so-modal-open");
});

/* =====================================================
   HELPERS
===================================================== */
function formatDate(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString();
}

function statusPill(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("transit"))
    return `<span class="so-status-pill so-status-in-transit">In Transit</span>`;
  if (s.includes("ready"))
    return `<span class="so-status-pill so-status-ready">Ready for Pickup</span>`;
  if (s.includes("deliver"))
    return `<span class="so-status-pill so-status-delivered">Delivered</span>`;
  return `<span class="so-status-pill">Created</span>`;
}

function progressBar(status) {
  const s = (status || "").toLowerCase();
  let index = 0;
  if (s.includes("transit")) index = 1;
  if (s.includes("ready")) index = 2;
  if (s.includes("deliver")) index = 3;

  const percent = (index / 3) * 100;

  return `
    <div class="so-progress">
      <div class="so-progress-track">
        <div class="so-progress-fill" style="width:${percent}%"></div>
      </div>
      <div class="so-progress-labels">
        <span>Created</span><span>In Transit</span>
        <span>Ready</span><span>Delivered</span>
      </div>
    </div>
  `;
}
