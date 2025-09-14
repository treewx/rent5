const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Proxy endpoint for Akahu API
app.all('/api/akahu/*', async (req, res) => {
    try {
        const akahuPath = req.path.replace('/api/akahu', '');
        const url = `https://api.akahu.io/v1${akahuPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

        const headers = {
            'Content-Type': 'application/json'
        };

        // Forward auth headers from the request
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        if (req.headers['x-akahu-id']) {
            headers['X-Akahu-ID'] = req.headers['x-akahu-id'];
        }

        const options = {
            method: req.method,
            headers,
        };

        if (req.method !== 'GET' && req.body) {
            options.body = JSON.stringify(req.body);
        }

        console.log(`Proxying ${req.method} request to: ${url}`);

        const response = await fetch(url, options);
        const data = await response.json();

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed', message: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Akahu API proxy available at /api/akahu/*');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});