# immz.ink 博客产品需求文档（PRD）

| 项 | 值 |
| --- | --- |
| 产品 | Rufus' ink 个人博客（immz.ink） |
| 文档版本 | v1.0 |
| 最后更新 | 2026-10-11 |
| 文档定位 | 站点**唯一产品事实来源**：除文章正文外，所有需维护、可迭代的内容均在此登记 |

---

## 0. 本文档的使用方式（给 AI 的协作协议）

本 PRD 的用途：**用户更新本文档 → 大模型按文档实施改动 → 实施后回写文档**。

1. **输入**：用户修改本文档中的配置值、状态标记、Backlog 勾选项，或新增需求描述，然后将改动交给 AI。
2. **实施**：AI 依据各模块标注的「维护入口」（= 需要修改的文件路径）定位代码并实施；本文档描述与代码冲突时，**以代码现状为准**，但须在「变更记录」中登记差异。
3. **回写**：实施完成后，AI 更新本文档对应章节的状态、最后核对日期，并在文末「变更记录」追加一行。
4. **范围**：本文档不登记文章正文内容（正文在 `src/content/blog/` 中自治），只登记内容规范（frontmatter schema、写作约定）与文章元信息清单。

状态标记约定：

| 标记 | 含义 |
| --- | --- |
| ✅ | 已上线，正常运作 |
| 🚧 | 开发中 |
| ⏸️ | 功能存在但被开关/注释暂时停用 |
| ❌ | 明确不支持 |
| 📋 | 计划中（见 Backlog） |
| ⚠️ | 存在问题（见「已知问题与技术债」） |

---

## 1. 产品概述

### 1.1 定位

个人博客 + 个人品牌主页。作者 Rufus（产品经理 / 用户增长方向，坐标杭州），站点承担三个职责：

1. **内容发布**：原创文章（AI 工程、计算机基础、方法论、产品实践），RSS 订阅；
2. **个人展示**：职业经历、项目作品、工具箱、社交媒体入口；
3. **多平台分发的母版**（规划中）：以站内文章为源，向微信公众号等平台导出。

### 1.2 站点信息一览

| 项 | 值 | 维护入口 |
| --- | --- | --- |
| 站点域名 | `https://immz.ink` | `astro.config.ts` `site` |
| 站点标题 | `Rufus' ink`（现值含尾随空格 ⚠️ T9） | `src/site.config.ts` `title` |
| 作者 | Rufus | `src/site.config.ts` `author` |
| 站点描述 | Stay hungry, stay foolish | `src/site.config.ts` `description` |
| 语言 | zh-CN（日期格式 2026年10月11日） | `src/site.config.ts` `locale` |
| 代码仓库 | `github.com/rufus-fan/rufus-ink`（本地 `/Users/rufus/project/immz`） | git remote |
| 托管 & CI/CD | Vercel（push main 自动部署） | Vercel 控制台 |
| 域名注册商 | 阿里云 | — |
| ICP 备案 | 浙ICP备2025212685号-3（2026-10-11 起页脚不再展示，站点托管 Vercel） | —（原 `src/site.config.ts` `footer.links` 已清空） |
| 评论/浏览量 | Waline，服务端 `https://rufus-ink-waline.vercel.app/`，数据库 Neon | `src/site.config.ts` `integ.waline` |
| npm CDN 前缀 | `https://cdn.jsdelivr.net/npm`（Waline 表情包等） | `src/site.config.ts` `npmCDN` |
| 粉丝数统计 | Substats（`https://api.swo.moe/stats/*`） | `src/pages/about/index.astro` |
| 一言（页脚引言） | Hitokoto `https://v1.hitokoto.cn/?c=i` | `src/site.config.ts` `integ.quote` |

### 1.3 设计原则

- **主题不动原则**：astro-pure 主题以 npm 包引入，不修改主题源码；所有定制通过本仓库覆盖层实现（见 2.2）。
- **内容与配置分离**：改文案/数据只动配置或 md，不动组件逻辑。
- **构建即校验**：frontmatter 超长、图片缺失等在构建期直接报错，本地 `bun run build` 通过是发布前提。

---

## 2. 技术架构

### 2.1 技术栈

| 层 | 技术 | 版本 | 说明 |
| --- | --- | --- | --- |
| 框架 | Astro | 6.2.1 | output: server（SSR）+ 指定页面预渲染 |
| 主题 | astro-pure | 1.4.6 | npm 包模式（非模板复制） |
| 样式 | UnoCSS（presetMini + presetTypography） | 随主题 | 配置在根 `uno.config.ts` |
| 部署 | @astrojs/vercel | 10.0.6 | imageService: true（`/_vercel/image`） |
| 运行时/包管理 | Bun | 1.4.3 | 本地 `~/.bun/bin`，需 export PATH |
| 语言 | TypeScript（strict via astro check） | 6.0.3 | `bun run build` 含双重类型检查 |
| 图像 | sharp | 0.34.5 | 响应式图片服务 |
| 数学 | remark-math + rehype-katex + katex | — | 公式渲染 |
| 警告块 | remark-github-blockquote-alert | 2.1.0 | 开启 legacyTitle |
| 评论 | @waline/client | 3.13.x | 见第 7 章 |
| 搜索 | Pagefind（主题集成） | — | `integ.pagefind: true` |
| RSS | @astrojs/rss | 4.0.18 | 全文输出 |

### 2.2 架构模式：npm 主题 + 覆盖层（重要）

- 主题 `astro-pure` 通过 `AstroPureIntegration(config)` 注入（`astro.config.ts`），自动附带 sitemap、mdx、unocss 集成。
- 本仓库 `src/` 中的同名文件**覆盖**主题内对应文件（shadowing），新增文件则**扩展**主题。
- 主题组件从这些入口引入：`astro-pure/user`（Button/Icon/Timeline/Collapse/CardList 等）、`astro-pure/components/pages`（PostPreview/Paginator/TOC/Hero/ArticleBottom/Copyright/PFSearch）、`astro-pure/components/basic`（Header/Footer/ThemeProvider）、`astro-pure/advanced`（Quote/MediumZoom）、`astro-pure/server`（getBlogCollection/sortMDByDate/getUniqueTags(WithCount)/groupCollectionsByYear）、`virtual:config`（运行时读 `src/site.config.ts`）。
- **升级主题 = 改 package.json 版本号**；覆盖层文件在主题升级后需对照主题源码回归。

