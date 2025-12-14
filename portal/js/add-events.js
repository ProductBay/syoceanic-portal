import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://sbzqprzxzbatnoastdtb.supabase.co",
  "<YOUR_ANON_KEY>"
);

const params = new URLSearchParams(window.location.search);
const shipmentId = params.get("id");

const form = document.getElementById("eventForm");
const msg = document.getElementById("ev-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  msg.textContent = "Saving…";

  const payload = {
    shipment_id: shipmentId,
    status: document.getElementById("ev_status").value,
    location: document.getElementById("ev_loc").value,
    details: document.getElementById("ev_details").value,
    event_time: new Date().toISOString()
  };

  const { error } = await supabase
    .from("shipment_events")
    .insert(payload);

  if (error) {
    console.error(error);
    msg.textContent = "Error adding event.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Event saved!";

  setTimeout(() => {
    window.location.href = `/admin/edit-shipment.html?id=${shipmentId}`;
  }, 800);
});
