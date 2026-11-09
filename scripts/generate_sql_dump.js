const fs = require('fs');
const path = require('path');

const DB_JSON_PATH = path.join(__dirname, '../src/data/db.json');
const TARGET_SQL_PATH = path.join(__dirname, '../chennaiguardian.sql');
const DEPLOY_SQL_PATH = path.join(__dirname, '../deploy/chennaiguardian.sql');
const SCHEMA_SQL_PATH = path.join(__dirname, '../src/data/schema.sql');

const dbData = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf8'));

// Ensure maintenance tables exist with default records if not present
if (!dbData.maintenance_config || dbData.maintenance_config.length === 0) {
  dbData.maintenance_config = [
    {
      id: 1,
      maintenance_enabled: 0,
      maintenance_title_en: "We'll Be Back Soon!",
      maintenance_description_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
      maintenance_title_ta: "இணையதளம் பராமரிப்பில் உள்ளது",
      maintenance_description_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
      expected_restoration_datetime: null,
      expected_restore_at: null,
      maintenance_message_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
      maintenance_message_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
      active_schedule_ref: null,
      updated_by: "System",
      updated_at: new Date().toISOString()
    }
  ];
}

if (!dbData.maintenance_notifications) {
  dbData.maintenance_notifications = [];
}

const keyMap = {
  maintenance_config: 'maintenance_config',
  maintenance_notifications: 'maintenance_notifications',
  users: 'users',
  activity_logs: 'activity_logs',
  custom_roles: 'custom_roles',
  news: 'news',
  ticker: 'ticker',
  slider: 'slider',
  commissioner_profile: 'commissioner_profile',
  theme_settings: 'theme_settings',
  menu_items: 'menu_items',
  menus: 'menus',
  sub_menus: 'sub_menus',
  contacts: 'contacts',
  tts_settings: 'tts_settings',
  videos: 'videos',
  alerts: 'alerts',
  alert_settings: 'alert_settings',
  seo_settings: 'seo_settings',
  article_seo: 'article_seo',
  asset_metadata: 'asset_metadata',
  police_stations: 'police_stations',
  emergency_contacts: 'emergency_contacts',
  department_links: 'department_links',
  web_stories: 'web_stories',
  service_requests: 'service_requests',
  contact_messages: 'contact_messages',
  page_contents: 'page_contents',
  content_versions: 'content_versions',
  media_files: 'media_files',
  backups: 'backups',
  security_assessments: 'security_assessments',
  citizen_service_categories: 'citizen_service_categories',
  citizen_services: 'citizen_services',
  portal_visitor_stats: 'portal_visitor_stats',
  portal_daily_visits: 'portal_daily_visits',
  superadmin_config: 'superadmin_config',
  security_events: 'security_events',
  security_config: 'security_config',
  sessions: 'sessions',
  user_mfa: 'user_mfa',
  mfa_challenges: 'mfa_challenges',
  mfa_recovery_codes: 'mfa_recovery_codes',
  trusted_devices: 'trusted_devices',
  faqs: 'faqs'
};

