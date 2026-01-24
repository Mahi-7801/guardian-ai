# Guardian AI: National Security & Intelligence Platform

Guardian AI is a sophisticated AI-driven platform for counter-terrorism, cybersecurity, and national security intelligence. It features real-time threat detection, predictive analytics, propaganda monitoring, and intelligence operations management.

## Features

- **Predictive Analytics:** AI-based risk forecasting for geopolitical events.
- **Propaganda Monitoring:** Detection and analysis of disinformation campaigns (Protocol SIGMA).
- **Intrusion Detection:** Real-time monitoring of cyber threats and infrastructure vulnerabilities.
- **Intelligence Operations:** Centralized briefing generation and mission tracking.
- **Explainable AI (XAI):** Transparent decision-making using SHAP and LIME methodologies.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Flask, NetworkX, Python-dotenv.
- **Infrastructure:** InsForge SDK (Auth, Database, Real-time).

## Deployment

### Backend (Render)

1.  Create a new Web Service on [Render](https://render.com).
2.  Connect this GitHub repository.
3.  Set **Environment** to `Python 3`.
4.  **Build Command:** `pip install -r backend_python/requirements.txt`
5.  **Start Command:** `gunicorn --chdir backend_python app:app`
6.  Add Environment Variables:
    - `SMTP_EMAIL`: Your email for alerts.
    - `SMTP_PASSWORD`: Your email app password.
    - `TARGET_EMAIL`: Recipient email for system alerts.
    - `SHOULD_SEND_REAL_EMAIL`: `False` (set to `True` for live alerts).

### Frontend (Vercel)

1.  Connect this GitHub repository to [Vercel](https://vercel.com).
2.  Framework Preset: `Vite`.
3.  Add Environment Variable:
    - `VITE_API_BASE_URL`: The URL of your Render backend (e.g., `https://guardian-ai-backend-xm01.onrender.com`).
4.  Deploy.

## Development

```bash
# Run Backend
cd backend_python
pip install -r requirements.txt
python app.py

# Run Frontend
npm install
npm run dev
```
