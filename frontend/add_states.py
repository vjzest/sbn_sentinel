import sys

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_states = '''  // Billing States
  const [activePlan, setActivePlan] = useState('professional'); // starter, professional, enterprise
  const [paymentCard, setPaymentCard] = useState('Visa ending in 4242');'''

new_states = '''  // Billing States
  const [activePlan, setActivePlan] = useState('professional'); // starter, professional, enterprise
  const [paymentCard, setPaymentCard] = useState('Visa ending in 4242');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);'''

if old_states in code:
    code = code.replace(old_states, new_states)
    with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Done adding states")
else:
    print("States already exist or pattern not found")
