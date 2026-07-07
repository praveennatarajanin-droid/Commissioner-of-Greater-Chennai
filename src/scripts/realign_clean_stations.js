const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const originalList = [{"id":1,"station_name":"Flower Bazaar Police Station","station_code":"C-1"},{"id":2,"station_name":"Flower Bazaar All Women Police Station","station_code":"C-1 AWPS"},{"id":3,"station_name":"George Town Police Station","station_code":"C-2"},{"id":4,"station_name":"Washermanpet Police Station","station_code":"B-1"},{"id":5,"station_name":"Royapuram Police Station","station_code":"B-2"},{"id":6,"station_name":"Tondiarpet Police Station","station_code":"A-1"},{"id":7,"station_name":"Manali Police Station","station_code":"A-2"},{"id":8,"station_name":"Ennore Police Station","station_code":"A-3"},{"id":9,"station_name":"Tiruvottiyur Police Station","station_code":"A-4"},{"id":10,"station_name":"Madhavaram Police Station","station_code":"M-1"},{"id":11,"station_name":"Red Hills Police Station","station_code":"M-2"},{"id":12,"station_name":"Kolathur Police Station","station_code":"M-3"},{"id":13,"station_name":"Villivakkam Police Station","station_code":"M-4"},{"id":14,"station_name":"Vepery Police Station","station_code":"G-1"},{"id":15,"station_name":"Vepery All Women Police Station","station_code":"G-1 AWPS"},{"id":16,"station_name":"Purasawalkam Police Station","station_code":"G-2"},{"id":17,"station_name":"Kilpauk Police Station","station_code":"G-3"},{"id":18,"station_name":"Ayanavaram Police Station","station_code":"F-1"},{"id":19,"station_name":"Perambur Police Station","station_code":"F-2"},{"id":20,"station_name":"Egmore Police Station","station_code":"H-1"},{"id":21,"station_name":"Thousand Lights Police Station","station_code":"H-2"},{"id":22,"station_name":"Nungambakkam Police Station","station_code":"H-3"},{"id":23,"station_name":"Anna Nagar Police Station","station_code":"J-1"},{"id":24,"station_name":"Anna Nagar All Women Police Station","station_code":"J-1 AWPS"},{"id":25,"station_name":"Mogappair Police Station","station_code":"J-2"},{"id":26,"station_name":"Ambattur Police Station","station_code":"K-1"},{"id":27,"station_name":"Ambattur All Women Police Station","station_code":"K-1 AWPS"},{"id":28,"station_name":"Avadi Police Station","station_code":"K-2"},{"id":29,"station_name":"Poonamallee Police Station","station_code":"K-3"},{"id":30,"station_name":"Kundrathur Police Station","station_code":"K-4"},{"id":31,"station_name":"Koyambedu Police Station","station_code":"L-1"},{"id":32,"station_name":"Vadapalani Police Station","station_code":"L-2"},{"id":33,"station_name":"Ashok Nagar Police Station","station_code":"L-3"},{"id":34,"station_name":"Kodambakkam Police Station","station_code":"L-4"},{"id":35,"station_name":"Porur Police Station","station_code":"L-5"},{"id":36,"station_name":"T. Nagar Police Station","station_code":"R-1"},{"id":37,"station_name":"T. Nagar All Women Police Station","station_code":"R-1 AWPS"},{"id":38,"station_name":"West Mambalam Police Station","station_code":"R-2"},{"id":39,"station_name":"Guindy Police Station","station_code":"N-1"},{"id":40,"station_name":"Saidapet Police Station","station_code":"N-2"},{"id":41,"station_name":"K.K. Nagar Police Station","station_code":"N-3"},{"id":42,"station_name":"Tambaram Police Station","station_code":"O-1"},{"id":43,"station_name":"Tambaram All Women Police Station","station_code":"O-1 AWPS"},{"id":44,"station_name":"Chromepet Police Station","station_code":"O-2"},{"id":45,"station_name":"Pallavaram Police Station","station_code":"O-3"},{"id":46,"station_name":"Selaiyur Police Station","station_code":"O-4"},{"id":47,"station_name":"Sembakkam Police Station","station_code":"O-5"},{"id":48,"station_name":"Mylapore Police Station","station_code":"E-1"},{"id":49,"station_name":"Mylapore All Women Police Station","station_code":"E-1 AWPS"},{"id":50,"station_name":"Alwarpet Police Station","station_code":"E-2"},{"id":51,"station_name":"Mandaveli Police Station","station_code":"E-3"},{"id":52,"station_name":"Triplicane Police Station","station_code":"D-1"},{"id":53,"station_name":"Velachery Police Station","station_code":"P-1"},{"id":54,"station_name":"Velachery All Women Police Station","station_code":"P-1 AWPS"},{"id":55,"station_name":"Pallikaranai Police Station","station_code":"P-2"},{"id":56,"station_name":"Medavakkam Police Station","station_code":"P-3"},{"id":57,"station_name":"Madipakkam Police Station","station_code":"P-4"},{"id":58,"station_name":"Keelkattalai Police Station","station_code":"P-5"},{"id":59,"station_name":"Adyar Police Station","station_code":"Q-1"},{"id":60,"station_name":"Adyar All Women Police Station","station_code":"Q-1 AWPS"},{"id":61,"station_name":"Besant Nagar Police Station","station_code":"Q-2"},{"id":62,"station_name":"Thiruvanmiyur Police Station","station_code":"Q-3"},{"id":63,"station_name":"Sholinganallur Police Station","station_code":"Q-4"},{"id":64,"station_name":"Perungudi Police Station","station_code":"Q-5"},{"id":65,"station_name":"Vepery Traffic Police Station","station_code":"G-1 TP"},{"id":66,"station_name":"Central Crime Branch (CCB)","station_code":"CCB"},{"id":67,"station_name":"Cyber Crime Police Station","station_code":"CCPS"},{"id":68,"station_name":"Nandanam Police Station","station_code":"N-4"},{"id":69,"station_name":"Anna Salai Police Station","station_code":"D-2"},{"id":70,"station_name":"Kotturpuram Police Station","station_code":"E-4"},{"id":71,"station_name":"Kalaignar Nagar Police Station","station_code":"P-6"},{"id":72,"station_name":"Perambur All Women Police Station","station_code":"F-2 AWPS"},{"id":73,"station_name":"Otteri Police Station","station_code":"F-3"},{"id":74,"station_name":"Neelankarai Police Station","station_code":"Q-6"},{"id":75,"station_name":"Thoraipakkam Police Station","station_code":"Q-7"},{"id":76,"station_name":"Valasaravakkam Police Station","station_code":"L-6"},{"id":77,"station_name":"Virugambakkam Police Station","station_code":"L-7"},{"id":78,"station_name":"Chetpet Police Station","station_code":"G-4"},{"id":79,"station_name":"Vandalur Police Station","station_code":"O-6"},{"id":80,"station_name":"Perungalathur Police Station","station_code":"O-7"},{"id":81,"station_name":"Royapuram All Women Police Station","station_code":"B-2 AWPS"},{"id":82,"station_name":"Tondiarpet All Women Police Station","station_code":"A-1 AWPS"},{"id":83,"station_name":"Egmore All Women Police Station","station_code":"H-1 AWPS"},{"id":84,"station_name":"Guindy All Women Police Station","station_code":"N-1 AWPS"},{"id":85,"station_name":"Poonamallee All Women Police Station","station_code":"K-3 AWPS"},{"id":86,"station_name":"Meenambakkam Police Station","station_code":"S-2"},{"id":87,"station_name":"Chromepet Police Station","station_code":"S-3"},{"id":88,"station_name":"Tambaram Police Station","station_code":"S-4"},{"id":89,"station_name":"Mylapore Police Station","station_code":"E-1"},{"id":90,"station_name":"Saidapet Police Station","station_code":"J-1"},{"id":91,"station_name":"Velachery Police Station","station_code":"J-2"},{"id":92,"station_name":"T Nagar Police Station","station_code":"R-1"},{"id":93,"station_name":"Adyar Police Station","station_code":"E-3"},{"id":94,"station_name":"Porur Police Station","station_code":"SR-1"},{"id":95,"station_name":"Ambattur Police Station","station_code":"T-1"},{"id":96,"station_name":"Anna Nagar Police Station","station_code":"K-1"},{"id":97,"station_name":"Kodambakkam Police Station","station_code":"R-2"},{"id":98,"station_name":"Nungambakkam Police Station","station_code":"H-2"},{"id":99,"station_name":"Egmore Police Station","station_code":"H-1"},{"id":100,"station_name":"Pallikaranai Police Station","station_code":"S-5"},{"id":101,"station_name":"Medavakkam Police Station","station_code":"S-6"},{"id":102,"station_name":"Avadi Police Station","station_code":"AV-1"},{"id":103,"station_name":"Poonamallee Police Station","station_code":"K-3"}];

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

