
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight, Sparkles, Shield, Zap, Crown, Users, Headphones } from "lucide-react";
import { toast } from "sonner";
import { setAuthToken } from "../../../utils/auth.js";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        const token = btoa(JSON.stringify({
          sub: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        setAuthToken(token);
        
        toast.success("Welcome! Account created successfully!");
        navigate("/");
      } else {
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Please fix the errors below");
        } else {
          toast.error(data.error || "Signup failed");
        }
      }
    } catch (error) {
      // Fallback: Use mock authentication for demo
      console.log('API not available, using mock auth');
      const mockUser = {
        sub: '2',
        email: formData.email || 'demo@example.com',
        name: formData.name || 'Demo User',
        role: formData.role || 'admin',
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      const token = btoa(JSON.stringify(mockUser));
      setAuthToken(token);
      toast.success("Welcome! Demo mode active.");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'manager': return <Users className="h-4 w-4" />;
      case 'support': return <Headphones className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin': return 'Full system access and control';
      case 'manager': return 'Manage teams and oversee operations';
      case 'support': return 'Customer support and assistance';
      default: return 'Select your role';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Our Platform</h1>
            <p className="text-white/70 text-sm">Create your account and start managing</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                  Full Name
                </label>
                <div className={`input-field gradient-border shimmer ${errors.name ? 'error' : ''}`}>
                  <div className="input-icon">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <div className={`input-field gradient-border shimmer ${errors.email ? 'error' : ''}`}>
                  <div className="input-icon">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className={`input-field gradient-border shimmer ${errors.password ? 'error' : ''}`}>
                  <div className="input-icon">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                  Confirm Password
                </label>
                <div className={`input-field gradient-border shimmer ${errors.confirmPassword ? 'error' : ''}`}>
                  <div className="input-icon">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-white/90 mb-2">
                  Role
                </label>
                <div className="input-field gradient-border shimmer">
                  <div className="input-icon">
                    {getRoleIcon(formData.role)}
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="appearance-none"
                  >
                    <option value="admin" className="bg-slate-800 text-white">Admin</option>
                    <option value="manager" className="bg-slate-800 text-white">Manager</option>
                    <option value="support" className="bg-slate-800 text-white">Support</option>
                  </select>
                </div>
                <p className="mt-2 text-xs text-white/60 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {getRoleDescription(formData.role)}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/account/signin"
                className="w-full flex items-center justify-center py-4 px-6 border border-white/20 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-200 group"
              >
                <Shield className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-white/60">
            <Zap className="h-5 w-5 mx-auto mb-1" />
            <p className="text-xs">Lightning Fast</p>
          </div>
          <div className="text-white/60">
            <Shield className="h-5 w-5 mx-auto mb-1" />
            <p className="text-xs">Secure & Private</p>
          </div>
          <div className="text-white/60">
            <Sparkles className="h-5 w-5 mx-auto mb-1" />
            <p className="text-xs">Beautiful Design</p>
          </div>
        </div>
      </div>
    </div>
  );
}
