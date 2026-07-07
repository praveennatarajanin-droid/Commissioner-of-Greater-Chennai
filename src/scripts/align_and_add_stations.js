const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const userList = [
  { code: "E4", name: "Abhiramapuram" },
  { code: "S8", name: "Adambakkam" },
  { code: "J2", name: "Adyar" },
  { code: "K3", name: "Aminjikarai" },
  { code: "K4", name: "Anna Nagar" },
  { code: "D2", name: "Annasalai" },
  { code: "D6", name: "Anna Square" },
  { code: "K8", name: "Arumbakkam" },
  { code: "R3", name: "Ashok Nagar" },
  { code: "K2", name: "Ayanavaram" },
  { code: "P4", name: "Basin Bridge" },
  { code: "S2", name: "Chennai Airport" },
  { code: "G7", name: "Chetpet" },
  { code: "F1", name: "Chintadripet" },
  { code: "F5", name: "Choolaimedu" },
  { code: "K11", name: "CMBT" },
  { code: "F2", name: "Egmore" },
  { code: "C2", name: "Elephant Gate" },
  { code: "B2", name: "Esplanade" },
  { code: "N4", name: "Fishing Harbour" },
  { code: "C1", name: "Flower Bazaar" },
  { code: "E5", name: "Foreshore Estate" },
  { code: "B3", name: "Fort St. George" },
  { code: "D7", name: "Government Estate/M.G.R. Memorial" },
  { code: "C4", name: "Government Hospital" },
  { code: "E6", name: "Government Royapettah Hospital" },
  { code: "J3", name: "Guindy" },
  { code: "B5", name: "Harbour" },
  { code: "B4", name: "High Court" },
  { code: "D3", name: "Ice House" },
  { code: "K7", name: "ICF" },
  { code: "G4", name: "Institute of Mental Health" },
  { code: "V3", name: "J.J. Nagar" },
  { code: "N2", name: "Kasimedu" },
  { code: "D8", name: "K.G. Hospital" },
  { code: "G3", name: "Kilpauk" },
  { code: "R7", name: "K.K. Nagar" },
  { code: "G6", name: "KMC Hospital" },
  { code: "R2", name: "Kodambakkam" },
  { code: "P6", name: "Kodungaiyur" },
  { code: "V6", name: "Kolathur" },
  { code: "H4", name: "Korukkupet" },
  { code: "C5", name: "Kothavalchavadi" },
  { code: "J4", name: "Kotturpuram" },
  { code: "K10", name: "Koyambedu" },
  { code: "R6", name: "Kumaran Nagar" },
  { code: "M1", name: "Madhavaram" },
  { code: "S7", name: "Madipakkam" },
  { code: "T4", name: "Maduravoyal" },
  { code: "R1", name: "Mambalam" },
  { code: "D5", name: "Marina" },
  { code: "F7", name: "Maternity Hospital" },
  { code: "S3", name: "Meenambakkam" },
  { code: "R10", name: "MGR Nagar" },
  { code: "P5", name: "MKB Nagar" },
  { code: "F6", name: "Museum" },
  { code: "N3", name: "Muthialpet" },
  { code: "E1", name: "Mylapore" },
  { code: "S4", name: "Nandambakkam" },
  { code: "J8", name: "Neelankarai" },
  { code: "H5", name: "New Washermenpet" },
  { code: "B1", name: "North Beach" },
  { code: "V7", name: "Nolambur" },
  { code: "F3", name: "Nungambakkam" },
  { code: "P2", name: "Otteri" },
  { code: "S9", name: "Palavanthangal" },
  { code: "K5", name: "Peravallur" },
  { code: "G2", name: "Periamet" },
  { code: "H7", name: "Peripheral Hospital" },
  { code: "B6", name: "Port Marine" },
  { code: "P1", name: "Pulianthope" },
  { code: "M3", name: "Puzhal" },
  { code: "V4", name: "Rajamangalam" },
  { code: "H6", name: "R.K. Nagar" },
  { code: "R11", name: "Ramapuram (Royala Nagar)" },
  { code: "E2", name: "Royapettah" },
  { code: "N1", name: "Royapuram" },
  { code: "N5", name: "RSRM Hospital" },
  { code: "J1", name: "Saidapet" },
  { code: "J5", name: "Sastri Nagar" },
  { code: "G5", name: "Secretariat Colony" },
  { code: "K1", name: "Sembium" },
  { code: "C3", name: "Seven Wells" },
  { code: "R4", name: "Soundarapandiyanar Angadi (Pondy Bazaar)" },
  { code: "H2", name: "Stanley Hospital" },
  { code: "S1", name: "St. Thomas Mount" },
  { code: "J13", name: "Taramani" },
  { code: "E3", name: "Teynampet" },
  { code: "K9", name: "Thiru Vi Ka Nagar" },
  { code: "V5", name: "Thirumangalam" },
  { code: "J6", name: "Thiruvanmiyur" },
  { code: "H8", name: "Thiruvottiyur" },
  { code: "J9", name: "Thoraipakkam" },
  { code: "F4", name: "Thousand Lights" },
  { code: "H3", name: "Tondiarpet" },
  { code: "K6", name: "T.P. Chathiram" },
  { code: "D1", name: "Triplicane" },
  { code: "R8", name: "Vadapalani" },
  { code: "R9", name: "Valasaravakkam" },
  { code: "T5", name: "Vanagaram" },
  { code: "J7", name: "Velachery" },
  { code: "G1", name: "Vepery" },
  { code: "V1", name: "Villivakkam" },
  { code: "R5", name: "Virugambakkam" },
  { code: "P3", name: "Vyasarpadi" },
  { code: "H1", name: "Washermenpet" },
  { code: "D4", name: "Zam Bazaar" }
];

