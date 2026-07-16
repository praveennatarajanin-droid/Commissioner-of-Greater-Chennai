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

    const [rows] = await connection.query("SELECT * FROM `commissioner_profile` LIMIT 1");
    console.log('Profile data fields:', Object.keys(rows[0]));
    console.log('Profile photo:', rows[0].photo);
    console.log('Profile timeline:', rows[0].timeline || typeof rows[0].timeline);
    console.log('Profile awards:', rows[0].awards || typeof rows[0].awards);
    console.log('Profile initiatives:', rows[0].initiatives || typeof rows[0].initiatives);
    console.log('Profile gallery:', rows[0].gallery || typeof rows[0].gallery);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}
main();
