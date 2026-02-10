import { normalizeBitrixInbound } from "./inbound.js";
import { sendBitrixImbotMessage } from "./outbound.js";
import { resolveSendToken, refreshAccessToken } from "./token-lifecycle.js";

export type DirectFlowInput = {
  payload: unknown;
  replyText: string;
  tokenState: {
    eventAuth?: {
      accessToken?: string | null;
      refreshToken?: string | null;
      expiresAt?: number | null;
    };
    stored?: {
      accessToken?: string | null;
      refreshToken?: string | null;
      expiresAt?: number | null;
    };
  };
  oauth?: {
    clientId?: string;
    clientSecret?: string;
    tokenEndpoint?: string;
  };
  timeoutMs?: number;
};

export type DirectFlowResult = {
  ok: boolean;
  phase:
    | "normalize"
    | "resolve-token"
    | "refresh-token"
    | "outbound-send"
    | "done";
  normalized?: {
    domain: string;
    dialogId: string;
    authorId: string;
    chatType: string;
    sessionKey: string;
    messageId?: string;
  };
  token?: {
    source: "event_auth" | "stored";
    refreshed: boolean;
  };
  outbound?: {
    result: unknown;
  };
  error?: string;
};

export async function executeDirectFlow(input: DirectFlowInput): Promise<DirectFlowResult> {
  const normalized = normalizeBitrixInbound(input.payload as any);
  if (!normalized.ok) {
    return { ok: false, phase: "normalize", error: normalized.error };
  }

  let selectedToken: string;
  let tokenSource: "event_auth" | "stored" = "stored";
  let refreshed = false;

  try {
    const resolved = resolveSendToken({
      eventAuth: input.tokenState.eventAuth,
      stored: input.tokenState.stored,
    });

    selectedToken = resolved.accessToken;
    tokenSource = resolved.source;

    if (
      resolved.needsRefresh &&
      resolved.refreshToken &&
      input.oauth?.clientId &&
      input.oauth?.clientSecret &&
      input.oauth?.tokenEndpoint
    ) {
      const refreshedToken = await refreshAccessToken({
        clientId: input.oauth.clientId,
        clientSecret: input.oauth.clientSecret,
        refreshToken: resolved.refreshToken,
        tokenEndpoint: input.oauth.tokenEndpoint,
      });
      selectedToken = refreshedToken.accessToken;
      refreshed = true;
    }
  } catch (e: any) {
    return {
      ok: false,
      phase: "resolve-token",
      normalized: {
        domain: normalized.value.domain,
        dialogId: normalized.value.dialogId,
        authorId: normalized.value.authorId,
        chatType: normalized.value.chatType,
        sessionKey: normalized.value.sessionKey,
        ...(normalized.value.messageId ? { messageId: normalized.value.messageId } : {}),
      },
      error: String(e?.message || e),
    };
  }

  try {
    const out = await sendBitrixImbotMessage({
      domain: normalized.value.domain,
      accessToken: selectedToken,
      dialogId: normalized.value.dialogId,
      message: input.replyText,
      timeoutMs: input.timeoutMs,
    });

    return {
      ok: true,
      phase: "done",
      normalized: {
        domain: normalized.value.domain,
        dialogId: normalized.value.dialogId,
        authorId: normalized.value.authorId,
        chatType: normalized.value.chatType,
        sessionKey: normalized.value.sessionKey,
        ...(normalized.value.messageId ? { messageId: normalized.value.messageId } : {}),
      },
      token: {
        source: tokenSource,
        refreshed,
      },
      outbound: {
        result: out.result,
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      phase: "outbound-send",
      normalized: {
        domain: normalized.value.domain,
        dialogId: normalized.value.dialogId,
        authorId: normalized.value.authorId,
        chatType: normalized.value.chatType,
        sessionKey: normalized.value.sessionKey,
        ...(normalized.value.messageId ? { messageId: normalized.value.messageId } : {}),
      },
      token: {
        source: tokenSource,
        refreshed,
      },
      error: String(e?.message || e),
    };
  }
}