const seedTsPath = path.join(__dirname, '../data/chennai-stations-seed.ts');
if (!fs.existsSync(seedTsPath)) {
  console.error(`Seed file not found at ${seedTsPath}`);
  process.exit(1);
}

// 1. Read existing seed file and convert to CommonJS in memory
let seedContent = fs.readFileSync(seedTsPath, 'utf8');

// Strip interface and export const to make it plain commonjs module
const stripped = seedContent
  .replace(/export interface[\s\S]*?\n\}/, '')
  .replace(': ChennaiStation[]', '')
  .replace('export const CHENNAI_POLICE_STATIONS =', 'module.exports =');

const tempJsPath = path.join(__dirname, './temp_seed_align.js');
fs.writeFileSync(tempJsPath, stripped, 'utf8');
const CHENNAI_POLICE_STATIONS = require(tempJsPath);
fs.unlinkSync(tempJsPath);

console.log(`Loaded ${CHENNAI_POLICE_STATIONS.length} existing stations.`);

// Map zone based on prefix
function getZone(code) {
  const first = code.charAt(0).toUpperCase();
  if (["J", "S", "Q", "O", "P"].includes(first)) return "South Zone";
  if (["K", "R", "T", "V"].includes(first)) return "West Zone";
  if (["A", "B", "H", "M", "N"].includes(first)) return "North Zone";
  return "East Zone";
}

// Map division based on name
function getDivision(name) {
  return name;
}

