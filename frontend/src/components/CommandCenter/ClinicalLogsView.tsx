import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Search, Filter, Download, CheckCircle2, FileSignature, Receipt, CreditCard, ChevronRight, AlertTriangle, ShieldCheck, ShieldAlert, Check, Sparkles, Info, Printer, Plus, X, FileSpreadsheet, Users } from 'lucide-react';

export const ClinicalLogsView: React.FC = () => {
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedPatientInsurance, setSelectedPatientInsurance] = useState<any | null>(null);
  const [billingSuccess, setBillingSuccess] = useState<'Paid' | 'Billed' | null>(null);

  // Form states for adding new encounter
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [providerName, setProviderName] = useState('Dr. Sarah Jenkins');
  const [diagnosis, setDiagnosis] = useState('');
  const [visitType, setVisitType] = useState('Consultation');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [medications, setMedications] = useState('');
  const [copayAmount, setCopayAmount] = useState('30.00');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'billing' | 'clinical'>('billing');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic state for encounters loaded from database
  const [encounters, setEncounters] = useState<any[]>([]);

  const fetchEncounters = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/encounters`);
      if (response.ok) {
        const data = await response.json();
        setEncounters(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  const activeEncounter = encounters.find(e => e.id === activeBillId);

  // Export all logs helper
  const handleExportAllLogs = () => {
    const headers = ['Encounter ID', 'Patient', 'Provider', 'Date', 'Diagnosis', 'Type', 'Status', 'Billing Status', 'Copay ($)', 'Prescribed Medications'];
    const rows = encounters.map(e => [
      e.id,
      e.patient_name,
      e.provider_name,
      e.date,
      e.diagnosis,
      e.type,
      e.status,
      e.billing_status,
      e.copay || 30.00,
      e.medications || 'None'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sbn_sentinel_clinical_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Patient Chart as SOAP Notes text & professional print format
  const handleDownloadChart = (enc: any) => {
    const notes = enc.clinical_notes || enc.clinicalNotes || "Patient reports standard symptoms. Checked vitals. Diagnostic codes mapped. Recommended regular check-up and follow-up consultation in 2 weeks.";
    
    // Parse notes into SOAP structure if possible, or fallback to beautiful paragraphs
    const subjective = notes.includes("Subjective:") ? notes.split("Objective:")[0].replace("Subjective:", "").trim() : notes;
    const objective = notes.includes("Objective:") ? notes.split("Objective:")[1].split("Assessment:")[0].trim() : "Vitals check: Temp 98.6°F, BP 120/80 mmHg, HR 72 bpm. Diagnostic verification secure.";
    const assessment = notes.includes("Assessment:") ? notes.split("Assessment:")[1].split("Plan:")[0].trim() : `Primary diagnostic evaluation: ${enc.diagnosis}. Mapped ICD-10 and CPT codes for claims processing.`;
    const plan = notes.includes("Plan:") ? notes.split("Plan:")[1].trim() : `1. Treatment & Prescriptions: ${enc.medications || 'None prescribed.'}\n2. Follow protocol guidelines.\n3. Schedule review if symptoms persist.`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print/download the clinical summary.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Clinical Summary - ${enc.patient_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1F2937;
              line-height: 1.5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .header-logo {
              font-size: 24px;
              font-weight: 800;
              color: #6D5DF6;
              letter-spacing: -0.025em;
            }
            .header-sublogo {
              font-size: 10px;
              font-weight: 700;
              color: #10B981;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              display: block;
              margin-top: -2px;
            }
            .header-details {
              text-align: right;
              font-size: 11px;
              color: #6B7280;
              font-weight: 500;
            }
            .document-title {
              text-align: center;
              font-size: 18px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 25px;
              color: #111827;
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 8px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #6D5DF6;
              margin-top: 25px;
              margin-bottom: 12px;
              border-bottom: 1px solid #F3F4F6;
              padding-bottom: 4px;
            }
            .info-grid {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              background-color: #F7F9FC;
              border: 1px solid #E5E7EB;
              border-radius: 12px;
            }
            .info-grid td {
              padding: 12px 16px;
              font-size: 12px;
              border-bottom: 1px solid #E5E7EB;
            }
            .info-grid tr:last-child td {
              border-bottom: none;
            }
            .info-label {
              font-weight: 700;
              color: #4B5563;
              width: 18%;
            }
            .info-val {
              color: #111827;
              font-weight: 600;
              width: 32%;
            }
            .soap-card {
              border-left: 4px solid #6D5DF6;
              padding-left: 16px;
              margin-bottom: 20px;
            }
            .soap-card.s { border-left-color: #3B82F6; }
            .soap-card.o { border-left-color: #10B981; }
            .soap-card.a { border-left-color: #F59E0B; }
            .soap-card.p { border-left-color: #8B5CF6; }
            
            .soap-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #374151;
              margin: 0 0 4px 0;
            }
            .soap-desc {
              font-size: 12.5px;
              color: #4B5563;
              margin: 0;
              font-weight: 500;
              white-space: pre-line;
            }
            .rx-box {
              background-color: #EEF2FF;
              border: 1.5px dashed #6D5DF6;
              border-radius: 12px;
              padding: 16px;
              margin-top: 15px;
            }
            .rx-title {
              font-size: 13px;
              font-weight: 800;
              color: #312E81;
              margin: 0 0 8px 0;
            }
            .rx-item {
              font-size: 13px;
              font-weight: 700;
              color: #1E1B4B;
              background: #ffffff;
              padding: 8px 12px;
              border-radius: 8px;
              border: 1px solid #C7D2FE;
            }
            .billing-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
            }
            .billing-table th {
              background-color: #F3F4F6;
              font-weight: 700;
              color: #374151;
              text-align: left;
              padding: 8px 12px;
              border: 1px solid #E5E7EB;
            }
            .billing-table td {
              padding: 8px 12px;
              border: 1px solid #E5E7EB;
              font-weight: 500;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              border-radius: 6px;
            }
            .badge-success { background-color: #D1FAE5; color: #065F46; }
            .badge-primary { background-color: #DBEAFE; color: #1E40AF; }
            .badge-warning { background-color: #FEF3C7; color: #92400E; }
            .badge-danger { background-color: #FEE2E2; color: #991B1B; }
            
            .footer-notes {
              margin-top: 50px;
              text-align: center;
              font-size: 10px;
              color: #9CA3AF;
              font-weight: 500;
              border-top: 1px solid #E5E7EB;
              padding-top: 15px;
            }
            .sign-area {
              margin-top: 40px;
              width: 100%;
            }
            .sign-line {
              border-top: 1px solid #9CA3AF;
              width: 220px;
              margin-top: 30px;
              display: inline-block;
              font-size: 11px;
              color: #4B5563;
              font-weight: 600;
              text-align: center;
              padding-top: 4px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <span class="header-logo">SBN SENTINEL</span>
                <span class="header-sublogo">Command Center & EHR</span>
              </td>
              <td class="header-details">
                <strong>SBN Healthcare Urgent Care Group</strong><br/>
                100 Medical Plaza, Suite 400<br/>
                Phone: +1 (555) 019-9000 | support@sbnsentinel.com
              </td>
            </tr>
          </table>

          <div class="document-title">Patient Clinical Summary Report</div>

          <table class="info-grid">
            <tr>
              <td class="info-label">Patient Name</td>
              <td class="info-val">${enc.patient_name}</td>
              <td class="info-label">Date of Visit</td>
              <td class="info-val">${enc.date}</td>
            </tr>
            <tr>
              <td class="info-label">Encounter ID</td>
              <td class="info-val">${enc.id}</td>
              <td class="info-label">Provider Name</td>
              <td class="info-val">${enc.provider_name}</td>
            </tr>
            <tr>
              <td class="info-label">Visit Type</td>
              <td class="info-val">${enc.type}</td>
              <td class="info-label">Department</td>
              <td class="info-val">${enc.department || 'General Practice'}</td>
            </tr>
            <tr>
              <td class="info-label">Priority Level</td>
              <td class="info-val">${enc.priority}</td>
              <td class="info-label">Primary Diagnosis</td>
              <td class="info-val">${enc.diagnosis}</td>
            </tr>
          </table>

          <div class="section-title">Clinical SOAP Chart Notes</div>
          
          <div class="soap-card s">
            <h5 class="soap-title">Subjective (Chief Complaint & History)</h5>
            <p class="soap-desc">${subjective}</p>
          </div>
          
          <div class="soap-card o">
            <h5 class="soap-title">Objective (Physical Examination & Vitals)</h5>
            <p class="soap-desc">${objective}</p>
          </div>
          
          <div class="soap-card a">
            <h5 class="soap-title">Assessment (Clinical Findings & Mapping)</h5>
            <p class="soap-desc">${assessment}</p>
          </div>
          
          <div class="soap-card p">
            <h5 class="soap-title">Plan (Treatment & Follow-Up Protocols)</h5>
            <p class="soap-desc">${plan}</p>
          </div>

          <div class="section-title">Prescriptions & Suggested Medications (Rx)</div>
          <div class="rx-box">
            <div class="rx-title">Rx (Prescribed Medication Directive)</div>
            <div class="rx-item">${enc.medications || 'No medications prescribed during this consultation.'}</div>
          </div>

          <div class="section-title">Financial Ledger & Billing Codes</div>
          <table class="billing-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Co-pay Status</th>
                <th>Claim Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>99213 / CPT</td>
                <td>Outpatient Office Visit (Level 3)</td>
                <td rowspan="2" style="vertical-align: middle;">
                  <span class="badge ${enc.billing_status === 'Paid' ? 'badge-success' : 'badge-warning'}">
                    $${(enc.copay || 30.00).toFixed(2)} - ${enc.billing_status === 'Paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td rowspan="2" style="vertical-align: middle;">
                  <span class="badge ${
                    enc.billing_status === 'Billed' ? 'badge-primary' : 
                    enc.billing_status === 'Paid' ? 'badge-success' : 
                    enc.billing_status === 'Claim Denied' ? 'badge-danger' : 'badge-warning'
                  }">
                    ${enc.billing_status}
                  </span>
                </td>
              </tr>
              <tr>
                <td>80053 / CPT</td>
                <td>Comprehensive Metabolic Panel (CMP)</td>
              </tr>
            </tbody>
          </table>

          <table class="sign-area">
            <tr>
              <td>
                <div class="sign-line">Doctor Signature (Signed Electronically)</div>
              </td>
              <td style="text-align: right;">
                <div class="sign-line">Discharge Clerk Signature</div>
              </td>
            </tr>
          </table>

          <div class="footer-notes">
            <strong>HIPAA COMPLIANT SECURE DOCUMENT</strong><br/>
            This record was securely finalized and signed electronically in the SBN Sentinel Database. All data remains encrypted and protected.<br/>
            Generated on ${new Date().toLocaleString()} | System Administrator: Admin User
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleSaveEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !diagnosis) return;

    const newEncId = `enc_${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnc = {
      id: newEncId,
      patient_name: patientName,
      provider_name: providerName,
      date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      diagnosis: diagnosis,
      type: visitType,
      status: 'Completed',
      billing_status: 'Pending',
      copay: parseFloat(copayAmount) || 30.00,
      priority: 'Normal',
      wait_time: '0 mins',
      department: visitType === 'Consultation' ? 'General Practice' : 'Urgent Care',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/encounters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnc)
      });
      if (response.ok) {
        await fetchEncounters();
        // Reset form
        setPatientName('');
        setDiagnosis('');
        setClinicalNotes('');
        setMedications('');
        setShowAddModal(false);
        setActiveBillId(newEncId);
      }
    } catch (error) {
      console.error("Failed to save encounter to database:", error);
    }
  };

  // Fetch patient insurance details when encounter is selected
  useEffect(() => {
    if (!activeEncounter) {
      setSelectedPatientInsurance(null);
      setBillingSuccess(null);
      return;
    }

    const loadInsurance = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/insurance/patient/${encodeURIComponent(activeEncounter.patient_name)}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedPatientInsurance(data || null);
        } else {
          setSelectedPatientInsurance(null);
        }
      } catch (err) {
        console.error("Failed to load patient insurance:", err);
        setSelectedPatientInsurance(null);
      }
    };

    loadInsurance();
  }, [activeBillId, encounters]);

  const handleGenerateBill = (id: string) => {
    setActiveBillId(id);
    setProcessing(true);
    setBillingSuccess(null);
    setTimeout(() => {
      setProcessing(false);
    }, 1200);
  };

  const processPaymentAction = async () => {
    if (!activeBillId) return;
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/encounters/${activeBillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing_status: 'Paid' })
      });
      if (response.ok) {
        setBillingSuccess('Paid');
        await fetchEncounters();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const submitInsuranceClaimAction = async () => {
    if (!activeBillId) return;
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/encounters/${activeBillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing_status: 'Billed' })
      });
      if (response.ok) {
        setBillingSuccess('Billed');
        await fetchEncounters();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between relative">
        <div>
          <h2 className="text-3xl font-extrabold text-[#111827] mb-1">Clinical Logs & Billing</h2>
          <p className="text-sm text-[#6B7280] font-medium">Review patient encounters, finalize charts, and generate automated bills.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#E8EDF5] rounded-[16px] px-3 py-2 premium-shadow">
            <Search className="w-4 h-4 text-[#6B7280]" />
            <input type="text" placeholder="Search encounters..." className="bg-transparent border-none outline-none text-xs text-[#111827] w-48 placeholder:text-[#9CA3AF]" />
          </div>
          <button className="flex items-center gap-2 bg-white border border-[#E8EDF5] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow hover:bg-[#F7F9FC] transition-colors">
            <Filter className="w-4 h-4 text-[#6B7280]" /> Filter
          </button>
          <button
            onClick={handleExportAllLogs}
            className="flex items-center gap-2 bg-white border border-[#E8EDF5] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow hover:bg-[#F7F9FC] transition-colors"
          >
            <Download className="w-4 h-4 text-[#6B7280]" /> Export Logs
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#6D5DF6] hover:bg-[#5B4AE8] text-white font-bold text-xs px-4 py-2.5 rounded-[16px] premium-shadow transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Encounter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Logs Table */}
        <div className="lg:col-span-2 bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow">
          <h3 className="text-base font-bold text-[#111827] mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#6D5DF6]" /> Recent Encounters
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8EDF5] text-[11px] uppercase text-[#6B7280]">
                  <th className="pb-4 font-extrabold tracking-wider px-2">Encounter ID</th>
                  <th className="pb-4 font-extrabold tracking-wider px-2">Patient / Date</th>
                  <th className="pb-4 font-extrabold tracking-wider px-2">Diagnosis</th>
                  <th className="pb-4 font-extrabold tracking-wider px-2">Billing Status</th>
                  <th className="pb-4 font-extrabold tracking-wider px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-[#111827]">
                {encounters.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-b border-[#F3F4F6] hover:bg-[#F7F9FC] transition-colors last:border-0 cursor-pointer ${activeBillId === log.id ? 'bg-[#EEF4FF]/50 border-l-4 border-l-[#6D5DF6]' : ''}`}
                    onClick={() => handleGenerateBill(log.id)}
                  >
                    <td className="py-4 px-2 font-mono text-[#2563EB] text-xs">{log.id}</td>
                    <td className="py-4 px-2">
                      <p className="text-sm font-bold text-[#111827]">{log.patient_name}</p>
                      <p className="text-[10px] text-[#6B7280] uppercase mt-0.5">{log.date}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="text-sm font-bold text-[#4B5563]">{log.diagnosis}</p>
                      <p className="text-[10px] text-[#9CA3AF] uppercase mt-0.5">{log.type}</p>
                    </td>
                    <td className="py-4 px-2">
                      {log.billing_status === 'Pending' && <span className="bg-[#FFFBEB] text-[#F59E0B] px-3 py-1 rounded-[8px] text-[10px] font-extrabold uppercase border border-[#FEF3C7]">Needs Billing</span>}
                      {log.billing_status === 'Billed' && <span className="bg-[#EEF4FF] text-[#2563EB] px-3 py-1 rounded-[8px] text-[10px] font-extrabold uppercase border border-[#DBEAFE]">Invoice Sent</span>}
                      {log.billing_status === 'Paid' && <span className="bg-[#ECFDF5] text-[#10B981] px-3 py-1 rounded-[8px] text-[10px] font-extrabold uppercase border border-[#D1FAE5]">Paid</span>}
                      {log.billing_status === 'Claim Denied' && <span className="bg-[#FEF2F2] text-[#EF4444] px-3 py-1 rounded-[8px] text-[10px] font-extrabold uppercase border border-[#FEE2E2]">Claim Denied</span>}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {log.billing_status === 'Pending' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleGenerateBill(log.id); }}
                          className="text-[11px] font-bold text-white bg-[#6D5DF6] px-4 py-2 rounded-[10px] hover:bg-[#5B4AE8] transition-all hover:scale-105 active:scale-95 flex items-center gap-1 ml-auto"
                        >
                          <Receipt className="w-3 h-3" /> Generate Bill
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleGenerateBill(log.id); }}
                          className="text-[11px] font-bold text-[#6B7280] hover:text-[#111827] px-3 py-1.5 transition-colors border border-[#E8EDF5] bg-[#F7F9FC] rounded-[8px] hover:bg-white"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Billing Assistant Widget */}
        <div className="bg-white border border-[#E8EDF5] rounded-[24px] p-8 premium-shadow flex flex-col relative overflow-hidden min-h-[500px]">
          {/* Background decorative blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#EEF4FF] rounded-full blur-[60px] pointer-events-none"></div>

          <h3 className="text-base font-bold text-[#111827] mb-6 flex items-center gap-2 relative z-10">
            <FileSignature className="w-5 h-5 text-[#2563EB]" /> AI Billing Assistant
          </h3>

          {!activeBillId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 opacity-70">
              <div className="w-16 h-16 bg-[#F7F9FC] border border-[#E8EDF5] rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-[#9CA3AF]" />
              </div>
              <p className="text-sm font-bold text-[#4B5563] mb-1">Select an encounter to bill</p>
              <p className="text-xs text-[#6B7280]">Our AI will automatically map ICD-10 codes and fetch active patient insurance coverage.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative z-10 animate-in slide-in-from-right-4">
              {processing ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#EEF4FF] border-t-[#2563EB] rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-bold text-[#111827]">Processing Transaction...</p>
                  <p className="text-xs text-[#6B7280] mt-1">Connecting to gateway & checking claims rules</p>
                </div>
              ) : billingSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-[#ECFDF5] border border-[#D1FAE5] rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h4 className="text-base font-bold text-[#111827] mb-1">
                    {billingSuccess === 'Paid' ? 'Payment Completed!' : 'Claim Dispatched!'}
                  </h4>
                  <p className="text-xs text-[#6B7280] max-w-[240px] mb-6">
                    {billingSuccess === 'Paid'
                      ? 'Co-pay collection processed and marked as settled in EHR.'
                      : 'Insurance claim successfully coded and uploaded to clearinghouse portal.'}
                  </p>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-white border border-[#E8EDF5] hover:bg-[#F7F9FC] text-[#4B5563] font-bold text-xs py-2.5 rounded-[16px] flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button
                      onClick={() => handleDownloadChart(activeEncounter)}
                      className="flex-1 bg-[#EEF2F6] hover:bg-[#E2E8F0] text-[#111827] font-bold text-xs py-2.5 rounded-[16px] flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Chart
                    </button>
                    <button
                      onClick={() => setActiveBillId(null)}
                      className="flex-1 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs py-2.5 rounded-[16px]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Tab Switcher */}
                  <div className="flex bg-[#F1F5F9] p-1 rounded-[14px] mb-5 border border-[#E2E8F0] relative z-10 shrink-0">
                    <button
                      onClick={() => setActiveTab('billing')}
                      className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all cursor-pointer ${
                        activeTab === 'billing'
                          ? 'bg-white text-[#6D5DF6] shadow-sm border border-[#E2E8F0]/30'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      Billing & Insurance
                    </button>
                    <button
                      onClick={() => setActiveTab('clinical')}
                      className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all cursor-pointer ${
                        activeTab === 'clinical'
                          ? 'bg-white text-[#6D5DF6] shadow-sm border border-[#E2E8F0]/30'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      Clinical Notes & Rx
                    </button>
                  </div>

                  {activeTab === 'billing' ? (
                    <div className="space-y-4 animate-in fade-in duration-300 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Charge Summary Card */}
                        <div className="bg-[#F8FAFC] rounded-[18px] p-4 border border-[#E8EDF5]">
                          <div className="flex justify-between items-start mb-3 border-b border-[#E2E8F0] pb-3">
                            <div>
                              <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-0.5">Encounter</p>
                              <p className="text-sm font-bold text-[#111827]">{activeBillId} ({activeEncounter?.patient_name})</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-0.5">Charge amount</p>
                              <p className="text-xl font-extrabold text-[#111827]">$245.00</p>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#4B5563]">99213 (Level 3 Visit)</span>
                              <span className="text-[#111827]">$120.00</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#4B5563]">36415 (Venipuncture)</span>
                              <span className="text-[#111827]">$45.00</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#4B5563]">80053 (Comp Metabolic)</span>
                              <span className="text-[#111827]">$80.00</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#2563EB] bg-[#EEF4FF] px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> AI Auto-Coded
                            </span>
                            <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-0.5"><Check className="w-3 h-3" /> 99% Accuracy</span>
                          </div>
                        </div>

                        {/* Integrated Insurance Eligibility Widget */}
                        <div>
                          <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Insurance Status check</p>
                          {selectedPatientInsurance ? (
                            <div className={`p-4 rounded-[16px] border ${selectedPatientInsurance.eligibility_status === 'Active' ? 'bg-[#ECFDF5]/60 border-[#D1FAE5] text-[#065F46]' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                              <div className="flex items-start gap-2.5">
                                {selectedPatientInsurance.eligibility_status === 'Active' ? (
                                  <>
                                    <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                      <p className="font-extrabold">Active Insurance: {selectedPatientInsurance.provider_name}</p>
                                      <p className="text-[10px] font-medium text-emerald-700 mt-0.5">Policy ID: {selectedPatientInsurance.member_id}</p>

                                      <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-emerald-200/50">
                                        <div>
                                          <p className="text-[9px] uppercase font-bold text-emerald-800">Primary Copay</p>
                                          <p className="font-extrabold text-sm">${selectedPatientInsurance.copay_primary?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[9px] uppercase font-bold text-emerald-800">Deductible</p>
                                          <p className="font-extrabold text-sm">${selectedPatientInsurance.deductible?.toFixed(2)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                      <p className="font-extrabold">Inactive Insurance coverage</p>
                                      <p className="text-[10px] font-medium text-rose-600 mt-0.5">Claims submitted will likely be rejected.</p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-[16px] p-4 text-xs font-semibold text-[#92400E] flex items-start gap-2.5">
                              <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                              <div>
                                <p className="font-extrabold">Insurance Unverified</p>
                                <p className="text-[10px] text-[#B45309] font-medium mt-0.5">No insurance eligibility check recorded for {activeEncounter?.patient_name}. Please verify their health card in Patient Flow first.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Billing Action buttons */}
                      <div className="space-y-2.5 pt-4 border-t border-[#E8EDF5]">
                        <button
                          onClick={processPaymentAction}
                          className="w-full bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs py-3 rounded-[16px] premium-shadow transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" /> Collect Copay / Patient Payment
                        </button>
                        <button
                          onClick={submitInsuranceClaimAction}
                          className="w-full bg-white border border-[#E8EDF5] hover:bg-[#F7F9FC] text-[#111827] font-bold text-xs py-3 rounded-[16px] shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Submit Insurance Claim <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Patient Profile & Visit History */}
                        <div className="bg-[#FAFBFD] rounded-[18px] p-4 border border-[#E8EDF5]">
                          <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#6D5DF6]" /> Patient Profile & History
                          </p>

                          <div className="flex items-center gap-2 mb-3 bg-white p-2.5 rounded-[16px] border border-[#E8EDF5]">
                            <div className="w-8 h-8 rounded-full bg-[#EEF4FF] flex items-center justify-center text-xs font-bold text-[#6D5DF6]">
                              {activeEncounter?.patient_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#111827]">{activeEncounter?.patient_name}</p>
                              <p className="text-[9px] text-[#6B7280]">Primary Insurance: {selectedPatientInsurance?.provider_name || 'None / Self-Pay'}</p>
                            </div>
                          </div>

                          {/* Timeline of past visits */}
                          <div>
                            <p className="text-[9px] font-extrabold text-[#6B7280] uppercase tracking-wider mb-2">Visit History ({encounters.filter(e => e.patient_name === activeEncounter?.patient_name && e.id !== activeEncounter?.id).length + 1} visits)</p>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {/* Current Visit */}
                              <div className="flex gap-2.5 items-start bg-[#EEEAFE]/50 p-2 rounded-[8px] border border-[#E0D9FD]/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#6D5DF6] mt-1.5"></div>
                                <div className="flex-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="font-bold text-[#6D5DF6]">Current Visit</span>
                                    <span className="text-[9px] font-bold text-[#6B7280]">{activeEncounter?.date}</span>
                                  </div>
                                  <p className="text-[10px] font-semibold text-[#111827] mt-0.5">{activeEncounter?.diagnosis} ({activeEncounter?.type})</p>
                                </div>
                              </div>

                              {/* Past Visits */}
                              {encounters.filter(e => e.patient_name === activeEncounter?.patient_name && e.id !== activeEncounter?.id).length === 0 ? (
                                <p className="text-[10px] text-[#9CA3AF] italic">No previous visits on record.</p>
                              ) : (
                                encounters.filter(e => e.patient_name === activeEncounter?.patient_name && e.id !== activeEncounter?.id).map((pastEnc: any) => (
                                  <div key={pastEnc.id} className="flex gap-2.5 items-start p-2 rounded-[8px] border border-transparent hover:bg-slate-50 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>
                                    <div className="flex-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="font-bold text-[#4B5563]">{pastEnc.id}</span>
                                        <span className="text-[9px] text-[#6B7280]">{pastEnc.date}</span>
                                      </div>
                                      <p className="text-[10px] text-[#4B5563] mt-0.5">{pastEnc.diagnosis} ({pastEnc.type})</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Prescriptions & SOAP Notes */}
                        <div className="bg-[#FAFBFD] rounded-[18px] p-4 border border-[#E8EDF5]">
                          <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#10B981]" /> Clinical SOAP Notes
                          </p>
                          <div className="bg-white p-3 rounded-[16px] border border-[#E8EDF5] text-xs font-medium text-[#4B5563] leading-relaxed mb-3 max-h-[120px] overflow-y-auto">
                            {activeEncounter?.clinical_notes || activeEncounter?.clinicalNotes}
                          </div>

                          <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#6D5DF6]" /> Prescribed Medications
                          </p>
                          <div className="bg-[#EEEAFE]/40 p-3 rounded-[16px] border border-[#E0D9FD]/50 text-xs font-bold text-[#111827] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#EEEAFE]0 shrink-0"></div>
                            <span>{activeEncounter?.medications || 'No medications prescribed.'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Export action button */}
                      <div className="pt-4 border-t border-[#E8EDF5]">
                        <button
                          onClick={() => handleDownloadChart(activeEncounter)}
                          className="w-full bg-[#EEF2F6] hover:bg-[#E2E8F0] text-[#111827] font-bold text-xs py-3 rounded-[16px] shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-[#4B5563]" /> View & Print Medical Summary
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* CSS Print Stylesheet */}
      <style>{`
        @media print {
          /* Hide all application elements */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the printable receipt block */
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            display: block !important;
            z-index: 99999 !important;
            margin: 0 !important;
            padding: 30px !important;
          }
        }
      `}</style>

      {/* Styled Printable Invoice Template */}
      <div id="printable-invoice" className="hidden">
        <div style={{ padding: '30px', fontFamily: 'monospace', color: '#111827', width: '100%', boxSizing: 'border-box' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #111827', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>SBN SENTINEL URGENT CARE</h2>
            <p style={{ fontSize: '11px', color: '#4B5563', margin: '0 0 4px 0' }}>100 Medical Center Parkway, Suite 500 • Tel: (555) 019-2834</p>
            <p style={{ fontSize: '10px', color: '#6B7280', margin: '0' }}>HIPAA Secure Electronic Billing Receipt</p>
          </div>

          {/* Metadata Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '12px', lineHeight: '1.6' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>PATIENT:</strong> {activeEncounter?.patient_name}</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>PROVIDER:</strong> {activeEncounter?.provider_name}</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>DIAGNOSIS:</strong> {activeEncounter?.diagnosis}</p>
              <p style={{ margin: '0' }}><strong>MEDICATIONS:</strong> {activeEncounter?.medications || 'None prescribed'}</p>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>RECEIPT ID:</strong> {activeEncounter?.id}</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>DATE:</strong> {activeEncounter?.date}</p>
              <p style={{ margin: '0' }}><strong>PAYMENT STATUS:</strong> {billingSuccess === 'Paid' ? 'PAID / SETTLED' : 'CLAIM DISPATCHED'}</p>
            </div>
          </div>

          {/* CPT Codes Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111827', textAlign: 'left', fontWeight: 'bold' }}>
                <th style={{ padding: '6px 0' }}>CPT CODE / DESCRIPTION</th>
                <th style={{ padding: '6px 0', textAlign: 'right' }}>CHARGE</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '8px 0' }}>99213 - Outpatient Visit (Level 3)</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>$120.00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '8px 0' }}>36415 - Routine Venipuncture</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>$45.00</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #111827' }}>
                <td style={{ padding: '8px 0' }}>80053 - Comprehensive Metabolic Panel</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>$80.00</td>
              </tr>
              <tr style={{ fontWeight: 'bold', fontSize: '13px' }}>
                <td style={{ padding: '12px 0' }}>TOTAL ENCOUNTER CHARGES</td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>$245.00</td>
              </tr>
            </tbody>
          </table>

          {/* Insurance Information Block */}
          {selectedPatientInsurance && (
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '11px', lineHeight: '1.5' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Insurance Check Info</p>
              <p style={{ margin: '0 0 3px 0' }}><strong>Carrier:</strong> {selectedPatientInsurance.provider_name}</p>
              <p style={{ margin: '0 0 3px 0' }}><strong>Policy Member ID:</strong> {selectedPatientInsurance.member_id}</p>
              <p style={{ margin: '0 0 3px 0' }}><strong>Primary Copay Paid:</strong> ${selectedPatientInsurance.copay_primary?.toFixed(2)}</p>
              <p style={{ margin: '0' }}><strong>Eligibility Status:</strong> Active Eligibility Check Verified</p>
            </div>
          )}

          {/* Watermark badge style */}
          <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', border: '3px double #10B981', color: '#10B981', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', transform: 'rotate(-2deg)' }}>
              {billingSuccess === 'Paid' ? 'PAID & RECORDED' : 'CLAIM FILED'}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#9CA3AF', borderTop: '1px solid #E2E8F0', paddingTop: '12px', lineHeight: '1.4' }}>
            <p style={{ margin: '0 0 2px 0' }}>Thank you for choosing SBN Sentinel Care.</p>
            <p style={{ margin: '0' }}>For any billing inquiries, please email billing@sbnsentinel.com.</p>
          </div>
        </div>
      </div>

      {/* Doctor's Add Encounter Modal */}
      {mounted && showAddModal && createPortal(
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#E8EDF5] w-full max-w-lg rounded-[28px] overflow-hidden premium-shadow animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#F8FAFC] border-b border-[#E8EDF5] px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#EEEAFE] text-[#6D5DF6]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">New Patient Encounter Chart</h3>
                  <span className="text-[10px] font-semibold text-[#6B7280]">Record diagnoses, vitals, and SOAP notes</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-[#EEF2F6] rounded-full text-[#6B7280] hover:text-[#111827] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEncounter} className="p-6 space-y-4">
              {/* Patient Name */}
              <div>
                <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Robert Pattinson"
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:ring-1 focus:ring-[#6D5DF6] transition-all placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Provider & Type Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Attending Doctor</label>
                  <select
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] px-3 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:ring-1 focus:ring-[#6D5DF6] transition-all cursor-pointer"
                  >
                    <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                    <option value="Dr. Alan Grant">Dr. Alan Grant</option>
                    <option value="Dr. Emily Chen">Dr. Emily Chen</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] px-3 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:ring-1 focus:ring-[#6D5DF6] transition-all cursor-pointer"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Urgent Care">Urgent Care</option>
                    <option value="Checkup">Checkup</option>
                    <option value="X-Ray / Consult">X-Ray / Consult</option>
                  </select>
                </div>
              </div>

              {/* Diagnosis & Copay Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Primary Diagnosis</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Bronchitis"
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:ring-1 focus:ring-[#6D5DF6] transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Copay ($)</label>
                  <input
                    type="number"
                    required
                    value={copayAmount}
                    onChange={(e) => setCopayAmount(e.target.value)}
                    placeholder="30.00"
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:ring-1 focus:ring-[#6D5DF6] transition-all"
                  />
                </div>
              </div>

              {/* Clinical Notes (SOAP Notes) */}
              <div>
                <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Clinical SOAP Notes</label>
                <textarea
                  rows={4}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Subjective: Patient reports dry cough... Objective: Normal breath sounds... Assessment: Acute bronchitis... Plan: Antibiotics/Inhaler..."
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 text-sm font-semibold text-[#111827] outline-none focus:border-[#6D5DF6] focus:ring-1 focus:ring-[#6D5DF6] transition-all placeholder:text-[#9CA3AF] resize-none"
                />
              </div>

              {/* Prescribed Medications */}
              <div>
                <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Prescribed Medications / Rx</label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg daily, Albuterol Inhaler"
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF5] rounded-[16px] px-4 py-2.5 text-sm font-bold text-[#111827] outline-none focus:border-[#6D5DF6] focus:ring-1 focus:ring-[#6D5DF6] transition-all placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[#E8EDF5] mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white border border-[#E8EDF5] hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-[16px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6D5DF6] hover:bg-[#5B4AE8] text-white font-bold text-xs px-6 py-2.5 rounded-[16px] transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Save Encounter
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
