# Guardian AI Platform Architecture

## 1. Frontend Workflow
### User Authentication & Authorization
- Login → JWT Token → Role-based Access Control → Dashboard Access

### Dashboard Flow
- **Main Dashboard** → Select Module:
  - Threat Detection Monitor
  - Intelligence Analysis
  - Network Analysis
  - Sentiment Analysis
  - Real-time Alerts

### Component Interaction Flow
#### A. Threat Detection Module
- User Input/Upload → Frontend Validation → API Request → Backend Processing → ML Model Inference → Results Display → XAI Explanation → User Action

#### B. Real-time Monitoring
- WebSocket Connection → Stream Events → Update Dashboard → Alert Notifications → Visual Analytics Update

#### C. Data Visualization
- Fetch Data → Process/Transform → Render Charts (Recharts/D3.js) → Interactive Filters → Export Reports

---

## 2. Backend Workflow

### API Request Processing
1. Client Request (REST/WebSocket)
2. API Gateway/Load Balancer
3. Authentication & Authorization Middleware
4. Request Validation & Rate Limiting
5. Route to Appropriate Service Handler
6. [Processing Layer]

### ML Model Processing Pipeline
- Input Data → Preprocessing → Feature Extraction → Model Selection → Inference → Post-processing → XAI Generation → Response Formation

### Specific Workflows by Module

#### A. Predictive Threat Detection
1. **Data Collection**: OSINT, Social Media, Network Traffic
2. **Data Preprocessing & Cleaning**
3. **Feature Engineering**
4. **Model Selection**: Random Forest (classification), XGBoost (prediction), LSTM (temporal)
5. **Prediction & Confidence Scoring**
6. **XAI Explanation** (SHAP/LIME)
7. **Alert Generation & Storage**
8. **Dashboard Update**

#### B. Intrusion Detection System (IDS)
1. **Network Traffic Capture**
2. **Packet Analysis & Feature Extraction**
3. **Anomaly Detection**: Deep Learning (LSTM + Autoencoder), Statistical/Behavioral Analysis
4. **Classification** (Normal/Attack)
5. **Attack Type Identification**
6. **Real-time Alert**
7. **Incident Logging & Response**

#### C. NLP-based Threat Analysis
1. **Text Data Collection**: Social Media, Forums
2. **Text Preprocessing**: Tokenization, Cleaning, Language Detection
3. **NLP Analysis**: Sentiment, Hate Speech (BERT), Extremist Content, Misinformation
4. **Entity Recognition & Extraction**
5. **Threat Scoring**
6. **Network Mapping**
7. **Report Generation**

#### D. Network Analysis for Extremist Groups
1. **Social Network Data Collection**
2. **Graph Construction**
3. **Network Analysis**: Centrality (Betweenness), Community Detection, Influence Mapping
4. **Key Node Identification**
5. **Relationship Mapping**
6. **Visualization Generation**
7. **Strategic Recommendations**

#### E. Data Fusion Intelligence
1. **Multi-source Data Collection**: OSINT, SIGINT, HUMINT
2. **Standardization & Quality Assessment**
3. **Multi-Sensor Data Fusion (MSDF)**
4. **Correlation Analysis**
5. **Pattern Recognition** (CNN/RNN)
6. **Intelligence Synthesis**
7. **Comprehensive Report Generation**

#### F. Crowdsourced Intelligence (Crosint)
1. **Public Submission Reception**
2. **Validation & Verification**
3. **Authenticity Checking**
4. **Reliability Scoring**
5. **Integration** into Intelligence Database
6. **Alert Generation**

#### G. Misinformation Detection
1. **Content Monitoring**
2. **NLP Processing**: BERT/GPT/FakeBERT
3. **Cross-reference Verification**
4. **Source Credibility Assessment**
5. **Classification** (True/False/Misleading)
6. **Propagation Analysis**
7. **Mitigation Recommendations**

---

## 3. Database Workflow
- **PostgreSQL**: Structured Data (User profiles, logs, reports)
- **MongoDB**: Unstructured Data (Social posts, graphs, raw intel)
- **Redis**: Caching, Session management, Real-time alerts
- **Elasticsearch**: Search & Analytics (Threat intel search, log aggregation)

---

## 4. Security Workflow
1. Input Sanitization
2. Authentication Check
3. Authorization Validation
4. Rate Limiting
5. Encryption (Data at Rest & Transit)
6. Adversarial Attack Defense
7. Audit Logging
8. XAI Transparency
9. Privacy Protection

---

## 5. End-to-End Example: Detecting Extremist Content
1. **DATA COLLECTION**: Social media APIs (Keywords: terrorism, radicalization)
2. **FRONTEND TRIGGER**: User initiates scan
3. **BACKEND PROCESSING**: NLP service routing
4. **PREPROCESSING**: Cleaning, tokenization
5. **ML MODEL INFERENCE**: BERT hate speech detection, Sentiment analysis
6. **NETWORK ANALYSIS**: Map influence & connections
7. **XAI EXPLANATION**: SHAP values, feature importance
8. **THREAT SCORING**: Risk level & confidence
9. **ALERT GENERATION**: WebSocket/Email notifications
10. **DATABASE STORAGE**: Logs & Intelligence update
11. **DASHBOARD UPDATE**: Charts & Graph refresh
12. **HUMAN REVIEW**: Analyst verification
13. **RESPONSE ACTION**: Content flagging/Escalation
