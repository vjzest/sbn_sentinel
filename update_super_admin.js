const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/components/CommandCenter/SuperAdminPanel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace layout wrappers
content = content.replace(
  '<div className="flex h-screen bg-[#F7F9FC] text-[#111827] font-sans overflow-hidden w-full absolute inset-0">',
  '<div className="flex h-screen bg-[#F8F9FD] text-[#111827] font-sans overflow-hidden w-full absolute inset-0 p-3 gap-3">'
);

content = content.replace(
  '<aside className={`w-64 bg-[#111827] text-white flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out shrink-0',
  '<aside className={`w-[260px] bg-slate-900/95 backdrop-blur-xl border border-gray-800 rounded-[24px] premium-shadow text-white flex flex-col fixed md:relative z-[60] h-full transition-transform duration-300 ease-in-out shrink-0'
);

content = content.replace(
  '<main className="flex-1 flex flex-col relative overflow-hidden">',
  '<main className="flex-1 flex flex-col relative overflow-hidden bg-white/60 backdrop-blur-3xl rounded-[24px] border border-gray-200 premium-shadow">'
);

content = content.replace(
  '<header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white border-b border-[#E8EDF5] z-10 shrink-0">',
  '<header className="h-20 flex items-center justify-between px-4 md:px-8 bg-transparent border-b border-gray-200 z-10 shrink-0">'
);

// Replace colors
content = content.replace(/#6D5DF6/g, '#6C4CF5');
content = content.replace(/#7C3AED/g, '#8B3DFF');
content = content.replace(/#E0D9FD/g, '#EEEAFE');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Super Admin UI updated successfully!');
