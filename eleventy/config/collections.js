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

    // 3. Return array
    return Object.values(nodes).map(node => {
      // Sort posts by date
      node.posts.sort((a, b) => b.date - a.date);
      
      // Add URL property which is missing and causing click issues
      node.url = `/categories/${node.key}/`;

      // Resolve children objects (lightweight)
      node.children = node.children.map(childKey => {
          const child = nodes[childKey];
          return {
              title: child.title,
              url: `/categories/${child.key}/`,
              count: child.posts.length,
              description: child.meta ? child.meta.description : ''
          };
      });
      
      // Generate breadcrumbs
      const breadcrumbs = [];
      let curr = node;
      while (curr.parent) {
        curr = nodes[curr.parent];
        breadcrumbs.unshift({
            title: curr.title,
            url: `/categories/${curr.key}/`
        });
      }
      node.breadcrumbs = breadcrumbs;
      
      return node;
    });
  });

  eleventyConfig.addCollection("categoryPages", (collectionApi) => {
    const pageSize = 10;
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
            title: part,
            name: part,
            posts: [],
            children: [],
            parent: index > 0 ? parts.slice(0, index).join('/') : null
          };
        }

        if (index === parts.length - 1) {
          nodes[currentPath].posts.push(item);
        }
      });
    });

    // 2. Build hierarchy (children pointers) and enrich with meta
    Object.keys(nodes).forEach(key => {
      const node = nodes[key];

      if (node.parent && nodes[node.parent]) {
        if (!nodes[node.parent].children.includes(key)) {
          nodes[node.parent].children.push(key);
        }
      }

      if (meta[key]) {
        node.meta = meta[key];
        if (meta[key].title) node.title = meta[key].title;
      }
    });

    // 3. Create paginated pages
    const pages = [];
    Object.values(nodes).forEach(node => {
      node.posts.sort((a, b) => b.date - a.date);
      node.url = `/categories/${node.key}/`;

      node.children = node.children.map(childKey => {
        const child = nodes[childKey];
        return {
          title: child.title,
          url: `/categories/${child.key}/`,
          count: child.posts.length,
          description: child.meta ? child.meta.description : ''
        };
      });

      const breadcrumbs = [];
      let curr = node;
      while (curr.parent) {
        curr = nodes[curr.parent];
        breadcrumbs.unshift({
          title: curr.title,
          url: `/categories/${curr.key}/`
        });
      }
      node.breadcrumbs = breadcrumbs;

      const totalPages = Math.max(1, Math.ceil(node.posts.length / pageSize));
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        const baseUrl = node.url;
        const url = pageNumber === 1 ? baseUrl : `${baseUrl}page/${pageNumber}/`;

        pages.push({
          key: node.key,
          title: node.title,
          meta: node.meta,
          posts: node.posts.slice(start, end),
          children: node.children,
          breadcrumbs: node.breadcrumbs,
          pageNumber,
          totalPages,
          url,
          baseUrl,
          count: node.posts.length
        });
      }
    });

    return pages;
  });
}

module.exports = { registerCollections };
