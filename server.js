const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const nodemailer = require('nodemailer');

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

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        const { to, from, subject, html, smtpConfig } = req.body;

        // Validate required fields
        if (!to || !from || !subject || !html || !smtpConfig) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (!smtpConfig.user || !smtpConfig.pass) {
            return res.status(400).json({ success: false, error: 'Missing email credentials' });
        }

        console.log(`Configuring email transport for provider: ${smtpConfig.provider}`);
        console.log(`Email from: ${smtpConfig.user} to: ${to}`);

        // Create transporter based on provider
        let transporter;

        if (smtpConfig.provider === 'gmail') {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: smtpConfig.user,
                    pass: smtpConfig.pass
                }
            });
        } else if (smtpConfig.provider === 'outlook') {
            transporter = nodemailer.createTransport({
                service: 'hotmail',
                auth: {
                    user: smtpConfig.user,
                    pass: smtpConfig.pass
                }
            });
        } else if (smtpConfig.provider === 'smtp') {
            if (!smtpConfig.host || !smtpConfig.port) {
                return res.status(400).json({ success: false, error: 'Missing SMTP host or port' });
            }
            transporter = nodemailer.createTransport({
                host: smtpConfig.host,
                port: parseInt(smtpConfig.port),
                secure: parseInt(smtpConfig.port) === 465,
                auth: {
                    user: smtpConfig.user,
                    pass: smtpConfig.pass
                }
            });
        } else {
            return res.status(400).json({ success: false, error: 'Invalid email provider' });
        }

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log('Email transporter verified successfully');
        } catch (verifyError) {
            console.error('Email transporter verification failed:', verifyError.message);
            return res.status(400).json({
                success: false,
                error: 'Email configuration verification failed',
                details: verifyError.message,
                hint: smtpConfig.provider === 'gmail' ?
                    'For Gmail, use an App Password instead of your regular password. Enable 2FA first, then generate an App Password in Google Account settings.' :
                    'Check your email credentials and server settings.'
            });
        }

        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };

        console.log(`Attempting to send email: ${subject}`);

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);

        res.json({ success: true, messageId: result.messageId });
    } catch (error) {
        console.error('Email sending error:', error);

        let errorMessage = error.message;
        let hint = '';

        // Provide specific hints based on common errors
        if (error.message.includes('Invalid login')) {
            hint = 'Invalid email credentials. For Gmail, use an App Password instead of your regular password.';
        } else if (error.message.includes('authentication failed')) {
            hint = 'Authentication failed. Check your email and password/app password.';
        } else if (error.message.includes('ENOTFOUND')) {
            hint = 'Cannot connect to email server. Check your internet connection and SMTP settings.';
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            hint: hint
        });
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