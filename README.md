# 🧞 Openclaw-cn-termux

**私有化部署的 AI 智能助手，适配 Termux 和 AidLux 移动端环境。**

> ⚠️ **声明：** 本项目是基于 Openclaw-cn 的移动端适配版本，专为在 Android Termux 和 AidLux 环境中运行而设计。本项目已将所有 GitHub 依赖包构建为 npm 包，让国内用户使用淘宝镜像源可快速下载。

<p align="center">
  <img src="docs/images/main-view.png" alt="Openclaw Termux 控制界面" width="800">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/openclaw-cn-termux"><img src="https://img.shields.io/npm/v/openclaw-cn-termux?style=for-the-badge&logo=npm&logoColor=white&label=npm" alt="npm 版本"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%E2%89%A5%2022-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 版本"></a>
  <a href="https://github.com/byteuser1977/openclaw-cn-termux"><img src="https://img.shields.io/github/stars/byteuser1977/openclaw-cn-termux?style=for-the-badge&logo=github&label=Stars" alt="GitHub Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-MIT-blue.svg?style=for-the-badge" alt="MIT 许可证"></a>
</p>

<p align="center">
  <a href="https://github.com/byteuser1977/openclaw-cn-termux/issues">💬 反馈</a>
</p>

---

## ✨ 特性

- **📱 Termux + AidLux 优化** — 专为 Android Termux 和 AidLux 环境设计，移动端也能运行 AI 助手
- **🇨🇳 完整中文化** — CLI、Web 控制界面、配置向导全部汉化
- **🏠 本地优先** — 数据存储在你自己的设备上，隐私可控
- **📱 多渠道支持** — WhatsApp、Telegram、Slack、Discord、Signal 等
- **🎙️ 语音交互** — 支持语音唤醒和对话功能
- **🖼️ Canvas 画布** — 智能体驱动的可视化工作区
- **🔧 技能扩展** — 内置技能 + 自定义工作区技能

## 🚀 快速开始

**环境要求：** Node.js ≥ 22

### 一键安装（推荐）

**macOS / Linux：**

```bash
curl -fsSL https://clawd.org.cn/install.sh | bash
```

**Termux（推荐在 Termux 中通过 proot-distro 运行 Ubuntu）：**

```bash
curl -fsSL https://raw.githubusercontent.com/byteuser1977/termux-install-openclaw/main/scripts/install-ubuntu.sh | bash
```

**AidLux：**

```bash
curl -fsSL https://raw.githubusercontent.com/byteuser1977/termux-install-openclaw/main/scripts/install-aidlux.sh | bash
```

安装脚本会自动处理 Node 检测、安装和初始配置。

### npm 安装

```bash
npm install -g openclaw-cn-termux@latest
openclaw-termux onboard --install-daemon
```

### 从源码构建

```bash
git clone https://github.com/byteuser977/openclaw-cn-termux.git
cd openclaw-cn-termux

pnpm install
pnpm ui:build
pnpm build

pnpm openclaw-termux onboard --install-daemon
```

### Termux/AidLux 移动端安装

本项目专为 Android Termux 和 AidLux 环境优化，已将所有 GitHub 依赖构建为 npm 包，国内用户可使用淘宝镜像源快速安装。

**一键安装（推荐）：**

| 环境   | 一键安装命令                                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Termux | `curl -fsSL https://raw.githubusercontent.com/byteuser1977/termux-install-openclaw/main/scripts/install-ubuntu.sh \| bash` |
| AidLux | `curl -fsSL https://raw.githubusercontent.com/byteuser1977/termux-install-openclaw/main/scripts/install-aidlux.sh \| bash` |

**手动安装步骤：**

```bash
# 1. 安装 Node.js 22+
pkg update && pkg install nodejs

# 2. 使用淘宝镜像安装（国内推荐）
npm install -g openclaw-cn-termux@latest --registry=https://registry.npmmirror.com

# 3. 运行初始配置
openclaw-termux onboard

# 4. 启动网关
openclaw-termux gateway run
```

详细文档：[Termux 完整安装手册](https://clawd.org.cn/docs/installation) · [AidLux 安装手册](https://clawd.org.cn/docs/aidlux-installation)

## 🔧 配置

配置文件位于 `~/.openclaw/` 目录（桌面端）或 `~/.openclaw-cn-termux/` 目录（Termux）。

最小配置示例：

```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-5"
  }
}
```

详细配置请参考：[网关配置文档](https://clawd.org.cn/docs/gateway/configuration)

## 📚 文档

详细安装和配置文档：`https://clawd.org.cn/docs/`

### 常用文档链接

| 文档                                                        | 说明                     |
| ----------------------------------------------------------- | ------------------------ |
| [快速入门](https://clawd.org.cn/docs/start/getting-started) | 首次使用指南             |
| [安装脚本详解](https://clawd.org.cn/docs/install/installer) | install.sh 参数和自动化  |
| [Node.js 安装](https://clawd.org.cn/docs/install/node)      | PATH 问题排查            |
| [npm/pnpm 安装](https://clawd.org.cn/docs/install)          | npm/pnpm 方式安装        |
| [从源码构建](https://clawd.org.cn/docs/install)             | 开发者构建指南           |
| [更新 OpenClaw](https://clawd.org.cn/docs/install/updating) | 更新和回滚策略           |
| [卸载](https://clawd.org.cn/docs/install/uninstall)         | 完全卸载指南             |
| [网关配置](https://clawd.org.cn/docs/gateway/configuration) | 网关配置参考             |
| [渠道配置](https://clawd.org.cn/docs/channels)              | WhatsApp/Telegram 等配置 |
| [技能扩展](https://clawd.org.cn/docs/tools/skills)          | 技能系统说明             |

## 🔄 版本同步

本项目基于 `https://github.com/jiulingyun/openclaw-cn` 进行开发，定期与上游保持同步。

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

<a href="https://star-history.com/#byteuser1977/openclaw-cn-termux&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=byteuser1977/openclaw-cn-termux&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=byteuser1977/openclaw-cn-termux&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=byteuser1977/openclaw-cn-termux&type=Date" />
  </picture>
</a>

---

<p align="center">
  基于 <a href="https://github.com/openclaw/openclaw">Openclaw</a> · 感谢原项目开发者 🧞
</p>
