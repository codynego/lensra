
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import MagazinePhotographerSite from "./MagazinePhotographerSite";
import MinimalistPhotographerSite from "./MinimalistPhotographerSite";
import RetroPhotographerSite from "./RetroPhotographerSite";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://lvh.me:8000";

const ModernPhotographerWebsite = ({ subdomain }) => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation hook

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/studio/website/${subdomain}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch website data: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched website data:", data);
        // Set theme from API response, default to "magazine" if not provided
        setSelectedTheme(data.studio.theme || "magazine");
      } catch (err) {
        console.error("Error fetching theme:", err);
        // Redirect to 404 page on error instead of setting default theme
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchWebsiteData();
    } else {
      // Redirect to 404 if no subdomain is provided
      navigate("/404page");
    }
  }, [subdomain, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading theme...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate component based on the fetched theme
  if (selectedTheme === "minimalist") {
    return <MinimalistPhotographerSite subdomain={subdomain} />;
  } else if (selectedTheme === "magazine") {
    return <MagazinePhotographerSite subdomain={subdomain} />;
  } else if (selectedTheme === "modern") {
    return <RetroPhotographerSite subdomain={subdomain} />;
  }

  // Fallback to Retro theme if the theme is unrecognized
  return <RetroPhotographerSite subdomain={subdomain} />;
};

export default ModernPhotographerWebsite;
