import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://sbzqprzxzbatnoastdtb.supabase.co",
  "<YOUR_ANON_KEY>"
);

const params = new URLSearchParams(window.location.search);
const shipmentId = params.get("id");

const form = document.getElementById("editForm");
const msg = document.getElementById("edit-msg");

document.getElementById("admin-logout").onclick = async () => {
  await supabase.auth.signOut();
  window.location.href = "/admin/login.html";
};

async function loadShipment() {
  msg.textContent = "Loading…";

  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", shipmentId)
    .maybeSingle();

  if (!data) {
    msg.textContent = "Shipment not found.";
    return;
  }

  msg.textContent = "";

  form.innerHTML = `
    <label>Tracking Number</label>
    <input id="tracking_number" value="${data.tracking_number}">

    <label>Customer Email</label>
    <input id="email" value="${data.email || ""}">

    <label>Customer Phone</label>
    <input id="phone" value="${data.phone || ""}">

    <label>Order ID</label>
    <input id="order_id" value="${data.order_id || ""}">

    <label>Status</label>
    <input id="status" value="${data.status || ""}">

    <label>Location</label>
    <input id="location" value="${data.location || ""}">

    <label>ETA</label>
    <input type="date" id="eta" value="${data.eta ? data.eta.split("T")[0] : ""}">

    <label>Freight Type</label>
    <select id="freight_type">
      <option value="">Select...</option>
      <option value="air" ${data.freight_type === "air" ? "selected" : ""}>Air</option>
      <option value="sea" ${data.freight_type === "sea" ? "selected" : ""}>Sea</option>
      <option value="express" ${data.freight_type === "express" ? "selected" : ""}>Express</option>
    </select>

    <label>Weight (kg)</label>
    <input id="weight_kg" type="number" value="${data.weight_kg || ""}">

    <label>Dimensions (cm)</label>
    <input id="dimensions_cm" value="${data.dimensions_cm || ""}">

    <button class="btn-primary" style="margin-top:20px;">Save Changes</button>
  `;

  form.onsubmit = updateShipment;
}

async function updateShipment(e) {
  e.preventDefault();
  msg.textContent = "Saving…";

  const payload = {
    tracking_number: document.getElementById("tracking_number").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    order_id: document.getElementById("order_id").value,
    status: document.getElementById("status").value,
    location: document.getElementById("location").value,
    eta: document.getElementById("eta").value || null,
    freight_type: document.getElementById("freight_type").value,
    weight_kg: document.getElementById("weight_kg").value,
    dimensions_cm: document.getElementById("dimensions_cm").value
  };

  const { error } = await supabase
    .from("shipments")
    .update(payload)
    .eq("id", shipmentId);

  if (error) {
    console.error(error);
    msg.textContent = "Error saving.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Saved!";

  setTimeout(() => {
    window.location.href = "/admin/dashboard.html";
  }, 800);
}

loadShipment();

document.getElementById("add-event-btn").onclick = () =>
  window.location.href = `/admin/add-event.html?id=${shipmentId}`;