const fallbackFields = {
  maintenance_config: {
    id: 1,
    maintenance_enabled: 0,
    maintenance_title_en: "We'll Be Back Soon!",
    maintenance_description_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
    maintenance_title_ta: "இணையதளம் பராமரிப்பில் உள்ளது",
    maintenance_description_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
    expected_restoration_datetime: null,
    expected_restore_at: null,
    maintenance_message_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
    maintenance_message_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
    active_schedule_ref: null,
    updated_by: "System",
    updated_at: "2026-11-10T00:00:00.000Z"
  },
  maintenance_notifications: {
    id: 'notif_init',
    schedule_ref: 'sched_init',
    scheduled_restoration_datetime: '2026-11-10T00:00:00.000Z',
    generated_at: '2026-11-10T00:00:00.000Z',
    status: 'NEW',
    read_by: null,
    read_at: null,
    created_at: '2026-11-10T00:00:00.000Z',
    maintenance_status_at_trigger: 'ACTIVE'
  },
  user_mfa: {
    id: 1,
    user_id: 1,
    username: '',
    secret_encrypted: '',
    method: 'TOTP',
    enabled: 1,
    verified_at: '',
    created_at: ''
  },
  mfa_challenges: {
    id: 1,
    challenge_id: '',
    username: '',
    expires_at: '',
    attempt_count: 0,
    verified: 0,
    created_at: ''
  },
  mfa_recovery_codes: {
    id: 1,
    username: '',
    code_hash: '',
    used_at: '',
    created_at: ''
  },
  trusted_devices: {
    id: 1,
    username: '',
    token_hash: '',
    device_name: '',
    user_agent_summary: '',
    created_at: '',
    last_used_at: '',
    expires_at: '',
    revoked_at: ''
  },
  media_files: {
    id: 1,
    uuid: '',
    original_name: '',
    stored_name: '',
    mime_type: '',
    detected_mime: '',
    extension: '',
    file_size: 0,
    sha256_hash: '',
    storage_path: '',
    status: 'APPROVED',
    scan_status: 'CLEAN',
    uploaded_by: '',
    created_at: ''
  },
  sessions: {
    id: 1,
    user_id: 1,
    username: '',
    session_id: '',
    created_at: '',
    last_activity: '',
    expires_at: '',
    ip_address: '',
    user_agent: '',
    revoked_at: '',
    status: 'active'
  },
  security_events: {
    id: 1,
    user_id: 1,
    username: '',
    event_type: '',
    severity: 'info',
    ip_address: '',
    user_agent: '',
    details: '',
    created_at: ''
  },
  security_config: {
    id: 1,
    admin_console_path: '/control-center',
    session_timeout_minutes: 30,
    login_rate_limit: 5,
    max_failed_logins: 5,
    lockout_duration_minutes: 30,
    captcha_enabled: 1,
    mfa_policy: 'optional',
    maintenance_mode: 0
  },
  service_requests: {
    id: 1,
    applicantName: '',
    mobileNumber: '',
    email: '',
    address: '',
    serviceRequired: '',
    policeStation: '',
    message: '',
    receiptId: '',
    created_at: ''
  },
  contact_messages: {
    id: 1,
    name: '',
    mobile: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    status: 'new',
    created_at: ''
  },
  article_seo: {
    id: 1,
    article_id: 1,
    content_type: '',
    seo_title: '',
    meta_description: '',
    meta_keywords: '',
    seo_slug: '',
    canonical_url: '',
    focus_keyword: '',
    secondary_keywords: '',
    article_tags: '',
    robots: '',
    og_title: '',
    og_description: '',
    og_image: '',
    og_url: '',
    og_type: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    twitter_card: '',
    image_alt: '',
    image_caption: '',
    image_title: '',
    image_description: '',
    news_category: '',
    author_name: '',
    schema_json: '',
    hreflang_en: '',
    hreflang_ta: '',
    seo_score: 0,
    updated_at: ''
  },
  portal_visitor_stats: {
    id: 1,
    total_page_views: 0,
    created_at: '',
    updated_at: ''
  },
  portal_daily_visits: {
    id: 1,
    visit_date: '2026-09-08',
    page_views: 0,
    created_at: '',
    updated_at: ''
  }
};

function escapeSqlString(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z') + "'";
}

function sqlVal(val, col, type) {
  if (val === null || val === undefined) return 'NULL';
  if (type === 'boolean' || typeof val === 'boolean') {
    return val ? '1' : '0';
  }
  if (type === 'number' || typeof val === 'number') {
    if (isNaN(val)) return '0';
    return String(val);
  }
  if (typeof val === 'object') {
    return escapeSqlString(JSON.stringify(val));
  }
  return escapeSqlString(val);
}

let sqlOutput = `-- ==============================================================================
-- GREATER CHENNAI POLICE COMMISSIONER PORTAL — ENTERPRISE DATABASE DUMP
-- Target Database: chennaiguardian
-- Generated on: ${new Date().toISOString()}
-- Includes Maintenance Mode & Automated Restoration Alert Tables
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS \`chennaiguardian\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`chennaiguardian\`;

`;

