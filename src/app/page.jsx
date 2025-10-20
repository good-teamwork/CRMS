"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { getCurrentUser, removeAuthToken } from "../utils/auth.js";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CreditCard,
  HeadphonesIcon,
  TrendingUp,
  Building2,
  AlertCircle,
  DollarSign,
  Activity,
  Crown,
  Smartphone,
  Download,
  Star,
  LogOut,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Sparkles,
  Target,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import { toast } from "sonner";

// Custom Dropdown Component
function CustomDropdown({ value, onChange, options, placeholder, className = "", isLoading = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value) || { label: placeholder, value: '' };

  return (
    <div className={`relative custom-dropdown ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 pl-10 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-200 appearance-none cursor-pointer hover:bg-white/15 focus:bg-white/15 min-w-[140px] flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-white/90">
          {isLoading ? 'Loading...' : selectedOption.label}
        </span>
        <svg 
          className={`h-4 w-4 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && !isLoading && options.length > 0 && (
        <div 
          className="fixed dropdown-options bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
          style={{ 
            zIndex: 9999,
            top: position.top,
            left: position.left,
            width: position.width
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200 flex items-center justify-between ${
                option.value === value ? 'bg-blue-500/20 text-white' : ''
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState("30");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const useMock = true; // Force mock data for testing
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const logout = () => {
    removeAuthToken();
    navigate("/account/signin");
  };

  const mockedStats = useMemo(() => {
    if (!useMock) return null;
    const today = new Date();
    const days = 30;
    const dailyVolume = Array.from({ length: days }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      return {
        date: d.toISOString(),
        daily_volume: 20000 + Math.round(Math.random() * 50000),
      };
    });
    return {
      merchants: {
        total_merchants: 128,
        new_merchants: 4,
        loyal_merchants: 76,
        active_merchants: 95,
        pending_merchants: 18,
        under_review_merchants: 15,
      },
      transactions: {
        total_volume: 1250000,
        recent_volume: 48000,
        total_revenue: 93000,
        recent_revenue: 3400,
      },
      support: { open_tickets: 6, high_priority_open: 2 },
      mobileApps: {
        active_apps: 9,
        apps_with_free_version: 5,
        total_downloads: 148000,
        total_active_users: 28900,
      },
      appTransactions: {
        total_app_revenue: 54000,
        recent_app_revenue: 2100,
        free_version_transactions: 420,
        total_app_transactions: 3180,
      },
      dailyVolume,
      topApps: [
        { app_name: "POS Express", total_revenue: 2200 },
        { app_name: "Retail Pro", total_revenue: 1800 },
        { app_name: "Salon Suite", total_revenue: 1200 },
        { app_name: "FoodCart", total_revenue: 900 },
        { app_name: "GymGo", total_revenue: 700 },
      ],
      recentTickets: [
        {
          id: "t1",
          subject: "Payout delay investigation",
          business_name: "Acme Stores",
          created_at: new Date().toISOString(),
          priority: "high",
          status: "open",
        },
        {
          id: "t2",
          subject: "App login issues",
          business_name: "GymGo",
          created_at: new Date().toISOString(),
          priority: "medium",
          status: "in_progress",
        },
      ],
    };
  }, [useMock]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats", period],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }
      return response.json();
    },
    enabled: !useMock,
    refetchInterval: useMock ? false : 30000,
    onError: () => {
      if (!useMock) toast.error("Failed to load dashboard data");
    },
  });

  if (!useMock && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-white/80 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!useMock && error && !mockedStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-white/80 text-lg font-medium">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const effectiveStats = useMock ? mockedStats : stats;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "under_review":
        return "text-blue-600 bg-blue-100";
      case "open":
        return "text-red-600 bg-red-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden dashboard-scrollbar">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A855F7' fill-opacity='0.15'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3Ccircle cx='20' cy='20' r='0.8'/%3E%3Ccircle cx='60' cy='60' r='0.8'/%3E%3Ccircle cx='20' cy='60' r='0.6'/%3E%3Ccircle cx='60' cy='20' r='0.6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            animation: 'backgroundFloat 20s ease-in-out infinite'
          }}></div>
        </div>

        {/* Dynamic Floating Orbs with Enhanced Effects */}
        <div className="absolute top-16 left-8 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-purple-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-16 right-8 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-blue-600/10 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-pink-600/5 rounded-full blur-3xl animate-float-diagonal"></div>
        
        {/* Additional Floating Elements */}
        <div className="absolute top-32 right-1/4 w-48 h-48 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 rounded-full blur-2xl animate-float-fast"></div>
        <div className="absolute bottom-32 left-1/4 w-56 h-56 bg-gradient-to-br from-emerald-500/12 to-teal-500/8 rounded-full blur-2xl animate-float-medium"></div>
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23A855F7' stroke-opacity='0.3' stroke-width='0.5'%3E%3Cpath d='M0 0h100v100H0z'/%3E%3Cpath d='M0 0v100M100 0v100M0 0h100M0 100h100'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            animation: 'gridPulse 15s ease-in-out infinite'
          }}></div>
        </div>

        {/* Particle Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/60 rounded-full animate-particle-1"></div>
          <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-particle-2"></div>
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-400/60 rounded-full animate-particle-3"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-cyan-400/60 rounded-full animate-particle-4"></div>
          <div className="absolute top-1/3 left-2/3 w-1 h-1 bg-indigo-400/60 rounded-full animate-particle-5"></div>
        </div>

        {/* Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-900/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-blue-900/5 to-transparent"></div>

        {/* Header */}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      MSP Management Portal
                    </h1>
                    <p className="text-white/70 mt-1">
                      Merchant onboarding, processing dashboard & mobile app analytics
                    </p>
                  </div>
                </div>
              </div>
              <div className={`flex items-center space-x-4 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="relative">
                  <Filter className="h-4 w-4 text-white/60 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10" />
                  <CustomDropdown
                    value={period}
                    onChange={setPeriod}
                    options={[
                      { value: "7", label: "Last 7 days" },
                      { value: "30", label: "Last 30 days" },
                      { value: "90", label: "Last 90 days" }
                    ]}
                    placeholder="Select Period"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 group">
                    <Bell className="h-5 w-5 text-white/80 group-hover:text-white" />
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 group">
                    <Settings className="h-5 w-5 text-white/80 group-hover:text-white" />
                  </button>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-xl px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <span className="text-white/90 text-sm font-medium">Welcome, {user?.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 group"
                  >
                    <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dashboard-scrollbar">
          {/* Merchant Stats Cards */}
          <div className="mb-12">
            <div className={`flex items-center space-x-3 mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Merchant Services</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Total Merchants Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '400ms' }}
                onMouseEnter={() => setHoveredCard('merchants')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Total Merchants</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {effectiveStats?.merchants?.total_merchants || 0}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-400 font-medium">
                        +{effectiveStats?.merchants?.new_merchants || 0} new
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loyal Merchants Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '500ms' }}
                onMouseEnter={() => setHoveredCard('loyal')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <Sparkles className="h-5 w-5 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Loyal Merchants</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {effectiveStats?.merchants?.loyal_merchants || 0}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-yellow-400 font-medium">3+ months active</span>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Volume Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '600ms' }}
                onMouseEnter={() => setHoveredCard('volume')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Processing Volume</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {formatCurrency(effectiveStats?.transactions?.total_volume || 0)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-400 font-medium">
                        {formatCurrency(effectiveStats?.transactions?.recent_volume || 0)} recent
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchant Revenue Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '700ms' }}
                onMouseEnter={() => setHoveredCard('revenue')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <BarChart3 className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Merchant Revenue</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {formatCurrency(effectiveStats?.transactions?.total_revenue || 0)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-purple-400 font-medium">
                        {formatCurrency(effectiveStats?.transactions?.recent_revenue || 0)} recent
                      </span>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Open Tickets Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-red-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '800ms' }}
                onMouseEnter={() => setHoveredCard('tickets')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <HeadphonesIcon className="h-6 w-6 text-white" />
                    </div>
                    <AlertCircle className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Open Tickets</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {effectiveStats?.support?.open_tickets || 0}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-red-400 font-medium">
                        {effectiveStats?.support?.high_priority_open || 0} high priority
                      </span>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile App Stats Cards */}
          <div className="mb-12">
            <div className={`flex items-center space-x-3 mb-8 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Mobile Applications</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Apps Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '1000ms' }}
                onMouseEnter={() => setHoveredCard('apps')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <Zap className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Active Apps</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {effectiveStats?.mobileApps?.active_apps || 0}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-indigo-400 font-medium">
                        {effectiveStats?.mobileApps?.apps_with_free_version || 0} with free version
                      </span>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Downloads Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '1100ms' }}
                onMouseEnter={() => setHoveredCard('downloads')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                    <Target className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Total Downloads</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {formatNumber(effectiveStats?.mobileApps?.total_downloads || 0)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-cyan-400 font-medium">
                        {formatNumber(effectiveStats?.mobileApps?.total_active_users || 0)} active users
                      </span>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Revenue Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-emerald-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '1200ms' }}
                onMouseEnter={() => setHoveredCard('app-revenue')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <PieChart className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">App Revenue</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {formatCurrency(effectiveStats?.appTransactions?.total_app_revenue || 0)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-emerald-400 font-medium">
                        {formatCurrency(effectiveStats?.appTransactions?.recent_app_revenue || 0)} recent
                      </span>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Version Transactions Card */}
              <div 
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '1300ms' }}
                onMouseEnter={() => setHoveredCard('free-txns')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <Activity className="h-5 w-5 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">Free Version Txns</p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {formatNumber(effectiveStats?.appTransactions?.free_version_transactions || 0)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-orange-400 font-medium">
                        {formatNumber(effectiveStats?.appTransactions?.total_app_transactions || 0)} total
                      </span>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Daily Volume Chart */}
            <div className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Daily Processing Volume</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/60">Live Data</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={effectiveStats?.dailyVolume || []}>
                      <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      />
                      <YAxis
                        tickFormatter={(value) => {
                          if (!value || value === 0) return '$0';
                          if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                          return `$${value.toFixed(0)}`;
                        }}
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                        formatter={(value) => [formatCurrency(value), "Volume"]}
                        labelFormatter={(label) => formatDate(label)}
                      />
                      <Area
                        type="monotone"
                        dataKey="daily_volume"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fill="url(#volumeGradient)"
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Performing Apps Chart */}
            <div className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1500ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Top Performing Apps</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/60">Revenue</span>
                    <span className="text-xs text-white/40 ml-2">
                      ({effectiveStats?.topApps?.length || 0} apps)
                    </span>
                  </div>
                </div>
                <div className="h-80">
                  {effectiveStats?.topApps?.length > 0 ? (
                    <div className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={effectiveStats?.topApps?.slice(0, 5) || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                              <stop offset="50%" stopColor="#A855F7" stopOpacity={0.9}/>
                              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A855F7" stopOpacity={1}/>
                              <stop offset="50%" stopColor="#C084FC" stopOpacity={0.9}/>
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="app_name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                          />
                          <YAxis
                            tickFormatter={(value) => {
                              if (!value || value === 0) return '$0';
                              if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                              return `$${value.toFixed(0)}`;
                            }}
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(168, 85, 247, 0.95) 100%)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              borderRadius: '16px',
                              color: '#ffffff',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                              backdropFilter: 'blur(10px)',
                              fontSize: '14px',
                              fontWeight: '500',
                              padding: '12px 16px'
                            }}
                            formatter={(value) => [formatCurrency(value), "Revenue"]}
                            labelFormatter={(label) => label}
                            cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                            animationDuration={200}
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="custom-tooltip" style={{
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(168, 85, 247, 0.95) 100%)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '16px',
                                    padding: '12px 16px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    color: '#ffffff'
                                  }}>
                                    <div style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '8px', 
                                      marginBottom: '8px',
                                      color: '#ffffff',
                                      fontWeight: '600'
                                    }}>
                                      <Smartphone size={16} color="#ffffff" />
                                      <span style={{ color: '#ffffff' }}>{label}</span>
                                    </div>
                                    <div style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '8px',
                                      color: '#ffffff',
                                      fontWeight: '500'
                                    }}>
                                      <DollarSign size={16} color="#ffffff" />
                                      <span style={{ color: '#ffffff' }}>{formatCurrency(payload[0].value)}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="total_revenue" 
                            fill="#8B5CF6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                            style={{
                              filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))'
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60 text-lg">No app data available</p>
                        <p className="text-white/40 text-sm">Check back later for updates</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Merchant Status Overview */}
            <div className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-green-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="px-6 py-6 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Merchant Status Overview</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center group/item">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-white/80">Active</span>
                      </div>
                      <span className="text-2xl font-bold text-white group-hover/item:scale-110 transition-transform duration-200">
                        {effectiveStats?.merchants?.active_merchants || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-white/80">Pending</span>
                      </div>
                      <span className="text-2xl font-bold text-white group-hover/item:scale-110 transition-transform duration-200">
                        {effectiveStats?.merchants?.pending_merchants || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-white/80">Under Review</span>
                      </div>
                      <span className="text-2xl font-bold text-white group-hover/item:scale-110 transition-transform duration-200">
                        {effectiveStats?.merchants?.under_review_merchants || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Support Tickets */}
            <div className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-red-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1700ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="px-6 py-6 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <HeadphonesIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Recent Support Tickets</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {effectiveStats?.recentTickets?.map((ticket, index) => (
                      <div
                        key={ticket.id}
                        className={`group/item flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                        style={{ transitionDelay: `${1800 + index * 100}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover/item:text-white/90">
                            {ticket.subject}
                          </p>
                          <p className="text-sm text-white/60">
                            {ticket.business_name} • {formatDate(ticket.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              ticket.priority === 'high' 
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                : ticket.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              ticket.status === 'open' 
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                : ticket.status === 'in_progress'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!effectiveStats?.recentTickets ||
                      effectiveStats.recentTickets.length === 0) && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HeadphonesIcon className="h-8 w-8 text-white/40" />
                        </div>
                        <p className="text-white/60">No recent tickets</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-cyan-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1900ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <a
                  href="/merchants"
                  className={`group/action flex items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '2000ms' }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 group-hover/action:scale-110 transition-transform duration-300">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover/action:text-blue-300 transition-colors">Manage Merchants</p>
                    <p className="text-sm text-white/60">
                      View and manage merchant accounts
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40 group-hover/action:text-blue-400 group-hover/action:translate-x-1 group-hover/action:-translate-y-1 transition-all duration-300 ml-auto" />
                </a>
                
                <a
                  href="/mobile-apps"
                  className={`group/action flex items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '2100ms' }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 group-hover/action:scale-110 transition-transform duration-300">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover/action:text-indigo-300 transition-colors">Mobile Apps</p>
                    <p className="text-sm text-white/60">
                      Manage Android SaaS applications
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40 group-hover/action:text-indigo-400 group-hover/action:translate-x-1 group-hover/action:-translate-y-1 transition-all duration-300 ml-auto" />
                </a>
                
                <a
                  href="/transactions"
                  className={`group/action flex items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '2200ms' }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover/action:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover/action:text-green-300 transition-colors">View Transactions</p>
                    <p className="text-sm text-white/60">
                      Monitor processing activity
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40 group-hover/action:text-green-400 group-hover/action:translate-x-1 group-hover/action:-translate-y-1 transition-all duration-300 ml-auto" />
                </a>
                
                <a
                  href="/support"
                  className={`group/action flex items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '2300ms' }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover/action:scale-110 transition-transform duration-300">
                    <HeadphonesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover/action:text-purple-300 transition-colors">Support Portal</p>
                    <p className="text-sm text-white/60">
                      Handle merchant support requests
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40 group-hover/action:text-purple-400 group-hover/action:translate-x-1 group-hover/action:-translate-y-1 transition-all duration-300 ml-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
