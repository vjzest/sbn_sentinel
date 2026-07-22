import sys

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. We remove isStep2 from state logic but keep the variables.
# Actually, just removing the conditional rendering.

old_inputs = '''            {!isOtpMode && !isStep2 ? (
              <>
                {!isLogin && !isForgotPassword && (
                  <>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic / Practice Name</label>'''

new_inputs = '''            {!isOtpMode ? (
              <>
                {!isLogin && !isForgotPassword && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <input type="text" placeholder="City Heart" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required={!isLogin && !isForgotPassword} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Your Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <input type="text" placeholder="Dr. Jenkins" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required={!isLogin && !isForgotPassword} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Medical License</label>
                        <input type="text" placeholder="MED-12345" value={medicalLicense} onChange={(e) => setMedicalLicense(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Specialty</label>
                        <input type="text" placeholder="e.g. Cardiology" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Address</label>
                        <input type="text" placeholder="123 Health Ave, NY" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                      </div>
                    </div>
                  </>
                )}'''

# We need to replace the entire input block. Let's just do it with a careful regex or find.
# Because the file is large, we can just replace the old block from {!isOtpMode && !isStep2 ? ( to ) : ( 

import re
code = re.sub(
    r"\{!isOtpMode && !isStep2 \? \(\s*<>\s*\{!isLogin && !isForgotPassword && \(\s*<>\s*<div>\s*<label.*?\) : isStep2 && !isOtpMode \? \(.*?</button>\s*</div>\s*\) : \(",
    r'''{!isOtpMode ? (
              <>
                {!isLogin && !isForgotPassword && (
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <input type="text" placeholder="City Heart" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required={!isLogin && !isForgotPassword} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Your Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <input type="text" placeholder="Dr. Jenkins" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required={!isLogin && !isForgotPassword} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Medical License</label>
                        <input type="text" placeholder="MED-12345" value={medicalLicense} onChange={(e) => setMedicalLicense(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">NPI / Tax ID</label>
                        <input type="text" placeholder="1098765432" value={npi} onChange={(e) => setNpi(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Specialty</label>
                        <input type="text" placeholder="e.g. Cardiology" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Phone Contact</label>
                        <input type="tel" placeholder="+1 555-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Address</label>
                      <input type="text" placeholder="123 Health Ave, NY" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                    </div>
                  </div>
                )}
    
                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input type="email" placeholder="doctor@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-12 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6D5DF6]">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (''',
    code,
    flags=re.DOTALL
)

# Replace the submission logic
old_logic = """        // Register new clinic doctor
        if (!isStep2 && !isOtpMode) {
          if (!email || !password || !fullName || !clinicName) {
             throw new Error('Please fill in all primary details.');
          }
          setIsStep2(true);
          setIsLoading(false);
          return;
        }

        if (isStep2 && !isOtpMode) {
          if (!medicalLicense || !specialty || !phone || !address) {
             throw new Error('Please complete your clinic profile details.');
          }"""

new_logic = """        // Register new clinic doctor
        if (!isOtpMode) {
          if (!email || !password || !fullName || !clinicName || !medicalLicense || !specialty || !phone || !address) {
             throw new Error('Please complete your full clinic profile details.');
          }"""

code = code.replace(old_logic, new_logic)

# Replace button text
old_btn = "{isForgotPassword ? (isOtpMode ? 'Reset Password' : 'Send Reset OTP') : isLogin ? 'Sign In to Dashboard' : (isOtpMode ? 'Verify & Register' : isStep2 ? 'Submit Registration' : 'Continue to Step 2')}"
new_btn = "{isForgotPassword ? (isOtpMode ? 'Reset Password' : 'Send Reset OTP') : isLogin ? 'Sign In to Dashboard' : (isOtpMode ? 'Verify & Register' : 'Submit Registration')}"
code = code.replace(old_btn, new_btn)

old_sub = "{isForgotPassword \n                ? (isOtpMode ? 'Enter the OTP sent to your email and your new password' : 'Enter your email to receive an OTP') \n                : isLogin \n                  ? 'Enter your email and password to log in' \n                  : (isOtpMode ? 'Enter the OTP sent to your email to activate your account' : isStep2 ? 'Complete your professional profile for verification' : 'Create your clinic workspace on SBN Sentinel')}"
new_sub = "{isForgotPassword \n                ? (isOtpMode ? 'Enter the OTP sent to your email and your new password' : 'Enter your email to receive an OTP') \n                : isLogin \n                  ? 'Enter your email and password to log in' \n                  : (isOtpMode ? 'Enter the OTP sent to your email to activate your account' : 'Complete your professional profile for verification')}"
code = code.replace(old_sub, new_sub)


with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
