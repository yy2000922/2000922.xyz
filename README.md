# 2000922.xyz 内容站模板

这是一个基于 Eleventy 的内容模板。

对普通用户来说，日常只需要改两处：
- `/Users/warmwhite/Documents/deepwhitex-dev/src/content/posts/`：写文章
- `/Users/warmwhite/Documents/deepwhitex-dev/src/content/settings/`：改站点文案和分类简介

## 用户只需要做什么

1. 写文章
2. 需要改分类简介时，改配置

除此之外（布局、样式、构建脚本），默认不需要动。

## 如何写文章

在 `/Users/warmwhite/Documents/deepwhitex-dev/src/content/posts/` 下新建 `.md` 文件。

示例：

```md
---
title: "你的文章标题"
category: "市场调研基础"
description: "这篇文章的摘要"
# 可选：tags, date, categoryOrder
---

这里写正文，使用 Markdown 即可。
```

字段说明：
- `title`：必填，文章标题
- `category`：建议填写，用于分类页归档
- `description`：建议填写，用于列表摘要
- `date`：可选，不填时默认用文件最后修改时间
- `categoryOrder`：可选，仅影响分类详情页内排序（数字越小越靠前）

## 如何设置分类简介

分类简介在：
- `/Users/warmwhite/Documents/deepwhitex-dev/src/content/settings/categoryDescriptions.json`

格式示例：

```json
{
  "categories": {
    "市场调研基础": {
      "description": "用于沉淀调研方法、问卷设计与竞品分析框架。"
    }
  }
}
```

默认情况下，`npm run build` 会自动执行一次分类同步（等价于先跑 `npm run sync-meta`）。

你也可以单独手动执行：

```bash
npm run sync-meta
```

该命令会把缺失分类补到 `categoryDescriptions.json`，你再补 `description` 即可。

## 站点基础文案在哪里改

文件：
- `/Users/warmwhite/Documents/deepwhitex-dev/src/content/settings/siteConfig.js`

常改区域：
- `brand`：站点名称
- `navigation`：顶部导航
- `footer`：页脚信息
- `meta`：SEO 标题、描述、站点 URL、邮箱
- `pages`：各页面标题与文案

## 本地预览与构建

安装依赖：

```bash
npm install
```

本地预览：

```bash
npm start
```

构建静态站点：

```bash
npm run build
```

输出目录：`/Users/warmwhite/Documents/deepwhitex-dev/_site/`
