function registerCollections(eleventyConfig) {
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByTag("posts").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("categories", (collectionApi) => {
    const categories = {};

    collectionApi.getFilteredByTag("posts").forEach((item) => {
      const category = item.data.category;
      if (!category) return;

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });

    return categories;
  });
}

module.exports = { registerCollections };
