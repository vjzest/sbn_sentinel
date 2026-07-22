const fs = require('fs');

// 1. SignalFeed.tsx
let code = fs.readFileSync('src/components/CommandCenter/SignalFeed.tsx', 'utf8');
code = code.replace(
    'className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow flex flex-col h-[480px] hover:border-[#2E1055]/30 transition-colors"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex flex-col h-[480px] hover:border-white/30 transition-colors text-white"'
);
// replace specific styles
code = code.replace(/text-\[\#111827\]/g, 'text-white');
code = code.replace(/text-\[\#120524\]/g, 'text-white');
code = code.replace(/text-\[\#4B5563\]/g, 'text-white/90');
code = code.replace(/text-\[\#6B7280\]/g, 'text-white/70');
code = code.replace(/bg-\[\#F9FAFB\]/g, 'bg-white/5');
code = code.replace(/border-\[\#F3F4F6\]/g, 'border-white/10');
code = code.replace(/border-\[\#E8EDF5\]/g, 'border-white/10');
code = code.replace(/text-\[\#2563EB\]/g, 'text-[#A78BFA]'); // "View All Signals >"
code = code.replace(/bg-white border/g, 'bg-white/10 border-white/10 text-white'); // "Approve" outer box in SignalFeed if any
fs.writeFileSync('src/components/CommandCenter/SignalFeed.tsx', code);

// 2. AIInsights.tsx
code = fs.readFileSync('src/components/CommandCenter/AIInsights.tsx', 'utf8');
code = code.replace(
    'className="bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow flex flex-col h-[480px] hover:border-[#2E1055]/30 transition-colors relative overflow-hidden"',
    'className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex flex-col h-[480px] hover:border-white/30 transition-colors relative overflow-hidden text-white"'
);
code = code.replace(/text-\[\#111827\]/g, 'text-white');
code = code.replace(/text-\[\#2E1055\]/g, 'text-white');
code = code.replace(/text-\[\#4B5563\]/g, 'text-white/90');
code = code.replace(/text-\[\#6B7280\]/g, 'text-white/70');
code = code.replace(/bg-\[\#F9FAFB\]/g, 'bg-white/5');
code = code.replace(/bg-\[\#F3F4F6\]/g, 'bg-white/5');
code = code.replace(/border-\[\#E8EDF5\]/g, 'border-white/10');
code = code.replace(/border-\[\#F3F4F6\]/g, 'border-white/10');
code = code.replace('bg-white border border-[#E8EDF5]', 'bg-white/10 border-white/20 hover:bg-white/20 text-white');
fs.writeFileSync('src/components/CommandCenter/AIInsights.tsx', code);

console.log("Done SignalFeed and AIInsights");
