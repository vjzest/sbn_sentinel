import sys

with open('src/components/CommandCenter/SuperAdminPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix null stats issue for overview rendering
content = content.replace("activeTab === 'overview' && stats && (", "activeTab === 'overview' && (")
# Replace any stats usage with fallback
content = content.replace("stats.total_clinics", "(stats?.total_clinics || 0)")
content = content.replace("stats.active_users", "(stats?.active_users || 0)")
content = content.replace("stats.platform_revenue_formatted", "(stats?.platform_revenue_formatted || '$0.00')")
content = content.replace("stats.ai_token_usage_today", "(stats?.ai_token_usage_today || '0')")

# Theming replacements
content = content.replace('bg-[#F8F9FD]', 'bg-[#120524]') # Main wrapper bg
content = content.replace('text-[#111827]', 'text-white')
content = content.replace('text-[#6B7280]', 'text-white/70')
content = content.replace('text-[#4B5563]', 'text-white/60')

content = content.replace('bg-white/60 backdrop-blur-3xl rounded-[24px] border border-gray-200', 'bg-white/5 backdrop-blur-3xl rounded-[24px] border border-white/10')
content = content.replace('border-gray-200', 'border-white/10')
content = content.replace('border-gray-100', 'border-white/10')
content = content.replace('bg-white', 'bg-white/5')
content = content.replace('text-gray-900', 'text-white')
content = content.replace('text-gray-700', 'text-white')
content = content.replace('text-gray-600', 'text-white/70')
content = content.replace('text-gray-400', 'text-white/50')
content = content.replace('text-gray-300', 'text-white/40')
content = content.replace('bg-gray-50/50', 'bg-white/5')
content = content.replace('bg-gray-50/30', 'bg-white/5')
content = content.replace('bg-gray-50', 'bg-white/5')
content = content.replace('bg-gray-100', 'bg-white/10')
content = content.replace('bg-gray-200', 'bg-white/20')
content = content.replace('bg-[#F3F4F6]', 'bg-white/5')
content = content.replace('border-[#E8EDF5]', 'border-white/10')
content = content.replace('bg-white/40', 'text-white/40') # wait, text-white/40 is already used
content = content.replace('hover:bg-gray-50', 'hover:bg-white/10')
content = content.replace('hover:bg-gray-100', 'hover:bg-white/10')

# Specific card headers & tags
content = content.replace('bg-blue-50 text-blue-600', 'bg-blue-500/20 text-blue-400')
content = content.replace('bg-emerald-50 text-emerald-600', 'bg-emerald-500/20 text-emerald-400')
content = content.replace('bg-emerald-50 text-emerald-700 border-emerald-200', 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')
content = content.replace('hover:bg-emerald-100', 'hover:bg-emerald-500/30')
content = content.replace('bg-purple-50 text-purple-600', 'bg-purple-500/20 text-purple-400')
content = content.replace('bg-purple-100 text-purple-700', 'bg-purple-500/20 text-purple-400')
content = content.replace('bg-blue-100 text-blue-700', 'bg-blue-500/20 text-blue-400')
content = content.replace('bg-orange-50 text-orange-600', 'bg-orange-500/20 text-orange-400')
content = content.replace('bg-orange-100 text-orange-700', 'bg-orange-500/20 text-orange-400')
content = content.replace('bg-rose-50 text-rose-700 border-rose-200', 'bg-rose-500/20 text-rose-400 border-rose-500/30')
content = content.replace('hover:bg-rose-100', 'hover:bg-rose-500/30')
content = content.replace('bg-rose-50 text-rose-600', 'bg-rose-500/20 text-rose-400')
content = content.replace('hover:text-indigo-800', 'hover:text-indigo-400')

# Top header super admin badge
content = content.replace('text-[#10B981]', 'text-emerald-400')

# Modal
content = content.replace('bg-white/5 rounded-[24px]', 'bg-[#120524] rounded-[24px]')
content = content.replace('bg-white/5 p-6 rounded-2xl', 'bg-gradient-to-br from-[#2E1055] to-[#120524] p-6 rounded-2xl border border-white/10')
content = content.replace('bg-white/5 border border-white/10 rounded-2xl p-6', 'bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-2xl p-6')

# System Health Fixes
content = content.replace('bg-slate-900', 'bg-gradient-to-br from-[#2E1055] to-[#120524]')
content = content.replace('bg-gray-800', 'bg-white/10')

# Make all tables have dark headers
content = content.replace('bg-white/5 text-[11px]', 'bg-white/10 text-[11px]')

# Fix specific bugs
content = content.replace('bg-white/5 text-gray-700', 'bg-white/5 text-white/70')
content = content.replace('bg-gray-100 text-gray-700', 'bg-white/10 text-white')
content = content.replace('text-indigo-900', 'text-white')
content = content.replace('text-emerald-900', 'text-white')
content = content.replace('bg-[#EEEAFE]0/20', 'bg-[#6D5DF6]/20')
content = content.replace('border-[#EEEAFE]0', 'border-[#6D5DF6]')
content = content.replace('bg-[#EEEAFE]0', 'bg-[#6D5DF6]')
content = content.replace('bg-[#EEEAFE]', 'bg-[#6D5DF6]/20')
content = content.replace('text-[#120524]', 'text-white')

with open('src/components/CommandCenter/SuperAdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Super admin panel theme updated")
