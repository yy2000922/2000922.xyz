---
title: "Markdown 语法全能测试：探索排版与样式的极限"
date: 2024-05-20
description: "这是一篇专门用于测试 Markdown 各种语法渲染效果的文章。涵盖了标题、列表、代码块、表格、引用、数学公式（如果支持）等多种元素，旨在验证主题对复杂内容的处理能力。"
tags: ["测试", "Markdown", "排版"]
category: "默认分类"
layout: layouts/post.njk
---

欢迎来到 **Markdown 语法全能测试**。这篇文章的目的不仅仅是展示内容，更是为了**极限测试**当前主题的 CSS 样式表现。我们将遍历几乎所有常见的 Markdown 语法。

---

## 1. 文本排版 (Typography)

### 强调与修饰
Markdown 支持多种文本修饰方式：
- **加粗 (Bold)**：用来强调重要概念。
- *斜体 (Italic)*：通常用于引用或外语词汇。
- ***粗斜体 (Bold Italic)***：极少使用，但确实存在。
- ~~删除线 (Strikethrough)~~：表示已过时或错误的内容。
- `行内代码 (Inline Code)`：用于标记 `variable`、`function()` 或文件路径。

### 引用 (Blockquotes)
> 这是一个标准的一级引用。它通常用于摘录名言或强调某段文字。
>
> 它可以包含多个段落。
> > 这是一个嵌套的二级引用。
> > 用来展示层级关系。

---

## 2. 列表 (Lists)

### 无序列表
*   **核心要素**：
    *   一致性
    *   反馈
    *   效率
*   **视觉层级**：
    *   一级菜单
        *   二级子菜单
            *   三级详情

### 有序列表
1.  **第一步**：初始化项目。
2.  **第二步**：安装依赖。
    1.  运行 `npm install`
    2.  检查 `node_modules`
3.  **第三步**：启动服务。

### 任务列表 (Task Lists)
- [x] 完成首页重构
- [x] 修复样式 Bug
- [ ] 编写测试文档
- [ ] 发布新版本

---

## 3. 代码块 (Code Blocks)

下面是一段 **JavaScript** 代码，用于测试语法高亮：

```javascript
// 计算斐波那契数列
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const n = 10;
console.log(`Fibonacci of ${n} is ${fibonacci(n)}`);
```

再来一段 **CSS**：

```css
.hero-title {
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-primary);
    /* 这是一个注释 */
    transition: color 0.3s ease;
}
```

还有 **Rust**：

```rust
fn main() {
    println!("Hello, Markdown!");
    let x = 5;
    let y = 10;
    println!("x + y = {}", x + y);
}
```

---

## 4. 表格 (Tables)

表格通常用于展示结构化数据。请注意表头的对齐方式：

| 包含左对齐 | 居中对齐 | 右对齐 |
| :--- | :---: | ---: |
| 单元格内容 | 单元格内容 | $1,234.56 |
| 很长的内容会导致换行吗？ | 简短 | 100% |
| `Code` | **Bold** | [链接](#) |

---

## 5. 媒体与链接 (Media & Links)

### 图片
这是一张占位图片，测试图片容器的宽度限制和说明文字样式：

![占位图片示例](https://placehold.co/800x400/e5e5e5/666666?text=Markdown+Image+Test)

### 超链接
- [访问 Eleventy 官网](https://www.11ty.dev/)
- [回到首页](/)
- 一个裸链接：https://deepwhitex.dev

---

## 6. 其他元素 (Misc)

### 分割线
上面的分割线已经展示过了，这里再来一次：

***

### 脚注 (Footnotes)
这是一个带有脚注的句子[^1]。这是另一个[^2]。

### 定义列表 (Definition Lists)
Markdown
: 一种轻量级标记语言。

Eleventy
: 一个更简单的静态站点生成器。

[^1]: 这是第一个脚注的解释。
[^2]: 这是第二个脚注，通常在页面底部渲染。

---

## 7. 标题层级 (Headings)

# H1 标题
## H2 标题
### H3 标题
#### H4 标题
##### H5 标题
###### H6 标题

---

## 8. HTML 元素支持

如果 Markdown 解析器允许 HTML，下面的元素应该能正常显示：

- <kbd>Ctrl</kbd> + <kbd>C</kbd> (键盘输入)
- <abbr title="HyperText Markup Language">HTML</abbr> (缩写)
- <mark>高亮文本</mark> (Mark)
- <sub>下标</sub> (Subscript): H<sub>2</sub>O
- <sup>上标</sup> (Superscript): E=mc<sup>2</sup>
- <ins>插入文本</ins> (Inserted)
- <del>删除文本</del> (Deleted)

<details>
<summary>点击展开查看更多详情 (Details/Summary)</summary>

这里是隐藏的内容。通常用于折叠长段落或代码。

```json
{
  "key": "value"
}
```
</details>

---

## 9. 扩展语法 (Extended Syntax)

*注意：这些语法依赖于特定的 Markdown 插件或解析器配置，可能无法在所有环境中渲染。*

### 表情符号 (Emoji)
:smile: :heart: :thumbsup: :rocket:

### 数学公式 (Math)
行内公式：$E = mc^2$ (如果支持)

块级公式：
$$
\sum_{i=1}^n i = \frac{n(n+1)}{2}
$$

### GFM 警告块 (Alerts)

> [!NOTE]
> 这是一个提示块。

> [!TIP]
> 这是一个建议块。

> [!WARNING]
> 这是一个警告块。

> [!IMPORTANT]
> 这是一个重要信息块。

---

## 10. 长文本测试

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

中文长文本测试：
这是一个非常长的段落，旨在测试文本在容器中的换行表现。当屏幕宽度变窄时，这段文字应该能够优雅地自动换行，而不会溢出容器。排版不仅仅是关于字体的选择，更关乎阅读体验的舒适度。行高（line-height）、字间距（letter-spacing）以及段落间距（margin-bottom）都需要精心调教。

```
这是一个非常长的单行代码块，用来测试代码块的横向滚动条是否正常工作。如果你看到了滚动条，说明样式设置正确。
```

