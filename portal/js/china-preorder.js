// public/js/china-preorder.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ✅ Replace with your actual Supabase project values
const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("preorderForm");
  const status = document.getElementById("formStatus");

  if (!form || !status) {
    console.error("❌ Form or #formStatus element not found.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      full_name: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      parish: form.parish.value,
      product_links: form.productLinks.value.trim(),
      notes: form.notes.value.trim()
    };

    status.textContent = "⏳ Sending your preorder...";
    status.style.color = "black";

    try {
      const { data: inserted, error } = await supabase
        .from("china_preorders")
        .insert([data]);

      if (error) throw error;

      console.log("✅ Inserted row:", inserted);
      status.textContent = "✅ Preorder submitted successfully!";
      status.style.color = "green";
      form.reset();
    } catch (err) {
      console.error("❌ Insert error:", err);
      status.textContent = "❌ Submission failed: " + err.message;
      status.style.color = "red";
    }
  });
});
