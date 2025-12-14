// services.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Replace with your actual Supabase values
const supabaseUrl = "https://sbzqprzxzbatnoastdtb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Get Session
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (!session) {
    // No session? Redirect to login
    window.location.href = "/portal/index.html";
    return;
  }

  const user = session.user;

  // 2. Inject user email
  const emailLabel = document.getElementById("customerEmailLabel");
  if (emailLabel) emailLabel.textContent = user.email;

  // 3. Inject user initial avatar
  const avatar = document.getElementById("customerAvatar");
  if (avatar) avatar.textContent = user.email.charAt(0).toUpperCase();

  // 4. Profile dropdown toggle
  const profileBtn = document.getElementById("profileMenuBtn");
  const profileDropdown = document.getElementById("profileDropdown");

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", () => {
      profileDropdown.classList.toggle("hidden");
    });
  }

  // 5. Inject email in dropdown if element exists
  const dropdownEmail = document.getElementById("profileDropdownEmail");
  if (dropdownEmail) dropdownEmail.textContent = user.email;

  // 6. Logout handler
  const logoutBtn = document.getElementById("customerLogoutBtn") || document.getElementById("customerLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/portal/index.html";
    });
  }
});
