import type { ClawdbotConfig } from "../../config/config.js";
import { resolveChannelDefaultAccountId } from "../../channels/plugins/helpers.js";
import { getChannelPlugin } from "../../channels/plugins/index.js";
import { formatCliCommand } from "../../cli/command-format.js";
import type { ChannelOnboardingAdapter } from "./types.js";

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
  configure: async ({ cfg, runtime, prompter }) => {
    await prompter.note(
      [
        "微信官方插件推荐流程：",
        "1. 已自动启用插件",
        "2. 可在引导中直接进入扫码登录",
        "3. 如需稍后手动登录：openclaw-cn channels login --channel openclaw-weixin",
        "4. 登录完成后重启网关：openclaw-cn gateway restart",
      ].join("\n"),
      "微信设置",
    );

    const next = applyOpenclawWeixinConfig(cfg);

    const plugin = getChannelPlugin(CHANNEL_ID);
    const login = plugin?.auth?.login;
    if (plugin && login) {
      const wantsLogin = await prompter.confirm({
        message: "现在为微信执行扫码登录吗？",
        initialValue: true,
      });
      if (wantsLogin) {
        try {
          const accountId = resolveChannelDefaultAccountId({ plugin, cfg: next });
          await login({
            cfg: next,
            accountId,
            runtime,
            verbose: false,
            channelInput: CHANNEL_ID,
          });
          await prompter.note(
            `扫码登录已完成。请运行 ${formatCliCommand("openclaw-cn gateway restart")} 让网关加载微信渠道。`,
            "微信登录完成",
          );
        } catch (err) {
          runtime.error(`微信登录失败: ${String(err)}`);
          await prompter.note(
            `请稍后手动执行 ${formatCliCommand("openclaw-cn channels login --channel openclaw-weixin")} 完成扫码登录。`,
            "微信登录",
          );
        }
      }
    }

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

  const plugins = { ...(next.plugins as Record<string, unknown> | undefined) };
  const entries = { ...(plugins.entries as Record<string, unknown> | undefined) };
  const entry = (entries[CHANNEL_ID] as Record<string, unknown> | undefined) ?? {};
  entries[CHANNEL_ID] = {
    ...entry,
    enabled: true,
  };
  next.plugins = {
    ...next.plugins,
    entries: entries as NonNullable<ClawdbotConfig["plugins"]>["entries"],
  };

  return next;
}
