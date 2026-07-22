import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix bottom sidebar panel
old_bottom = 'className="p-4 space-y-1 border-t border-[#E8EDF5] bg-white/50 rounded-b-[24px]"'
new_bottom = 'className="p-4 space-y-1 border-t border-white/10 bg-transparent rounded-b-[24px]"'
code = code.replace(old_bottom, new_bottom)

# Fix wrapper background
old_wrapper = '<div className="flex h-screen bg-[#F7F9FC] text-[#111827] font-sans overflow-hidden w-full absolute inset-0 p-3 gap-3">'
new_wrapper = '<div className={lex h-screen  text-[#111827] font-sans overflow-hidden w-full absolute inset-0 p-3 gap-3}>'
code = code.replace(old_wrapper, new_wrapper)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
