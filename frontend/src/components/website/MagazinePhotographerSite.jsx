import React, { useEffect, useState } from "react";
import {
  Camera,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  Images,
  X,
  Send,
  Award,
  Heart,
  Instagram,
  Twitter,
  Facebook,
  ArrowRight,
  ZoomIn,
  Menu,
  Quote,
  CheckCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://lvh.me:8000";

// Theme: Vibrant Magazine-Style Layout
const MagazinePhotographerSite = ({ subdomain }) => {
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
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

  const testimonials = [
    { text: "Absolutely stunning work! Every photo was a masterpiece.", author: "Sarah Johnson", rating: 5 },
    { text: "Professional, creative, and captured our day perfectly.", author: "Mike & Emma", rating: 5 },
    { text: "Exceeded all expectations. Highly recommended!", author: "David Chen", rating: 5 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
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

  // Client-side validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFutureDate = (date, time) => {
    if (!date || !time) return false;
    const sessionDateTime = new Date(`${date}T${time}`);
    return sessionDateTime > new Date();
  };

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
    if (!isValidEmail(bookingForm.email)) {
      setBookingStatus({ type: "error", message: "Invalid email format." });
      return;
    }
    if (!isFutureDate(bookingForm.session_date, bookingForm.session_time)) {
      setBookingStatus({ type: "error", message: "Session date and time must be in the future." });
      return;
    }

    setBookingLoading(true);
    setBookingStatus(null);

    try {
      // Format session_time to HH:MM:SS
      let sessionTime = bookingForm.session_time;
      if (sessionTime && sessionTime.length === 5) {
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

      console.log("Booking payload:", payload); // Debugging

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
    if (!isValidEmail(messageForm.email)) {
      setMessageStatus({ type: "error", message: "Invalid email format." });
      return;
    }

    setMessageLoading(true);
    setMessageStatus(null);

    try {
      const payload = {
        name: messageForm.name,
        email: messageForm.email,
        content: messageForm.content,
        photographer_id: websiteData.photographer.id,
      };

      const response = await axios.post(`${API_BASE_URL}/api/messages/messages/send/`, payload);
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-pink-100 rounded-full animate-spin mx-auto mb-8">
              <div className="absolute top-0 left-0 w-24 h-24 border-8 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
            </div>
            <Sparkles className="h-10 w-10 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-700 text-2xl font-medium">Crafting Your Experience...</p>
        </div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-32 w-32 text-gray-300 mx-auto mb-8" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Portfolio Unavailable</h2>
          <p className="text-gray-600 text-lg">Please check back later</p>
        </div>
      </div>
    );
  }

  const { photographer, studio, packages, photos } = websiteData;
  const primaryColor = studio?.primary_color || "#EC4899";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Dynamic Header */}
      <header className="relative">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {studio?.name || "PhotoStudio"}
                  </h1>
                  <p className="text-gray-500 text-sm">Professional Photography</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-2">
                {["home", "gallery", "services", "about", "contact"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 capitalize relative overflow-hidden ${activeTab === tab ? "text-white shadow-lg scale-105" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    style={{
                      backgroundColor: activeTab === tab ? primaryColor : "transparent",
                    }}
                  >
                    <span className="relative z-10">{tab}</span>
                    {activeTab === tab && (
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse"></div>
                    )}
                  </button>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white shadow-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-gray-100 animate-slideDown">
            <div className="px-6 py-4 space-y-2">
              {["home", "gallery", "services", "about", "contact"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-6 py-4 rounded-2xl font-medium transition-all duration-300 capitalize ${activeTab === tab ? "text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  style={{
                    backgroundColor: activeTab === tab ? primaryColor : "transparent",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Magazine Layout */}
      {activeTab === "home" && (
        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
              <div className="space-y-8 animate-slideInLeft">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl">
                      {photographer?.user?.profile_picture ? (
                        <img
                          src={normalizeImageUrl(photographer.user.profile_picture)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-medium">PHOTOGRAPHER</p>
                      <h3 className="text-xl font-bold text-gray-900">
                        {photographer?.user?.first_name} {photographer?.user?.last_name}
                      </h3>
                    </div>
                  </div>

                  <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                    CAPTURE
                    <br />
                    <span className="text-4xl md:text-5xl font-light text-gray-800">the moment</span>
                  </h1>

                  <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                    {studio?.tagline || "Creating visual stories that speak to the heart. Every frame, every emotion, every memory crafted with passion."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {photographer?.specializations?.map((spec, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-sm font-medium rounded-full border border-pink-200 hover:shadow-md transition-all duration-300 hover:scale-105"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveTab("services")}
                    className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      Book Now
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-pink-400 hover:text-pink-600 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      <Images className="h-5 w-5" />
                      View Work
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-6 pt-8">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 border-2 border-white shadow-lg"
                        ></div>
                      ))}
                    </div>
                    <span className="text-gray-700 font-medium ml-2">500+ Happy Clients</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-gray-600 ml-2">5.0 Rating</span>
                  </div>
                </div>
              </div>

              <div className="relative animate-slideInRight">
                <div className="relative">
                  {studio?.cover_photo ? (
                    <div className="relative">
                      <img
                        src={normalizeImageUrl(studio.cover_photo)}
                        alt="Hero"
                        className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
                    </div>
                  ) : (
                    <div className="w-full h-[600px] bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-3xl shadow-2xl flex items-center justify-center">
                      <Camera className="h-32 w-32 text-white/50" />
                    </div>
                  )}

                  {/* Floating elements */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl rotate-12 shadow-xl animate-pulse"></div>
                  <div
                    className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-xl animate-bounce"
                    style={{ animationDuration: "3s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Carousel */}
          <div className="bg-white/60 backdrop-blur-lg border-t border-gray-200 py-16">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="mb-8">
                <Quote className="h-12 w-12 text-pink-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What Clients Say</h3>
              </div>

              <div className="relative">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                  >
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-8">
                        <blockquote className="text-xl md:text-2xl text-gray-700 font-light italic mb-6 leading-relaxed">
                          "{testimonial.text}"
                        </blockquote>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <cite className="text-pink-600 font-semibold text-lg">— {testimonial.author}</cite>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? "bg-pink-500 scale-125" : "bg-gray-300"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery with Magazine Layout */}
      {activeTab === "gallery" && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                PORTFOLIO
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                A curated collection showcasing the art of storytelling through photography
              </p>
            </div>

            <MagazineGallery photos={photos} setSelectedPhoto={setSelectedPhoto} primaryColor={primaryColor} />
          </div>
        </section>
      )}

      {/* Services with Card Layout */}
      {activeTab === "services" && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                PACKAGES
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto">
                Tailored photography experiences designed to capture your unique story
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Package Selection */}
              <div className="space-y-8">
                {packages?.length > 0 ? (
                  packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden border border-gray-100 ${selectedPackage?.id === pkg.id ? "border-2 border-pink-500" : ""
                        }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-gray-900">${pkg.price}</div>
                            <div className="text-gray-500 text-sm">starting from</div>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{pkg.title}</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">{pkg.description}</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>High-resolution digital gallery</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Professional editing included</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>{pkg.duration || "60"} minute session</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-lg">No packages available at the moment.</p>
                )}
              </div>

              {/* Booking Form */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Book Your Session</h3>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <input
                    type="text"
                    name="first_name"
                    value={bookingForm.first_name}
                    onChange={handleBookingFormChange}
                    placeholder="First Name"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={bookingForm.last_name}
                    onChange={handleBookingFormChange}
                    placeholder="Last Name (optional)"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                  />
                  <input
                    type="email"
                    name="email"
                    value={bookingForm.email}
                    onChange={handleBookingFormChange}
                    placeholder="Your Email"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={handleBookingFormChange}
                    placeholder="Your Phone (optional)"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                  />
                  <input
                    type="date"
                    name="session_date"
                    value={bookingForm.session_date}
                    onChange={handleBookingFormChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                    required
                  />
                  <input
                    type="time"
                    name="session_time"
                    value={bookingForm.session_time}
                    onChange={handleBookingFormChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                    required
                  />
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleBookingFormChange}
                    placeholder="Additional Notes (e.g., location, special requests)"
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 resize-none text-gray-900"
                  ></textarea>
                  {bookingStatus && (
                    <div
                      className={`p-4 rounded-2xl ${bookingStatus.type === "success" ? "bg-green-100" : "bg-red-100"
                        }`}
                    >
                      <p className={bookingStatus.type === "success" ? "text-green-700" : "text-red-700"}>
                        {bookingStatus.message}
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
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

      {/* About Section with Split Layout */}
      {activeTab === "about" && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative animate-slideInLeft">
                <div className="relative group">
                  {photographer?.profile_image ? (
                    <img
                      src={normalizeImageUrl(photographer.profile_image)}
                      alt="About"
                      className="w-full h-[500px] object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-[500px] bg-gradient-to-br from-pink-400 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center">
                      <Camera className="h-24 w-24 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-3xl"></div>
                </div>

                {/* Floating stats */}
                <div className="absolute -bottom-8 -right-8 bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                  <div className="text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {photographer?.experience_years || "8"}+
                    </div>
                    <div className="text-gray-600 text-sm font-medium">Years Experience</div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 animate-slideInRight">
                <div>
                  <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                    ABOUT ME
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-8">
                    {studio?.about ||
                      "Photography isn't just my profession—it's my passion. I believe every person has a unique story to tell, and I'm here to help you tell yours through stunning visual narratives that capture the essence of who you are."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                    <Award className="h-10 w-10 text-pink-500 mb-4" />
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-gray-600">Sessions Completed</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <Heart className="h-10 w-10 text-blue-500 mb-4" />
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-gray-600">Client Satisfaction</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Specializations</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(photographer?.specializations || ["Portrait", "Wedding", "Event", "Lifestyle"]).map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md border border-gray-100"
                      >
                        <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                        <span className="text-gray-700 font-medium">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {activeTab === "contact" && (
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                LET'S CONNECT
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto">
                Ready to create something amazing together? I'd love to hear about your vision
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <MessageCircle className="h-6 w-6 text-pink-500" />
                    Get In Touch
                  </h3>
                  <form onSubmit={handleMessageSubmit} className="space-y-6">
                    <input
                      type="text"
                      name="name"
                      value={messageForm.name}
                      onChange={handleMessageFormChange}
                      placeholder="Your Name"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={messageForm.email}
                      onChange={handleMessageFormChange}
                      placeholder="Your Email"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-900"
                      required
                    />
                    <textarea
                      name="content"
                      value={messageForm.content}
                      onChange={handleMessageFormChange}
                      placeholder="Tell me about your vision and ideas..."
                      rows={4}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 transition-all duration-300 resize-none text-gray-900"
                      required
                    ></textarea>
                    {messageStatus && (
                      <div
                        className={`p-4 rounded-2xl ${messageStatus.type === "success" ? "bg-green-100" : "bg-red-100"
                          }`}
                      >
                        <p className={messageStatus.type === "success" ? "text-green-700" : "text-red-700"}>
                          {messageStatus.message}
                        </p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={messageLoading}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
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

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Details</h3>
                  <div className="space-y-6">
                    {photographer?.user?.email && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Email</div>
                          <div className="text-gray-900 font-medium">{photographer.user.email}</div>
                        </div>
                      </div>
                    )}
                    {photographer?.phone && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Phone</div>
                          <div className="text-gray-900 font-medium">{photographer.phone}</div>
                        </div>
                      </div>
                    )}
                    {studio?.location && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Location</div>
                          <div className="text-gray-900 font-medium">{studio.location}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
                  <h3 className="text-2xl font-bold mb-4">Ready to Book?</h3>
                  <p className="text-white/90 mb-6">Schedule a consultation call to discuss your photography needs</p>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="w-full bg-white text-pink-600 py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Calendar className="h-5 w-5" />
                      Schedule Consultation
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-6xl max-h-full relative">
            <img
              src={normalizeImageUrl(selectedPhoto.image || selectedPhoto.thumbnail)}
              alt={selectedPhoto.title || "Photo"}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200">
                <Share2 className="h-5 w-5" />
              </button>
              <button
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

// Enhanced Magazine Gallery Component
const MagazineGallery = ({ photos, setSelectedPhoto, primaryColor }) => {
  const [filter, setFilter] = useState("all");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const normalizeImageUrl = (url) => {
    if (!url) return "/fallback-image.jpg";
    return url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const categories = ["all", "portrait", "wedding", "event", "lifestyle"];
  const filteredPhotos = filter === "all" ? photos : photos.filter((photo) => photo.category?.toLowerCase() === filter);

  if (!filteredPhotos || filteredPhotos.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="relative mb-8">
          <Camera className="h-32 w-32 text-gray-300 mx-auto" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20 animate-ping"></div>
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Gallery Coming Soon</h3>
        <p className="text-gray-600 text-lg">Amazing photos are being curated for you</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 capitalize text-lg ${filter === category ? "text-white shadow-xl scale-105" : "text-gray-600 bg-white hover:bg-gray-50 hover:shadow-md border-2 border-gray-200"
              }`}
            style={{
              backgroundColor: filter === category ? primaryColor : undefined,
              borderColor: filter === category ? primaryColor : undefined,
            }}
          >
            {category === "all" ? "All Work" : category}
          </button>
        ))}
      </div>

      {/* Magazine-style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPhotos.map((photo, index) => {
          const isLarge = index % 7 === 0;
          const isTall = index % 5 === 0 && index % 7 !== 0;
          const isWide = index % 6 === 0 && index % 7 !== 0;

          return (
            <div
              key={photo.id || index}
              className={`group relative cursor-pointer overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isLarge ? "md:col-span-2 md:row-span-2" : isTall ? "md:row-span-2" : isWide ? "md:col-span-2" : ""
                }`}
              style={{
                minHeight: isLarge ? "400px" : isTall ? "350px" : "250px",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={normalizeImageUrl(photo.image || photo.thumbnail)}
                alt={photo.title || `Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${hoveredIndex === index ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent" : "bg-transparent"
                  }`}
              >
                {/* Heart icon */}
                <div
                  className={`absolute top-6 right-6 transition-all duration-300 ${hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    }`}
                >
                  <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/80 transition-all duration-300 group/heart">
                    <Heart className="h-6 w-6 text-white group-hover/heart:fill-white transition-all duration-200" />
                  </button>
                </div>

                {/* Photo info */}
                <div
                  className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 ${hoveredIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <h4 className="text-white font-bold text-lg mb-2">{photo.title || `Untitled ${index + 1}`}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-white/80 text-sm flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {photo.category || "Photography"}
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200">
                          <Share2 className="h-4 w-4 text-white" />
                        </button>
                        <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200">
                          <ZoomIn className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category badge */}
                <div
                  className={`absolute top-6 left-6 transition-all duration-300 ${hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    }`}
                >
                  <span
                    className="px-4 py-2 text-white text-xs font-semibold rounded-full backdrop-blur-sm border border-white/20"
                    style={{ backgroundColor: `${primaryColor}60` }}
                  >
                    {photo.category || "Gallery"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      <div className="text-center pt-12">
        <button className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center gap-3">
            <Sparkles className="h-5 w-5" />
            Load More Masterpieces
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default MagazinePhotographerSite;