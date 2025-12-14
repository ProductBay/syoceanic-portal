import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1) YOUR SUPABASE DETAILS
const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

// 2) CREATE CLIENT
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3) UI ELEMENTS
const msgEl = document.getElementById("track-message");
const statusCard = document.getElementById("track-status-card");
const statusTitle = document.getElementById("tsc-title");
const statusMeta = document.getElementById("tsc-meta");
const statusExtra = document.getElementById("tsc-extra");
const timelineSection = document.getElementById("track-timeline");
const timelineBody = document.getElementById("timeline-body");

function setMessage(text, type = "info") {
  if (!msgEl) return;
  msgEl.textContent = text || "";
  msgEl.style.color = type === "error" ? "#b91c1c" : "var(--text-muted)";
}

function clearResult() {
  if (statusCard) statusCard.style.display = "none";
  if (timelineSection) timelineSection.style.display = "none";
  if (timelineBody) timelineBody.innerHTML = "";
  setMessage("");
}

// ---------------------------------------------------------
// 🔍 4) **ADVANCED FETCH: MULTI-FIELD SEARCH**
// Searches: tracking_number, phone, email, or order_id
// ---------------------------------------------------------
async function fetchTracking(input) {
  clearResult();

  if (!input) {
    setMessage("Please enter a tracking number (or phone/email/order ID).", "error");
    return;
  }

  setMessage("Searching records…");

  const searchValue = input.trim();



const safe = searchValue.replace(/"/g, '\\"'); // escape double quotes

// Build OR filters cleanly (NO line breaks)
const filter =
  `tracking_number.eq."${safe}",` +
  `phone.eq."${safe}",` +
  `email.eq."${safe}",` +
  `order_id.eq."${safe}"`;

const { data, error } = await supabase
  .from("shipments")
  .select(`
      id,
      tracking_number,
      status,
      location,
      eta,
      weight_kg,
      dimensions_cm,
      freight_type,
      phone,
      email,
      order_id,
      created_at,
      shipment_events (
        event_time,
        status,
        location,
        details
      )
  `)
  .or(filter)
  .limit(1);
  
console.log("SUPABASE ERROR:", error);
console.log("SUPABASE DATA:", data);



  if (error) {
    console.error(error);
    setMessage("Error contacting tracking service.", "error");
    return;
  }

  if (!data || data.length === 0) {
    setMessage(
      "No shipment found for that tracking number, phone, email, or order ID.",
      "error"
    );
    return;
  }

  renderShipment(data[0]);
}

// ---------------------------------------------------------
// 5) RENDER RESULT (unchanged — your original code)
// ---------------------------------------------------------
function renderShipment(shipment) {
  setMessage("");

  if (statusCard) {
    statusTitle.textContent = `Shipment: ${shipment.tracking_number}`;

    const statusText = shipment.status || "Status not set";
    const locText = shipment.location ? `Current location: ${shipment.location}` : "Location not set";

    statusMeta.innerHTML = `<strong>Status:</strong> ${statusText}<br>${locText}`;

    const extraBits = [];
    if (shipment.eta) extraBits.push(`ETA: ${new Date(shipment.eta).toLocaleDateString()}`);
    if (shipment.freight_type) extraBits.push(`Freight: ${shipment.freight_type.toUpperCase()}`);
    if (shipment.weight_kg) extraBits.push(`Weight: ${shipment.weight_kg} kg`);
    if (shipment.dimensions_cm) extraBits.push(`Dimensions: ${shipment.dimensions_cm}`);
    if (shipment.phone) extraBits.push(`Phone: ${shipment.phone}`);
    if (shipment.email) extraBits.push(`Email: ${shipment.email}`);
    if (shipment.order_id) extraBits.push(`Order ID: ${shipment.order_id}`);

    statusExtra.textContent = extraBits.join(" • ");
    statusCard.style.display = "block";
  }

  // TIMELINE SECTION (unchanged)
  if (timelineSection && timelineBody) {
    const events = (shipment.shipment_events || []).sort(
      (a, b) => new Date(a.event_time) - new Date(b.event_time)
    );

    if (!events.length) {
      timelineBody.innerHTML =
        `<p style="font-size:0.9rem; color:var(--text-muted);">No event history recorded.</p>`;
    } else {
      timelineBody.innerHTML = "";
      events.forEach(ev => {
        const div = document.createElement("div");
        div.className = "timeline-item";
        const when = new Date(ev.event_time).toLocaleString();
        div.innerHTML = `
          <strong>${ev.status || "Update"}</strong>
          <span style="font-size:0.8rem; color:var(--text-muted);">${when}${ev.location ? " — " + ev.location : ""}</span>
          ${ev.details ? `<div>${ev.details}</div>` : ""}
        `;
        timelineBody.appendChild(div);
      });
    }

    timelineSection.style.display = "block";
  }
}

// ---------------------------------------------------------
// 6) FORM BINDING (unchanged)
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("track-form");
  const input = document.getElementById("trackingId");
  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchTracking(input.value);
  });
});
