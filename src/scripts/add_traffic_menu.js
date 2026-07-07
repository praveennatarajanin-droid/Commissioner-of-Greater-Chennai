const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Read .env.local to get database config
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

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
    console.log('Connected to MySQL database.');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  try {
    // Check if traffic menu already exists
    const [existing] = await connection.query('SELECT * FROM `menus` WHERE `slug` = ?', ['traffic']);
    if (existing.length > 0) {
      console.log('Traffic menu already exists in database. Updating order and fields...');
      await connection.query(
        'UPDATE `menus` SET `name_en` = ?, `name_ta` = ?, `display_order` = ?, `url` = ?, `page_type` = ? WHERE `slug` = ?',
        ['Traffic', 'போக்குவரத்து', 7, '/traffic', 'news_category', 'traffic']
      );
    } else {
      console.log('Inserting Traffic menu into database...');
      // Make room for traffic menu at order_num = 7 by incrementing subsequent menus' order numbers
      await connection.query('UPDATE `menus` SET `display_order` = `display_order` + 1 WHERE `display_order` >= 7');
      
      // Insert traffic menu
      await connection.query(
        'INSERT INTO `menus` (name_en, name_ta, slug, icon, display_order, url, page_type, status, open_in_new_tab) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Traffic', 'போக்குவரத்து', 'traffic', 'Navigation', 7, '/traffic', 'news_category', 'active', 0]
      );
      console.log('Traffic menu successfully inserted.');
    }

    // Double check order of all menus to make sure it is clean and sequentially numbered
    const [menus] = await connection.query('SELECT * FROM `menus` ORDER BY `display_order` ASC');
    let currentOrder = 1;
    for (const m of menus) {
      await connection.query('UPDATE `menus` SET `display_order` = ? WHERE `id` = ?', [currentOrder, m.id]);
      console.log(`Menu [${m.slug}] set to order ${currentOrder}`);
      currentOrder++;
    }

    console.log('Menu database migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error executing menu migration query:', error);
    process.exit(1);
  }
}

main();
