const http = require('http');
const fs = require('fs');

const logStream = fs.createWriteStream('results.txt', { flags: 'a' });

function log(message) {
    console.log(message);
    logStream.write(message + '\n');
}

function post(path, data) {
    const dataString = JSON.stringify(data);
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            log(`[${path}] Status: ${res.statusCode}`);
            log(`Response: ${body}`);
        });
    });

    req.on('error', (e) => {
        log(`[${path}] Error: ${e.message}`);
    });

    req.write(dataString);
    req.end();
}

log("Starting tests...");
post('/api/analyze/sentiment', { text: "This is a potentially dangerous threat involving malware." });
post('/api/predict/risk', { region: "North America", timeframe: "48h" });
