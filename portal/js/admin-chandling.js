import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("ADMIN CHANDLING JS LOADED!");

const tbody = document.getElementById("chandlingBody");

async function loadChandling() {
  console.log("Loading ship chandling requests...");

  const { data, error } = await supabase
    .from("ship_chandling_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    tbody.innerHTML =
      `<tr><td colspan="6" class="so-table-empty">Error loading requests</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML =
      `<tr><td colspan="6" class="so-table-empty">No requests available</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  data.forEach(req => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${req.vessel_name}</td>
      <td>${req.call_sign}</td>
      <td>${req.port}</td>
      <td>${req.status}</td>
      <td>${new Date(req.created_at).toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

loadChandling();
