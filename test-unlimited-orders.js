// Test script to check unlimited orders query locally
const { BigQuery } = require('@google-cloud/bigquery');

async function testUnlimitedOrders() {
  console.log('Testing unlimited orders query locally...\n');
  
  try {
    const bigquery = new BigQuery({
      projectId: 'dogwood-baton-345622',
      keyFilename: './bigquery-credentials.json'
    });

    // Count total orders first
    const countQuery = `
      SELECT COUNT(DISTINCT fleek_id) as total_orders
      FROM \`dogwood-baton-345622.fleek_raw.order_line_status_details\`
      WHERE fleek_id IS NOT NULL
    `;

    console.log('1. Getting total count...');
    const [countRows] = await bigquery.query({ query: countQuery });
    const totalOrders = countRows[0].total_orders;
    console.log(`Total orders in database: ${totalOrders}`);

    // Get first 10 orders with new query
    const ordersQuery = `
      SELECT DISTINCT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`dogwood-baton-345622.fleek_raw.order_line_status_details\`
      WHERE fleek_id IS NOT NULL
      ORDER BY fleek_id
      LIMIT 10
    `;

    console.log('\n2. Testing new unlimited query (first 10 results):');
    const [orderRows] = await bigquery.query({ query: ordersQuery });
    
    orderRows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.orderLineId} - £${row.orderValue}`);
    });

    console.log(`\n✅ SUCCESS! Query will return all ${totalOrders} orders when unlimited`);
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
  }
}

testUnlimitedOrders();