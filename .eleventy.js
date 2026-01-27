
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItGitHubAlerts = require("markdown-it-github-alerts");
const { registerDateFilters } = require("./eleventy/config/filters");
const { registerCollections } = require("./eleventy/config/collections");
const { passthroughPaths } = require("./eleventy/config/passthrough");

module.exports = async function(eleventyConfig) {
  const { default: mermaidPlugin } = await import("@kevingimbel/eleventy-plugin-mermaid");

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(mermaidPlugin);

  passthroughPaths.forEach((path) => eleventyConfig.addPassthroughCopy(path));

  registerDateFilters(eleventyConfig);
  registerCollections(eleventyConfig);

  // Markdown Configuration
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true,
  };

  const mdLib = markdownIt(mdOptions)
    .use(markdownItGitHubAlerts.default);

  eleventyConfig.setLibrary("md", mdLib);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
