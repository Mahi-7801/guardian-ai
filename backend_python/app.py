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

# --- REAL AI ENGINE INTEGRATION ---
try:
    from ai_engine import ai_engine
    HAS_AI_ENGINE = True
    # Initialize immediately for demo purposes
    ai_engine.initialize_models()
except ImportError as e:
    HAS_AI_ENGINE = False
    print(f"⚠️ AI Engine not active: {e}. Running in Simulation Mode.")

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://*.vercel.app",
    "*"   # allow all — tighten after deploying if needed
])

# --- EMAIL CONFIGURATION ---
SHOULD_SEND_REAL_EMAIL = os.getenv("SHOULD_SEND_REAL_EMAIL", "False").lower() == "true"
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
TARGET_EMAIL = os.getenv("TARGET_EMAIL", "")

# ── Health check endpoint (used by Render cron job to keep backend alive) ──
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat(), "service": "Guardian AI Backend"})



# --- Data Stores ---
active_threats = []
reports = []
intelligence_feed = []
crosint_events = []
disinformation_reports = []
social_network_data = []
alert_history = []

# --- Admin Data Stores ---
users_db = [
    {"id": 1, "name": "Analyst Sarah", "email": "sarah@guardian.com", "role": "Analyst", "status": "Active", "lastActive": "2 mins ago"},
    {"id": 2, "name": "Officer John", "email": "john@guardian.com", "role": "Officer", "status": "Active", "lastActive": "1 hour ago"},
    {"id": 3, "name": "Guest User", "email": "guest@external.org", "role": "Observer", "status": "Pending", "lastActive": "Never"}
]

audit_logs = [
    {"id": 101, "action": "System Override", "user": "Admin", "time": "10:42 AM", "status": "Success"},
    {"id": 102, "action": "Database Dump", "user": "Unknown", "time": "09:15 AM", "status": "Blocked"},
    {"id": 103, "action": "User Created", "user": "Admin", "time": "Yesterday", "status": "Success"}
]

