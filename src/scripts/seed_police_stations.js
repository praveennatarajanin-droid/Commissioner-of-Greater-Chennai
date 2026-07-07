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

// 2. Load and parse the TS seed file dynamically
const seedTsPath = path.join(__dirname, '../data/chennai-stations-seed.ts');
if (!fs.existsSync(seedTsPath)) {
  console.error(`Seed file not found at ${seedTsPath}`);
  process.exit(1);
}

let seedContent = fs.readFileSync(seedTsPath, 'utf8');

// Strip interface and export const to make it plain commonjs module
seedContent = seedContent
  .replace(/export interface[\s\S]*?\n\}/, '')
  .replace(': ChennaiStation[]', '')
  .replace('export const CHENNAI_POLICE_STATIONS =', 'module.exports =');

const tempJsPath = path.join(__dirname, './temp_seed.js');
fs.writeFileSync(tempJsPath, seedContent, 'utf8');

const CHENNAI_POLICE_STATIONS = require(tempJsPath);
fs.unlinkSync(tempJsPath); // Clean up temp file

console.log(`Loaded ${CHENNAI_POLICE_STATIONS.length} Chennai police stations from seed file.`);

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
  } catch (err) {
    console.error('Failed to connect to MySQL server:', err);
    process.exit(1);
  }

  try {
    // 3. Make sure all columns exist
    const requiredColumns = {
      area_name: 'VARCHAR(255)',
      locality: 'VARCHAR(255)',
      station_name: 'VARCHAR(255)',
      station_code: 'VARCHAR(255)',
      station_type: 'VARCHAR(255)',
      zone: 'VARCHAR(255)',
      division: 'VARCHAR(255)',
      category: 'VARCHAR(255)',
      address: 'TEXT',
      landmark: 'TEXT',
      pincode: 'VARCHAR(50)',
      alternate_phone: 'VARCHAR(255)',
      latitude: 'DOUBLE',
      longitude: 'DOUBLE',
      inspector_name: 'VARCHAR(255)',
      inspector_mobile: 'VARCHAR(255)',
      station_image: 'VARCHAR(555)',
      working_hours: 'VARCHAR(255)',
      description: 'TEXT',
      jurisdiction_areas: 'TEXT',
      google_map_link: 'TEXT',
      is_active: 'INT DEFAULT 1',
      created_at: 'VARCHAR(100)',
      updated_at: 'VARCHAR(100)'
    };

    const [columnsInfo] = await connection.execute('DESCRIBE `police_stations`');
    const existingColumns = new Set(columnsInfo.map((col) => col.Field));

    for (const [colName, colType] of Object.entries(requiredColumns)) {
      if (!existingColumns.has(colName)) {
        console.log(`Adding missing column \`${colName}\` to \`police_stations\` table.`);
        await connection.execute(`ALTER TABLE \`police_stations\` ADD COLUMN \`${colName}\` ${colType} NULL`);
      }
    }

    // 4. Truncate table
    await connection.execute('DELETE FROM `police_stations`');
    console.log('Cleared existing entries in `police_stations` table.');

    // 5. Seed new entries
    await connection.beginTransaction();
    
    // Valid columns to map parameters correctly
    const [finalColsInfo] = await connection.execute('DESCRIBE `police_stations`');
    const validColumns = new Set(finalColsInfo.map((col) => col.Field));

    for (const station of CHENNAI_POLICE_STATIONS) {
      // Map properties to fit both old schema compatibility and new columns
      const record = {
        id: station.id,
        station_name: station.station_name,
        station_code: station.station_code,
        area_name: station.area_name,
        locality: station.locality,
        zone: station.zone,
        division: station.division,
        category: station.category,
        type: station.type,
        address_en: station.address_en,
        landmark: station.landmark,
        pincode: station.pincode,
        phone: station.phone,
        alternate_phone: station.alternate_phone,
        email: station.email,
        lat: station.lat,
        lng: station.lng,
        latitude: station.lat,
        longitude: station.lng,
        jurisdiction_areas: station.jurisdiction_areas,
        working_hours: station.working_hours,
        is_active: station.is_active,
        
        name_en: station.station_name,
        name_ta: `காவல் நிலையம் - ${station.station_name}`, // generic Tamil translation fallback
        address_ta: station.address_en,
        zone_en: station.zone,
        zone_ta: station.zone,
        division_en: station.division,
        division_ta: station.division,
        hours_en: station.working_hours,
        hours_ta: station.working_hours,
        incharge_en: "Inspector of Police",
        incharge_ta: "காவல் ஆய்வாளர்",
        designation_en: "Inspector of Police (L&O)",
        designation_ta: "காவல் ஆய்வாளர் (சட்டம் & ஒழுங்கு)",
        inspector_name: "Inspector of Police",
        inspector_mobile: "9445466100",
        google_map_link: station.google_map_link || `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`,
        station_image: station.station_image || `/images/stations/station_placeholder.jpg`
      };

      const keys = Object.keys(record).filter(k => validColumns.has(k));
      const columns = keys.map(k => `\`${k}\``).join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => record[k]);

      const sql = `INSERT INTO \`police_stations\` (${columns}) VALUES (${placeholders})`;
      await connection.query(sql, values);
    }

    await connection.commit();
    console.log(`Seeded ${CHENNAI_POLICE_STATIONS.length} police stations successfully into MySQL.`);
    process.exit(0);

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Seeding police stations encountered an error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
