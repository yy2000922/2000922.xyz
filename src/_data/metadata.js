const siteConfig = require("./siteConfig");

module.exports = {
    title: siteConfig.meta.title,
    url: siteConfig.meta.url,
    language: siteConfig.meta.lang,
    description: siteConfig.meta.description,
    author: {
        name: siteConfig.meta.author,
        email: siteConfig.meta.email,
        url: siteConfig.meta.url
    },
    socials: siteConfig.footer.socialLinks.map(link => ({
        name: link.text,
        url: link.url
    }))
}; 