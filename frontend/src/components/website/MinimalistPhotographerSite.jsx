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
  Sparkles,
  Play,
  Instagram,
  Twitter,
  Facebook,
  ArrowRight,
  Plus,
  Minus,
  Grid,
  Filter,
  Download,
  Share2,
  ZoomIn,
  Menu,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Quote
} from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://lvh.me:8000";

// Theme: Minimalist Dark with Glassmorphism
const MinimalistPhotographerSite = ({ subdomain }) => {
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  console.log("Rendering MinimalistPhotographerSite with subdomain:", subdomain);

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const normalizeImageUrl = (url) => {
    if (!url) return '/fallback-image.jpg';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-800 rounded-full animate-spin mx-auto mb-6">
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent rounded-full animate-spin" style={{ borderTopColor: websiteData?.studio?.primary_color || '#EC4899' }}></div>
            </div>
            <Camera className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ color: websiteData?.studio?.primary_color || '#EC4899' }} />
          </div>
          <p className="text-xl font-light tracking-wider" style={{ color: websiteData?.studio?.secondary_color || '#8B5CF6' }}>Loading Experience...</p>
        </div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="text-center">
          <Camera className="h-24 w-24 mx-auto mb-6" style={{ color: websiteData?.studio?.secondary_color || '#8B5CF6' }} />
          <h2 className="text-3xl font-light mb-3" style={{ color: websiteData?.studio?.primary_color || '#EC4899' }}>Not Found</h2>
          <p style={{ color: websiteData?.studio?.secondary_color || '#8B5CF6' }}>Portfolio unavailable</p>
        </div>
      </div>
    );
  }

  const { photographer, studio, packages, photos } = websiteData;
  const primaryColor = studio?.primary_color || '#EC4899';
  const secondaryColor = studio?.secondary_color || '#8B5CF6';

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: '#1F1F1F' }}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl transition-transform duration-1000"
          style={{ 
            background: `linear-gradient(to right, ${primaryColor}10, ${secondaryColor}10)`,
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            left: '10%',
            top: '20%'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl transition-transform duration-1000"
          style={{ 
            background: `linear-gradient(to right, ${secondaryColor}10, ${primaryColor}10)`,
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
            right: '10%',
            bottom: '20%'
          }}
        />
      </div>

      {/* Floating Navigation */}
      <nav className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${isScrolled ? 'scale-95' : ''}`}>
        <div className="bg-white/10 backdrop-blur-2xl border rounded-full px-2 py-2 shadow-2xl" style={{ borderColor: `${primaryColor}20` }}>
          <div className="flex items-center gap-1">
            {['home', 'gallery', 'about', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 capitalize relative overflow-hidden ${
                  activeSection === section ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
                style={{
                  backgroundColor: activeSection === section ? primaryColor : 'transparent',
                }}
              >
                <span className="relative z-10">{section}</span>
                {activeSection === section && (
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{ backgroundColor: secondaryColor }}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeSection === 'home' && (
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="text-center z-10 max-w-4xl mx-auto px-6">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 shadow-2xl mb-8 group" style={{ borderColor: `${primaryColor}20` }}>
                {photographer?.user?.profile_picture ? (
                  <img 
                    src={normalizeImageUrl(photographer.user.profile_picture)} 
                    alt="Profile"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}>
                    <Camera className="h-12 w-12 text-white/50" />
                  </div>
                )}
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full border-4 border-black animate-pulse" style={{ backgroundColor: secondaryColor }}></div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extralight mb-6 tracking-wider animate-fadeInUp" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${primaryColor})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              {studio?.name || "STUDIO"}
            </h1>
            
            <p className="text-xl md:text-2xl font-light mb-12 leading-relaxed max-w-2xl mx-auto animate-fadeInUp animation-delay-200" style={{ color: `${secondaryColor}cc` }}>
              {studio?.tagline || "Where moments become memories, and memories become art"}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fadeInUp animation-delay-400">
              <button className="group relative px-12 py-4 font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden" style={{ backgroundColor: primaryColor, color: '#1F1F1F' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to right, ${secondaryColor}20, transparent)` }}></div>
                <span className="relative flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  Book Session
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              
              <button 
                onClick={() => setActiveSection('gallery')}
                className="group px-12 py-4 border-2 font-medium rounded-full transition-all duration-500 hover:scale-105"
                style={{ borderColor: `${primaryColor}30`, color: secondaryColor, backgroundColor: 'transparent' }}
              >
                <span className="flex items-center gap-3">
                  <Images className="h-5 w-5" />
                  View Gallery
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-float"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {activeSection === 'gallery' && (
        <section className="min-h-screen py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-wider" style={{ color: primaryColor }}>GALLERY</h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: `${secondaryColor}cc` }}>A curated collection of captured moments</p>
            </div>
            
            <MinimalistGallery 
              photos={photos} 
              setSelectedPhoto={setSelectedPhoto}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </div>
        </section>
      )}

      {/* About Section */}
      {activeSection === 'about' && (
        <section className="min-h-screen py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-5xl md:text-6xl font-light tracking-wider mb-8" style={{ color: primaryColor }}>ABOUT</h2>
                <p className="text-lg leading-relaxed" style={{ color: `${secondaryColor}cc` }}>
                  {studio?.about || "I believe every moment tells a story worth preserving. Through my lens, I capture not just images, but emotions, connections, and the essence of who you are."}
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6" style={{ borderColor: `${primaryColor}10` }}>
                    <Award className="h-8 w-8 mb-3" style={{ color: secondaryColor }} />
                    <div className="text-2xl font-light" style={{ color: primaryColor }}>{photographer?.experience_years || '8'}+</div>
                    <div className="text-sm" style={{ color: `${secondaryColor}cc` }}>Years Experience</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6" style={{ borderColor: `${primaryColor}10` }}>
                    <Star className="h-8 w-8 mb-3" style={{ color: secondaryColor }} />
                    <div className="text-2xl font-light" style={{ color: primaryColor }}>500+</div>
                    <div className="text-sm" style={{ color: `${secondaryColor}cc` }}>Happy Clients</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative group">
                  {photographer?.profile_image ? (
                    <img 
                      src={normalizeImageUrl(photographer.profile_image)} 
                      alt="About"
                      className="w-full h-96 object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-96 rounded-3xl flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}>
                      <Camera className="h-24 w-24 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-3xl" style={{ background: `linear-gradient(to top, ${primaryColor}50, transparent)` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {activeSection === 'contact' && (
        <section className="min-h-screen py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-light tracking-wider mb-6" style={{ color: primaryColor }}>CONTACT</h2>
              <p className="text-xl" style={{ color: `${secondaryColor}cc` }}>Let's bring your vision to life</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-6">
                  {photographer?.user?.email && (
                    <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl hover:bg-white/10 transition-all duration-300" style={{ borderColor: `${primaryColor}10` }}>
                      <Mail className="h-6 w-6" style={{ color: secondaryColor }} />
                      <span style={{ color: `${secondaryColor}cc` }}>{photographer.user.email}</span>
                    </div>
                  )}
                  {photographer?.phone && (
                    <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl hover:bg-white/10 transition-all duration-300" style={{ borderColor: `${primaryColor}10` }}>
                      <Phone className="h-6 w-6" style={{ color: secondaryColor }} />
                      <span style={{ color: `${secondaryColor}cc` }}>{photographer.phone}</span>
                    </div>
                  )}
                  {studio?.location && (
                    <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl hover:bg-white/10 transition-all duration-300" style={{ borderColor: `${primaryColor}10` }}>
                      <MapPin className="h-6 w-6" style={{ color: secondaryColor }} />
                      <span style={{ color: `${secondaryColor}cc` }}>{studio.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110" style={{ borderColor: `${primaryColor}20` }}>
                    <Instagram className="h-5 w-5" style={{ color: secondaryColor }} />
                  </button>
                  <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110" style={{ borderColor: `${primaryColor}20` }}>
                    <Twitter className="h-5 w-5" style={{ color: secondaryColor }} />
                  </button>
                  <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110" style={{ borderColor: `${primaryColor}20` }}>
                    <Facebook className="h-5 w-5" style={{ color: secondaryColor }} />
                  </button>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8" style={{ borderColor: `${primaryColor}10` }}>
                <div className="space-y-6">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-6 py-4 bg-white/5 border rounded-2xl text-white focus:outline-none transition-all duration-300"
                    style={{ borderColor: `${primaryColor}20`, placeholderColor: `${secondaryColor}50`, ':focus': { borderColor: `${primaryColor}40` } }}
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-6 py-4 bg-white/5 border rounded-2xl text-white focus:outline-none transition-all duration-300"
                    style={{ borderColor: `${primaryColor}20`, placeholderColor: `${secondaryColor}50`, ':focus': { borderColor: `${primaryColor}40` } }}
                  />
                  <textarea
                    placeholder="Tell me about your vision..."
                    rows={5}
                    className="w-full px-6 py-4 bg-white/5 border rounded-2xl text-white focus:outline-none transition-all duration-300 resize-none"
                    style={{ borderColor: `${primaryColor}20`, placeholderColor: `${secondaryColor}50`, ':focus': { borderColor: `${primaryColor}40` } }}
                  ></textarea>
                  <button className="w-full py-4 px-6 rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3" style={{ backgroundColor: primaryColor, color: '#1F1F1F' }}>
                    <Send className="h-5 w-5" />
                    Send Message
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
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-6xl max-h-full relative">
            <img 
              src={normalizeImageUrl(selectedPhoto.image || selectedPhoto.thumbnail)} 
              alt={selectedPhoto.title || "Photo"}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 rounded-full p-3 hover:bg-black/70 transition-all duration-200"
              style={{ backgroundColor: `${primaryColor}50`, color: secondaryColor }}
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
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

// Enhanced Minimalist Gallery Component
const MinimalistGallery = ({ photos, setSelectedPhoto, primaryColor, secondaryColor }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const normalizeImageUrl = (url) => {
    if (!url) return '/fallback-image.jpg';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-24">
        <Camera className="h-24 w-24 mx-auto mb-6" style={{ color: `${secondaryColor}20` }} />
        <h3 className="text-2xl font-light mb-2" style={{ color: primaryColor }}>Gallery Coming Soon</h3>
        <p style={{ color: `${secondaryColor}cc` }}>Masterpieces in progress</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {photos.map((photo, index) => (
        <div 
          key={photo.id || index}
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setSelectedPhoto(photo)}
        >
          <img 
            src={normalizeImageUrl(photo.image || photo.thumbnail)} 
            alt={photo.title || `Photo ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          <div className={`absolute inset-0 transition-all duration-500 ${hoveredIndex === index ? 'bg-black/40' : 'bg-transparent'}`}>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hoveredIndex === index ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <div className="rounded-full p-4" style={{ backgroundColor: `${primaryColor}20`, backdropFilter: 'blur(10px)' }}>
                <ZoomIn className="h-8 w-8" style={{ color: secondaryColor }} />
              </div>
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 ${hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="rounded-2xl p-4" style={{ backgroundColor: `${primaryColor}50`, backdropFilter: 'blur(10px)' }}>
              <h4 className="font-medium" style={{ color: secondaryColor }}>{photo.title || `Untitled ${index + 1}`}</h4>
              <p className="text-sm" style={{ color: `${secondaryColor}cc` }}>{photo.category || 'Photography'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MinimalistPhotographerSite;