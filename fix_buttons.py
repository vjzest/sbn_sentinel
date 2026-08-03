import os
import glob

files = glob.glob('frontend/src/components/CommandCenter/*.tsx')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        data = f.read()

    # Make buttons not wrap text
    data = data.replace(
        'className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow',
        'className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow whitespace-nowrap shrink-0'
    )
    
    data = data.replace(
        'className="flex items-center gap-2 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow',
        'className="flex items-center justify-center gap-2 text-white font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow whitespace-nowrap shrink-0'
    )

    data = data.replace(
        'className="flex items-center gap-2 bg-[#2E1055] hover:bg-[#120524] text-white font-bold text-xs px-4 py-2.5 rounded-[16px]',
        'className="flex items-center justify-center gap-2 bg-[#2E1055] hover:bg-[#120524] text-white font-bold text-xs px-4 py-2.5 rounded-[16px] whitespace-nowrap shrink-0'
    )
    
    data = data.replace(
        'className="flex items-center gap-2 border text-white font-bold text-xs px-4 py-2.5 rounded-[16px]',
        'className="flex items-center justify-center gap-2 border text-white font-bold text-xs px-4 py-2.5 rounded-[16px] whitespace-nowrap shrink-0'
    )

    data = data.replace(
        'className="flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow',
        'className="flex items-center justify-center gap-2 font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow whitespace-nowrap shrink-0'
    )

    # Convert lg:flex-row to md:flex-row
    data = data.replace(
        'flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0',
        'flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0'
    )

    # Ensure the button containers wrap if needed
    data = data.replace(
        '<div className="flex flex-wrap gap-2 lg:gap-3 relative w-full lg:w-auto">',
        '<div className="flex flex-wrap items-center gap-2 sm:gap-3 relative w-full md:w-auto">'
    )

    data = data.replace(
        '<div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto">',
        '<div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">'
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(data)
