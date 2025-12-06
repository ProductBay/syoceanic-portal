import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ========================
// SUPABASE CONFIG
// ========================
const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM selects
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const logoutBtn = document.getElementById("adminLogout");
const shipmentsBody = document.getElementById("shipmentsBody");
const alertBox = document.getElementById("adminAlert");

// Modal
const editModal = document.getElementById("editModal");
const editFormContainer = document.getElementById("editFormContainer");
const saveShipmentBtn = document.getElementById("saveShipment");
const editCloseBtn = document.getElementById("editClose");

const profileMenuBtn = document.getElementById("profileMenuBtn");
const profileDropdown = document.getElementById("profileDropdown");

// Track selected shipment ID
let editingId = null;

// ========================
// PAGE INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  protectRoute();
  initSidebar();
  loadShipments();

  logoutBtn.addEventListener("click", logoutAdmin);
  editCloseBtn.addEventListener("click", closeEditModal);
  saveShipmentBtn.addEventListener("click", saveShipmentChanges);
});

// Profile dropdown toggle
profileMenuBtn.addEventListener("click", () => {
  profileDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!profileMenuBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.remove("show");
  }
});

// ========================
// AUTH GUARD
// ========================
async function protectRoute() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  // Avatar
  const avatarEl = document.getElementById("adminAvatar");
  avatarEl.textContent = (user.email[0] || "A").toUpperCase();

  // Topbar email
  const emailLabel = document.getElementById("adminEmailLabel");
  emailLabel.textContent = user.email;

  // Dropdown email
  const ddEmail = document.getElementById("adminDropdownEmail");
  ddEmail.textContent = user.email;
}



// ========================
// SIDEBAR
// ========================
function initSidebar() {
  menuToggle.addEventListener("click", () =>
    sidebar.classList.toggle("so-sidebar-open")
  );
}

// ========================
// LOGOUT
// ========================
async function logoutAdmin() {
  await supabase.auth.signOut();
  window.location.href = "./login.html";
}

// ========================
// LOAD SHIPMENTS
// ========================
async function loadShipments() {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    shipmentsBody.innerHTML =
      `<tr><td colspan="5" class="so-table-empty">Error loading shipments</td></tr>`;
    return;
  }

  if (!data.length) {
    shipmentsBody.innerHTML =
      `<tr><td colspan="5" class="so-table-empty">No shipments found</td></tr>`;
    return;
  }

  shipmentsBody.innerHTML = "";

  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.tracking_number}</td>
      <td>${item.customer_name || "—"}</td>
      <td>${statusPill(item.status)}</td>
      <td>${formatDate(item.updated_at)}</td>
      <td>
  <button class="so-btn so-btn-outline" onclick="openTimeline('${item.id}', '${item.tracking_number}')">Timeline</button>
  <button class="so-btn so-btn-outline" onclick="editShipment('${item.id}')">Edit</button>
