import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("SHIP CHANDLING JS LOADED!");

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    vessel_name: form.querySelectorAll(".form-input")[0].value,
    call_sign: form.querySelectorAll(".form-input")[1].value,
    port: form.querySelector(".form-select").value,
    eta: form.querySelector('input[type="date"]').value,
    notes: form.querySelector(".form-textarea").value,
    status: "Pending"
  };

  const { error } = await supabase.from("ship_chandling_requests").insert(payload);

  if (error) {
    alert("Error submitting request");
    console.error(error);
    return;
  }

  alert("Chandling Request Submitted!");
  form.reset();
});