### 2.3 目录结构

```
├── astro.config.ts          # 构建配置（渲染/字体/markdown 插件/shiki）
├── uno.config.ts            # UnoCSS + 排版（prose）样式定制
├── src/
│   ├── site.config.ts       # 站点配置中枢（★ 改站点行为先看这里）
│   ├── content.config.ts    # blog 集合 schema（zod 校验）
│   ├── components/
│   │   ├── BaseHead.astro   # SEO meta / OG / Twitter / favicon / RSS 发现
│   │   ├── home/            # 首页：Section、ProjectCard、SkillLayout(未引用 ⚠️T18)
│   │   ├── about/           # ToolSection（工具箱）、Substats（粉丝数）
│   │   ├── links/           # FriendList（友链卡片）
│   │   ├── projects/        # ProjectSection、Sponsorship、Sponsors
│   │   └── waline/          # Comment、PageInfo、Pageview（评论/计数）
│   ├── layouts/             # BaseLayout/ContentLayout/BlogPost/CommonPage/IndividualPage
│   ├── pages/               # 全部路由（见第 4 章路由表）
│   ├── plugins/             # rehype-auto-link-headings + shiki 转换器（vendored）
│   ├── content/blog/        # ★ 文章库（Obsidian 直接编辑，含 .obsidian 配置）
│   └── assets/              # avatar、项目图、工具图标、打赏码、styles/{app,global}.css
├── public/                  # favicon/、links.json（友链数据）、social-card、RSS XSL
├── preset/                  # 扩展资源库：备选图标、signature 组件、cacheAvatars 脚本
├── docs/                    # 本 PRD、Markdown排版指南.md（不参与构建）
└── .zcode/skills/           # guizang-social-card-skill（封面/社交卡片生成）
```

### 2.4 渲染策略

- 全局 `output: 'server'`（Vercel SSR）。
- 显式 `export const prerender = true` 的页面：文章详情 `/blog/[id]`、文章列表 `/blog/[...page]`、归档 `/archives`、标签详情 `/tags/[tag]/[...page]`。其余页面（首页、about、links、projects、tags 索引、search、terms、404）走 SSR。
- `theme.prerender: true`（Pagefind 索引依赖预渲染产物）。
- 实验特性（`astro.config.ts` experimental）：`contentIntellisense`、`svgOptimizer`、`clientPrerender`、`queuedRendering`——升级 Astro 时需回归。
- `trailingSlash: 'never'`：站内 URL 一律**不带尾斜杠**（本地 curl 验证时注意）。

### 2.5 外部服务依赖

| 服务 | 用途 | 失效影响 |
| --- | --- | --- |
| Vercel | 托管 + Waline 服务端 + 图像优化 | 站点不可用 |
| Neon | Waline 评论数据库 | 评论/浏览量不可用 |
| jsDelivr | Waline 表情包、pageview 脚本 CDN | 表情/计数降级 |
| api.swo.moe (Substats) | about 页粉丝数 | 显示 null |
| v1.hitokoto.cn | 页脚一言 | 引言 Error |
| ghchart.rshah.org | projects 页 GitHub 活动图 ⚠️T16 | 图表裂图 |
| fontshare | Satoshi 字体 | 回退系统字体 |

---

## 3. 全局配置

### 3.1 `src/site.config.ts` — 站点配置中枢（★ 最常用维护入口）

#### 基础信息（theme 段）

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| `title` / `author` / `description` | `Rufus' ink ` / Rufus / Stay hungry, stay foolish | 元信息、浏览器标签 |
| `favicon` | `/favicon/favicon.ico` | 默认 favicon（全套图标在 `public/favicon/`） |
| `socialCard` | `/images/social-card.png` | 默认分享卡（无 heroImage 的页面用） |
| `locale` | zh-CN，日期 `day numeric / month short / year numeric` | 全站语言与日期格式 |
| `logo.src` | `/src/assets/avatar.png` | 首页 logo |
| `titleDelimiter` | `•` | 页标题拼接符：`{页名} • Rufus' ink` |
| `prerender` | true | Pagefind 依赖 |
| `npmCDN` | `https://cdn.jsdelivr.net/npm` | 前端 CDN 前缀 |
| `head` | `[]` | 额外 head 标签注入位（如 telegram:channel，预留） |
| `customCss` | `[]` | 额外全局 CSS 注入位 |

#### 导航与页脚

- `header.menu`（5 项）：首页 `/`、文章 `/blog`、项目 `/projects`、朋友 `/links`、关于 `/about`。**增删页面须同步此处。**
- `footer.year`：`© 2024 - {当前年}`。
- `footer.links`：空（ICP 备案链接已于 2026-10-11 移除）。注释中预留 Site Policy 入口位。
- `footer.credits`：false（不显示主题致谢链接）。
- `footer.social`：GitHub（github.com/rufus-fan）、RSS（/rss.xml）。

#### 内容配置（theme.content）

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| `externalLinks.content` | ` ↗` | 站外链接自动追加箭头（user-select:none） |
| `blogPageSize` | 8 | `/blog` 与 `/tags/[tag]` 每页文章数 |
| `share` | weibo, x, bluesky | 文章分享按钮 |
| `imageCaption` | 未设置（false） | 图片题注开关 📋 P1 |

#### 集成配置（integ 段）

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| `links.logbook` | 1 条：`2026-06-16 开始接纳新的伙伴！` | 友链日志（Links 页时间线） |
| `links.applyTip` | Name/Desc/Link/Avatar 四行站点信息 | 申请友链展示（点击复制） |
| `links.cacheAvatar` | false ⚠️T17 | true 时启用头像本地缓存（配套 `bun run cache:avatars`） |
| `pagefind` | true | 站内搜索 |
| `quote` | Hitokoto `?c=i`（诗词类），取 `data.hitokoto` | 页脚/首页一言 |
| `typography.class` | `prose text-base` | 正文容器 class |
| `typography.blockquoteStyle` | italic | 引用块斜体 |
| `typography.inlineCodeBlockStyle` | modern | 行内代码：边框+圆角+底色 |
| `mediumZoom` | enable，selector `.prose .zoomable` | 正文图片点击放大 |
| `waline` | 见第 7 章 | 评论系统 |

