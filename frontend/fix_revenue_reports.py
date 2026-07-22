import sys

with open('src/components/CommandCenter/RevenueReportsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Split the content into Header (before the top stats) and Body
grid_split_str = '<div className="grid grid-cols-1 md:grid-cols-4 gap-6">'
parts = content.split(grid_split_str)

if len(parts) == 2:
    header = parts[0]
    body = parts[1]

    # --- Apply replacements ONLY to the Body ---
    
    # 1. Main Wrappers
    body = body.replace(
        'bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow',
        'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
    )
    body = body.replace(
        'bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow',
        'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(46,16,85,0.3)] text-white'
    )
    
    # 2. Add empty state to the table
    target_table = "{encounters.map((enc, i) => {"
    replacement_table = """{encounters.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <p className="text-sm text-white/50 font-bold">No revenue records found.</p>
                    </td>
                  </tr>
                )}
                {encounters.map((enc, i) => {"""
    body = body.replace(target_table, replacement_table)
    
    # 3. Targeted specific replacements for text and colors inside the cards
    body = body.replace('text-[#111827]', 'text-white')
    body = body.replace('text-[#6B7280]', 'text-white/70')
    body = body.replace('text-[#4B5563]', 'text-white/60')
    body = body.replace('text-[#9CA3AF]', 'text-white/50')
    
    body = body.replace('border-[#E8EDF5]', 'border-white/10')
    body = body.replace('border-[#F3F4F6]', 'border-white/10')
    
    body = body.replace('bg-[#F7F9FC]', 'bg-white/5')
    body = body.replace('hover:bg-[#F7F9FC]', 'hover:bg-white/10')
    
    body = body.replace('bg-[#F3F4F6]', 'bg-white/5')
    body = body.replace('bg-[#EEF4FF]', 'bg-blue-500/20')
    body = body.replace('text-[#2563EB]', 'text-blue-400')
    body = body.replace('border-[#BFDBFE]/50', 'border-blue-500/30')
    body = body.replace('bg-blue-100', 'bg-blue-500/30')
    
    body = body.replace('bg-[#FFFBEB]', 'bg-orange-500/20')
    body = body.replace('text-[#F59E0B]', 'text-orange-400')
    
    body = body.replace('bg-[#ECFDF5]', 'bg-emerald-500/20')
    body = body.replace('text-[#10B981]', 'text-emerald-400')
    body = body.replace('text-[#34D399]', 'text-emerald-400')
    body = body.replace('text-emerald-600', 'text-emerald-400')
    
    body = body.replace('bg-[#FEF2F2]', 'bg-red-500/20')
    body = body.replace('text-[#EF4444]', 'text-red-400')
    
    body = body.replace('text-[#120524]', 'text-white')
    body = body.replace('bg-[#F5F3FF]', 'bg-purple-500/20')
    
    # 4. Modals
    body = body.replace('bg-white', 'bg-[#120524]')
    body = body.replace('bg-[#FAFBFD]', 'bg-white/5')

    new_content = header + grid_split_str + body

    with open('src/components/CommandCenter/RevenueReportsView.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Fixed RevenueReportsView safely")
else:
    print("Could not split content!")
