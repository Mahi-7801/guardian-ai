from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time
from datetime import datetime
import networkx as nx
import uuid
import threading
import smtplib
import os
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- EMAIL CONFIGURATION ---
SHOULD_SEND_REAL_EMAIL = os.getenv("SHOULD_SEND_REAL_EMAIL", "False").lower() == "true"
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
TARGET_EMAIL = os.getenv("TARGET_EMAIL", "")

# --- Data Stores ---
active_threats = []
reports = []
intelligence_feed = []
crosint_events = []
disinformation_reports = []
social_network_data = []
alert_history = []

# Global System State for Taxonomy Activity
SYSTEM_ACTIVITY = {
    "predictive_modeling": {"activity": "Awaiting cycle start...", "confidence": 0, "status": "standby"},
    "cybersecurity": {"activity": "Perimeter ping active...", "confidence": 0, "status": "standby"},
    "nlp_techniques": {"activity": "Syncing language buffers...", "confidence": 0, "status": "standby"},
    "social_network_analysis": {"activity": "Loading influencer graph...", "confidence": 0, "status": "standby"},
    "data_fusion": {"activity": "Calibrating geospatial relays...", "confidence": 0, "status": "standby"},
    "explainable_ai": {"activity": "Initializing feature attribution...", "confidence": 0, "status": "standby"},
    "crosint": {"activity": "Uplink handshake active...", "confidence": 0, "status": "standby"}
}

SYSTEM_METRICS = {
    "latency": 15,
    "brain_sync": 98.5,
    "active_vectors": 7
}

INTELLIGENCE_OPS_STATUS = {
    "verified_sources": 98,
    "active_investigations": 288,
    "neural_synthesis_count": 1,
    "synthesis_status": "Active Neural Synthesis",
    "synthesis_description": "Guardian AI core is actively synthesizing signals from verified global sources using hybrid LSTM/SVM architectures."
}

# Taxonomy metadata from the paper (Figure 3)
TAXONOMY_AI_TECHNIQUES = {
    "predictive_modeling": {
        "ML_Deep_Learning": ["SVM", "Random Forest", "XGBoost", "DCNN", "LSTM", "Sparse Autoencoders"],
        "Spatio_temporal": ["Spatio-temporal analysis"],
        "Optimization": ["PSO Optimization"]
    },
    "cybersecurity": {
        "Intrusion_Detection": ["Autoencoder + LSTM"],
        "Malware_Detection": ["MLP", "XGB", "DCNN", "GAN for Threat Detection"],
        "IoT_Threat_Detection": ["MLP"]
    },
    "nlp_techniques": {
        "Topic_Modeling": ["Latent Dirichlet Allocation"],
        "Disinformation_Analysis": ["VADER", "SVM + CNN"],
        "Sentiment_Analysis": ["CNN", "Bi-LSTM", "BERT"]
    },
    "explainable_ai": {
        "Model_Agnostic": ["LIME", "SHAP", "TRUST"],
        "Model_Specific": ["MetaCluster"]
    },
    "social_network_analysis": {
        "Extremist_Detection": ["RNN", "LSTM"],
        "Analysis_Types": ["Economic Loss", "Social Impact", "Influencer Detection"]
    },
    "data_fusion": {
        "Context_Integration": ["Feature-level Fusion", "Decision-level Fusion"],
        "Intelligence_Services": ["SUMMIT", "SHARP", "GPS-N"]
    },
    "crosint": {
        "Methods": ["Info Filter Inspection", "Verification Challenges"],
        "Validation": ["Training Models", "Deep Twitter Bot Detection"]
    }
}

# --- Helper Functions ---

def send_alert_email(alert_details, target=None):
    recipient = target or TARGET_EMAIL
    source = alert_details.get('source_ip') or alert_details.get('source', 'Unknown')
    
    if not SHOULD_SEND_REAL_EMAIL or not recipient:
        print(f"📧 [CONSOLE ONLY] Alert: {alert_details['type']} | Target: {recipient or 'No Target'} | Source: {source}")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = recipient
        msg['Subject'] = f"🚨 GUARDIAN AI ALERT: {alert_details['type']}"
        
        body = f"Critical threat detected: {alert_details['type']}\nSource: {source}\nSeverity: {alert_details['severity']}\nTimestamp: {alert_details['timestamp']}"
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")
        return False

