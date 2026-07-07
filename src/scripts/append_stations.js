const fs = require('fs');
const path = require('path');

const seedTsPath = path.join(__dirname, '../data/chennai-stations-seed.ts');
if (!fs.existsSync(seedTsPath)) {
  console.error(`Seed file not found at ${seedTsPath}`);
  process.exit(1);
}

let content = fs.readFileSync(seedTsPath, 'utf8');

// Check if Meenambakkam is already in the file to avoid duplicate appends
if (content.includes("Meenambakkam Police Station")) {
  console.log("Stations already appended to seed file.");
  process.exit(0);
}

// Find the last index before the closing bracket '];'
const lastClosingBracket = content.lastIndexOf('];');
if (lastClosingBracket === -1) {
  console.error("Could not find closing bracket in seed file.");
  process.exit(1);
}

const additionalStations = `
  // ═══════════════════════════ ADDED OUTSTANDING STATIONS ═══════════════════════════
  {
    id: 86, station_name: "Meenambakkam Police Station", station_code: "S-2",
    area_name: "Meenambakkam", locality: "Meenambakkam",
    zone: "South Zone", division: "Meenambakkam", category: "Law & Order", type: "Law & Order",
    address_en: "GST Road, Meenambakkam, Chennai - 600027", landmark: "Near Chennai International Airport",
    pincode: "600027", phone: "044-22560300", alternate_phone: "", email: "meenambakkam.ps@gcp.tn.gov.in",
    lat: 12.9856, lng: 80.1782,
    jurisdiction_areas: "Meenambakkam, Airport Premises, Cantonment Area, GST Road, Meenambakkam Metro",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 87, station_name: "Chromepet Police Station", station_code: "S-3",
    area_name: "Chromepet", locality: "Chromepet",
    zone: "South Zone", division: "Tambaram", category: "Law & Order", type: "Law & Order",
    address_en: "GST Road, Chromepet, Chennai - 600044", landmark: "Near MIT Campus, Chromepet Railway Station",
    pincode: "600044", phone: "044-22418500", alternate_phone: "", email: "chromepet.ps@gcp.tn.gov.in",
    lat: 12.9516, lng: 80.1408,
    jurisdiction_areas: "Chromepet, MIT Campus, Nehru Nagar, Hasthinapuram, Radha Nagar",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 88, station_name: "Tambaram Police Station", station_code: "S-4",
    area_name: "Tambaram", locality: "Tambaram",
    zone: "South Zone", division: "Tambaram", category: "Law & Order", type: "Law & Order",
    address_en: "GST Road, Tambaram, Chennai - 600045", landmark: "Near Tambaram Railway Station",
    pincode: "600045", phone: "044-22260500", alternate_phone: "", email: "tambaram.ps@gcp.tn.gov.in",
    lat: 12.9249, lng: 80.1197,
    jurisdiction_areas: "Tambaram, East Tambaram, West Tambaram, Selaiyur, Irumbuliyur",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 89, station_name: "Mylapore Police Station", station_code: "E-1",
    area_name: "Mylapore", locality: "Mylapore",
    zone: "South Zone", division: "Mylapore", category: "Law & Order", type: "Law & Order",
    address_en: "Kutchery Road, Mylapore, Chennai - 600004", landmark: "Near Kapaleeshwarar Temple",
    pincode: "600004", phone: "044-23452602", alternate_phone: "", email: "mylapore.ps@gcp.tn.gov.in",
    lat: 13.0333, lng: 80.2690,
    jurisdiction_areas: "Mylapore, Kapaleeshwarar Temple Road, Kutchery Road, Luz Corner, Mandaveli",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 90, station_name: "Saidapet Police Station", station_code: "J-1",
    area_name: "Saidapet", locality: "Saidapet",
    zone: "South Zone", division: "Guindy", category: "Law & Order", type: "Law & Order",
    address_en: "Jeanis Road, Saidapet, Chennai - 600015", landmark: "Near Saidapet Court",
    pincode: "600015", phone: "044-23452640", alternate_phone: "", email: "saidapet.ps@gcp.tn.gov.in",
    lat: 13.0210, lng: 80.2230,
    jurisdiction_areas: "Saidapet, Jeanis Road, West Saidapet, Jones Road, Maraimalai Adigal Bridge",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 91, station_name: "Velachery Police Station", station_code: "J-2",
    area_name: "Velachery", locality: "Velachery",
    zone: "South Zone", division: "Velachery", category: "Law & Order", type: "Law & Order",
    address_en: "Velachery Main Road, Velachery, Chennai - 600042", landmark: "Near Phoenix Marketcity",
    pincode: "600042", phone: "044-23452644", alternate_phone: "", email: "velachery.ps@gcp.tn.gov.in",
    lat: 12.9801, lng: 80.2228,
    jurisdiction_areas: "Velachery, Phoenix Mall Area, Taramani Road, Velachery Bypass, Baby Nagar",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 92, station_name: "T Nagar Police Station", station_code: "R-1",
    area_name: "T Nagar", locality: "T Nagar",
    zone: "South Zone", division: "T Nagar", category: "Law & Order", type: "Law & Order",
    address_en: "Madley Road, T Nagar, Chennai - 600017", landmark: "Near T Nagar Bus Terminus, Madley Subway",
    pincode: "600017", phone: "044-23452655", alternate_phone: "", email: "tnagar.ps@gcp.tn.gov.in",
    lat: 13.0401, lng: 80.2335,
    jurisdiction_areas: "T Nagar, Pondy Bazaar, Madley Road, Usman Road, Panagal Park",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 93, station_name: "Adyar Police Station", station_code: "E-3",
    area_name: "Adyar", locality: "Adyar",
    zone: "South Zone", division: "Adyar", category: "Law & Order", type: "Law & Order",
    address_en: "Sardar Patel Road, Adyar, Chennai - 600020", landmark: "Near Adyar Depot, Cancer Institute",
    pincode: "600020", phone: "044-23452622", alternate_phone: "", email: "adyar.ps@gcp.tn.gov.in",
    lat: 13.0064, lng: 80.2570,
    jurisdiction_areas: "Adyar, Gandhi Nagar, Kasturba Nagar, Indira Nagar, Besant Nagar, Shastri Nagar",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 94, station_name: "Porur Police Station", station_code: "SR-1",
    area_name: "Porur", locality: "Porur",
    zone: "West Zone", division: "Koyambedu", category: "Law & Order", type: "Law & Order",
    address_en: "Mount Poonamallee Road, Porur, Chennai - 600116", landmark: "Near Porur Junction, SRMC Hospital",
    pincode: "600116", phone: "044-24768300", alternate_phone: "", email: "porur.ps@gcp.tn.gov.in",
    lat: 13.0381, lng: 80.1561,
    jurisdiction_areas: "Porur, Porur Junction, Mount Poonamallee Road, Mugalivakkam, Ramapuram, Iyyappanthanthal",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 95, station_name: "Ambattur Police Station", station_code: "T-1",
    area_name: "Ambattur", locality: "Ambattur",
    zone: "West Zone", division: "Ambattur", category: "Law & Order", type: "Law & Order",
    address_en: "Ambattur Redhills Road, Ambattur, Chennai - 600053", landmark: "Near Ambattur OT, Railway Station",
    pincode: "600053", phone: "044-26572500", alternate_phone: "", email: "ambattur.ps@gcp.tn.gov.in",
    lat: 13.1147, lng: 80.1549,
    jurisdiction_areas: "Ambattur, Ambattur OT, Industrial Estate, Padi, Korattur, Menambedu",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 96, station_name: "Anna Nagar Police Station", station_code: "K-1",
    area_name: "Anna Nagar", locality: "Anna Nagar",
    zone: "West Zone", division: "Anna Nagar", category: "Law & Order", type: "Law & Order",
    address_en: "2nd Avenue, Anna Nagar, Chennai - 600040", landmark: "Near Anna Nagar Tower Park",
    pincode: "600040", phone: "044-23452501", alternate_phone: "", email: "annanagar.ps@gcp.tn.gov.in",
    lat: 13.0850, lng: 80.2101,
    jurisdiction_areas: "Anna Nagar, Tower Park Area, 2nd Avenue, Shanthi Colony, Thirumangalam, Mogappair",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 97, station_name: "Kodambakkam Police Station", station_code: "R-2",
    area_name: "Kodambakkam", locality: "Kodambakkam",
    zone: "South Zone", division: "T Nagar", category: "Law & Order", type: "Law & Order",
    address_en: "Station Road, Kodambakkam, Chennai - 600024", landmark: "Near Kodambakkam Railway Station, Madley Subway",
    pincode: "600024", phone: "044-23452658", alternate_phone: "", email: "kodambakkam.ps@gcp.tn.gov.in",
    lat: 13.0483, lng: 80.2227,
    jurisdiction_areas: "Kodambakkam, Liberty Junction, Choolaimedu, Trustpuram, Vadapalani boundary",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 98, station_name: "Nungambakkam Police Station", station_code: "H-2",
    area_name: "Nungambakkam", locality: "Nungambakkam",
    zone: "North West Zone", division: "Egmore", category: "Law & Order", type: "Law & Order",
    address_en: "Nungambakkam High Road, Nungambakkam, Chennai - 600034", landmark: "Near Loyola College",
    pincode: "600034", phone: "044-23452618", alternate_phone: "", email: "nungambakkam.ps@gcp.tn.gov.in",
    lat: 13.0620, lng: 80.2422,
    jurisdiction_areas: "Nungambakkam, Loyola College Area, Nungambakkam High Road, Haddows Road, College Road",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 99, station_name: "Egmore Police Station", station_code: "H-1",
    area_name: "Egmore", locality: "Egmore",
    zone: "North West Zone", division: "Egmore", category: "Law & Order", type: "Law & Order",
    address_en: "Egmore High Road, Egmore, Chennai - 600008", landmark: "Near Egmore Railway Station, Children Hospital",
    pincode: "600008", phone: "044-23452614", alternate_phone: "", email: "egmore.ps@gcp.tn.gov.in",
    lat: 13.0785, lng: 80.2623,
    jurisdiction_areas: "Egmore, Railway Station Road, Kennet Lane, Pantheon Road, Marshalls Road, Albert Theatre Area",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 100, station_name: "Pallikaranai Police Station", station_code: "S-5",
    area_name: "Pallikaranai", locality: "Pallikaranai",
    zone: "South Zone", division: "Velachery", category: "Law & Order", type: "Law & Order",
    address_en: "Velachery Main Road, Pallikaranai, Chennai - 600100", landmark: "Near Pallikaranai Marshland",
    pincode: "600100", phone: "044-22461900", alternate_phone: "", email: "pallikaranai.ps@gcp.tn.gov.in",
    lat: 12.9362, lng: 80.2155,
    jurisdiction_areas: "Pallikaranai, Marshland Area, Medavakkam High Road, Jalladianpet, Kovilambakkam",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 101, station_name: "Medavakkam Police Station", station_code: "S-6",
    area_name: "Medavakkam", locality: "Medavakkam",
    zone: "South Zone", division: "Velachery", category: "Law & Order", type: "Law & Order",
    address_en: "Tambaram Main Road, Medavakkam, Chennai - 600100", landmark: "Near Medavakkam Junction",
    pincode: "600100", phone: "044-22462000", alternate_phone: "", email: "medavakkam.ps@gcp.tn.gov.in",
    lat: 12.9189, lng: 80.1925,
    jurisdiction_areas: "Medavakkam, Medavakkam Junction, Perumbakkam, Sithalapakkam, Sholinganallur Road",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 102, station_name: "Avadi Police Station", station_code: "AV-1",
    area_name: "Avadi", locality: "Avadi",
    zone: "West Zone", division: "Ambattur", category: "Law & Order", type: "Law & Order",
    address_en: "Avadi High Road, Avadi, Chennai - 600054", landmark: "Near Avadi Bus Stand, HVF Premises",
    pincode: "600054", phone: "044-26380200", alternate_phone: "", email: "avadi.ps@gcp.tn.gov.in",
    lat: 13.1167, lng: 80.1000,
    jurisdiction_areas: "Avadi, HVF Area, OCF Area, Avadi Bus Stand, Kamaraj Nagar, Pattabiram",
    working_hours: "24 Hours / 7 Days", is_active: 1
  },
  {
    id: 103, station_name: "Poonamallee Police Station", station_code: "K-3",
    area_name: "Poonamallee", locality: "Poonamallee",
    zone: "West Zone", division: "Ambattur", category: "Law & Order", type: "Law & Order",
    address_en: "Poonamallee High Road, Poonamallee, Chennai - 600056", landmark: "Near Poonamallee Bus Stand",
    pincode: "600056", phone: "044-26541400", alternate_phone: "", email: "poonamallee.ps@gcp.tn.gov.in",
    lat: 13.0469, lng: 80.1059,
    jurisdiction_areas: "Poonamallee, Chembarambakkam, Kattupakkam, Senneerkuppam, Karayanchavadi",
    working_hours: "24 Hours / 7 Days", is_active: 1
  }
`;

// Splice additionalStations right before the last closing bracket '];'
const updatedContent = content.slice(0, lastClosingBracket) + additionalStations + content.slice(lastClosingBracket);

fs.writeFileSync(seedTsPath, updatedContent, 'utf8');
console.log("Successfully appended outstanding stations to seed file!");
