# SBN Sentinel - Healthcare Intelligence Platform

SBN Sentinel is a world-class, AI-powered Healthcare Revenue & Clinical Intelligence SaaS platform. It is designed to provide actionable insights, real-time patient flow monitoring, and clinical intelligence to hospital administrators and operations teams.

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS, Redux Toolkit, TypeScript
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite (Development) / PostgreSQL (Production)
- **AI/Integrations**: OpenAI, Twilio, Practice Fusion EHR Connectors

---

## 🚀 Quick Start Guide

Follow these instructions to run the platform locally on your machine.

### 1. Backend Setup (FastAPI)

Open a new terminal window and run the following commands:

```bash
# Navigate to the backend directory
cd backend

# Create a Python Virtual Environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Create the .env file (if not exists) and add your API keys
# You can copy the structure from the provided .env templates.

# Run the FastAPI server
python -m uvicorn app.main:create_app --factory --host 0.0.0.0 --port 8000 --reload
```
*The backend API will be running at `http://localhost:8000`*
*Interactive API documentation (Swagger) is available at `http://localhost:8000/api/v1/docs`*

### 2. Frontend Setup (Next.js)

Open a **second** terminal window and run the following commands:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules and dependencies
npm install
# or if using yarn: yarn install

# Start the Next.js development server
npm run dev
```
*The frontend will be running at `http://localhost:3000`*

---

## 🔑 Environment Variables (.env)
Make sure you create a `.env` file inside the `backend` folder with the following structure to enable all features:

```env
# Database Settings
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sentinel_db

# External APIs
OPENAI_API_KEY=sk-...
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EHR_CLIENT_ID=
EHR_CLIENT_SECRET=
```

---

## 🎨 Design System
The frontend follows a "Premium Healthcare SaaS" design system inspired by top-tier enterprise tools (Stripe, Linear, Notion). 
- **Primary Color:** Royal Purple (`#6D5DF6`)
- **Typography:** Inter (Clean, modern sans-serif)
- **UI Elements:** 24px Border Radius for floating cards, 16px for buttons, subtle glassmorphism, and minimal shadow effects.

## 📝 Key Features
- **Intelligence Hub:** Real-time AI processing of clinical and revenue signals.
- **Patient Flow Tracker:** Live queue monitoring with WebSockets.
- **Audit Logs:** Full HIPAA-compliant tracking of team actions.
- **Data Integrations:** Connect seamlessly with EHRs and billing software.
