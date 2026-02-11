const { DateTime } = require("luxon");

const toUtcDate = (dateObj) => DateTime.fromJSDate(dateObj, { zone: "utc" });

function registerDateFilters(eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (dateObj) =>
    toUtcDate(dateObj).toFormat("yyyy-MM-dd")
  );

  eleventyConfig.addFilter("htmlDateString", (dateObj) =>
    toUtcDate(dateObj).toFormat("yyyy-MM-dd")
  );

  eleventyConfig.addFilter("year", (dateObj) =>
    toUtcDate(dateObj).toFormat("yyyy")
  );

}

function registerTitleFilters(eleventyConfig) {
  eleventyConfig.addFilter("formatTitle", (title, siteTitle, sep = " | ") => {
    const s = siteTitle ? String(siteTitle) : "";
    if (!title) return s;
    const t = String(title);
    if (!s) return t;
    return t.includes(s) ? t : `${t}${sep}${s}`;
  });
}

module.exports = { registerDateFilters, registerTitleFilters };
