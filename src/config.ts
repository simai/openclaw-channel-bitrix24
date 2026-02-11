export type Bitrix24PluginConfig = {
  mode: "direct" | "channel";
  direct?: {
    bridgeUrl?: string;
    bridgeToken?: string;
    timeoutMs?: number;
    domain?: string;
    accessToken?: string;
    webhookPath?: string;
  };
  channel?: {
    hubUrl?: string;
    channelToken?: string;
    tenantChannelId?: string;
    timeoutMs?: number;
  };
};

function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

export function getBitrix24PluginConfig(cfg: any): Bitrix24PluginConfig {
  const plugins = asObj(cfg?.plugins);
  const entries = asObj(plugins.entries);
  const bitrixEntry = asObj(entries.bitrix24);
  const pluginIdEntry = asObj(entries["openclaw-channel-bitrix24"]);
  const entry = Object.keys(bitrixEntry).length > 0 ? bitrixEntry : pluginIdEntry;
  const pluginConfig = asObj(entry.config);

  const mode = String(pluginConfig.mode ?? "direct").toLowerCase() === "channel" ? "channel" : "direct";
  const direct = asObj(pluginConfig.direct);
  const channel = asObj(pluginConfig.channel);

  return {
    mode,
    direct: {
      bridgeUrl: typeof direct.bridgeUrl === "string" ? direct.bridgeUrl : undefined,
      bridgeToken: typeof direct.bridgeToken === "string" ? direct.bridgeToken : undefined,
      timeoutMs: Number(direct.timeoutMs || 45000),
      domain: typeof direct.domain === "string" ? direct.domain : undefined,
      accessToken: typeof direct.accessToken === "string" ? direct.accessToken : undefined,
      webhookPath: typeof direct.webhookPath === "string" ? direct.webhookPath : undefined,
    },
    channel: {
      hubUrl: typeof channel.hubUrl === "string" ? channel.hubUrl : undefined,
      channelToken: typeof channel.channelToken === "string" ? channel.channelToken : undefined,
      tenantChannelId: typeof channel.tenantChannelId === "string" ? channel.tenantChannelId : undefined,
      timeoutMs: Number(channel.timeoutMs || 45000),
    },
  };
}

export function parseOutboundTarget(to: string, fallbackDomain?: string): { domain: string; dialogId: string } {
  const raw = String(to || "").trim();
  if (!raw) throw new Error("empty outbound target");

  // Accepted forms:
  // 1) domain:dialogId
  // 2) bitrix:domain:dialogId
  // 3) dialogId (requires fallbackDomain)
  if (raw.startsWith("bitrix:")) {
    const parts = raw.split(":");
    if (parts.length >= 3) {
      const domain = parts[1];
      const dialogId = parts.slice(2).join(":");
      if (domain && dialogId) return { domain, dialogId };
    }
  }

  const idx = raw.indexOf(":");
  if (idx > 0) {
    const domain = raw.slice(0, idx);
    const dialogId = raw.slice(idx + 1);
    if (domain && dialogId) return { domain, dialogId };
  }

  if (fallbackDomain) return { domain: fallbackDomain, dialogId: raw };
  throw new Error("cannot resolve outbound target; use domain:dialogId or set direct.domain");
}
