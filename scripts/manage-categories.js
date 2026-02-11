const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const META_FILE = path.join(__dirname, '../src/_data/categoryMeta.json');

// Ensure meta file exists
if (!fs.existsSync(META_FILE)) {
    fs.writeFileSync(META_FILE, '{}');
}

function getPosts() {
    if (!fs.existsSync(POSTS_DIR)) return [];

    const result = [];
    const walk = (dir) => {
        fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
                return;
            }
            if (entry.isFile() && entry.name.endsWith('.md')) {
                result.push(fullPath);
            }
        });
    };

    walk(POSTS_DIR);
    return result;
}

function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    return match[1];
}

function getCategory(content) {
    const fm = parseFrontMatter(content);
    if (!fm) return null;
    const match = fm.match(/category:\s*(.+)/);
    if (!match) return null;
    let cat = match[1].trim();
    // Remove surrounding quotes
    if ((cat.startsWith('"') && cat.endsWith('"')) || (cat.startsWith("'") && cat.endsWith("'"))) {
        cat = cat.slice(1, -1);
    }
    return cat;
}

function setCategory(content, newCat) {
    // Check if category exists
    if (content.match(/category:\s*.+/)) {
        return content.replace(/category:\s*.+/, `category: ${newCat}`);
    } else {
        // Insert after first ---
        return content.replace(/^---\n/, `---\ncategory: ${newCat}\n`);
    }
}

function listCategories() {
    const posts = getPosts();
    const cats = {};
    posts.forEach(p => {
        const content = fs.readFileSync(p, 'utf8');
        const c = getCategory(content);
        if (c) {
            cats[c] = (cats[c] || 0) + 1;
        }
    });
    console.log("\n=== Existing Categories (from Posts) ===");
    if (Object.keys(cats).length === 0) {
        console.log("No categories found in posts.");
    }
    Object.keys(cats).sort().forEach(c => {
        console.log(`- ${c} (${cats[c]} posts)`);
    });
    
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    console.log("\n=== Category Metadata (src/_data/categoryMeta.json) ===");
    if (Object.keys(meta).length === 0) {
        console.log("No metadata defined.");
    }
    Object.keys(meta).forEach(k => {
        console.log(`- ${k}: ${meta[k].title || k} (${meta[k].description || 'No desc'})`);
    });
}

function renameCategory(oldName, newName) {
    if (!oldName || !newName) {
        console.log("Error: Please provide old and new names.");
        return;
    }
    const posts = getPosts();
    let count = 0;
    posts.forEach(p => {
        let content = fs.readFileSync(p, 'utf8');
        const c = getCategory(content);
        if (c === oldName) {
            content = setCategory(content, newName);
            fs.writeFileSync(p, content);
            count++;
        } else if (c && c.startsWith(oldName + '/')) {
            // Handle subcategories renaming
            const newSub = c.replace(oldName, newName);
            content = setCategory(content, newSub);
            fs.writeFileSync(p, content);
            count++;
        }
    });
    
    // Update Meta
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    let metaUpdated = false;
    
    // Check direct match
    if (meta[oldName]) {
        meta[newName] = meta[oldName];
        delete meta[oldName];
        metaUpdated = true;
    }
    
    // Check subkeys in meta
    Object.keys(meta).forEach(k => {
        if (k.startsWith(oldName + '/')) {
            const newKey = k.replace(oldName, newName);
            meta[newKey] = meta[k];
            delete meta[k];
            metaUpdated = true;
        }
    });

    if (metaUpdated) {
        fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
        console.log("Metadata updated.");
    }
    
    console.log(`Updated category in ${count} posts.`);
}

function deleteCategory(name) {
    if (!name) {
        console.log("Error: Please provide category name.");
        return;
    }
    const posts = getPosts();
    let count = 0;
    posts.forEach(p => {
        let content = fs.readFileSync(p, 'utf8');
        const c = getCategory(content);
        if (c === name || (c && c.startsWith(name + '/'))) {
            content = content.replace(/category:\s*.+\n/, '');
            fs.writeFileSync(p, content);
            count++;
        }
    });
    
    // Remove from Meta
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    if (meta[name]) {
        delete meta[name];
        fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
        console.log("Metadata removed.");
    }
    console.log(`Removed category from ${count} posts.`);
}

function setMeta(name, title, description) {
    if (!name || !title) {
        console.log("Error: Please provide category name and title.");
        return;
    }
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    meta[name] = { 
        title: title, 
        description: description || (meta[name] ? meta[name].description : "") 
    };
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
    console.log(`Metadata updated for ${name}`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'list') {
    listCategories();
} else if (command === 'rename') {
    renameCategory(args[1], args[2]);
} else if (command === 'delete') {
    deleteCategory(args[1]);
} else if (command === 'meta') {
    // node manage-categories.js meta "Tech/Web" "Web Development" "All about web"
    setMeta(args[1], args[2], args[3]);
} else {
    console.log("Category Management Tool");
    console.log("Usage:");
    console.log("  node scripts/manage-categories.js list");
    console.log("  node scripts/manage-categories.js rename <old> <new>");
    console.log("  node scripts/manage-categories.js delete <name>");
    console.log("  node scripts/manage-categories.js meta <category_path> <title> [description]");
}