for (const [jsonKey, tableName] of Object.entries(keyMap)) {
  const records = Array.isArray(dbData[jsonKey]) ? dbData[jsonKey] : (dbData[jsonKey] ? [dbData[jsonKey]] : []);
  const recordsToScan = records.length > 0 ? records : [fallbackFields[jsonKey] || { id: 1 }];

  const allCols = new Set();
  const types = {};

  // For maintenance_notifications and media_files, id may be varchar string
  let idIsString = false;
  if (tableName === 'maintenance_notifications' || (recordsToScan[0] && typeof recordsToScan[0].id === 'string')) {
    idIsString = true;
  }

  allCols.add('id');

  for (const rec of recordsToScan) {
    if (!rec) continue;
    for (const k of Object.keys(rec)) {
      allCols.add(k);
      if (rec[k] !== undefined && rec[k] !== null) {
        types[k] = typeof rec[k];
      }
    }
  }

  const colDefs = [];
  const colList = Array.from(allCols);

  for (const col of colList) {
    if (col === 'id') {
      if (idIsString) {
        colDefs.push('`id` VARCHAR(128) NOT NULL PRIMARY KEY');
      } else {
        colDefs.push('`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY');
      }
      continue;
    }

    const type = types[col] || 'string';
    let dbType = 'VARCHAR(255)';

    if (type === 'number') {
      dbType = 'DOUBLE';
    } else if (type === 'boolean') {
      dbType = 'TINYINT(1) DEFAULT 0';
    } else if (type === 'object') {
      dbType = 'LONGTEXT';
    } else {
      const colLower = col.toLowerCase();
      const longTextKeys = [
        'external_id', 'content_en', 'content_ta', 'summary', 'summary_en', 'summary_ta',
        'description', 'message', 'bio_en1', 'bio_en2', 'bio_ta1', 'bio_ta2', 'action',
        'schema_json', 'default_keywords', 'site_description', 'meta_description', 'meta_keywords',
        'address', 'address_en', 'address_ta', 'ps_address', 'landmark', 'jurisdiction_areas',
        'google_map_link', 'district', 'sdo', 'range', 'pincode', 'phone_no', 'details',
        'user_agent', 'user_agent_summary', 'secret_encrypted', 'token_hash', 'code_hash',
        'permissions_json', 'before_state', 'after_state', 'maintenance_description_en',
        'maintenance_description_ta', 'maintenance_message_en', 'maintenance_message_ta'
      ];
      let maxLen = 0;
      for (const rec of recordsToScan) {
        if (rec && typeof rec[col] === 'string') {
          maxLen = Math.max(maxLen, rec[col].length);
        }
      }
      if (
        maxLen > 250 ||
        longTextKeys.includes(col) ||
        colLower.includes('url') ||
        colLower.includes('src') ||
        colLower.includes('image') ||
        colLower.includes('path') ||
        colLower.includes('photo') ||
        colLower.includes('link') ||
        colLower.includes('token') ||
        colLower.includes('hash') ||
        colLower.includes('detail') ||
        colLower.includes('message') ||
        colLower.includes('content') ||
        colLower.includes('description')
      ) {
        dbType = 'LONGTEXT';
      }
    }

    colDefs.push(`\`${col}\` ${dbType} NULL`);
  }

  // Add indexes if applicable
  if (tableName === 'maintenance_notifications') {
    colDefs.push('INDEX `idx_maint_schedule_ref` (`schedule_ref`)');
    colDefs.push('INDEX `idx_maint_status` (`status`)');
  } else if (tableName === 'news') {
    colDefs.push('INDEX `idx_news_slug` (`slug`)');
    colDefs.push('INDEX `idx_news_published` (`published`)');
  }

  sqlOutput += `-- ----------------------------------------------------------------------------\n`;
  sqlOutput += `-- Table: \`${tableName}\`\n`;
  sqlOutput += `-- ----------------------------------------------------------------------------\n`;
  sqlOutput += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
  sqlOutput += `CREATE TABLE \`${tableName}\` (\n  ${colDefs.join(',\n  ')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  // Insert records
  if (records.length > 0) {
    sqlOutput += `-- Data for table \`${tableName}\` (${records.length} records)\n`;
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      const insertCols = colList.map(c => `\`${c}\``).join(', ');
      const rowsSql = batch.map(rec => {
        const vals = colList.map(c => sqlVal(rec[c], c, types[c]));
        return `(${vals.join(', ')})`;
      }).join(',\n');

      sqlOutput += `INSERT INTO \`${tableName}\` (${insertCols}) VALUES\n${rowsSql};\n`;
    }
    sqlOutput += `\n`;
  }
}

sqlOutput += `SET FOREIGN_KEY_CHECKS = 1;\n`;
sqlOutput += `-- End of MySQL Database Dump for chennaiguardian\n`;

fs.writeFileSync(TARGET_SQL_PATH, sqlOutput, 'utf8');
console.log(`Generated root SQL dump: ${TARGET_SQL_PATH} (${(sqlOutput.length / 1024).toFixed(1)} KB)`);

fs.writeFileSync(DEPLOY_SQL_PATH, sqlOutput, 'utf8');
console.log(`Generated deploy SQL dump: ${DEPLOY_SQL_PATH}`);

// Also update schema.sql
fs.writeFileSync(SCHEMA_SQL_PATH, sqlOutput, 'utf8');
console.log(`Updated schema SQL file: ${SCHEMA_SQL_PATH}`);
