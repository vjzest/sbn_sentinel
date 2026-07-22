import sys

with open('src/components/CommandCenter/PatientFlowView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix Dismiss Button
code = code.replace(
    'className="flex-1 bg-[#1F2937] border border-[#374151] hover:bg-[#374151] text-white font-bold py-2.5 rounded-[16px] text-xs transition-colors hover:scale-[1.02] active:scale-95"',
    'className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 rounded-[16px] text-xs transition-colors hover:scale-[1.02] active:scale-95"'
)

# Fix Empty state for Live Waiting Queue
target = """{filteredEncounters.map((row, i) => {"""
replacement = """{filteredEncounters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <p className="text-sm text-white/50 font-bold">No patients currently in the queue.</p>
                    </td>
                  </tr>
                )}
                {filteredEncounters.map((row, i) => {"""

code = code.replace(target, replacement)

with open('src/components/CommandCenter/PatientFlowView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed PatientFlowView empty state")
