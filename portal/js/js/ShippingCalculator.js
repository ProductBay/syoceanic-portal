// src/components/ShippingCalculator.jsx
import React, { useState } from "react";

// Sample shipping rates (you can replace with real API data later)
const shippingRates = {
  standard: 5,    // per kg
  express: 10,    // per kg
  overnight: 20,  // per kg
};

const ShippingCalculator = () => {
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [method, setMethod] = useState("standard");
  const [cost, setCost] = useState(null);

  const calculateShipping = () => {
    if (!weight || !length || !width || !height || !origin || !destination) {
      alert("Please fill out all fields!");
      return;
    }

    // Simple volumetric calculation (if needed)
    const volume = length * width * height;
    const volumetricWeight = volume / 5000; // industry standard divisor

    // Use the greater of actual weight or volumetric weight
    const chargeableWeight = Math.max(parseFloat(weight), volumetricWeight);

    // Get rate per kg
    const rate = shippingRates[method];

    const totalCost = chargeableWeight * rate;
    setCost(totalCost.toFixed(2));
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Shipping Calculator</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>Weight (kg):</label>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Length (cm):</label>
        <input type="number" value={length} onChange={e => setLength(e.target.value)} />
        <label>Width (cm):</label>
        <input type="number" value={width} onChange={e => setWidth(e.target.value)} />
        <label>Height (cm):</label>
        <input type="number" value={height} onChange={e => setHeight(e.target.value)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Origin:</label>
        <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Destination:</label>
        <input type="text" value={destination} onChange={e => setDestination(e.target.value)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Shipping Method:</label>
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option value="standard">Standard</option>
          <option value="express">Express</option>
          <option value="overnight">Overnight</option>
        </select>
      </div>

      <button onClick={calculateShipping} style={{ marginBottom: "1rem" }}>Calculate</button>

      {cost !== null && (
        <div>
          <h3>Total Shipping Cost: ${cost}</h3>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
// UPLOAD AVATAR
async function uploadAvatar(file) {
  if (!file) return null;  
    const fileExt = file.name.split(".").pop();
    const fileName = `avatar.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;  
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      showAlert("Failed to upload avatar", "error");
      return null;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    return publicUrl;   
}

// SAVE PROFILE (name, phone, password)
async function saveProfile(e) {
  e.preventDefault();
    const name = adminName.value.trim();
    const phone = adminPhone.value.trim();
    const password = adminPassword.value.trim();
    const avatarFile = adminAvatarInput.files[0];
    let avatarUrl = null;   
    if (avatarFile) {
      avatarUrl = await uploadAvatar(avatarFile);
      if (!avatarUrl) return; 
    }
    const { error: metaErr } = await supabase.auth.updateUser({
      data: { name, phone, ...(avatarUrl && { avatar_url: avatarUrl }) }
    }); 
    if (metaErr) {
      return showAlert("Failed to update profile", "error");
    }   
    if (password) {
      const { error: pwErr } = await supabase.auth.updateUser({ password });
        if (pwErr) {
            return showAlert("Failed to update password", "error");
        }
    }
    showAlert("Profile updated successfully!", "success");
}
// LOGOUT
async function logoutAdmin() {
  await supabase.auth.signOut();
  window.location.href = "./login.html";
}
// ALERT
function showAlert(message, type = "info") {
    adminAlert.innerHTML = `
    <div class="so-alert ${type === "error" ? "so-alert-error" : "so-alert-info"}">
        ${message}
    </div>
    `;
}
