# BigQuery Backend API

This Express.js backend provides API endpoints to query Google BigQuery for order data.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   The backend uses the same `.env` file as the frontend with BigQuery credentials.

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Get All Orders
- **GET** `/api/orders`
- Returns up to 1000 order line IDs with values from BigQuery
- Response format:
  ```json
  {
    "success": true,
    "data": [
      {
        "orderLineId": "FL-2024-1234",
        "orderValue": 299.99,
        "currency": "GBP"
      }
    ],
    "count": 100
  }
  ```

### Get Order Details
- **GET** `/api/orders/:orderLineId`
- Returns details for a specific order
- Response format:
  ```json
  {
    "success": true,
    "data": {
      "orderLineId": "FL-2024-1234",
      "orderValue": 299.99,
      "currency": "GBP"
    }
  }
  ```

## BigQuery Query

The backend queries the `fleek_raw.order_line_status_details` table:
```sql
SELECT DISTINCT 
  fleek_id as orderLineId,
  total_order_line_amount as orderValue
FROM fleek_raw.order_line_status_details
```

## Port Configuration

- Default port: 3001
- Can be changed via `PORT` environment variable

## CORS

CORS is enabled to allow requests from the frontend (default: all origins).
For production, update the CORS configuration in `src/index.ts`.