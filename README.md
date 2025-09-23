# Fleek Ticketing Backend - BigQuery Integration

This is the backend service for the Fleek Ticketing System that provides BigQuery integration for order search functionality.

## Deployment on Render

This branch is specifically for the backend deployment on Render.

### Environment Variables Required:

```
BIGQUERY_PROJECT_ID=fleekstore-444315
BIGQUERY_DATASET_ID=fleek_raw
BIGQUERY_TABLE_ID=order_line_status_details
GOOGLE_APPLICATION_CREDENTIALS_JSON=<your-service-account-json>
```

### To Deploy:

1. In Render dashboard, change the branch from `main` to `backend`
2. Ensure build command is: `npm install`
3. Ensure start command is: `npm start`
4. Add all environment variables listed above

The `GOOGLE_APPLICATION_CREDENTIALS_JSON` should contain your complete Google Cloud service account JSON.