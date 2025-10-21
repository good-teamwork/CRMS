"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Smartphone,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Filter,
  Search,
  Eye,
  Settings,
  Star,
  ShoppingCart,
  Activity,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  X,
} from "lucide-react";
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
    function updatePosition() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + 8, left: rect.left, width: rect.width });
      }
    }
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value) || { label: placeholder, value: '' };

  return (
    <div className={`relative custom-dropdown ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full pl-12 pr-12 py-4 border border-white/20 rounded-2xl text-white bg-white/8 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-200 ease-out shadow-sm shadow-black/5 hover:border-white/30 hover:bg-white/12 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-white/90">
          {isLoading ? 'Loading...' : selectedOption.label}
        </span>
        <svg 
          className={`h-5 w-5 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && !isLoading && options.length > 0 && createPortal(
        <div 
          className="fixed dropdown-options bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
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
              className={`w-full px-4 py-3 text-left text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200 flex items-center justify-between ${
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
        </div>,
        document.body
      )}
    </div>
  );
}

export default function MobileAppsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const queryClient = useQueryClient();

  const {
    data: appsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["mobile-apps", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);

      const response = await fetch(`/api/mobile-apps?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch mobile applications");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ["app-transactions", selectedApp?.id],
    queryFn: async () => {
      if (!selectedApp?.id) return null;
      const response = await fetch(
        `/api/mobile-apps/transactions?app_id=${selectedApp.id}&limit=10`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch app transactions");
      }
      return response.json();
    },
    enabled: !!selectedApp?.id,
  });

  const createAppMutation = useMutation({
    mutationFn: async (appData) => {
      const response = await fetch("/api/mobile-apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData),
      });
      if (!response.ok) {
        throw new Error("Failed to create mobile application");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mobile-apps"]);
      setShowAddForm(false);
      toast.success("Mobile application created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateAppMutation = useMutation({
    mutationFn: async (appData) => {
      const response = await fetch("/api/mobile-apps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData),
      });
      if (!response.ok) {
        throw new Error("Failed to update mobile application");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mobile-apps"]);
      toast.success("Mobile application updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const appData = {
        app_name: formData.get("app_name"),
        app_type: formData.get("app_type"),
        description: formData.get("description"),
        version: formData.get("version"),
        revenue_rate: parseFloat(formData.get("revenue_rate")) || 0.002,
        is_free_version: formData.get("is_free_version") === "on",
        total_downloads: parseInt(formData.get("total_downloads")) || 0,
        active_users: parseInt(formData.get("active_users")) || 0,
      };

      createAppMutation.mutate(appData);
    },
    [createAppMutation]
  );

  const updateAppStatus = useCallback(
    (appId, newStatus) => {
      updateAppMutation.mutate({ id: appId, status: newStatus });
    },
    [updateAppMutation]
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatRevenueRate = (rate) => {
    if (!rate || isNaN(rate)) return "0.00%";
    return `${(rate * 100).toFixed(2)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-300 bg-green-500/20 border border-green-400/30";
      case "inactive":
        return "text-red-300 bg-red-500/20 border border-red-400/30";
      case "maintenance":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-400/30";
      default:
        return "text-gray-300 bg-gray-500/20 border border-gray-400/30";
    }
  };

  const getAppTypeIcon = (appType) => {
    switch (appType.toLowerCase()) {
      case "point of sale":
        return <ShoppingCart className="h-5 w-5" />;
      case "business utility":
        return <Settings className="h-5 w-5" />;
      case "marketing & analytics":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Smartphone className="h-5 w-5" />;
    }
  };

  const filteredApps = appsData?.apps?.filter((app) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        app.app_name.toLowerCase().includes(searchLower) ||
        app.app_type.toLowerCase().includes(searchLower) ||
        app.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A855F7' fill-opacity='0.15'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3Ccircle cx='20' cy='20' r='0.8'/%3E%3Ccircle cx='60' cy='60' r='0.8'/%3E%3Ccircle cx='20' cy='60' r='0.6'/%3E%3Ccircle cx='60' cy='20' r='0.6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            animation: 'backgroundFloat 20s ease-in-out infinite'
          }}></div>
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-16 left-8 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-purple-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-16 right-8 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-blue-600/10 rounded-full blur-3xl animate-float-reverse"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl animate-pulse">
            <Activity className="h-10 w-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Mobile Apps</h2>
          <p className="text-white/70">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A855F7' fill-opacity='0.15'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3Ccircle cx='20' cy='20' r='0.8'/%3E%3Ccircle cx='60' cy='60' r='0.8'/%3E%3Ccircle cx='20' cy='60' r='0.6'/%3E%3Ccircle cx='60' cy='20' r='0.6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            animation: 'backgroundFloat 20s ease-in-out infinite'
          }}></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mb-6 shadow-2xl">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-white/70 mb-6">Failed to load mobile applications</p>
          <button
            onClick={() => refetch()}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
          >
            <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-semibold text-lg">Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden dashboard-scrollbar">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A855F7' fill-opacity='0.15'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3Ccircle cx='20' cy='20' r='0.8'/%3E%3Ccircle cx='60' cy='60' r='0.8'/%3E%3Ccircle cx='20' cy='60' r='0.6'/%3E%3Ccircle cx='60' cy='20' r='0.6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          animation: 'backgroundFloat 20s ease-in-out infinite'
        }}></div>
      </div>

      {/* Dynamic Floating Orbs */}
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
          <div className="flex justify-between items-center py-8">
            <div className="group">
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    Mobile Applications
                  </h1>
                  <p className="text-white/70 text-lg">
                    Manage Android SaaS applications and track performance
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="group flex items-center space-x-2 text-white/80 hover:text-white font-medium transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span>Back to Dashboard</span>
              </a>
              <button
                onClick={() => refetch()}
                className="group flex items-center space-x-2 text-white/80 hover:text-white font-medium transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                </div>
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">Add Application</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 hover:bg-white/15 transition-all duration-500">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="input-field gradient-border shimmer">
                <div className="input-icon">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white/80" />
                </div>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <Filter className="h-5 w-5" />
                  </div>
                  <CustomDropdown
                    value={filters.status}
                    onChange={(value) => setFilters({ ...filters, status: value })}
                    options={[
                      { value: "", label: "All Status" },
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "maintenance", label: "Maintenance" }
                    ]}
                    placeholder="All Status"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div>
          {filteredApps && filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredApps.map((app, index) => (
                <div key={app.id} className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        {getAppTypeIcon(app.app_type)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                          {app.app_name}
                          {app.is_free_version && (
                            <Star className="h-5 w-5 inline ml-2 text-yellow-400 animate-pulse" />
                          )}
                        </h3>
                        <p className="text-sm text-white/60 font-medium">{app.app_type}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-white/70 text-sm mb-6 line-clamp-2">
                    {app.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <Download className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-white">
                        {formatNumber(app.total_downloads)}
                      </p>
                      <p className="text-xs text-white/60 font-medium">Downloads</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-white">
                        {formatNumber(app.active_users)}
                      </p>
                      <p className="text-xs text-white/60 font-medium">Active Users</p>
                    </div>
                  </div>

                  {/* Revenue Stats */}
                  <div className="border-t border-white/20 pt-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-white/60 font-medium">Total Revenue</span>
                      <span className="text-lg font-bold text-white">
                        {formatCurrency(app.total_our_revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-white/60 font-medium">Transactions</span>
                      <span className="text-lg font-bold text-white">
                        {formatNumber(app.total_transactions)}
                      </span>
                    </div>
                    {app.is_free_version && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60 font-medium">Free Version</span>
                        <span className="text-sm font-bold text-yellow-400">
                          {formatNumber(app.free_version_transactions)} txns
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
                    <div className="text-sm text-white/60 font-medium">
                      v{app.version}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="group flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-all duration-300 hover:scale-105"
                        title="View Details"
                      >
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                          <Eye className="h-4 w-4" />
                        </div>
                      </button>
                      <CustomDropdown
                        value={app.status}
                        onChange={(value) => updateAppStatus(app.id, value)}
                        options={[
                          { value: "active", label: "Active" },
                          { value: "inactive", label: "Inactive" },
                          { value: "maintenance", label: "Maintenance" }
                        ]}
                        placeholder="Select Status"
                        className="min-w-[120px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 shadow-2xl">
                <Smartphone className="h-10 w-10 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No mobile applications found
              </h3>
              <p className="text-white/60 text-lg">
                Get started by adding your first mobile application.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add App Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Mobile Application
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Name *
                  </label>
                  <input
                    type="text"
                    name="app_name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Type *
                  </label>
                  <select
                    name="app_type"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Business Utility">Business Utility</option>
                    <option value="Point of Sale">Point of Sale</option>
                    <option value="Marketing & Analytics">Marketing & Analytics</option>
                    <option value="Finance">Finance</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the application..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    name="version"
                    placeholder="1.0.0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue Rate (%)
                  </label>
                  <input
                    type="number"
                    name="revenue_rate"
                    step="0.0001"
                    defaultValue="0.0020"
                    min="0"
                    max="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_free_version"
                    id="is_free_version"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_free_version"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Has Free Version
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Downloads
                  </label>
                  <input
                    type="number"
                    name="total_downloads"
                    min="0"
                    defaultValue="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Active Users
                  </label>
                  <input
                    type="number"
                    name="active_users"
                    min="0"
                    defaultValue="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAppMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createAppMutation.isPending ? "Creating..." : "Create Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    {getAppTypeIcon(selectedApp.app_type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      {selectedApp.app_name}
                      {selectedApp.is_free_version && (
                        <Star className="h-6 w-6 ml-3 text-yellow-400" />
                      )}
                    </h2>
                    <p className="text-white/70 text-lg">{selectedApp.app_type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* App Info */}
                <div className="space-y-6">
                  {/* Application Details */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-blue-400" />
                      Application Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Version:</span>
                        <span className="text-white font-medium">{selectedApp.version || '1.0.0'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Status:</span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApp.status)}`}
                        >
                          {selectedApp.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Revenue Rate:</span>
                        <span className="text-white font-medium">
                          {formatRevenueRate(selectedApp.revenue_rate)}
                        </span>
                      </div>
                    </div>
                    
                    {selectedApp.description && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-white/80 text-sm leading-relaxed">{selectedApp.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Performance Stats */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                      Performance Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-400/30">
                        <Download className="h-6 w-6 text-blue-400 mb-2" />
                        <p className="text-2xl font-bold text-white">
                          {formatNumber(selectedApp.total_downloads || 0)}
                        </p>
                        <p className="text-sm text-white/70">Total Downloads</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-400/30">
                        <Users className="h-6 w-6 text-green-400 mb-2" />
                        <p className="text-2xl font-bold text-white">
                          {formatNumber(selectedApp.active_users || 0)}
                        </p>
                        <p className="text-sm text-white/70">Active Users</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-400/30">
                        <DollarSign className="h-6 w-6 text-purple-400 mb-2" />
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(selectedApp.total_our_revenue || 0)}
                        </p>
                        <p className="text-sm text-white/70">Total Revenue</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-400/30">
                        <Activity className="h-6 w-6 text-yellow-400 mb-2" />
                        <p className="text-2xl font-bold text-white">
                          {formatNumber(selectedApp.total_transactions || 0)}
                        </p>
                        <p className="text-sm text-white/70">Transactions</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-400" />
                    Recent Transactions
                  </h3>
                  {transactionsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                        <Activity className="h-6 w-6 text-white animate-spin" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transactionsData?.transactions?.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-white text-lg">
                                {formatCurrency(transaction.transaction_amount || 0)}
                              </p>
                              <p className="text-sm text-white/70">
                                {transaction.description || transaction.transaction_type || 'Transaction'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-400">
                                +{formatCurrency(transaction.our_revenue || 0)}
                              </p>
                              {transaction.is_free_version_transaction && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 mt-1">
                                  Free Version
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-white/60">
                            <span>{transaction.reference_number || `TXN-${transaction.id}`}</span>
                            <span>
                              {new Date(transaction.processed_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {(!transactionsData?.transactions ||
                        transactionsData.transactions.length === 0) && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Activity className="h-8 w-8 text-white/40" />
                          </div>
                          <p className="text-white/60">No transactions found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}