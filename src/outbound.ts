export type BitrixSendMessageParams = {
  domain: string;
  accessToken: string;
  dialogId: string;
  message: string;
  timeoutMs?: number;
};

export type BitrixSendMessageResult = {
  ok: true;
  result: unknown;
  raw: unknown;
};

function buildBitrixMethodUrl(domain: string, method: string): string {
  return `https://${domain}/rest/${method}.json`;
}

export async function sendBitrixImbotMessage(
  params: BitrixSendMessageParams,
): Promise<BitrixSendMessageResult> {
  const domain = String(params.domain || "").trim();
  const accessToken = String(params.accessToken || "").trim();
  const dialogId = String(params.dialogId || "").trim();
  const message = String(params.message || "").trim();

  if (!domain) throw new Error("missing domain");
  if (!accessToken) throw new Error("missing access token");
  if (!dialogId) throw new Error("missing dialog id");
  if (!message) throw new Error("missing message");

  const url = buildBitrixMethodUrl(domain, "imbot.message.add");
  const body = {
    auth: accessToken,
    DIALOG_ID: dialogId,
    MESSAGE: message,
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), params.timeoutMs ?? 45000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    const raw = await response.text();
    const parsed = raw ? JSON.parse(raw) : {};

    if (!response.ok) {
      throw new Error(`Bitrix HTTP ${response.status}: ${raw}`);
    }

    if (parsed?.error) {
      throw new Error(`Bitrix error: ${parsed.error} (${parsed.error_description ?? ""})`);
    }

    return {
      ok: true,
      result: parsed?.result,
      raw: parsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}