#### 条款配置

`terms`（CardListData）：4 个条款页卡片（Privacy Policy / Terms and Conditions / Copyright / Disclaimer），路由见 4.10。

### 3.2 `astro.config.ts` — 构建配置

| 段 | 当前配置 | 说明 / 迭代注意 |
| --- | --- | --- |
| site / trailingSlash | `https://immz.ink` / never | 改域名两处都要动（`site.config.ts` applyTip 亦含硬编码域名） |
| prefetch | defaultStrategy: viewport | 视口内链接预取 |
| adapter / output | vercel(imageService) / server | 换托管平台时调整 |
| image | sharp、responsiveStyles、remotePatterns 允许全部 https | 远程图（ghchart 等）经图像服务 |
| fonts | Satoshi（fontshare），weights 400/500，styles normal+italic，subset latin，cssVariable `--font-satoshi` | 中文回退系统字体栈 |
| markdown.remarkPlugins | remarkMath；remarkAlert（legacyTitle: true → `> [!NOTE/自定义标题]`） | 警告块样式在 `src/assets/styles/global.css` |
| markdown.rehypePlugins | rehypeKatex → rehypeHeadingIds → rehypeAutolinkHeadings（append `#` 锚点） | 自 vendored 版在 `src/plugins/rehype-auto-link-headings.ts` |
| shiki | 双主题 github-light/github-dark；transformers 见 6.3 | 官方 4 个 + 自定义 6 个 |
| experimental | contentIntellisense / svgOptimizer / clientPrerender / queuedRendering | 升级 Astro 需回归 |

---

## 4. 页面模块

### 4.0 路由总表

| 路由 | 模块 | 渲染 | 状态 | 维护入口 |
| --- | --- | --- | --- | --- |
| `/` | 首页 | SSR | ✅ | `src/pages/index.astro` |
| `/blog`（分页） | 文章列表 | 预渲染 | ✅ | `src/pages/blog/[...page].astro` |
| `/blog/[id]` | 文章详情 | 预渲染 | ✅ | `src/pages/blog/[...id].astro` + `src/layouts/BlogPost.astro` |
| `/archives` | 归档 | 预渲染 | ✅ | `src/pages/archives/index.astro` |
| `/tags` | 标签索引 | SSR | ✅ | `src/pages/tags/index.astro` |
| `/tags/[tag]`（分页） | 标签文章 | 预渲染 | ✅ | `src/pages/tags/[tag]/[...page].astro` |
| `/search` | 站内搜索 | SSR | ✅ | `src/pages/search/index.astro` |
| `/about` | 关于我 | SSR | ✅ | `src/pages/about/index.astro` |
| `/projects` | 项目 | SSR | ⚠️T1/T2/T13 | `src/pages/projects/index.astro` |
| `/links` | 友链 | SSR | ⏸️T6 | `src/pages/links/index.astro` + `public/links.json` |
| `/terms`（4 子页） | 条款 | SSR | ⚠️T14 | `src/pages/terms/` |
| `/404` | 404 | SSR | ✅ | `src/pages/404.astro` |
| `/rss.xml` | RSS | — | ✅ | `src/pages/rss.xml.ts` |
| `/robots.txt`、`/sitemap-index.xml` | SEO | — | ⚠️T8 | `src/pages/robots.txt.ts`；sitemap 由主题自动生成 |

### 4.1 首页 `/`

结构（自上而下）：

1. **头部**：作者名大标题；标签行：`中国｜杭州`（location 图标）、GitHub 链接。
2. **关于我**：一句话定位（产品经理｜用户增长 + 「擅长用最小成本验证想法…」）。
3. **职业经历**：Timeline 组件，5 段经历（2018～2019 流利说用增 → 2019～2021 社交电商 → 2021～2022 跨境电商 → 2022～2024 本地生活业务负责人 → 2025～至今 AI 构筑产品，内嵌 XianyuFlip / 元气琥珀链接）。⚠️ 与 about 页双份硬编码（T4）。「查看完整经历」按钮 → /about。
4. **项目与作品**：4 张 ProjectCard（图片 `src/assets/projects/1-4.avif`）：
   - XianyuFlip（独立开发/Web App）→ dashboard.arminos.cn
   - 神犬外卖（业务负责人/本地生活）→ biyingniao.com
   - 元气琥珀用户中心（独立开发/大健康·Web App）→ yuanqihupo.com
   - 更多项目（占位卡）→ /projects
5. **最新文章**：按日期取前 10 篇 PostPreview + 「所有文章」按钮。
6. **Quote**：一言组件。

页面主色 `highlightColor='#659EB9'` 硬编码 ⚠️T12。改经历/项目 → `src/pages/index.astro`；卡片组件 → `src/components/home/ProjectCard.astro`（图片必须放 `src/assets/projects/`，glob 校验缺失即构建报错）。

### 4.2 文章列表 `/blog`

- 分页（每页 8，`config.content.blogPageSize`）；页头「Page x - Showing n of N posts」+「View all posts by years →」链接到归档。
- 文章卡：PostPreview（detailed 模式，含 hero 缩略图、日期、描述、标签）。
- 侧栏：标签云（按文章数取前 50）+「View all →」。

### 4.3 文章详情 `/blog/[id]`

- **Hero**：封面图 + 标题 + 日期 + 标签 + 阅读时长；`heroImage.color` 决定该页主色（顶部渐变 + 高亮文字，见 8.4）。
- **正文**：排版系统全量生效（第 6 章）；TOC 侧栏（桌面 sticky，移动端抽屉，ContentLayout 内置）。
- **页脚区**：Copyright 声明（主题组件，按 frontmatter 生成）→ 相关文章推荐 ArticleBottom → Waline 评论区。
- **PageInfo**：`n views | n comments`（仅非草稿且 `comment: true`）。
- OG 图 = heroImage（无则 social-card）；`article:published_time` = updatedDate ?? publishDate。
- 返回按钮固定指向 `/blog`。

### 4.4 归档 `/archives`

按年分组倒序；每年份有描边大数字背景 + 当年篇数；文章行内联显示（无边框样式）。

### 4.5 标签 `/tags`、`/tags/[tag]`

- `/tags`：全部标签，字号随文章数分档（>2 篇大、>1 篇中、其余小）。
- `/tags/[tag]`：该标签文章分页（每页 8）。标签自动转小写去重（content.config.ts）。

