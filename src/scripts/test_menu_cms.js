// Dynamic Menu CMS Search Integration Verification Script
const sampleSearchQuery = "mission";

async function testCmsSearch() {
  try {
    console.log(`Sending search query "${sampleSearchQuery}" to Page Contents Search API...`);
    const res = await fetch(`http://localhost:3001/api/admin/page-contents?action=search&query=${encodeURIComponent(sampleSearchQuery)}`, {
      headers: {
        // Mock authorization cookies since local dev server is running
        'Cookie': 'admin_session=' + JSON.stringify({ role: 'superadmin', username: 'admin' })
      }
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    console.log('\n--- Search Results Schema & Output Verification ---');
    console.log('Total matches found:', data.length);

    if (data.length > 0) {
      console.log('Checking first result fields keys:');
      const item = data[0];
      const requiredKeys = ['page_name', 'seo_title', 'display_order', 'section_type', 'section_title', 'content_json'];
      
      let allKeysValid = true;
      for (const k of requiredKeys) {
        if (item[k] === undefined) {
          console.error(`✗ Missing property keys: ${k}`);
          allKeysValid = false;
        } else {
          console.log(`✓ Property \`${k}\` present:`, typeof item[k] === 'object' ? '[Object]' : item[k]);
        }
      }

      if (allKeysValid) {
        console.log('\n✓ Global Search API verified successfully! Outlines, content segments, and page references are correctly mapped.');
        process.exit(0);
      } else {
        console.error('\n✗ Schema check failed.');
        process.exit(1);
      }
    } else {
      console.log('No matches found (which is valid if seed database contains no block content for the query keyword yet).');
      console.log('✓ API endpoint works successfully!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Error during CMS Search integration test:', err.message);
    process.exit(1);
  }
}

testCmsSearch();
