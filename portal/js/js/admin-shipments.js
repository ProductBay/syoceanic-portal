import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const logoutBtn = document.getElementById("adminLogout");
const adminAlert = document.getElementById("adminAlert");

const form = document.getElementById("addShipmentForm");
const submitBtn = document.getElementById("submitBtn");

// ========================
// PAGE INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  protectRoute();
  initSidebar();
  logoutBtn.addEventListener("click", logoutAdmin);

  form.addEventListener("submit", createShipment);
});

// ========================
// ADMIN AUTH GUARD
// ========================
async function protectRoute() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  document.getElementById("adminAvatar").textContent =
    (user.email[0] || "A").toUpperCase();
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
// CREATE SHIPMENT
// ========================
async function createShipment() {
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating...";

  const trackingNumber = generateTrackingNumber();

  const payload = {
    tracking_number: trackingNumber,
    customer_name: cName.value.trim(),
    customer_email: cEmail.value.trim(),
    customer_phone: cPhone.value.trim(),
    freight_type: freightType.value,
    location: location.value.trim() || null,
    eta: eta.value || null,
    weight_kg: weight.value || null,
    dimensions_cm: dimensions.value || null,
    status: "Created"
  };

  const { error } = await supabase.from("shipments").insert(payload);

  if (error) {
    showAlert("Error creating shipment", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Shipment";
    return;
  }

  showAlert(`Shipment Created! Tracking: ${trackingNumber}`, "success");

  // Redirect after 1.5s
  setTimeout(() => {
    window.location.href = "./dashboard.html";
  }, 1500);
}

// ========================
// TRACKING NUMBER GENERATOR
// ========================
function generateTrackingNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SYO-${rand}`;
}

// ========================
// ALERT SYSTEM
// ========================
function showAlert(message, type = "info") {
  adminAlert.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
      <span class="so-alert-message">${message}</span>
      <button class="so-alert-close" onclick="this.parentElement.remove()">✕</button>
    </div>
  `;
}