### 4.6 搜索 `/search`

Pagefind 前端组件（PFSearch）；索引在构建时生成，依赖 `theme.prerender: true`。`integ.pagefind` 关闭则显示「Pagefind is disabled.」。

### 4.7 关于 `/about`

四个区块（ headings 手工维护，需与页面 h2 id 一致：experience / tools / social-networks / about-blog）：

1. **职业经历**：与首页相同的 Timeline（⚠️T4 双份维护）。
2. **工具箱**：ToolSection × 5 类，数据结构 `{ name, description, href, icon, color?, deprecated? }`：
   - AI（4）：Claude Code、Codex、Trae、Hermes
   - 开发（5）：VS Code、GitHub、CloudFlare、UTM、影刀RPA（deprecated: 'AI替代'）
   - 写作（3）：Obsidian、Xmind、飞书多维表格
   - 设计与媒体（3）：Figma、Axure、Premiere
   - 开发环境（3）：MacOS、Ubuntu、Windows11
   - 图标放 `src/assets/tools/*.svg`（彩色品牌图标 `color: true` 保留原色，否则跟随主题前景色单色）；备选图标在 `preset/icons/`。⚠️T3 页面下方 "Neno" 拼写错误。
3. **社交媒体**：Substats 实时粉丝数——GitHub followers（`github/rufus-fan`）、Steam games（`steamgames/76561198179771750`）。增删平台改 `stats` 数组。
4. **关于博客**：资源致谢列表（域名阿里云 / Astro + astro-theme-pure / Vercel / Waline / Neon / Substats；Umami 已注释预留）。

### 4.8 项目 `/projects`

区块（headings：programs / learnings / gpg-signature / sponsorship）：

1. **GitHub Activities**：`https://ghchart.rshah.org/659eb9/rufus-fan` 远程图 ⚠️T16。
2. **产品 & 服务** ProjectSection：⚠️T1 仍为主题作者示例（Astro Theme Pure、PKU Art）。
3. **Some old projects**（Collapse）：⚠️T1 示例（rehype-autolink-headings-simple、Gaussian NB）。
4. **学习 & 分享**：图灵完备游戏档案（turingcomplete.game/profile/29737）。
5. **GPG 签名**：⚠️T2 假数据（key `114514`，链接 keys.openpgp.org）。
6. **打赏**：Sponsorship 组件——微信/支付宝二维码（`src/assets/{wechat,alipay}-qrcode.jpg`），默认模糊 + hover 清晰。
7. **Sponsors**：⏸️T13 整段注释停用（内含 1 条真实数据：d2be8 / Afdian / ¥5 / 2026-05-22）。

ProjectSection 数据结构：`{ name, description, image?, links: [{ type: 'github'|'site'|'doc'|'release', href }] }`。

### 4.9 友链 `/links`

- **友链卡片**：⏸️T6 `showFriends = false` 隐藏（改回 true 恢复；顶部菜单「朋友」仍显示）。数据 `public/links.json`，三组：`cf-links`（正常友链，当前 1 个：Arthals' ink）、`inactive-links`（失联，折叠展示）、`special-links`（特殊链接：Astro）。卡片随机排序、头像 hover 遮罩效果。
- **Links with Bad Status**：失联友链（Collapse 折叠）。
- **Link History Book**：友链日志时间线（`integ.links.logbook`）。
- **申请友链**：本站信息四行（Name/Desc/Link/Avatar，点击复制 + toast）；申请须知 3 条。
- ⚠️T7：页内 `linkEditPage` 指向 `rufus-fan/astro-theme-pure` 仓库（主题 fork），非本站仓库 rufus-ink。

### 4.10 条款 `/terms`

CardList 索引页 + 4 个 md 子页（privacy-policy / terms-and-conditions / copyright / disclaimer）。⚠️T14 内容为主题英文模板未本地化；索引页含占位文案「You need to add md files in this directory.」⚠️T19。footer 中入口已注释（预留）。

### 4.11 404 `/404`

大号 404 + 文案 + 回首页按钮。

### 4.12 RSS `/rss.xml`

- 全文输出（content 字段，remark 重渲染并重写图片路径为绝对 URL）；每条附 heroImage（`h:img` + `enclosure`）。
- 浏览器美化样式 `public/scripts/pretty-feed-v3.xsl`。
- 页脚 social 已挂 RSS 入口。

### 4.13 SEO 文件

- `robots.txt`：⚠️T8 列出 GPTBot / ClaudeBot / Claude-Web 但未设 Disallow，随后 `User-agent: * Allow: /`——当前效果是**允许所有爬虫（含 AI 爬虫）**，前三行冗余。若要禁 AI 爬虫需补 Disallow 行。
- sitemap-index.xml：主题自动生成，robots 已引用。

---

## 5. 内容模块（写作系统）

### 5.1 写作流程

Obsidian 直接打开 `src/content/blog/` 编辑（仓库自带 .obsidian 配置）→ 保存 → `bun run build` 校验 → push main → Vercel 自动发布。

### 5.2 文章目录规范

- **标准结构**：`src/content/blog/<slug>/index.md` + 同目录 `thumbnail.png`（封面）+ 文章内嵌图片（任意文件名）。
- **slug 规范**：英文 kebab-case（现有例外 ⚠️T11：`XianyuFlip使用指南` 中文目录名，URL 会被编码）。
- 单文件文章（不放目录）也支持，如 `draft.md`。
- 系列：`<系列名>-<序号>`（如 `harness-engineering-1`）。

### 5.3 Frontmatter Schema（`src/content.config.ts`，zod 构建期校验）

| 字段 | 必填 | 类型/约束 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | ✅ | string，≤60 字符 | — | 超长构建报错 |
| `description` | ✅ | string，≤160 字符 | — | 列表卡摘要 + meta description |
| `publishDate` | ✅ | date（如 2026-09-03） | — | 排序/展示/RSS pubDate |
| `updatedDate` | — | date | — | 有则作为 og:article:published_time |
| `heroImage` | — | `{ src: image() 必填, alt?, inferSize?, width?, height?, color? }` | — | `src: './thumbnail.png'`；`color`（如 '#002FA7'）决定该页主色（8.4） |
| `tags` | — | string[] | [] | 自动去重 + 转小写 |
| `language` | — | string | — | 显示在文章头部（如「中文」） |
| `draft` | — | boolean | false | true 时不对外展示、无评论无计数 |
| `comment` | — | boolean | true | 关闭该篇评论与计数 |

