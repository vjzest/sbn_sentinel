import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Phone, Building, CheckCircle } from 'lucide-react';

export const UserProfileView = () => {
  const [profileData, setProfileData] = useState({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@sbnsentinel.com',
    phone: '+1 (555) 123-4567',
    role: 'Global Admin',
    clinic: 'Sentinel Main Hub'
  });
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-[24px] border border-[#E8EDF5] premium-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-1 shadow-xl">
            <div className="w-full h-full bg-white rounded-[16px] flex items-center justify-center border-2 border-transparent">
              <User className="w-10 h-10 text-[#4F46E5]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#111827]">{profileData.firstName} {profileData.lastName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold rounded-lg uppercase tracking-wider">
                {profileData.role}
              </span>
              <span className="text-sm font-bold text-[#6B7280] flex items-center gap-1">
                <Building className="w-4 h-4" /> {profileData.clinic}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col - Security */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#E8EDF5] premium-shadow">
            <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-indigo-600" /> Account Security
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#111827]">Two-Factor Authentication</p>
                  <p className="text-xs text-[#6B7280] mt-1">Your account is secured with 2FA via authenticator app.</p>
                </div>
              </div>

              <button className="w-full py-3 rounded-xl border border-[#E8EDF5] bg-white text-sm font-bold text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Col - Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-[24px] border border-[#E8EDF5] premium-shadow">
            <h3 className="text-lg font-bold text-[#111827] mb-6">Personal Information</h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full bg-gray-50 border border-[#E8EDF5] rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[#6B7280] cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F3F4F6] flex items-center justify-between">
                {isSaved ? (
                  <span className="text-emerald-600 text-sm font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Profile updated successfully
                  </span>
                ) : (
                  <span></span>
                )}
                
                <button
                  type="submit"
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
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
