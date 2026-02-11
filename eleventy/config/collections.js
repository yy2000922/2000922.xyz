const fs = require('fs');
const path = require('path');

function getFolderNameFromPostPath(item) {
  const inputPath = item && item.inputPath ? item.inputPath : '';
  if (!inputPath) return "其他";

  const normalizedPath = inputPath.split(path.sep).join('/');
  const marker = '/src/content/posts/';
  const markerIndex = normalizedPath.indexOf(marker);

  if (markerIndex === -1) return "其他";

  const relativePath = normalizedPath.slice(markerIndex + marker.length);
  const segments = relativePath.split('/').filter(Boolean);

  // If a file is directly under posts/, place it in the fallback folder.
  if (segments.length <= 1) return "其他";

  return segments[0];
}

function getCategoryPathFromPost(item) {
  const rawCategory = item && item.data && typeof item.data.category === 'string'
    ? item.data.category.trim()
    : '';
  if (rawCategory) return rawCategory;

  const folder = getFolderNameFromPostPath(item);
  if (folder && folder !== "其他") return folder;

  return "默认分类";
}

function hasPostsTag(item) {
  const tags = item && item.data ? item.data.tags : null;
  if (!tags) return false;
  if (Array.isArray(tags)) return tags.includes("posts");
  if (typeof tags === "string") return tags === "posts";
  return false;
}

function getPostsFromContentDir(collectionApi) {
  return collectionApi
    .getAll()
    .filter((item) => {
      if (!item || !item.inputPath) return false;
      const normalizedPath = item.inputPath.split(path.sep).join('/');
      const isPostFile = normalizedPath.includes('/src/content/posts/') && normalizedPath.endsWith('.md');
      if (!isPostFile) return false;

      // Keep the "posts" tag convention; fallback only when tags are missing.
      const tags = item.data ? item.data.tags : null;
      if (!tags || (Array.isArray(tags) && tags.length === 0)) return true;
      return hasPostsTag(item);
    })
    .sort((a, b) => b.date - a.date);
}

function loadCategoryMeta() {
  try {
    const metaPath = path.join(process.cwd(), 'src/_data/categoryMeta.json');
    if (fs.existsSync(metaPath)) {
      return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    }
  } catch (e) {
    console.warn("Could not load category metadata:", e);
  }
  return {};
}

function buildCategoryNodes(posts, meta) {
  const nodes = {};

  posts.forEach((item) => {
    const category = getCategoryPathFromPost(item);

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
          parent: index > 0 ? parts.slice(0, index).join('/') : null,
          meta: {}
        };
      }

      if (index === parts.length - 1) {
        nodes[currentPath].posts.push(item);
      }
    });
  });

  Object.keys(nodes).forEach((key) => {
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

  return nodes;
}

function registerCollections(eleventyConfig) {
  eleventyConfig.addCollection("posts", (collectionApi) =>
    getPostsFromContentDir(collectionApi)
  );

  eleventyConfig.addCollection("categories", (collectionApi) => {
    const categories = {};

    getPostsFromContentDir(collectionApi).forEach((item) => {
      const category = getCategoryPathFromPost(item);

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
    const posts = getPostsFromContentDir(collectionApi);
    const meta = loadCategoryMeta();
    const nodes = buildCategoryNodes(posts, meta);
    return Object.values(nodes);
  });

  eleventyConfig.addCollection("categoryPages", (collectionApi) => {
    const posts = getPostsFromContentDir(collectionApi);
    const meta = loadCategoryMeta();
    const nodes = buildCategoryNodes(posts, meta);
    const pageSize = 10;
    const pages = [];

    Object.values(nodes).forEach((node) => {
      const sortedPosts = [...node.posts].sort((a, b) => b.date - a.date);
      const totalPages = Math.max(1, Math.ceil(sortedPosts.length / pageSize));
      const baseUrl = `/categories/${node.key}/`;
      const parts = node.key.split('/');
      const breadcrumbs = [];
      let parentPath = '';

      for (let i = 0; i < parts.length - 1; i++) {
        parentPath = parentPath ? `${parentPath}/${parts[i]}` : parts[i];
        const parentNode = nodes[parentPath];
        breadcrumbs.push({
          title: parentNode ? parentNode.title : parts[i],
          url: `/categories/${parentPath}/`
        });
      }

      const children = node.children
        .map((childKey) => {
          const child = nodes[childKey];
          return {
            title: child.title,
            url: `/categories/${childKey}/`,
            count: child.posts.length
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        const pagePosts = sortedPosts.slice(start, end);
        const url = pageNumber === 1 ? baseUrl : `${baseUrl}page/${pageNumber}/`;

        pages.push({
          key: node.key,
          title: node.title,
          url,
          baseUrl,
          pageNumber,
          totalPages,
          count: sortedPosts.length,
          posts: pagePosts,
          children,
          breadcrumbs,
          meta: node.meta || {}
        });
      }
    });

    return pages;
  });

  eleventyConfig.addCollection("folderGroups", (collectionApi) => {
    const folders = {};
    const posts = getPostsFromContentDir(collectionApi);

    const meta = loadCategoryMeta();

    // 1. Build category nodes per (folder + top-level category)
    const categoryNodes = {};
    
    posts.forEach((item) => {
        const category = getCategoryPathFromPost(item);
        
        const topLevelCategory = category.split('/')[0];
        const folder = getFolderNameFromPostPath(item);
        const nodeKey = `${folder}::${topLevelCategory}`;

        if (!categoryNodes[nodeKey]) {
            categoryNodes[nodeKey] = {
                title: topLevelCategory,
                url: `/categories/${topLevelCategory}/`,
                count: 0,
                posts: [],
                folder,
                description: meta[topLevelCategory] ? meta[topLevelCategory].description : ''
            };
        }
        
        categoryNodes[nodeKey].count++;
        categoryNodes[nodeKey].posts.push(item);
    });

    // 2. Group categories by folder
    Object.values(categoryNodes).forEach(node => {
        const folder = node.folder;

        if (!folders[folder]) {
            folders[folder] = {
                title: folder,
                categories: []
            };
        }
        folders[folder].categories.push(node);
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
    
    return Object.values(folders).sort((a, b) => {
        const getOrder = (title) => {
            for (const key in order) {
                if (title && title.startsWith(key)) return order[key];
            }
            return 999;
        };
        const orderA = getOrder(a.title);
        const orderB = getOrder(b.title);
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        
        // If same order (or both unknown), sort alphabetically
        return a.title.localeCompare(b.title);
    });
  });
}

module.exports = { registerCollections };
