import sys, re

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update Plan Click
old_plan_click = '''                        <div 
                          key={plan.id}
                          onClick={() => {
                            setActivePlan(plan.id);
                            showToast(Switched package to );
                          }}'''

new_plan_click = '''                        <div 
                          key={plan.id}
                          onClick={() => {
                            if (plan.id !== activePlan) {
                              setPendingPlan(plan.id);
                              setShowPaymentModal(true);
                            }
                          }}'''

code = code.replace(old_plan_click, new_plan_click)

# 2. Update Edit Card Click
# We search for Edit Card button
code = re.sub(
    r'<button className="text-xs font-bold text-\[\#2563EB\] hover:underline cursor-pointer">Edit Card</button>',
    '''<button onClick={() => { setPendingPlan(null); setShowPaymentModal(true); }} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">Edit Card</button>''',
    code
)

# 3. Add Modal
old_toast = '''      {mounted && toast && createPortal('''

new_modal = '''      {mounted && showPaymentModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1121]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1a0b2e] w-full max-w-md rounded-[24px] premium-shadow border border-[#E8EDF5] dark:border-white/10 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E8EDF5] dark:border-white/10 flex justify-between items-center bg-[#FAFBFD] dark:bg-[#120524]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2563EB] dark:text-purple-400" />
                <h3 className="font-extrabold text-[#111827] dark:text-white text-sm">
                  {pendingPlan ? 'Complete Package Upgrade' : 'Update Payment Method'}
                </h3>
              </div>
              <button onClick={() => !isProcessingPayment && setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {pendingPlan && (
                <div className="bg-[#EEF4FF] dark:bg-purple-900/20 text-[#2563EB] dark:text-purple-300 p-4 rounded-xl border border-[#C7D2FE] dark:border-purple-500/30 text-xs font-semibold flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>You are upgrading to a new Sentinel package. Your card will be charged immediately upon confirmation.</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-[#6B7280] dark:text-white/60 tracking-wider">Cardholder Name</label>
                  <input type="text" placeholder="Dr. Sarah Jenkins" className="w-full bg-[#F8FAFC] dark:bg-white/5 border border-[#E8EDF5] dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]" defaultValue="Dr. Sarah Jenkins" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-[#6B7280] dark:text-white/60 tracking-wider">Card Number (Stripe Secure)</label>
                  <div className="relative">
                    <input type="text" placeholder="4242 4242 4242 4242" className="w-full bg-[#F8FAFC] dark:bg-white/5 border border-[#E8EDF5] dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-[#6B7280] dark:text-white/60 tracking-wider">Expiry (MM/YY)</label>
                    <input type="text" placeholder="12/28" className="w-full bg-[#F8FAFC] dark:bg-white/5 border border-[#E8EDF5] dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-[#6B7280] dark:text-white/60 tracking-wider">CVC</label>
                    <input type="password" placeholder="***" className="w-full bg-[#F8FAFC] dark:bg-white/5 border border-[#E8EDF5] dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-bold text-gray-400">
                <Lock className="w-3 h-3" /> Secured by 256-bit TLS Encryption
              </div>
            </div>
            
            <div className="p-4 border-t border-[#E8EDF5] dark:border-white/10 bg-[#FAFBFD] dark:bg-transparent flex justify-end gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7280] dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsProcessingPayment(true);
                  setTimeout(() => {
                    setIsProcessingPayment(false);
                    setShowPaymentModal(false);
                    if (pendingPlan) {
                      setActivePlan(pendingPlan);
                      showToast(Successfully upgraded to Sentinel !);
                      // We call handleSaveChanges here to persist
                      handleSaveChanges();
                    } else {
                      setPaymentCard('Mastercard ending in 8892');
                      showToast('Payment method updated successfully.');
                      handleSaveChanges();
                    }
                  }, 2000);
                }}
                disabled={isProcessingPayment}
                className="bg-[#2563EB] dark:bg-purple-600 hover:opacity-90 text-white font-bold text-xs px-6 py-2 rounded-xl premium-shadow transition-transform active:scale-95 flex items-center justify-center min-w-[140px]"
              >
                {isProcessingPayment ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  pendingPlan ? 'Confirm Upgrade' : 'Save Card'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {mounted && toast && createPortal('''

code = code.replace(old_toast, new_modal)

with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
