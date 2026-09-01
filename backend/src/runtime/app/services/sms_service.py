import os
import requests
import logging

logger = logging.getLogger(__name__)


def send_patient_sms_reminder(
        to_phone: str,
        patient_name: str,
        doctor_name: str,
        time_str: str = "10:00 AM"):
    """
    Sends an automated appointment reminder via Twilio SMS API or graceful simulation fallback.
    """
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_phone = os.getenv("TWILIO_PHONE_NUMBER")

    message_body = f"Reminder: Hello {patient_name}, your appointment with {doctor_name} is scheduled tomorrow at {time_str}. Reply YES to confirm or CANCEL to reschedule."

    if sid and token and from_phone:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
            res = requests.post(
                url,
                data={"From": from_phone, "To": to_phone, "Body": message_body},
                auth=(sid, token),
                timeout=5
            )
            if res.status_code in [200, 201]:
                logger.info(f"Twilio SMS sent to {to_phone}")
                return {"status": "sent", "gateway": "Twilio Live API", "message": message_body}
        except Exception as e:
            logger.error(f"Twilio SMS delivery failed: {e}")

    logger.info(f"[SMS SIMULATOR] Dispatched to {to_phone}: {message_body}")
    return {"status": "simulated", "gateway": "Sentinel Outbound Engine", "message": message_body}