# Global System State for Taxonomy Activity
SYSTEM_LOCKDOWN = False

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
    response = SYSTEM_METRICS.copy()
    response['lockdown'] = SYSTEM_LOCKDOWN
    return jsonify(response)

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
    # Determine risk level based on current system intensity
    if HAS_AI_ENGINE and ai_engine.is_ready:
        # REAL ML INFERENCE
        # Generate synthetic telemetry [latency, load, errors, type_id]
        telemetry = [
            SYSTEM_METRICS["latency"] / 100.0, 
            random.random(), 
            random.random() * 0.1, 
            hash(analysis_type) % 4
        ]
        prediction, conf = ai_engine.predict_threat_level(telemetry)
        
        if "Safe" not in prediction:
            risk_level = "Critical" if "Malware" in prediction else "Elevated"
            risk_score = int(conf)
        else:
            risk_level = "Low"
            risk_score = random.randint(10, 35)
            
        methodology = "Random Forest (Real-Time Inference)"
        base_confidence = conf
        
        # Explainable AI Integration
        explanation = ai_engine.explain_prediction(telemetry)
    elif intensity > 0.7:
        risk_level = "Critical"
        risk_score = random.randint(85, 98)
        methodology = random.choice(TAXONOMY_AI_TECHNIQUES["predictive_modeling"]["ML_Deep_Learning"])
        explanation = []
    elif intensity > 0.4:
        risk_level = "Elevated"
        risk_score = random.randint(60, 84)
        methodology = random.choice(TAXONOMY_AI_TECHNIQUES["predictive_modeling"]["ML_Deep_Learning"])
        explanation = []
    else:
        risk_level = "Moderate"
        risk_score = random.randint(30, 59)
        methodology = random.choice(TAXONOMY_AI_TECHNIQUES["predictive_modeling"]["ML_Deep_Learning"])
        explanation = []
    
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
        "heatmap": hotspots,
        "explanation": explanation
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
    
    if HAS_AI_ENGINE:
        # REAL NLP ANALYSIS
        analysis = ai_engine.analyze_sentiment_real(text)
        sentiment = analysis['label']
        is_disinfo = ai_engine.detect_disinformation(text)
        
        return jsonify({
            "sentiment": sentiment,
            "confidence": round(abs(analysis['score']) * 100 + 50, 2) if abs(analysis['score']) > 0 else 85.0, # Norm score
            "methodology": "TextBlob (Lexicon) + SVM (Real-Time)",
            "keywords": found_keywords if found_keywords else ["semantic_context"],
            "extremistScore": 0.95 if "Hostile" in sentiment else 0.15,
            "disinformationCheck": {
                "isDisinformation": is_disinfo,
                "method": "Linear SVM Classifier (Real-Time)",
                "vaderScale": round(analysis['score'], 2)
            }
        })

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
    if HAS_AI_ENGINE:
        # Generate a dynamic graph for analysis
        G = nx.erdos_renyi_graph(n=30, p=0.15)
        nodes = [{"id": f"Target-{i}", "group": random.randint(1, 5)} for i in G.nodes()]
        links = [{"source": f"Target-{u}", "target": f"Target-{v}"} for u, v in G.edges()]
        
        analysis = ai_engine.analyze_social_graph(nodes, links)
        
        return jsonify({
            "detected_groups": [
                {"name": f"Cluster-{i+1}", "threat_level": "High" if i < 2 else "Medium", "members": len(nodes)//analysis['communities'], "dominant_platform": "Telegram"} 
                for i in range(min(analysis['communities'], 3))
            ],
            "high_risk_nodes": analysis['high_risk_nodes'],
            "graph_stats": {
                "nodes": analysis['node_count'],
                "edges": analysis['edge_count'],
                "communities": analysis['communities']
            },
            "tech_stack": ["NetworkX (Centrality)", "Louvain Modularity", "LSTM (Behavior)"]
        })

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

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    return jsonify(users_db)

@app.route('/api/admin/users/<int:user_id>/ban', methods=['POST'])
def ban_user(user_id):
    for user in users_db:
        if user['id'] == user_id:
            user['status'] = 'Banned'
            # Log the action
            audit_logs.insert(0, {
                "id": random.randint(1000, 9999), 
                "action": f"User Banned ({user['name']})", 
                "user": "Admin", 
                "time": datetime.now().strftime("%I:%M %p"), 
                "status": "Success"
            })
            return jsonify({"success": True, "message": f"User {user['name']} banned."})
    return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/api/admin/users/<int:user_id>/approve', methods=['POST'])
def approve_user(user_id):
    for user in users_db:
        if user['id'] == user_id:
            user['status'] = 'Active'
            audit_logs.insert(0, {
                "id": random.randint(1000, 9999), 
                "action": f"User Approved ({user['name']})", 
                "user": "Admin", 
                "time": datetime.now().strftime("%I:%M %p"), 
                "status": "Success"
            })
            return jsonify({"success": True, "message": f"User {user['name']} approved."})
    return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/api/admin/logs', methods=['GET'])
def get_audit_logs():
    return jsonify(audit_logs)

@app.route('/api/admin/lockdown', methods=['POST'])
def execute_lockdown():
    global SYSTEM_LOCKDOWN
    SYSTEM_LOCKDOWN = True
    
    # Log the action
    audit_logs.insert(0, {
        "id": random.randint(1000, 9999), 
        "action": "GLOBAL LOCKDOWN INITIATED", 
        "user": "Admin", 
        "time": datetime.now().strftime("%I:%M %p"), 
        "status": "Success"
    })
    
    print("🚨 SYSTEM LOCKDOWN ENABLED")
    return jsonify({"success": True, "message": "Global lockdown protocols engaged. All non-admin sessions marked for termination."})

@app.route('/api/settings/update', methods=['POST'])
def update_settings():
    return jsonify({"success": True, "message": "System configuration updated successfully"})

# --- AI CHAT ASSISTANT ---
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.json
    message = data.get('message', '').lower()
    history = data.get('history', [])

    # Contextual response engine based on query type
    if any(w in message for w in ['threat', 'ddos', 'intrusion', 'attack', 'malware']):
        response = (f"⚡ THREAT ANALYSIS COMPLETE: {len(active_threats)} active vectors logged. "
                    f"IsolationForest anomaly detector flagged {random.randint(2,8)} irregular packets. "
                    f"RandomForest classifier confidence: {random.randint(90,97)}%. "
                    f"Recommend: Isolate perimeter relay nodes and initiate Tier-{random.randint(2,3)} response.")
    elif any(w in message for w in ['risk', 'predict', 'forecast', 'xai', 'shap', 'lime']):
        risk_score = random.randint(68, 92)
        response = (f"🔮 RISK FORECAST (LSTM+PSO+XGBoost): Current threat index {risk_score}/100. "
                    f"SHAP top features: [1] Latency spike (+{random.randint(20,40)}%), "
                    f"[2] Social signal anomaly (NLP-BERT), [3] Historical vector match. "
                    f"Confidence: {random.randint(88,96)}.{random.randint(1,9)}%. XAI explanation available on Predictive Analytics page.")
    elif any(w in message for w in ['network', 'graph', 'node', 'centrality', 'cluster']):
        response = (f"🌐 NETWORK TOPOLOGY: {random.randint(18,30)} nodes active. "
                    f"Louvain community detection: {random.randint(2,5)} suspicious clusters. "
                    f"Betweenness centrality peak: 0.{random.randint(70,95)}. "
                    f"High-risk nodes: n{random.randint(5,9)}, n{random.randint(10,15)}, n{random.randint(16,20)}. Recommend deep-packet inspection.")
    elif any(w in message for w in ['sentiment', 'social', 'disinfo', 'propaganda', 'fake']):
        vader = round(random.uniform(-0.9, -0.4), 2)
        response = (f"📡 NLP SIGNAL: Bi-LSTM sentiment model detected coordinated narrative injection. "
                    f"VADER scale: {vader} (hostile). SVM+CNN disinformation confidence: {random.randint(91,98)}%. "
                    f"Source attributed to StateProxyNet. Platform spread: Telegram ({random.randint(30,60)}%), Twitter/X ({random.randint(20,40)}%).")
    elif any(w in message for w in ['status', 'system', 'health', 'online', 'module']):
        active_count = SYSTEM_METRICS['active_vectors']
        response = (f"✅ SYSTEM STATUS: {active_count}/7 neural modules ACTIVE. "
                    f"Brain sync: {SYSTEM_METRICS['brain_sync']}%. Latency: {SYSTEM_METRICS['latency']}ms. "
                    f"Python ML Engine: {'ONLINE (AI Mode)' if HAS_AI_ENGINE else 'ONLINE (Simulation Mode)'}. "
                    f"Supabase Auth: CONNECTED. CROSINT feed: syncing. Lockdown: {'ACTIVE' if SYSTEM_LOCKDOWN else 'OFF'}.")
    elif any(w in message for w in ['pipeline', 'layer', 'workflow', 'architecture']):
        response = ("🔧 AI PIPELINE STATUS: All 9 backend layers nominal. "
                    "Ingestion → Storage → Preprocessing → Model Serving → MSDF → IDS → XAI → Feedback → Governance. "
                    "RADAR adversarial testing last ran 4h ago. Federated learning sync: active. "
                    "Navigate to 'AI Pipeline' page for full breakdown.")
    elif any(w in message for w in ['crosint', 'report', 'crowdsource', 'citizen']):
        response = (f"📋 CROSINT STATUS: {len(reports)} citizen intelligence reports in queue. "
                    f"{len([r for r in reports if r['status'] == 'verified'])} verified, "
                    f"{len([r for r in reports if r['status'] == 'pending'])} pending neural validation. "
                    f"Top contributing region: Hyderabad Node. Trust threshold: 0.74.")
    else:
        response = (f"🛡️ GUARDIAN AI (v4.0 — LSTM/SVM/PSO Hybrid): Query processed. "
                    f"Active threat index: {len(active_threats)}. System latency: {SYSTEM_METRICS['latency']}ms. "
                    f"For specific analysis, try: 'analyze threats', 'predict risk', 'social sentiment', 'system status', or 'AI pipeline'.")

    return jsonify({"response": response, "model": "Guardian-Neural-v4", "timestamp": datetime.now().isoformat()})


# --- AI PIPELINE ENDPOINTS ---
PIPELINE_LAYERS = [
    {
        "id": "01", "name": "INPUT LAYER", "subtitle": "Data Collection & Sources",
        "color": "blue",
        "components": [
            {"name": "OSINT Feeds", "detail": "GTD, dark web crawlers, news APIs"},
            {"name": "SIGINT/IMINT", "detail": "Signals intelligence, satellite imagery"},
            {"name": "HUMINT", "detail": "Field reports, confidential sources"},
            {"name": "CROSINT", "detail": "Crowdsourced citizen intelligence"},
            {"name": "IoT / CPS", "detail": "Sensor networks, industrial systems"},
            {"name": "Social Media", "detail": "Twitter, Telegram, dark forums"}
        ]
    },
    {
        "id": "02", "name": "DATA FUSION LAYER", "subtitle": "Multi-Source Integration & Pre-processing",
        "color": "purple",
        "components": [
            {"name": "Noise Filtering", "detail": "Remove bots, troll accounts, sockpuppets"},
            {"name": "Tokenization", "detail": "NLP feature extraction, keyword extraction"},
            {"name": "Class Balancing", "detail": "Fix threat/non-threat imbalance (SMOTE)"},
            {"name": "IoC Extraction", "detail": "IPs, URLs, CVEs, file hashes"},
            {"name": "MSDF", "detail": "Multi-Sensor Data Fusion integration"},
            {"name": "SAR Despeckling", "detail": "Satellite/radar imagery preprocessing"}
        ]
    },
    {
        "id": "03", "name": "AI PROCESSING LAYER", "subtitle": "Core ML/DL Models & Analytics",
        "color": "cyan",
        "components": [
            {"name": "SVM + KNN Ensemble", "detail": "Terrorist zone prediction"},
            {"name": "XGBoost + PSO", "detail": "Attack prediction, weapon classification"},
            {"name": "LSTM + Autoencoder", "detail": "Network intrusion detection"},
            {"name": "BERT / SecurityBERT", "detail": "Misinformation, phishing, IoT threats"},
            {"name": "GNN + STGCN", "detail": "Extremist network mapping"},
            {"name": "GCPDDQN (RL)", "detail": "Counter-UAV swarm neutralization"}
        ]
    },
    {
        "id": "04", "name": "THREAT DETECTION LAYER", "subtitle": "Real-Time Analysis & Classification",
        "color": "red",
        "components": [
            {"name": "IDS Engine", "detail": "Real-time packet monitoring"},
            {"name": "Anomaly Detector", "detail": "IsolationForest outlier scoring"},
            {"name": "UEBA", "detail": "User/Entity Behavioral Analytics"},
            {"name": "E2E-RDS", "detail": "End-to-end ransomware detection"},
            {"name": "Severity Ranker", "detail": "Critical / High / Medium / Low"},
            {"name": "Alert Queue", "detail": "Real-time alert dispatch pipeline"}
        ]
    },
    {
        "id": "05", "name": "EXPLAINABILITY LAYER (XAI)", "subtitle": "Transparency, Bias Mitigation & Auditability",
        "color": "green",
        "components": [
            {"name": "SHAP", "detail": "Feature contribution scores per prediction"},
            {"name": "LIME", "detail": "Local approximation of decision boundary"},
            {"name": "TRUST / MetaCluster", "detail": "IoT/CPS model-agnostic explanation"},
            {"name": "Bias Auditor", "detail": "Detect discriminatory patterns in training data"},
            {"name": "Report Generator", "detail": "Human-readable analyst reports"},
            {"name": "Confidence Scorer", "detail": "Calibrated probability outputs"}
        ]
    },
    {
        "id": "06", "name": "OUTPUT & GOVERNANCE LAYER", "subtitle": "Decision Support, Alerts & Oversight",
        "color": "orange",
        "components": [
            {"name": "Analyst Dashboard", "detail": "Threat maps, charts, reports"},
            {"name": "Email / Alert Dispatch", "detail": "SMTP alerts for critical events"},
            {"name": "Audit Log", "detail": "Full AI decision trail (EU AI Act)"},
            {"name": "RBAC", "detail": "Role-based access control for classified outputs"},
            {"name": "Regulatory Sandbox", "detail": "Safe testing before live deployment"},
            {"name": "Cross-Agency Sharing", "detail": "Europol, FBI, national agencies protocols"}
        ]
    }
]

BACKEND_WORKFLOW_LAYERS = [
    {
        "id": "ingestion", "step": 1, "title": "Data Ingestion Backend",
        "items": [
            "Dark Crawler & Posit Toolkit — social platforms, dark web, news feeds",
            "Stream processors — IoT sensor data, SIGINT, network traffic packets",
            "API connectors — GTD Global Terrorism Database, Europol, border control",
            "Crowdsource receivers — AlertCorps, Ushahidi, citizen reporting platforms"
        ]
    },
    {
        "id": "storage", "step": 2, "title": "Data Storage Backend",
        "items": [
            "Relational DB — historical attack records 1970–2025 for training",
            "Document stores — social media posts, news articles, multimedia",
            "Graph databases — terrorist network nodes/edges relationships",
            "Time-series stores — SIGINT streams, sensor feeds, behavioral logs",
            "Military Data Space (MDS) — merges IMD + EMD in secure store"
        ]
    },
    {
        "id": "preprocessing", "step": 3, "title": "Pre-processing Backend",
        "items": [
            "Noise filtering — removes troll accounts, bots, sockpuppets",
            "Tokenization & NLP feature extraction (keywords, URL structures, metadata)",
            "Class balancing — fixes imbalanced threat/non-threat ratios (SMOTE)",
            "IoC extraction — IP addresses, URLs, file hashes, CVE identifiers",
            "SAR time-series despeckling for satellite/radar imagery"
        ]
    },
    {
        "id": "model_serving", "step": 4, "title": "AI Model Serving Backend",
        "models": [
            {"model": "SVM + KNN Ensemble", "task": "Terrorist zone prediction", "tech": "Scikit-learn"},
            {"model": "Random Forest + XGBoost + PSO", "task": "Attack prediction, weapon classification", "tech": "Gradient boosting"},
            {"model": "LSTM + Autoencoder (LSTM-AE)", "task": "Network intrusion detection", "tech": "Deep learning inference"},
            {"model": "BiLSTM + CNN", "task": "Hate speech, radicalization scoring", "tech": "NLP pipeline"},
            {"model": "BERT / SecurityBERT / FakeBERT", "task": "Misinformation, phishing, IoT", "tech": "Transformer model"},
            {"model": "GNN + STGCN", "task": "Extremist network mapping", "tech": "Graph neural network"},
            {"model": "GCPDDQN (RL)", "task": "Counter UAV swarm neutralization", "tech": "RL agent runtime"}
        ]
    },
    {
        "id": "msdf", "step": 5, "title": "Multi-Sensor Data Fusion (MSDF) Backend",
        "items": [
            "Combines IMINT + GEOINT + OSINT + HUMINT + SIGINT + MASINT into single threat picture",
            "CNN processes visual/grid-structured data — satellite, CCTV frames",
            "RNN processes sequential/temporal data — attack timelines, behavioral sequences",
            "LBSM fusion for supply chain and military operations",
            "Output: unified threat score per entity/event"
        ]
    },
    {
        "id": "ids", "step": 6, "title": "Intrusion Detection System (IDS) Backend",
        "items": [
            "Real-time network packet monitoring and analysis",
            "LSTM-AE hybrid detects novel intrusion patterns never seen before",
            "Bayesian networks model probabilistic attack chains",
            "ANN flags anomalous user/entity behavior (UEBA)",
            "E2E-RDS + AIRaD analyze ransomware behavioral patterns",
            "Output: severity-ranked alert queue dispatched in real-time"
        ]
    },
    {
        "id": "xai", "step": 7, "title": "Explainability (XAI) Backend",
        "items": [
            "SHAP — computes feature contribution scores per prediction",
            "LIME — locally approximates model decision boundary",
            "TRUST / MetaCluster — model-agnostic for IIoT/CPS environments",
            "Human-readable reports generated for analyst dashboards",
            "Bias auditing pipeline detects discriminatory patterns in training data"
        ]
    },
    {
        "id": "feedback", "step": 8, "title": "Feedback & Retraining Backend",
        "items": [
            "Human analyst corrections logged and fed back to training pipeline",
            "Federated Learning — retrain across distributed nodes without centralizing data",
            "Transfer Learning — adapts pre-trained models to new threat domains",
            "RADAR framework — adversarial robustness testing before redeployment",
            "Adversarial attack simulation (evasion + poisoning) tested before each release"
        ]
    },
    {
        "id": "governance", "step": 9, "title": "Governance & Compliance Backend",
        "items": [
            "Full audit logging of every AI decision (EU AI Act / GDPR requirement)",
            "Role-based access control for classified outputs",
            "Regulatory sandbox environment for testing new models",
            "Cross-agency data sharing protocols (Europol, FBI, national agencies)",
            "Privacy-preserving computation — personal data not exposed in model outputs"
        ]
    }
]

@app.route('/api/pipeline/layers', methods=['GET'])
def get_pipeline_layers():
    # Enrich with live system activity
    result = []
    section_map = {
        "01": "predictive_modeling", "02": "data_fusion", "03": "nlp_techniques",
        "04": "cybersecurity", "05": "explainable_ai", "06": "crosint"
    }
    for layer in PIPELINE_LAYERS:
        activity_key = section_map.get(layer["id"])
        activity = SYSTEM_ACTIVITY.get(activity_key, {}) if activity_key else {}
        result.append({
            **layer,
            "status": activity.get("status", "active"),
            "confidence": activity.get("confidence", random.randint(88, 97)),
            "current_activity": activity.get("activity", "Processing..."),
            "throughput": f"{random.randint(1200, 4800)} events/sec",
            "latency_ms": random.randint(8, 45)
        })
    return jsonify(result)

@app.route('/api/pipeline/layer/<layer_id>', methods=['GET'])
def get_pipeline_layer_detail(layer_id):
    layer = next((l for l in PIPELINE_LAYERS if l["id"] == layer_id), None)
    if not layer:
        return jsonify({"error": "Layer not found"}), 404
    return jsonify({
        **layer,
        "confidence": random.randint(88, 98),
        "status": "active",
        "throughput": f"{random.randint(1200, 4800)} events/sec",
        "latency_ms": random.randint(8, 45),
        "last_update": datetime.now().isoformat()
    })

@app.route('/api/backend/workflow', methods=['GET'])
def get_backend_workflow():
    return jsonify({
        "layers": BACKEND_WORKFLOW_LAYERS,
        "challenges": [
            {"icon": "adversarial", "label": "Adversarial poisoning", "desc": "Malicious inputs corrupt training data at ingestion"},
            {"icon": "evasion", "label": "Evasion attacks", "desc": "Attackers craft inputs that bypass trained models"},
            {"icon": "quality", "label": "Data quality", "desc": "OSINT/crowdsource feeds are noisy and unreliable"},
            {"icon": "scale", "label": "Scalability", "desc": "Processing IoT, CPS, satellite requires powerful compute"},
            {"icon": "skills", "label": "Skill gaps", "desc": "Organizations lack staff to operate these backend systems"},
            {"icon": "regulatory", "label": "Regulatory misalignment", "desc": "EU, US, and China have incompatible compliance frameworks"}
        ],
        "tech_stack": {
            "deep_learning": "TensorFlow (explicitly referenced in paper)",
            "text_classification": "LibShortText, LibLinear",
            "crawling": "Dark Crawler",
            "nlp_toolkit": "Posit Toolkit",
            "graph_analysis": "PLATO algorithm, NetworkX",
            "optimization": "PSO meta-heuristic",
            "security_testing": "RADAR framework"
        },
        "paper_reference": "Syllaidopoulos et al. — A Comprehensive Survey on AI in Counter-Terrorism and Cybersecurity · IEEE Access 2025"
    })

# ═══════════════════════════════════════════════════════════════
# NEW FEATURES — PHASE 3
# ═══════════════════════════════════════════════════════════════

# --- LIVE THREAT FEED ---
FEED_SOURCES = ["OSINT-Alpha","DarkNet-Crawler","SocialMediaAPI","SIGINT-Node","CROSINT-Beta","ThreatIntel-DB"]
FEED_EVENTS = [
    "New exploit CVE-2026-{n} published on dark forums",
    "Coordinated DDoS detected targeting banking sector",
    "Suspicious account cluster of {n} accounts on Telegram",
    "Zero-day advisory issued for critical infrastructure",
    "Ransomware campaign targeting healthcare facilities",
    "Phishing domain fake-{n}.com registered and active",
    "Extremist content flagged across {n} platforms",
    "Botnet C2 server identified at {ip}",
    "Data dump of {n}K records offered for sale on forums",
    "APT group activity detected in Southeast Asian networks",
    "Credential stuffing attack against govt portal detected",
    "AI-generated disinformation campaign trending on X/Twitter",
]

@app.route('/api/feed/live', methods=['GET'])
def live_feed():
    feed = []
    for _ in range(random.randint(10, 15)):
        tmpl = random.choice(FEED_EVENTS)
        event = tmpl.format(
            n=random.randint(10, 999),
            ip=f"{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}"
        )
        feed.append({
            "id": str(uuid.uuid4())[:8],
            "event": event,
            "source": random.choice(FEED_SOURCES),
            "severity": random.choice(["critical","critical","high","high","medium","low"]),
            "timestamp": datetime.now().isoformat(),
            "category": random.choice(["cyber","terrorism","disinformation","network","physical"])
        })
    return jsonify(sorted(feed, key=lambda x: {"critical":0,"high":1,"medium":2,"low":3}[x["severity"]]))

# --- DARK WEB MONITOR ---
@app.route('/api/darkweb/scan', methods=['GET'])
def darkweb_scan():
    mentions = [
        {"id": str(uuid.uuid4())[:8], "keyword": kw, "site": site, "category": cat, "risk": risk, "status": status, "timestamp": datetime.now().isoformat()}
        for kw, site, cat, risk, status in [
            ("0day exploit",           "exploit-db.onion",     "Marketplace",      "critical", "active"),
            ("credit card dump 2026",  "pastejack.cc",         "Paste Site",       "high",     "flagged"),
            ("ransomware kit v3",      "darkmarket.onion",     "Marketplace",      "critical", "monitoring"),
            ("phishing html template", "raidforums.cc",        "Forum",            "medium",   "active"),
            ("DDoS botnet hire",       "xmpp-bot.onion",       "Hidden Service",   "high",     "monitoring"),
            ("government db breach",   "ghostbin.co",          "Paste Site",       "critical", "active"),
            ("API key leak github",    "leakwatch.onion",      "Paste Site",       "high",     "flagged"),
            ("malware dropper C2",     "bazar.onion",          "Hidden Service",   "critical", "monitoring"),
        ]
    ]
    for _ in range(random.randint(2,4)):
        mentions.append({
            "id": str(uuid.uuid4())[:8],
            "keyword": random.choice(["zero-day","API key","database dump","credential stuffing","rootkit","OPSEC failure"]),
            "site": random.choice(["hiddenwiki.onion","dark-forum.cc","pastebin.com","leakbase.io"]),
            "category": random.choice(["Forum","Marketplace","Paste Site","Hidden Service"]),
            "risk": random.choice(["critical","high","medium"]),
            "status": random.choice(["active","flagged","monitoring"]),
            "timestamp": datetime.now().isoformat()
        })
    return jsonify({
        "mentions": mentions,
        "total_sites_scanned": random.randint(180, 350),
        "scan_duration": f"{random.randint(12,45)}s",
        "last_scan": datetime.now().isoformat(),
        "tor_nodes_active": random.randint(6000, 9000),
        "alerts_today": random.randint(3, 12)
    })

# --- RISK SCORE CALCULATOR ---
@app.route('/api/risk/calculate', methods=['POST'])
def calculate_risk():
    data = request.json or {}
    weights = {
        "threat_level":       0.30,
        "network_exposure":   0.20,
        "data_sensitivity":   0.20,
        "historical_incidents": 0.15,
        "social_signal":      0.15
    }
    score = min(100, sum(data.get(k, 0) * w * 10 for k, w in weights.items()))
    level = "CRITICAL" if score >= 80 else "HIGH" if score >= 60 else "MEDIUM" if score >= 40 else "LOW"
    contributions = {k: round(data.get(k, 0) * w * 10, 2) for k, w in weights.items()}
    top_factor = max(contributions, key=contributions.get)
    recs = {
        "CRITICAL": ["Initiate Tier-3 lockdown protocol immediately","Deploy rapid response team","Isolate affected systems","Notify senior command center","Submit emergency incident report"],
        "HIGH":     ["Increase monitoring frequency to 1-min intervals","Deploy additional firewall rules","Alert Tier-2 response team","Review all access logs from past 24h","Enable enhanced UEBA mode"],
        "MEDIUM":   ["Monitor for escalation patterns","Schedule vulnerability scan","Brief Tier-1 analyst","Update security awareness posture","Review CROSINT feed for correlations"],
        "LOW":      ["Log and archive for audit trail","Continue routine monitoring","Schedule weekly review","No immediate action required","AI confidence within normal baseline"]
    }
    return jsonify({
        "risk_score": round(score, 1),
        "risk_level": level,
        "top_factor": top_factor,
        "contributions": contributions,
        "recommendations": recs[level],
        "model": "Weighted Multi-Factor (RandomForest + XAI)",
        "confidence": random.randint(88, 97),
        "timestamp": datetime.now().isoformat()
    })

# --- THREAT TIMELINE ---
from datetime import timedelta

@app.route('/api/threats/timeline', methods=['GET'])
def threats_timeline():
    base = datetime.now()
    timeline = [{
        "date": (base - timedelta(days=i)).strftime("%b %d"),
        "critical": random.randint(0, 8),
        "high":     random.randint(2, 15),
        "medium":   random.randint(5, 25),
        "low":      random.randint(8, 30),
        "blocked":  random.randint(10, 50)
    } for i in range(29, -1, -1)]
    return jsonify({
        "timeline": timeline,
        "peak_day": (base - timedelta(days=random.randint(1,7))).strftime("%b %d"),
        "total_period": sum(t["critical"]+t["high"] for t in timeline),
        "trend": random.choice(["increasing","stable","decreasing"])
    })

# --- HEATMAP DATA ---
@app.route('/api/threats/heatmap', methods=['GET'])
def threats_heatmap():
    regions = [
        {"region":"South Asia",   "country":"India",      "score": random.randint(55,80),  "incidents": random.randint(20,80)},
        {"region":"South Asia",   "country":"Pakistan",   "score": random.randint(70,95),  "incidents": random.randint(30,100)},
        {"region":"Middle East",  "country":"Syria",      "score": random.randint(80,98),  "incidents": random.randint(50,150)},
        {"region":"Middle East",  "country":"Iran",       "score": random.randint(65,88),  "incidents": random.randint(25,90)},
        {"region":"East Europe",  "country":"Ukraine",    "score": random.randint(75,95),  "incidents": random.randint(40,120)},
        {"region":"East Europe",  "country":"Russia",     "score": random.randint(70,92),  "incidents": random.randint(35,110)},
        {"region":"Southeast Asia","country":"Myanmar",   "score": random.randint(55,80),  "incidents": random.randint(15,60)},
        {"region":"Africa",       "country":"Nigeria",    "score": random.randint(50,75),  "incidents": random.randint(20,70)},
        {"region":"Africa",       "country":"Somalia",    "score": random.randint(70,90),  "incidents": random.randint(30,85)},
        {"region":"North America","country":"USA",        "score": random.randint(25,50),  "incidents": random.randint(10,40)},
        {"region":"Europe",       "country":"France",     "score": random.randint(30,55),  "incidents": random.randint(8,35)},
        {"region":"East Asia",    "country":"China",      "score": random.randint(45,70),  "incidents": random.randint(15,55)},
        {"region":"East Asia",    "country":"North Korea","score": random.randint(75,95),  "incidents": random.randint(20,65)},
        {"region":"South America","country":"Colombia",   "score": random.randint(40,65),  "incidents": random.randint(12,45)},
    ]
    return jsonify({"regions": regions, "max_score": 100, "last_updated": datetime.now().isoformat()})

# --- INCIDENT RESPONSE PLAYBOOKS ---
PLAYBOOKS = [
    {"id":"PB-001","type":"DDoS Attack","severity":"critical","icon":"network","eta":"30 min","steps":[
        {"step":1,"action":"Identify attack vectors","detail":"Check traffic logs for SYN flood, UDP flood, or HTTP flood patterns","time":"0–5 min"},
        {"step":2,"action":"Enable rate limiting","detail":"Configure firewall — limit requests per IP to 100/min, block spoofed IPs","time":"5–10 min"},
        {"step":3,"action":"Activate CDN scrubbing","detail":"Route traffic through Cloudflare/Akamai DDoS mitigation layer","time":"10–15 min"},
        {"step":4,"action":"Notify upstream ISP","detail":"Request BGP null routing for attacking IP CIDR blocks","time":"15–30 min"},
        {"step":5,"action":"Document & incident report","detail":"Log all IPs, attack timeline, and impact assessment","time":"Post-incident"},
    ]},
    {"id":"PB-002","type":"Ransomware Detection","severity":"critical","icon":"lock","eta":"2 hours","steps":[
        {"step":1,"action":"Isolate affected systems","detail":"Disconnect from network IMMEDIATELY. Do NOT shut down — preserve memory evidence","time":"0–2 min"},
        {"step":2,"action":"Identify ransomware variant","detail":"Check encrypted file extensions against ID-Ransomware database","time":"2–10 min"},
        {"step":3,"action":"Check for decryptors","detail":"Search NoMoreRansom.org for known free decryption tools","time":"10–20 min"},
        {"step":4,"action":"Restore from clean backup","detail":"Verify backup integrity before restoring. Use OFFLINE backups only","time":"20–120 min"},
        {"step":5,"action":"Threat hunter sweep","detail":"Full network scan for persistence mechanisms and lateral movement artifacts","time":"Post-incident"},
    ]},
    {"id":"PB-003","type":"Terrorist Content Detected","severity":"critical","icon":"alert","eta":"90 min","steps":[
        {"step":1,"action":"AI classifier flags content","detail":"Guardian AI NLP score exceeds 0.85 threshold — human review triggered","time":"Automated"},
        {"step":2,"action":"Senior analyst verification","detail":"Analyst reviews flagged content. Confirms threat classification","time":"0–30 min"},
        {"step":3,"action":"Source tracking & attribution","detail":"Trace IP, VPN chain, device fingerprint. Cross-reference watchlist","time":"30–60 min"},
        {"step":4,"action":"Escalate to authorities","detail":"File report with national cyber cell and law enforcement","time":"60–90 min"},
        {"step":5,"action":"Platform takedown request","detail":"Submit content removal request with legal notice to platform","time":"Same day"},
    ]},
    {"id":"PB-004","type":"Data Breach","severity":"high","icon":"database","eta":"72 hours","steps":[
        {"step":1,"action":"Confirm breach scope","detail":"Identify data accessed: PII, credentials, classified documents","time":"0–15 min"},
        {"step":2,"action":"Contain exfiltration","detail":"Block outbound connections from compromised systems. Revoke API keys","time":"15–30 min"},
        {"step":3,"action":"Preserve forensic evidence","detail":"Memory dumps, network logs, system snapshots — chain of custody maintained","time":"30–45 min"},
        {"step":4,"action":"Notify compliance team","detail":"GDPR/EU AI Act: Notify authorities within 72 hours of confirmed breach","time":"45–120 min"},
        {"step":5,"action":"Affected user notification","detail":"Draft and send breach notification with actionable steps for users","time":"24–72 hours"},
    ]},
    {"id":"PB-005","type":"Phishing Campaign","severity":"medium","icon":"user","eta":"45 min","steps":[
        {"step":1,"action":"Quarantine suspicious email","detail":"Move to sandbox. Block sender domain. Do NOT click any links","time":"0–5 min"},
        {"step":2,"action":"Analyze email headers","detail":"Check SPF/DKIM/DMARC. Trace origin IP. Verify MX records","time":"5–15 min"},
        {"step":3,"action":"Check credential compromise","detail":"Verify if any user clicked links or entered credentials","time":"15–30 min"},
        {"step":4,"action":"Reset compromised accounts","detail":"Force password reset. Revoke sessions. Enable MFA on all accounts","time":"30–45 min"},
        {"step":5,"action":"Organization-wide alert","detail":"Send phishing awareness notice with IOCs to all staff","time":"Same day"},
    ]},
    {"id":"PB-006","type":"Insider Threat","severity":"high","icon":"shield","eta":"Coordinated","steps":[
        {"step":1,"action":"UEBA alert triggered","detail":"Unusual data access pattern detected — accessing sensitive files off-hours","time":"Automated"},
        {"step":2,"action":"Silent enhanced monitoring","detail":"Enable full session recording. Do NOT alert user. Legal team notified","time":"0–30 min"},
        {"step":3,"action":"Full access audit","detail":"Review all files, emails, USB activity, and print jobs — last 30 days","time":"30–90 min"},
        {"step":4,"action":"HR & Legal coordination","detail":"Brief HR and Legal before any confrontation or account lockout","time":"90–180 min"},
        {"step":5,"action":"Controlled simultaneous lockout","detail":"Revoke all access simultaneously. Secure workstation. Begin interview","time":"Coordinated"},
    ]},
]

@app.route('/api/incidents/playbooks', methods=['GET'])
def get_playbooks():
    return jsonify(PLAYBOOKS)

# --- BIOMETRIC VERIFICATION ---
@app.route('/api/biometric/verify', methods=['POST'])
def biometric_verify():
    data = request.json or {}
    confidence = random.uniform(0.78, 0.99)
    matched = confidence > 0.87
    profile = None
    if matched:
        profile = {
            "id": f"BIO-{random.randint(10000,99999)}",
            "name": random.choice(["Subject Alpha-7","Unknown Individual","Clearance-L3 Officer","Watchlist Entity"]),
            "watchlist": random.choice([True, False, False, False]),
            "risk_level": random.choice(["low","medium","high","none"]),
            "last_seen": (datetime.now() - timedelta(hours=random.randint(1,72))).isoformat(),
            "databases_matched": random.sample(["INTERPOL","Europol WL","National ID","Terror Watch","Border Control"], k=random.randint(1,3))
        }
    return jsonify({
        "matched": matched,
        "confidence": round(confidence * 100, 2),
        "scan_type": data.get("type","face"),
        "processing_time_ms": random.randint(120, 890),
        "model": "FaceNet + DeepFace Ensemble (ResNet-50)",
        "profile": profile,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("Guardian AI Python Backend Running on Port 5000")
    print("System starting with EMPTY data stores. Background simulator will populate real-time data shortly.")
    app.run(host='0.0.0.0', port=5000, debug=True)
