---
title: 'AI 内容生产实战：视频生成 + 声音克隆'
publishDate: 2026-10-15
updatedDate: 2026-10-17
description: '用 IndexTTS2 克隆自己的音色，用 Remotion 代码化生成 1080p 讲解视频与多平台封面的完整工作流'
tags:
  - AI
  - TTS
  - Remotion
  - 视频生成
language: 中文
heroImage:
  src: ./thumbnail.png
  color: '#C2410C'
---

> [!NOTE/AI 速读]
> 用 IndexTTS2 克隆音色、Remotion 代码化渲染，产出 1080p 讲解视频的完整工作流。

## 尝试了两个生成视频的开源项目

1. [remotion](https://github.com/remotion-dev/remotion)
2. [hyperframes](https://github.com/heygen-com/hyperframes)

### Remotion

用 **React 写视频**的框架（2021 年开源）。一个 `<Composition>` 就是一段视频，普通 React 组件 + `useCurrentFrame()` 驱动每一帧动画，最终渲染成 MP4：

- **程序员友好**：动画就是代码，条件、循环、复用组件、版本管理全部天然支持；改一处参数，全片生效
- **Remotion Studio**：浏览器里实时预览、逐帧调试、时间轴拖拽
- **确定性渲染**：字体预加载、固定随机种子，保证多次渲染结果一致
- **生态完整**：字幕、音频、Lottie、Three.js、Transition 都有官方包
- **License 注意**：个人和小团队免费，公司使用需要商业授权

### HyperFrames

HeyGen 2025 年开源的 **HTML 优先**视频框架。不写 React/JS，直接用 HTML + CSS + `data-*` 时间属性声明时间线（`class="clip"` 定义片段），CLI 驱动整个开发循环：

- **零前端门槛**：会写 HTML/CSS 就能做动效，适合设计师快速产出
- **CLI 全流程**：`init → check → snapshot → compare → render → publish` 一条命令走完
- **注册表组件库**：内置数百个现成视觉块（图表、终端窗、故障风、转场），搜到即装即用
- **同样主打确定性渲染**：单一暂停时间线，seek 安全

### 结论

使用下来 **remotion 效果更好**。（具体案例会出视频演示，后续更新链接）

### 主流 LLM 生成代码化视频用什么？（2026-10 核实）

先说清一个概念：LLM 并不"渲染"视频——它产出代码，由框架渲染成帧。所以"Opus 5.5 是否采用 Remotion"准确的说法是：**各家模型写代码化视频时，生态绑定了哪个框架**。核实结论：

| LLM / Agent | 代码化视频方案 | 核实结果 |
|---|---|---|
| Claude（Opus 5.5） | **Remotion** | Remotion 官方为 Claude Code 出了 Agent Skills（2026 年 1 月发布，配套 demo 一周 600 万播放）和 Claude Code 插件，官方文档手把手教"纯 prompt 出视频"；社区教程的标配组合就是 Claude Code + Remotion Skill，场景 React 代码由 Opus 5.5 编写、Remotion 渲染 |
| OpenAI（ChatGPT / Codex） | **Remotion** | Remotion 官方提供 ChatGPT 桌面端插件（可创建完整项目并本地渲染），Codex 也在官方支持的 coding agents 列表；注意 OpenAI 的 **Sora 走扩散模型直接生成视频**，与代码化是两条平行路线 |
| Google（Gemini） | 无官方绑定 | Google 自家视频路线是 **Veo（扩散模型）**；社区常把 Gemini 当通用 coding agent 来写 Remotion 代码，但无官方专属集成 |
| Kimi Code / OpenCode / Bolt.new | **Remotion** | 均列在 Remotion 官方 AI 文档的 coding agents / 插件支持页 |

结论：**代码化视频这条路上，Remotion 是几乎所有主流 coding agent（Claude / Codex / Kimi / OpenCode）的官方绑定生态，"Claude + Remotion"是事实标准组合**——HyperFrames 的"LLM 更懂 HTML"论点尚未被主流 LLM 厂商的实际行动背书，这与本文选 Remotion 的判断相互印证。

## TTS

tts使用哔哩哔哩的[index-tts](https://github.com/index-tts/index-tts/tree/main)

AI 爆发（2023 之后）主流的国产开源声音克隆 TTS 对比：

| | 出品方 | 开源时间 | 克隆方式 | 中文效果 | 独特能力 | 硬件门槛 | 劣势 |
|---|---|---|---|---|---|---|---|
| [IndexTTS2](https://github.com/index-tts/index-tts) | 哔哩哔哩 | 2025 | 零样本（几秒参考音频） | 优秀，韵律自然，工业级稳定性 | 情感 + 时长可控（v2） | 较高（checkpoint 约 9GB，长文本吃显存） | 部署重、无实时流式 |
| [CosyVoice 2](https://github.com/FunAudioLLM/CosyVoice) | 阿里通义实验室 | 2024 | 零样本 + 跨语种克隆 | 优秀，支持中英日韩粤 + 方言 | 流式合成、指令控制情感/语速 | 中等 | 克隆相似度中规中矩 |
| [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) | RVC-Boss（社区） | 2024 | 少样本微调（~1 分钟）+ 零样本 | 良好，微调后相似度高 | WebUI 完善、集成训练/标注/推理 | 低（6GB 级显存可玩） | 零样本自然度略逊、长句韵律不稳、微调有上手成本 |

1. index-tts —— 中文效果与克隆稳定性的第一梯队，本次实战选用
2. CosyVoice 2 —— 生态最完整，需要流式/多语种时首选
3. GPT-SoVITS —— 显存门槛最低、社区最活跃，适合个人折腾微调

## 本次工作流：从一段参考音频到 136 秒成片

目标：180 秒级 Transformer 架构讲解视频，1080p / 30fps，配音用我本人音色零样本克隆。

### 项目结构

```
ai-video/
├── resourse/zheming/        # 已授权参考音频（声音1/2/3）
├── tts/
│   ├── tts_generate.py      # 断点续跑的批量合成脚本
│   ├── checkpoints/         # IndexTTS2 权重（9.2GB）
│   └── backup_v1/ backup_v2/  # 每版配音的完整备份（换音色前先归档）
├── src/
│   ├── narration.json       # 10 场景旁白脚本（约 710 字）
│   ├── components.tsx       # 10 个场景可视化组件
│   ├── TransformerDemo.tsx  # 字幕、音频挂载、场景编排
│   └── Root.tsx             # calculateMetadata 动态时长
├── public/audio/            # scene01~10.wav（48kHz）
└── out/demo.mp4             # 成片
```

### 第一步：写旁白脚本

`narration.json` 每个场景一条 `{id, title, narration}`。**先定稿文案再合成**——改一个字就要重跑 TTS，文案即源头。

### 第二步：IndexTTS2 零样本音色克隆

环境用 `uv` 管理（锁定 torch 2.8.0 + MPS），核心 API 就三行：

```python
from indextts.infer_v2 import IndexTTS2
tts = IndexTTS2(cfg_path, ckpt_path)  # macOS 用 MPS
tts.infer(spk_audio_prompt="resourse/zheming/声音2参考.wav",
          text=scene_text, output_path=f"public/audio/{scene_id}.wav")
```

实战要点：

- **换音色 = 换 `spk_audio_prompt` 重跑**。重跑前把旧版挪进 `backup_vN/`，随时可回退
- **MPS 显存**：长文本必 OOM，每段结束 `torch.mps.empty_cache()`，并设 `PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0`
- **断点续跑**：脚本先检查输出是否存在，已合成则跳过——中断后直接重跑即可
- 10 段约 25 分钟（MPS），产出 48kHz wav

### 第三步：Remotion 场景开发

- 10 个场景组件全部以 **进度参数 `p ∈ [0,1]` 驱动**：动画是 `p` 的纯函数，与配音时长天然解耦，音频变长动画自动铺满
- **动态时长**：`calculateMetadata` 读每段 wav 真实时长，`场景帧数 = ceil(秒 × 30) + 30`；音频还没合成时自动降级为估算（4.2 字/秒）且不挂 `<Audio>`，保证随时可预览
- **字幕同步**：旁白按标点切分、短句合并（≤22 字），按字数比例分配显示时间，与语音进度对齐
- **确定性渲染**：根组件 `await ensureFonts()` 阻塞到 NotoSansSC 就绪才开始渲染

### 第四步：质检——抽帧 + 像素级遮挡检测

视频里"文字互相遮挡"是重灾区（本人踩过：标注被标题盖住、字幕盖住结论横幅）。解法是**把安全区变成硬约束，再用程序证明它**：

| 区域 | y 范围 | 约定 |
|---|---|---|
| 顶部标题区 | y < 130 | 章节标题专用，场景内容禁入 |
| 可视内容区 | 130 ~ 937 | 所有图形/文字，底边再留缓冲 ≤ 930 |
| 字幕带 | 937 ~ 1028 | 字幕专用，重要内容禁入 |

验证闭环（一次性脚本，跑完即删）：

1. 环境变量开关渲染**无字幕版** `remotion still`（每场景 55% 处抽 1 帧）
2. pngjs 扫描字幕带 y∈[937,1028]：背景暗色（含网格线）亮度 <60，文字远高于 80，**阈值 80 计数内容像素**
3. 10/10 场景 contentPixels=0 → 证明字幕区无任何内容，遮挡不存在

### 第五步：渲染成片

```bash
npx remotion render TransformerDemo out/demo.mp4 --log=error
```

产出：**136.7 秒 / 1920×1080 / 30fps / H.264 + AAC / 11.4MB**。总时长完全由配音实际长度决定，无需手工对时间轴。

## 多平台封面：一次组件开发，全平台产出

视频做完还没完——发布需要封面，而各平台比例不同（视频平台 16:9、小红书 3:4、通用图文 4:3）。做法是把封面当作**正片的同源静态帧**：复用正片的调色板、`ensureFonts()` 字体加载、网格背景组件，每个比例一个导出组件（`CoverLandscape` / `CoverPortrait`），在 `Root.tsx` 注册成 `durationInFrames={1}` 的 Composition，用 `remotion still` 渲染静态 PNG。一次组件开发，多平台多比例产出，封面天然就是视频风格的「预告帧」。

封面同样配了像素级自查（沿用 video-safe-zone 思路）：pngjs 按亮度差判定内容像素，扫文案带右边界、文案与视觉的间隔带、视觉与关键词 chips 的间隙，全绿再交付。比例速查表、设计要点与两个坑见文末附录 `cover-generation`。

## 容易踩的坑

1. tts断句问题 → 按标点切分 + 短句合并 + 按字数比例分配时间，字幕与语音进度天然同步
2. 视频多层文字遮挡问题、字幕遮挡内容问题 → 安全区硬约束 + 无字幕版像素检测闭环

关于以上问题，我在项目里沉淀了两个 skill（`.trae/skills/`，完整内容见文末附录），一次性解决：

- **`tts-subtitle-sync`** —— 按标点切分 + 短句合并 + 字数比例分配时间的完整算法与参考实现，TTS 断句/字幕同步直接套用
- **`video-safe-zone`** —— 安全区坐标约定 + 验证脚本（`scene-frames.mjs` 算抽帧帧号、`check-band.mjs` 像素级扫字幕带），新场景布局后跑一遍即可证明无遮挡
- **`cover-generation`** —— 多平台封面：同源 Remotion 组件渲染 16:9 / 3:4 / 4:3 静态封面，像素级布局自查（详见「多平台封面」一节与文末附录）

### 其他坑（本次实战补充）

3. **Remotion 根组件不能是 async**：`registerRoot` 要求同步，async 组件会报 "Unexpectedly did not have a CompositionManager"。正确姿势：同步估算函数给初始 props，`calculateMetadata` 里再做异步覆盖
4. **MPS 长文本合成 OOM**：见上文环境变量与缓存清理，N 卡/A 卡同样建议分段 + 清缓存
5. **音频未就位时全片 404**：`calculateMetadata` 里 try/catch 音频读取，失败降级为估算时长且不挂 `<Audio>` 组件，流程不阻塞
6. **抽帧验证的帧号会漂移**：某段音频补齐后，后续所有场景边界都会移动；抽帧前先按当前音频状态重算场景边界
7. **TTS 整段合成的韵律不受文案控制**：该停顿的地方（句号/分号后）不停或停得含糊，该连贯的句子被读散——字幕对了语音还是不对。根治：按句界拆句逐句合成、句间插受控静音拼接（句号类 0.45s / 分号 0.30s），断句完全确定，还白拿每句精确时间戳给字幕用（`tts-subtitle-sync` skill 路线二）
8. **渐变大字宽度失控（封面）**：CSS `background-clip: text` 依赖字体栈，回退字体的字符宽度差异会让实际渲染宽度远超预期（等宽字体 11 字符 148px 可达 ~980px），侵入视觉区且代码里看不出来。根治：SVG `<text>` + `textLength` 强制排版宽度，无论回退到什么字体宽度都精确等于设定值（`cover-generation` skill）
9. **SVG 组件 viewBox 缩放后的纵向中心错位（封面）**：先设 viewBox 总宽、再 `s = w/totalW` 整体缩放时，用户单位 ≠ 像素（compact 布局 s 可达 1.7），纵向中心必须用 viewBox 中心 `cy = h / s / 2` 而非像素中心 `h/2`——后者内容会溢出 svg 盒底部压到下方元素。改完共用组件后所有比例都要重渲染复查

## 附录：三个 Skill 的完整内容

### `tts-subtitle-sync`：TTS 字幕断句与同步

> 按标点切分旁白并按字数比例将字幕同步到配音进度。当需要生成配音字幕、调整字幕断句或解决字幕与语音不同步时使用。已有精确时间戳的打轴任务不适用。

把无时间戳的旁白文本变成与配音同步的字幕。两条路线：

- **比例法**（轻量）：核心假设是 TTS 语速基本匀速，字幕时间按**字数比例**分配即可与语音对齐，无需逐句打轴
- **句级合成法**（推荐，能控制语音断句）：TTS 整段合成时韵律停顿不受文案控制（该停不停、该连不连）。改为按句界拆句逐句合成、句间插受控静音拼接，断句完全确定，且天然获得每句精确时间戳

#### 算法

**路线一：比例法（TTS 已整段合成，无法重生成时）**

1. **切分**：按中文标点（，。；：、！？）后视断言 split，trim 后过滤空串
2. **合并**：相邻片段拼接后 ≤ 22 字则合并（一行字幕的舒适长度）。出现句末标点（。！？）则提前截断——语音有停顿，字幕不跨句
3. **定位**：`p = clamp01((frame - PAD) / audioFrames)` 为语音进度；`target = p × 总字数`；累加字数落到当前 chunk
4. **淡入**：段内进度 `segP`，`opacity = clamp01(segP / 0.12)`，避免字幕硬切

**路线二：句级合成法（从源头控制断句）**

1. **拆句**：按句界（。！？；）拆句逐句 TTS 合成；句间插入受控静音（句号类 0.45s / 分号 0.30s）后拼接成整段 wav。句内标点（，、：）留给 TTS 自然微停——保证「句末停顿、句内连贯」
2. **记录时间戳**：拼接时逐句记 `{text, start, end}`（秒），落盘为 json
3. **chunk 起点 → 时间**：字幕 chunk 起点落在句首时直接用句 `start`（精确切换，跨过句间静音）；落在句内时按句内字数比例插值（句内无静音、匀速，比例即准）
4. **淡入**：chunk 出现后固定帧数内淡入（如 7 帧）

#### 参考实现（Remotion / TS）

```tsx
export const splitNarration = (text: string): string[] => {
  const parts = text
    .split(/(?<=[，。；：、！？])/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    const last = out.length ? out[out.length - 1] : null;
    // 句末标点（。！？）提前截断：语音有停顿，字幕不跨句合并
    const mergeable =
      last && !/[。！？]$/.test(last) && last.length + part.length <= 22;
    if (mergeable) out[out.length - 1] = last + part;
    else out.push(part);
  }
  return out;
};

/** 与 TTS 脚本的拆句规则严格一致（句界：。！？；） */
export const splitSentences = (text: string): string[] =>
  text.split(/(?<=[。！？；])/g).map((s) => s.trim()).filter(Boolean);

/** 精确模式：句级时间戳 → 字符偏移到时间的映射，chunk 起点帧 = PAD + charToTime(off) * fps */
const buildChunkStarts = (
  narration: string,
  chunks: string[],
  timing: { start: number; end: number }[],
  fps: number,
): number[] => {
  const sentences = splitSentences(narration);
  const bounds: { c0: number; c1: number; t0: number; t1: number }[] = [];
  let c = 0;
  sentences.forEach((s, i) => {
    bounds.push({ c0: c, c1: c + s.length, t0: timing[i].start, t1: timing[i].end });
    c += s.length;
  });
  const total = c;
  const charToTime = (x: number): number => {
    const v = Math.max(0, Math.min(total, x));
    for (const b of bounds) {
      if (v <= b.c0) return b.t0;
      if (v <= b.c1) return b.t0 + ((b.t1 - b.t0) * (v - b.c0)) / (b.c1 - b.c0);
    }
    return bounds[bounds.length - 1].t1;
  };
  const starts: number[] = [];
  let off = 0;
  for (const ck of chunks) {
    starts.push(Math.round(charToTime(off) * fps));
    off += ck.length;
  }
  return starts;
};
```

比例法降级实现（时间戳/音频缺失时）：

```tsx
const useSubtitleChunk = (narration: string, frame: number, audioFrames: number, PAD: number) => {
  const chunks = splitNarration(narration);
  const p = clamp01((frame - PAD) / Math.max(1, audioFrames));
  const total = chunks.reduce((a, c) => a + c.length, 0) || 1;
  const target = p * total;
  let acc = 0;
  for (let i = 0; i < chunks.length; i++) {
    acc += chunks[i].length;
    if (target <= acc || i === chunks.length - 1) {
      const segP = (target - (acc - chunks[i].length)) / chunks[i].length;
      return { chunk: chunks[i], opacity: clamp01(segP / 0.12) };
    }
  }
  return { chunk: "", opacity: 0 };
};
```

#### 参数要点

- **22 字上限**与 38px 字号、1300px 最大宽度（约两行）匹配；改字幕样式需同步调整
- **PAD**：音频从 PAD 帧起播，避免场景切换瞬间出声；p 的分母是 audioFrames 而非场景总长
- **拆句规则两端必须严格一致**：TTS 脚本与前端各有一份 `split_sentences` / `splitSentences`，句界集合（。！？；）改一处必须同步另一处，否则时间戳与字幕错位
- **句级合成的额外收益**：短句合成 OOM 风险更低、单句失败重跑代价小；代价是短句 RTF 偏高（固定开销摊薄差）
- 英文旁白把标点集换成 `(?<=[,.;:!?])`，并按"词数"而非字符数计权更准
- 唱歌、变速朗读等句内也非匀速的场景，句级时间戳仍不够，改用 ASR 强制对齐生成字级时间戳

### `video-safe-zone`：视频安全区与遮挡验证

> 为 1080p 视频划定标题、内容、字幕安全区，并用无字幕抽帧加像素扫描程序化验证遮挡。当用户报告字幕遮挡内容或文字互相遮挡、新建视频布局时使用。纯排版审美问题不适用。

多层文字互相遮挡、字幕盖住重要内容，靠人眼逐帧看必然漏。做法：**把安全区变成坐标硬约束，再用无字幕渲染 + 像素扫描程序化证明**。

#### 安全区约定（1080p）

| 区域 | y 范围 | 约定 |
|---|---|---|
| 顶部标题区 | y < 130 | 章节标题专用，场景内容禁入 |
| 可视内容区 | 130 ~ 937 | 所有图形/文字，底边再留缓冲 ≤ 930 |
| 字幕带 | 937 ~ 1028 | 字幕专用，重要内容禁入 |

字幕带由字幕样式决定（`bottom: 52` + fontSize 38 + padding 36px）。**改字幕样式必须同步重算此表**，验证脚本里的 Y0/Y1 也要改。

#### 流程

1. **布局约束**：新场景中所有可视元素坐标限制在内容区；模块标签与词条等相邻元素垂直错开 ≥ 40px
2. **加临时开关**：字幕层外面包 `process.env.REMOTION_HIDE_SUBTITLE === "1" ? null : <字幕/>`，验证完删除
3. **算检查帧**（音频补齐后帧号会漂移，每次抽帧前重跑）：

```bash
node .trae/skills/video-safe-zone/scripts/scene-frames.mjs
```

4. **抽无字幕帧**（每场景取 55% 进度处）：

```bash
REMOTION_HIDE_SUBTITLE=1 npx remotion still <Composition> out/check_ns/sNN.png --frame=<check> --log=error
```

5. **像素检测**（依赖 `npm i --no-save pngjs`）：

```bash
node .trae/skills/video-safe-zone/scripts/check-band.mjs out/check_ns/*.png
```

全部 `contentPixels=0` 才算通过；有 FAIL 会输出污染像素的 yRange，据此回代码调整坐标后重抽帧。

#### 脚本源码

`scene-frames.mjs` —— 计算各场景边界与抽帧检查帧（对齐 `src/Root.tsx` 的 `calculateMetadata` 逻辑）：

```js
#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";

const FPS = 30;    // 帧率
const PAD = 15;    // 音频起播前后的留白帧
const SPEED = 4.2; // 音频缺失时的估算语速（字/秒）
const AT = 0.55;   // 抽帧位置（场景进度比例）

const narration = JSON.parse(readFileSync("src/narration.json", "utf8"));

function wavSeconds(path) {
  const buf = readFileSync(path);
  let off = 12, byteRate = 0;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") byteRate = buf.readUInt32LE(off + 8 + 8);
    if (id === "data") return size / byteRate;
    off += 8 + size + (size % 2);
  }
  throw new Error(`no data chunk: ${path}`);
}

let start = 0;
const rows = [];
for (const s of narration) {
  const wav = `public/audio/${s.id}.wav`;
  const secs = existsSync(wav) ? wavSeconds(wav) : Math.max(2, s.narration.length / SPEED);
  const dur = Math.ceil(secs * FPS) + PAD * 2;
  rows.push({ id: s.id, start, dur, check: start + Math.floor(dur * AT), hasAudio: existsSync(wav) });
  start += dur;
}
for (const r of rows) console.log(`${r.id} start=${r.start} dur=${r.dur} check=${r.check} audio=${r.hasAudio}`);
console.log(`TOTAL_FRAMES=${start} (${(start / FPS).toFixed(1)}s)`);
console.log(`CHECKS=${rows.map((r) => r.check).join(",")}`);
```

`check-band.mjs` —— 检测字幕安全带是否残留内容像素（对"无字幕版"抽帧运行，退出码 0 = 全部通过；1 = 存在遮挡）：

```js
#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const Y0 = 937, Y1 = 1028; // 字幕带纵向区间（bottom:52 + fontSize38 + padding36）
const X0 = 60, X1 = 1860;  // 忽略左右极端边缘
const THRESHOLD = 80;      // 背景+网格线亮度 <60，文字/描边远高于此

let fail = 0;
for (const file of process.argv.slice(2)) {
  const png = PNG.sync.read(readFileSync(file));
  let count = 0, yMin = -1, yMax = -1;
  for (let y = Y0; y <= Y1; y++) {
    for (let x = X0; x <= X1; x++) {
      const i = (png.width * y + x) << 2;
      const v = Math.max(png.data[i], png.data[i + 1], png.data[i + 2]);
      if (v > THRESHOLD) {
        count++;
        if (yMin < 0) yMin = y;
        yMax = y;
      }
    }
  }
  const status = count === 0 ? "OK " : "FAIL";
  if (count) fail++;
  console.log(`${status} ${file} contentPixels=${count}` + (count ? ` yRange=[${yMin},${yMax}]` : ""));
}
process.exit(fail ? 1 : 0);
```

#### 原理

背景为深色（含网格线亮度 < 60），文字/描边远高于 80，所以阈值 80 下计到任何像素都意味着字幕带里有内容。同理可扫任意矩形区域（标题区、某模块的包围盒）验证其他遮挡类型。

### `cover-generation`：多平台封面图生成

> 为视频项目生成多平台封面图（视频平台 16:9、小红书等图文平台 3:4 竖版），用 Remotion still 从同源组件渲染静态 PNG，并做像素级布局自查。当需要生成视频封面、封面图、平台配图或调整封面比例时使用。

用与正片**同源**的 Remotion 组件渲染静态封面：同调色板、同字体、同网格背景，封面即视频风格的「预告帧」。一次组件开发，产出多平台多比例。

#### 平台比例速查（已多信源交叉确认）

| 平台 | 比例 | 分辨率 | 说明 |
|---|---|---|---|
| B 站 / YouTube 等视频平台 | 16:9 | 1920×1080 | 与视频同帧，缩略图不裁切 |
| 小红书等图文平台 | 3:4 | 1080×1440 | 信息流占屏最大，官方推荐首图 |
| 通用图文 / 横版卡片 | 4:3 | 1440×1080 | 宽度介于两者之间，用竖向堆叠布局 |
| （备选）抖音/快手封面 | 9:16 | 1080×1920 | 竖版视频平台，需要时再加 |

#### 流程

1. **封面组件**：在 `src/` 下建 `Cover.tsx`（或并入现有组件），复用正片的调色板、`ensureFonts()`、网格 Backdrop。每个比例一个导出组件（`CoverLandscape` / `CoverPortrait`）
2. **注册**：`Root.tsx` 追加 Composition，`durationInFrames={1}`（静态帧），尺寸按上表
3. **渲染**：

   ```bash
   npx remotion still CoverLandscape out/cover-video-16x9.png --frame=0
   npx remotion still CoverPortrait out/cover-xhs-3x4.png --frame=0
   npx remotion still CoverQuart out/cover-4x3.png --frame=0
   ```

4. **像素自查**：`node scripts/cover-check.mjs`，全绿再交付

#### 设计要点

- **布局分区**：16:9 左文案右视觉；3:4 上文案中视觉底关键词。同一套元素按比例重排，不是简单缩放
- **大字渐变标题**：核心词（如架构名）做 cyan→blue→violet 渐变大字，字号 120~150px
- **关键词 chips**：3~4 枚彩色描边胶囊，传达内容点
- **静态版正片图例**：把视频里最有辨识度的图示（如管线图）做成静态 SVG 放视觉区
- **平台角标安全区**：视频封面右下留约 300×90 空白（平台时长角标会盖住）；小红书信息流可能裁上下边，关键内容留内边距 ≥74px

#### 关键坑：渐变大字宽度不可控

大字标题若用 CSS `background-clip: text` + 字体栈，**回退字体的字符宽度差异会让实际渲染宽度远超预期**（等宽字体 11 字符 148px 可达 ~980px），侵入视觉区且肉眼在代码里看不出来。

**解法**：渐变大字用 SVG `<text>` + `textLength={width-6} lengthAdjust="spacingAndGlyphs"` 强制排版宽度——无论回退到什么字体，宽度精确等于设定值。渐变用 `<linearGradient>` + `fill="url(#id)"`（注意每个组件实例用唯一 gradient id，避免 SVG id 冲突）。

#### 关键坑：SVG 视觉组件 viewBox 缩放后的坐标中心

视觉组件若按「先设 viewBox 总宽、再 `s = w/totalW` 缩放」的方式自适应宽度，则**用户单位 ≠ 像素**（compact 布局 s 可达 1.7）。此时纵向中心必须用 viewBox 中心 `cy = h / s / 2`，而不是像素中心 `h/2`——后者会让内容溢出 svg 盒底部（`overflow: visible` 掩盖问题），压到下方元素且肉眼难察觉。改完共用组件后**所有比例都要重渲染复查**。

#### 像素自查脚本

pngjs 按亮度差（`|lum - bgLum| > 22`）判定内容像素，对**具体布局的关心区域**扫描（沿用 video-safe-zone 思路）：横版查文案带右边界与文案|视觉间隔带；竖版 / 4:3（竖向堆叠布局）查视觉带底边与 chips 顶边的间隙是否 > 8px。注意低对比度描边（如暗色 stroke）可能低于阈值检不出，阈值按需调。原语（`hasContent` / `rightEdge` / 逐行找边界）通用，换布局改扫描区间即可：

```js
// 封面布局像素自查：node cover-check.mjs（依赖项目 devDependencies 里的 pngjs）
import fs from "node:fs";
import { PNG } from "pngjs";

const scan = (file) => {
  const png = PNG.sync.read(fs.readFileSync(file));
  const { width: W, height: H, data } = png;
  const bgLum = 7 * 0.299 + 11 * 0.587 + 22 * 0.114; // 深色底 #070B16 的亮度，换底色时同步改
  const lum = (i) => data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  return { W, H, isContent: (i) => Math.abs(lum(i) - bgLum) > 22 };
};
const hasContent = (c, x0, y0, x1, y1) => {
  for (let y = y0; y < y1; y += 2)
    for (let x = x0; x < x1; x += 2) if (c.isContent((y * c.W + x) * 4)) return true;
  return false;
};
const rightEdge = (c, x0, x1, y0, y1) => {
  let m = -1;
  for (let y = y0; y < y1; y += 2)
    for (let x = x1 - 1; x >= x0; x -= 2)
      if (c.isContent((y * c.W + x) * 4)) { if (x > m) m = x; break; }
  return m;
};

// ===== 本项目两张封面的检查（换布局改这里） =====
// 横版 1920×1080：左文案(110..958) | 右视觉(960..1860)
{
  const c = scan("out/cover-video-16x9.png");
  const t = rightEdge(c, 0, 958, 150, 580);
  console.log("横版 左侧文案实际右边界 x =", t, t > 900 ? "!! 越界" : "OK(<900)");
  console.log("横版 标题|视觉 间隔带(x 895-955)干净:", !hasContent(c, 895, 150, 955, 620));
  console.log("横版 Pipeline 视觉起点 x ≈", rightEdge(c, 955, 1200, 250, 620));
}
// 竖版 1080×1440：中视觉带底边 与 底部 chips 顶边 的间隙
{
  const c = scan("out/cover-xhs-3x4.png");
  let chipsTop = -1;
  for (let y = 1150; y < 1300; y++)
    if (hasContent(c, 80, y, 1000, y + 1)) { chipsTop = y; break; }
  let visBottom = -1;
  for (let y = 1150; y > 1000; y--)
    if (hasContent(c, 60, y, 1020, y + 1)) { visBottom = y; break; }
  console.log("竖版 视觉底边 y =", visBottom, "chips 顶边 y =", chipsTop,
    chipsTop - visBottom > 8 ? "OK 有间隙" : "!! 重叠/贴边");
}
```
