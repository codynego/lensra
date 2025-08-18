// import React, { useState } from 'react';
// import { 
//   Camera, 
//   Users, 
//   Calendar, 
//   Sparkles, 
//   Play, 
//   Check, 
//   Star,
//   ArrowRight,
//   Menu,
//   X,
//   Globe,
//   Image,
//   CreditCard
// } from 'lucide-react';

// const LensraLanding = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const features = [
//     {
//       icon: Globe,
//       title: "Mini-Websites",
//       description: "Create your personalized studio homepage with custom themes and professional layouts."
//     },
//     {
//       icon: Image,
//       title: "Client Galleries",
//       description: "Upload, organize, and share galleries directly with your clients in a beautiful interface."
//     },
//     {
//       icon: Calendar,
//       title: "Booking System",
//       description: "Let clients book sessions, pay, and manage appointments online with automated workflows."
//     },
//     {
//       icon: Sparkles,
//       title: "AI Tools (Premium)",
//       description: "Smart photo curation, enhancement, and tagging to streamline your workflow."
//     }
//   ];

//   const plans = [
//     {
//       name: "Free",
//       price: "0",
//       description: "Perfect for getting started",
//       features: [
//         "2 client galleries",
//         "500MB storage",
//         "Basic themes",
//         "Email support"
//       ],
//       buttonText: "Get Started",
//       popular: false
//     },
//     {
//       name: "Pro",
//       price: "29",
//       description: "Best for growing studios",
//       features: [
//         "50 client galleries",
//         "25GB storage",
//         "Custom domain",
//         "Advanced booking",
//         "Priority support"
//       ],
//       buttonText: "Start Pro Trial",
//       popular: true
//     },
//     {
//       name: "Studio",
//       price: "99",
//       description: "For established businesses",
//       features: [
//         "Unlimited galleries",
//         "Unlimited storage",
//         "AI enhancement tools",
//         "White-label options",
//         "Phone support"
//       ],
//       buttonText: "Contact Sales",
//       popular: false
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Navigation */}
//       <nav className="relative bg-white border-b border-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 flex items-center">
//                 <Camera className="h-8 w-8 text-indigo-500" />
//                 <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
//                   Lensra
//                 </span>
//               </div>
//             </div>
            
//             <div className="hidden md:block">
//               <div className="ml-10 flex items-baseline space-x-8">
//                 <a href="#features" className="text-gray-600 hover:text-indigo-500 px-3 py-2 text-sm font-medium transition-colors">
//                   Features
//                 </a>
//                 <a href="#pricing" className="text-gray-600 hover:text-indigo-500 px-3 py-2 text-sm font-medium transition-colors">
//                   Pricing
//                 </a>
//                 <a href="#demo" className="text-gray-600 hover:text-indigo-500 px-3 py-2 text-sm font-medium transition-colors">
//                   Demo
//                 </a>
//                 <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200">
//                   Get Started Free
//                 </button>
//               </div>
//             </div>
            
//             <div className="md:hidden">
//               <button
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className="text-gray-600 hover:text-indigo-500 p-2"
//               >
//                 {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile menu */}
//         {isMobileMenuOpen && (
//           <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50">
//             <div className="px-4 py-4 space-y-4">
//               <a href="#features" className="block text-gray-600 hover:text-indigo-500 py-2">Features</a>
//               <a href="#pricing" className="block text-gray-600 hover:text-indigo-500 py-2">Pricing</a>
//               <a href="#demo" className="block text-gray-600 hover:text-indigo-500 py-2">Demo</a>
//               <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium">
//                 Get Started Free
//               </button>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Hero Section */}
//       <section className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600">
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
//           <div className="text-center">
//             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
//               Your Photography.<br />
//               Your Studio.<br />
//               <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
//                 Your Way.
//               </span>
//             </h1>
//             <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-10 leading-relaxed">
//               Lensra gives photographers a powerful platform to showcase work, manage clients, 
//               and grow their brand — all in one place.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//               <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
//                 Get Started Free
//                 <ArrowRight className="ml-2 h-5 w-5 inline" />
//               </button>
//               <button className="flex items-center text-white border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
//                 <Play className="mr-2 h-5 w-5" />
//                 View Demo
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {/* Hero Visual Mockup */}
//         <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
//           <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4">
//             <div className="grid md:grid-cols-2 gap-8 items-center">
//               <div className="bg-gray-50 rounded-2xl p-6 h-64 flex items-center justify-center">
//                 <div className="text-center">
//                   <Camera className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
//                   <p className="text-gray-600 font-medium">Desktop Studio View</p>
//                   <p className="text-sm text-gray-500">Professional portfolio layout</p>
//                 </div>
//               </div>
//               <div className="bg-gray-50 rounded-2xl p-6 h-64 flex items-center justify-center">
//                 <div className="text-center">
//                   <Image className="h-16 w-16 text-purple-400 mx-auto mb-4" />
//                   <p className="text-gray-600 font-medium">Mobile Gallery View</p>
//                   <p className="text-sm text-gray-500">Responsive client galleries</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Social Proof */}
//       <section className="py-12 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <p className="text-lg text-gray-600 mb-8">Built for creators. Trusted by photographers everywhere.</p>
//           <div className="flex justify-center items-center space-x-8 text-gray-400">
//             <div className="text-2xl font-bold">500+</div>
//             <div className="text-sm">Photographers</div>
//             <div className="text-2xl font-bold">10K+</div>
//             <div className="text-sm">Client Galleries</div>
//             <div className="text-2xl font-bold">99.9%</div>
//             <div className="text-sm">Uptime</div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Everything you need to grow
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Professional tools designed specifically for photographers and their clients
//             </p>
//           </div>
          
