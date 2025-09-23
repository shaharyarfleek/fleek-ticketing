# Fleek Ticketing Backend - BigQuery Integration

This backend service provides API endpoints for searching orders from Google BigQuery.

## Setup Instructions

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up BigQuery authentication:
   - Option 1: Use Google Cloud SDK (recommended for local dev)
   - Option 2: Download service account key and set BIGQUERY_KEY_FILE in .env

3. Update .env file with your BigQuery details

4. Run the server:
```bash
npm start
# or for development with auto-restart
npm run dev
```

### Deployment on Render

1. Create a new Web Service on Render
2. Connect this repository (backend folder)
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `BIGQUERY_PROJECT_ID`: fleekstore-444315
   - `BIGQUERY_DATASET_ID`: fleek_raw
   - `BIGQUERY_TABLE_ID`: order_line_status_details
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON`: (paste your service account JSON)

### API Endpoints

- `GET /health` - Health check
- `GET /api/search/orders?q=<search>&limit=50` - Search orders
- `GET /api/orders/:orderLineId` - Get single order

### BigQuery Authentication on Render

Since you can't upload files to Render, you need to:

1. Get your service account JSON from Google Cloud Console
2. Add it as an environment variable named `GOOGLE_APPLICATION_CREDENTIALS_JSON`
3. The server will automatically create the credentials file on startup