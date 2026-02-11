/**
 * 站点核心文案配置文件
 * 该文件集中管理全站的静态文案、导航链接及品牌信息
 * 支持热更新，修改后无需重启服务器
 * 
 * @typedef {Object} LinkItem
 * @property {string} text - 显示文案
 * @property {string} url - 链接地址
 * @property {string} [icon] - 可选图标类名 (如 "fa-brands fa-github")
 * 
 * @typedef {Object} SiteConfig
 * @property {Object} brand - 品牌标识配置
 * @property {string} brand.logoText - Logo 文字
 * @property {string} brand.homeUrl - 点击 Logo 跳转地址
 * 
 * @property {Object} navigation - 导航菜单配置
 * @property {LinkItem[]} navigation.main - 主导航链接列表
 * 
 * @property {Object} footer - 页脚区域配置
 * @property {string} footer.copyrightOwner - 版权所有者名称
 * @property {string} footer.tagline - 底部标语 (如 "BUILT WITH...")
 * @property {LinkItem[]} footer.socialLinks - 社交媒体链接
 * 
 * @property {Object} meta - SEO 与基础元数据
 * @property {string} meta.title - 站点标题 (浏览器标签页)
 * @property {string} meta.description - 站点描述
 * @property {string} meta.author - 作者名
 * @property {string} meta.email - 联系邮箱
 * @property {string} meta.url - 站点完整 URL
 * @property {string} meta.lang - 语言代码
 */

/** @type {SiteConfig} */
const config = {
    brand: {
        logoText: "EcomInsight.dev",
        homeUrl: "/"
    },
    navigation: {
        main: [
            { text: "首页", url: "/" },
            { text: "知识库", url: "/categories/" },
            { text: "标签", url: "/tags/" },
            // { text: "实战案例", url: "/updates/" },
            { text: "最近更新", url: "/records/" },
            { text: "方法论", url: "/services/" },
            { text: "联系我", url: "/contact/" }
        ]
    },
    footer: {
        copyrightOwner: "2000922.xyz",
        tagline: "构建系统化的电商知识体系",
        socialLinks: [
            { text: "GitHub", url: "https://github.com/FXnadu", icon: "fa-brands fa-github" },
            { text: "Email", url: "mailto:deepwhite86@outlook.com", icon: "fa-solid fa-envelope" }
        ]
    },
    meta: {
        title: "2000922.xyz | 电商知识体系构建",
        description: "结构化、可迭代、长期沉淀的电商认知仓库。复盘电商运营策略、营销技巧与商业逻辑，形成可复用的知识框架。",
        author: "2000922.xyz",
        email: "contact@deepwhitex.dev",
        url: "2000922.xyz",
        lang: "zh-CN"
    }
};

module.exports = config;
