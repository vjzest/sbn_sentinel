import sys

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_main = '''  return (
    <div className="min-h-screen w-full flex bg-[#F8F9FD] font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-[#6C4CF5]/20 to-[#8B3DFF]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-[#6C4CF5]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 p-4 lg:p-6 h-screen">
        <div className="w-full h-full flex flex-col justify-center items-center p-16 relative z-10 bg-gradient-to-br from-[#2E1055] to-[#120524] text-white rounded-[40px] shadow-2xl overflow-hidden">'''

new_main = '''  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-[#F8F9FD] font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-[#6C4CF5]/20 to-[#8B3DFF]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-[#6C4CF5]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-[1400px] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_20px_80px_rgba(79,70,229,0.12)] rounded-[40px] flex flex-col lg:flex-row relative z-10 overflow-hidden">

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 p-3">
        <div className="w-full h-full flex flex-col justify-center items-center p-16 relative z-10 bg-gradient-to-br from-[#2E1055] to-[#120524] text-white rounded-[32px] shadow-2xl overflow-hidden">'''

code = code.replace(old_main, new_main)

old_right = '''        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 w-full max-w-2xl p-8 rounded-[32px] shadow-[0_20px_80px_rgba(79,70,229,0.12)] animate-in slide-in-from-bottom-4 duration-500">'''

new_right = '''        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-16 relative z-10 bg-white/40">
        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-500">'''

code = code.replace(old_right, new_right)

# Wait, there's an extra div closing we might need to remove since we removed the inner bg-white/80 div.
# Let's fix the end of the file.

old_end = '''              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}'''

new_end = '''              </button>
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}'''

code = code.replace(old_end, new_end)

with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
