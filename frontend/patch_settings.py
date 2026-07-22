import sys, re

with open('src/components/CommandCenter/SettingsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add script loader in useEffect
old_use_effect = '''  useEffect(() => {
    setMounted(true);
  }, []);'''

new_use_effect = '''  useEffect(() => {
    setMounted(true);
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);'''

code = code.replace(old_use_effect, new_use_effect)

# Replace the "Confirm Upgrade" onClick logic
# We need to find the specific button in the modal.
import re

old_button_click = '''              <button 
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
                }}'''

new_button_click = '''              <button 
                onClick={async () => {
                  setIsProcessingPayment(true);
                  
                  if (pendingPlan) {
                    try {
                      // Call backend to create Razorpay Order
                      const amount = pendingPlan === 'enterprise' ? 49900 : 19900; // in cents/paise
                      const res = await fetch(${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/billing/create-order, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plan_id: pendingPlan, amount: amount, currency: 'USD' })
                      });
                      
                      const orderData = await res.json();
                      
                      // Open Razorpay Checkout
                      const options = {
                        key: orderData.key_id,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: "SBN Sentinel",
                        description: Upgrade to Sentinel ,
                        order_id: orderData.order_id.startsWith('order_mock') ? undefined : orderData.order_id, // omit for mock
                        handler: function (response: any) {
                          setIsProcessingPayment(false);
                          setShowPaymentModal(false);
                          setActivePlan(pendingPlan);
                          showToast(Successfully upgraded to Sentinel !);
                          handleSaveChanges();
                        },
                        prefill: {
                          name: practiceName,
                          contact: practicePhone
                        },
                        theme: {
                          color: "#2E1055"
                        },
                        modal: {
                           ondismiss: function() {
                              setIsProcessingPayment(false);
                           }
                        }
                      };
                      
                      const rzp1 = new (window as any).Razorpay(options);
                      rzp1.open();
                      
                      // For mock/test environments if Razorpay is not loaded
                      if (orderData.order_id.startsWith('order_mock')) {
                         setTimeout(() => {
                            options.handler({ razorpay_payment_id: "pay_mock_123" });
                         }, 1500);
                      }
                      
                    } catch (error) {
                      setIsProcessingPayment(false);
                      showToast("Failed to initialize payment gateway", "error");
                    }
                  } else {
                    // Just update card (simulated)
                    setTimeout(() => {
                      setIsProcessingPayment(false);
                      setShowPaymentModal(false);
                      setPaymentCard('Mastercard ending in 8892');
                      showToast('Payment method updated successfully.');
                      handleSaveChanges();
                    }, 2000);
                  }
                }}'''

code = code.replace(old_button_click, new_button_click)

with open('src/components/CommandCenter/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done patching frontend")
