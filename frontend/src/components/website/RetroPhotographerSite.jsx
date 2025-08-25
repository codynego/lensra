import React, { useEffect, useState } from "react";
import {
  Camera,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  Images,
  X,
  Send,
  Award,
  Instagram,
  Twitter,
  Facebook,
  ArrowRight,
  ZoomIn,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://lvh.me:8000";

const RetroPhotographerSite = ({ subdomain }) => {
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Booking states
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    notes: "",
    session_date: "",
    session_time: "",
  });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  // Message states
  const [messageForm, setMessageForm] = useState({
    name: "",
    email: "",
    content: "",
  });
  const [messageStatus, setMessageStatus] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll detection for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const normalizeImageUrl = (url) => {
    if (!url) return "/fallback-image.jpg";
    return url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/studio/website/${subdomain}/`);
        if (!response.ok) throw new Error("Failed to fetch website data");
        const data = await response.json();
        setWebsiteData(data);
      } catch (error) {
        console.error("Error fetching website data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchWebsiteData();
    }
  }, [subdomain]);

  // Handle booking form changes
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle booking submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPackage) {
      setBookingStatus({ type: "error", message: "Please select a package." });
      return;
    }

    setBookingLoading(true);
    setBookingStatus(null);

    try {
      // Format session_time to HH:MM:SS
      let sessionTime = bookingForm.session_time;
      if (sessionTime && !sessionTime.includes(":")) {
        sessionTime = `${sessionTime}:00`; // Append seconds if missing
      }

      const payload = {
        client: {
          first_name: bookingForm.first_name,
          last_name: bookingForm.last_name || "",
          email: bookingForm.email,
          phone: bookingForm.phone || "",
          notes: bookingForm.notes || "",
        },
        photographer: websiteData.photographer.id,
        service_package: selectedPackage.id,
        session_date: bookingForm.session_date,
        session_time: sessionTime,
        notes: bookingForm.notes || "",
        package_price: parseFloat(selectedPackage.price),
      };

      const response = await axios.post(`${API_BASE_URL}/api/bookings/bookings/guest/`, payload);
      setBookingStatus({ type: "success", message: "Booking created successfully!" });
      setBookingForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        notes: "",
        session_date: "",
        session_time: "",
      });
      setSelectedPackage(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(" ") ||
        "Failed to create booking. Please try again.";
      setBookingStatus({ type: "error", message: errorMessage });
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle message form changes
  const handleMessageFormChange = (e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle message submission
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    setMessageLoading(true);
    setMessageStatus(null);

    try {
      const payload = {
        name: messageForm.name,
        email: messageForm.email,
        content: messageForm.content,
        photographer_id: websiteData.photographer.id,
      };

      const response = await axios.post(`${API_BASE_URL}/api/messages/send/`, payload);
      setMessageStatus({ type: "success", message: "Message sent successfully!" });
      setMessageForm({ name: "", email: "", content: "" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(" ") ||
        "Failed to send message. Please try again.";
      setMessageStatus({ type: "error", message: errorMessage });
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#2A2A2A" }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-700 rounded-full animate-spin mx-auto mb-6">
              <div
                className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent rounded-full animate-spin"
                style={{ borderTopColor: websiteData?.studio?.primary_color || "#D97706" }}
              ></div>
            </div>
            <Camera
              className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ color: websiteData?.studio?.secondary_color || "#059669" }}
            />
          </div>
          <p
            className="text-xl font-light tracking-wider animate-typewriter"
            style={{ fontFamily: '"Courier New", monospace', color: websiteData?.studio?.secondary_color || "#059669" }}
          >
            Loading Retro Experience...
          </p>
        </div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#2A2A2A" }}>
        <div className="text-center">
          <Camera
            className="h-24 w-24 mx-auto mb-6"
            style={{ color: websiteData?.studio?.secondary_color || "#059669" }}
          />
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: '"Bebas Neue", sans-serif', color: websiteData?.studio?.primary_color || "#D97706" }}
          >
            Not Found
          </h2>
          <p style={{ color: websiteData?.studio?.secondary_color || "#059669", fontFamily: '"Inter", sans-serif' }}>
            Portfolio unavailable
          </p>
        </div>
      </div>
    );
  }

  const { photographer, studio, packages, photos } = websiteData;
  const primaryColor = studio?.primary_color || "#D97706"; // Retro amber
  const secondaryColor = studio?.secondary_color || "#059669"; // Retro teal

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: "#2A2A2A", fontFamily: '"Inter", sans-serif' }}>
      {/* Film grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Parallax background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-80 h-80 rounded-full blur-2xl transition-transform duration-1000"
          style={{
            background: `linear-gradient(to right, ${primaryColor}20, ${secondaryColor}20)`,
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
            left: "15%",
            top: "10%",
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-2xl transition-transform duration-1000"
          style={{
            background: `linear-gradient(to right, ${secondaryColor}20, ${primaryColor}20)`,
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
            right: "15%",
            bottom: "10%",
          }}
        />
      </div>

      {/* Sticky Retro Navigation */}
      <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${isScrolled ? "scale-95 shadow-lg" : ""}`}>
        <div className="bg-gray-900/80 backdrop-blur-md border rounded-xl px-3 py-2" style={{ borderColor: `${primaryColor}30` }}>
          <div className="flex items-center gap-2">
            {["home", "gallery", "services", "about", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden ${
                  activeSection === section ? "text-white" : "text-white/70 hover:text-white"
                }`}
                style={{
                  backgroundColor: activeSection === section ? primaryColor : "transparent",
                  fontFamily: '"Bebas Neue", sans-serif',
                }}
              >
                <span className="relative z-10">{section}</span>
                {activeSection === section && (
                  <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: `${secondaryColor}50` }}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeSection === "home" && (
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="text-center z-10 max-w-5xl mx-auto px-6">
            <div className="mb-10 relative">
              <div
                className="w-40 h-40 mx-auto rounded-lg overflow-hidden border-4 border-white/20 shadow-xl mb-8 group rotate-2 hover:rotate-0 transition-transform duration-500"
                style={{ borderColor: `${secondaryColor}30` }}
              >
                {photographer?.user?.profile_picture ? (
                  <img
                    src={normalizeImageUrl(photographer.user.profile_picture)}
                    alt="Profile"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ filter: "sepia(0.3)" }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Camera className="h-16 w-16 text-white/50" />
                  </div>
                )}
              </div>
              <div
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full border-4 animate-pulse"
                style={{ backgroundColor: secondaryColor, borderColor: primaryColor }}
              ></div>
            </div>

            <h1
              className="text-5xl md:text-7xl font-bold mb-6 tracking-wider animate-typewriter cursor"
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                color: primaryColor,
                textShadow: `2px 2px 4px ${secondaryColor}50`,
              }}
            >
              {studio?.name || "STUDIO"}
            </h1>

            <p
              className="text-lg md:text-xl font-light mb-12 leading-relaxed max-w-3xl mx-auto animate-fadeInUp animation-delay-200"
              style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
            >
              {studio?.tagline || "Capturing timeless moments with a vintage soul"}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fadeInUp animation-delay-400">
              <button
                onClick={() => setActiveSection("services")}
                className="group relative px-10 py-3 font-bold uppercase rounded-full transition-all duration-500 hover:scale-105 hover:shadow-lg overflow-hidden"
                style={{ backgroundColor: primaryColor, color: "#2A2A2A", fontFamily: '"Bebas Neue", sans-serif' }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to right, ${secondaryColor}30, transparent)` }}
                ></div>
                <span className="relative flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  Book Session
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>

              <button
                onClick={() => setActiveSection("gallery")}
                className="group px-10 py-3 border-2 font-bold uppercase rounded-full transition-all duration-500 hover:scale-105"
                style={{
                  borderColor: `${primaryColor}40`,
                  color: secondaryColor,
                  backgroundColor: "transparent",
                  fontFamily: '"Bebas Neue", sans-serif',
                }}
              >
                <span className="flex items-center gap-3">
                  <Images className="h-5 w-5" />
                  View Gallery
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>

          {/* Retro particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-retroFloat"
                style={{
                  backgroundColor: `${primaryColor}30`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${4 + Math.random() * 6}s`,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {activeSection === "gallery" && (
        <section className="min-h-screen py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-5xl md:text-6xl font-bold mb-6 tracking-wider animate-typewriter cursor"
                style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
              >
                GALLERY
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto animate-fadeInUp"
                style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
              >
                A timeless collection of captured memories
              </p>
            </div>

            <RetroGallery photos={photos} setSelectedPhoto={setSelectedPhoto} primaryColor={primaryColor} secondaryColor={secondaryColor} />
          </div>
        </section>
      )}

      {/* Services Section */}
      {activeSection === "services" && (
        <section className="min-h-screen py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-5xl md:text-6xl font-bold mb-6 tracking-wider animate-typewriter cursor"
                style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
              >
                PACKAGES
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto animate-fadeInUp"
                style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
              >
                Timeless photography packages tailored to your story
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Package Selection */}
              <div className="space-y-8">
                {packages?.length > 0 ? (
                  packages.map((pkg, index) => (
                    <div
                      key={pkg.id || index}
                      className={`group relative cursor-pointer rounded-lg shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500 ${
                        selectedPackage?.id === pkg.id ? "border-2" : ""
                      }`}
                      style={{
                        backgroundColor: "#FFF8E7",
                        padding: "12px",
                        borderColor: selectedPackage?.id === pkg.id ? primaryColor : "#FFF8E7",
                      }}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className="text-2xl font-bold uppercase"
                            style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {pkg.title}
                          </h3>
                          <div
                            className="text-xl font-bold"
                            style={{ color: secondaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            ${pkg.price}
                          </div>
                        </div>
                        <p
                          className="text-sm mb-4"
                          style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
                        >
                          {pkg.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" style={{ color: primaryColor }} />
                            <span style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
                              High-resolution digital gallery
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" style={{ color: primaryColor }} />
                            <span style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
                              Professional editing included
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" style={{ color: primaryColor }} />
                            <span style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
                              {pkg.duration || "60"} minute session
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center">
                    <p
                      style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
                    >
                      No packages available at the moment.
                    </p>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <div
                className="bg-white/10 backdrop-blur-md rounded-xl p-8 animate-slideInRight"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <h3
                  className="text-2xl font-bold uppercase mb-6"
                  style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  Book Your Session
                </h3>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <input
                    type="text"
                    name="first_name"
                    value={bookingForm.first_name}
                    onChange={handleBookingFormChange}
                    placeholder="First Name"
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={bookingForm.last_name}
                    onChange={handleBookingFormChange}
                    placeholder="Last Name (optional)"
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={bookingForm.email}
                    onChange={handleBookingFormChange}
                    placeholder="Your Email"
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={handleBookingFormChange}
                    placeholder="Your Phone (optional)"
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  />
                  <input
                    type="date"
                    name="session_date"
                    value={bookingForm.session_date}
                    onChange={handleBookingFormChange}
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                    required
                  />
                  <input
                    type="time"
                    name="session_time"
                    value={bookingForm.session_time}
                    onChange={handleBookingFormChange}
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                    required
                  />
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleBookingFormChange}
                    placeholder="Additional Notes (e.g., location, special requests)"
                    rows={4}
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300 resize-none"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  ></textarea>
                  {bookingStatus && (
                    <div
                      className={`p-4 rounded-lg ${
                        bookingStatus.type === "success" ? "bg-green-100/20" : "bg-red-100/20"
                      }`}
                    >
                      <p
                        style={{
                          color: bookingStatus.type === "success" ? secondaryColor : primaryColor,
                          fontFamily: '"Inter", sans-serif',
                        }}
                      >
                        {bookingStatus.message}
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-4 px-6 rounded-lg font-bold uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3"
                    style={{ backgroundColor: primaryColor, color: "#2A2A2A", fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white/50 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Calendar className="h-5 w-5" />
                        Book Now
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {activeSection === "about" && (
        <section className="min-h-screen py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2
                  className="text-5xl md:text-6xl font-bold tracking-wider mb-8 animate-typewriter cursor"
                  style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  ABOUT
                </h2>
                <p
                  className="text-lg leading-relaxed animate-fadeInUp"
                  style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
                >
                  {studio?.about || "Crafting stories through the lens, blending vintage charm with modern artistry."}
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 animate-slideInLeft"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <Award className="h-8 w-8 mb-3" style={{ color: secondaryColor }} />
                    <div
                      className="text-2xl font-bold"
                      style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {photographer?.experience_years || "8"}+
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
                    >
                      Years Experience
                    </div>
                  </div>
                  <div
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 animate-slideInRight"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <Star className="h-8 w-8 mb-3" style={{ color: secondaryColor }} />
                    <div
                      className="text-2xl font-bold"
                      style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      500+
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
                    >
                      Happy Clients
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative group">
                  {photographer?.profile_image ? (
                    <img
                      src={normalizeImageUrl(photographer.profile_image)}
                      alt="About"
                      className="w-full h-96 object-cover rounded-lg shadow-xl group-hover:scale-105 transition-transform duration-700"
                      style={{ filter: "sepia(0.3)" }}
                    />
                  ) : (
                    <div
                      className="w-full h-96 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                    >
                      <Camera className="h-24 w-24 text-white/30" />
                    </div>
                  )}
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{ background: `linear-gradient(to top, ${primaryColor}40, transparent)` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {activeSection === "contact" && (
        <section className="min-h-screen py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-5xl md:text-6xl font-bold tracking-wider mb-6 animate-typewriter cursor"
                style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
              >
                CONTACT
              </h2>
              <p
                className="text-lg animate-fadeInUp"
                style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}
              >
                Let's create timeless memories together
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-6">
                  {photographer?.user?.email && (
                    <div
                      className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 animate-slideInLeft"
                      style={{ borderColor: `${primaryColor}20` }}
                    >
                      <Mail className="h-6 w-6" style={{ color: secondaryColor }} />
                      <span style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
                        {photographer.user.email}
                      </span>
                    </div>
                  )}
                  {photographer?.phone && (
                    <div
                      className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 animate-slideInLeft"
                      style={{ borderColor: `${primaryColor}20` }}
                    >
                      <Phone className="h-6 w-6" style={{ color: secondaryColor }} />
                      <span style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
                        {photographer.phone}
                      </span>
                    </div>
                  )}
                  {studio?.location && (
                    <div
                      className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 animate-slideInLeft"
                      style={{ borderColor: `${primaryColor}20` }}
                    >
                      <MapPin className="h-6 w-6" style={{ color: secondaryColor }} />
                      <span style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
                        {studio.location}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 animate-slideInLeft">
                  <button
                    className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <Instagram className="h-5 w-5" style={{ color: secondaryColor }} />
                  </button>
                  <button
                    className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <Twitter className="h-5 w-5" style={{ color: secondaryColor }} />
                  </button>
                  <button
                    className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <Facebook className="h-5 w-5" style={{ color: secondaryColor }} />
                  </button>
                </div>
              </div>

              <div
                className="bg-white/10 backdrop-blur-md rounded-xl p-8 animate-slideInRight"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <h3
                  className="text-2xl font-bold uppercase mb-6"
                  style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  Send a Message
                </h3>
                <form onSubmit={handleMessageSubmit} className="space-y-6">
                  <input
                    type="text"
                    name="name"
                    value={messageForm.name}
                    onChange={handleMessageFormChange}
                    placeholder="Your Name"
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={messageForm.email}
                    onChange={handleMessageFormChange}
                    placeholder="Your Email"
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                    required
                  />
                  <textarea
                    name="content"
                    value={messageForm.content}
                    onChange={handleMessageFormChange}
                    placeholder="Tell me about your vision..."
                    rows={5}
                    className="w-full px-6 py-4 bg-white/10 border rounded-lg text-white focus:outline-none transition-all duration-300 resize-none"
                    style={{
                      borderColor: `${primaryColor}20`,
                      fontFamily: '"Inter", sans-serif',
                    }}
                    required
                  ></textarea>
                  {messageStatus && (
                    <div
                      className={`p-4 rounded-lg ${
                        messageStatus.type === "success" ? "bg-green-100/20" : "bg-red-100/20"
                      }`}
                    >
                      <p
                        style={{
                          color: messageStatus.type === "success" ? secondaryColor : primaryColor,
                          fontFamily: '"Inter", sans-serif',
                        }}
                      >
                        {messageStatus.message}
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={messageLoading}
                    className="w-full py-4 px-6 rounded-lg font-bold uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3"
                    style={{ backgroundColor: primaryColor, color: "#2A2A2A", fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {messageLoading ? (
                      <div className="w-5 h-5 border-2 border-white/50 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-5xl max-h-full relative rotate-2 hover:rotate-0 transition-transform duration-500"
          >
            <img
              src={normalizeImageUrl(selectedPhoto.image || selectedPhoto.thumbnail)}
              alt={selectedPhoto.title || "Photo"}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-4 border-white/20"
              style={{ borderColor: `${primaryColor}30`, filter: "sepia(0.3)" }}
            />
            <button
              className="absolute top-4 right-4 rounded-full p-3 hover:bg-black/70 transition-all duration-200"
              style={{ backgroundColor: `${secondaryColor}50`, color: primaryColor }}
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        @keyframes cursorBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @keyframes retroFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(90deg);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 2s steps(40) 1s 1 normal both, cursorBlink 0.75s step-end infinite;
        }
        .cursor::after {
          content: "|";
          display: inline-block;
          margin-left: 0.1em;
          animation: cursorBlink 0.75s step-end infinite;
        }
        .animate-retroFloat {
          animation: retroFloat 5s ease-in-out infinite;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        input::placeholder,
        textarea::placeholder {
          color: ${secondaryColor}50;
        }
        input:focus,
        textarea:focus {
          border-color: ${primaryColor}40;
        }
      `}</style>
    </div>
  );
};


// Retro Gallery Component
const RetroGallery = ({ photos, setSelectedPhoto, primaryColor, secondaryColor }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const normalizeImageUrl = (url) => {
    if (!url) return "/fallback-image.jpg";
    return url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-24">
        <Camera className="h-24 w-24 mx-auto mb-6" style={{ color: `${secondaryColor}20` }} />
        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
        >
          Gallery Coming Soon
        </h3>
        <p style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
          Timeless captures in the making
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {photos.map((photo, index) => (
        <div
          key={photo.id || index}
          className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setSelectedPhoto(photo)}
          style={{ backgroundColor: "#FFF8E7", padding: "12px" }} // Polaroid-style frame
        >
          <img
            src={normalizeImageUrl(photo.image || photo.thumbnail)}
            alt={photo.title || `Photo ${index + 1}`}
            className="w-full h-64 object-cover rounded transition-transform duration-700 group-hover:scale-105"
            style={{ filter: "sepia(0.3)" }}
          />

          <div
            className={`absolute inset-0 transition-all duration-500 ${
              hoveredIndex === index ? "bg-black/30" : "bg-transparent"
            }`}
          >
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            >
              <div className="rounded-full p-3" style={{ backgroundColor: `${primaryColor}20`, backdropFilter: "blur(8px)" }}>
                <ZoomIn className="h-7 w-7" style={{ color: secondaryColor }} />
              </div>
            </div>
          </div>

          <div
            className={`absolute bottom-4 left-4 right-4 p-4 transition-all duration-300 ${
              hoveredIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="bg-white/80 rounded-lg p-3" style={{ borderColor: `${primaryColor}20` }}>
              <h4
                className="font-bold text-sm uppercase"
                style={{ color: primaryColor, fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {photo.title || `Untitled ${index + 1}`}
              </h4>
              <p className="text-xs" style={{ color: `${secondaryColor}cc`, fontFamily: '"Inter", sans-serif' }}>
                {photo.category || "Photography"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RetroPhotographerSite;