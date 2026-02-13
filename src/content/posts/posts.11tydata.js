function normalizeSlugToTitle(slug) {
  if (typeof slug !== 'string') return '';
  return slug.replace(/[-_]+/g, ' ').trim();
}

module.exports = {
  eleventyComputed: {
    title: (data) => {
      const rawTitle = typeof data.title === 'string' ? data.title.trim() : '';
      if (rawTitle) return rawTitle;

      const fileSlug = data && data.page ? data.page.fileSlug : '';
      const fallbackTitle = normalizeSlugToTitle(fileSlug);
      return fallbackTitle || '未命名文章';
    }
  }
};
