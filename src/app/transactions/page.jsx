"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  Activity,
  AlertCircle,
  Banknote,
  Star,
  Crown,
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
      
      {isOpen && !isLoading && options.length > 0 && (
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
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [merchantFilter, setMerchantFilter] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const {
    data: transactionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "transactions",
      search,
      statusFilter,
      merchantFilter,
      dateRange,
      transactionTypeFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (merchantFilter) params.append("merchant_id", merchantFilter);
      if (transactionTypeFilter)
        params.append("transaction_type", transactionTypeFilter);

      // Calculate date range
      if (dateRange !== "all") {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
        params.append("start_date", startDate.toISOString());
        params.append("end_date", endDate.toISOString());
      }

      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    },
    onError: () => {
      toast.error("Failed to load transactions");
    },
  });

  const { data: merchantsData } = useQuery({
    queryKey: ["merchants-list"],
    queryFn: async () => {
      const response = await fetch("/api/merchants?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch merchants");
      }
      return response.json();
    },
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-300 bg-green-500/20 border border-green-400/30";
      case "pending":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-400/30";
      case "failed":
        return "text-red-300 bg-red-500/20 border border-red-400/30";
      case "refunded":
        return "text-blue-300 bg-blue-500/20 border border-blue-400/30";
      default:
        return "text-gray-300 bg-gray-500/20 border border-gray-400/30";
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "payment":
        return "text-green-400";
      case "refund":
        return "text-red-400";
      case "chargeback":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

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
          <h2 className="text-2xl font-bold text-white mb-2">Loading Transactions</h2>
          <p className="text-white/70">Please wait while we fetch your data...</p>
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
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    Transaction Management
                  </h1>
                  <p className="text-white/70 text-lg">
                    Monitor and manage payment processing
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
              <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                <Download className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {transactionsData?.analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <DollarSign className="h-7 w-7 text-green-400" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-white/80 mb-1">
                    Total Volume
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-emerald-400 transition-all duration-300">
                    {formatCurrency(transactionsData.analytics.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CreditCard className="h-7 w-7 text-blue-400" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-white/80 mb-1">
                    Total Transactions
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                    {transactionsData.analytics.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-7 w-7 text-purple-400" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-white/80 mb-1">
                    Our Revenue
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {formatCurrency(transactionsData.analytics.totalRevenue)}
                  </p>
                  <p className="text-sm text-purple-400 font-medium mt-1">
                    {transactionsData.analytics.nonCashTransactions} non-cash txns
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Banknote className="h-7 w-7 text-orange-400" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-white/80 mb-1">
                    Cash Transactions
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-yellow-400 transition-all duration-300">
                    {transactionsData.analytics.cashTransactions}
                  </p>
                  <p className="text-sm text-orange-400 font-medium mt-1">No revenue earned</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 hover:bg-white/15 transition-all duration-500">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="input-field gradient-border shimmer">
              <div className="input-icon">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="input-field gradient-border shimmer">
              <div className="input-icon">
                <Filter className="h-5 w-5" />
              </div>
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "", label: "All Status" },
                  { value: "completed", label: "Completed" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                  { value: "refunded", label: "Refunded" }
                ]}
                placeholder="All Status"
              />
            </div>

            <div className="input-field gradient-border shimmer">
              <div className="input-icon">
                <CreditCard className="h-5 w-5" />
              </div>
              <CustomDropdown
                value={transactionTypeFilter}
                onChange={setTransactionTypeFilter}
                options={[
                  { value: "", label: "All Types" },
                  { value: "payment", label: "Payment" },
                  { value: "refund", label: "Refund" },
                  { value: "chargeback", label: "Chargeback" }
                ]}
                placeholder="All Types"
              />
            </div>

            <div className="input-field gradient-border shimmer">
              <div className="input-icon">
                <Building2 className="h-5 w-5" />
              </div>
              <CustomDropdown
                value={merchantFilter}
                onChange={setMerchantFilter}
                options={[
                  { value: "", label: "All Merchants" },
                  ...(merchantsData?.merchants ? merchantsData.merchants.map((merchant) => ({
                    value: merchant.id,
                    label: merchant.business_name
                  })) : [])
                ]}
                placeholder="All Merchants"
                isLoading={!merchantsData}
              />
            </div>

            <div className="input-field gradient-border shimmer">
              <div className="input-icon">
                <Calendar className="h-5 w-5" />
              </div>
              <CustomDropdown
                value={dateRange}
                onChange={setDateRange}
                options={[
                  { value: "7", label: "Last 7 days" },
                  { value: "30", label: "Last 30 days" },
                  { value: "90", label: "Last 90 days" },
                  { value: "all", label: "All time" }
                ]}
                placeholder="Select Date Range"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-500">
          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Transactions ({transactionsData?.transactions?.length || 0})
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
            </div>
          </div>

          {transactionsData?.transactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Fee / Revenue
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactionsData.transactions.map((transaction) => (
                    <tr key={transaction.id} className="group hover:bg-white/10 transition-all duration-300 hover:scale-[1.01]">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {transaction.is_cash_transaction ? (
                                <Banknote className="h-6 w-6 text-orange-400" />
                              ) : (
                                <CreditCard className="h-6 w-6 text-blue-400" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-bold text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                {transaction.reference_number ||
                                  `TXN-${transaction.id}`}
                              </div>
                              {transaction.is_cash_transaction && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-400/30">
                                  Cash
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-sm ${getTransactionTypeColor(transaction.transaction_type)}`}
                            >
                              {transaction.transaction_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                {transaction.business_name}
                              </div>
                              {transaction.is_loyal_merchant && (
                                <Crown className="h-3 w-3 text-yellow-400 ml-1" />
                              )}
                            </div>
                            <div className="text-sm text-white/60">
                              {transaction.contact_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-bold text-white group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {formatCurrency(transaction.transaction_amount)}
                        </div>
                        {transaction.customer_email && (
                          <div className="text-sm text-white/60">
                            {transaction.customer_email}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-white/80">
                          Fee: {formatCurrency(transaction.transaction_fee)}
                        </div>
                        <div className="text-sm font-medium">
                          {transaction.is_cash_transaction ? (
                            <span className="text-orange-400">
                              Revenue: $0.00
                            </span>
                          ) : (
                            <span className="text-green-400">
                              Revenue:{" "}
                              {formatCurrency(transaction.our_revenue || 0)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/60">
                          {transaction.is_cash_transaction
                            ? "Cash - No revenue"
                            : `1.5% or min ₹0.10`}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status || 'pending')}`}
                        >
                          {transaction.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-white/60">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-purple-400" />
                          {formatDate(transaction.processed_at)}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewTransaction(transaction)}
                          className="group flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:scale-105"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Eye className="h-4 w-4" />
                          </div>
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CreditCard className="h-10 w-10 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No transactions found
              </h3>
              <p className="text-white/60 text-lg">
                Transactions will appear here once merchants start processing payments.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {transactionsData?.pagination &&
          transactionsData.pagination.hasMore && (
            <div className="mt-6 flex justify-center">
              <button className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Load More Transactions
              </button>
            </div>
          )}
      </div>

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Transaction Details
                    </h3>
                    <p className="text-white/70">
                      {selectedTransaction.reference_number || `TXN-${selectedTransaction.id}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeTransactionModal}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Transaction Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                    Transaction Amount
                  </h4>
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatCurrency(selectedTransaction.transaction_amount)}
                  </div>
                  <div className={`text-sm font-medium ${getTransactionTypeColor(selectedTransaction.transaction_type)}`}>
                    {selectedTransaction.transaction_type}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                    Revenue Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Fee:</span>
                      <span className="text-white font-medium">
                        {formatCurrency(selectedTransaction.transaction_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Revenue:</span>
                      <span className={`font-medium ${selectedTransaction.is_cash_transaction ? 'text-orange-400' : 'text-green-400'}`}>
                        {selectedTransaction.is_cash_transaction 
                          ? '$0.00' 
                          : formatCurrency(selectedTransaction.our_revenue || 0)
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchant Information */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                  Merchant Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Business Name</label>
                    <div className="text-white font-medium flex items-center">
                      {selectedTransaction.business_name}
                      {selectedTransaction.is_loyal_merchant && (
                        <Crown className="h-4 w-4 text-yellow-400 ml-2" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Contact Name</label>
                    <div className="text-white font-medium">
                      {selectedTransaction.contact_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Status & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-yellow-400" />
                    Status
                  </h4>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status || 'pending')}`}
                  >
                    {selectedTransaction.status || 'Pending'}
                  </span>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                    Date & Time
                  </h4>
                  <div className="text-white font-medium">
                    {formatDate(selectedTransaction.processed_at)}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {selectedTransaction.customer_email && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Customer Information</h4>
                  <div>
                    <label className="text-sm text-white/70">Email</label>
                    <div className="text-white font-medium">
                      {selectedTransaction.customer_email}
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Transaction Notice */}
              {selectedTransaction.is_cash_transaction && (
                <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-6">
                  <div className="flex items-center">
                    <Banknote className="h-6 w-6 text-orange-400 mr-3" />
                    <div>
                      <h4 className="text-lg font-semibold text-orange-300">Cash Transaction</h4>
                      <p className="text-orange-200/80">
                        This is a cash transaction with no processing revenue earned.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-white/20 flex justify-end space-x-4">
              <button
                onClick={closeTransactionModal}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
