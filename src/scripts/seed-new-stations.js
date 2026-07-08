const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 1. Read .env.local for database config
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

// 2. Load the 77 stations dataset
const stationsDataPath = path.join(__dirname, '../data/chennaiPoliceStations.js');
if (!fs.existsSync(stationsDataPath)) {
  console.error(`Dataset not found at ${stationsDataPath}`);
  process.exit(1);
}
const CHENNAI_POLICE_STATIONS = require(stationsDataPath);

console.log(`Loaded ${CHENNAI_POLICE_STATIONS.length} Chennai police stations from dataset.`);

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
    // 3. Clear table
    await connection.execute('DELETE FROM `police_stations`');
    console.log('Cleared existing entries in `police_stations` table.');

    // 4. Seed 77 new entries
    await connection.beginTransaction();

    const [colsInfo] = await connection.execute('DESCRIBE `police_stations`');
    const validColumns = new Set(colsInfo.map((col) => col.Field));

    for (let i = 0; i < CHENNAI_POLICE_STATIONS.length; i++) {
      const station = CHENNAI_POLICE_STATIONS[i];
      const code = station.stationName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) + i.toString().padStart(2, '0');
      
      const record = {
        id: i + 1,
        station_name: station.stationName,
        station_code: code,
        area_name: station.area,
        locality: station.area,
        zone: station.zone,
        division: station.zone.replace(" Chennai", ""),
        category: "Law & Order",
        station_type: "Law & Order",
        address: station.address,
        phone: station.phone,
        lat: station.latitude,
        lng: station.longitude,
        latitude: station.latitude,
        longitude: station.longitude,
        is_active: 1,
        
        name_en: station.stationName,
        name_ta: `காவல் நிலையம் - ${station.stationName.replace(" Police Station", "")}`,
        address_en: station.address,
        address_ta: station.address,
        zone_en: station.zone,
        zone_ta: station.zone === "South Chennai" ? "தெற்கு சென்னை" : station.zone === "North Chennai" ? "வடக்கு சென்னை" : station.zone === "East Chennai" ? "கிழக்கு சென்னை" : "மேற்கு சென்னை",
        division_en: station.zone.replace(" Chennai", ""),
        division_ta: station.zone.replace(" Chennai", "") === "South" ? "தெற்கு" : station.zone.replace(" Chennai", "") === "North" ? "வடக்கு" : station.zone.replace(" Chennai", "") === "East" ? "கிழக்கு" : "மேற்கு",
        hours_en: "24 Hours Open",
        hours_ta: "24 மணி நேரமும் திறந்திருக்கும்",
        incharge_en: "Inspector of Police",
        incharge_ta: "காவல் ஆய்வாளர்",
        designation_en: "Inspector of Police (L&O)",
        designation_ta: "காவல் ஆய்வாளர் (சட்டம் & ஒழுங்கு)",
        inspector_name: "Inspector of Police",
        inspector_mobile: "9445466100",
        google_map_link: `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`,
        station_image: `/images/stations/station_placeholder.jpg`
      };

      const keys = Object.keys(record).filter(k => validColumns.has(k));
      const columns = keys.map(k => `\`${k}\``).join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => record[k]);

      const sql = `INSERT INTO \`police_stations\` (${columns}) VALUES (${placeholders})`;
      await connection.query(sql, values);
    }

    await connection.commit();
    console.log(`Successfully seeded ${CHENNAI_POLICE_STATIONS.length} police stations into MySQL database.`);
    process.exit(0);

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Seeding new police stations encountered an error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