### 5.4 站内写作约定（硬规则，用户明确要求）

1. **AI 速读**：每篇开头 `> [!NOTE/AI 速读]`，**≤50 字**。
2. **出处标注**：转载/参考内容，文末 `> [!NOTE/出处]` 注明原文链接与整理方式。
3. **发布节奏**：每周 2 篇（周一、周四），发布日期**不得晚于当天**（站内不出现未来日期）。
4. **封面禁时效信息**：封面图不出现日期等时效性内容，只放标题/系列标记/标签关键词——日期由 frontmatter 管理，避免改期重绘封面。
5. **封面规格**：2100×900 PNG，`thumbnail.png` 放文章目录；瑞士风，系列锚点色：Harness=IKB 蓝 `#002FA7`、MCP=安全橙、图灵完备=柠檬黄、Python=柠檬绿、人生杠杆=Ink Classic 杂志风；frontmatter `heroImage.color` 用锚点色的深化版。生成工具见 9.3。
6. **commit 风格**：极简中文（如 `chore: 功能优化与格式调整` / `格式修复` / `内容调整`）。

### 5.5 现有文章清单（截至 2026-10-11）

| slug | 日期 | 系列 | 状态 |
| --- | --- | --- | --- |
| using-mdx | 2025-06-01 | — | ✅ ⚠️T5 主题示例文，待下线/替换 |
| XianyuFlip使用指南 | 2026-07-16 | — | ✅ |
| markdown-guide | 2026-08-24 | — | ✅ 排版指南（站内语法速查） |
| life-levers | 2026-08-27 | — | ✅ |
| python-magic-methods | 2026-08-31 | — | ✅ |
| harness-engineering-1~4 | 2026-09-03/07/10/14 | Harness ×4 | ✅ |
| mcp-tool-design-1~2 | 2026-09-17/21 | MCP ×2 | ✅ |
| turing-complete-1-logic-gates / 2-nand / 3-boolean-algebra / 4-karnaugh-map | 2026-09-24/28、10-01/05 | 图灵完备 ×4 | ✅ |
| draft.md | 2025-07-03 | — | 草稿（模板占位 ⚠️T15） |
| AI内容生产.md | 2025-07-03 | — | 草稿（「文创出海」碎片笔记 ⚠️T15） |

### 5.6 草稿机制

`draft: true` → 列表/首页/RSS 不出现，详情页无评论与计数。草稿文件保留在库中不删除。

---

## 6. 排版系统

> 详细语法手册见 `docs/Markdown排版指南.md`（内部参考，不参与构建）；带实时渲染示例的博客版在文章 `markdown-guide`。

### 6.1 能力矩阵

| 能力 | 状态 | 语法 | 实现位置 |
| --- | --- | --- | --- |
| GFM 基础（标题/粗斜/链接/行内代码/引用/任务列表/表格/脚注/smartypants） | ✅ | 标准 GFM | Astro 内置 + uno.config.ts cssExtend |
| 标题锚点 + TOC | ✅ | 自动 | `src/plugins/rehype-auto-link-headings.ts`（append `#`，hover 显现） |
| 站外链接 `↗` | ✅ | 自动 | `site.config.ts` content.externalLinks |
| 警告块（5 种 + 自定义标题） | ✅ | `> [!NOTE/TIP/IMPORTANT/WARNING/CAUTION]`，`[!NOTE/自定义标题]` | remark-github-blockquote-alert（legacyTitle）+ `global.css` |
| 数学公式 | ✅ | `$...$` / `$$...$$` | remark-math + rehype-katex（BlogPost 引入 katex.min.css；global.css 处理滚动溢出） |
| 代码块双主题 | ✅ | 自动 | shiki github-light / github-dark |
| 代码块元信息 | ✅ | ` ```ts title="x.log" ` | addTitle / addLanguage（`src/plugins/shiki-custom-transformers.ts`） |
| 行号高亮 | ✅ | ` ```ts {2,4-5} ` | vendored `transformerMetaHighlight`（`src/plugins/shiki-official/transformers.ts`） |
| diff 语言红绿行 | ✅ | ` ```diff ` + 行首 `+/-` | `transformerDiffLang` |
| 注释标记法（进阶） | ✅ | `// [!code highlight]`、`[!code ++]`、`[\!code ...]` 转义 | 官方 transformers |
| 复制按钮 | ✅ | 自动（成功提示 2s） | addCopyButton(2000) |
| 长代码折叠 | ✅ | >15 行自动折叠 | addCollapse(15) |
| 图片居中/圆角/放大 | ✅ | `![](./x.png)` | mediumZoom + cssExtend |
| 图片题注 | ❌ 未开启 | — | `site.config.ts` `content.imageCaption: true` 📋P1 |
| `==高亮==`、上下标 `H~2~O` | ❌ | — | 需加 remark 插件 📋P1 |
| Mermaid | ❌ | — | 需加 rehype-mermaid 📋P1 |
| 代码组 tabs / steps | ❌ | — | 主题内置未启用 📋P2 |

### 6.2 排版样式定制（`uno.config.ts`）

presetTypography cssExtend：标题 hover 显锚点（opacity 过渡）、`scroll-margin-top 4rem`、行内代码 modern 样式（受 `typography.inlineCodeBlockStyle` 开关）、引用块圆角 + 装饰引号 + 底部阴影、表格块级横向滚动、列表间距、图片圆角居中、kbd 样式。自定义 rules：`sr-only`、`object-cover`、`bg-cover`、`line-clamp-{n}`。safelist：TOC 圆角、`prose text-base`。

### 6.3 全局样式文件

| 文件 | 内容 |
| --- | --- |
| `src/assets/styles/app.css` | 主题 CSS 变量（见 8.1）、全局链接 hover 变 primary |
| `src/assets/styles/global.css` | 入场动画（fade-in-up 阶梯延迟）、KaTeX 溢出修复、Shiki 代码块容器（行号/折叠/复制/语言标签）样式、警告块配色（明暗两套） |

---

## 7. 评论与互动系统（Waline）

