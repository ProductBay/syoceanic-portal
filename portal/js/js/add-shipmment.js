import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://sbzqprzxzbatnoastdtb.supabase.co",
  "<YOUR_ANON_KEY>"
);

document.getElementById("admin-logout").onclick = async () => {
  await supabase.auth.signOut();
  window.location.href = "/admin/login.html";
};

const form = document.getElementById("shipmentForm");
const msg = document.getElementById("form-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  msg.textContent = "Saving shipment…";

  const payload = {
    tracking_number: document.getElementById("tracking_number").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    order_id: document.getElementById("order_id").value.trim(),
    status: document.getElementById("status").value.trim(),
    location: document.getElementById("location").value.trim(),
    eta: document.getElementById("eta").value || null,
    freight_type: document.getElementById("freight_type").value,
    weight_kg: document.getElementById("weight_kg").value,
    dimensions_cm: document.getElementById("dimensions_cm").value.trim()
  };

  const { data, error } = await supabase
    .from("shipments")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    msg.textContent = "Failed to save shipment.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Shipment created successfully!";

  setTimeout(() => {
    window.location.href = "/admin/dashboard.html";
  }, 1000);
});
