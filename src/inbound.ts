export type BitrixWebhookPayload = {
  event?: string;
  auth?: {
    domain?: string;
    application_token?: string;
    [key: string]: unknown;
  };
  data?: {
    PARAMS?: {
      MESSAGE?: string;
      CHAT_TYPE?: string;
      AUTHOR_ID?: string | number;
      FROM_USER_ID?: string | number;
      DIALOG_ID?: string | number;
      MESSAGE_ID?: string | number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type NormalizedBitrixInbound = {
  source: "bitrix24";
  event: "ONIMBOTMESSAGEADD";
  domain: string;
  authorId: string;
  dialogId: string;
  chatType: string;
  text: string;
  messageId?: string;
  sessionKey: string;
};

export type NormalizeResult =
  | { ok: true; value: NormalizedBitrixInbound }
  | { ok: false; error: string };

const SUPPORTED_EVENT = "ONIMBOTMESSAGEADD";

function normalizeDomain(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

function normalizeId(raw: unknown): string {
  return String(raw ?? "").trim();
}

function resolveSessionKey(params: {
  domain: string;
  authorId: string;
  dialogId: string;
  chatType: string;
}): string {
  const { domain, authorId, dialogId, chatType } = params;
  const isPrivate = (chatType || "P").toUpperCase() === "P";
  if (isPrivate) {
    return `bitrix:${domain}:${authorId}`;
  }
  return `bitrix:${domain}:chat:${dialogId}`;
}

export function normalizeBitrixInbound(payload: BitrixWebhookPayload): NormalizeResult {
  const event = String(payload.event ?? "").trim();
  if (event !== SUPPORTED_EVENT) {
    return { ok: false, error: `unsupported event: ${event || "<empty>"}` };
  }

  const params = payload.data?.PARAMS ?? {};
  const domain = normalizeDomain(payload.auth?.domain);
  const chatType = String(params.CHAT_TYPE ?? "P").trim().toUpperCase();
  const authorId = normalizeId(params.AUTHOR_ID ?? params.FROM_USER_ID);
  const dialogId = normalizeId(params.DIALOG_ID);
  const text = String(params.MESSAGE ?? "").trim();
  const messageId = normalizeId(params.MESSAGE_ID);

  if (!domain) return { ok: false, error: "missing auth.domain" };
  if (!authorId) return { ok: false, error: "missing author id" };
  if (!dialogId) return { ok: false, error: "missing dialog id" };
  if (!text) return { ok: false, error: "missing message text" };

  return {
    ok: true,
    value: {
      source: "bitrix24",
      event: SUPPORTED_EVENT,
      domain,
      authorId,
      dialogId,
      chatType,
      text,
      ...(messageId ? { messageId } : {}),
      sessionKey: resolveSessionKey({ domain, authorId, dialogId, chatType }),
    },
  };
}
