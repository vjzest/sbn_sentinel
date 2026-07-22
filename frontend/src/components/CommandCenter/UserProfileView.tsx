import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Phone, Building, CheckCircle } from 'lucide-react';

export const UserProfileView = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+1 (555) 123-4567',
    role: '',
    clinic: 'Sentinel Main Hub'
  });
  
  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const nameParts = user.full_name ? user.full_name.split(' ') : ['Admin', 'User'];
        setProfileData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || '',
          role: user.role || 'Global Admin',
          clinic: user.full_name?.includes('-') ? user.full_name.split('-')[0].trim() : 'Sentinel Main Hub'
        }));
      } catch(e) {}
    }
  }, []);
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] p-8 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEEAFE]0/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-[#2E1055] to-[#120524] p-1 shadow-xl">
            <div className="w-full h-full bg-white/5 rounded-[16px] flex items-center justify-center border-2 border-transparent">
              <User className="w-10 h-10 text-[#A78BFA]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{profileData.firstName} {profileData.lastName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-[#EEF2FF] text-[#A78BFA] text-xs font-bold rounded-lg uppercase tracking-wider">
                {profileData.role}
              </span>
              <span className="text-sm font-bold text-white/70 flex items-center gap-1">
                <Building className="w-4 h-4" /> {profileData.clinic}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col - Security */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] p-6 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-[#A78BFA]" /> Account Security
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-white/70 mt-1">Your account is secured with 2FA via authenticator app.</p>
                </div>
              </div>

              <button className="w-full py-3 rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Col - Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] p-8 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white">
            <h3 className="text-lg font-bold text-white mb-6">Personal Information</h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider block mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:ring-1 focus:ring-[#2E1055] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider block mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:ring-1 focus:ring-[#2E1055] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider block mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full bg-white/5 opacity-70 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-white/70 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-white/50 uppercase tracking-wider block mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-white outline-none focus:border-[#2E1055] focus:ring-1 focus:ring-[#2E1055] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                {isSaved ? (
                  <span className="text-emerald-600 text-sm font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Profile updated successfully
                  </span>
                ) : (
                  <span></span>
                )}
                
                <button
                  type="submit"
                  className="bg-[#2E1055] hover:bg-[#120524] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-[#EEEAFE]0/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
