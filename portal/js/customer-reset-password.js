import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sbzqprzxzbatnoastdtb.supabase.co";
const SUPABASE_ANON_KEY = "your key";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const btn = document.getElementById("newPassBtn");
const passField = document.getElementById("newPassword");
const alertBox = document.getElementById("newPassAlert");

function showAlert(msg, type = "info") {
  alertBox.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
      <span>${msg}</span>
    </div>`;
  setTimeout(() => (alertBox.innerHTML = ""), 3500);
}

// Supabase automatically injects a session via URL
document.addEventListener("DOMContentLoaded", async () => {
  const hash = window.location.hash;

  if (!hash.includes("access_token")) {
    showAlert("Invalid reset link.", "error");
    return;
  }

  await supabase.auth.exchangeCodeForSession(window.location.href);
});

btn.addEventListener("click", async () => {
  const newPass = passField.value.trim();
  if (!newPass) {
    showAlert("Enter a new password.", "error");
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPass });

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  showAlert("Password updated successfully!", "info");

  setTimeout(() => {
    window.location.href = "./login.html";
  }, 1500);
});
