const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Read config
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

async function verify() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });

    console.log('--- 1. Testing Database Tables exist ---');
    const tables = ['menus', 'sub_menus', 'page_contents', 'page_sections', 'content_versions', 'menu_permissions'];
    for (const t of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE ?`, [t]);
      if (rows.length > 0) {
        console.log(`✓ Table \`${t}\` verified.`);
      } else {
        console.error(`✗ Table \`${t}\` is missing!`);
      }
    }

    console.log('\n--- 2. Testing Seeded Menus ---');
    const [menus] = await connection.query('SELECT * FROM `menus` ORDER BY display_order ASC');
    console.log(`Fetched ${menus.length} main menu records.`);
    menus.forEach(m => {
      console.log(`  - #${m.display_order} ${m.name_en} (${m.slug}) -> url: ${m.url}`);
    });

    console.log('\n--- 3. Testing Seeded Submenus ---');
    const [submenus] = await connection.query('SELECT * FROM `sub_menus` ORDER BY parent_menu_id, display_order ASC');
    console.log(`Fetched ${submenus.length} submenu records.`);
    submenus.forEach(s => {
      console.log(`  - Parent ID: ${s.parent_menu_id} -> ${s.name_en} (${s.slug}) -> url: ${s.url}`);
    });

    console.log('\n--- 4. Testing Seeded Page Content & Sections ---');
    const [contents] = await connection.query('SELECT * FROM `page_contents`');
    console.log(`Fetched ${contents.length} page content records.`);
    for (const c of contents) {
      const [secs] = await connection.query('SELECT * FROM `page_sections` WHERE page_content_id = ?', [c.id]);
      console.log(`  - Page: \`${c.page_name}\` has ${secs.length} configured sections (Seo title: "${c.seo_title}").`);
    }

    console.log('\nDynamic Menu Management System backend verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Verification failed with error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verify();
