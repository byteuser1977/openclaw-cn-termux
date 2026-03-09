# 🧞 Openclaw-termux

**私有化部署的 AI 智能助手，适配 Termux 移动端环境。**

> ⚠️ **声明：** 本项目是基于 Openclaw-cn 的 Termux 移动端适配版本，专为在 Android Termux 环境中运行而设计。本项目已将所有 GitHub 依赖包构建为 npm 包，让国内用户使用淘宝镜像源可快速下载。

<p align="center">
  <img src="docs/images/main-view.png" alt="Openclaw Termux 控制界面" width="800">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/openclaw-termux"><img src="https://img.shields.io/npm/v/openclaw-termux?style=for-the-badge&logo=npm&logoColor=white&label=npm" alt="npm 版本"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%E2%89%A5%2022-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 版本"></a>
  <a href="https://github.com/jiulingyun/openclaw-termux"><img src="https://img.shields.io/github/stars/jiulingyun/openclaw-termux?style=for-the-badge&logo=github&label=Stars" alt="GitHub Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-MIT-blue.svg?style=for-the-badge" alt="MIT 许可证"></a>
</p>

<p align="center">
  <a href="https://github.com/byteuser1977/openclaw-cn-termux/issues">💬 反馈</a>
</p>

---

## ✨ 特性

- **📱 Termux 优化** — 专为 Android Termux 环境设计，移动端也能运行 AI 助手
- **🇨🇳 完整中文化** — CLI、Web 控制界面、配置向导全部汉化
- **🏠 本地优先** — 数据存储在你自己的设备上，隐私可控
- **� 多渠道支持** — WhatsApp、Telegram、Slack、Discord、Signal 等
- **🎙️ 语音交互** — 支持语音唤醒和对话功能
- **🖼️ Canvas 画布** — 智能体驱动的可视化工作区
- **🔧 技能扩展** — 内置技能 + 自定义工作区技能

## 🚀 快速开始

**环境要求：** Node.js ≥ 22，推荐在 Android Termux 环境中运行

```bash
# 安装
npm install -g openclaw-termux@latest

# 运行安装向导
openclaw-termux onboard --install-daemon

# 启动网关
openclaw-termux gateway --port 18789 --verbose
```

## 📦 安装方式

### npm（推荐）

```bash
npm install -g openclaw-termux@latest
# 或
pnpm add -g openclaw-termux@latest
```

### 从源码构建

```bash
git clone https://github.com/byteuser1977/openclaw-termux.git
cd openclaw-termux

pnpm install
pnpm ui:build
pnpm build

pnpm openclaw-termux onboard --install-daemon
```

## 🔧 配置

最小配置 `~/.openclaw-termux/openclaw.json`：

```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-5"
  }
}
```

## 📚 文档

参考 [Openclaw-cn](https://clawd.org.cn/docs/) 文档。

- [快速开始](https://clawd.org.cn/docs/start/getting-started)
- [Gateway 配置](https://clawd.org.cn/docs/gateway/configuration)
- [渠道接入](https://clawd.org.cn/docs/channels)
- [技能开发](https://clawd.org.cn/docs/tools/skills)

## 🔄 版本同步

本项目基于 [openclaw/openclaw-cn](https://github.com/jiulingyun/openclaw-cn) 进行开发，定期与上游保持同步。

版本格式：`vYYYY.M.D-termux.N`（如 `v2026.1.24-termux.1`）

## 🤝 参与贡献

欢迎提交 Issue 和 PR！

- Bug 修复和功能优化会考虑贡献回上游
- Termux 平台适配优化非常欢迎

## 🙌 Thanks to all clawtributors

<p align="left">
  <a href="https://github.com/Ronald-Kong99"><img src="https://avatars.githubusercontent.com/Ronald-Kong99?v=4" width="48" height="48" alt="Ronald-Kong99" /></a>
  <a href="https://github.com/dragonforce2010"><img src="https://avatars.githubusercontent.com/dragonforce2010?v=4" width="48" height="48" alt="dragonforce2010" /></a>
  <a href="https://github.com/yanghua"><img src="https://avatars.githubusercontent.com/yanghua?v=4" width="48" height="48" alt="yanghua" /></a>
  <a href="https://github.com/qqdxyg"><img src="https://avatars.githubusercontent.com/qqdxyg?v=4" width="48" height="48" alt="qqdxyg" /></a>
  <a href="https://github.com/ddupg"><img src="https://avatars.githubusercontent.com/ddupg?v=4" width="48" height="48" alt="ddupg" /></a>
</p>

## 📋 开发计划

- [x] Termux 环境适配
- [x] CLI 界面汉化
- [x] Web 控制界面汉化
- [x] 配置向导汉化
- [ ] Termux 启动脚本优化
- [ ] 移动端网络优化
- [ ] 节能模式支持

## 📄 许可证

[MIT](LICENSE)

## ⭐ Star 趋势

<a href="https://star-history.com/#jiulingyun/openclaw-termux&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=jiulingyun/openclaw-termux&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=jiulingyun/openclaw-termux&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=jiulingyun/openclaw-termux&type=Date" />
 </picture>
</a>

---

<p align="center">
  基于 <a href="https://github.com/openclaw/openclaw">Openclaw</a> · 感谢原项目开发者 🧞
</p>
