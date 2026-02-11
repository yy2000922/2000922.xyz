# DeepWhiteX.dev - 个人记录型网站

这是一个专为个人用户设计的记录型中文网站模板，基于 [Eleventy](https://www.11ty.dev/) (11ty) 构建。

## 🎯 设计意图

本项目的核心目标是提供一个**长期可用、易于维护、专注于内容**的个人知识库与博客系统。

1.  **记录优先 (Content First)**
    *   专为长期记录设计，无论是技术笔记、生活随笔还是项目文档。
    *   内容格式采用通用的 **Markdown**，确保数据的所有权完全归属于你，即使未来更换工具，内容也能轻松迁移（无厂商锁定）。

2.  **长期可用 (Long-term Availability)**
    *   采用**静态站点生成 (SSG)** 技术。网站最终生成为纯静态的 HTML/CSS/JS 文件。
    *   **无需数据库**，无需复杂的后端服务。
    *   可以部署在 GitHub Pages, Cloudflare Pages, Vercel, Netlify 等任何静态托管平台，甚至可以直接在本地硬盘或 U 盘中运行浏览。

3.  **极简维护 (Easy Maintenance)**
    *   **结构清晰**：代码（模板/样式）与内容（文章/数据）完全分离。你只需要关注 `src/content` 目录下的内容创作。
    *   **轻量级**：核心依赖少，构建速度快。

4.  **中文友好**
    *   默认语言配置为 `zh-CN`。
    *   针对中文内容的排版和结构进行了预设。

## 🚀 快速开始

### 1. 安装依赖

确保你的环境中已安装 Node.js。

```bash
npm install
```

### 2. 本地开发

启动本地开发服务器，支持热重载：

```bash
npm start
```
访问 `http://localhost:8080` 即可预览。

### 3. 构建生产版本

生成最终的静态文件到 `_site` (默认) 或 `dist` 目录（视配置而定）：

```bash
npm run build
```

## 📂 目录结构与内容管理

项目遵循模块化设计，详情可参考 [docs/目录规范.md](docs/目录规范.md)。以下是核心目录说明：

### `src/` (源码目录)

这是你主要工作的目录。

*   **`content/` (内容源)**
    *   这是存放你所有文章和页面的地方。
    *   `posts/`：存放博客文章 (`.md` 文件)。
    *   `pages/`：存放独立页面（如关于页 `about.njk`, 归档页 `archive.njk`）。

*   **`_data/` (全局数据)**
    *   `metadata.js`：**站点核心配置**。修改这里的标题、作者、描述、URL，即可全局生效。
    *   `navigation.json`：配置网站导航菜单。

*   **`_includes/` (模板与布局)**
    *   `layouts/`：页面骨架。例如 `base.njk` 是基础布局。如果你懂 HTML/Nunjucks，可以在这里修改网站结构。

*   **`assets/` (静态资源)**
    *   存放 CSS, JavaScript 和图片文件。

### 根目录文件

*   `.eleventy.js`：Eleventy 的构建配置文件。
*   `package.json`：项目依赖管理。

## 📝 如何写文章

在 `src/content/posts/` 目录下创建一个新的 `.md` 文件，例如 `my-first-post.md`。

文件开头必须包含 **Frontmatter**（元数据）：

```yaml
---
title: "我的第一篇文章"
date: 2024-01-22
tags: ["生活"] # 可选
category: "随笔"
description: "这是文章的简短描述，会显示在列表中。"
layout: layouts/base.njk
---

这里是文章的正文内容。

你可以使用 **Markdown** 语法：
- 列表
- [链接](https://example.com)
- 代码块
```

## 🛠️ 自定义配置

*   **修改网站标题/作者**：打开 `src/_data/metadata.js` 修改。
*   **修改导航栏**：打开 `src/_data/navigation.json` 修改。

---
*Powered by Eleventy*
