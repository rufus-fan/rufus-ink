---
title: Markdown 排版指南：本站写作语法速查
publishDate: 2026-08-24
description: 一文速览本站 Markdown 的全部排版能力：警告块、代码行高亮、diff 对比、数学公式、表格与图片等，附写作规范建议。
tags:
  - Markdown
  - 写作
  - 博客
language: 中文
heroImage:
  src: ./thumbnail.jpg
  color: '#B4C6DA'
---

> [!NOTE/AI 速读]
> 本站 Markdown 排版能力全景速查：五种警告块、三种代码高亮方式、数学公式、表格图片与写作规范，收藏备查。

写文章时最打断心流的事，莫过于「这个效果支持吗？语法是什么？」。这篇指南把本站支持的排版语法一次性整理清楚，每个例子都是实时渲染的真实效果，可以当速查表用。

## 提示块：五种彩色警告块

在引用块第一行写 `[!类型]` 即可，标题可自定义（`[!NOTE/我的标题]`）：

```markdown
> [!NOTE]
> 强调读者应该关注的信息。

> [!TIP/小技巧]
> 标题可以换成自己的话。

> [!IMPORTANT]
> 用户必须知道的关键信息。

> [!WARNING]
> 紧急程度不高，但不遵守可能出问题。

> [!CAUTION]
> 不这么做会带来负面后果。
```

渲染效果：

> [!NOTE]
> 强调读者应该关注的信息。

> [!TIP/小技巧]
> 标题可以换成自己的话。

> [!IMPORTANT]
> 用户必须知道的关键信息。

> [!WARNING]
> 紧急程度不高，但不遵守可能出问题。

> [!CAUTION]
> 不这么做会带来负面后果。

这套语法与 GitHub、Obsidian 完全兼容：在 Obsidian 里写作时直接预览，粘贴到 GitHub 也原样渲染。

## 代码块

### 基础写法与自动装饰

````markdown
```ts
const answer = 42
```
````

每个代码块自动附带：明暗双主题语法高亮（跟随站点主题）、行号、右上角语言标签、悬停出现的复制按钮；超过 15 行自动折叠，点击展开。

### 给代码块起标题

````markdown
```log title="hello.log"
test
```
````

值必须带引号。效果：

```log title="hello.log"
test
```

### 行号高亮（推荐）

把行号写在语言后面的花括号里，代码内容保持干净：

````markdown
```ts {2,4-5}
function greet(name: string) {
  const message = `Hello, ${name}!`
  console.log(message)
  return message
}
```
````

渲染效果（第 2、4、5 行高亮）：

```ts {2,4-5}
function greet(name: string) {
  const message = `Hello, ${name}!`
  console.log(message)
  return message
}
```

### diff 对比

直接用 `diff` 语言，行首 `+` / `-` 标记增删：

````markdown
```diff
- const port = 3000
+ const port = process.env.PORT ?? 3000
```
````

```diff
- const port = 3000
+ const port = process.env.PORT ?? 3000
```

### 进阶：注释标记法

把标记写进代码注释里，适合「高亮某一行并说明原因」的场景，标记渲染时自动隐藏：

- `// [!code highlight]` 或 `// [!code hl]`：高亮当前行
- `// [!code ++]` / `// [!code --]`：标记新增 / 删除行
- `// [\!code ...]`：需要字面展示时转义

```python
def transfer(src, dst):
    validate(src)              # [!code highlight]
    dst.write(src.read())      # [!code ++]
    # legacy_copy(src, dst)    # [!code --]
```

## 数学公式

行内公式 `$E = mc^2$`，块级公式用双美元符号：

$$
\int_a^b f(x)\,dx = F(b) - F(a)
$$

## 基础排版速查

| 语法 | 效果 |
| --- | --- |
| `**粗体**` `_斜体_` `~~删除线~~` | **粗体** _斜体_ ~~删除线~~ |
| `` `行内代码` `` | 带边框底色的现代样式 |
| `[链接](https://immz.ink)` | 站外链接自动追加 ↗ |
| `> 引用` | 圆角边框 + 装饰引号 |
| `- [ ] 任务` / `- [x] 任务` | 复选框列表[^task] |
| `~~脚注~~` 见文末 | 脚注自动列在文章底部 |
| `---` | 分割线 |

[^task]: 任务列表语法：`- [x] 已完成`、`- [ ] 未完成`。

表格支持横向滚动；图片自动居中、圆角，点击可放大。

## 写作规范

文章 frontmatter 字段与约束：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 最长 60 字符 |
| `description` | ✅ | 最长 160 字符 |
| `publishDate` | ✅ | 发布日期 |
| `tags` | — | 列表，自动去重 |
| `heroImage` | — | `{ src: './thumbnail.jpg', color: '#B4C6DA' }` |
| `draft` | — | `true` 时为草稿 |

几个建议：

- 标题层级从 `##` 开始（`#` 留给文章标题），层级不跳档；
- 每篇文章开头放一条 `[!NOTE/AI 速读]` 提示块，50 字以内概括全文；
- 超过 15 行的代码考虑拆段讲解，别让折叠按钮替你藏问题；
- 转载或参考他人内容时，在文末用提示块注明出处。

> [!TIP]
> 本站基于 [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) 构建，语法能力由 [remark](https://github.com/remarkjs/remark) 生态与 [Shiki](https://shiki.style/) 高亮引擎提供。