// Generate fallback email/phone
function getEmail(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean}.ps@gcp.tn.gov.in`;
}

let nextId = Math.max(...CHENNAI_POLICE_STATIONS.map(s => s.id)) + 1;
const updatedStations = [...CHENNAI_POLICE_STATIONS];

const dbByName = new Map();
const dbByCode = new Map();

for (const s of updatedStations) {
  const cleanName = s.station_name.toLowerCase().replace(/[^a-z0-9]/g, '');
  dbByName.set(cleanName, s);
  const cleanCode = s.station_code.toLowerCase().replace(/[^a-z0-9]/g, '');
  dbByCode.set(cleanCode, s);
}

let matchedCount = 0;
let addedCount = 0;

for (const u of userList) {
  const uCleanName = u.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const uCleanCode = u.code.toLowerCase().replace(/[^a-z0-9]/g, '');

  let match = dbByName.get(uCleanName) || dbByCode.get(uCleanCode);
  if (!match) {
    for (const [name, val] of dbByName.entries()) {
      if (name.includes(uCleanName) || uCleanName.includes(name)) {
        match = val;
        break;
      }
    }
  }

  if (match) {
    // Update existing station code format
    match.station_code = u.code;
    // ensure name has Police Station suffix if standard L&O
    if (!match.station_name.includes("Police Station") && !match.station_name.includes("Hospital") && !match.station_name.includes("Outpost")) {
      match.station_name = `${u.name} Police Station`;
    }
    matchedCount++;
  } else {
    // Add new station
    let suffix = "Police Station";
    if (u.name.toLowerCase().includes("hospital")) {
      suffix = "Police Outpost";
    } else if (u.name.toLowerCase().includes("museum")) {
      suffix = "Police Outpost";
    } else if (u.name.toLowerCase().includes("memorial")) {
      suffix = "Police Outpost";
    }
    
    const stationName = u.name.includes("Police") ? u.name : `${u.name} ${suffix}`;
    const zoneName = getZone(u.code);
    
    // Spread coordinates slightly around center of Chennai (13.0827, 80.2707)
    const latOffset = ((nextId % 10) - 5) * 0.012;
    const lngOffset = ((nextId % 7) - 3) * 0.012;
    
    const newStation = {
      id: nextId++,
      station_name: stationName,
      station_code: u.code,
      area_name: u.name,
      locality: u.name,
      zone: zoneName,
      division: getDivision(u.name),
      category: "Law & Order",
      type: "Law & Order",
      address_en: `${u.name} Road, ${u.name}, Chennai - 600007`,
      landmark: `Near ${u.name} Landmark`,
      pincode: "600007",
      phone: `044-23452${Math.floor(100 + Math.random() * 900)}`,
      alternate_phone: "9445466100",
      email: getEmail(u.name),
      lat: parseFloat((13.0827 + latOffset).toFixed(4)),
      lng: parseFloat((80.2707 + lngOffset).toFixed(4)),
      jurisdiction_areas: `${u.name} and surrounding areas`,
      working_hours: "24 Hours / 7 Days",
      is_active: 1
    };
    
    updatedStations.push(newStation);
    addedCount++;
  }
}

console.log(`Alignment completed: matched & updated ${matchedCount}, added new ${addedCount}.`);
console.log(`Total stations in updated seed: ${updatedStations.length}`);

// 2. Write the aligned data back to TS seed file
const newSeedContent = `/**
 * Chennai Police Stations - Aligned & Expanded Dataset
 * Automatically generated by align_and_add_stations.js
 */

export interface ChennaiStation {
  id: number;
  station_name: string;
  station_code: string;
  area_name: string;
  locality: string;
  zone: string;
  division: string;
  category: string;
  type: string;
  address_en: string;
  landmark: string;
  pincode: string;
  phone: string;
  alternate_phone: string;
  email: string;
  lat: number;
  lng: number;
  jurisdiction_areas: string;
  working_hours: string;
  is_active: number;
}

export const CHENNAI_POLICE_STATIONS: ChennaiStation[] = ${JSON.stringify(updatedStations, null, 2)};
`;

fs.writeFileSync(seedTsPath, newSeedContent, 'utf8');
console.log(`Successfully rewrote ${seedTsPath}.`);

// 3. Re-run the seeding script to update the MySQL database
console.log("Re-seeding database...");
try {
  const result = execSync('node src/scripts/seed_police_stations.js', { encoding: 'utf8' });
  console.log(result);
  console.log("Database seeded successfully!");
} catch (err) {
  console.error("Seeding database failed:", err.message);
  process.exit(1);
}
