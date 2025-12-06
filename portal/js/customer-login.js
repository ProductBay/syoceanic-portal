import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4" // your key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const magicLinkBtn = document.getElementById("magicLinkBtn");
const alertBox = document.getElementById("loginAlert");
const emailInput = document.getElementById("loginEmail");
const passInput = document.getElementById("loginPassword");

// AUTO REDIRECT IF ALREADY LOGGED IN
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabase.auth.getUser();
  if (data?.user) window.location.href = "./dashboard.html";
});

// SHOW ALERT
function showAlert(msg, type = "info") {
  alertBox.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
      <span>${msg}</span>
    </div>`;
  setTimeout(() => (alertBox.innerHTML = ""), 3500);
}

// PASSWORD LOGIN
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    showAlert("Email & password required", "error");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  // success
  window.location.href = "./dashboard.html";
});

// MAGIC LINK LOGIN
magicLinkBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showAlert("Enter your email first", "error");
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + "/portal/customer/dashboard.html",
    },
  });

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  showAlert("Magic link sent! Check your email.", "info");
});
