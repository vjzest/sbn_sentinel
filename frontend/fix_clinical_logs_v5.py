import sys

with open('src/components/CommandCenter/ClinicalLogsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Split the content into Header (before the grid) and Body (grid and modal)
grid_split_str = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">'
parts = content.split(grid_split_str)

if len(parts) == 2:
    header = parts[0]
    body = parts[1]

    # --- Apply replacements ONLY to the Body ---
    
    # 1. Main Wrappers
    body = body.replace(
        'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow',
        'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
    )
    
    # 2. Add empty state to the table
    target_table = "{encounters.map((log) => ("
    replacement_table = """{encounters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <p className="text-sm text-white/50 font-bold">No clinical records found.</p>
                    </td>
                  </tr>
                )}
                {encounters.map((log) => ("""
    body = body.replace(target_table, replacement_table)
    
    # 3. Targeted specific replacements for text and colors inside the cards
    body = body.replace('text-[#111827]', 'text-white')
    body = body.replace('text-[#6B7280]', 'text-white/70')
    body = body.replace('text-[#4B5563]', 'text-white/60')
    body = body.replace('text-[#9CA3AF]', 'text-white/50')
    body = body.replace('border-[#E8EDF5]', 'border-white/10')
    body = body.replace('border-[#F3F4F6]', 'border-white/10')
    body = body.replace('border-[#E2E8F0]', 'border-white/10')
    body = body.replace('bg-[#F7F9FC]', 'bg-white/5')
    body = body.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')
    body = body.replace('bg-[#F8FAFC]', 'bg-white/5')
    body = body.replace('bg-[#F1F5F9]', 'bg-white/5')
    body = body.replace('bg-[#EEF4FF]', 'bg-blue-500/20')
    body = body.replace('text-[#2563EB]', 'text-blue-400')
    body = body.replace('bg-[#FFFBEB]', 'bg-orange-500/20')
    body = body.replace('text-[#F59E0B]', 'text-orange-400')
    body = body.replace('bg-[#ECFDF5]', 'bg-emerald-500/20')
    body = body.replace('text-[#10B981]', 'text-emerald-400')
    body = body.replace('bg-[#FEF2F2]', 'bg-red-500/20')
    body = body.replace('text-[#EF4444]', 'text-red-400')
    body = body.replace('bg-white hover:bg-gray-800', 'bg-white/10 hover:bg-white/20')

    # Replace specific inner bg-white borders
    body = body.replace(
        'bg-white border border-[#E8EDF5]',
        'bg-white/5 border border-white/10'
    )
    
    # Fix the Tab switcher classes
    body = body.replace(
        "activeTab === 'billing'\n                          ? 'bg-white text-[#2E1055] shadow-sm border border-[#E2E8F0]/30'",
        "activeTab === 'billing'\n                          ? 'bg-white/20 text-white shadow-sm border border-white/10'"
    )
    body = body.replace(
        "activeTab === 'clinical'\n                          ? 'bg-white text-[#2E1055] shadow-sm border border-[#E2E8F0]/30'",
        "activeTab === 'clinical'\n                          ? 'bg-white/20 text-white shadow-sm border border-white/10'"
    )

    # Convert remaining inner bg-whites
    body = body.replace('bg-white', 'bg-transparent')
    
    # Specific fix for Modal which also uses bg-white
    body = body.replace(
        'className="bg-transparent border border-white/10 w-full max-w-lg rounded-[28px]',
        'className="bg-[#120524] border border-white/10 w-full max-w-lg rounded-[28px]'
    )
    body = body.replace(
        'className="bg-transparent/5 border-b border-white/10 px-6 py-4 flex justify-between items-center"',
        'className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center"'
    )
    body = body.replace(
        'className="w-full bg-transparent border border-white/10 rounded-[16px]',
        'className="w-full bg-white/5 border border-white/10 rounded-[16px]'
    )

    new_content = header + grid_split_str + body

    with open('src/components/CommandCenter/ClinicalLogsView.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Fixed ClinicalLogsView safely")
else:
    print("Could not split content!")
