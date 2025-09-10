// Simple test script to check if BigQuery credentials are valid
const { BigQuery } = require('@google-cloud/bigquery');

async function testBigQuery() {
  console.log('Testing BigQuery connection with credentials file...\n');
  
  try {
    const bigquery = new BigQuery({
      projectId: 'dogwood-baton-345622',
      keyFilename: './bigquery-credentials.json'
    });

    const query = `
      SELECT DISTINCT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`dogwood-baton-345622.fleek_raw.order_line_status_details\`
      LIMIT 5
    `;

    console.log('Executing test query...');
    
    const [rows] = await bigquery.query({ query });
    
    console.log('\n✅ SUCCESS! BigQuery is working!');
    console.log('Found', rows.length, 'orders:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. Order ID: ${row.orderLineId}, Value: ${row.orderValue}`);
    });
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    
    if (error.message.includes('not found')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Table name might be wrong');
      console.log('   - Dataset name might be wrong'); 
      console.log('   - Project ID might be wrong');
    }
    if (error.message.includes('permission') || error.message.includes('access')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Service account needs BigQuery permissions');
      console.log('   - Credentials file might be invalid');
    }
  }
}

testBigQuery();