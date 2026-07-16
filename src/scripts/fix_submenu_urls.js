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
    console.log('Connected to database to update sub_menus URLs.');

    const updates = [
      ['/category/wanted-criminals', 'wanted-criminals'],
      ['/category/missing-persons', 'missing-persons'],
      ['/category/cyber-awareness', 'cyber-awareness'],
      ['/category/online-fraud', 'online-fraud'],
      ['/category/pink-patrol', 'pink-patrol'],
      ['/category/aval-support', 'aval-support'],
      ['/category/women-helpline', 'women-helpline']
    ];

    for (const [url, slug] of updates) {
      const [result] = await connection.query(
        'UPDATE `sub_menus` SET url = ? WHERE slug = ?',
        [url, slug]
      );
      console.log(`Updated sub_menu slug: ${slug} -> url: ${url} (affectedRows: ${result.affectedRows})`);
    }

    console.log('Finished updating sub_menus URLs.');
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    if (connection) await connection.end();
  }
}

main();
