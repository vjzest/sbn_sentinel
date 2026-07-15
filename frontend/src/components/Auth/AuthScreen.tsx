import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (role: string, user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isForgotPassword) {
        // Simulate Forgot Password API Call
        setTimeout(() => {
          setSuccessMsg('✅ Password reset link has been sent to your email.');
          setIsLoading(false);
          // Wait 3 seconds then return to login
          setTimeout(() => {
            setIsForgotPassword(false);
            setSuccessMsg('');
          }, 3000);
        }, 1500);
        return;
      }
      if (isLogin) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          throw new Error('Invalid email or password. Please try again.');
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role);
        onLogin(data.user.role, data.user);
      } else {
        // Register new clinic doctor
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            full_name: clinicName ? `${clinicName} - ${fullName}` : fullName,
            role: 'clinic_admin' 
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Registration failed. Please try again.');
        }
        setSuccessMsg('✅ Clinic account created successfully! Please log in.');
        setIsLogin(true);
        setFullName('');
        setClinicName('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F7F9FC] font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-[#4F46E5]/20 to-[#7C3AED]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 p-20 relative z-10">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-extrabold text-3xl shadow-[0_4px_20px_rgba(79,70,229,0.4)]">
            S
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#111827] leading-none">Sentinel</h1>
            <p className="text-sm text-[#4F46E5] tracking-[0.2em] uppercase font-bold mt-1">Command Center</p>
          </div>
        </div>

        <h2 className="text-5xl font-extrabold text-[#111827] mb-6 leading-tight">
          Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]">Revenue Intelligence</span>
        </h2>
        <p className="text-lg text-[#6B7280] font-medium leading-relaxed max-w-lg mb-12">
          Securely authenticate to access real-time clinical telemetry, predictive revenue models, and automated schedule optimization.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[20px] border border-white shadow-sm max-w-md">
            <div className="p-3 bg-[#ECFDF5] rounded-[14px]">
              <ShieldCheck className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="font-bold text-[#111827]">Bank-Grade Security</p>
              <p className="text-xs text-[#6B7280] font-medium mt-1">HIPAA compliant data encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[20px] border border-white shadow-sm max-w-md">
            <div className="p-3 bg-[#EEF4FF] rounded-[14px]">
              <Building2 className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <div>
              <p className="font-bold text-[#111827]">Multi-Clinic Platform</p>
              <p className="text-xs text-[#6B7280] font-medium mt-1">Manage multiple practices from one workspace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 w-full max-w-md p-10 rounded-[32px] shadow-[0_20px_80px_rgba(79,70,229,0.12)] animate-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold text-[#111827] mb-2">
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Register Your Clinic'}
            </h2>
            <p className="text-sm text-[#6B7280] font-medium">
              {isForgotPassword 
                ? 'Enter your email to receive a password reset link' 
                : isLogin 
                  ? 'Enter your credentials to access the portal' 
                  : 'Create your clinic workspace on SBN Sentinel'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-[12px] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-[12px] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                {successMsg}
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic / Practice Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input 
                      type="text" 
                      placeholder="e.g. City Heart Clinic" 
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input 
                      type="text" 
                      placeholder="Dr. Sarah Jenkins" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input 
                  type="email" 
                  placeholder="doctor@clinic.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2 flex justify-between">
                <span>Password</span>
                {isLogin && !isForgotPassword && (
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                    className="text-[#2563EB] hover:underline normal-case font-semibold cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </label>
              {!isForgotPassword && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-12 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                    required={!isForgotPassword} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-8 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 text-white font-extrabold py-4 rounded-[16px] text-sm shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In to Dashboard' : 'Create Clinic Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {isForgotPassword ? (
            <p className="mt-8 text-center text-sm font-bold text-[#6B7280]">
              Remember your password?{' '}
              <button 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }} 
                className="text-[#4F46E5] hover:underline cursor-pointer"
              >
                Back to log in
              </button>
            </p>
          ) : (
            <p className="mt-8 text-center text-sm font-bold text-[#6B7280]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} 
                className="text-[#4F46E5] hover:underline cursor-pointer"
              >
                {isLogin ? 'Register Clinic' : 'Log in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
