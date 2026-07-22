import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (role: string, user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [isStep2, setIsStep2] = useState(false);
  const [medicalLicense, setMedicalLicense] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [npi, setNpi] = useState('');
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
        if (!isOtpMode) {
          // Request OTP for reset
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          if (response.ok) {
            setSuccessMsg('✅ OTP sent to your email.');
            setIsOtpMode(true);
          } else {
            setError('Failed to send OTP.');
          }
        } else {
          // Verify OTP for reset
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpValue, new_password: password })
          });
          if (response.ok) {
            setSuccessMsg('✅ Password reset successful! Please log in.');
            setIsOtpMode(false);
            setIsForgotPassword(false);
            setOtpValue('');
            setPassword('');
          } else {
            const errData = await response.json();
            throw new Error(errData.detail || 'Invalid OTP.');
          }
        }
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
        if (!isOtpMode) {
          if (!email || !password || !fullName || !clinicName || !medicalLicense || !specialty || !phone || !address) {
             throw new Error('Please complete your full clinic profile details.');
          }
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register/initiate`, {
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
          setSuccessMsg('✅ OTP sent to your email. Please verify.');
          setIsOtpMode(true);
        } else {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email, 
              password, 
              full_name: clinicName ? `${clinicName} - ${fullName}` : fullName,
              role: 'clinic_admin',
              otp: otpValue
            })
          });
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Invalid OTP.');
          }
          setSuccessMsg('✅ Clinic account created successfully! Please log in.');
          setIsLogin(true);
          setIsOtpMode(false);
          setOtpValue('');
          setFullName('');
          setClinicName('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-[#F8F9FD] font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-[#2E1055]/20 to-[#4527A0]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-[#2E1055]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-[1400px] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_20px_80px_rgba(79,70,229,0.12)] rounded-[40px] flex flex-col lg:flex-row relative z-10 overflow-hidden">

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 p-3">
        <div className="w-full h-full flex flex-col justify-center items-center p-16 relative z-10 bg-gradient-to-br from-[#2E1055] to-[#120524] text-white rounded-[32px] shadow-2xl overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#2E1055]/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4527A0]/20 rounded-full blur-[100px]"></div>
          {/* Subtle dots pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-[1.1] text-white tracking-tight">
            Future-Proof Your<br />Clinic Management.
          </h2>
          <p className="text-[15px] text-white/70 mb-12 font-medium leading-relaxed pr-8">
            Join a community of elite healthcare leaders using SBN Sentinel to redefine operational efficiency and patient care metrics.
          </p>

          {/* Floating Cards Container */}
          <div className="relative h-[320px]">
            
            {/* Square Logo Box */}
            <div className="absolute left-0 bottom-0 w-14 h-14 bg-black/20 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-2xl hover:bg-black/30 transition-colors cursor-pointer">
              <div className="text-[#FFB020] font-extrabold text-xl">S</div>
            </div>

            {/* Vertical Icon Pill */}
            <div className="absolute left-20 bottom-0 w-14 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] flex flex-col items-center gap-6 backdrop-blur-xl shadow-2xl">
               <ShieldCheck className="w-5 h-5 text-white/70 hover:text-white transition-colors cursor-pointer" />
               <Building2 className="w-5 h-5 text-white/70 hover:text-white transition-colors cursor-pointer" />
               <Lock className="w-5 h-5 text-white/70 hover:text-white transition-colors cursor-pointer" />
            </div>

            {/* Growth Indicator Card */}
            <div className="absolute right-0 top-0 w-[85%] bg-[#241544]/80 border border-white/10 backdrop-blur-xl rounded-[20px] p-5 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-transform duration-300 cursor-pointer z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2E1055] flex items-center justify-center shadow-inner">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-extrabold text-white/50 tracking-wider mb-0.5">Growth Indicator</p>
                  <p className="text-lg font-bold text-white leading-none">42 Active Clinics</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                +12%
              </div>
            </div>

            {/* Community Notifications Card */}
            <div className="absolute right-0 bottom-0 w-[85%] bg-[#1C0F35]/90 border border-white/10 backdrop-blur-xl rounded-[20px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-10">
              <h3 className="text-sm font-bold text-white mb-4">Platform Notifications</h3>
              <div className="space-y-3">
                <div className="bg-white/[0.03] rounded-[14px] p-3.5 flex justify-between items-start border border-white/[0.05] hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <ShieldCheck className="w-[15px] h-[15px] text-white/40 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-white/90">New Clinic Onboarded</p>
                      <p className="text-[11px] text-white/50 mt-0.5">City Heart Nexus just went live!</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 font-medium">2m</span>
                </div>
                <div className="bg-white/[0.03] rounded-[14px] p-3.5 flex justify-between items-start border border-white/[0.05] hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <ArrowRight className="w-[15px] h-[15px] text-white/40 mt-0.5 flex-shrink-0 rotate-[-45deg]" />
                    <div>
                      <p className="text-[13px] font-bold text-white/90">Engagement Peak</p>
                      <p className="text-[11px] text-white/50 mt-0.5">Patient flow up 40% in Central Hub.</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 font-medium">15m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-16 relative z-10 bg-white/40">
        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold text-[#111827] mb-2">
              {isForgotPassword ? (isOtpMode ? 'Enter OTP' : 'Reset Password') : isLogin ? 'Welcome Back, Doctor' : (isOtpMode ? 'Verify Email' : 'Register Your Clinic')}
            </h2>
            <p className="text-sm text-[#6B7280] font-medium">
              {isForgotPassword 
                ? (isOtpMode ? 'Enter the OTP sent to your email and your new password' : 'Enter your email to receive an OTP') 
                : isLogin 
                  ? 'Enter your email and password to log in' 
                  : (isOtpMode ? 'Enter the OTP sent to your email to activate your account' : 'Complete your professional profile for verification')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-[16px] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-[16px] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                {successMsg}
              </div>
            )}

            {!isOtpMode ? (
              <>
                {!isLogin && !isForgotPassword && (
                  <div className="space-y-3 mb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <input type="text" placeholder="City Heart" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055]" required={!isLogin && !isForgotPassword} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Your Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <input type="text" placeholder="Dr. Jenkins" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055]" required={!isLogin && !isForgotPassword} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Medical License</label>
                        <input type="text" placeholder="MED-12345" value={medicalLicense} onChange={(e) => setMedicalLicense(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055]" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">NPI / Tax ID</label>
                        <input type="text" placeholder="1098765432" value={npi} onChange={(e) => setNpi(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Specialty</label>
                        <input type="text" placeholder="e.g. Cardiology" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055]" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Phone Contact</label>
                        <input type="tel" placeholder="+1 555-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055]" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Address</label>
                      <input type="text" placeholder="123 Health Ave, NY" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055]" required />
                    </div>
                  </div>
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
                      className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 pl-12 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      className="w-full bg-gray-50 border border-[#E8EDF5] rounded-[16px] py-2.5 pl-12 pr-4 text-sm font-bold text-[#9CA3AF] cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Enter OTP</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input 
                      type="text"
                      placeholder="6-digit code"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 pl-12 pr-4 text-sm font-bold text-[#111827] tracking-[0.2em] outline-none focus:border-[#2E1055] focus:bg-white transition-all"
                      required 
                      maxLength={6}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2 flex justify-between">
                <span>{isForgotPassword && isOtpMode ? 'New Password' : 'Password'}</span>
                {isLogin && !isForgotPassword && (
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); setIsOtpMode(false); }}
                    className="text-[#2563EB] hover:underline normal-case font-semibold cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </label>
              {(!isForgotPassword || (isForgotPassword && isOtpMode)) && !(!isForgotPassword && isOtpMode) && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-2.5 pl-12 pr-12 text-sm font-bold text-[#111827] outline-none focus:border-[#2E1055] focus:bg-white transition-all"
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
              className="w-full bg-[#2E1055] hover:bg-[#4527A0] text-white font-bold py-4 rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(108,76,245,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isForgotPassword ? (isOtpMode ? 'Reset Password' : 'Send Reset OTP') : isLogin ? 'Sign In to Dashboard' : (isOtpMode ? 'Verify & Register' : 'Submit Registration')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {isForgotPassword ? (
            <p className="mt-8 text-center text-sm font-bold text-[#6B7280]">
              Remember your password?{' '}
              <button 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }} 
                className="text-[#2E1055] hover:underline cursor-pointer"
              >
                Back to log in
              </button>
            </p>
          ) : (
                <p className="mt-8 text-center text-[#6B7280] font-medium text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setIsForgotPassword(false); setIsOtpMode(false); }}
                    className="text-[#2E1055] font-bold hover:underline"
                  >
                    {isLogin ? 'Register Clinic' : 'Log in'}
                  </button>
                </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

