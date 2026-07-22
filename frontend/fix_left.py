import sys

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_floating_cards = '''          {/* Floating Cards Container */}
          <div className="relative pl-20">
            {/* Sidebar icon stack */}
            <div className="absolute left-0 top-0 bottom-0 w-[52px] bg-white/[0.03] border border-white/10 rounded-[20px] flex flex-col items-center py-5 gap-6 backdrop-blur-xl">
               <ShieldCheck className="w-5 h-5 text-white/50 hover:text-white transition-colors cursor-pointer" />
               <Building2 className="w-5 h-5 text-white/50 hover:text-white transition-colors cursor-pointer" />
               <Lock className="w-5 h-5 text-white/50 hover:text-white transition-colors cursor-pointer" />
               <div className="mt-auto pt-4 border-t border-white/10 w-full flex justify-center">
                 <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#6C4CF5] to-[#4527A0] flex items-center justify-center font-bold text-sm shadow-lg">
                   S
                 </div>
               </div>
            </div>

            {/* Growth Indicator Card */}
            <div className="bg-[#241544]/60 border border-white/10 backdrop-blur-xl rounded-[20px] p-5 mb-5 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-transform duration-300 cursor-pointer">'''

new_floating_cards = '''          {/* Floating Cards Container */}
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
            <div className="absolute right-0 top-0 w-[85%] bg-[#241544]/80 border border-white/10 backdrop-blur-xl rounded-[20px] p-5 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-transform duration-300 cursor-pointer z-10">'''

code = code.replace(old_floating_cards, new_floating_cards)

old_notif = '''            {/* Community Notifications Card */}
            <div className="bg-[#1C0F35]/80 border border-white/10 backdrop-blur-xl rounded-[20px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">'''

new_notif = '''            {/* Community Notifications Card */}
            <div className="absolute right-0 bottom-0 w-[85%] bg-[#1C0F35]/90 border border-white/10 backdrop-blur-xl rounded-[20px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-10">'''

code = code.replace(old_notif, new_notif)

with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