def generate_threat():
    return {
        "id": random.randint(1000, 9999),
        "type": random.choice(["DDoS Attack", "SQL Injection", "Brute Force", "Malware Infiltration", "Unauthorized Port Scan"]),
        "severity": random.choice(["critical", "warning", "info"]),
        "source_ip": f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}",
        "location": random.choice(["Hyderabad Node", "Guntur Perimeter", "Vizag Gateway", "Global Relay"]),
        "timestamp": datetime.now().isoformat(),
        "status": random.choice(["blocked", "mitigating", "detected"])
    }

def generate_random_report():
    sources = ['Unit-01 (Ground)', 'Relay Node 4', 'Civilian Intel Overflow', 'Deep Web Scraper']
    locations = ['Hyderabad', 'Guntur', 'Amaravati', 'Global Edge']
    descriptions = [
        "Unusual signal burst detected in the northern sector.",
        "Encrypted chatter spike on anonymous forums.",
        "Suspicious node attempt to handshake with perimeter.",
        "Potential metadata leak identified in public cloud."
    ]
    return {
        "id": f"RPT-{random.randint(1000, 9999)}",
        "data": {
            "description": random.choice(descriptions),
            "location": random.choice(locations),
            "timestamp": datetime.now().isoformat(),
            "isAnonymous": random.random() > 0.5,
            "source": random.choice(sources)
        },
        "status": random.choice(["verified", "pending", "flagged"]),
        "timestamp": datetime.now().isoformat()
    }

def generate_intelligence_item():
    signals = [
        {"type": "Critical", "content": "Satellite imagery shows movement in Sector Delta.", "severity": "critical"},
        {"type": "High", "content": "Suspected coordinator activity on encrypted channels.", "severity": "High"},
        {"type": "Medium", "content": "Increase in radicalization keywords in local social feeds.", "severity": "Medium"},
        {"type": "High", "content": "Anomalous signal burst from maritime relay node.", "severity": "High"},
        {"type": "Signal", "content": "Quantum-encrypted handshake attempted on perimeter.", "severity": "Medium"}
    ]
    pick = random.choice(signals)
    return {
        "id": str(uuid.uuid4())[:8],
        "type": pick["type"],
        "content": pick["content"],
        "timestamp": datetime.now().isoformat(),
        "severity": pick["severity"],
        "verified": True
    }

# --- Background Simulator ---

