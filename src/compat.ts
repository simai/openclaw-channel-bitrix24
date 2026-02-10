export type ChannelMode = "direct" | "channel";

export type CompatibilityInput = {
  mode?: string;
  enabled?: boolean;
  directConfigured?: boolean;
  channelConfigured?: boolean;
};

export type CompatibilityDecision = {
  effectiveMode: ChannelMode;
  rollbackActive: boolean;
  reason: string;
};

/**
 * B6 compatibility guard:
 * - safe default is direct mode
 * - channel mode is allowed only when explicitly selected + configured
 * - any invalid state falls back to direct rollback path
 */
export function resolveCompatibilityMode(input: CompatibilityInput): CompatibilityDecision {
  const mode = String(input.mode ?? "direct").trim().toLowerCase();
  const enabled = input.enabled !== false;
  const directConfigured = Boolean(input.directConfigured);
  const channelConfigured = Boolean(input.channelConfigured);

  if (!enabled) {
    return {
      effectiveMode: "direct",
      rollbackActive: true,
      reason: "plugin disabled -> force direct rollback",
    };
  }

  if (mode === "channel") {
    if (channelConfigured) {
      return {
        effectiveMode: "channel",
        rollbackActive: false,
        reason: "channel mode selected and configured",
      };
    }
    return {
      effectiveMode: "direct",
      rollbackActive: true,
      reason: "channel selected but not configured -> rollback to direct",
    };
  }

  if (directConfigured) {
    return {
      effectiveMode: "direct",
      rollbackActive: false,
      reason: "direct mode selected and configured",
    };
  }

  return {
    effectiveMode: "direct",
    rollbackActive: true,
    reason: "direct not fully configured -> keep rollback-safe direct baseline",
  };
}