//           <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
//             {features.map((feature, index) => (
//               <div key={index} className="group p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
//                 <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
//                   <feature.icon className="h-8 w-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
//                 <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Showcase Section */}
//       <section className="py-24 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Designed for Photographers. Loved by Clients.
//             </h2>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="bg-white rounded-2xl shadow-lg p-8">
//               <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-8 h-48 flex items-center justify-center mb-6">
//                 <Globe className="h-16 w-16 text-indigo-500" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Photographer Profile</h3>
//               <p className="text-gray-600">Professional mini-sites that showcase your unique style and brand</p>
//             </div>
            
//             <div className="bg-white rounded-2xl shadow-lg p-8">
//               <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 h-48 flex items-center justify-center mb-6">
//                 <Image className="h-16 w-16 text-purple-500" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Client Gallery</h3>
//               <p className="text-gray-600">Beautiful, secure galleries that make sharing and viewing a joy</p>
//             </div>
            
//             <div className="bg-white rounded-2xl shadow-lg p-8">
//               <div className="bg-gradient-to-br from-pink-100 to-orange-100 rounded-xl p-8 h-48 flex items-center justify-center mb-6">
//                 <Calendar className="h-16 w-16 text-pink-500" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Calendar</h3>
//               <p className="text-gray-600">Streamlined booking system with payments and automated reminders</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Start free, grow as you go
//             </h2>
//             <p className="text-xl text-gray-600">Choose the perfect plan for your photography business</p>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//             {plans.map((plan, index) => (
//               <div key={index} className={`relative rounded-2xl p-8 ${plan.popular ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white transform scale-105' : 'bg-white border-2 border-gray-100'}`}>
//                 {plan.popular && (
//                   <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                     <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">
//                       Most Popular
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="text-center mb-8">
//                   <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
//                     {plan.name}
//                   </h3>
//                   <div className="mb-4">
//                     <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
//                       ${plan.price}
//                     </span>
//                     <span className={`text-lg ${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
//                       /month
//                     </span>
//                   </div>
//                   <p className={`${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
//                     {plan.description}
//                   </p>
//                 </div>
                
//                 <ul className="space-y-4 mb-8">
//                   {plan.features.map((feature, featureIndex) => (
//                     <li key={featureIndex} className="flex items-center">
//                       <Check className={`h-5 w-5 mr-3 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
//                       <span className={`${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
//                         {feature}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
                
//                 <button className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
//                   plan.popular 
//                     ? 'bg-white text-indigo-600 hover:shadow-xl' 
//                     : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-xl hover:scale-105'
//                 }`}>
//                   {plan.buttonText}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonial */}
//       <section className="py-24 bg-gray-50">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
//             "Lensra gave my studio a professional online presence in minutes. 
//             My clients love the seamless gallery experience, and I love how easy it is to manage everything."
//           </blockquote>
//           <div className="flex items-center justify-center">
//             <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
//               S
//             </div>
//             <div>
//               <p className="font-semibold text-gray-900">Sarah Chen</p>
//               <p className="text-gray-600">Wedding Photographer, San Francisco</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA */}
//       <section className="py-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
//             Take your photography business online today
//           </h2>
//           <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
//             Join hundreds of photographers who've transformed their business with Lensra
//           </p>
          
