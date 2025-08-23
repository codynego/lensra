import React, { useState, useCallback, useEffect } from 'react';
import {
  Camera, Calendar, Sparkles, Check, Star, ArrowRight, Menu, X, Globe, Image, Building, Gift,
  Zap, Heart, Instagram, Twitter, Linkedin, Mail, User, Phone, ChevronDown, Play, Shield, Award
} from 'lucide-react';

const whyJoinReasons = [
  {
    icon: Globe,
    title: "Personalized Mini-Website",
    description: "Create a stunning photography website that reflects your unique style and brand identity with our cutting-edge design tools."
  },
  {
    icon: Image,
    title: "Easy Client Gallery Sharing",
    description: "Share private galleries with clients seamlessly and let them select their favorite shots with our intuitive interface."
  },
  {
    icon: Calendar,
    title: "Online Bookings & Payments",
    description: "Automate your booking process and receive payments directly through your website with integrated payment systems."
  },
  {
    icon: Sparkles,
    title: "Future AI Tools",
    description: "Be first to access AI-powered photo curation and enhancement tools designed to grow your photography business."
  }
];

const Navigation = ({ onJoinClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <span className="ml-4 text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Lensra
              </span>
              <span className="ml-4 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-full shadow-lg">
                ✨ Coming Soon
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <a href="#why-join" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-slate-700/50 rounded-xl">
              Why Join
            </a>
            <a href="#waitlist" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-slate-700/50 rounded-xl">
              Join Waitlist
            </a>
            <button 
              onClick={onJoinClick}
              className="ml-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
            >
              Get Early Access
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="px-6 py-6 space-y-4">
            <a href="#why-join" className="block text-slate-300 hover:text-white py-3 px-4 rounded-xl hover:bg-slate-700/50 transition-all duration-300">Why Join</a>
            <a href="#waitlist" className="block text-slate-300 hover:text-white py-3 px-4 rounded-xl hover:bg-slate-700/50 transition-all duration-300">Join Waitlist</a>
            <button 
              onClick={() => {
                onJoinClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all duration-300"
            >
              Get Early Access
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const WaitlistForm = ({ waitlistCount, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studioName: '',
    whatsapp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit(formData);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ready to Transform Your Photography Business?
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join <span className="text-indigo-400 font-bold">{waitlistCount}</span> photographers who are already waiting for Lensra
          </p>
        </div>

        <div id="waitlist-form" className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center py-12 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-green-500/30">
                <Check className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">Welcome to the Lensra Family!</h3>
              <p className="text-xl text-slate-400 mb-8 max-w-md mx-auto">
                You're now <span className="text-indigo-400 font-bold">#{waitlistCount}</span> on our waitlist. We'll notify you as soon as we launch!
              </p>
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-8 max-w-lg mx-auto backdrop-blur-sm">
                <p className="text-indigo-300 font-bold mb-4 text-lg">🎉 Your Early Access Perks:</p>
                <ul className="text-slate-300 space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3" />
                    6 months premium features free
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3" />
                    First access to AI tools
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3" />
                    Priority support & onboarding
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-2xl text-center animate-in fade-in duration-200">
                  {error}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-slate-300 mb-3">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 backdrop-blur-sm"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="studioName" className="block text-sm font-bold text-slate-300 mb-3">
                    Studio Name (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      id="studioName"
                      name="studioName"
                      value={formData.studioName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 backdrop-blur-sm"
                      placeholder="Your studio name"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-3">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 backdrop-blur-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-bold text-slate-300 mb-3">
                    WhatsApp Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 backdrop-blur-sm"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Joining Waitlist...
                    </>
                  ) : (
                    <>
                      Join the Waitlist
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </div>
              </button>
              
              <p className="text-sm text-slate-500 text-center">
                We'll notify you as soon as Lensra launches. No spam, ever. 🤝
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const LensraLandingPage = () => {
  const [waitlistCount, setWaitlistCount] = useState(247);

  const handleJoinClick = useCallback(() => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleFormSubmit = useCallback(() => {
    setWaitlistCount(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      <Navigation onJoinClick={handleJoinClick} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-500">
              <Sparkles className="h-5 w-5 text-indigo-400 mr-2" />
              <span className="text-indigo-300 font-bold">Coming Soon • Be Among The First 500</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '200ms'}}>
              <span className="text-white block">Your Photography.</span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                Your Space.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '400ms'}}>
              Create your photography website, share galleries with clients, and grow your brand—all in one beautifully designed platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '600ms'}}>
              <button 
                onClick={handleJoinClick}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center">
                  Join the Waitlist
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
              
              <button className="group flex items-center text-slate-300 hover:text-white px-8 py-5 rounded-2xl hover:bg-slate-700/30 transition-all duration-300">
                <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mr-4 group-hover:bg-indigo-500/20 transition-all duration-300">
                  <Play className="h-5 w-5 ml-1" />
                </div>
                Watch Preview
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-500 animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '800ms'}}>
              <div className="flex items-center">
                <div className="flex -space-x-3 mr-4">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="font-medium text-slate-300">{waitlistCount} photographers already joined</span>
              </div>
              <div className="hidden md:flex items-center text-slate-400">
                <Shield className="h-5 w-5 mr-2 text-green-400" />
                <span>100% Free to Join</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero mockup */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom duration-1000" style={{animationDelay: '1s'}}>
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 transform hover:scale-[1.02] transition-all duration-500 group">
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-12 h-96 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Browser chrome */}
              <div className="absolute top-6 left-6 flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              
              <div className="text-center">
                <div className="w-28 h-28 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-indigo-500/30 group-hover:rotate-6 transition-all duration-500">
                  <Camera className="h-14 w-14 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Studio Portfolio Preview</h3>
                <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
                  See how your photography website will look with our beautiful templates
                </p>
                <div className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full text-sm font-black inline-block shadow-lg">
                  🚀 Launching February 2025
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-slate-700/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-600/50 transform rotate-12 group-hover:rotate-0 transition-all duration-500">
                <Image className="h-8 w-8 text-purple-400" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-slate-700/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-600/50 transform -rotate-12 group-hover:rotate-0 transition-all duration-500">
                <Calendar className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="absolute top-1/2 -right-8 bg-slate-700/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-600/50 transform rotate-45 group-hover:rotate-0 transition-all duration-500">
                <Globe className="h-6 w-6 text-pink-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section id="why-join" className="py-24 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Why Join the Waitlist?
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Be among the first to experience the future of photography business management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {whyJoinReasons.map((reason, index) => (
              <div key={index} className="group">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 h-full hover:bg-slate-700/60 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-indigo-500/30">
                    <reason.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{reason.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access Perks */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl">
              <Gift className="h-12 w-12 text-black" />
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
              Exclusive Early Access Perks
            </h2>
            
            <p className="text-xl text-indigo-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Be among the first 500 photographers to join and get 
              <span className="font-black text-yellow-300 text-2xl"> 6 months of premium features absolutely free</span> when we launch!
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              {[
                { icon: Zap, text: "First Access to AI Tools" },
                { icon: Star, text: "Premium Templates Free" },
                { icon: Heart, text: "Priority Support & Training" }
              ].map((perk, index) => (
                <div key={index} className="group">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300">
                      <perk.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="font-bold text-white text-lg">{perk.text}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-yellow-300 mr-2" />
                <span className="text-yellow-200 font-bold text-lg">Limited Time Offer</span>
              </div>
              <p className="text-yellow-100 text-sm">
                This exclusive offer is only available to the first 500 waitlist members. Currently <span className="font-bold">{waitlistCount}</span> spots taken.
              </p>
            </div>
            
            <button 
              onClick={handleJoinClick}
              className="group bg-white text-indigo-600 px-12 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center">
                Claim Your Early Access
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <WaitlistForm waitlistCount={waitlistCount} onSubmit={handleFormSubmit} />

      {/* Footer */}
      <footer className="py-16 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Camera className="h-7 w-7 text-white" />
                </div>
                <span className="ml-4 text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Lensra
                </span>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-6">
                The all-in-one platform for photographers to showcase their work, manage clients, and grow their business.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-slate-800 hover:bg-indigo-500/20 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Instagram className="h-5 w-5 text-slate-400 group-hover:text-indigo-400" />
                </a>
                <a href="#" className="w-12 h-12 bg-slate-800 hover:bg-indigo-500/20 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Twitter className="h-5 w-5 text-slate-400 group-hover:text-indigo-400" />
                </a>
                <a href="#" className="w-12 h-12 bg-slate-800 hover:bg-indigo-500/20 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Linkedin className="h-5 w-5 text-slate-400 group-hover:text-indigo-400" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Platform</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">Templates</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">AI Tools</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 mb-4 md:mb-0">
              © 2024 Lensra. All rights reserved. Made with ❤️ for photographers.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-slate-500 text-sm">🚀 Launching February 2025</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Development in Progress</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LensraLandingPage;