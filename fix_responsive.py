import os
import glob

files = glob.glob('frontend/src/components/CommandCenter/*.tsx')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        data = f.read()

    data = data.replace(
        'className="flex items-end justify-between relative"', 
        'className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0 relative"'
    )
    
    data = data.replace(
        'className="flex items-end justify-between"', 
        'className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0"'
    )

    data = data.replace(
        '<div className="flex gap-3 relative">',
        '<div className="flex flex-wrap gap-2 lg:gap-3 relative w-full lg:w-auto">'
    )

    data = data.replace(
        '<div className="flex items-center gap-3">',
        '<div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto">'
    )

    data = data.replace(
        '<div className="flex items-center gap-3 relative">',
        '<div className="flex flex-wrap items-center gap-2 lg:gap-3 relative w-full lg:w-auto">'
    )

    # For the search input in ClinicalLogsView
    data = data.replace(
        'w-48 placeholder:text-',
        'w-full sm:w-48 placeholder:text-'
    )
    
    # Also fix grid layouts for cards to stack on mobile
    data = data.replace(
        'className="grid grid-cols-4 gap-6"',
        'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"'
    )
    data = data.replace(
        'className="grid grid-cols-3 gap-8 items-start"',
        'className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start"'
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(data)