//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//             <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
//               Start Free
//               <ArrowRight className="ml-2 h-5 w-5 inline" />
//             </button>
//             <button className="text-white border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
//               Book a Demo
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid md:grid-cols-4 gap-8">
//             <div>
//               <div className="flex items-center mb-4">
//                 <Camera className="h-8 w-8 text-indigo-400" />
//                 <span className="ml-2 text-2xl font-bold">Lensra</span>
//               </div>
//               <p className="text-gray-400 max-w-sm">
//                 Empowering photographers to build beautiful online presences and grow their businesses.
//               </p>
//             </div>
            
//             <div>
//               <h3 className="font-semibold mb-4">Product</h3>
//               <ul className="space-y-2 text-gray-400">
//                 <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
//               </ul>
//             </div>
            
//             <div>
//               <h3 className="font-semibold mb-4">Company</h3>
//               <ul className="space-y-2 text-gray-400">
//                 <li><a href="#" className="hover:text-white transition-colors">About</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
//               </ul>
//             </div>
            
//             <div>
//               <h3 className="font-semibold mb-4">Legal</h3>
//               <ul className="space-y-2 text-gray-400">
//                 <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
//             <p>&copy; 2025 Lensra. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LensraLanding;

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Users, 
  Calendar, 
  Sparkles, 
  Play, 
  Check, 
  Star,
  ArrowRight,
  Menu,
  X,
  Globe,
  Image,
  CreditCard,
  Download,
  Shield,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const LensraLanding = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: Globe,
      title: "Create Your Photography Website in Minutes",
      description: "Professional mini-sites with custom themes that showcase your unique style and attract clients."
    },
    {
      icon: Image,
      title: "Client Galleries & Easy Sharing",
      description: "Secure, beautiful galleries where clients can view, select, and download their photos seamlessly."
    },
    {
      icon: Sparkles,
      title: "Bookings, Payments, and AI Tools Built In",
      description: "Complete business management with intelligent photo curation and automated workflows."
    }
  ];

  const whyLensraCards = [
    {
      title: "For Photographers",
      description: "Grow your brand, manage clients effortlessly, and showcase your portfolio professionally",
      icon: Camera,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "For Clients",
      description: "Access private galleries, download securely, and enjoy a premium viewing experience",
      icon: Users,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "For Agencies",
      description: "Collaborate with photographers easily and manage multiple projects seamlessly",
      icon: Shield,
      gradient: "from-pink-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      text: "Lensra made my photography business professional overnight. My clients are impressed!",
      author: "Adunni Okafor",
      role: "Wedding Photographer, Lagos",
      rating: 5,
      avatar: "A"
    },
    {
      text: "The client gallery feature is game-changing. So much easier than sending files via email.",
      author: "Chike Emmanuel",
      role: "Portrait Photographer, Abuja",
      rating: 5,
      avatar: "C"
    },
    {
      text: "AI tools help me curate the best shots for clients. Saves me hours of work!",
      author: "Funmi Adebayo",
      role: "Event Photographer, Port Harcourt",
      rating: 5,
      avatar: "F"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Lensra
                </span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-indigo-50 rounded-lg">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-indigo-50 rounded-lg">
                  Pricing
                </a>
                <a href="#demo" className="text-gray-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-indigo-50 rounded-lg">
                  Demo
                </a>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-2xl text-sm font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Get Started Free
                </button>
              </div>
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-100/50 shadow-xl z-50">
            <div className="px-6 py-6 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-indigo-600 py-3 px-4 rounded-lg hover:bg-indigo-50 transition-all duration-300">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-indigo-600 py-3 px-4 rounded-lg hover:bg-indigo-50 transition-all duration-300">Pricing</a>
              <a href="#demo" className="block text-gray-600 hover:text-indigo-600 py-3 px-4 rounded-lg hover:bg-indigo-50 transition-all duration-300">Demo</a>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300">
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
              Your Photography.<br />
              Your Studio.<br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Clients.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Manage shoots, showcase your portfolio, and deliver client galleries — all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button className="group bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-12 py-5 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1">
                Get Started Free
                <ArrowRight className="ml-3 h-5 w-5 inline group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="group flex items-center text-gray-700 border-2 border-gray-200 hover:border-indigo-300 px-12 py-5 rounded-2xl font-semibold text-lg hover:bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Explore Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Cards Hero Visual */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Main mockup card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-500">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 h-80 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="absolute top-4 left-10 w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="absolute top-4 left-16 w-3 h-3 bg-green-400 rounded-full"></div>
                
                <Camera className="h-24 w-24 text-indigo-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Studio Portfolio</h3>
                <p className="text-gray-600 text-center max-w-sm">Your professional photography website with custom branding</p>
                
                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/30 transform rotate-12 hover:rotate-0 transition-all duration-500">
                  <Image className="h-8 w-8 text-purple-500" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/30 transform -rotate-12 hover:rotate-0 transition-all duration-500">
                  <Calendar className="h-8 w-8 text-indigo-500" />
                </div>
              </div>
            </div>
            
            {/* Floating side cards */}
            <div className="absolute -top-12 -left-12 hidden lg:block">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 transform hover:scale-110 transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Payment Received</p>
                    <p className="text-sm text-gray-600">Wedding Session - ₦150,000</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-12 -right-12 hidden lg:block">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 transform hover:scale-110 transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Gallery Shared</p>
                    <p className="text-sm text-gray-600">124 photos delivered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Features */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 h-full hover:bg-white/80 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 transform hover:-translate-y-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Screenshot */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 transform rotate-3 hover:rotate-0 transition-all duration-700">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="h-24 w-24 text-indigo-500 mx-auto mb-6" />
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">Professional Studio Page</h4>
                    <p className="text-gray-600">Complete with galleries, booking, and payments</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
            </div>
            
            {/* Right side - Content */}
            <div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                A Professional Studio
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Online</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  "Personalized mini-website with your brand",
                  "Client accounts with private galleries",
                  "Bookings & payments handled seamlessly",
                  "AI-powered photo tools for efficiency"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xl text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
              
              <button className="mt-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1">
                See It In Action
                <ArrowRight className="ml-3 h-5 w-5 inline" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Lensra Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a photographer, client, or agency, Lensra adapts to your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {whyLensraCards.map((card, index) => (
              <div key={index} className="group relative">
                <div className="bg-white border-2 border-transparent bg-clip-padding rounded-3xl p-8 h-full hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -m-[2px] -z-10`}></div>
                  <div className="absolute inset-[2px] bg-white rounded-3xl -z-10"></div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            Start free and scale as your photography business grows
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-left">
              <h3 className="text-3xl font-bold text-white mb-2">Free</h3>
              <p className="text-indigo-100 mb-6">Perfect for getting started</p>
              <ul className="space-y-4 mb-8">
                {["2 client galleries", "Basic watermark", "500MB storage", "Email support"].map((feature, index) => (
                  <li key={index} className="flex items-center text-white">
                    <Check className="h-5 w-5 mr-3 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300">
                Start Free
              </button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-8 text-left relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Pro</h3>
              <p className="text-indigo-100 mb-6">Best for growing studios</p>
              <ul className="space-y-4 mb-8">
                {["Unlimited galleries", "Custom domain", "25GB storage", "AI tools included", "Priority support"].map((feature, index) => (
                  <li key={index} className="flex items-center text-white">
                    <Check className="h-5 w-5 mr-3 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300">
                Upgrade to Pro
              </button>
            </div>
          </div>
          
          <div className="mt-12">
            <button className="text-white border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300">
              View Full Pricing →
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by photographers across Nigeria & beyond
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-12 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{testimonials[currentTestimonial].author}</p>
                  <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              
              {/* Testimonial navigation */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to elevate your
            <br />photography business?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of photographers who've transformed their business with Lensra. 
            Start your free trial today — no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group bg-white text-indigo-600 px-12 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              Start Free Today
              <ArrowRight className="ml-3 h-5 w-5 inline group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="group text-white border-2 border-white/30 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300">
              <Play className="mr-3 h-5 w-5 inline group-hover:scale-110 transition-transform duration-300" />
              See a Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Camera className="h-7 w-7 text-white" />
                </div>
                <span className="ml-3 text-3xl font-bold">Lensra</span>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Empowering photographers to build beautiful online presences and grow their businesses with cutting-edge tools.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">Legal & Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-12 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <p className="text-gray-400">&copy; 2025 Lensra. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-400">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm">Made with love in Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LensraLanding;