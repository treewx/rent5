# Rent Property Manager - Akahu Integration

A web application to manage rental properties and automatically check rent payments using Akahu's banking API.

## Features

- **Akahu Integration**: Connect to your bank accounts via Akahu API
- **Property Management**: Add and manage rental properties with tenant details
- **Automatic Rent Checks**: Schedule checks to run the day after rent is due
- **Real-time Monitoring**: Watch rent checks execute with detailed step-by-step progress
- **Transaction Matching**: Automatically match bank transactions to rental payments using keywords
- **History Tracking**: Complete history of all rent checks with results

## Deployment on Railway

### Quick Deploy to Railway

1. **Push to GitHub**
   - Create a new repository on GitHub
   - Push all files (`index.html`, `server.js`, `package.json`) to the repo

2. **Deploy to Railway**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub account
   - Create a new project and select your repository
   - Railway will automatically detect it's a Node.js app and deploy it

3. **Access Your App**
   - Railway will provide a URL like `https://your-app-name.railway.app`
   - Visit that URL to use your rent manager

### Manual Railway Setup

If you prefer manual setup:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy**
   ```bash
   railway init
   railway deploy
   ```

### Why Railway?

- **Zero Configuration**: Railway automatically detects Node.js apps
- **Free Tier**: Perfect for personal projects
- **Automatic HTTPS**: Your app gets SSL certificates automatically
- **Easy Scaling**: Can handle increased traffic as needed

### Local Development

For local testing:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access Locally**
   Open: `http://localhost:3000`

### Why We Need a Server

The Akahu API doesn't allow direct browser requests due to CORS security policies. The Node.js server acts as a proxy between your browser and the Akahu API.

## Configuration

1. **Get Akahu Tokens**
   - Sign up at [Akahu Developer Portal](https://developers.akahu.io/)
   - Create an app to get your App Token
   - Follow the OAuth flow to get a User Token

2. **Configure in Application**
   - Enter your `AKAHU_APP_TOKEN`
   - Enter your `AKAHU_USER_TOKEN`
   - Click "Test Connection" to verify

## Usage

### Adding Properties
1. Go to the Properties tab
2. Fill in property details:
   - Property Address
   - Rent Amount
   - Rent Frequency (weekly/fortnightly/monthly)
   - Tenant Name
   - Rent Due Day
   - Transaction Keyword (for matching bank transactions)

### Rent Checks
1. Rent checks automatically run the day after rent is due
2. Manual checks can be triggered with "Run Rent Check Now"
3. View detailed progress on the Rent Checks tab
4. Each check shows:
   - API connection status
   - Accounts and transactions retrieved
   - Keyword matching results
   - Payment analysis
   - Final report with transaction details

### Transaction Matching
The system matches transactions using:
- **Keyword matching**: Finds transactions containing your specified keywords
- **Amount matching**: Matches amounts within 5% tolerance of expected rent
- **Direction**: Only considers incoming payments (positive amounts)
- **Date range**: Searches last 30 days of transactions

## API Endpoints

The server provides proxy endpoints for Akahu API:
- `GET /api/akahu/me` - User information
- `GET /api/akahu/accounts` - Bank accounts
- `GET /api/akahu/accounts/{id}/transactions` - Account transactions

## File Structure

```
rent5/
├── index.html          # Main application interface
├── server.js           # Node.js proxy server
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Development

To run in development mode:
```bash
npm run dev
```

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure you're accessing the application through the Node.js server (`http://localhost:3000`) and not opening the HTML file directly.

### API Connection Issues
1. Verify your Akahu tokens are correct
2. Check that your User Token has the necessary permissions
3. Ensure your Akahu app is properly configured

### No Transactions Found
1. Check that your keywords match transaction descriptions
2. Verify the date range includes recent rent payments
3. Confirm transactions are incoming payments (positive amounts)
4. Adjust the 5% tolerance if needed

## Security Notes

- Never commit your Akahu tokens to version control
- The application stores tokens in browser localStorage only
- All API requests are proxied through the server for security
- Tokens are only sent to the Akahu API, never to external services