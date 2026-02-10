import { normalizeBitrixInbound, type BitrixWebhookPayload } from "./inbound.js";

export type InboundRuntimeInput = {
  payload: BitrixWebhookPayload;
};

export type InboundRuntimeResult = {
  ok: boolean;
  phase: "normalize" | "accepted";
  normalized?: {
    domain: string;
    authorId: string;
    dialogId: string;
    chatType: string;
    sessionKey: string;
    text: string;
    messageId?: string;
  };
  error?: string;
};

/**
 * D9.2 inbound runtime binding primitive.
 * This function is the single source of truth for converting raw Bitrix webhook
 * payload into channel-runtime-acceptable normalized message context.
 */
export function executeInboundRuntime(input: InboundRuntimeInput): InboundRuntimeResult {
  const normalized = normalizeBitrixInbound(input.payload);
  if (!normalized.ok) {
    return {
      ok: false,
      phase: "normalize",
      error: normalized.error,
    };
  }

  return {
    ok: true,
    phase: "accepted",
    normalized: {
      domain: normalized.value.domain,
      authorId: normalized.value.authorId,
      dialogId: normalized.value.dialogId,
      chatType: normalized.value.chatType,
      sessionKey: normalized.value.sessionKey,
      text: normalized.value.text,
      ...(normalized.value.messageId ? { messageId: normalized.value.messageId } : {}),
    },
  };
}
