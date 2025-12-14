import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ========================
// SUPABASE CONFIG
// ========================
const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================
// UTIL: ALERT
// ========================
function showAdminAlert(message, type = "error") {
  const box = document.getElementById("adminLoginAlert");
  box.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
      ${message}
    </div>
  `;
}

// ========================
// FACTORY INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("adminLoginForm").addEventListener("submit", adminLogin);
});

// ========================
// ADMIN LOGIN
// ========================
async function adminLogin(event) {
  event.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const btn = document.getElementById("adminLoginBtn");

  if (!email || !password) {
    showAdminAlert("Enter your email and password.");
    return;
  }

  // Button Loading State
  btn.disabled = true;
  btn.innerHTML = "Signing in...";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showAdminAlert(error.message);
    btn.disabled = false;
    btn.innerHTML = "Sign In";
    return;
  }

  // Check metadata role
  const user = data.user;

  if (user.user_metadata?.role !== "admin") {
    showAdminAlert("Access denied — not an admin.");
    await supabase.auth.signOut();
    btn.disabled = false;
    btn.innerHTML = "Sign In";
    return;
  }

  // Success → Redirect
  window.location.href = "./dashboard.html";
}