def auto_alert_simulator():
    # Initial pause for system warm-up
    time.sleep(3)
    
    sections = [
        "predictive_modeling", "cybersecurity", "nlp_techniques", 
        "social_network_analysis", "data_fusion", "explainable_ai", "crosint"
    ]
    
    activities = {
        "predictive_modeling": ["LSTM training on regional ingress", "SVM hyperplane optimization", "PSO convergence check", "Spatio-temporal regression"],
        "cybersecurity": ["Autoencoder reconstruction verification", "GAN threat-payload simulation", "IoT node telemetry audit", "Heuristic packet scoring"],
        "nlp_techniques": ["BERT attention-layer analysis", "Bi-LSTM sequence modeling", "VADER sentiment pulse check", "LDA topic discovery"],
        "social_network_analysis": ["RNN-based radicalization mapping", "Influencer connection audit", "Social impact radius calculation", "Economic signal filtering"],
        "data_fusion": ["Feature-level context integration", "Decision-level weight balancing", "SUMMIT service synchronization", "GPS-N localized alignment"],
        "explainable_ai": ["Generating SHAP feature values", "LIME local attribution calculation", "MetaCluster behavior matching", "TRUST baseline verification"],
        "crosint": ["Information filter inspection", "Public verification challenge", "Deep twitter bot signature scan", "Signal trust-buffer update"]
    }

    while True:
        # 1. Update Module Activities for Taxonomy
        for sec in sections:
            if random.random() > 0.3: # Only update some modules per cycle
                SYSTEM_ACTIVITY[sec] = {
                    "activity": random.choice(activities[sec]),
                    "confidence": random.randint(88, 98),
                    "status": "active"
                }

        # 2. Threat updates
        if random.random() > 0.4:
            new_alert = generate_threat()
            active_threats.insert(0, new_alert)
            if len(active_threats) > 50: active_threats.pop()
            
            if new_alert['severity'] == 'critical':
                alert_history.insert(0, new_alert)
                if len(alert_history) > 100: alert_history.pop()

        # 3. CROSINT report updates
        if random.random() > 0.3:
            new_report = generate_random_report()
            reports.insert(0, new_report)
            if len(reports) > 50: reports.pop()
            
            # Also update crosint_events used by Taxonomy page
            crosint_events.insert(0, {
                "id": new_report['id'],
                "event": new_report['data']['description'][:30] + "...",
                "location": new_report['data']['location'],
                "timestamp": datetime.now().isoformat(),
                "verified": new_report['status'] == 'verified',
                "impact": random.choice(["Low", "Medium", "High"])
            })
            if len(crosint_events) > 10: crosint_events.pop()

        # 4. Intelligence feed updates
        if random.random() > 0.5:
            new_intel = generate_intelligence_item()
            intelligence_feed.insert(0, new_intel)
            if len(intelligence_feed) > 20: intelligence_feed.pop()

        # 5. Propaganda Signal Updates
        if random.random() > 0.4:
            new_disinfo = {
                "id": f"BOT-{random.randint(100, 999)}",
                "source": random.choice(["StateProxyNet", "Botnet-Alpha", "Influx-Ops", "Shadow-Mirror"]),
                "narrative": random.choice([
                    "Claims of phantom drone strikes in eastern corridor",
                    "Coordinated spread of fake economic collapse data",
                    "Deepfake video of regional negotiator surfaced",
                    "Misinformation regarding medical supply shortages"
                ]),
                "platform": random.choice(["Twitter/X", "Telegram", "Facebook", "TikTok"]),
                "reach": f"{random.randint(100, 999)}K",
                "confidence": random.randint(85, 99),
                "methodology": random.choice(["SVM + CNN Hybrid", "VADER Sentiment Analysis", "Latent Dirichlet Allocation"]),
                "status": random.choice(["flagged", "monitoring", "isolated"])
            }
            disinformation_reports.insert(0, new_disinfo)
            if len(disinformation_reports) > 15: disinformation_reports.pop()

        # 6. Update System Metrics
        SYSTEM_METRICS["latency"] = random.randint(8, 28)
        SYSTEM_METRICS["brain_sync"] = round(random.uniform(99.1, 99.9), 1)
        SYSTEM_METRICS["active_vectors"] = len([v for v in SYSTEM_ACTIVITY.values() if v["status"] == "active"])

        time.sleep(8) 

# Start simulator thread
threading.Thread(target=auto_alert_simulator, daemon=True).start()

# --- REST API Endpoints ---

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    # Calculate stats from actual data stores
    return jsonify({
        "activeThreats": len(active_threats),
        "blockedAttacks": random.randint(1000, 5000), # Cumulative mockup
        "networkAnomalies": len([t for t in active_threats if t['severity'] == 'critical']),
        "systemHealth": {
            "cpu": random.randint(20, 60),
            "memory": random.randint(40, 80),
            "networkLoad": random.choice(["Low", "Moderate", "High"]),
            "uptime": 99.9
        }
    })

@app.route('/api/threats', methods=['GET'])
def get_threats():
    return jsonify(active_threats)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    return jsonify(reports)

@app.route('/api/intelligence/feed', methods=['GET'])
def get_intelligence_feed():
    return jsonify(intelligence_feed)

@app.route('/api/taxonomy', methods=['GET'])
def get_taxonomy():
    return jsonify(TAXONOMY_AI_TECHNIQUES)

@app.route('/api/taxonomy/activity', methods=['GET'])
def get_taxonomy_activity():
    section = request.args.get('section', 'predictive_modeling')
    data = SYSTEM_ACTIVITY.get(section, {"activity": "Unknown vector", "confidence": 0, "status": "offline"})
    return jsonify({
        "activity": data["activity"],
        "timestamp": datetime.now().isoformat(),
        "confidence": data["confidence"],
        "status": data["status"]
    })

@app.route('/api/crosint/events', methods=['GET'])
def get_crosint_events():
    return jsonify(crosint_events)

@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    return jsonify(SYSTEM_METRICS)

