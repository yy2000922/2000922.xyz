# 项目结构准则（持续更新）

用于保持目录、样式和模板职责清晰，避免再次混乱。

## 配置与构建
- `.eleventy.js` 只做“装配”：加载插件、调用 `eleventy/config` 下的注册函数、声明 passthrough 路径。
- 过滤器/集合/静态拷贝分别放在 `eleventy/config/filters.js`、`collections.js`、`passthrough.js`；新增能力请按文件职责拆分，不要混写。

## 数据层
- 站点级元数据、社交链接、导航等统一放在 `src/_data/`，模板只消费数据，不直接读 `env`。
- 新的全局数据优先集中在现有文件（如 `metadata.js`、`navigation.json`），保持“单一真相来源”。

## 模板与布局
- 基础骨架是 `src/_includes/layouts/base.njk`，内部只 include 头部/导航/页脚等 partial；禁止在布局里写业务内容。
- 公共区块拆成 partial（`src/_includes/partials/`），多处复用的结构/宏也放这里，避免在页面内复制粘贴。
- 页面/文章只放内容与少量页面级元数据，不嵌入全局样式或脚本。

## 样式
- `src/assets/css/style.css` 仅聚合导入；基础变量与 reset 在 `foundation.css`，骨架布局在 `layout.css`，组件/区块在 `components.css`，代码/表格/Prism 在 `code.css`。
- 新增样式优先按职能落位（组件放 components，布局放 layout），避免把所有规则堆进入口。
- 禁止在模板内写行内样式；需要新组件请先抽象命名后再写样式。

## JavaScript
- 入口 `src/assets/js/main.js` 提供 `onReady` 与 `boot` 钩子，保持最小全局作用域；新增行为请封装函数，再在 `boot` 中挂载。
- 交互尽量与具体组件耦合（按文件或模块拆分），不要在全局随手添加零散逻辑。

## 其他约定
- 新的静态直出资源（图标/manifest 等）走 `passthrough.js` 声明；构建产物一律在 `_site`（默认输出路径）。
- 内容文件与模板分离：Markdown/Nunjucks 页面放 `src/content/`，布局/partial 不放业务内容。
- 命名保持一致、简短、可搜索；遇到需要跨区域修改时，优先抽象成公共模块再落地。
