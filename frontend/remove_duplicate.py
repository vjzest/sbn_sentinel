import sys

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_states = '''  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);'''

new_states = '''  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);'''

code = code.replace(old_states, new_states)

with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