### 7.1 拓扑

客户端（站内组件）→ Waline 服务端 `https://rufus-ink-waline.vercel.app/`（Vercel）→ Neon Postgres。服务端与数据库在代码仓库之外，配置/备份在 Vercel/Neon 控制台。

### 7.2 站内配置（`site.config.ts` integ.waline）

| 配置 | 当前值 | 说明 |
| --- | --- | --- |
| `enable` | true | 总开关 |
| `server` | `https://rufus-ink-waline.vercel.app/` | 服务端地址 |
| `emoji` | bmoji、weibo | 表情包（经 npmCDN 加载 @waline/emojis@1.2.0） |
| `showMeta` | false ⚠️T10 | 注意：组件中注入「隐藏 .wl-meta」样式的条件是 `showMeta` 为真，语义存疑待核实 |
| `additionalConfigs.pageview` | true | 浏览量统计 |
| `additionalConfigs.comment` | true | 评论数统计 |
| `additionalConfigs.locale` | reaction0: 'Like'；placeholder: 欢迎评论（邮箱收回复，无需登录） | 文案 |
| `additionalConfigs.imageUploader` | false | 禁用评论贴图 |

### 7.3 组件与挂载点

| 组件 | 位置 | 用途 |
| --- | --- | --- |
| `Comment.astro` | `src/components/waline/` | 评论区（custom element 懒初始化）；reaction 心形按钮（`/icons/heart-item.svg`，后缀 Like(s)）；已定制：隐藏 reaction 标题/文案、隐藏评论区 RSS 链接、长文本换行修复、Waline CSS 变量对齐站点明暗主题 |
| `PageInfo.astro` | 同上 | `n views \| n comments` 行；view/comment prop 控制显示 |
| `Pageview.astro` | 同上 | 从 npmCDN 动态 import pageview.js 计数（data-astro-rerun） |

挂载规则：文章页（BlogPost）非草稿且 `comment: true` 时显示评论 + PageInfo；CommonPage 页面（about/links/projects/terms）由页面 props `comment`/`view` 控制——当前 about、links 开评论，projects 仅 view。

---

## 8. 视觉设计系统

### 8.1 主题色（`src/assets/styles/app.css`，HSL 变量）

| 变量 | 亮色 | 暗色 |
| --- | --- | --- |
| `--primary` | 200 29% 45%（蓝灰） | 195 95% 85% |
| `--foreground` / `--muted-foreground` | 240 10% 3.9% / 240 3.8% 28.1% | 0 0% 98% / 240 5% 74.9% |
| `--background` / `--muted` / `--card` | 210 33% 99% / 240 4.8% 96% / 0 0% 90% | 240 20.54% 5.2% / 240 5.9% 13% / 240 3.7% 24.9% |
| `--border` / `--input` / `--ring` | 240 5.9% 88% / 90% / 10% | 240 3.7% 22.9% / 17.9% / 83.9% |
| `--radius` | 0.5rem | 同 |

改版色 = 只改这两个块；UnoCSS 主题色（uno.config.ts themeColors）经变量透传，无需同步。

### 8.2 明暗模式

ThemeProvider（主题包）管理，`color-scheme: light dark`，header 提供切换，选择持久化（主题实现）。

### 8.3 字体

Satoshi（fontshare 远程字体，Astro fonts 优化 + preload），仅 latin 子集——**中文实际由系统字体栈渲染**。换字体：`astro.config.ts` fonts 段 + `BaseHead.astro` 的 Font 标签与 body font-family。

### 8.4 文章页主色机制

`heroImage.color`（frontmatter）→ BlogPost `highlightColor` → 页面顶部线性渐变（opacity 25%）+ `.highlight` 文字色（`color-mix(色 40%, 前景色)`）+ `.highlight-bg`。未设置时回退 `--primary`。封面与页面主色联动是本站视觉特色，**新文章记得配 color**。

### 8.5 动效与交互

- `.animate` fade-in-up 300ms，阶梯延迟：content-header 50ms → content 100ms → sidebar 150ms；`prefers-reduced-motion` 时缩短为 100ms。
- 卡片 hover：ProjectCard 图片透明度渐变 + 渐变蒙层下移；FriendList 头像遮罩 + 箭头动效；Sponsorship 二维码模糊→清晰。
- 移动端 TOC 抽屉（ContentLayout 内置脚本 + 遮罩层）。

### 8.6 布局

主容器 `max-w-[70rem]`，内边距响应式（1rem → 1.75rem → 2.5rem）+ iOS safe-area 适配。正文最小宽 45ch，TOC 侧栏 min-w-48 basis-60。

---

## 9. 资产管理

### 9.1 `public/`（原样拷贝）

| 路径 | 用途 |
| --- | --- |
| `favicon/` | 全套 favicon（16/32/180/192/512 + .ico + site.webmanifest） |
| `images/social-card.png` | 默认 OG 分享卡（1200×630） |
| `links.json` | 友链数据源（4.9） |
| `scripts/pretty-feed-v3.xsl` | RSS 浏览器美化 |
| `icons/heart-item.svg`、`code.svg` | Waline reaction 心形、代码图标 |

### 9.2 `src/assets/`（经构建优化）

| 路径 | 用途 |
| --- | --- |
| `avatar.png` | 站点 logo/首页 |
| `projects/1-4.avif` | 首页项目卡图（ProjectCard glob 校验，文件名即引用键） |
| `tools/*.svg`（19 个） | 工具箱图标 |
| `alipay-qrcode.jpg`、`wechat-qrcode.jpg` | 打赏码 |
| `icons/key.svg` | GPG 图标 |

### 9.3 封面/社交卡片生成（guizang-social-card-skill）

- 位置：`.zcode/skills/guizang-social-card-skill/`（ZCode 技能，SKILL.md 自包含）。
- 能力：瑞士风/杂志风社交卡片、小红书 3:4 图文集、**微信公众号封面对（21:9 主图 + 1:1 方图）**、Live Photo 实况卡、三联拼图等。
- 博客封面流程：文章标题/系列/标签 → 2100×900 PNG → 存 `src/content/blog/<slug>/thumbnail.png` → frontmatter `heroImage.src + color`。
- 历史生成脚本：skill 目录下 `local-tests/blog-covers-2026/`（12 张 2026 系列封面的源头）。
- 硬规则：封面**不放日期**（5.4）。

