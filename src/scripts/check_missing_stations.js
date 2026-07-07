const mysql = require('mysql2/promise');

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

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'chennai_guardian'
  });

  const [dbStations] = await connection.query('select * from police_stations');
  
  const dbByName = new Map();
  const dbByCode = new Map();
  
  for (const s of dbStations) {
    const cleanName = s.station_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    dbByName.set(cleanName, s);
    const cleanCode = s.station_code.toLowerCase().replace(/[^a-z0-9]/g, '');
    dbByCode.set(cleanCode, s);
  }

  const missing = [];
  const matched = [];

  for (const s of userList) {
    const uCleanName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const uCleanCode = s.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let match = dbByName.get(uCleanName) || dbByCode.get(uCleanCode);
    if (!match) {
      // try matching name substring
      for (const [name, val] of dbByName.entries()) {
        if (name.includes(uCleanName) || uCleanName.includes(name)) {
          match = val;
          break;
        }
      }
    }

    if (match) {
      matched.push({ user: s, db: match });
    } else {
      missing.push(s);
    }
  }

  console.log(`Matched: ${matched.length}, Missing: ${missing.length}`);
  console.log('Missing Stations:', JSON.stringify(missing, null, 2));

  await connection.end();
}

main().catch(console.error);
