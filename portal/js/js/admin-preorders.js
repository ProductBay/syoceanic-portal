import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("ADMIN PREORDERS JS LOADED!");

const tbody = document.getElementById("preordersBody");

async function loadPreorders() {
  console.log("Running loadPreorders()...");

  const { data, error } = await supabase
    .from("china_preorders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading preorders:", error);
    tbody.innerHTML =
      `<tr><td colspan="7" class="so-table-empty">Error loading preorders</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML =
      `<tr><td colspan="7" class="so-table-empty">No preorders found</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  data.forEach(pre => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${pre.full_name}</td>
      <td>${pre.product_name}</td>
      <td>$${pre.product_price}</td>
      <td>${pre.shipping_method}</td>
      <td>${pre.status}</td>
      <td>${new Date(pre.created_at).toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

loadPreorders();
