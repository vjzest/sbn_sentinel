import sys

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_header = '''      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-20 relative z-10 bg-gradient-to-br from-[#2E1055] to-[#120524] text-white rounded-r-[40px] shadow-2xl overflow-hidden">
        {/* Abstract background elements */}'''

new_header = '''      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 p-4 lg:p-6 h-screen">
        <div className="w-full h-full flex flex-col justify-center items-center p-16 relative z-10 bg-gradient-to-br from-[#2E1055] to-[#120524] text-white rounded-[40px] shadow-2xl overflow-hidden">
        {/* Abstract background elements */}'''

code = code.replace(old_header, new_header)

old_footer = '''            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}'''

new_footer = '''            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Right Side - Form */}'''

code = code.replace(old_footer, new_footer)

with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