// 1. Read the 150-stations file, extract details for the original 103 items
const seedContent = fs.readFileSync(seedTsPath, 'utf8');
const stripped = seedContent
  .replace(/export interface[\s\S]*?\n\}/, '')
  .replace(': ChennaiStation[]', '')
  .replace('export const CHENNAI_POLICE_STATIONS =', 'module.exports =');

const tempJsPath = path.join(__dirname, './temp_seed_realign.js');
fs.writeFileSync(tempJsPath, stripped, 'utf8');
const currentSeedStations = require(tempJsPath);
fs.unlinkSync(tempJsPath);

// Restore original details for the first 103 items
const original103 = [];
for (const orig of originalList) {
  // Find detailed match in current seed by ID
  const detailMatch = currentSeedStations.find(s => s.id === orig.id);
  if (detailMatch) {
    const restored = { ...detailMatch };
    restored.station_name = orig.station_name;
    restored.station_code = orig.station_code;
    original103.push(restored);
  } else {
    console.error(`Could not find detail match for ID ${orig.id}`);
  }
}

console.log(`Restored original details for ${original103.length} stations.`);

// Zone mapper
function getZone(code) {
  const first = code.charAt(0).toUpperCase();
  if (["J", "S", "Q", "O", "P"].includes(first)) return "South Zone";
  if (["K", "R", "T", "V"].includes(first)) return "West Zone";
  if (["A", "B", "H", "M", "N"].includes(first)) return "North Zone";
  return "East Zone";
}

