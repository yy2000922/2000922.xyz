
const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(require('eleventy-plugin-china-mirror'));

  // 配置 Passthrough Copy
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/static");

  // Filter: 格式化日期
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("yyyy-MM-dd");
  });

  // Filter: 格式化日期 (年)
  eleventyConfig.addFilter("year", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("yyyy");
  });

  // Collection: 所有文章 (posts 标签)
  // Eleventy 默认会处理 tags，但我们可以显式定义一个集合以便更灵活控制
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByTag("posts").sort((a, b) => b.date - a.date);
  });

  // Collection: 按 Category 分组
  eleventyConfig.addCollection("categories", function(collectionApi) {
    let categories = {};
    collectionApi.getFilteredByTag("posts").forEach(item => {
      let category = item.data.category;
      if(category) {
        if(!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(item);
      }
    });
    return categories;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
