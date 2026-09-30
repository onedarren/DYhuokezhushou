# DYhuokezhushou · 抖音自动获客助手

智能抖音获客助手用户脚本：支持点赞、收藏、评论（表情 / 文本 / AI 回复 / 图片评论），
提供**关键词搜索**与**视频链接**两种任务模式，页面内浮动控制面板，任务进度持久化与自动恢复。

兼容 [ScriptCat（脚本猫）](https://scriptcat.org) 与 [Tampermonkey（油猴）](https://www.tampermonkey.net/)。

> ⚠️ **免责声明**：本项目仅供学习交流，请勿用于任何违反抖音平台规则或法律法规的用途。
> 使用本脚本产生的一切后果由使用者自行承担。

## 开源模式

本项目采用 **「核心闭源、非核心开源」** 的模式：

| 部分 | 内容 | 许可证 |
| --- | --- | --- |
| 开源（本仓库） | 存储封装、通用工具、跨域请求、浮动控制面板、启动引导 | [MIT](LICENSE) |
| 闭源（仅混淆分发） | 选择器库、拟人点击、头像识别、AI 服务、搜索页流程、评论管理、任务编排与恢复 | 专有软件，禁止逆向与二次分发 |

发布版脚本（`dist/` 下的 `-obfuscated` 文件）中可以直观看到这一划分：
开源模块保持可读并带协议头，核心引擎以混淆形式内置。

## 安装

1. 浏览器安装 [ScriptCat](https://scriptcat.org) 或 [Tampermonkey](https://www.tampermonkey.net/)
2. 下载 [dist/抖音自动获客助手-obfuscated.user.js](dist/抖音自动获客助手-obfuscated.user.js)，
   在脚本管理器中「新建脚本」粘贴全部内容保存，或直接拖入安装
3. 打开 [www.douyin.com](https://www.douyin.com)，页面右侧会出现「🎵 抖音自动获客助手」浮动面板

## 功能

| 功能 | 说明 |
| --- | --- |
| 关键词模式 | 按关键词打开抖音搜索页，逐视频执行操作，支持搜索筛选（排序/时间/时长/范围） |
| 视频链接模式 | 按链接列表逐条执行，支持 `/video/xxx` 与 `/jingxuan?modal_id=xxx` |
| 操作类型 | 点赞、收藏、评论任意组合 |
| 评论方式 | 回复评论（自动定位回复按钮）/ 直接评论 |
| 评论类型 | 表情 / 文本（随机） / AI（DeepSeek、Kimi、OpenAI、OpenRouter、小米 MiMo、Ollama、Gemini） |
| 图片评论 | AI/文本模式下可附加第 N 张收藏图片 |
| 回复过滤 | 按包含/排除关键词过滤目标评论；回复前点赞；仅一级评论 |
| 防重复 | 按头像标识识别自己已回复/已评论的内容，避免重复 |
| 进度与恢复 | 任务进度持久化，页面跳转后自动继续；卡住 5 分钟自动重试 |

## AI 评论配置

评论类型选择「AI回复」，填写对应平台 API Key（Ollama 为本地模型无需 Key）。
请求通过 `GM_xmlhttpRequest` 直连各平台接口，无跨域问题，API Key 仅保存在本地脚本存储中。

## 仓库结构

```
src/
  header.meta.js     用户脚本元数据
  open/              ★ 开源模块（MIT）
    01-runtime.js      存储封装 / 通用工具 / 跨域请求
    20-panel.js        浮动控制面板
    30-main.js         启动引导
  build.js           构建脚本（组装开源模块与核心模块；核心模块不在本仓库）
dist/
  抖音自动获客助手-obfuscated.user.js   发布版（开源模块可读 + 核心引擎混淆）
```

## 构建

```bash
cd src
npm install javascript-obfuscator
node build.js
```

注意：核心模块（`src/core/`）不在本仓库中，完整构建仅作者可执行。
欢迎对本仓库中的开源模块（面板 UI、工具层）提交 Issue / PR。

## 反馈

问题与建议请提交到 [Issues](../../issues)。

## 许可证

- `src/open/` 及构建脚本：[MIT License](LICENSE)
- 发布版中的核心引擎：专有软件，禁止逆向工程与二次分发