@app.route('/api/disinfo/signals', methods=['GET'])
def get_disinfo_signals():
    return jsonify(disinformation_reports)

@app.route('/api/intelligence/ops', methods=['GET'])
def get_intel_ops():
    # Occasionally vary the investigation count for realism
    INTELLIGENCE_OPS_STATUS["active_investigations"] = 280 + random.randint(0, 20)
    return jsonify(INTELLIGENCE_OPS_STATUS)

@app.route('/api/intelligence/briefing/generate', methods=['POST'])
def generate_briefing_v2():
    time.sleep(1.5) # Simulate AI thinking
    subject = request.json.get('subject', 'General Threat Assessment')
    return jsonify({
        "success": True,
        "title": f"Neural Briefing: {subject}",
        "content": f"Intelligence synthesis complete for {subject}. Analyzed {len(intelligence_feed)} recent signals. Recommended action: Heightened monitoring of Sector Delta and related communication relays.",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/intelligence/briefing/publish', methods=['POST'])
def publish_briefing():
    data = request.json
    print(f"📢 PUBLISHING BRIEFING: {data.get('title')}")
    return jsonify({"success": True, "message": "Briefing published to all command nodes."})

@app.route('/api/predict/risk', methods=['POST'])
def predict_risk():
    data = request.json
    region = data.get('region', 'Unknown')
    analysis_type = data.get('type', 'cyber')
    
    # Base risk on real system latency and activity states
    base_confidence = SYSTEM_METRICS["brain_sync"]
    intensity = (SYSTEM_METRICS["latency"] / 30) # Normalize latency
    
    # Determine risk level based on current system intensity
    if intensity > 0.7:
        risk_level = "Critical"
        risk_score = random.randint(85, 98)
    elif intensity > 0.4:
        risk_level = "Elevated"
        risk_score = random.randint(60, 84)
    else:
        risk_level = "Moderate"
        risk_score = random.randint(30, 59)

    methodology = random.choice(TAXONOMY_AI_TECHNIQUES["predictive_modeling"]["ML_Deep_Learning"])
    
    # Specific logic for different types
    hotspots = [
        {"name": f"{region} Alpha Node", "risk": risk_score, "trend": "up"},
        {"name": f"{region} Border Relay", "risk": random.randint(20, 60), "trend": "steady"},
        {"name": "Internal Hive-01", "risk": random.randint(10, 40), "trend": "down"}
    ]

    return jsonify({
        "overallRisk": risk_level,
        "prediction": f"Potential {analysis_type} activity detected in {region}",
        "methodology": methodology,
        "confidence": round(base_confidence - random.uniform(2, 5), 1),
        "timeline": [random.randint(10, 95) for _ in range(12)],
        "factors": [
            {"label": "Anomalous Traffic (Autoencoder)", "value": int(intensity * 100), "color": "bg-destructive"},
            {"label": "Social Signal Burst (NLP)", "value": random.randint(40, 70), "color": "bg-warning"},
            {"label": "Historical Vector Match", "value": random.randint(50, 80), "color": "bg-primary"}
        ],
        "heatmap": hotspots
    })

@app.route('/api/reports/submit', methods=['POST'])
def submit_report():
    data = request.json
    new_report = {
        "id": f"RPT-{random.randint(1000, 9999)}",
        "data": {
            "description": data.get('description', 'No description provided'),
            "location": data.get('location', 'Unknown Node'),
            "timestamp": datetime.now().isoformat(),
            "isAnonymous": data.get('isAnonymous', True),
            "source": 'PUBLIC_UPLINK'
        },
        "status": "pending",
        "timestamp": datetime.now().isoformat()
    }
    reports.insert(0, new_report)
    return jsonify({"success": True, "message": "Intelligence signal ingested and queued for neural verification.", "report": new_report})

@app.route('/api/analyze/sentiment', methods=['POST'])
def analyze_sentiment():
    data = request.json
    text = data.get('text', '')
    keywords = ['attack', 'kill', 'bomb', 'exploit', 'hack', 'danger']
    found_keywords = [word for word in keywords if word in text.lower()]
    sentiment = "Hateful" if len(found_keywords) > 0 else "Neutral"
    return jsonify({
        "sentiment": sentiment,
        "confidence": round(random.uniform(0.7, 0.99), 2),
        "methodology": random.choice(TAXONOMY_AI_TECHNIQUES["nlp_techniques"]["Sentiment_Analysis"]),
        "keywords": found_keywords if found_keywords else ["none"],
        "extremistScore": 0.85 if sentiment == "Hateful" else 0.15,
        "disinformationCheck": {
            "isDisinformation": random.random() > 0.8,
            "method": random.choice(TAXONOMY_AI_TECHNIQUES["nlp_techniques"]["Disinformation_Analysis"]),
            "vaderScale": round(random.uniform(-1, 1), 2)
        }
    })

@app.route('/api/social/analysis', methods=['GET'])
def get_social_analysis():
    return jsonify({
        "detected_groups": [{"name": "Group Alpha", "threat_level": "High", "members": 1500, "dominant_platform": "Telegram"}],
        "tech_stack": TAXONOMY_AI_TECHNIQUES["social_network_analysis"]["Extremist_Detection"]
    })

@app.route('/api/fusion/status', methods=['GET'])
def get_fusion_status():
    return jsonify({
        "active_services": TAXONOMY_AI_TECHNIQUES["data_fusion"]["Intelligence_Services"],
        "fusion_method": random.choice(TAXONOMY_AI_TECHNIQUES["data_fusion"]["Context_Integration"]),
        "data_sources_synced": ["Sat-Imagery", "Signals-Intelligence", "Cyber-Logs", "Crosint-Feed"],
        "accuracy_boost": f"+{random.randint(15, 30)}%"
    })

@app.route('/api/network/graph', methods=['GET'])
def get_network_graph():
    G = nx.erdos_renyi_graph(n=20, p=0.2)
    nodes = [{"id": f"n{i}", "group": random.randint(0, 2), "type": "node"} for i in G.nodes()]
    links = [{"source": f"n{u}", "target": f"n{v}", "value": random.random()} for u, v in G.edges()]
    return jsonify({"nodes": nodes, "links": links})

@app.route('/api/alerts/history', methods=['GET'])
def get_alert_history():
    return jsonify(alert_history)

@app.route('/api/predict/report/send-email', methods=['POST'])
def send_predictive_report():
    data = request.json
    target_email = data.get('email', TARGET_EMAIL)
    
    if not target_email:
        return jsonify({"success": False, "message": "No target email provided."}), 400

    # If real sending is disabled, simulate success
    if not SHOULD_SEND_REAL_EMAIL:
        time.sleep(1) # Simulate network lag
        return jsonify({"success": True, "message": f"Intelligence briefing simulated for {target_email} (Demo Mode)"})

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = target_email
        msg['Subject'] = f"📊 Intel Briefing: {data.get('type', 'Predictive Analysis')}"

        # Simplified HTML body for reliability
        html_body = f"""
        <html>
        <body style="background-color: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 20px;">
            <h1 style="color: #3b82f6;">Intelligence Briefing</h1>
            <p>Region: {data.get('region')}</p>
            <p>Risk Score: {data.get('risk')}</p>
            <p>Confidence: {data.get('confidence')}</p>
            <hr style="border-color: #334155;">
            <p style="font-size: 12px; color: #94a3b8;">This is an automated report from Guardian AI.</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_body, 'html'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return jsonify({"success": True, "message": f"Intelligence briefing dispatched to {target_email}"})
    except Exception as e:
        return jsonify({"success": False, "message": f"SMTP Error: {str(e)}"}), 500

@app.route('/api/email/alert', methods=['POST'])
def handle_email_alert():
    data = request.json
    target_email = data.get('email', TARGET_EMAIL)
    alert = data.get('alert', {})
    
    # Use existing helper
    success = send_alert_email(alert, target=target_email)
    
    if success:
        return jsonify({"success": True, "message": "Alert dispatched successfully"})
    else:
        return jsonify({"success": False, "message": "Failed to send email"}), 500

@app.route('/api/settings/update', methods=['POST'])
def update_settings():
    return jsonify({"success": True, "message": "System configuration updated successfully"})

if __name__ == '__main__':
    print("Guardian AI Python Backend Running on Port 5000")
    print("System starting with EMPTY data stores. Background simulator will populate real-time data shortly.")
    app.run(host='0.0.0.0', port=5000, debug=True)
