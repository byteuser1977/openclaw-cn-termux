---
summary: "使用 Ansible、Tailscale VPN 和防火墙隔离进行自动化、安全加固的 Clawdbot 安装"
read_when:
  - 您想要带有安全加固的自动化服务器部署
  - 您需要带有 VPN 访问的防火墙隔离设置
  - 您正在部署到远程 Debian/Ubuntu 服务器
---

# Ansible 安装

将 Clawdbot 部署到生产服务器的推荐方式是通过 **[clawdbot-ansible](https://github.com/byteuser977/openclaw-cn-termux-ansible)** — 一个安全优先架构的自动化安装器。

## 快速开始

一条命令安装：

```bash
curl -fsSL https://raw.githubusercontent.com/clawdbot/clawdbot-ansible/main/install.sh | bash
```

> **📦 完整指南：[github.com/byteuser977/openclaw-cn-termux-ansible](https://github.com/byteuser977/openclaw-cn-termux-ansible)**
>
> clawdbot-ansible 仓库是 Ansible 部署的权威来源。本页面只是快速概述。

## 您将获得

- 🔒 **防火墙优先安全**：UFW + Docker 隔离（仅 SSH + Tailscale 可访问）
- 🔐 **Tailscale VPN**：安全远程访问，无需公开暴露服务
- 🐳 **Docker**：隔离的沙箱容器，仅绑定 localhost
- 🛡️ **纵深防御**：4 层安全架构
- 🚀 **一条命令设置**：几分钟内完成部署
- 🔧 **Systemd 集成**：开机自启动并带有安全加固

## 要求

- **操作系统**：Debian 11+ 或 Ubuntu 20.04+
- **访问权限**：Root 或 sudo 权限
- **网络**：用于安装软件包的互联网连接
- **Ansible**：2.14+（由快速启动脚本自动安装）

## 安装内容

Ansible playbook 安装和配置：

1. **Tailscale**（用于安全远程访问的 mesh VPN）
2. **UFW 防火墙**（仅 SSH + Tailscale 端口）
3. **Docker CE + Compose V2**（用于代理沙箱）
4. **Node.js 22.x + pnpm**（运行时依赖）
5. **Clawdbot**（基于主机，非容器化）
6. **Systemd 服务**（带安全加固的自动启动）

注意：网关 **直接在主机上** 运行（不在 Docker 中），但代理沙箱使用 Docker 进行隔离。详见 [沙箱](/gateway/sandboxing)。

## 安装后设置

安装完成后，切换到 clawdbot 用户：

```bash
sudo -i -u clawdbot
```

安装后脚本将引导您完成：

1. **引导向导**：配置 Clawdbot 设置
2. **提供商登录**：连接 WhatsApp/Telegram/Discord/Signal
3. **网关测试**：验证安装
4. **Tailscale 设置**：连接到您的 VPN 网格

### 快速命令

```bash
# 检查服务状态
sudo systemctl status clawdbot

# 查看实时日志
sudo journalctl -u clawdbot -f

# 重启网关
sudo systemctl restart clawdbot

# 提供商登录（以 clawdbot 用户运行）
sudo -i -u clawdbot
openclaw-cn channels login
```

## 安全架构

### 4 层防御

1. **防火墙 (UFW)**：仅公开暴露 SSH (22) + Tailscale (41641/udp)
2. **VPN (Tailscale)**：网关仅可通过 VPN 网格访问
3. **Docker 隔离**：DOCKER-USER iptables 链防止外部端口暴露
4. **Systemd 加固**：NoNewPrivileges、PrivateTmp、非特权用户

### 验证

测试外部攻击面：

```bash
nmap -p- YOUR_SERVER_IP
```

应该显示 **仅端口 22** (SSH) 打开。所有其他服务（网关、Docker）都被锁定。

### Docker 可用性

Docker 是为 **代理沙箱**（隔离的工具执行）安装的，而不是用于运行网关本身。网关仅绑定到 localhost，可通过 Tailscale VPN 访问。

详见 [多代理沙箱与工具](/multi-agent-sandbox-tools) 了解沙箱配置。

## 手动安装

如果您更喜欢手动控制而非自动化：

```bash
# 1. 安装先决条件
sudo apt update && sudo apt install -y ansible git

# 2. 克隆仓库
git clone https://github.com/byteuser977/openclaw-cn-termux-ansible.git
cd clawdbot-ansible

# 3. 安装 Ansible collections
ansible-galaxy collection install -r requirements.yml

# 4. 运行 playbook
./run-playbook.sh

# 或者直接运行（然后手动执行 /tmp/clawdbot-setup.sh）
# ansible-playbook playbook.yml --ask-become-pass
```

## 更新 Clawdbot

Ansible 安装器设置 Clawdbot 进行手动更新。详见 [更新](/install/updating) 了解标准更新流程。

要重新运行 Ansible playbook（例如，配置更改）：

```bash
cd clawdbot-ansible
./run-playbook.sh
```

注意：这是幂等的，可以安全地多次运行。

## 故障排除

### 防火墙阻止我的连接

如果您被锁定：

- 确保您可以先通过 Tailscale VPN 访问
- SSH 访问（端口 22）始终允许
- 网关 **仅** 可通过 Tailscale 访问，这是设计使然

### 服务无法启动

```bash
# 检查日志
sudo journalctl -u clawdbot -n 100

# 验证权限
sudo ls -la /opt/clawdbot

# 测试手动启动
sudo -i -u clawdbot
cd ~/openclawot
pnpm start
```

### Docker 沙箱问题

```bash
# 验证 Docker 正在运行
sudo systemctl status docker

# 检查沙箱镜像
sudo docker images | grep clawdbot-sandbox

# 如果缺少沙箱镜像则构建
cd /opt/clawdbot/clawdbot
sudo -u clawdbot ./scripts/sandbox-setup.sh
```

### 提供商登录失败

确保您以 `clawdbot` 用户运行：

```bash
sudo -i -u clawdbot
openclaw-cn channels login
```

## 高级配置

详细的安全架构和故障排除：

- [安全架构](https://github.com/byteuser977/openclaw-cn-termux-ansible/blob/main/docs/security.md)
- [技术细节](https://github.com/byteuser977/openclaw-cn-termux-ansible/blob/main/docs/architecture.md)
- [故障排除指南](https://github.com/byteuser977/openclaw-cn-termux-ansible/blob/main/docs/troubleshooting.md)

## 相关

- [clawdbot-ansible](https://github.com/byteuser977/openclaw-cn-termux-ansible) — 完整部署指南
- [Docker](/install/docker) — 容器化网关设置
- [沙箱](/gateway/sandboxing) — 代理沙箱配置
- [多代理沙箱与工具](/multi-agent-sandbox-tools) — 每代理隔离
