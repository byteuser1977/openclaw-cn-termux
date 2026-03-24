import type {
  ChannelMeta,
  ChannelPlugin,
  OpenClawConfig as ClawdbotConfig,
} from "openclaw/plugin-sdk";
import { openclawWeixinOnboardingAdapter } from "./onboarding.js";

const CHANNEL_ID = "openclaw-weixin" as const;

const meta: ChannelMeta = {
  id: CHANNEL_ID,
  label: "微信",
  selectionLabel: "微信 (官方插件)",
  docsPath: "/channels/openclaw-weixin",
  docsLabel: "openclaw-weixin",
  blurb: "微信渠道插件（扫码登录），由腾讯官方插件提供。",
  aliases: ["weixin", "wechat"],
  order: 47,
};

type OpenclawWeixinAccount = {
  accountId: string;
  enabled: boolean;
  configured: boolean;
};

export const openclawWeixinPlugin: ChannelPlugin<OpenclawWeixinAccount> = {
  id: CHANNEL_ID,
  meta,
  capabilities: {
    chatTypes: ["direct", "channel"],
    polls: false,
    threads: false,
    media: true,
    nativeCommands: false,
    reactions: false,
    edit: false,
    reply: false,
  },
  reload: { configPrefixes: [`channels.${CHANNEL_ID}`] },
  configSchema: {
    schema: {
      type: "object",
      additionalProperties: true,
      properties: {
        enabled: { type: "boolean" },
      },
      required: [],
    },
  },
  config: {
    listAccountIds: (cfg) => {
      const channelCfg = (cfg.channels as Record<string, unknown> | undefined)?.[CHANNEL_ID];
      return channelCfg ? ["default"] : [];
    },
    resolveAccount: (cfg, accountId) => {
      const channelCfg = (cfg.channels as Record<string, unknown> | undefined)?.[CHANNEL_ID] as
        | Record<string, unknown>
        | undefined;
      return {
        accountId: accountId ?? "default",
        enabled: channelCfg?.enabled !== false && Boolean(channelCfg),
        configured: Boolean(channelCfg),
      };
    },
    defaultAccountId: () => "default",
    setAccountEnabled: ({ cfg, enabled }) => {
      const next = { ...cfg } as ClawdbotConfig;
      const channels = { ...(next.channels as Record<string, unknown> | undefined) };
      const existing = (channels[CHANNEL_ID] as Record<string, unknown> | undefined) ?? {};
      channels[CHANNEL_ID] = { ...existing, enabled };
      next.channels = channels as ClawdbotConfig["channels"];
      return next;
    },
    deleteAccount: ({ cfg }) => {
      const next = { ...cfg } as ClawdbotConfig;
      const channels = { ...(next.channels as Record<string, unknown> | undefined) };
      delete channels[CHANNEL_ID];
      next.channels = channels as ClawdbotConfig["channels"];
      return next;
    },
    isConfigured: (account) => account.configured,
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
    }),
    resolveAllowFrom: () => [],
    formatAllowFrom: ({ allowFrom }) => allowFrom.map((e) => String(e).trim()).filter(Boolean),
  },
  setup: {
    resolveAccountId: () => "default",
    applyAccountConfig: ({ cfg }) => {
      const next = { ...cfg } as ClawdbotConfig;
      const channels = { ...(next.channels as Record<string, unknown> | undefined) };
      const existing = (channels[CHANNEL_ID] as Record<string, unknown> | undefined) ?? {};
      channels[CHANNEL_ID] = { ...existing, enabled: true };
      next.channels = channels as ClawdbotConfig["channels"];
      return next;
    },
  },
  onboarding: openclawWeixinOnboardingAdapter,
  status: {
    defaultRuntime: {
      accountId: "default",
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null,
      port: null,
    },
    buildChannelSummary: ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      running: snapshot.running ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      port: snapshot.port ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null,
    }),
    buildAccountSnapshot: ({ account, runtime }) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
      running: runtime?.running ?? false,
      lastStartAt: runtime?.lastStartAt ?? null,
      lastStopAt: runtime?.lastStopAt ?? null,
      lastError: runtime?.lastError ?? null,
      port: runtime?.port ?? null,
    }),
  },
};
