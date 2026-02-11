const fs = require('fs');
const path = require('path');
const siteConfig = require('../../src/_data/siteConfig');
const DEFAULT_CATEGORY_DESCRIPTION = '暂无简介';

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

function getPostsFromContentDir(collectionApi) {
  return collectionApi
    .getAll()
    .filter((item) => {
      if (!item || !item.inputPath) return false;
      const normalizedPath = item.inputPath.split(path.sep).join('/');
      const isPostFile = normalizedPath.includes('/src/content/posts/') && normalizedPath.endsWith('.md');
      return isPostFile;
    })
    .sort((a, b) => b.date - a.date);
}

function getNumberFromFrontMatter(item, fieldName, fallbackValue) {
  const rawValue = item && item.data ? item.data[fieldName] : undefined;
  if (rawValue === undefined || rawValue === null || rawValue === '') return fallbackValue;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}

function comparePostsForCategoryPages(a, b) {
  // 仅分类详情页使用：支持通过 front matter 的 categoryOrder 自定义顺序。
  const orderA = getNumberFromFrontMatter(a, 'categoryOrder', Number.MAX_SAFE_INTEGER);
  const orderB = getNumberFromFrontMatter(b, 'categoryOrder', Number.MAX_SAFE_INTEGER);
  if (orderA !== orderB) return orderA - orderB;

  const dateDiff = b.date - a.date;
  if (dateDiff !== 0) return dateDiff;

  const titleA = a && a.data && a.data.title ? a.data.title : '';
  const titleB = b && b.data && b.data.title ? b.data.title : '';
  return titleA.localeCompare(titleB, 'zh-Hans-CN');
}

function loadJsonFileSafe(filePath, fallbackValue = {}) {
  try {
    if (!fs.existsSync(filePath)) return fallbackValue;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.warn(`[category-meta] Invalid JSON in ${filePath}. Using fallback.`, error.message);
    return fallbackValue;
  }
}

function normalizeMetaEntry(entry) {
  if (typeof entry === 'string') {
    const description = entry.trim() || DEFAULT_CATEGORY_DESCRIPTION;
    return { description };
  }

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  const description = typeof entry.description === 'string'
    ? (entry.description.trim() || DEFAULT_CATEGORY_DESCRIPTION)
    : DEFAULT_CATEGORY_DESCRIPTION;
  return { description };
}

function normalizeMetaObject(rawMeta, sourceLabel) {
  const normalized = { categories: {} };

  if (!rawMeta || typeof rawMeta !== 'object' || Array.isArray(rawMeta)) {
    if (rawMeta !== undefined) {
      console.warn(`[category-meta] Ignore non-object source: ${sourceLabel}`);
    }
    return normalized;
  }

  const hasNewShape = rawMeta.categories;

  if (hasNewShape) {
    const rawCategories = rawMeta.categories;
    if (rawCategories && typeof rawCategories === 'object' && !Array.isArray(rawCategories)) {
      Object.keys(rawCategories).forEach((categoryPath) => {
        const entry = normalizeMetaEntry(rawCategories[categoryPath]);
        if (entry) normalized.categories[categoryPath] = entry;
      });
    }

    return normalized;
  }

  // Legacy shape fallback: { "分类路径": { description } } or { "分类路径": "description" }
  Object.keys(rawMeta).forEach((categoryPath) => {
    const entry = normalizeMetaEntry(rawMeta[categoryPath]);
    if (entry) normalized.categories[categoryPath] = entry;
  });

  return normalized;
}

function mergeMetaObjects(...sources) {
  const merged = { categories: {} };

  sources.forEach((source) => {
    if (!source) return;

    Object.keys(source.categories || {}).forEach((categoryPath) => {
      merged.categories[categoryPath] = source.categories[categoryPath];
    });
  });

  return merged;
}

function loadCategoryMeta() {
  const settingsDir = path.join(process.cwd(), 'src/content/settings');
  const descriptionsPath = path.join(settingsDir, 'categoryDescriptions.json');

  const descriptions = normalizeMetaObject(loadJsonFileSafe(descriptionsPath), descriptionsPath);

  return mergeMetaObjects(descriptions);
}

function getCategoryMeta(meta, categoryPath) {
  const category = typeof categoryPath === 'string' ? categoryPath.trim() : '';
  const topLevelCategory = category.split('/')[0];

  if (meta.categories[category]) return meta.categories[category];
  if (meta.categories[topLevelCategory]) return meta.categories[topLevelCategory];

  return null;
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

    const metaEntry = getCategoryMeta(meta, key);
    if (metaEntry) {
      node.meta = metaEntry;
    }
  });

  return nodes;
}

function registerCollections(eleventyConfig) {
  const categoryPageSize = siteConfig.pagination && Number(siteConfig.pagination.categoryPageSize) > 0
    ? Number(siteConfig.pagination.categoryPageSize)
    : 10;

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
    const pageSize = categoryPageSize;
    const pages = [];

    Object.values(nodes).forEach((node) => {
      const sortedPosts = [...node.posts].sort(comparePostsForCategoryPages);
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
        const metaEntry = getCategoryMeta(meta, topLevelCategory);

        if (!categoryNodes[nodeKey]) {
            categoryNodes[nodeKey] = {
                title: topLevelCategory,
                url: `/categories/${topLevelCategory}/`,
                count: 0,
                posts: [],
                folder,
                description: metaEntry && metaEntry.description ? metaEntry.description : DEFAULT_CATEGORY_DESCRIPTION
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
