const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 1. Read .env.local to get database config
const envPath = path.join(__dirname, '../../.env.local');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[0].split('=')[0].trim();
      let value = match[0].split('=').slice(1).join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      envConfig[key] = value;
    }
  }
}

const dbHost = envConfig.DB_HOST || '127.0.0.1';
const dbPort = parseInt(envConfig.DB_PORT || '3306', 10);
const dbUser = envConfig.DB_USER || 'root';
const dbPassword = envConfig.DB_PASSWORD || '';
const dbName = envConfig.DB_NAME || 'chennai_guardian';

console.log(`Connecting to MySQL server at ${dbHost}:${dbPort} as ${dbUser}...`);

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });
  } catch (err) {
    console.error('Failed to connect to MySQL server. Please ensure Laragon/MySQL is running.', err);
    process.exit(1);
  }

  try {
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database \`${dbName}\` verified/created.`);
    await connection.query(`USE \`${dbName}\``);

    // Read db.json
    const dbJsonPath = path.join(__dirname, '../data/db.json');
    if (!fs.existsSync(dbJsonPath)) {
      console.error(`Source db.json file not found at ${dbJsonPath}`);
      process.exit(1);
    }
    const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

    // Include contact_messages in dbData if not exists
    if (!dbData.contact_messages) {
      dbData.contact_messages = [];
    }

    const keyMap = {
      users: 'users',
      news: 'news',
      ticker: 'ticker',
      slider: 'slider',
      commissioner_profile: 'commissioner_profile',
      theme_settings: 'theme_settings',
      menu_items: 'menu_items',
      contacts: 'contacts',
      tts_settings: 'tts_settings',
      videos: 'videos',
      alert_settings: 'alert_settings',
      alerts: 'alerts',
      seo_settings: 'seo_settings',
      article_seo: 'article_seo',
      asset_metadata: 'asset_metadata',
      activity_logs: 'activity_logs',
      police_stations: 'police_stations',
      emergency_contacts: 'emergency_contacts',
      department_links: 'department_links',
      service_requests: 'service_requests',
      contact_messages: 'contact_messages'
    };

    // Pre-defined fallback fields for tables that are empty in JSON
    const fallbackFields = {
      service_requests: {
        id: 1,
        applicantName: '',
        mobileNumber: '',
        email: '',
        address: '',
        serviceRequired: '',
        policeStation: '',
        message: '',
        receiptId: '',
        created_at: ''
      },
      contact_messages: {
        id: 1,
        name: '',
        mobile: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        status: 'new',
        created_at: ''
      },
      article_seo: {
        id: 1,
        article_id: 1,
        content_type: '',
        seo_title: '',
        meta_description: '',
        meta_keywords: '',
        seo_slug: '',
        canonical_url: '',
        focus_keyword: '',
        secondary_keywords: '',
        article_tags: '',
        robots: '',
        og_title: '',
        og_description: '',
        og_image: '',
        og_url: '',
        og_type: '',
        twitter_title: '',
        twitter_description: '',
        twitter_image: '',
        twitter_card: '',
        image_alt: '',
        image_caption: '',
        image_title: '',
        image_description: '',
        news_category: '',
        author_name: '',
        schema_json: '',
        hreflang_en: '',
        hreflang_ta: '',
        seo_score: 0,
        updated_at: ''
      }
    };

    for (const [jsonKey, tableName] of Object.entries(keyMap)) {
      const records = dbData[jsonKey] || [];
      
      const allCols = new Set();
      allCols.add('id');

      const recordsToScan = records.length > 0 ? records : [fallbackFields[jsonKey] || { id: 1 }];

      const types = {};
      for (const rec of recordsToScan) {
        if (!rec) continue;
        for (const k of Object.keys(rec)) {
          allCols.add(k);
          if (rec[k] !== undefined && rec[k] !== null) {
            types[k] = typeof rec[k];
          }
        }
      }

      const colDefs = [];
      for (const col of allCols) {
        if (col === 'id') {
          colDefs.push('`id` INT AUTO_INCREMENT PRIMARY KEY');
          continue;
        }

        const type = types[col] || 'string';
        let dbType = 'VARCHAR(255)';

        if (type === 'number') {
          dbType = 'DOUBLE';
        } else if (type === 'boolean') {
          dbType = 'TINYINT(1) DEFAULT 0';
        } else if (type === 'object') {
          dbType = 'LONGTEXT'; 
        } else {
          const colLower = col.toLowerCase();
          const longTextKeys = ['content_en', 'content_ta', 'summary_en', 'summary_ta', 'description', 'message', 'bio_en1', 'bio_en2', 'bio_ta1', 'bio_ta2', 'action', 'schema_json', 'default_keywords', 'site_description', 'meta_description', 'meta_keywords', 'address', 'address_en', 'address_ta', 'landmark', 'jurisdiction_areas', 'google_map_link'];
          if (
            longTextKeys.includes(col) || 
            colLower.includes('url') || 
            colLower.includes('src') || 
            colLower.includes('image') || 
            colLower.includes('path') || 
            colLower.includes('photo')
          ) {
            dbType = 'LONGTEXT';
          }
        }

        colDefs.push(`\`${col}\` ${dbType} NULL`);
      }

      // Drop table first to ensure a clean slate and correct columns
      await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);

      const createTableSql = `CREATE TABLE \`${tableName}\` (
        ${colDefs.join(',\n        ')}
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

      await connection.query(createTableSql);
      console.log(`Table \`${tableName}\` created successfully.`);

      if (records.length > 0) {
        console.log(`Importing ${records.length} records into \`${tableName}\`...`);
        await connection.beginTransaction();

        try {
          for (const record of records) {
            const keys = Object.keys(record).filter(k => allCols.has(k));
            const placeholders = keys.map(() => '?').join(', ');
            const columns = keys.map(k => `\`${k}\``).join(', ');

            const values = keys.map(k => {
              const val = record[k];
              if (val !== null && typeof val === 'object') {
                return JSON.stringify(val);
              }
              return val;
            });

            const insertSql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;
            await connection.query(insertSql, values);
          }
          await connection.commit();
          console.log(`Successfully imported data into \`${tableName}\`.`);
        } catch (err) {
          await connection.rollback();
          console.error(`Failed to import data into \`${tableName}\`. Transaction rolled back.`, err);
          throw err;
        }
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration encountered an error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
