/**
 * 全站统一配置（给内容运营/非开发同学使用）
 *
 * 使用说明：
 * 1) 尽量只改 value，不改 key（字段名）。
 * 2) URL 建议以 "/" 开头，例如 "/contact/"。
 * 3) 分页文案里的占位符：{current} 当前页，{total} 总页数。
 */
const config = {
    // 顶部 logo 文案和点击跳转
    brand: {
        logoText: "2000922.xyz",
        homeUrl: "/"
    },

    // 顶部导航菜单（按顺序展示）
    navigation: {
        main: [
            { text: "首页", url: "/" },
            { text: "知识库", url: "/categories/" },
            { text: "最近更新", url: "/records/" },
            { text: "方法论", url: "/services/" },
            { text: "联系我", url: "/contact/" }
        ]
    },

    // 页脚内容
    footer: {
        copyrightOwner: "2000922.xyz",
        tagline: "构建系统化的电商知识体系",
        socialLinks: [
            { text: "GitHub", url: "https://github.com/FXnadu", icon: "fa-brands fa-github" },
            { text: "Email", url: "mailto:contact@2000922.xyz", icon: "fa-solid fa-envelope" }
        ]
    },

    // SEO / 基础站点信息
    meta: {
        title: "2000922.xyz | 电商知识体系构建",
        description: "结构化、可迭代、长期沉淀的电商认知仓库。复盘电商运营策略、营销技巧与商业逻辑，形成可复用的知识框架。",
        author: "2000922.xyz",
        email: "contact@2000922.xyz",
        url: "2000922.xyz",
        lang: "zh-CN"
    },

    // 全站分页参数
    pagination: {
        // 归档页每页数量
        archivePageSize: 20,
        // 分类详情页每页数量
        categoryPageSize: 10,
        // 最近更新页展示数量
        recordsPageSize: 8,

        // 分页按钮文案
        labels: {
            previousPage: "← 上一页",
            nextPage: "下一页 →",
            // 可使用 {current}/{total} 占位符
            pageIndicator: "第 {current} / {total} 页"
        }
    },

    // 各页面文案与模块内容
    pages: {
        // 首页
        home: {
            title: "首页",
            hero: {
                title: "构建系统化的电商知识体系",
                subtitle: "结构化、可迭代、长期沉淀的电商认知仓库",
                descriptionLines: [
                    "复盘电商运营策略、营销技巧与商业逻辑，形成可复用的知识框架。",
                    "不依赖碎片信息，建立系统性思考。"
                ]
            },
            audience: {
                title: "适合谁",
                items: [
                    {
                        icon: "fa-solid fa-rocket",
                        title: "电商创业者",
                        description: "系统梳理商业模式与运营策略，规避盲目试错。"
                    },
                    {
                        icon: "fa-solid fa-users-gear",
                        title: "产品经理",
                        description: "深入理解电商产品逻辑与用户需求，优化交易链路。"
                    },
                    {
                        icon: "fa-solid fa-chart-line",
                        title: "运营操盘手",
                        description: "沉淀实战经验与方法论，提升流量获取与转化效率。"
                    },
                    {
                        icon: "fa-solid fa-book-open-reader",
                        title: "电商学习者",
                        description: "构建完整的电商知识图谱，从零开始建立专业认知。"
                    }
                ]
            },
            features: {
                title: "核心知识模块",
                items: [
                    {
                        title: "知识框架",
                        description: "按商品、流量、转化、服务等维度拆解电商业务全貌。",
                        url: "/categories/"
                    },
                    {
                        title: "最近笔记",
                        description: "最近的思考，数据分析、竞品调研与趋势洞察。",
                        url: "/records/"
                    },
                    {
                        title: "方法论",
                        description: "经过验证的电商运营SOP与体系构建服务。",
                        url: "/services/"
                    }
                ]
            },
            closing: {
                label: "开始构建",
                // 使用 \n 控制换行
                headline: "告别零散的经验\n建立你的电商作战地图",
                description: "不仅是阅读，更是思考与实践的起点。我们提供结构化的知识索引，助你快速找到破局的关键点。",
                actionText: "浏览知识库",
                actionUrl: "/categories/"
            }
        },

        // 知识库概览页
        categories: {
            title: "知识库",
            sidebarTitle: "淘宝天猫运营百科全书",
            docUnit: "篇文档"
        },

        // 分类详情页
        categoryDetail: {
            allLabel: "全部",
            docUnit: "篇文档",
            backToOverview: "← 返回分类概览"
        },

        // 最近更新页
        records: {
            title: "最近更新",
            subtitle: "碎片化的思考汇总。关于市场洞察、数据分析与竞品调研。",
            archiveButtonText: "查看归档",
            archiveButtonUrl: "/archive/"
        },

        // 归档页
        archive: {
            title: "归档",
            subtitle: "时间长河中的所有足迹。"
        },

        // 方法论页
        services: {
            title: "方法论",
            headerTitle: "Methodology.",
            subtitleBackground: "电商运营方法论",
            headerMetaLines: ["从底层逻辑出发", "构建可复制的增长模型"],
            items: [
                {
                    number: "01",
                    title: "商品管理体系",
                    description: "商品是电商的核心。我们建立全生命周期的商品管理SOP，从选品逻辑到库存周转，确保货盘健康高效。",
                    bullets: [
                        "爆品挖掘与选品策略",
                        "定价心理学与价格带布局",
                        "动销率分析与库存优化"
                    ]
                },
                {
                    number: "02",
                    title: "全渠道营销策略",
                    description: "流量碎片化时代，单一渠道已难以为继。我们构建跨平台的流量矩阵，实现用户资产的有效沉淀。",
                    bullets: [
                        "内容营销与种草逻辑 (小红书/抖音)",
                        "私域流量搭建与用户留存",
                        "付费投流ROI优化模型"
                    ]
                },
                {
                    number: "03",
                    title: "数据分析与决策",
                    description: "拒绝拍脑袋决策。建立基于数据的反馈闭环，让每一次优化都有据可依。",
                    bullets: [
                        "核心指标体系搭建 (GMV拆解)",
                        "用户行为路径分析 (Funnel)",
                        "竞品监测与市场趋势洞察"
                    ]
                },
                {
                    number: "04",
                    title: "供应链优化",
                    description: "供应链是电商的护城河。优化供应端流程，降低履约成本，提升用户体验。",
                    bullets: [
                        "柔性供应链与快速返单机制",
                        "物流成本控制与时效管理",
                        "供应商评级与合作深度管理"
                    ]
                },
                {
                    number: "05",
                    title: "常见问题库",
                    description: "在实际运营过程中，如果你遇到具体的执行难题，可以参考我们的实战FAQ库。",
                    linkText: "查看实战问答 ->",
                    linkUrl: "/posts/faq/"
                }
            ],
            cta: {
                title: "Ready to scale? ",
                linkText: "获取定制化方案 ->",
                linkUrl: "/contact/"
            }
        },

        // 联系页
        contact: {
            title: "联系我",
            subtitle: "有项目想法？或者只是想聊聊技术？随时欢迎。",
            responseTimeText: "通常在 24 小时内回复。",
            sections: {
                emailTitle: "Email",
                imTitle: "即时通讯",
                socialTitle: "Social"
            },
            email: {
                // 前端会拼成 user@domain 并做简单防爬处理
                user: "youremail",
                domain: "outlook.com"
            },
            im: {
                wechat: "yourwechat",
                qq: "1234567"
            },
            socials: [
                { text: "Twitter / X ->", url: "#" },
                { text: "GitHub ->", url: "#" },
                { text: "LinkedIn ->", url: "#" }
            ]
        }
    }
};

module.exports = config;
