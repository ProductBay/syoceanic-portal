import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ========================================
// SUPABASE CONFIG
// ========================================
const supabase = createClient(
  "https://sbzqprzxzbatnoastdtb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4"
);

// ========================================
// DOM ELEMENTS
// ========================================
const settingsAlert = document.getElementById("settingsAlert");

// left column
const avatarPreview = document.getElementById("avatarPreview");
const uploadAvatarBtn = document.getElementById("uploadAvatarBtn");
const avatarFile = document.getElementById("avatarFile");

// right column
const adminName = document.getElementById("adminName");
const adminPhone = document.getElementById("adminPhone");
const adminPassword = document.getElementById("adminPassword");

// topbar
const adminAvatar = document.getElementById("adminAvatar");
const adminEmailLabel = document.getElementById("adminEmailLabel");
const adminDropdownEmail = document.getElementById("adminDropdownEmail");

const profileMenuBtn = document.getElementById("profileMenuBtn");
const profileDropdown = document.getElementById("profileDropdown");

// forms & buttons
const settingsForm = document.getElementById("settingsForm");
const adminLogoutDd = document.getElementById("adminLogoutDd");
const adminLogout = document.getElementById("adminLogout");

// ========================================
// INIT
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
  await protectPage();
  await loadProfile();

  // Avatar click → open file browser
  uploadAvatarBtn.addEventListener("click", () => avatarFile.click());

  // When file chosen → upload
  avatarFile.addEventListener("change", async () => {
    const file = avatarFile.files[0];
    if (file) await uploadAvatar(file);
  });

  // Save name / phone / password
  settingsForm.addEventListener("submit", saveProfile);

  // dropdown logic
  profileMenuBtn.addEventListener("click", () => {
    profileDropdown.classList.toggle("hidden");
  });

  // logout (dropdown)
  adminLogoutDd.addEventListener("click", logout);
  // logout (sidebar button)
  adminLogout.addEventListener("click", logout);

  // close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileMenuBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.add("hidden");
    }
  });
});

// ========================================
// AUTH GUARD
// ========================================
async function protectPage() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== "admin") {
    window.location.href = "./login.html";
  }
}

// ========================================
// LOAD ADMIN PROFILE
// ========================================
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Email
  adminEmailLabel.textContent = user.email;
  adminDropdownEmail.textContent = user.email;

  // Name
  adminName.value = user.user_metadata.name || "";

  // Phone
  adminPhone.value = user.user_metadata.phone || "";

  // Avatar logic
  if (user.user_metadata.avatar_url) {
    const url = user.user_metadata.avatar_url;

    // topbar avatar
    adminAvatar.style.backgroundImage = `url(${url})`;
    adminAvatar.style.backgroundSize = "cover";
    adminAvatar.style.backgroundPosition = "center";
    adminAvatar.textContent = "";

    // settings preview
    avatarPreview.src = url;
  } else {
    // fallback initials
    adminAvatar.textContent = user.email.charAt(0).toUpperCase();
    avatarPreview.src = "../assets/logo/logo-syoceanic.svg";
  }
}

// ========================================
// UPLOAD AVATAR
// ========================================
async function uploadAvatar(file) {
  const { data: { user } } = await supabase.auth.getUser();

  const ext = file.name.split(".").pop();
  const fileName = `avatar.${ext}`;
  const filePath = `${user.id}/${fileName}`;     // ← OPTION A structure

  // Upload into "avatars" bucket
  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadErr) {
    return showAlert("Failed to upload avatar", "error");
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Update user metadata
  const { error: metaErr } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  if (metaErr) {
    return showAlert("Avatar uploaded but failed to update profile", "error");
  }

  // Update UI live
  avatarPreview.src = publicUrl;
  adminAvatar.style.backgroundImage = `url(${publicUrl})`;
  adminAvatar.style.backgroundSize = "cover";
  adminAvatar.style.backgroundPosition = "center";
  adminAvatar.textContent = "";

  showAlert("Avatar updated successfully!", "success");
}

// ========================================
// SAVE PROFILE (name, phone, password)
// ========================================
async function saveProfile(e) {
  e.preventDefault();

  const name = adminName.value.trim();
  const phone = adminPhone.value.trim();
  const password = adminPassword.value.trim();

  // update metadata
  const { error: metaErr } = await supabase.auth.updateUser({
    data: { name, phone }
  });

  if (metaErr) return showAlert("Failed to update profile", "error");

  // update password (optional)
  if (password) {
    const { error: passErr } = await supabase.auth.updateUser({ password });
    if (passErr) return showAlert("Password change failed", "error");
  }

  showAlert("Profile updated successfully!", "success");
}

// ========================================
// LOGOUT
// ========================================
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "./login.html";
}

// ========================================
// ALERT MESSAGES
// ========================================
function showAlert(msg, type = "info") {
  settingsAlert.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
      <span>${msg}</span>
      <button onclick="this.parentElement.remove()">×</button>
    </div>
  `;
}