</td>

    `;
    shipmentsBody.appendChild(tr);
  });
}

// ========================
// EDIT SHIPMENT (open modal)
// ========================
window.editShipment = async (id) => {
  editingId = id;

  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    showAlert("Error loading shipment", "error");
    return;
  }

  // Inject form fields
  editFormContainer.innerHTML = `
    <label>Tracking Number</label>
    <input id="editTracking" class="so-input" value="${data.tracking_number}" />

    <label>Customer Name</label>
    <input id="editName" class="so-input" value="${data.customer_name || ""}" />

    <label>Customer Email</label>
    <input id="editEmail" class="so-input" value="${data.customer_email || ""}" />

    <label>Customer Phone</label>
    <input id="editPhone" class="so-input" value="${data.customer_phone || ""}" />

    <label>Status</label>
    <select id="editStatus" class="so-input">
      ${statusOptions(data.status)}
    </select>

    <label>Location</label>
    <input id="editLocation" class="so-input" value="${data.location || ""}" />

    <label>ETA (YYYY-MM-DD)</label>
    <input id="editETA" type="date" class="so-input" value="${data.eta || ""}" />

    <label>Weight (kg)</label>
    <input id="editWeight" class="so-input" value="${data.weight_kg || ""}" />

    <label>Dimensions (cm)</label>
    <input id="editDimensions" class="so-input" value="${data.dimensions_cm || ""}" />
  `;

  openEditModal();
};

// ========================
// SAVE SHIPMENT CHANGES
// ========================
async function saveShipmentChanges() {
  if (!editingId) return;

  const updates = {
    tracking_number: document.getElementById("editTracking").value,
    customer_name: document.getElementById("editName").value,
    customer_email: document.getElementById("editEmail").value,
    customer_phone: document.getElementById("editPhone").value,
    status: document.getElementById("editStatus").value,
    location: document.getElementById("editLocation").value,
    eta: document.getElementById("editETA").value || null,
    weight_kg: document.getElementById("editWeight").value,
    dimensions_cm: document.getElementById("editDimensions").value
  };

  const { error } = await supabase
    .from("shipments")
    .update(updates)
    .eq("id", editingId);

  if (error) {
    showAlert("Failed to save changes", "error");
    return;
  }

  showAlert("Shipment updated successfully", "success");
  closeEditModal();
  loadShipments();
}

// ========================
// MODAL CONTROL
// ========================
function openEditModal() {
  editModal.classList.add("so-modal-open");
}

function closeEditModal() {
  editModal.classList.remove("so-modal-open");
  editingId = null;
}

// ========================
// HELPERS
// ========================
function statusOptions(current) {
  const statuses = ["Created", "In Transit", "Ready for Pickup", "Delivered"];
  return statuses
    .map((s) => `<option ${s === current ? "selected" : ""}>${s}</option>`)
    .join("");
}

function showAlert(msg, type = "info") {
  alertBox.textContent = msg;
  alertBox.className = `so-alert-floating ${type === "error" ? "so-alert-error" : "so-alert-success"}`;

  setTimeout(() => {
    alertBox.className = "so-alert-floating";
    alertBox.textContent = "";
  }, 3000);
}

function formatDate(v) {
  return v ? new Date(v).toLocaleString() : "—";
}

function statusPill(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("transit")) return `<span class="so-status-pill so-status-in-transit">In Transit</span>`;
  if (s.includes("ready")) return `<span class="so-status-pill so-status-ready">Ready</span>`;
  if (s.includes("deliver")) return `<span class="so-status-pill so-status-delivered">Delivered</span>`;

  return `<span class="so-status-pill">${status}</span>`;
}

// ========================
//   TIMELINE LOGIC
// ========================

const timelineModal = document.getElementById("timelineModal");
const timelineClose = document.getElementById("timelineClose");
const timelineList = document.getElementById("timelineList");
const timelineTracking = document.getElementById("timelineTracking");
const addEventBtn = document.getElementById("addEventBtn");

let currentShipmentId = null;
let currentTrackingNumber = null;

// Open modal
window.openTimeline = async (shipmentId, trackingNumber) => {
  currentShipmentId = shipmentId;
  currentTrackingNumber = trackingNumber;

  timelineTracking.textContent = "Tracking #: " + trackingNumber;

  timelineModal.classList.add("so-modal-open");

  loadTimelineEvents();
};

// Close modal
timelineClose.addEventListener("click", () => {
  timelineModal.classList.remove("so-modal-open");
  currentShipmentId = null;
});

// Load events
async function loadTimelineEvents() {
  const { data, error } = await supabase
    .from("shipment_events")
    .select("*")
    .eq("shipment_id", currentShipmentId)
    .order("event_time", { ascending: false });

  if (error || !data) {
    timelineList.innerHTML = `<li class="so-activity-placeholder">Error loading events</li>`;
    return;
  }

  if (!data.length) {
    timelineList.innerHTML = `<li class="so-activity-placeholder">No events yet</li>`;
    return;
  }

  timelineList.innerHTML = "";

  data.forEach(ev => {
    const li = document.createElement("li");
    li.classList.add("so-activity-item");
    li.innerHTML = `
      <div class="so-activity-title">${ev.status}</div>
      <div class="so-activity-meta">${ev.location || ""}</div>
      <div class="so-activity-meta">${new Date(ev.event_time).toLocaleString()}</div>
      <div class="so-activity-meta">${ev.details || ""}</div>
    `;
    timelineList.appendChild(li);
  });
}

// Add event
addEventBtn.addEventListener("click", async () => {
  const status = document.getElementById("eventStatus").value;
  const location = document.getElementById("eventLocation").value;
  const details = document.getElementById("eventDetails").value;

  const { error } = await supabase.from("shipment_events").insert([
    {
      shipment_id: currentShipmentId,
      tracking_number: currentTrackingNumber,
      status,
      location,
      details
    }
  ]);

  if (error) {
    showAlert("Failed to add event", "error");
    return;
  }

  showAlert("Event added", "success");
  loadTimelineEvents();
});
  // Clear inputs
