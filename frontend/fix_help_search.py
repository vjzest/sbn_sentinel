import sys
import re

with open('src/components/CommandCenter/HelpSupportView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useState
content = content.replace("import React from 'react';", "import React, { useState } from 'react';")
content = content.replace("export const HelpSupportView: React.FC = () => {\n  return (", "export const HelpSupportView: React.FC = () => {\n  const [searchQuery, setSearchQuery] = useState('');\n  const allFaqs = [\n    'How do I add a new Kareo billing integration?',\n    'Why is the AI recommendation not auto-filling the waitlist?',\n    'Can I export the patient flow data to a CSV?',\n    'What is the required confidence score for automated actions?',\n    'How do I reset a staff member password?',\n    'Where can I find the API documentation for custom webhooks?'\n  ];\n  const filteredFaqs = allFaqs.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase()));\n\n  return (")

# 2. Make Search bar larger and functional
old_search_div = """<div className="relative w-full max-w-2xl z-10">
           <Search className="w-5 h-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Search for articles, tutorials, or error codes..." 
             className="w-full pl-12 pr-6 py-4 rounded-[16px] text-lg text-white bg-white/10 border border-white/20 shadow-[0_4px_15px_rgba(46,16,85,0.3)] focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-white/50"
           />
         </div>"""

new_search_div = """<div className="relative w-full max-w-4xl z-10">
           <Search className="w-6 h-6 text-white/50 absolute left-6 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search for articles, tutorials, or error codes..." 
             className="w-full pl-16 pr-8 py-5 rounded-[20px] text-xl font-medium text-white bg-white/10 border border-white/20 shadow-[0_8px_30px_rgba(46,16,85,0.4)] focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white/20 transition-all placeholder:text-white/50"
           />
         </div>"""

content = content.replace(old_search_div, new_search_div)

# 3. Use filtered FAQs
old_faqs_map = """{[
                "How do I add a new Kareo billing integration?",
                "Why is the AI recommendation not auto-filling the waitlist?",
                "Can I export the patient flow data to a CSV?",
                "What is the required confidence score for automated actions?",
              ].map((q, i) => ("""

new_faqs_map = """{filteredFaqs.length > 0 ? filteredFaqs.map((q, i) => ("""

content = content.replace(old_faqs_map, new_faqs_map)

# Add fallback for no results
empty_state = """                </div>
              ))}
            </div>"""

new_empty_state = """                </div>
              )) : (
                <div className="p-8 text-center text-white/50 font-medium">No results found for "{searchQuery}"</div>
              )}
            </div>"""
content = content.replace(empty_state, new_empty_state)

with open('src/components/CommandCenter/HelpSupportView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed HelpSupportView search functionality")
