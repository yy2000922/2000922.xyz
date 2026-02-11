const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Note: Assuming glob is available or we use simple directory scan. 
// Since glob might not be installed in devDependencies, let's use a recursive directory walk or install glob.
// Checking package.json... glob is not there. I'll write a simple recursive walker.

const CONTENT_DIR = path.join(__dirname, '../src/content/posts');
const META_FILE = path.join(__dirname, '../src/_data/categoryMeta.json');

// Helper to walk directory recursively
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

function syncMeta() {
  console.log('🔍 Scanning posts for categories...');
  
  if (!fs.existsSync(CONTENT_DIR)) {
      console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
      return;
  }

  const files = getAllFiles(CONTENT_DIR);
  const foundCategories = new Set();

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Simple regex to extract category from frontmatter
    // Looks for "category: value" or "category: 'value'" or 'category: "value"'
    const match = content.match(/^category:\s*["']?([^"'\n]+)["']?/m);
    
    if (match && match[1]) {
      const fullCategory = match[1].trim();
      // We assume the first part of the path is the main category we care about for descriptions
      // e.g. "Tech/Web" -> "Tech"
      const topLevelCategory = fullCategory.split('/')[0];
      foundCategories.add(topLevelCategory);
    }
  });

  console.log(`✅ Found ${foundCategories.size} unique top-level categories:`, [...foundCategories]);

  // Read existing meta
  let meta = {};
  if (fs.existsSync(META_FILE)) {
    try {
      meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    } catch (e) {
      console.error('⚠️ Error reading existing meta file, starting fresh.');
    }
  }

  let updates = 0;
  foundCategories.forEach(cat => {
    if (!meta[cat]) {
      console.log(`➕ Adding new category: ${cat}`);
      meta[cat] = {
        description: "", // Placeholder
        title: cat
      };
      updates++;
    }
  });

  if (updates > 0) {
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
    console.log(`💾 Updated categoryMeta.json with ${updates} new entries.`);
    console.log(`👉 Please edit ${META_FILE} to add descriptions.`);
  } else {
    console.log('✨ No new categories found. Metadata is up to date.');
  }
}

syncMeta();
