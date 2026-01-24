const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors()); // Allow all
app.use(express.json());

// --- Mock Data Stores ---
let activeThreats = [];
let networkNodes = [];
let recentReports = [];
let intelligenceFeed = [];
let systemHealth = {
    cpu: 45,
    memory: 62,
    networkLoad: 'Low',
    uptime: 98.2
};
let chatMessages = [];

// --- Helper Functions to Generate Mock Data ---

function generateThreat() {
    const types = ['SQL Injection', 'DDoS Attack', 'Phishing Attempt', 'Malware Beacon', 'Brute Force'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const locations = ['North America', 'Eastern Europe', 'Asia Pacific', 'South America'];

    return {
        id: uuidv4(),
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        source_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: new Date().toISOString(),
        status: 'active'
    };
}

function generateNetworkNode() {
    return {
        id: uuidv4(),
        label: `Node-${Math.floor(Math.random() * 1000)}`,
        type: Math.random() > 0.8 ? 'suspect' : 'normal',
        connections: Math.floor(Math.random() * 50)
    };
}

// Initialize some data
for (let i = 0; i < 10; i++) activeThreats.push(generateThreat());

// --- Real-time Simulation Loop ---
setInterval(() => {
    // 1. Simulate new threat occasionally
    if (Math.random() > 0.7) {
        const newThreat = generateThreat();
        activeThreats.unshift(newThreat);
        if (activeThreats.length > 50) activeThreats.pop();
        io.emit('threat:new', newThreat);
    }

    // 2. Simulate System Health changes
    systemHealth.cpu = Math.min(100, Math.max(10, systemHealth.cpu + (Math.random() * 10 - 5)));
    systemHealth.memory = Math.min(100, Math.max(20, systemHealth.memory + (Math.random() * 5 - 2.5)));
    io.emit('system:health', systemHealth);

    // 3. Simulate Network Traffic anomalies
    if (Math.random() > 0.8) {
        io.emit('network:anomaly', {
            id: uuidv4(),
            description: 'High egress traffic detected',
            node: `Server-${Math.floor(Math.random() * 10)}`,
            value: `${Math.floor(Math.random() * 1000)} MB/s`
        });
    }
}, 3000); // Every 3 seconds

// --- REST API Routes ---

// 1. Dashboard Data
app.get('/api/dashboard/stats', (req, res) => {
    res.json({
        activeThreats: activeThreats.filter(t => t.status === 'active').length,
        blockedAttacks: Math.floor(Math.random() * 1000) + 500, // Just a cumulative number
        networkAnomalies: Math.floor(Math.random() * 50),
        systemHealth
    });
});

app.get('/api/threats', (req, res) => {
    res.json(activeThreats);
});

// 2. Threat Detection Module
const upload = multer({ dest: 'uploads/' });
app.post('/api/analyze/file', upload.single('file'), (req, res) => {
    // Simulate file analysis
    setTimeout(() => {
        res.json({
            verdict: Math.random() > 0.5 ? 'MALICIOUS' : 'CLEAN',
            confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
            details: {
                fileType: req.file?.mimetype || 'unknown',
                signaturesFound: Math.floor(Math.random() * 5),
                behavior: 'Suspicious API calls detected'
            }
        });
    }, 2000);
});

app.post('/api/analyze/ip', (req, res) => {
    const { ip } = req.body;
    res.json({
        ip,
        riskScore: Math.floor(Math.random() * 100),
        geolocation: 'Unknown Proxy',
        history: [
            { date: '2025-01-20', event: 'Port Scan' },
            { date: '2025-01-22', event: 'SSH Brute Force' }
        ]
    });
});

// 3. Sentiment Analysis
app.post('/api/analyze/sentiment', (req, res) => {
    const { text } = req.body;
    // Mock NLP analysis
    const sentiments = ['Neutral', 'Angry', 'Hateful', 'Positive'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const score = Math.random();

    res.json({
        sentiment,
        confidence: score,
        keywords: text.split(' ').filter(w => w.length > 5),
        extremistScore: sentiment === 'Hateful' ? 0.85 : 0.12
    });
});

// 4. Network Graph
app.get('/api/network/graph', (req, res) => {
    // Generate a random graph
    const nodes = [];
    const links = [];
    for (let i = 0; i < 20; i++) {
        nodes.push({ id: `n${i}`, group: Math.floor(Math.random() * 3) });
    }
    for (let i = 0; i < 30; i++) {
        links.push({
            source: `n${Math.floor(Math.random() * 20)}`,
            target: `n${Math.floor(Math.random() * 20)}`,
            value: Math.random()
        });
    }
    res.json({ nodes, links });
});

// 5. Misinformation Detection
app.post('/api/analyze/misinformation', (req, res) => {
    const { url, text } = req.body;
    res.json({
        verdict: Math.random() > 0.6 ? 'LIKELY_FALSE' : 'VERIFIED',
        confidence: 0.87,
        sourcesCheck: {
            snopes: 'FALSE',
            reuters: 'NO RECORD'
        },
        redFlags: ['Emotionally charged language', 'Unverified source domain']
    });
});

// 6. Predictive Analytics
app.post('/api/predict/risk', (req, res) => {
    const { region, timeframe } = req.body;
    // Generate heatmap data
    const regions = [
        { name: 'Region A', risk: 78, trend: 'up' },
        { name: 'Region B', risk: 23, trend: 'stable' },
        { name: 'Region C', risk: 45, trend: 'down' }
    ];
    res.json({
        overallRisk: 'High',
        prediction: 'Cyberattack likely within 48 hours',
        heatmap: regions
    });
});

// 7. Crowdsourced Intelligence
app.post('/api/reports/submit', (req, res) => {
    const report = {
        id: `CR-${Date.now()}`,
        ...req.body,
        status: 'Under Review',
        timestamp: new Date()
    };
    recentReports.push(report);
    io.emit('report:new', report);
    res.json({ success: true, referenceId: report.id });
});

app.get('/api/reports/:id', (req, res) => {
    const report = recentReports.find(r => r.id === req.params.id);
    if (report) {
        res.json(report);
    } else {
        res.status(404).json({ error: 'Report not found' });
    }
});

// --- Socket.IO Event Handlers ---

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial data
    socket.emit('init:threats', activeThreats);
    socket.emit('init:health', systemHealth);

    // Collaborative features
    socket.on('join:room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('chat:message', (msg) => {
        // msg: { user, text, timestamp }
        io.emit('chat:broadcast', msg); // Broadcast to all for public chat
    });

    socket.on('collab:cursor', (data) => {
        // Broadcast cursor position to others in room (if filtering by room)
        socket.broadcast.emit('collab:cursor_update', { id: socket.id, ...data });
    });

    // AI Assistant Chat (Mock)
    socket.on('ai:query', async (query) => {
        // Simulate AI processing delay
        setTimeout(() => {
            let response = "I'm analyzing that request...";
            if (query.toLowerCase().includes('threat')) {
                response = `I detected ${activeThreats.length} active threats. The most critical is ${activeThreats[0]?.type || 'none'}.`;
            } else if (query.toLowerCase().includes('risk')) {
                response = "Current system risk is MODERATE due to recent port scanning activity.";
            }
            socket.emit('ai:response', { text: response, timestamp: new Date() });
        }, 1500);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Guardian AI Backend running on port ${PORT}`);
});
