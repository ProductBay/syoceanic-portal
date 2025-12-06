import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ========================
// SUPABASE CONFIG
// ========================
const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM
const form = document.getElementById("addShipmentForm");
const alertBox = document.getElementById("adminAlert");
const avatar = document.getElementById("adminAvatar");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const logoutBtn = document.getElementById("adminLogout");

// ========================
// INIT PAGE
// ========================
document.addEventListener("DOMContentLoaded", () => {
  protectRoute();
  initSidebar();

  logoutBtn.addEventListener("click", logoutAdmin);

  // Handle create shipment submit
  form.addEventListener("submit", createShipment);
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

  // Populate avatar
  const avatarEl = document.getElementById("adminAvatar");
  avatarEl.textContent = (user.email[0] || "A").toUpperCase();

  // Populate email
  const emailLabel = document.getElementById("adminEmailLabel");
  if (emailLabel) {
    emailLabel.textContent = user.email;
  }
}


// ========================
// SIDEBAR TOGGLE
// ========================
function initSidebar() {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("so-sidebar-open");
  });
}

// ========================
// LOGOUT
// ========================
async function logoutAdmin() {
  await supabase.auth.signOut();
  window.location.href = "./login.html";
}

// ========================
// GENERATE TRACKING NUMBER
// ========================
function generateTrackingNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const prefix = "SYO-";
  return prefix + rand;
}

// ========================
// CREATE SHIPMENT
// ========================
async function createShipment(e) {
  e.preventDefault();

  const cName = document.getElementById("cName").value.trim();
  const cEmail = document.getElementById("cEmail").value.trim();
  const cPhone = document.getElementById("cPhone").value.trim();
  const freightType = document.getElementById("freightType").value;
  const location = document.getElementById("location").value.trim();
  const eta = document.getElementById("eta").value || null;
  const weight = document.getElementById("weight").value || null;
  const dimensions = document.getElementById("dimensions").value.trim();

  if (!cName || !cEmail) {
    showAlert("Name & Email are required", "error");
    return;
  }

  const tracking = generateTrackingNumber();

  const { error } = await supabase.from("shipments").insert([
    {
      tracking_number: tracking,
      customer_name: cName,
      customer_email: cEmail,
      customer_phone: cPhone,
      freight_type: freightType,
      location: location,
      eta: eta,
      weight_kg: weight,
      dimensions_cm: dimensions,
      status: "Created"
    }
  ]);

  if (error) {
    console.error(error);
    showAlert("Failed to create shipment", "error");
    return;
  }

  showAlert(`Shipment created successfully! Tracking: ${tracking}`, "success");

  form.reset();
}

// ========================
// ALERTS
// ========================
function showAlert(message, type = "info") {
  alertBox.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
      <span>${message}</span>
    </div>
  `;

  setTimeout(() => {
    alertBox.innerHTML = "";
  }, 3000);
}
