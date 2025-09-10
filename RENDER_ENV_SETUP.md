# Render Environment Variables Setup

## Important: BigQuery Configuration

Your BigQuery integration is currently failing because the environment variables are not set in Render. 

### Required Environment Variables

You need to add these environment variables in your Render dashboard:

1. **BIGQUERY_PROJECT_ID**: `dogwood-baton-345622`

2. **BIGQUERY_DATASET_ID**: `fleek_raw`

3. **BIGQUERY_TABLE_ID**: `order_line_status_details`

4. **BIGQUERY_CREDENTIALS**: 
   Copy the entire content of your `bigquery-credentials.json` file as a single line string.

### How to Add Environment Variables in Render

1. Go to your Render dashboard
2. Click on your service (project3-backend-final)
3. Go to the "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable listed above

### For BIGQUERY_CREDENTIALS:

1. Open `bigquery-credentials.json` in a text editor
2. Copy the entire JSON content
3. Paste it as the value for BIGQUERY_CREDENTIALS
4. Make sure it's all on one line (no line breaks)

### Verify Setup

After adding the variables and deploying:

1. Visit: https://fleek-ticketing.onrender.com/debug
2. You should see:
   - projectId: dogwood-baton-345622
   - hasCredentials: true
   - credentialsLength: (should be > 0)

### Test Orders Endpoint

Visit: https://fleek-ticketing.onrender.com/api/orders

You should see a JSON response with orders from BigQuery.

## Troubleshooting

If you still get errors after setting environment variables:

1. Check the Render logs for specific error messages
2. Make sure the credentials JSON is valid (no syntax errors)
3. Verify the service account has access to the BigQuery dataset
4. Ensure there are no extra spaces or line breaks in the credentials