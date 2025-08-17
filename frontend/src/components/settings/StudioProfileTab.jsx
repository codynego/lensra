import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudioProfileTab() {
  const [studioData, setStudioData] = useState({
    name: "",
    tagline: "",
    description: "",
    logo: null,
    cover_image: null,
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    twitter: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch studio data on mount
  useEffect(() => {
    axios
      .get("/api/studio/") // Replace with your API endpoint
      .then((res) => {
        setStudioData(res.data);
        if (res.data.logo) setLogoPreview(res.data.logo);
        if (res.data.cover_image) setCoverPreview(res.data.cover_image);
      })
      .catch((err) => console.error(err));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudioData({ ...studioData, [name]: value });
  };

  // Handle image uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setStudioData({ ...studioData, [name]: files[0] });
      if (name === "logo") setLogoPreview(URL.createObjectURL(files[0]));
      if (name === "cover_image") setCoverPreview(URL.createObjectURL(files[0]));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    for (const key in studioData) {
      if (studioData[key] !== null) {
        formData.append(key, studioData[key]);
      }
    }

    try {
      const res = await axios.put("/api/studio/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Profile updated successfully!");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
      setLoading(false);
    }
  };

  return (
    <div className="studio-profile-tab p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Studio Profile</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label>Studio Name</label>
          <input
            type="text"
            name="name"
            value={studioData.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Tagline</label>
          <input
            type="text"
            name="tagline"
            value={studioData.tagline}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Description / Bio</label>
          <textarea
            name="description"
            value={studioData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Branding */}
        <div>
          <label>Logo</label>
          <input type="file" name="logo" onChange={handleFileChange} />
          {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 h-20" />}
        </div>
        <div>
          <label>Cover Image</label>
          <input type="file" name="cover_image" onChange={handleFileChange} />
          {coverPreview && <img src={coverPreview} alt="Cover Preview" className="mt-2 h-40 w-full object-cover" />}
        </div>

        {/* Contact & Location */}
        <div>
          <label>Phone</label>
          <input type="text" name="phone" value={studioData.phone} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={studioData.email} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Address</label>
          <input type="text" name="address" value={studioData.address} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label>City</label>
            <input type="text" name="city" value={studioData.city} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="flex-1">
            <label>State</label>
            <input type="text" name="state" value={studioData.state} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label>Instagram</label>
          <input type="text" name="instagram" value={studioData.instagram} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Facebook</label>
          <input type="text" name="facebook" value={studioData.facebook} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>TikTok</label>
          <input type="text" name="tiktok" value={studioData.tiktok} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>X / Twitter</label>
          <input type="text" name="twitter" value={studioData.twitter} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
