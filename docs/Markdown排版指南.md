# Markdown 排版支持指南

> 本文档基于 `astro.config.ts`、`uno.config.ts`、`src/site.config.ts` 与 `src/plugins/` 下的转换器源码整理，描述 immz.ink 博客**当前实际支持**的排版能力。
> 最后核对日期：2026-10-11（Astro 6.2 / astro-pure 1.4.6）；2026-10 新增警告块与代码高亮增强，见[博客版排版指南](../src/content/blog/markdown-guide/index.md)。

## 写作入口

- 文章放在 `src/content/blog/`，直接用 Obsidian 编辑（仓库已带 `.obsidian` 配置）。
- 支持 `.md` 和 `.mdx`。
- Frontmatter 字段（`src/content.config.ts`，超长会构建报错）：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 最长 60 字符 |
| `description` | ✅ | 最长 160 字符 |
| `publishDate` | ✅ | 如 `2025-07-03` |
| `updatedDate` | — | 更新时间 |
| `tags` | — | 列表，自动去重转小写 |
| `heroImage` | — | `{ src: './thumbnail.jpg', color: '#B4C6DA' }`，`color` 决定该页主色调 |
| `language` | — | 语言标记 |
| `draft` | — | `true` 时为草稿，不对外展示、无评论 |
| `comment` | — | 默认 `true`，关闭评论 |

### 站内写作约定

- 每篇文章开头放一条 AI 总结：`> [!NOTE/AI 速读]`，**50 字以内**；
- 转载/参考他人内容，文末用 `> [!NOTE/出处]` 注明原文链接与整理方式；
- 新文章发布日期按「每周 2 篇（周一、周四）」错开，避免同天扎堆；

## 一、基础排版（GFM，开箱即用）

| 语法 | 效果 / 备注 |
| --- | --- |
| `#` ~ `####` 标题 | 自动锚点 + 侧边栏 TOC，**无需手写目录** |
| `**粗体**` `_斜体_` `~~删除线~~` | 常规效果 |
| `[链接](url)` | 站外链接自动追加 `↗` |
| `` `行内代码` `` | modern 样式：边框、圆角、底色 |
| `> 引用` | 圆角边框 + 装饰引号，斜体 |
| 任务列表 `- [ ]` / `- [x]` | 复选框 |
| 表格 | 横向滚动 |
| 脚注 `[^1]` | 文末自动列出 |
| 智能标点 | smartypants 默认开启 |
| 阅读时长 | 自动计算 |

## 二、提示块（GFM 警告块）✅ 2026-10 新增

```markdown
> [!NOTE]
> 强调信息。

> [!TIP/自定义标题]
> 标题可替换（legacyTitle 扩展）。
```

- 五种类型：`NOTE` / `TIP` / `IMPORTANT` / `WARNING` / `CAUTION`，各有配色与图标；
- `[!NOTE/自定义标题]` 可改标题文字（斜杠后写新标题）；
- 语法与 GitHub、Obsidian callout 完全兼容，写作时可实时预览；
- 样式定义在 `src/assets/styles/global.css`（跟随站点亮暗主题）；
- 由 `remark-github-blockquote-alert` 插件实现（`astro.config.ts` remarkPlugins）。

## 三、图片

- 自动居中、圆角，mediumZoom 点击放大；
- 图片题注（caption）默认**未开启**，需要时在 `src/site.config.ts` 设 `imageCaption: true`。

## 四、数学公式（KaTeX）

- 行内 `$E = mc^2$`，块级 `$$...$$`；
- 博客端已就绪；**公众号导出时需单独适配**（多平台方案待做）。

## 五、代码块

每个代码块自动附带：明暗双主题高亮、行号、语言标签、复制按钮、超 15 行折叠。

### 5.1 标题

````markdown
```log title="hello.log"
```
````

值必须带引号。

### 5.2 行号高亮 ✅ 2026-10 新增

````markdown
```ts {2,4-5}
```
````

行号写进语言后的花括号（支持单个、逗号、区间），代码内容零污染。由 vendored `transformerMetaHighlight` 实现（`src/plugins/shiki-official/transformers.ts`）。

### 5.3 diff 语言 ✅ 2026-10 增强

````markdown
```diff
- 旧代码
+ 新代码
```
````

行首 `+` / `-` 自动获得绿/红行背景与行号栏标记。由 `transformerDiffLang` 实现（`src/plugins/shiki-custom-transformers.ts`）。

### 5.4 注释标记法（进阶，保留）

| 写在代码内 | 作用 |
| --- | --- |
| `// [!code highlight]` / `// [!code hl]` | 高亮当前行 |
| `// [!code highlight:3]` | 从当前行起高亮 3 行 |
| `// [!code ++]` / `// [!code --]` | 新增 / 删除行 |
| `// [\!code ...]` | 字面展示转义 |

## 六、当前**不支持**的排版

| 想要的效果 | 现状 |
| --- | --- |
| `==高亮标记==` | ❌ |
| 上下标 `H~2~O`、`x^2^` | ❌ |
| Mermaid 图表 | ❌ |
| 代码组 tabs / 步骤 steps | ❌（主题包内置插件未启用） |

## 附：相关文件

| 能力 | 实现位置 |
| --- | --- |
| 警告块插件 | `astro.config.ts` remarkPlugins + `src/assets/styles/global.css` |
| 代码高亮转换器 | `src/plugins/shiki-custom-transformers.ts`、`src/plugins/shiki-official/transformers.ts` |
| 排版样式 | `uno.config.ts`（preset-typography 定制） |
| 博客版指南（含实时渲染示例） | `src/content/blog/markdown-guide/index.md` |

---

*本文件为仓库内部参考文档，不参与站点构建。*
