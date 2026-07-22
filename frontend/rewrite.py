import sys

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. State vars
old_state = "  const [email, setEmail] = useState('');"
new_state = """  const [email, setEmail] = useState('');
  const [isStep2, setIsStep2] = useState(false);
  const [medicalLicense, setMedicalLicense] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [npi, setNpi] = useState('');"""
code = code.replace(old_state, new_state)

# 2. Handle Submit logic
old_logic = """        // Register new clinic doctor
        if (!isOtpMode) {
          const response = await fetch(${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register/initiate, {"""
new_logic = """        // Register new clinic doctor
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
          const response = await fetch(${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register/initiate, {"""
code = code.replace(old_logic, new_logic)

old_logic_2 = """          }
          setSuccessMsg('? OTP sent to your email. Please verify.');
          setIsOtpMode(true);
        } else {"""
new_logic_2 = """          }
          setSuccessMsg('? OTP sent to your email. Please verify.');
          setIsOtpMode(true);
          setIsStep2(false);
        } else {"""
code = code.replace(old_logic_2, new_logic_2)

# 3. Subtitle
old_sub = "                  : (isOtpMode ? 'Enter the OTP sent to your email to activate your account' : 'Create your clinic workspace on SBN Sentinel')}"
new_sub = "                  : (isOtpMode ? 'Enter the OTP sent to your email to activate your account' : isStep2 ? 'Complete your professional profile for verification' : 'Create your clinic workspace on SBN Sentinel')}"
code = code.replace(old_sub, new_sub)

# 4. Inputs
old_inputs = """            {!isOtpMode ? (
              <>
                {!isLogin && !isForgotPassword && ("""
new_inputs = """            {!isOtpMode && !isStep2 ? (
              <>
                {!isLogin && !isForgotPassword && ("""
code = code.replace(old_inputs, new_inputs)

old_inputs_2 = """                )}
              </>
            ) : ("""
new_inputs_2 = """                )}
              </>
            ) : isStep2 && !isOtpMode ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
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
                <div>
                  <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Specialty</label>
                  <input type="text" placeholder="e.g. Cardiology" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Address</label>
                    <input type="text" placeholder="123 Health Ave, NY" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Phone</label>
                    <input type="tel" placeholder="+1 555 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#F7F9FC] border border-[#E8EDF5] rounded-[16px] py-3.5 px-4 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6]" required />
                  </div>
                </div>
                <button type="button" onClick={() => setIsStep2(false)} className="text-xs text-[#6B7280] font-bold mt-2">? Back to basics</button>
              </div>
            ) : ("""
code = code.replace(old_inputs_2, new_inputs_2)

# 5. Button Text
old_btn = "                  {isForgotPassword ? (isOtpMode ? 'Reset Password' : 'Send Reset OTP') : isLogin ? 'Sign In to Dashboard' : (isOtpMode ? 'Verify & Register' : 'Create Clinic Account')}"
new_btn = "                  {isForgotPassword ? (isOtpMode ? 'Reset Password' : 'Send Reset OTP') : isLogin ? 'Sign In to Dashboard' : (isOtpMode ? 'Verify & Register' : isStep2 ? 'Submit Registration' : 'Continue to Step 2')}"
code = code.replace(old_btn, new_btn)

with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
