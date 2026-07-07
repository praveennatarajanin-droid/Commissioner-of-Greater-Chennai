const fs = require('fs');
const path = require('path');

// Mock request / response logic by importing helper or hitting local server
// Since dev server is running on localhost:3000, we can run a fetch to local generate-news API!
// If local server is not running or doesn't have route initialized, we can fetch from it.
// Let's perform a direct node fetch.

const sampleArticle = `
New Delhi: The Delhi Police has initiated a detailed investigation into the missing case of Akriti Sutar from Chhatarpur.
According to the investigation officer, Akriti Sutar, a 24-year-old student, was last seen near Chhatarpur Metro Station on June 22, 2026.
Sources confirmed she was wearing a blue dress. Delhi Police is coordinating with local authorities. 
For more details, visit our official updates desk at https://delhipolice.gov.in/news/akriti-missing.
`;

async function testAutofill() {
  try {
    console.log('Sending request to /api/admin/generate-news...');
    const response = await fetch('http://localhost:3000/api/admin/generate-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_en: sampleArticle
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('\n--- Autofill Response Schema Verification ---');
    console.log('Success:', data.success);
    console.log('Source mode:', data.source);
    console.log('Fields count:', Object.keys(data.fields).length);

    const requiredFields = [
      'title_en', 'title_ta', 'category_en', 'category_ta', 'summary_en', 'summary_ta',
      'tags_en', 'tags_ta', 'section', 'author_en', 'author_ta', 'sourceName', 'sourceUrl',
      'date', 'views_count'
    ];

    console.log('\nChecking required fields properties:');
    let hasAll = true;
    for (const f of requiredFields) {
      const val = data.fields[f];
      if (!val) {
        console.error(`✗ Missing field: ${f}`);
        hasAll = false;
      } else {
        console.log(`✓ Field \`${f}\` -> Value: "${JSON.stringify(val.value)}", Confidence: ${val.confidence}%, Derived Quote: "${val.extracted_from}"`);
        
        // Assert confidence type
        if (typeof val.confidence !== 'number') {
          console.error(`✗ Field \`${f}\` confidence is not a number!`);
          hasAll = false;
        }
        // Assert extracted_from exists
        if (val.extracted_from === undefined) {
          console.error(`✗ Field \`${f}\` extracted_from is undefined!`);
          hasAll = false;
        }
      }
    }

    if (hasAll) {
      console.log('\n✓ All news autofill fields matched the expected schema, validation rules, and confidence metrics!');
      process.exit(0);
    } else {
      console.error('\n✗ Some validation assertions failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during autofill API test:', err.message);
    console.log('Note: Ensure the Next.js local server is running on port 3000 to execute integration test.');
    process.exit(1);
  }
}

testAutofill();
