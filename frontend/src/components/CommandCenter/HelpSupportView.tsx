import React from 'react';
import { Search, Book, MessageCircle, Phone, FileText, ChevronRight, ExternalLink } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-[1200px] mx-auto space-y-8">
      
      {/* Header & Search */}
      <div className="bg-gradient-to-br from-[#6D5DF6] to-[#7C3AED] rounded-[24px] p-12 premium-shadow text-white relative overflow-hidden text-center flex flex-col items-center">
         <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
         
         <h2 className="text-4xl font-extrabold mb-4 relative z-10">How can we help you?</h2>
         <p className="text-[#E0E7FF] font-medium text-lg mb-8 max-w-xl relative z-10">Search our knowledge base or reach out to our enterprise support team.</p>
         
         <div className="relative w-full max-w-2xl z-10">
           <Search className="w-5 h-5 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Search for articles, tutorials, or error codes..." 
             className="w-full pl-12 pr-6 py-4 rounded-[16px] text-lg text-[#111827] bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-[#9CA3AF]"
           />
         </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Documentation', desc: 'Detailed guides on every feature.', icon: Book, color: 'text-[#2563EB]', bg: 'bg-[#EEF4FF]', hover: 'hover:border-[#BFDBFE]' },
          { title: 'API Reference', desc: 'Endpoints for custom integrations.', icon: FileText, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]', hover: 'hover:border-[#A7F3D0]' },
          { title: 'Community Forum', desc: 'Connect with other clinic admins.', icon: MessageCircle, color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]', hover: 'hover:border-[#FDE68A]' },
          { title: 'Contact Support', desc: '24/7 enterprise technical support.', icon: Phone, color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]', hover: 'hover:border-[#DDD6FE]' },
        ].map((card, i) => (
          <div key={i} className={`bg-white border border-[#E8EDF5] rounded-[24px] p-6 premium-shadow cursor-pointer transition-all ${card.hover} group`}>
             <div className={`w-12 h-12 ${card.bg} rounded-[14px] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
               <card.icon className={`w-6 h-6 ${card.color}`} />
             </div>
             <h3 className="text-base font-bold text-[#111827] mb-2">{card.title}</h3>
             <p className="text-xs text-[#6B7280] font-medium leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQs & Ticket Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow col-span-2">
            <h3 className="text-xl font-bold text-[#111827] mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                "How do I add a new Kareo billing integration?",
                "Why is the AI recommendation not auto-filling the waitlist?",
                "Can I export the patient flow data to a CSV?",
                "What is the required confidence score for automated actions?",
              ].map((q, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-[16px] hover:bg-[#F7F9FC] cursor-pointer transition-colors group">
                   <p className="text-sm font-bold text-[#4B5563] group-hover:text-[#111827] transition-colors">{q}</p>
                   <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2563EB]" />
                </div>
              ))}
            </div>
            <button className="mt-6 text-sm font-bold text-[#2563EB] hover:underline flex items-center gap-1">
              View all FAQs <ExternalLink className="w-4 h-4" />
            </button>
         </div>

         <div className="bg-[#111827] border border-[#1F2937] rounded-[24px] p-8 premium-shadow text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] rounded-full blur-[60px] opacity-20"></div>
            <h3 className="text-xl font-bold mb-3">Still need help?</h3>
            <p className="text-sm text-[#9CA3AF] mb-6 leading-relaxed">Our enterprise support team is available 24/7 to assist with critical integrations and AI behavior.</p>
            
            <button className="w-full bg-white text-[#111827] font-extrabold py-3.5 rounded-[16px] hover:bg-[#F3F4F6] transition-colors shadow-lg">
              Open Support Ticket
            </button>
            <p className="text-[10px] text-center text-[#6B7280] font-bold mt-4 uppercase tracking-widest">Avg Response Time: &lt; 5 mins</p>
         </div>
      </div>
    </div>
  );
};
