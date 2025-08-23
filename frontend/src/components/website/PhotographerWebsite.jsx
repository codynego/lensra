import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  Camera, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Calendar, 
  Eye, 
  Heart,
  MessageCircle,
  Home,
  User,
  Briefcase,
  Images,
  X,
  ChevronDown,
  Send,
  Award,
  Sparkles
} from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://lvh.me:8000";

const PhotographerWebsite = ({ subdomain }) => {
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Enhanced scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to normalize image URLs
  const normalizeImageUrl = (url) => {
    if (!url) return '/fallback-image.jpg';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/studio/website/${subdomain}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch website data");
        }
        const data = await response.json();
        console.log("Website data fetched:", data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-6">
              <div className="absolute top-0 left-0 h-16 w-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 text-lg">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Camera className="h-20 w-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Website Not Found</h2>
          <p className="text-gray-600">The photographer's website could not be loaded.</p>
        </div>
      </div>
    );
  }

  const { photographer, studio, packages, photos } = websiteData;

  const navigationItems = [
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'about', label: 'About', icon: User },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'home', label: 'Contact', icon: Phone }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'gallery':
        return <GalleryContent 
          initialPhotos={photos} 
          setSelectedPhoto={setSelectedPhoto} 
          primaryColor={studio?.primary_color} 
          secondaryColor={studio?.secondary_color} 
          subdomain={subdomain}
        />;
      case 'about':
        return <AboutContent photographer={photographer} studio={studio} />;
      case 'services':
        return <ServicesContent packages={packages} setSelectedPackage={setSelectedPackage} primaryColor={studio?.primary_color} secondaryColor={studio?.secondary_color} />;
      case 'home':
        return <ContactContent photographer={photographer} studio={studio} primaryColor={studio?.primary_color} secondaryColor={studio?.secondary_color} />;
      default:
        return <GalleryContent 
          initialPhotos={photos} 
          setSelectedPhoto={setSelectedPhoto} 
          primaryColor={studio?.primary_color} 
          secondaryColor={studio?.secondary_color} 
          subdomain={subdomain}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Cover Photo with Overlay */}
        <div className="relative h-[70vh] lg:h-[80vh]">
          {studio?.cover_photo ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${normalizeImageUrl(studio.cover_photo)})` }}
            />
          ) : (
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${studio?.primary_color || '#667eea'} 0%, ${studio?.secondary_color || '#764ba2'} 100%)` }}
            />
          )}
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50"></div>
          
          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        </div>

        {/* Enhanced Profile Section */}
        <div className="relative bg-white/95 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              
              {/* Profile Picture with enhanced design */}
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="relative group mx-auto lg:mx-0">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-r from-white to-gray-50 rounded-full p-1.5 shadow-2xl transform transition-all duration-500 group-hover:scale-105">
                    <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-white/50">
                      {photographer?.user?.profile_picture ? (
                        <img 
                          src={normalizeImageUrl(photographer.user.profile_picture)} 
                          alt="Profile"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Camera className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                </div>

                {/* Profile Info */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                    {studio.name || "Photographer"}
                  </h1>
                  <p className="text-gray-600 text-lg mb-4 max-w-md">
                    {studio?.tagline || "Capturing life's precious moments with artistic vision"}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {photographer?.specializations?.map((spec, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-2 text-sm font-medium rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
                        style={{ 
                          backgroundColor: `${studio?.primary_color || '#3B82F6'}20`,
                          color: studio?.primary_color || '#1E40AF',
                          border: `1px solid ${studio?.primary_color || '#3B82F6'}30`
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center lg:justify-end">
                <button 
                  className="group relative px-8 py-4 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden"
                  style={{ backgroundColor: studio?.primary_color || '#3B82F6' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Book Session
                  </span>
                </button>
                <button 
                  className="px-8 py-4 text-gray-700 font-semibold rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="h-5 w-5" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' : 'bg-white/80 backdrop-blur-sm'}`}>
          <div className="max-w-7xl mx-auto px-6">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex justify-center">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-3 px-8 py-6 font-semibold transition-all duration-300 group ${
                      activeTab === item.id ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={{
                      backgroundColor: activeTab === item.id ? studio?.primary_color || '#3B82F6' : 'transparent',
                    }}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>{item.label}</span>
                    {activeTab === item.id && (
                      <div 
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'white' }}
                      ></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden py-4">
              <div className="flex overflow-x-auto scrollbar-hide gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-6 py-3 font-medium rounded-2xl whitespace-nowrap transition-all duration-300 ${
                        activeTab === item.id ? 'text-white shadow-lg' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: activeTab === item.id ? studio?.primary_color || '#3B82F6' : undefined,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with enhanced spacing */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>

      {/* Enhanced Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl z-50 group"
        style={{ backgroundColor: studio?.primary_color || '#3B82F6' }}
      >
        <MessageCircle className="h-6 w-6 mx-auto transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </button>

      {/* Enhanced Chat Widget */}
      {showChat && (
        <div className="fixed bottom-28 right-8 bg-white rounded-3xl shadow-2xl border border-gray-100 w-80 sm:w-96 h-[28rem] z-50 animate-slideUp overflow-hidden">
          <div 
            className="flex items-center justify-between p-6 text-white"
            style={{ backgroundColor: studio?.primary_color || '#3B82F6' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">Let's Chat!</h3>
            </div>
            <button 
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 flex-1">
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                👋 Hi! I'm here to help you capture your special moments. What kind of photography session are you looking for?
              </p>
            </div>
          </div>
          <div className="p-6 border-t border-gray-100">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button 
                className="p-3 text-white rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: studio?.primary_color || '#3B82F6' }}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-5xl max-h-full relative animate-zoomIn">
            <img 
              src={normalizeImageUrl(selectedPhoto.image || selectedPhoto.thumbnail)} 
              alt={selectedPhoto.title || "Selected Photo"}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-all duration-200 hover:scale-110"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Package Modal */}
      {selectedPackage && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPackage(null)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedPackage.title}</h3>
              <button 
                onClick={() => setSelectedPackage(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{selectedPackage.description}</p>
            <div className="text-4xl font-bold mb-8 text-center" style={{ color: studio?.primary_color || '#16A34A' }}>
              ${selectedPackage.price}
            </div>
            <div className="space-y-4">
              <button 
                className="w-full text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: studio?.primary_color || '#3B82F6' }}
              >
                Book This Package
              </button>
              <button 
                className="w-full text-gray-600 py-4 px-6 rounded-2xl font-medium bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                onClick={() => setSelectedPackage(null)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

// Enhanced Contact Content Component
const ContactContent = ({ photographer, studio, primaryColor, secondaryColor }) => (
  <div className="space-y-8">
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Create Magic Together</h2>
        <p className="text-gray-600 text-lg">Ready to capture your special moments? Get in touch!</p>
      </div>
      
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
              <Phone className="h-4 w-4" style={{ color: primaryColor }} />
            </div>
            Contact Information
          </h3>
          <div className="space-y-6">
            {photographer?.user?.email && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <Mail className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <span className="text-gray-700 font-medium">{photographer.user.email}</span>
              </div>
            )}
            {photographer?.phone && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <Phone className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <span className="text-gray-700 font-medium">{photographer.phone}</span>
              </div>
            )}
            {studio?.location && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <span className="text-gray-700 font-medium">{studio.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
              <MessageCircle className="h-4 w-4" style={{ color: primaryColor }} />
            </div>
            Send a Message
          </h3>
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
            <textarea
              placeholder="Tell me about your photography needs..."
              rows={5}
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
            ></textarea>
            <button
              className="w-full text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
              style={{ backgroundColor: primaryColor || '#3B82F6' }}
            >
              <Send className="h-5 w-5" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced About Content Component
const AboutContent = ({ photographer, studio }) => {
  const normalizeImageUrl = (url) => {
    if (!url) return '/fallback-image.jpg';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About Me</h2>
          <p className="text-gray-600 text-lg">Passion meets artistry in every shot</p>
        </div>
        
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed text-lg">
              {studio?.about || "I'm a passionate photographer with a love for capturing life's most precious moments. With years of experience behind the lens, I specialize in creating stunning visual stories that you'll treasure forever."}
            </p>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                <Award className="h-8 w-8" style={{ color: studio?.primary_color || '#F59E0B' }} />
                <div>
                  <div className="font-semibold text-gray-900">Experience</div>
                  <div className="text-gray-600 text-sm">{photographer?.experience_years || '5+'} years</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                <Star className="h-8 w-8" style={{ color: studio?.primary_color || '#3B82F6' }} />
                <div>
                  <div className="font-semibold text-gray-900">Rating</div>
                  <div className="text-gray-600 text-sm">5.0 ⭐ (127 reviews)</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {photographer?.user?.email && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                  <Mail className="h-5 w-5" style={{ color: studio?.primary_color || '#3B82F6' }} />
                  <span className="text-gray-700 font-medium">{photographer.user.email}</span>
                </div>
              )}
              {photographer?.phone && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                  <Phone className="h-5 w-5" style={{ color: studio?.primary_color || '#22C55E' }} />
                  <span className="text-gray-700 font-medium">{photographer.phone}</span>
                </div>
              )}
              {studio?.location && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                  <MapPin className="h-5 w-5" style={{ color: studio?.secondary_color || '#EF4444' }} />
                  <span className="text-gray-700 font-medium">{studio.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            {photographer?.profile_image ? (
              <div className="relative group">
                <img 
                  src={normalizeImageUrl(photographer.profile_image)} 
                  alt="About"
                  className="rounded-3xl w-full h-80 lg:h-96 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
              </div>
            ) : (
              <div className="w-full h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                <Camera className="h-20 w-20 text-gray-400" />
              </div>
            )}
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 animate-bounce" style={{ animationDuration: '3s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Services Content Component
const ServicesContent = ({ packages, setSelectedPackage, primaryColor, secondaryColor }) => (
  <div className="space-y-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Photography Packages</h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">Choose the perfect package that captures your vision and fits your budget</p>
    </div>
    
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {packages?.map((pkg, index) => (
        <div 
          key={pkg.id || index}
          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{pkg.title}</h3>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                <Camera className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">{pkg.description}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <DollarSign className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: primaryColor }}>${pkg.price}</div>
                  <div className="text-gray-500 text-sm">Starting price</div>
                </div>
              </div>
              
              {pkg.duration_minutes && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Clock className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{pkg.duration_minutes} minutes</div>
                    <div className="text-gray-500 text-sm">Session duration</div>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="w-full text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 group relative overflow-hidden"
              style={{ backgroundColor: primaryColor || '#3B82F6' }}
              onClick={() => setSelectedPackage(pkg)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">View Details</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Enhanced Gallery Content Component with Masonry Layout
const GalleryContent = ({ initialPhotos, setSelectedPhoto, primaryColor, secondaryColor, subdomain }) => {
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filter, setFilter] = useState('all');
  const observer = useRef();

  const normalizeImageUrl = (url) => {
    if (!url) return '/fallback-image.jpg';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchMorePhotos = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/studio/website/${subdomain}/photos?page=${page + 1}`);
      if (!response.ok) {
        throw new Error("Failed to fetch more photos");
      }
      const newPhotos = await response.json();
      if (newPhotos.length === 0) {
        setHasMore(false);
      } else {
        setPhotos((prev) => [...prev, ...newPhotos]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching more photos:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const lastPhotoElementRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMorePhotos();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  const categories = ['all', 'wedding', 'portrait', 'event', 'lifestyle'];

  // Generate random heights for masonry effect
  const getRandomHeight = (index) => {
    const heights = ['h-64', 'h-80', 'h-96', 'h-72', 'h-60'];
    return heights[index % heights.length];
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
        <p className="text-gray-600 text-lg mb-8">Capturing moments that tell your story</p>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 capitalize ${
                filter === category 
                  ? 'text-white shadow-lg scale-105' 
                  : 'text-gray-600 bg-white/60 hover:bg-white hover:shadow-md'
              }`}
              style={{
                backgroundColor: filter === category ? primaryColor || '#3B82F6' : undefined,
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {photos && photos.length > 0 ? (
        <div className="space-y-8">
          {/* Masonry Grid Layout */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {photos.map((photo, index) => (
              <div 
                key={photo.id || index}
                className={`group relative break-inside-avoid mb-6 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${getRandomHeight(index)}`}
                onClick={() => setSelectedPhoto(photo)}
                ref={index === photos.length - 1 ? lastPhotoElementRef : null}
              >
                <img 
                  src={normalizeImageUrl(photo.image || photo.thumbnail)} 
                  alt={photo.title || `Photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Love/Heart icon */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 hover:bg-red-500/80">
                  <Heart className="h-5 w-5 text-white hover:fill-white transition-all duration-200" />
                </div>
                
                {/* Photo info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg mb-1">{photo.title || `Untitled ${index + 1}`}</h4>
                      <p className="text-sm text-gray-200 flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {photo.category || 'Gallery'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Camera className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating action button */}
                <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100 backdrop-blur-sm"
                     style={{ backgroundColor: `${primaryColor || '#3B82F6'}80` }}>
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center">
              <button
                onClick={fetchMorePhotos}
                disabled={isLoadingMore}
                className="group relative text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                style={{ backgroundColor: primaryColor || '#3B82F6' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading more magic...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      Load More Photos
                    </div>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="relative">
            <Camera className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-ping"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Gallery Coming Soon</h3>
          <p className="text-gray-500">Beautiful photos are on their way. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default PhotographerWebsite;