let nextId = 104;
const finalStations = [...original103];

let matchedCount = 0;
let addedCount = 0;

for (const u of userList) {
  const uCleanName = u.name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Strictly match by NAME (since names are unique, this avoids code-based mismatching)
  let match = null;
  for (const s of original103) {
    const dbCleanName = s.station_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (dbCleanName.includes(uCleanName) || uCleanName.includes(dbCleanName)) {
      match = s;
      break;
    }
  }

  if (match) {
    // Update matched station code
    match.station_code = u.code;
    matchedCount++;
  } else {
    // Create a new station
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
    
    const latOffset = ((nextId % 10) - 5) * 0.012;
    const lngOffset = ((nextId % 7) - 3) * 0.012;
    
    const newStation = {
      id: nextId++,
      station_name: stationName,
      station_code: u.code,
      area_name: u.name,
      locality: u.name,
      zone: zoneName,
      division: u.name,
      category: "Law & Order",
      type: "Law & Order",
      address_en: `${u.name} Road, ${u.name}, Chennai - 600007`,
      landmark: `Near ${u.name} Landmark`,
      pincode: "600007",
      phone: `044-23452${Math.floor(100 + Math.random() * 900)}`,
      alternate_phone: "9445466100",
      email: `${u.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ps@gcp.tn.gov.in`,
      lat: parseFloat((13.0827 + latOffset).toFixed(4)),
      lng: parseFloat((80.2707 + lngOffset).toFixed(4)),
      jurisdiction_areas: `${u.name} and surrounding areas`,
      working_hours: "24 Hours / 7 Days",
      is_active: 1
    };
    
    finalStations.push(newStation);
    addedCount++;
  }
}

console.log(`Re-alignment completed: matched & updated ${matchedCount}, added new ${addedCount}.`);
console.log(`Total final stations list: ${finalStations.length}`);

// Write updated data back to TS seed file
const newSeedContent = `/**
 * Chennai Police Stations - Aligned & Expanded Dataset
 * Automatically generated by realign_clean_stations.js
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
  station_image?: string;
}

export const CHENNAI_POLICE_STATIONS: ChennaiStation[] = ${JSON.stringify(finalStations, null, 2)};
`;

fs.writeFileSync(seedTsPath, newSeedContent, 'utf8');
console.log(`Successfully rewrote ${seedTsPath}.`);

// Re-run the seeding script to update the MySQL database
console.log("Re-seeding database...");
try {
  const result = execSync('node src/scripts/seed_police_stations.js', { encoding: 'utf8' });
  console.log(result);
  console.log("Database seeded successfully!");
} catch (err) {
  console.error("Seeding database failed:", err.message);
  process.exit(1);
}
