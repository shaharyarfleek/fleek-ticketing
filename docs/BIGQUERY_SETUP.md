# BigQuery Integration Setup

This guide explains how to set up Google BigQuery integration for the ticketing system.

## Prerequisites

1. A Google Cloud Project with BigQuery API enabled
2. A service account with BigQuery Data Viewer permissions
3. A BigQuery dataset with order data

## Setup Instructions

### 1. Create a Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "Create Service Account"
4. Give it a name (e.g., "ticket-system-bigquery")
5. Grant the role "BigQuery Data Viewer"
6. Create and download a JSON key

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit the `.env` file with your BigQuery configuration:

```env
VITE_BIGQUERY_PROJECT_ID=your-project-id
VITE_BIGQUERY_KEY_PATH=/path/to/your/service-account-key.json
VITE_BIGQUERY_DATASET_ID=your_dataset_name
VITE_BIGQUERY_TABLE_ID=your_table_name
```

### 3. BigQuery Table Schema

Your BigQuery table (`fleek_raw.order_line_status_details`) should have the following schema:

| Field Name | Type | Description |
|------------|------|-------------|
| fleek_id | STRING | Unique identifier for the order line |
| total_order_line_amount | FLOAT64 | The monetary value of the order |

### 4. SQL Query Used

The system uses the following query to fetch order data:

```sql
SELECT DISTINCT 
  fleek_id as orderLineId,
  total_order_line_amount as orderValue
FROM fleek_raw.order_line_status_details
LIMIT 1000
```

Note: Currency defaults to 'GBP' as it's not available in the table.

## Testing the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Click "New Ticket" button
3. The order dropdown should show "Loading orders from BigQuery..."
4. Once loaded, you'll see real order data from your BigQuery table
5. Selecting an order will auto-populate the order value and currency

## Troubleshooting

### Connection Issues

If you see "Failed to load orders. Using fallback data.":

1. Check your `.env` file has the correct credentials
2. Verify the service account has BigQuery Data Viewer permissions
3. Ensure the dataset and table names are correct
4. Check the browser console for detailed error messages

### Fallback Behavior

If BigQuery connection fails, the system will use mock data to ensure functionality continues.

## Security Notes

- Never commit your `.env` file or service account keys to version control
- Add `.env` and `*.json` (for service account keys) to your `.gitignore`
- Consider using environment-specific configurations for production