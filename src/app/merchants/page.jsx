"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Filter,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Star,
  Crown,
  X,
  ArrowLeft,
  Globe,
  FileText,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

export default function MerchantsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    // Business Information
    business_name: "",
    business_type: "",
    website: "",
    business_registration_number: "",
    tax_id: "",
    business_license: "",
    years_in_business: "",
    estimated_monthly_volume: "",

    // Business Address
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "US",

    // Contact Information
    contact_name: "",
    email: "",
    phone: "",

    // Personal Information
    personal_first_name: "",
    personal_last_name: "",
    personal_email: "",
    personal_phone: "",
    date_of_birth: "",
    ssn_last_four: "",

    // Personal Address
    personal_address: "",
    personal_city: "",
    personal_state: "",
    personal_zip_code: "",

    // Processing Settings
    monthly_processing_limit: "",
    processing_fee_rate: "0.029",
  });

  const queryClient = useQueryClient();

  const {
    data: merchantsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchants", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/merchants?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch merchants");
      }
      return response.json();
    },
    onError: () => {
      toast.error("Failed to load merchants");
    },
  });

  const createMerchantMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create merchant");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setShowAddModal(false);
      setFormStep(1);
      setFormData({
        business_name: "",
        business_type: "",
        website: "",
        business_registration_number: "",
        tax_id: "",
        business_license: "",
        years_in_business: "",
        estimated_monthly_volume: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "US",
        contact_name: "",
        email: "",
        phone: "",
        personal_first_name: "",
        personal_last_name: "",
        personal_email: "",
        personal_phone: "",
        date_of_birth: "",
        ssn_last_four: "",
        personal_address: "",
        personal_city: "",
        personal_state: "",
        personal_zip_code: "",
        monthly_processing_limit: "",
        processing_fee_rate: "0.029",
      });
      toast.success("Merchant created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMerchantMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/merchants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update merchant");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      toast.success("Merchant updated successfully");
    },
    onError: () => {
      toast.error("Failed to update merchant");
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-300 bg-green-500/20 border border-green-400/30";
      case "pending":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-400/30";
      case "under_review":
        return "text-blue-300 bg-blue-500/20 border border-blue-400/30";
      case "suspended":
        return "text-red-300 bg-red-500/20 border border-red-400/30";
      default:
        return "text-gray-300 bg-gray-500/20 border border-gray-400/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "under_review":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (merchantId, newStatus) => {
    updateMerchantMutation.mutate({
      id: merchantId,
      data: { status: newStatus },
    });
  };

  const handleViewDetails = (merchant) => {
    setSelectedMerchant(merchant);
    setShowDetailsModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (formStep < 4) setFormStep(formStep + 1);
  };

  const handlePrevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1);
  };

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = ["business_name", "contact_name", "email"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    createMerchantMutation.mutate(formData);
  };

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Business Name *
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) =>
                      handleFormChange("business_name", e.target.value)
                    }
                    placeholder="Enter business name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Business Type
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <select
                    value={formData.business_type}
                    onChange={(e) =>
                      handleFormChange("business_type", e.target.value)
                    }
                    className="appearance-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Retail">Retail</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Professional Services">
                      Professional Services
                    </option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Website
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <Globe className="h-5 w-5" />
                  </div>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleFormChange("website", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Years in Business
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    value={formData.years_in_business}
                    onChange={(e) =>
                      handleFormChange("years_in_business", e.target.value)
                    }
                    placeholder="Enter years"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Business Registration Number
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <FileText className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.business_registration_number}
                    onChange={(e) =>
                      handleFormChange(
                        "business_registration_number",
                        e.target.value,
                      )
                    }
                    placeholder="Enter registration number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Tax ID / EIN
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <Hash className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => handleFormChange("tax_id", e.target.value)}
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Estimated Monthly Processing Volume
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    value={formData.estimated_monthly_volume}
                    onChange={(e) =>
                      handleFormChange("estimated_monthly_volume", e.target.value)
                    }
                    placeholder="Enter amount in USD"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              Business Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Street Address
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFormChange("address", e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  City
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFormChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  State
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleFormChange("state", e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  ZIP Code
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => handleFormChange("zip_code", e.target.value)}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Country
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <select
                    value={formData.country}
                    onChange={(e) => handleFormChange("country", e.target.value)}
                    className="appearance-none"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Contact Name *
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) =>
                        handleFormChange("contact_name", e.target.value)
                      }
                      placeholder="Enter contact name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Business Email *
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      placeholder="Enter business email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Business Phone
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      placeholder="Enter business phone"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    First Name
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.personal_first_name}
                      onChange={(e) =>
                        handleFormChange("personal_first_name", e.target.value)
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Last Name
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.personal_last_name}
                      onChange={(e) =>
                        handleFormChange("personal_last_name", e.target.value)
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Personal Email
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      value={formData.personal_email}
                      onChange={(e) =>
                        handleFormChange("personal_email", e.target.value)
                      }
                      placeholder="Enter personal email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Personal Phone
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="tel"
                      value={formData.personal_phone}
                      onChange={(e) =>
                        handleFormChange("personal_phone", e.target.value)
                      }
                      placeholder="Enter personal phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Date of Birth
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleFormChange("date_of_birth", e.target.value)
                      }
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Last 4 digits of SSN
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <Hash className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      maxLength="4"
                      value={formData.ssn_last_four}
                      onChange={(e) =>
                        handleFormChange("ssn_last_four", e.target.value)
                      }
                      placeholder="1234"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Personal Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Street Address
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.personal_address}
                      onChange={(e) =>
                        handleFormChange("personal_address", e.target.value)
                      }
                      placeholder="Enter street address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    City
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.personal_city}
                      onChange={(e) =>
                        handleFormChange("personal_city", e.target.value)
                      }
                      placeholder="Enter city"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    State
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.personal_state}
                      onChange={(e) =>
                        handleFormChange("personal_state", e.target.value)
                      }
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    ZIP Code
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.personal_zip_code}
                      onChange={(e) =>
                        handleFormChange("personal_zip_code", e.target.value)
                      }
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Processing Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Monthly Processing Limit
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <input
                      type="number"
                      value={formData.monthly_processing_limit}
                      onChange={(e) =>
                        handleFormChange(
                          "monthly_processing_limit",
                          e.target.value,
                        )
                      }
                      placeholder="Enter amount in USD"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Processing Fee Rate (%)
                  </label>
                  <div className="input-field gradient-border shimmer">
                    <div className="input-icon">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.processing_fee_rate}
                      onChange={(e) =>
                        handleFormChange("processing_fee_rate", e.target.value)
                      }
                      placeholder="0.029"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
          <h2 className="text-2xl font-bold text-white mb-2">Loading Merchants</h2>
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
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    Merchant Management
                  </h1>
                  <p className="text-white/70 text-lg">
                    Manage merchant accounts and onboarding
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
                onClick={() => setShowAddModal(true)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">Add Merchant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 hover:bg-white/15 transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="input-field gradient-border shimmer">
                <div className="input-icon">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search merchants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white/80" />
                </div>
                <div className="input-field gradient-border shimmer relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none w-full bg-transparent text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-200 cursor-pointer relative z-50"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="" className="bg-gray-800 text-white">All Status</option>
                    <option value="active" className="bg-gray-800 text-white">Active</option>
                    <option value="pending" className="bg-gray-800 text-white">Pending</option>
                    <option value="under_review" className="bg-gray-800 text-white">Under Review</option>
                    <option value="suspended" className="bg-gray-800 text-white">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Merchants Table */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-500">
          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Merchants ({merchantsData?.merchants?.length || 0})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/60">Live Data</span>
              </div>
            </div>
          </div>

          {merchantsData?.merchants?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Onboarding
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {merchantsData.merchants.map((merchant, index) => (
                    <tr key={merchant.id} className="group hover:bg-white/10 transition-all duration-300 hover:scale-[1.01]">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300">
                              <Building2 className="h-6 w-6 text-white" />
                              {merchant.is_loyal_merchant && (
                                <Crown className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                                {merchant.business_name}
                              </div>
                              {merchant.is_loyal_merchant && (
                                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 border border-yellow-400/30">
                                  <Star className="h-3 w-3 mr-1" />
                                  Loyal
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-white/60">
                              {merchant.business_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg font-semibold text-white">
                          {merchant.contact_name}
                        </div>
                        <div className="text-sm text-white/60 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-2 text-blue-400" />
                          {merchant.email}
                        </div>
                        {merchant.phone && (
                          <div className="text-sm text-white/60 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2 text-green-400" />
                            {merchant.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(merchant.status)}`}
                          >
                            {getStatusIcon(merchant.status)}
                            <span className="ml-2 capitalize">
                              {merchant.status}
                            </span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <select
                            value={merchant.status}
                            onChange={(e) =>
                              handleStatusChange(merchant.id, e.target.value)
                            }
                            className="text-sm bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                            disabled={updateMerchantMutation.isLoading}
                          >
                            <option value="pending" className="bg-slate-800 text-white">Pending</option>
                            <option value="under_review" className="bg-slate-800 text-white">Under Review</option>
                            <option value="active" className="bg-slate-800 text-white">Active</option>
                            <option value="suspended" className="bg-slate-800 text-white">Suspended</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-white/20 rounded-full h-3 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full shadow-lg transition-all duration-500"
                              style={{
                                width: `${(merchant.onboarding_step / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="ml-3 text-sm font-semibold text-white">
                            {merchant.onboarding_step}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-white/60">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                          {formatDate(merchant.created_at)}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewDetails(merchant)}
                            className="group flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-all duration-300 hover:scale-105"
                          >
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                              <Eye className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">View</span>
                          </button>
                          <button className="group flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-105">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                              <Edit className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">Edit</span>
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 shadow-2xl">
                <Building2 className="h-10 w-10 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No merchants found
              </h3>
              <p className="text-white/60 text-lg mb-8">
                Get started by adding your first merchant.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold text-lg">Add Merchant</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="px-8 py-6 border-b border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Add New Merchant
                  </h3>
                  <p className="text-white/60 text-lg">Step {formStep} of 4</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormStep(1);
                  }}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-white/20 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full shadow-lg transition-all duration-500"
                    style={{ width: `${(formStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-8">{renderFormStep()}</div>

            <div className="px-8 py-6 border-t border-white/20 flex justify-between">
              <button
                onClick={handlePrevStep}
                disabled={formStep === 1}
                className="px-6 py-3 border border-white/20 rounded-xl text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                Previous
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormStep(1);
                  }}
                  className="px-6 py-3 border border-white/20 rounded-xl text-white/80 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>

                {formStep < 4 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={createMerchantMutation.isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center space-x-3 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {createMerchantMutation.isLoading && (
                      <Activity className="h-5 w-5 animate-spin" />
                    )}
                    <span className="font-semibold">Create Merchant</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Details Modal */}
      {showDetailsModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="px-8 py-6 border-b border-white/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Merchant Details
                    </h3>
                    <p className="text-white/70">
                      {selectedMerchant.business_name}
                    </p>
                  </div>
                  {selectedMerchant.is_loyal_merchant && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 border border-yellow-400/30">
                      <Crown className="h-4 w-4 mr-2" />
                      Loyal Merchant
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-8 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Information */}
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                    Business Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-white/70">Business Name</label>
                      <div className="text-white font-medium">
                        {selectedMerchant.business_name}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Business Type</label>
                      <div className="text-white font-medium">
                        {selectedMerchant.business_type}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Website</label>
                      <div className="text-white/60">
                        {selectedMerchant.website || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Status</label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMerchant.status)}`}
                        >
                          {selectedMerchant.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-green-400" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-white/70">Contact Name</label>
                      <div className="text-white font-medium">
                        {selectedMerchant.contact_name}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Email</label>
                      <div className="text-white font-medium">
                        {selectedMerchant.email}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Phone</label>
                      <div className="text-white/60">
                        {selectedMerchant.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-400" />
                  Address
                </h4>
                <div className="text-white/60">
                  {selectedMerchant.address ? (
                    <div className="space-y-1">
                      <div className="text-white font-medium">{selectedMerchant.address}</div>
                      <div>
                        {selectedMerchant.city}, {selectedMerchant.state}{" "}
                        {selectedMerchant.zip_code}
                      </div>
                      <div>{selectedMerchant.country}</div>
                    </div>
                  ) : (
                    "No address provided"
                  )}
                </div>
              </div>

              {/* Processing Information */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                  Processing Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-white/70">Monthly Limit</label>
                    <div className="text-white font-medium text-lg">
                      {selectedMerchant.monthly_processing_limit
                        ? `$${parseFloat(selectedMerchant.monthly_processing_limit).toLocaleString()}`
                        : "Not set"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Fee Rate</label>
                    <div className="text-white font-medium text-lg">
                      {(
                        parseFloat(selectedMerchant.processing_fee_rate) * 100
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-400" />
                  Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-white/70">Created</label>
                    <div className="text-white font-medium">
                      {formatDate(selectedMerchant.created_at)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Last Updated</label>
                    <div className="text-white font-medium">
                      {formatDate(selectedMerchant.updated_at)}
                    </div>
                  </div>
                  {selectedMerchant.loyalty_achieved_at && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-white/70">Became Loyal</label>
                      <div className="text-white font-medium flex items-center">
                        {formatDate(selectedMerchant.loyalty_achieved_at)}
                        <Crown className="h-4 w-4 text-yellow-400 ml-2" />
                      </div>
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
