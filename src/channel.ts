import type { ChannelPlugin } from "openclaw/plugin-sdk";

export const bitrix24ChannelPlugin: ChannelPlugin<any> = {
  id: "bitrix24",
  meta: {
    id: "bitrix24",
    label: "Bitrix24",
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    media: false,
    polls: false,
    reactions: false,
    threads: false,
    nativeCommands: false,
  },
  // TODO: define full schema via plugin-sdk helpers once transport layer lands.
  configSchema: {
    type: "object",
    additionalProperties: true,
    properties: {},
  },
  // TODO: implement full config resolver.
  config: {
    listAccountIds: () => ["default"],
    resolveAccount: () => ({ accountId: "default", config: {} }),
    defaultAccountId: () => "default",
    setAccountEnabled: ({ cfg }: any) => cfg,
    deleteAccount: ({ cfg }: any) => cfg,
    isConfigured: () => true,
    describeAccount: () => ({ accountId: "default", enabled: true, configured: true }),
    resolveAllowFrom: () => [],
    formatAllowFrom: ({ allowFrom }: any) => allowFrom,
  },
  security: {
    resolveDmPolicy: () => ({
      policy: "pairing",
      allowFrom: [],
      allowFromPath: "channels.bitrix24.dm.",
      approveHint: "Approve peer in pairing flow",
      normalizeEntry: (raw: string) => raw,
    }),
    collectWarnings: () => [],
  },
  messaging: {
    normalizeTarget: ({ target }: any) => ({ kind: "peer", value: String(target ?? "") }),
    targetResolver: {
      looksLikeId: () => true,
      hint: "<bitrix user/dialog id>",
    },
  },
  resolver: {
    resolveTargets: async ({ inputs }: any) =>
      inputs.map((input: string) => ({ input, resolved: true, id: input })),
  },
  pairing: {
    idLabel: "bitrixUserId",
    normalizeAllowEntry: (entry: string) => entry,
    notifyApproval: async () => {},
  },
  onboarding: {
    // TODO: replace with real onboarding adapter.
    promptForConfig: async () => ({ status: "skipped" }),
  } as any,
};
