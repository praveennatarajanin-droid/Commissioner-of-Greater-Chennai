const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

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
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName
  });

  try {
    const [menus] = await connection.query('SELECT * FROM `menus` ORDER BY `display_order` ASC');
    console.log('--- MENUS TABLE ---', menus.length);
    console.log(menus.map(m => `${m.display_order}. ${m.name_en} (${m.slug}) - ${m.url}`));

    const [menuItems] = await connection.query('SELECT * FROM `menu_items` ORDER BY `order_num` ASC');
    console.log('\n--- MENU_ITEMS TABLE ---', menuItems.length);
    console.log(menuItems.map(m => `${m.order_num}. ${m.label_en} (${m.href})`));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
