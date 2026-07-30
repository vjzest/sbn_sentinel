import sys
import os

# Add parent directory to path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal, engine, Base
from app.models.encounter import EncounterModel
from app.models.audit import AuditLogModel
from app.models.user import User
from app.core.security import get_password_hash
import datetime

def seed_data():
    print("Starting rich database seeding for SBN Sentinel...")
    db = SessionLocal()
    try:
        # 1. Seed Rich Encounters
        encounters = [
            EncounterModel(
                id="enc_101",
                patient_name="Vijay Maurya",
                provider_name="City Heart - Dr Jenkins",
                date="2026-07-26",
                diagnosis="Essential Hypertension & Cardiology Evaluation",
                type="Cardiology Consultation",
                status="Checked In",
                billing_status="Pending",
                copay=30.00,
                priority="High",
                wait_time="8 mins",
                department="Cardiology",
                avatar="https://i.pravatar.cc/150?img=12",
                clinical_notes="Subjective: Patient reports intermittent chest tightness post-exercise. Objective: BP 142/88 mmHg, HR 76 bpm, EKG shows sinus rhythm. Assessment: Essential hypertension with mild exercise intolerance. Plan: Prescribe Lisinopril 10mg daily, order echocardiogram.",
                medications="Lisinopril 10mg, Aspirin 81mg"
            ),
            EncounterModel(
                id="enc_102",
                patient_name="Ananya Sharma",
                provider_name="City Heart - Dr Jenkins",
                date="2026-07-26",
                diagnosis="Type 2 Diabetes Mellitus without complications",
                type="Endocrinology Followup",
                status="In Room",
                billing_status="Billed",
                copay=35.00,
                priority="Normal",
                wait_time="4 mins",
                department="Endocrinology",
                avatar="https://i.pravatar.cc/150?img=47",
                clinical_notes="Subjective: Patient reports good glycemic control, fasting blood glucose 110 mg/dL. Objective: HbA1c 6.8%, BP 124/78 mmHg. Assessment: Type 2 Diabetes Mellitus well controlled. Plan: Continue Metformin 500mg BID, recheck HbA1c in 3 months.",
                medications="Metformin 500mg BID"
            ),
            EncounterModel(
                id="enc_103",
                patient_name="Rajesh Verma",
                provider_name="City Heart - Dr Jenkins",
                date="2026-07-26",
                diagnosis="Acute Bronchitis & Cough Evaluation",
                type="Urgent Care",
                status="Completed",
                billing_status="Paid",
                copay=25.00,
                priority="Normal",
                wait_time="12 mins",
                department="Pulmonology",
                avatar="https://i.pravatar.cc/150?img=33",
                clinical_notes="Subjective: Patient complains of persistent dry cough for 5 days following viral URI. Objective: Temp 98.6F, SpO2 98% on room air, bilateral wheezing. Assessment: Acute viral bronchitis. Plan: Prescribe Albuterol inhaler PRN and Benzonatate 100mg.",
                medications="Albuterol Inhaler, Benzonatate 100mg"
            ),
            EncounterModel(
                id="enc_104",
                patient_name="Priya Patel",
                provider_name="City Heart - Dr Jenkins",
                date="2026-07-25",
                diagnosis="Generalized Anxiety Disorder",
                type="Psychiatry Consultation",
                status="Completed",
                billing_status="Paid",
                copay=40.00,
                priority="Low",
                wait_time="2 mins",
                department="Psychiatry",
                avatar="https://i.pravatar.cc/150?img=20",
                clinical_notes="Subjective: Patient expresses feeling overwhelmed by work stress, difficulty sleeping. Objective: GAD-7 score 14 (moderate anxiety). Assessment: Generalized anxiety disorder. Plan: Recommended CBT therapy, initiated Sertraline 50mg daily.",
                medications="Sertraline 50mg daily"
            ),
            EncounterModel(
                id="enc_105",
                patient_name="Amitabh Bacchan",
                provider_name="City Heart - Dr Jenkins",
                date="2026-07-25",
                diagnosis="Lumbago with Sciatica, Right Side",
                type="Physical Therapy Evaluation",
                status="Checked In",
                billing_status="Pending",
                copay=30.00,
                priority="High",
                wait_time="15 mins",
                department="Orthopedics",
                avatar="https://i.pravatar.cc/150?img=60",
                clinical_notes="Subjective: Lower back pain radiating down right leg for 2 weeks. Objective: Positive straight leg raise test on right at 45 degrees. Assessment: Lumbar radiculopathy L5-S1. Plan: Order Lumbar MRI, initiate physical therapy twice weekly.",
                medications="Gabapentin 300mg TID, Naproxen 500mg BID"
            ),
            EncounterModel(
                id="enc_106",
                patient_name="Kavita Reddy",
                provider_name="City Heart - Dr Jenkins",
                date="2026-07-25",
                diagnosis="Gastro-esophageal Reflux Disease (GERD)",
                type="Gastroenterology Consultation",
                status="In Room",
                billing_status="Pending",
                copay=30.00,
                priority="Normal",
                wait_time="6 mins",
                department="Gastroenterology",
                avatar="https://i.pravatar.cc/150?img=25",
                clinical_notes="Subjective: Frequent heartburn symptoms worse at night. Objective: Abdomen soft, non-tender, no organomegaly. Assessment: GERD refractory to OTC antacids. Plan: Prescribe Omeprazole 20mg daily before breakfast.",
                medications="Omeprazole 20mg daily"
            ),
            EncounterModel(
                id="enc_107",
                patient_name="Siddharth Malhotra",
                provider_name="City Heart - Dr Jenkins",
                date="2026-07-24",
                diagnosis="Pain in Right Knee & Meniscal Tear Evaluation",
                type="Radiology / MRI Scan",
                status="Completed",
                billing_status="Billed",
                copay=50.00,
                priority="Normal",
                wait_time="10 mins",
                department="Radiology",
                avatar="https://i.pravatar.cc/150?img=68",
                clinical_notes="Subjective: Twisting injury during sports 3 days ago. Joint joint effusion and clicking sound. Objective: Joint line tenderness, positive McMurray test. Assessment: Suspected medial meniscal tear. Plan: MRI right knee without contrast.",
                medications="Ibuprofen 600mg TID"
            )
        ]

        for enc in encounters:
            existing = db.query(EncounterModel).filter(EncounterModel.id == enc.id).first()
            if not existing:
                db.add(enc)

        # 2. Seed HIPAA Audit Logs
        audit_logs = [
            AuditLogModel(
                id="audit_9001",
                user_system="codehub933681@gmail.com",
                action="USER_LOGIN_SUCCESS",
                module="Authentication",
                correlation_id="auth_sess_101",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=120)
            ),
            AuditLogModel(
                id="audit_9002",
                user_system="vjzest9569@gmail.com",
                action="OPERATIONS_VIEW_DASHBOARD",
                module="Operations Dashboard",
                correlation_id="ops_dash_01",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=90)
            ),
            AuditLogModel(
                id="audit_9003",
                user_system="codehub933681@gmail.com",
                action="ENCOUNTER_BILLING_UPDATE",
                module="Clinical Logs",
                correlation_id="enc_101",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=45)
            ),
            AuditLogModel(
                id="audit_9004",
                user_system="vjzest9569@gmail.com",
                action="INSURANCE_ELIGIBILITY_QUERY",
                module="Insurance Verification",
                correlation_id="ins_query_88",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
            ),
            AuditLogModel(
                id="audit_9005",
                user_system="superadmin@sbnsentinel.com",
                action="SECURITY_ROLE_AUDIT",
                module="Super Admin Governance",
                correlation_id="gov_audit_09",
                timestamp=datetime.datetime.utcnow()
            )
        ]

        for log in audit_logs:
            existing = db.query(AuditLogModel).filter(AuditLogModel.id == log.id).first()
            if not existing:
                db.add(log)

        db.commit()
        print("Rich database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
