import type { ChannelPlugin } from "openclaw/plugin-sdk";
import { resolveCompatibilityMode } from "./compat.js";
import { getBitrix24PluginConfig, parseOutboundTarget } from "./config.js";
import { executeInboundRuntime } from "./inbound-runtime.js";
import { sendBitrixImbotMessage } from "./outbound.js";
import { getInboundLiveState } from "./runtime.js";

export type Bitrix24ResolvedAccount = {
  accountId: string;
  config: Record<string, unknown>;
};

const bitrix24Meta = {
  id: "bitrix24",
  label: "Bitrix24",
  selectionLabel: "Bitrix24 (app + bridge)",
  docsPath: "/channels/bitrix24",
  docsLabel: "bitrix24",
  blurb: "Bitrix24 channel plugin with direct and hub/edge modes.",
  order: 66,
  aliases: ["bitrix", "b24"],
} as const;

export const bitrix24ChannelPlugin: ChannelPlugin<Bitrix24ResolvedAccount> = {
  // B3 note: inbound normalization logic lives in src/inbound.ts and will be
  // wired into runtime transport in subsequent blocks.
  id: "bitrix24",
  meta: bitrix24Meta,
  capabilities: {
    chatTypes: ["direct", "group"],
    polls: false,
    reactions: false,
    threads: false,
    media: false,
    nativeCommands: false,
  },
  reload: {
    configPrefixes: ["plugins.entries.bitrix24", "plugins.entries.openclaw-channel-bitrix24", "channels.bitrix24"],
  },
  configSchema: {
    schema: {
      type: "object",
      additionalProperties: true,
      properties: {
        channels: {
          type: "object",
          additionalProperties: true,
          properties: {
            bitrix24: {
              type: "object",
              additionalProperties: true,
              properties: {
                mode: { type: "string", enum: ["direct", "channel"] },
                direct: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    bridgeUrl: { type: "string" },
                    bridgeToken: { type: "string" },
                    timeoutMs: { type: "number" },
                    domain: { type: "string" },
                    accessToken: { type: "string" },
                    webhookPath: { type: "string" }
                  }
                },
                channel: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    hubUrl: { type: "string" },
                    channelToken: { type: "string" },
                    tenantChannelId: { type: "string" },
                    timeoutMs: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  config: {
    listAccountIds: () => ["default"],
    resolveAccount: (cfg) => {
      const pluginCfg = getBitrix24PluginConfig(cfg);
      const compatibility = resolveCompatibilityMode({
        mode: pluginCfg.mode,
        enabled: true,
        directConfigured: Boolean(pluginCfg.direct?.bridgeUrl),
        channelConfigured: Boolean(pluginCfg.channel?.hubUrl && pluginCfg.channel?.tenantChannelId),
      });
      return {
        accountId: "default",
        config: {
          compatibility,
          plugin: pluginCfg,
        },
      };
    },
    defaultAccountId: () => "default",
    setAccountEnabled: ({ cfg }) => cfg,
    deleteAccount: ({ cfg }) => cfg,
    isConfigured: (account) => Boolean((account as any)?.config?.compatibility?.rollbackActive === false),
    describeAccount: (account) => ({
      accountId: "default",
      enabled: true,
      configured: Boolean((account as any)?.config?.compatibility?.rollbackActive === false),
      mode: ((account as any)?.config?.plugin?.mode as string) || "direct",
      rollbackActive: Boolean((account as any)?.config?.compatibility?.rollbackActive),
      rollbackReason: String((account as any)?.config?.compatibility?.reason || ""),
    }),
    resolveAllowFrom: () => [],
    formatAllowFrom: ({ allowFrom }) => allowFrom,
  },
  security: {
    resolveDmPolicy: () => ({
      policy: "pairing",
      allowFrom: [],
      allowFromPath: "channels.bitrix24.dm.",
      approveHint: "Approve Bitrix peer via pairing flow",
      normalizeEntry: (raw: string) => raw.trim(),
    }),
    collectWarnings: () => [],
  },
  pairing: {
    idLabel: "bitrixUserId",
    normalizeAllowEntry: (entry: string) => entry.trim(),
    notifyApproval: async () => {
      // B1: no-op. Real notification transport in B3/B4.
    },
  },
  messaging: {
    normalizeTarget: ({ target }) => ({ kind: "peer", value: String(target ?? "") }),
    targetResolver: {
      looksLikeId: () => true,
      hint: "<domain:dialogId | bitrix:domain:dialogId | dialogId(with direct.domain)>",
    },
  },
  outbound: {
    deliveryMode: "direct",
    textChunkLimit: 4000,
    sendText: async ({ cfg, to, text }) => {
      const pluginCfg = getBitrix24PluginConfig(cfg);
      const domainFallback = pluginCfg.direct?.domain;
      const accessToken = String(pluginCfg.direct?.accessToken || "").trim();
      if (!accessToken) {
        throw new Error("bitrix24 direct.accessToken is required for outbound send");
      }

      const target = parseOutboundTarget(String(to || ""), domainFallback);
      const out = await sendBitrixImbotMessage({
        domain: target.domain,
        accessToken,
        dialogId: target.dialogId,
        message: text,
        timeoutMs: pluginCfg.direct?.timeoutMs,
      });

      return {
        channel: "bitrix24",
        result: out.result,
      };
    },
  },
  resolver: {
    resolveTargets: async ({ inputs }) =>
      inputs.map((input: string) => ({ input, resolved: true, id: input })),
  },
  gateway: {
    startAccount: async (ctx) => {
      const probe = executeInboundRuntime({
        payload: {
          event: "ONIMBOTMESSAGEADD",
          auth: { domain: "probe.local" },
          data: {
            PARAMS: {
              MESSAGE: "probe",
              CHAT_TYPE: "P",
              AUTHOR_ID: "1",
              DIALOG_ID: "1",
              MESSAGE_ID: "0",
            },
          },
        },
      });

      const current = ctx.getStatus();
      const live = getInboundLiveState();
      ctx.setStatus({
        ...current,
        accountId: ctx.accountId,
        mode: "direct",
        running: true,
        lastStartAt: Date.now(),
        lastProbeAt: Date.now(),
        probe: {
          inboundBinding: probe.ok,
          phase: probe.phase,
          error: probe.error || null,
          routePath: live.routePath,
          liveHits: live.hits,
          liveLastInboundAt: live.lastInboundAt,
          liveLastError: live.lastError,
          handoffCount: live.handoffCount,
          lastHandoffAt: live.lastHandoffAt,
          lastHandoffError: live.lastHandoffError,
        },
      });

      return {
        stop: async () => {
          const now = Date.now();
          const currentStop = ctx.getStatus();
          const live = getInboundLiveState();
          ctx.setStatus({
            ...currentStop,
            accountId: ctx.accountId,
            running: false,
            lastStopAt: now,
            probe: {
              ...(currentStop as any)?.probe,
              routePath: live.routePath,
              liveHits: live.hits,
              liveLastInboundAt: live.lastInboundAt,
              liveLastError: live.lastError,
              handoffCount: live.handoffCount,
              lastHandoffAt: live.lastHandoffAt,
              lastHandoffError: live.lastHandoffError,
            },
          });
        },
      };
    },
  },
};
