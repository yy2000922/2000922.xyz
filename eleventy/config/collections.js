const fs = require('fs');
const path = require('path');

function registerCollections(eleventyConfig) {
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByTag("posts").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("categories", (collectionApi) => {
    const categories = {};

    collectionApi.getFilteredByTag("posts").forEach((item) => {
      const category = item.data.category;
      if (!category) return;

      // Handle hierarchy
      const parts = category.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!categories[currentPath]) {
          categories[currentPath] = [];
        }
        
        // Only add post to the specific category it belongs to (leaf)
        // Or should we add to all parents? Let's add to leaf for now.
        if (isLast) {
          categories[currentPath].push(item);
        }
      });
    });

    return categories;
  });

  eleventyConfig.addCollection("categoriesList", (collectionApi) => {
    const nodes = {};
    const posts = collectionApi.getFilteredByTag("posts");
    
    // Load metadata if available
    let meta = {};
    try {
        const metaPath = path.join(process.cwd(), 'src/_data/categoryMeta.json');
        if (fs.existsSync(metaPath)) {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        }
    } catch (e) {
        console.warn("Could not load category metadata:", e);
    }

    // 1. Create nodes for all levels
    posts.forEach((item) => {
      const category = item.data.category;
      if (!category) return;

      const parts = category.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!nodes[currentPath]) {
          nodes[currentPath] = {
            key: currentPath,
            title: part, // Display name (last segment)
            name: part,
            posts: [],
            children: [], // Sub-categories
            parent: index > 0 ? parts.slice(0, index).join('/') : null
          };
        }
        
        // Add post to the leaf node
        if (index === parts.length - 1) {
          nodes[currentPath].posts.push(item);
        }
      });
    });

    // 2. Build hierarchy (children pointers) and enrich with meta
    Object.keys(nodes).forEach(key => {
      const node = nodes[key];
      
      // Add to parent's children list
      if (node.parent && nodes[node.parent]) {
        if (!nodes[node.parent].children.includes(key)) {
          nodes[node.parent].children.push(key);
        }
      }
      
      // Enrich with metadata
      if (meta[key]) {
        node.meta = meta[key];
        if (meta[key].title) node.title = meta[key].title; // Override title if needed
      }
    });

    return Object.values(nodes);
  });

  eleventyConfig.addCollection("directoriesList", (collectionApi) => {
    const directories = {};
    const posts = collectionApi.getFilteredByTag("posts");

    // Load metadata
    let meta = {};
    try {
        const metaPath = path.join(process.cwd(), 'src/_data/categoryMeta.json');
        if (fs.existsSync(metaPath)) {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        }
    } catch (e) {
        console.warn("Could not load category metadata:", e);
    }

    // 1. First build the category nodes (simplified logic from categoriesList)
    const categoryNodes = {};
    
    posts.forEach((item) => {
        const category = item.data.category;
        if (!category) return;
        
        // We only care about top-level categories for the directory mapping
        const topLevelCategory = category.split('/')[0];
        
        if (!categoryNodes[topLevelCategory]) {
            categoryNodes[topLevelCategory] = {
                title: topLevelCategory,
                url: `/categories/${topLevelCategory}/`, // Assuming standard URL structure
                count: 0,
                posts: [],
                directory: null,
                description: meta[topLevelCategory] ? meta[topLevelCategory].description : ''
            };
        }
        
        categoryNodes[topLevelCategory].count++;
        categoryNodes[topLevelCategory].posts.push(item);
        
        // Map category to directory based on posts
        // We assume all posts in a category belong to the same directory
        // or we take the most frequent one / first one found
        if (item.data.directory && !categoryNodes[topLevelCategory].directory) {
            categoryNodes[topLevelCategory].directory = item.data.directory;
        }
    });

    // 2. Group categories by directory
    Object.values(categoryNodes).forEach(node => {
        const dir = node.directory || "其他"; // Fallback for categories without directory
        
        if (!directories[dir]) {
            directories[dir] = {
                title: dir,
                categories: []
            };
        }
        directories[dir].categories.push(node);
    });

    // Convert to array and sort
    const order = {
        "第一篇": 1,
        "第二篇": 2,
        "第三篇": 3,
        "第四篇": 4,
        "第五篇": 5,
        "第六篇": 6,
        "第七篇": 7,
        "第八篇": 8,
        "第九篇": 9,
        "第十篇": 10
    };
    
    return Object.values(directories).sort((a, b) => {
        const getOrder = (title) => {
            for (const key in order) {
                if (title.startsWith(key)) return order[key];
            }
            return 999;
        };
        return getOrder(a.title) - getOrder(b.title);
    });
  });
}

module.exports = { registerCollections };
