import re

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add new state variables
state_vars = '''  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  
  // Step 2 Registration Fields
  const [isStep2, setIsStep2] = useState(false);
  const [medicalLicense, setMedicalLicense] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [npi, setNpi] = useState('');

  const [showPassword, setShowPassword] = useState(false);'''

content = re.sub(
    r"  const \[email, setEmail\] = useState\(''\);\s*const \[password, setPassword\] = useState\(''\);\s*const \[fullName, setFullName\] = useState\(''\);\s*const \[clinicName, setClinicName\] = useState\(''\);\s*const \[showPassword, setShowPassword\] = useState\(false\);",
    state_vars,
    content
)

# 2. Update logic for registration
logic = '''        // Register new clinic doctor
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
          }
          const response = await fetch(${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register/initiate, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email, 
              password, 
              full_name: clinicName ? ${clinicName} -  : fullName,
              role: 'clinic_admin' 
            })
          });
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Registration failed. Please try again.');
          }
          setSuccessMsg('? OTP sent to your email. Please verify.');
          setIsOtpMode(true);
          setIsStep2(false);
        } else if (isOtpMode) {'''

content = re.sub(
    r"        // Register new clinic doctor\s*if \(!isOtpMode\) \{\s*const response = await fetch\(\$\{process\.env\.NEXT_PUBLIC_BACKEND_URL\}/api/v1/auth/register/initiate, \{.*?\}\);\s*if \(!response\.ok\) \{\s*const errData = await response\.json\(\);\s*throw new Error\(errData\.detail \|\| 'Registration failed\. Please try again\.'\);\s*\}\s*setSuccessMsg\('? OTP sent to your email\. Please verify\.'\);\s*setIsOtpMode\(true\);\s*\} else \{",
    logic,
    content,
    flags=re.DOTALL
)

# 3. Form subtitle
subtitle = '''            <p className="text-sm text-[#6B7280] font-medium">
              {isForgotPassword 
                ? (isOtpMode ? 'Enter the OTP sent to your email and your new password' : 'Enter your email to receive an OTP') 
                : isLogin 
                  ? 'Enter your email and password to log in' 
                  : (isOtpMode ? 'Enter the OTP sent to your email to activate your account' : isStep2 ? 'Complete your professional profile for verification' : 'Create your clinic workspace on SBN Sentinel')}
            </p>'''

content = re.sub(
    r"            <p className=\"text-sm text-\[#6B7280\] font-medium\">\s*\{isForgotPassword \s*\? \(isOtpMode \? 'Enter the OTP sent to your email and your new password' : 'Enter your email to receive an OTP'\) \s*: isLogin \s*\? 'Enter your email and password to log in' \s*: \(isOtpMode \? 'Enter the OTP sent to your email to activate your account' : 'Create your clinic workspace on SBN Sentinel'\)\}\s*</p>",
    subtitle,
    content
)

# 4. Form inputs rendering
inputs = '''            {!isOtpMode && !isStep2 ? (
              <>
                {!isLogin && !isForgotPassword && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                        <input 
                          type="text" 
                          placeholder="City Heart" 
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                          required={!isLogin && !isForgotPassword} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                        <input 
                          type="text" 
                          placeholder="Dr. Jenkins" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                          required={!isLogin && !isForgotPassword} 
                        />
                      </div>
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
                      className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 pl-12 pr-12 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6D5DF6] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : isStep2 ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Medical License</label>
                    <input 
                      type="text" 
                      placeholder="MED-12345" 
                      value={medicalLicense}
                      onChange={(e) => setMedicalLicense(e.target.value)}
                      className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">NPI / Tax ID</label>
                    <input 
                      type="text" 
                      placeholder="1098765432" 
                      value={npi}
                      onChange={(e) => setNpi(e.target.value)}
                      className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Specialty</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cardiology, Dentistry, General" 
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Clinic Address</label>
                    <input 
                      type="text" 
                      placeholder="123 Health Ave, NY" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Official Phone</label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:bg-white transition-all"
                      required 
                    />
                  </div>
                </div>
                <button type="button" onClick={() => setIsStep2(false)} className="text-xs text-[#6B7280] font-bold hover:text-[#111827] transition-colors mt-2">
                  ? Back to basics
                </button>
              </div>
            ) : ('''

content = re.sub(
    r"            \{!isOtpMode \? \(\s*<>\s*\{!isLogin && !isForgotPassword && \(\s*<>\s*<div>\s*<label className=\"block text-\[11px\] font-extrabold text-\[#9CA3AF\] uppercase tracking-wider mb-2\">Clinic / Practice Name</label>.*?</button>\s*</div>\s*</div>\s*\)\}\s*</>\s*\) : \(",
    inputs,
    content,
    flags=re.DOTALL
)

# 5. Submit Button text
button = '''              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isForgotPassword 
                    ? (isOtpMode ? 'Reset Password' : 'Send Reset Link') 
                    : isLogin 
                      ? 'Secure Login' 
                      : (isOtpMode ? 'Verify & Activate' : isStep2 ? 'Submit Registration' : 'Continue to Step 2')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}'''

content = re.sub(
    r"              \{isLoading \? \(\s*<div className=\"w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin\"></div>\s*\) : \(\s*<>\s*\{isForgotPassword \s*\? \(isOtpMode \? 'Reset Password' : 'Send Reset Link'\) \s*: isLogin \s*\? 'Secure Login' \s*: \(isOtpMode \? 'Verify & Activate' : 'Create Clinic Account'\)\}\s*<ArrowRight className=\"w-4 h-4\" />\s*</>\s*\)\}",
    button,
    content
)

with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
