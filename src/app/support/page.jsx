'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  HeadphonesIcon, 
  Building2, 
  Calendar,
  Plus,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Activity,
  ArrowLeft,
  X
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function SupportPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newResponse, setNewResponse] = useState('');

  const queryClient = useQueryClient();

  const { data: ticketsData, isLoading, error } = useQuery({
    queryKey: ['support-tickets', search, statusFilter, priorityFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await fetch(`/api/support?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch support tickets');
      }
      return response.json();
    },
    onError: () => {
      toast.error('Failed to load support tickets');
    }
  });

  const { data: ticketDetails } = useQuery({
    queryKey: ['support-ticket', selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return null;
      const response = await fetch(`/api/support/${selectedTicket.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      return response.json();
    },
    enabled: !!selectedTicket?.id
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/support/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket'] });
      toast.success('Ticket updated successfully');
    },
    onError: () => {
      toast.error('Failed to update ticket');
    }
  });

  const addResponseMutation = useMutation({
    mutationFn: async ({ ticketId, response }) => {
      const res = await fetch(`/api/support/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_text: response,
          is_staff_response: true,
          responder_name: 'Support Staff',
          responder_email: 'support@company.com'
        })
      });
      if (!res.ok) {
        throw new Error('Failed to add response');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket'] });
      setNewResponse('');
      toast.success('Response added successfully');
    },
    onError: () => {
      toast.error('Failed to add response');
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-500/20 border border-red-400/30';
      case 'medium': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/30';
      case 'low': return 'text-green-300 bg-green-500/20 border border-green-400/30';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-400/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/30';
      case 'in_progress': return 'text-blue-300 bg-blue-500/20 border border-blue-400/30';
      case 'resolved': return 'text-green-300 bg-green-500/20 border border-green-400/30';
      case 'closed': return 'text-gray-300 bg-gray-500/20 border border-gray-400/30';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-400/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (ticketId, newStatus) => {
    updateTicketMutation.mutate({
      id: ticketId,
      data: { status: newStatus }
    });
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleAddResponse = () => {
    if (!newResponse.trim() || !selectedTicket?.id) return;
    
    addResponseMutation.mutate({
      ticketId: selectedTicket.id,
      response: newResponse.trim()
    });
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
          <h2 className="text-2xl font-bold text-white mb-2">Loading Support Tickets</h2>
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
                  <HeadphonesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    Support Portal
                  </h1>
                  <p className="text-white/70 text-lg">
                    Manage merchant support requests and tickets
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
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <AlertCircle className="h-7 w-7 text-red-400" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-white/80 mb-1">Open Tickets</p>
                <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300">
                  {ticketsData?.tickets?.filter(t => t.status === 'open').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="h-7 w-7 text-blue-400" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-white/80 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                  {ticketsData?.tickets?.filter(t => t.status === 'in_progress').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle className="h-7 w-7 text-green-400" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-white/80 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-emerald-400 transition-all duration-300">
                  {ticketsData?.tickets?.filter(t => t.status === 'resolved').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <AlertCircle className="h-7 w-7 text-orange-400" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-white/80 mb-1">High Priority</p>
                <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-yellow-400 transition-all duration-300">
                  {ticketsData?.tickets?.filter(t => t.priority === 'high' && t.status !== 'resolved').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 hover:bg-white/15 transition-all duration-500 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="input-field gradient-border shimmer relative z-10">
              <div className="input-icon">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="input-field gradient-border shimmer relative z-10">
              <div className="input-icon">
                <Filter className="h-5 w-5" />
              </div>
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "", label: "All Status" },
                  { value: "open", label: "Open" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "resolved", label: "Resolved" },
                  { value: "closed", label: "Closed" }
                ]}
                placeholder="All Status"
              />
            </div>

            <div className="input-field gradient-border shimmer relative z-10">
              <div className="input-icon">
                <AlertCircle className="h-5 w-5" />
              </div>
              <CustomDropdown
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={[
                  { value: "", label: "All Priority" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" }
                ]}
                placeholder="All Priority"
              />
            </div>

            <div className="input-field gradient-border shimmer relative z-10">
              <div className="input-icon">
                <MessageSquare className="h-5 w-5" />
              </div>
              <CustomDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "", label: "All Categories" },
                  { value: "Technical", label: "Technical" },
                  { value: "Billing", label: "Billing" },
                  { value: "Onboarding", label: "Onboarding" },
                  { value: "General", label: "General" }
                ]}
                placeholder="All Categories"
              />
            </div>
          </div>
        </div>

        {/* Support Tickets Table */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-500">
          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Support Tickets ({ticketsData?.tickets?.length || 0})
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
            </div>
          </div>
          
          {ticketsData?.tickets?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {ticketsData.tickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-white/10 transition-all duration-300 hover:scale-[1.01]">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <HeadphonesIcon className="h-6 w-6 text-purple-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              #{ticket.id}
                            </div>
                            <div className="text-sm text-white/70 max-w-xs truncate">
                              {ticket.subject}
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
                            <div className="text-sm font-medium text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              {ticket.business_name}
                            </div>
                            <div className="text-sm text-white/60">
                              {ticket.contact_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-2 capitalize">{ticket.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className="text-xs bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                            disabled={updateTicketMutation.isLoading}
                          >
                            <option value="open" className="bg-slate-800 text-white">Open</option>
                            <option value="in_progress" className="bg-slate-800 text-white">In Progress</option>
                            <option value="resolved" className="bg-slate-800 text-white">Resolved</option>
                            <option value="closed" className="bg-slate-800 text-white">Closed</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-white/70">
                        {ticket.category || 'General'}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-white/60">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                          {formatDate(ticket.created_at)}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="group flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:scale-105"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <Eye className="h-4 w-4" />
                            </div>
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <HeadphonesIcon className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No support tickets found</h3>
              <p className="text-white/60 text-lg">Support tickets will appear here when merchants need assistance.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="px-8 py-6 border-b border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Ticket #{selectedTicket.id} - {selectedTicket.subject}
                  </h3>
                  <p className="text-sm text-white/60 mt-1">
                    {selectedTicket.business_name} • {formatDate(selectedTicket.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTicketModal(false);
                    setSelectedTicket(null);
                  }}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              {ticketDetails ? (
                <>
                  {/* Ticket Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="font-semibold text-white/90 mb-3">Status</h4>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(ticketDetails.status)}`}>
                        {getStatusIcon(ticketDetails.status)}
                        <span className="ml-2 capitalize">{ticketDetails.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="font-semibold text-white/90 mb-3">Priority</h4>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getPriorityColor(ticketDetails.priority)}`}>
                        {ticketDetails.priority}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="font-semibold text-white/90 mb-3">Category</h4>
                      <span className="text-sm text-white/70">{ticketDetails.category || 'General'}</span>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-white/90 mb-4">Original Message</h4>
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{ticketDetails.description}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <Activity className="h-6 w-6 text-white animate-spin" />
                  </div>
                </div>
              )}

              {/* Responses */}
              {ticketDetails?.responses && ticketDetails.responses.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-semibold text-white/90 mb-4">Conversation</h4>
                  <div className="space-y-4">
                    {ticketDetails.responses.map((response) => (
                      <div key={response.id} className={`flex ${response.is_staff_response ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                          response.is_staff_response 
                            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30' 
                            : 'bg-white/5 text-white/80 border border-white/10'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{response.response_text}</p>
                          <p className={`text-xs mt-2 ${
                            response.is_staff_response ? 'text-blue-300' : 'text-white/50'
                          }`}>
                            {response.responder_name} • {formatDate(response.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Response */}
              {ticketDetails && (
                <div>
                  <h4 className="font-semibold text-white/90 mb-4">Add Response</h4>
                  <div className="space-y-4">
                    <div className="input-field gradient-border shimmer">
                      <textarea
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        placeholder="Type your response..."
                        rows={4}
                        className="w-full bg-transparent border-none outline-none text-white placeholder-white/50 resize-none"
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          setShowTicketModal(false);
                          setSelectedTicket(null);
                        }}
                        className="px-6 py-3 text-sm font-semibold text-white/80 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleAddResponse}
                        disabled={!newResponse.trim() || addResponseMutation.isLoading}
                        className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 border border-transparent rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center space-x-2"
                      >
                        {addResponseMutation.isLoading && <Activity className="h-4 w-4 animate-spin" />}
                        <span>Send Response</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}