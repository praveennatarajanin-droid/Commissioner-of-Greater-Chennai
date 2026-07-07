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

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
    console.log('Connected to MySQL database.');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  try {
    // 2. Create tables
    console.log('Creating database tables...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`menus\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name_en\` VARCHAR(255) NOT NULL,
        \`name_ta\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`icon\` VARCHAR(255) NULL,
        \`display_order\` INT NOT NULL DEFAULT 0,
        \`url\` VARCHAR(255) NOT NULL,
        \`page_type\` VARCHAR(50) NOT NULL DEFAULT 'static',
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'active',
        \`open_in_new_tab\` TINYINT(1) NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table `menus` verified/created.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`sub_menus\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`parent_menu_id\` INT NOT NULL,
        \`name_en\` VARCHAR(255) NOT NULL,
        \`name_ta\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL,
        \`url\` VARCHAR(255) NOT NULL,
        \`icon\` VARCHAR(255) NULL,
        \`display_order\` INT NOT NULL DEFAULT 0,
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'active',
        FOREIGN KEY (\`parent_menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table `sub_menus` verified/created.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`page_contents\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`menu_id\` INT NULL,
        \`sub_menu_id\` INT NULL,
        \`page_name\` VARCHAR(255) NOT NULL UNIQUE,
        \`seo_title\` VARCHAR(255) NULL,
        \`seo_description\` TEXT NULL,
        \`seo_keywords\` VARCHAR(255) NULL,
        \`published_version_id\` INT NULL,
        \`draft_version_id\` INT NULL,
        \`last_updated_by\` VARCHAR(255) NULL,
        \`last_updated_at\` DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table `page_contents` verified/created.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`page_sections\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`page_content_id\` INT NOT NULL,
        \`section_type\` VARCHAR(100) NOT NULL,
        \`section_title\` VARCHAR(255) NOT NULL,
        \`content_json\` LONGTEXT NOT NULL,
        \`display_order\` INT NOT NULL DEFAULT 0,
        FOREIGN KEY (\`page_content_id\`) REFERENCES \`page_contents\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table `page_sections` verified/created.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`content_versions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`page_content_id\` INT NOT NULL,
        \`version_num\` INT NOT NULL,
        \`sections_data\` LONGTEXT NOT NULL,
        \`seo_data\` LONGTEXT NOT NULL,
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'draft',
        \`updated_by\` VARCHAR(255) NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        FOREIGN KEY (\`page_content_id\`) REFERENCES \`page_contents\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table `content_versions` verified/created.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`menu_permissions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`role\` VARCHAR(50) NOT NULL UNIQUE,
        \`can_read\` TINYINT(1) NOT NULL DEFAULT 0,
        \`can_write\` TINYINT(1) NOT NULL DEFAULT 0,
        \`can_approve\` TINYINT(1) NOT NULL DEFAULT 0,
        \`can_delete\` TINYINT(1) NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table `menu_permissions` verified/created.');

    // 3. Seed menu_permissions if empty
    const [permsCount] = await connection.query('SELECT COUNT(*) as count FROM `menu_permissions`');
    if (permsCount[0].count === 0) {
      console.log('Seeding `menu_permissions`...');
      const permissions = [
        ['superadmin', 1, 1, 1, 1],
        ['admin', 1, 1, 1, 1],
        ['editor', 1, 1, 0, 0],
        ['contentadmin', 1, 1, 1, 0],
        ['reporter', 1, 1, 0, 0],
        ['moderator', 1, 0, 1, 0],
        ['viewer', 1, 0, 0, 0]
      ];
      for (const perm of permissions) {
        await connection.query(
          'INSERT INTO `menu_permissions` (role, can_read, can_write, can_approve, can_delete) VALUES (?, ?, ?, ?, ?)',
          perm
        );
      }
      console.log('`menu_permissions` seeded.');
    }

    // 4. Seed menus and sub_menus if empty
    const [menusCount] = await connection.query('SELECT COUNT(*) as count FROM `menus`');
    if (menusCount[0].count === 0) {
      console.log('Seeding `menus`...');
      const defaultMenus = [
        ['Home', 'முகப்பு', 'home', 'Home', 1, '/', 'static', 'active', 0],
        ['About Us', 'எங்களைப் பற்றி', 'about', 'Info', 2, '/about', 'static', 'active', 0],
        ['Crime', 'குற்றம்', 'crime', 'Shield', 3, '/category/crime', 'news_category', 'active', 0],
        ['Cyber Safety', 'இணைய பாதுகாப்பு', 'cyber-safety', 'Lock', 4, '/category/cyber-safety', 'news_category', 'active', 0],
        ['Women Safety', 'பெண்கள் பாதுகாப்பு', 'women-safety', 'Heart', 5, '/category/women-safety', 'news_category', 'active', 0],
        ['Public Safety', 'பொது பாதுகாப்பு', 'public-safety', 'Eye', 6, '/category/public-safety', 'news_category', 'active', 0],
        ['Outreach', 'சமூக உதவி', 'outreach', 'Users', 7, '/category/outreach', 'news_category', 'active', 0],
        ['Stations', 'காவல் நிலையங்கள்', 'stations', 'MapPin', 8, '/stations', 'static', 'active', 0],
        ['Videos', 'வீடியோக்கள்', 'videos', 'Video', 9, '/videos', 'static', 'active', 0],
        ['Profile', 'ஆணையர் சுயவிவரம்', 'commissioner-profile', 'User', 10, '/commissioner-profile', 'static', 'active', 0],
        ['Contact Us', 'தொடர்பு கொள்ளுங்கள்', 'contact-us', 'Phone', 11, '/contact-us', 'static', 'active', 0]
      ];

      for (const menu of defaultMenus) {
        const [result] = await connection.query(
          'INSERT INTO `menus` (name_en, name_ta, slug, icon, display_order, url, page_type, status, open_in_new_tab) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          menu
        );
        const menuId = result.insertId;

        // Seed sub_menus for Crime, Cyber Safety, Women Safety
        if (menu[2] === 'crime') {
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Crime News', 'குற்றச் செய்திகள்', 'crime-news', '/category/crime', 'FileText', 1, 'active']
          );
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Wanted Criminals', 'தேடப்படும் குற்றவாளிகள்', 'wanted-criminals', '/wanted-criminals', 'UserX', 2, 'active']
          );
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Missing Persons', 'காணாமல் போனவர்கள்', 'missing-persons', '/missing-persons', 'Search', 3, 'active']
          );
        } else if (menu[2] === 'cyber-safety') {
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Cyber Awareness', 'இணைய விழிப்புணர்வு', 'cyber-awareness', '/cyber-awareness', 'Globe', 1, 'active']
          );
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Online Fraud', 'ஆன்லைன் மோசடி', 'online-fraud', '/online-fraud', 'AlertTriangle', 2, 'active']
          );
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Complaint Portal', 'புகார் போர்டல்', 'complaint-portal', 'https://cybercrime.gov.in', 'ExternalLink', 3, 'active']
          );
        } else if (menu[2] === 'women-safety') {
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Pink Patrol', 'பிங்க் பேட்ரோல்', 'pink-patrol', '/pink-patrol', 'ShieldAlert', 1, 'active']
          );
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'AVAL Support Wing', 'அவள் ஆதரவு பிரிவு', 'aval-support', '/aval-support', 'Smile', 2, 'active']
          );
          await connection.query(
            'INSERT INTO `sub_menus` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [menuId, 'Women Helpline', 'பெண்கள் உதவி எண்', 'women-helpline', '/women-helpline', 'PhoneCall', 3, 'active']
          );
        }
      }
      console.log('`menus` and `sub_menus` seeded.');
    }

    // 5. Seed default page_contents and page_sections if empty
    const [contentsCount] = await connection.query('SELECT COUNT(*) as count FROM `page_contents`');
    if (contentsCount[0].count === 0) {
      console.log('Seeding `page_contents` and blocks...');

      const defaultPages = [
        {
          name: 'home',
          seo_title: 'Chennai Guardian | Greater Chennai Police Portal',
          seo_desc: 'Dynamic news and citizen engagement portal for the Greater Chennai Police Department.',
          sections: [
            {
              type: 'banner',
              title: 'Hero Banner',
              content: {
                title_en: 'Greater Chennai Police Department',
                title_ta: 'சென்னை பெருநகர காவல்துறை',
                subtitle_en: 'Protecting and Serving the Citizens of Chennai 24/7',
                subtitle_ta: '24/7 சென்னை குடிமக்களை பாதுகாத்தல் மற்றும் சேவை செய்தல்',
                bg_image: '/images/slider_image_1.jpg',
                cta_text_en: 'Report a Crime',
                cta_text_ta: 'குற்றத்தைப் புகாரளிக்கவும்',
                cta_link: '/citizen-services'
              }
            },
            {
              type: 'commissioner_message',
              title: 'Commissioner Message Block',
              content: {
                heading_en: 'Message from the Commissioner',
                heading_ta: 'காவல் ஆணையரின் செய்தி',
                message_en: 'We are dedicated to building a safe, secure, and digitally enabled Chennai. Our mission is to maintain public order with transparency, modern technology, and community trust.',
                message_ta: 'பாதுகாப்பான மற்றும் டிஜிட்டல் மயமாக்கப்பட்ட சென்னையை உருவாக்குவதில் நாங்கள் ஒழுங்காக உறுதியாக இருக்கிறோம். எங்கள் நோக்கம் வெளிப்படைத்தன்மை, நவீன தொழில்நுட்பம் மற்றும் சமூக நம்பிக்கையுடன் பொது ஒழுங்கைப் பேணுதலாகும்.',
                commissioner_name_en: 'Amalraj IPS',
                commissioner_name_ta: 'அமல்ராஜ் IPS',
                commissioner_image: '/images/commissioner_profile.png'
              }
            }
          ]
        },
        {
          name: 'about',
          seo_title: 'About Us | Greater Chennai Police',
          seo_desc: 'Organizational hierarchy, history and initiatives of the Chennai Metropolitan Police force.',
          sections: [
            {
              type: 'banner',
              title: 'About Us Hero Banner',
              content: {
                title_en: 'Greater Chennai Police',
                title_ta: 'சென்னை பெருநகர காவல்துறை',
                subtitle_en: 'History, Mission, and Organizational Structure',
                subtitle_ta: 'வரலாறு, நோக்கம் மற்றும் நிறுவன அமைப்பு',
                bg_image: '/images/about_hero.jpg'
              }
            },
            {
              type: 'description',
              title: 'Historical Context Description',
              content: {
                heading_en: 'Our Legacy of Service',
                heading_ta: 'எங்கள் வரலாற்று சேவை மரபு',
                description_en: 'Founded in 1856 under the Madras City Police Act, the Greater Chennai Police is one of the premier law enforcement institutions in India. Operating across 12 zones and multiple divisions, the GCP stands guard over a population of over 8 million residents.',
                description_ta: '1856 ஆம் ஆண்டு மெட்ராஸ் சிட்டி போலீஸ் சட்டத்தின் கீழ் தொடங்கப்பட்ட சென்னை பெருநகர காவல்துறை இந்தியாவின் முதன்மையான சட்ட அமலாக்க நிறுவனங்களில் ஒன்றாகும். 12 மண்டலங்கள் மற்றும் பல பிரிவுகளுடன் செயல்படும் GCP, 8 மில்லியனுக்கும் அதிகமான குடிமக்களைப் பாதுகாக்கிறது.'
              }
            }
          ]
        }
      ];

      for (const pg of defaultPages) {
        const [contentResult] = await connection.query(
          'INSERT INTO `page_contents` (page_name, seo_title, seo_description, last_updated_by, last_updated_at) VALUES (?, ?, ?, ?, NOW())',
          [pg.name, pg.seo_title, pg.seo_desc, 'superadmin']
        );
        const pageContentId = contentResult.insertId;

        for (let idx = 0; idx < pg.sections.length; idx++) {
          const sec = pg.sections[idx];
          const [secResult] = await connection.query(
            'INSERT INTO `page_sections` (page_content_id, section_type, section_title, content_json, display_order) VALUES (?, ?, ?, ?, ?)',
            [pageContentId, sec.type, sec.title, JSON.stringify(sec.content), idx + 1]
          );
        }

        // Create initial content version
        const sectionsData = pg.sections.map((s, index) => ({
          section_type: s.type,
          section_title: s.title,
          content_json: s.content,
          display_order: index + 1
        }));
        const seoData = {
          seo_title: pg.seo_title,
          seo_description: pg.seo_desc,
          seo_keywords: ''
        };

        const [versionResult] = await connection.query(
          'INSERT INTO `content_versions` (page_content_id, version_num, sections_data, seo_data, status, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [pageContentId, 1, JSON.stringify(sectionsData), JSON.stringify(seoData), 'published', 'superadmin']
        );
        const versionId = versionResult.insertId;

        await connection.query(
          'UPDATE `page_contents` SET published_version_id = ?, draft_version_id = ? WHERE id = ?',
          [versionId, versionId, pageContentId]
        );
      }
      console.log('Default `page_contents` and sections seeded.');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration encountered an error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