### 9.4 `preset/`（扩展资源库）

- `icons/`：10 个备选工具图标（androidstudio/animate/arc/qt/safari/tailscale/unity/warp/zerotier），按需拷入 `src/assets/tools/` 使用。
- `components/signature/`：签名实验组件（Signature.astro + svg + mdx 示例），未接入站点。
- `scripts/cacheAvatars.ts`：友链头像本地缓存（`bun run cache:avatars`）——读 links.json，下载头像至 `public/avatars/<hash>.<ext>` 并回写 `avatar_cache` 字段；仅 `cacheAvatar: true` 时生效，当前 false ⚠️T17。

---

## 10. 构建、部署与环境

### 10.1 命令表（package.json scripts，Bun 执行）

| 命令 | 作用 |
| --- | --- |
| `bun run dev` | 本地开发服务器（host: true，局域网可访问） |
| `bun run dev:check` | dev + astro check --watch |
| `bun run build` | **发布前必跑**：astro-pure check + astro check + astro build（双重类型/规范检查，约 15s） |
| `bun run preview` | 预览构建产物 |
| `bun run sync` / `check` | 生成类型 / 仅类型检查 |
| `bun run format` | Prettier 全量格式化 |
| `bun run lint` | ESLint --fix（src/） |
| `bun run yijiansilian` | lint + sync + check + format 一键串行（**提交前推荐**） |
| `bun run clean` | 清 .astro/.vercel/dist |
| `bun run cache:avatars` | 友链头像缓存（见 9.4） |

### 10.2 部署流程

本地 push main → Vercel 自动构建部署（SSR + 预渲染混合）→ 生产 immz.ink。

本机推送特殊流程（凭据与网络限制，已验证可用）：

1. osascript 弹 hidden dialog 收 GitHub token（用户手输）→ 写临时 GIT_ASKPASS 脚本；
2. `git config http.version HTTP/1.1` + 失败重试 2-4 次（github.com 443 间歇断连；codeload/api 子域稳定）；
3. 推完 `git ls-remote` 比对 rev-parse HEAD 确认，随后删除临时脚本（token 不落盘）。

### 10.3 本地验证清单（改动的验收标准）

1. `export PATH="$HOME/.bun/bin:$PATH"`；
2. `bunx astro build` 通过（frontmatter/图片 glob/类型全量校验）；
3. SSR 页（about/links/projects）：`bunx astro dev` + curl（URL **不带尾斜杠**，trailingSlash never）；
4. 静态产物：Bun.serve 托管 `dist/client`（目录路径补 index.html；`Bun.file().exists()` 是 Promise 需 await）；
5. hero 图走 `/_vercel/image`，**本地裂图属正常**（生产才有 Vercel 图像服务）；
6. 浏览器截图验证：IAB viewport 2100×900，静态服务加 `cache-control: no-store` 防缓存旧页。

### 10.4 环境依赖

Bun 1.4.3（`~/.bun/bin`）；git 2.54（Xcode CLT）；git 身份 rufus-fan <rufus.fanmingzhe@gmail.com>；**python3 不可用**——脚本一律用 Bun/TS，勿引入 python 依赖。

### 10.5 代码规范

ESLint（eslint-plugin-astro + ts parser）+ Prettier（astro + import 排序插件）；`.prettierignore`、`.editorconfig`、`.vscode/` 已配置。commit 信息极简中文（5.4-6）。

---

## 11. 多平台发布：微信公众号 📋 规划中（未拍板）

**目标**：以站内文章为唯一源，低成成本同步到微信公众号（及更多平台）。

**调研结论（2026-10-10，三方案可组合）**：

| 方案 | 内容 | 成本 | 备注 |
| --- | --- | --- | --- |
| A. 零开发兜底 | doocs/md（md.doocs.org）手动粘贴 + Wechatsync 浏览器扩展同步 29+ 平台 | 零 | 立刻可用，作为兜底 |
| B. 核心开发 📌 | 博客内建「公众号导出页」：渲染 inline-style 版正文，一键复制；借鉴 doocs/md 的 `@md/core`（WTFPL 许可，**需 vendor 进仓库**） | 中 | 当前倾向 |
| C. 可选增强 | 本地 Bun 脚本调公众号 API 推草稿箱 | 中 | 自动化 |

**硬约束（个人未认证订阅号）**：

- 可用接口仅 `draft/add`（草稿箱）+ `media/uploadimg`（图片上传）；**群发接口需认证**；
- API 调用需 **IP 白名单**（家宽 IP 易变，方案 C 的主要阻力）；
- 编辑器**只认 inline style**（导出页需把 CSS 内联）；
- 正文**外链不可点**，需转脚注（站内 `↗` 外链标记逻辑需同步转换）；
- KaTeX 公式需单独适配（转图片或放弃）。

**涉及模块**：新增导出页路由 + 正文渲染管线（rehype 内联化）+ 外链转脚注转换；封面图可直接复用 9.3 的公众号封面对（21:9 + 1:1）能力。

---

## 12. 已知问题与技术债

> 修复后请将对应项标注「已修复（日期）」或删除，并在变更记录登记。T 编号供 Backlog 与日常沟通引用。

