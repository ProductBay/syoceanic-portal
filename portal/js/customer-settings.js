import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// supabase
const supabase = createClient(
  "https://sbzqprzxzbatnoastdtb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNienFwcnp4emJhdG5vYXN0ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTcyMzIsImV4cCI6MjA4MDA5MzIzMn0.spP6rJJcFbpiQySrmcbyVzmNOhyCQmWaHZPVyvVhqU4"
);

// elements
const settingsAlert = document.getElementById("settingsAlert");

const userProfileBtn = document.getElementById("userProfileBtn");
const customerDropdown = document.getElementById("customerDropdown");

const logoutBtn = document.getElementById("logoutBtn");
const logoutDropdownBtn = document.getElementById("logoutDropdownBtn");

const customerEmailLabel = document.getElementById("customerEmailLabel");
const customerDropdownEmail = document.getElementById("customerDropdownEmail");
const customerAvatar = document.getElementById("customerAvatar");

const avatarPreview = document.getElementById("avatarPreview");
const uploadAvatarBtn = document.getElementById("uploadAvatarBtn");
const avatarFile = document.getElementById("avatarFile");

const settingsForm = document.getElementById("settingsForm");
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const customerPassword = document.getElementById("customerPassword");

// INIT
document.addEventListener("DOMContentLoaded", async () => {
  await protectPage();
  await loadCustomerProfile();

  // avatar upload
  uploadAvatarBtn.addEventListener("click", () => avatarFile.click());
  avatarFile.addEventListener("change", async () => {
    const file = avatarFile.files[0];
    if (file) await uploadAvatar(file);
  });

  // profile form
  settingsForm.addEventListener("submit", saveProfile);

  // dropdown behavior
  userProfileBtn.addEventListener("click", () => {
    customerDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!userProfileBtn.contains(e.target) && !customerDropdown.contains(e.target)) {
      customerDropdown.classList.add("hidden");
    }
  });

  logoutBtn.addEventListener("click", logout);
  logoutDropdownBtn.addEventListener("click", logout);
});

// AUTH GUARD
async function protectPage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) window.location.href = "./login.html";
}

// LOAD PROFILE
async function loadCustomerProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  customerEmailLabel.textContent = user.email;
  customerDropdownEmail.textContent = user.email;

  customerName.value = user.user_metadata.name || "";
  customerPhone.value = user.user_metadata.phone || "";

  if (user.user_metadata.avatar_url) {
    const url = user.user_metadata.avatar_url;

    customerAvatar.style.backgroundImage = `url(${url})`;
    customerAvatar.style.backgroundSize = "cover";
    customerAvatar.style.backgroundPosition = "center";
    customerAvatar.textContent = "";

    avatarPreview.src = url;
  } else {
    customerAvatar.textContent = user.email.charAt(0).toUpperCase();
    avatarPreview.src = "../assets/logo/logo-syoceanic.svg";
  }
}

// UPLOAD AVATAR
async function uploadAvatar(file) {
  const { data: { user } } = await supabase.auth.getUser();

  const ext = file.name.split(".").pop();
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadErr) return showAlert("Failed to upload avatar", "error");

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: metaErr } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  if (metaErr) return showAlert("Uploaded but failed to update account", "error");

  avatarPreview.src = publicUrl;
  customerAvatar.style.backgroundImage = `url(${publicUrl})`;
  customerAvatar.textContent = "";

  showAlert("Avatar updated!", "success");
}

// SAVE PROFILE
async function saveProfile(e) {
  e.preventDefault();

  const name = customerName.value.trim();
  const phone = customerPhone.value.trim();
  const pw = customerPassword.value.trim();

  const { error: metaErr } = await supabase.auth.updateUser({
    data: { name, phone }
  });

  if (metaErr) return showAlert("Failed to update profile", "error");

  if (pw) {
    const { error: pwErr } = await supabase.auth.updateUser({ password: pw });
    if (pwErr) return showAlert("Failed to update password", "error");
  }

  showAlert("Profile updated successfully!", "success");
}

// LOGOUT
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "./login.html";
}

// ALERT
function showAlert(msg, type = "info") {
  settingsAlert.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
      <span>${msg}</span>
      <button onclick="this.parentElement.remove()">×</button>
    </div>
  `;
}
    