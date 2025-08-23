import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Compass, 
  MapPin, 
  Zap,
  Star,
  Sparkles,
  Navigation,
  Coffee,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <span className="ml-4 text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                YourBrand
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-slate-700/50 rounded-xl">
              Home
            </a>
            <a href="/about" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-slate-700/50 rounded-xl">
              About
            </a>
            <a href="/services" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-slate-700/50 rounded-xl">
              Services
            </a>
            <a href="/contact" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-slate-700/50 rounded-xl">
              Contact
            </a>
          </nav>

          <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

const FloatingElement = ({ children, className, delay = 0 }) => {
  return (
    <div 
      className={`absolute animate-bounce ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s',
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  );
};

const Page404 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Handle search logic here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden relative">
      <Header />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Interactive mouse follower */}
        <div 
          className="absolute w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 64,
            top: mousePosition.y - 64,
          }}
        ></div>
      </div>

      {/* Floating decorative elements */}
      <FloatingElement className="top-20 left-10" delay={0}>
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-purple-500/30 flex items-center justify-center">
          <Star className="h-8 w-8 text-purple-400" />
        </div>
      </FloatingElement>
      
      <FloatingElement className="top-32 right-20" delay={1}>
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full backdrop-blur-sm border border-pink-500/30 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-pink-400" />
        </div>
      </FloatingElement>
      
      <FloatingElement className="bottom-32 left-20" delay={2}>
        <div className="w-14 h-14 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-orange-500/30 flex items-center justify-center">
          <Compass className="h-7 w-7 text-orange-400" />
        </div>
      </FloatingElement>

      <FloatingElement className="bottom-20 right-10" delay={0.5}>
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full backdrop-blur-sm border border-purple-500/40 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-purple-300" />
        </div>
      </FloatingElement>

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* 404 Number with glitch effect */}
          <div className="relative mb-8">
            <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text leading-none animate-pulse">
              404
            </h1>
            {/* Glitch overlay */}
            <h1 className="absolute top-0 left-0 text-8xl md:text-9xl lg:text-[12rem] font-black text-purple-500/20 leading-none animate-ping" style={{animationDuration: '2s'}}>
              404
            </h1>
          </div>

          {/* Error message */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '300ms'}}>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Oops! Page Not Found
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed">
              Looks like you've wandered into the digital void. The page you're looking for has gone on an adventure!
            </p>
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <Coffee className="h-5 w-5" />
              <span>Don't worry, it happens to the best of us</span>
            </div>
          </div>

          {/* Search bar - Enhanced readability */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '600ms'}}>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for what you're looking for..."
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-lg"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons - Enhanced readability */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '900ms'}}>
            <button 
              onClick={goHome}
              className="group bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 relative overflow-hidden flex items-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center">
                <Home className="mr-3 h-5 w-5" />
                Go Home
              </div>
            </button>
            
            <button 
              onClick={goBack}
              className="group flex items-center text-white hover:text-white px-8 py-4 rounded-2xl hover:bg-slate-700/30 border border-slate-500/50 hover:border-slate-400 transition-all duration-300 font-medium bg-slate-800/50 backdrop-blur-sm"
            >
              <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Go Back
            </button>
          </div>

          {/* Helpful links - Enhanced readability */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '1200ms'}}>
            <p className="text-slate-300 mb-6 text-lg">Or try one of these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Services', href: '/services' },
                { name: 'Blog', href: '/blog' },
                { name: 'Contact', href: '/contact' },
                { name: 'Help Center', href: '/help' }
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="px-6 py-3 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-slate-200 hover:text-white hover:bg-slate-700/60 hover:border-slate-500 transition-all duration-300 hover:scale-105 font-medium shadow-lg"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Help section - Enhanced readability */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '1500ms'}}>
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Still need help?
              </h3>
              <p className="text-slate-300 mb-6 text-lg">
                Our team is here to help you find what you're looking for.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <a 
                  href="/contact"
                  className="flex flex-col items-center p-4 rounded-xl border border-slate-600/50 hover:border-purple-500/50 hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
                    <MessageCircle className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Live Chat</span>
                  <span className="text-xs text-slate-400 text-center">Chat with our support team</span>
                </a>

                <a 
                  href="mailto:support@yourbrand.com"
                  className="flex flex-col items-center p-4 rounded-xl border border-slate-600/50 hover:border-pink-500/50 hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-pink-500/30 transition-colors">
                    <Mail className="h-6 w-6 text-pink-400" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Email</span>
                  <span className="text-xs text-slate-400 text-center">support@yourbrand.com</span>
                </a>

                <a 
                  href="tel:+1234567890"
                  className="flex flex-col items-center p-4 rounded-xl border border-slate-600/50 hover:border-orange-500/50 hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500/30 transition-colors">
                    <Phone className="h-6 w-6 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Call</span>
                  <span className="text-xs text-slate-400 text-center">+1 (234) 567-890</span>
                </a>
              </div>
            </div>
          </div>

          {/* Fun fact - Enhanced readability */}
          <div className="mt-16 animate-in fade-in slide-in-from-bottom duration-700" style={{animationDelay: '1800ms'}}>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 max-w-md mx-auto shadow-xl">
              <div className="flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-purple-300 mr-2" />
                <span className="text-purple-200 font-bold">Fun Fact</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                The 404 error was named after room 404 at CERN, where the web was invented. The room contained the central database, and "404" meant the file was not found!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-300">
            © 2024 YourBrand. All rights reserved. | 
            <span className="text-purple-400 ml-1">Lost but not forgotten ✨</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Page404;