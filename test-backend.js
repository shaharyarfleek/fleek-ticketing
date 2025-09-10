// Simple test script to check if BigQuery works locally
const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

async function testBigQuery() {
  console.log('Testing BigQuery connection...\n');
  
  // Test environment variables
  console.log('Environment variables:');
  console.log('- Project ID:', process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID || 'NOT SET');
  console.log('- Dataset ID:', process.env.BIGQUERY_DATASET_ID || process.env.VITE_BIGQUERY_DATASET_ID || 'fleek_raw');
  console.log('- Table ID:', process.env.BIGQUERY_TABLE_ID || process.env.VITE_BIGQUERY_TABLE_ID || 'order_line_status_details');
  console.log('- Has credentials:', !!(process.env.BIGQUERY_CREDENTIALS || process.env.VITE_BIGQUERY_CREDENTIALS));
  console.log('- Credentials file:', './bigquery-credentials.json exists');
  
  try {
    const bigquery = new BigQuery({
      projectId: process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID || 'dogwood-baton-345622',
      keyFilename: './bigquery-credentials.json'
    });

    const datasetId = process.env.BIGQUERY_DATASET_ID || process.env.VITE_BIGQUERY_DATASET_ID || 'fleek_raw';
    const tableId = process.env.BIGQUERY_TABLE_ID || process.env.VITE_BIGQUERY_TABLE_ID || 'order_line_status_details';
    const projectId = process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID || 'dogwood-baton-345622';

    const query = `
      SELECT DISTINCT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`${projectId}.${datasetId}.${tableId}\`
      LIMIT 5
    `;

    console.log('\nExecuting query:');
    console.log(query);
    
    const [rows] = await bigquery.query({ query });
    
    console.log('\n✅ Success! Found', rows.length, 'orders:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. Order ID: ${row.orderLineId}, Value: ${row.orderValue}`);
    });
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
    if (error.message.includes('not found')) {
      console.log('💡 This might be a table/dataset name issue');
    }
    if (error.message.includes('permission')) {
      console.log('💡 This might be a credentials/permissions issue');
    }
  }
}

testBigQuery();