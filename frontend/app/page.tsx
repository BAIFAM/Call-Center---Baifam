"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Users,
  Building2,
  Headphones,
  BarChart3,
  MessageSquare,
  PhoneCall,
  Zap,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Play,
  Sparkles,
  Database,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Target,
  TrendingUp,
  Award,
  Globe,
  Cloud,
  Activity
} from "lucide-react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { selectAccessToken } from "@/store/auth/selectors";
import FixedLoader from "@/components/common/fixed-loader";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const accessToken = useSelector(selectAccessToken);

  useEffect(() => {
    const token = accessToken;

    if (token) {
      setIsLoggedIn(true);
      router.push("/dashboard");
    }
  }, [router, accessToken]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isLoggedIn) {
    return <FixedLoader />;
  }

  const features = [
    {
      icon: Users,
      title: "Bulk Contact Management",
      description: "Import and manage thousands of contacts with advanced filtering and segmentation"
    },
    {
      icon: Building2,
      title: "Multi-Client Support",
      description: "Handle multiple client companies with dedicated workspaces and permissions"
    },
    {
      icon: PhoneCall,
      title: "In-App Calling",
      description: "Make calls directly from the platform with advanced call routing and recording"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track performance metrics and generate detailed reports for all campaigns"
    }
  ];

  const stats = [
    { value: "10M+", label: "Calls Processed" },
    { value: "5K+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CallHub Pro</h1>
                <p className="text-xs text-slate-400">Professional Call Center</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors duration-200 relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#solutions" className="text-slate-300 hover:text-white transition-colors duration-200 relative group">
                Solutions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#testimonials" className="text-slate-300 hover:text-white transition-colors duration-200 relative group">
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-8 px-4 py-2 bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Next Generation Call Center Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Revolutionize Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Call Center
                </span>{" "}
                Operations
              </h1>
              
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Streamline your call center with advanced contact management, multi-client support, 
                and powerful analytics. Scale your operations effortlessly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 py-4 rounded-xl transition-all duration-200 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Zap className="w-4 h-4 mr-2" />
                Core Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Scale
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Our comprehensive platform provides all the tools your call center needs to operate efficiently and grow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Database,
                  title: "Advanced Contact Management",
                  description: "Import, organize, and manage millions of contacts with intelligent segmentation and filtering capabilities.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Building2,
                  title: "Multi-Client Workspaces",
                  description: "Manage multiple client companies with dedicated environments, custom branding, and role-based access.",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: Phone,
                  title: "Integrated Calling System",
                  description: "Make calls directly from the platform with auto-dialing, call recording, and advanced routing features.",
                  color: "from-green-500 to-teal-500"
                },
                {
                  icon: BarChart3,
                  title: "Real-Time Analytics",
                  description: "Track performance metrics, generate detailed reports, and make data-driven decisions in real-time.",
                  color: "from-orange-500 to-red-500"
                },
                {
                  icon: MessageSquare,
                  title: "Omnichannel Communication",
                  description: "Handle voice, SMS, email, and chat conversations from a single unified interface.",
                  color: "from-indigo-500 to-blue-500"
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description: "Bank-level security with encryption, compliance features, and audit trails for all activities.",
                  color: "from-slate-500 to-gray-500"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="solutions" className="py-20 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-6 px-4 py-2 bg-green-500/10 text-green-400 border-green-500/20">
                  <Target className="w-4 h-4 mr-2" />
                  Live Demo
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  See How It Works in{" "}
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Real-Time
                  </span>
                </h2>
                <p className="text-lg text-slate-300 mb-8">
                  Experience the power of our platform with interactive features that showcase 
                  real call center scenarios and workflows.
                </p>
                
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        activeFeature === index 
                          ? 'bg-blue-500/10 border-blue-500/50' 
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                      }`}
                      onClick={() => setActiveFeature(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activeFeature === index ? 'bg-blue-500' : 'bg-slate-700'
                        }`}>
                          <feature.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{feature.title}</h3>
                          <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-slate-400 text-sm">CallHub Pro Dashboard</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-white">Active Calls</span>
                      </div>
                      <span className="text-green-400 font-semibold">142</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-white">Available Agents</span>
                      </div>
                      <span className="text-blue-400 font-semibold">28</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-white">Conversion Rate</span>
                      </div>
                      <span className="text-purple-400 font-semibold">23.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <Star className="w-4 h-4 mr-2" />
                Customer Success
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Trusted by{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Industry Leaders
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Join thousands of companies that have transformed their call center operations with CallHub Pro.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "CallHub Pro transformed our call center operations. We've seen a 40% increase in productivity and our agents love the intuitive interface.",
                  author: "Sarah Chen",
                  title: "VP of Operations",
                  company: "TechCorp Solutions"
                },
                {
                  quote: "The multi-client support feature is game-changing. We can now manage all our clients from one platform with complete separation and security.",
                  author: "Michael Rodriguez",
                  title: "Call Center Director",
                  company: "Global Connect"
                },
                {
                  quote: "The analytics and reporting capabilities give us insights we never had before. We can make data-driven decisions in real-time.",
                  author: "Emily Johnson",
                  title: "Head of Customer Service",
                  company: "ServiceFirst Inc"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.author}</div>
                      <div className="text-slate-400 text-sm">{testimonial.title}</div>
                      <div className="text-slate-500 text-xs">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Call Center?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-10">
                Join thousands of businesses already using CallHub Pro to streamline their operations 
                and boost productivity. Start your free trial today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 py-4 rounded-xl transition-all duration-200 text-lg"
                >
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800/50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CallHub Pro</h1>
                <p className="text-xs text-slate-400">Professional Call Center Platform</p>
              </div>
            </div>
            
            <nav className="flex gap-8">
              <Link href="#features" className="text-slate-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#solutions" className="text-slate-400 hover:text-white transition-colors">
                Solutions
              </Link>
              <Link href="#testimonials" className="text-slate-400 hover:text-white transition-colors">
                Testimonials
              </Link>
            </nav>
            
            <div className="text-slate-400 text-sm">
              © 2025 CallHub Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}