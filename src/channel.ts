import type { ChannelPlugin } from "openclaw/plugin-sdk";

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
    configPrefixes: ["plugins.entries.bitrix24", "channels.bitrix24"],
  },
  config: {
    listAccountIds: () => ["default"],
    resolveAccount: () => ({ accountId: "default", config: {} }),
    defaultAccountId: () => "default",
    setAccountEnabled: ({ cfg }) => cfg,
    deleteAccount: ({ cfg }) => cfg,
    isConfigured: () => true,
    describeAccount: () => ({
      accountId: "default",
      enabled: true,
      configured: true,
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
      hint: "<bitrix user/dialog id>",
    },
  },
  resolver: {
    resolveTargets: async ({ inputs }) =>
      inputs.map((input: string) => ({ input, resolved: true, id: input })),
  },
};
