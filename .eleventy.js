const chinaMirror = require("eleventy-plugin-china-mirror");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { registerDateFilters } = require("./eleventy/config/filters");
const { registerCollections } = require("./eleventy/config/collections");
const { passthroughPaths } = require("./eleventy/config/passthrough");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(chinaMirror);
  eleventyConfig.addPlugin(syntaxHighlight);

  passthroughPaths.forEach((path) => eleventyConfig.addPassthroughCopy(path));

  registerDateFilters(eleventyConfig);
  registerCollections(eleventyConfig);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