| # | 问题 | 位置 | 建议 |
| --- | --- | --- | --- |
| T1 | 「产品 & 服务」「旧项目」仍是**主题作者示例项目**（Astro Theme Pure / PKU Art / rehype-autolink-headings-simple / Gaussian NB） | `src/pages/projects/index.astro` | 替换为真实项目（XianyuFlip / 神犬外卖 / 元气琥珀等） |
| T2 | GPG 签名区块为假数据（key `114514`） | 同上 | 无真实 GPG 需求则整块删除 |
| T3 | 「关于博客」资源表 "Neno" 拼写错误（应为 Neon） | `src/pages/about/index.astro` | 改拼写 |
| T4 | 职业经历 Timeline 在首页与 about **双份硬编码**，改一处易漏另一处 | `src/pages/index.astro` + `src/pages/about/index.astro` | 抽成共享数据文件（如 `src/data/experience.ts）两处引用 |
| T5 | 主题示例文章 using-mdx.mdx 仍对外可见（2025-06-01） | `src/content/blog/using-mdx.mdx` | 下线（draft: true）或替换为自有 MDX 教程 |
| T6 | 友链好友卡片 `showFriends=false` 隐藏（菜单「朋友」仍在，页面留标题与申请入口） | `src/pages/links/index.astro` | 有友链后改回 true |
| T7 | `linkEditPage` 指向 `rufus-fan/astro-theme-pure`（主题 fork），非本站仓库 rufus-ink | 同上 | 改为 rufus-ink 仓库 links.json 路径或删除该引用 |
| T8 | robots.txt 列出 GPTBot/ClaudeBot/Claude-Web 但无 Disallow，与 `User-agent: * Allow: /` 并存，语义冗余 | `src/pages/robots.txt.ts` | 决策：禁 AI 爬虫则补 Disallow；否则删冗余行 |
| T9 | 站点标题 `"Rufus' ink "` 含尾随空格（titleDelimiter 拼接可能出现双空格） | `src/site.config.ts` | 去空格 |
| T10 | Waline `showMeta: false` 但组件在 `showMeta` 为真时才注入隐藏 `.wl-meta` 样式，语义可能与预期相反 | `src/components/waline/Comment.astro` | 核实 Waline 默认行为后修正条件或注释 |
| T11 | `XianyuFlip使用指南` 目录名含中文且无连字符，URL 编码后不美观 | `src/content/blog/` | 改 slug `xianyuflip-guide`（注意 301/旧链失效） |
| T12 | 首页 `highlightColor='#659EB9'` 硬编码，与主题 primary 不一致 | `src/pages/index.astro` | 统一用 CSS 变量或移除 |
| T13 | Sponsors（赞赏名单）整段注释停用，内含 1 条真实数据（d2be8 / Afdian / ¥5 / 2026-05-22） | `src/pages/projects/index.astro` | 决策恢复或删除 |
| T14 | 4 个条款页为主题英文模板，未本地化 | `src/pages/terms/*.md` | 中文化 |
| T15 | 两个草稿：`draft.md`（模板占位）、`AI内容生产.md`（「文创出海」碎片笔记，frontmatter 仍是 Draft Page 模板） | `src/content/blog/` | 整理成文或清理 |
| T16 | GitHub 活动图依赖第三方 ghchart.rshah.org（稳定性和隐私） | `src/pages/projects/index.astro` | 可换 GitHub 官方 contributions 或自绘 |
| T17 | `links.cacheAvatar=false`，友链头像直链外部图床（国内加载慢/失效） | `src/site.config.ts` | 开启并跑 `bun run cache:avatars` |
| T18 | `src/components/home/SkillLayout.astro` 未被任何页面引用 | 同左 | 删除或启用（技能展示位） |
| T19 | terms 索引页残留占位文案「You need to add md files in this directory.」 | `src/pages/terms/index.astro` | 删除或替换说明文字 |
| T20 | RSS `enclosure`/`h:img` 直接使用优化后的 heroImage 路径，部分阅读器可能不识别 | `src/pages/rss.xml.ts` | 观察阅读器兼容性，必要时输出原图 URL |

---

## 13. 迭代路线图（Backlog）

> 使用方式：在 `[ ]` 中打 `x` 即视为「已排期/已完成的实施指令」，配合状态标记回写。

### P0 — 高价值 / 修复占位

- [ ] **公众号导出页（方案 B）**：新增路由（如 `/wechat-export` 或文章页内导出模式），vendor `@md/core`，正文 inline-style 化 + 外链转脚注；验收：任一文章可一键复制进公众号编辑器且样式不丢。
- [ ] **projects 页真实化**：清除 T1/T2/T13，替换为 XianyuFlip、神犬外卖、元气琥珀等真实项目卡。
- [ ] **技术债批量修复**：T3（拼写）、T4（经历数据抽离）、T7（linkEditPage）、T9（标题空格）、T19（占位文案）。
- [ ] **using-mdx 下线**（T5）。

### P1 — 排版与体验增强

- [ ] Mermaid 图表支持（rehype-mermaid，需评估 SSR/客户端渲染方案与公众号导出兼容）。
- [ ] 图片题注开启（`imageCaption: true` + 样式微调）。
- [ ] `==高亮==` 与上下标（remark 插件选型）。
- [ ] 友链恢复（T6 + T17：showFriends=true、cacheAvatar=true、跑缓存脚本）。
- [ ] 条款页中文化（T14）。
- [ ] robots.txt AI 爬虫策略决策（T8）。

### P2 — 锦上添花

- [ ] 代码组 tabs / steps（启用主题内置插件）。
- [ ] 公众号 API 草稿箱直推脚本（方案 C，需 IP 白名单方案）。
- [ ] 站点分析（Umami，about 页已留注释位）。
- [ ] Sponsors 恢复（T13）。
- [ ] GitHub 活动图自托管（T16）。
- [ ] SkillLayout 启用或删除（T18）。
- [ ] XianyuFlip 文章 slug 规范化（T11）。

---

## 14. 附录

### 14.1 关联文档

| 文档 | 位置 |
| --- | --- |
| Markdown 排版支持指南（内部参考） | `docs/Markdown排版指南.md` |
| 排版指南（博客版，含渲染示例） | 文章 `markdown-guide` |
| 封面/社交卡片生成技能 | `.zcode/skills/guizang-social-card-skill/SKILL.md` |
| 主题官方文档 | https://astro-pure.js.org |
| Astro 文档 | https://docs.astro.build |

### 14.2 术语表

| 术语 | 含义 |
| --- | --- |
| 覆盖层 | 本仓库 src/ 中与主题同名文件，构建时替换主题版本 |
| heroImage | 文章封面，frontmatter 定义，含 color 主色锚点 |
| 维护入口 | 修改某功能需要动的文件路径 |
| vendored | 从上游复制进仓库自行维护的第三方代码（如 shiki transformers、@md/core 计划） |
| T 编号 | 「已知问题与技术债」条目编号 |

### 14.3 变更记录

| 日期 | 版本 | 变更 |
| --- | --- | --- |
| 2026-10-11 | v1.0 | 初版：全站功能与模块盘点建档（基于代码现状 + 2026-10 排版改造后的状态） |
| 2026-10-11 | v1.1 | 页脚移除 ICP 备案展示（`footer.links` 清空）：站点托管 Vercel，配合阿里云备案核查整改 |
