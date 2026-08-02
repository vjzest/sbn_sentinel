import React, { useState } from 'react';
import { Search, Book, MessageCircle, Phone, FileText, ChevronRight, ExternalLink } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const allFaqs = [
    'How do I add a new Kareo billing integration?',
    'Why is the AI recommendation not auto-filling the waitlist?',
    'Can I export the patient flow data to a CSV?',
    'What is the required confidence score for automated actions?',
    'How do I reset a staff member password?',
    'Where can I find the API documentation for custom webhooks?'
  ];
  const filteredFaqs = allFaqs.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="animate-in fade-in duration-500 max-w-[1200px] mx-auto space-y-8">
      
      {/* Header & Search */}
      <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] rounded-[24px] p-12 premium-shadow text-white relative overflow-hidden text-center flex flex-col items-center">
         <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-white/5 opacity-10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-white/5 opacity-10 rounded-full blur-3xl"></div>
         
         <h2 className="text-4xl font-extrabold mb-4 relative z-10">How can we help you?</h2>
         <p className="text-[#E0E7FF] font-medium text-lg mb-8 max-w-xl relative z-10">Search our knowledge base or reach out to our enterprise support team.</p>
         
         <div className="relative w-full max-w-4xl z-10">
           <Search className="w-6 h-6 text-white/50 absolute left-6 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search for articles, tutorials, or error codes..." 
             className="w-full pl-16 pr-8 py-5 rounded-[20px] text-xl font-medium text-white bg-white/10 border border-white/20 shadow-[0_8px_30px_rgba(46,16,85,0.4)] focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white/20 transition-all placeholder:text-white/50"
           />
         </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Documentation', desc: 'Detailed guides on every feature.', icon: Book, color: 'text-blue-400', bg: 'bg-blue-500/20', hover: 'hover:border-[#BFDBFE]' },
          { title: 'API Reference', desc: 'Endpoints for custom integrations.', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/20', hover: 'hover:border-[#A7F3D0]' },
          { title: 'Community Forum', desc: 'Connect with other clinic admins.', icon: MessageCircle, color: 'text-orange-400', bg: 'bg-orange-500/20', hover: 'hover:border-[#FDE68A]' },
          { title: 'Contact Support', desc: '24/7 enterprise technical support.', icon: Phone, color: 'text-purple-400', bg: 'bg-purple-500/20', hover: 'hover:border-[#DDD6FE]' },
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-6 premium-shadow cursor-pointer transition-all ${card.hover} group`}>
             <div className={`w-12 h-12 ${card.bg} rounded-[14px] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
               <card.icon className={`w-6 h-6 ${card.color}`} />
             </div>
             <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
             <p className="text-xs text-white/70 font-medium leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQs & Ticket Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 premium-shadow col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? filteredFaqs.map((q, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-[16px] hover:bg-white/10 cursor-pointer transition-colors group">
                   <p className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{q}</p>
                   <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-blue-400" />
                </div>
              )) : (
                <div className="p-8 text-center text-white/50 font-medium">No matching help articles found for "{searchQuery}". Try adjusting your search terms, or open a support ticket for enterprise assistance.</div>
              )}
            </div>
            <button className="mt-6 text-sm font-bold text-blue-400 hover:underline flex items-center gap-1">
              View all FAQs <ExternalLink className="w-4 h-4" />
            </button>
         </div>

         <div className="bg-gradient-to-br from-[#2E1055] to-[#120524] border border-white/10 rounded-[24px] p-8 premium-shadow text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] rounded-full blur-[60px] opacity-20"></div>
            <h3 className="text-xl font-bold mb-3">Still need help?</h3>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">Our enterprise support team is available 24/7 to assist with critical integrations and AI behavior.</p>
            
            <button className="w-full bg-white/5 text-[#120524] font-extrabold py-3.5 rounded-[16px] hover:bg-white/90 transition-colors shadow-lg">
              Open Support Ticket
            </button>
            <p className="text-[10px] text-center text-white/70 font-bold mt-4 uppercase tracking-widest">Avg Response Time: &lt; 5 mins</p>
         </div>
      </div>
    </div>
  );
};
