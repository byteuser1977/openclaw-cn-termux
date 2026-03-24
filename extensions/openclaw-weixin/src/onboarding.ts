import type {
  ChannelOnboardingAdapter,
  OpenClawConfig as ClawdbotConfig,
} from "openclaw/plugin-sdk";

const CHANNEL_ID = "openclaw-weixin" as const;

export const openclawWeixinOnboardingAdapter: ChannelOnboardingAdapter = {
  channel: CHANNEL_ID,
  getStatus: async ({ cfg }) => {
    const channelCfg = (cfg.channels as Record<string, unknown> | undefined)?.[CHANNEL_ID] as
      | Record<string, unknown>
      | undefined;
    const configured = Boolean(channelCfg?.enabled !== false && channelCfg);
    return {
      channel: CHANNEL_ID,
      configured,
      statusLines: [`微信: ${configured ? "已启用（待扫码登录）" : "未配置"}`],
      selectionHint: configured ? "recommended · configured" : "安装插件后扫码登录",
      quickstartScore: configured ? 1 : 8,
    };
  },
  configure: async ({ cfg, prompter }) => {
    await prompter.note(
      [
        "微信官方插件推荐流程：",
        '1. 安装插件：openclaw-cn plugins install "@tencent-weixin/openclaw-weixin@latest"',
        "2. 启用插件：openclaw-cn config set plugins.entries.openclaw-weixin.enabled true",
        "3. 扫码登录：openclaw-cn channels login --channel openclaw-weixin",
        "4. 重启网关：openclaw-cn gateway restart",
      ].join("\n"),
      "微信设置",
    );

    const next = applyOpenclawWeixinConfig(cfg);
    return { cfg: next };
  },
  disable: (cfg) => {
    const next = { ...cfg } as ClawdbotConfig;
    const channels = { ...(next.channels as Record<string, unknown> | undefined) };
    const existing = channels[CHANNEL_ID] as Record<string, unknown> | undefined;
    if (existing) {
      channels[CHANNEL_ID] = { ...existing, enabled: false };
      next.channels = channels as ClawdbotConfig["channels"];
    }
    return next;
  },
};

function applyOpenclawWeixinConfig(cfg: ClawdbotConfig): ClawdbotConfig {
  const next = { ...cfg } as ClawdbotConfig;
  const channels = { ...(next.channels as Record<string, unknown> | undefined) };
  const existing = (channels[CHANNEL_ID] as Record<string, unknown> | undefined) ?? {};
  channels[CHANNEL_ID] = {
    ...existing,
    enabled: true,
  };
  next.channels = channels as ClawdbotConfig["channels"];
  return next;
}
