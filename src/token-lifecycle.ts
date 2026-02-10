export type TokenState = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
};

export type ResolveSendTokenInput = {
  eventAuth?: TokenState;
  stored?: TokenState;
  nowTs?: number;
  skewSec?: number;
};

export type ResolveSendTokenResult = {
  accessToken: string;
  source: "event_auth" | "stored";
  needsRefresh: boolean;
  refreshToken?: string;
};

export type RefreshTokenParams = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  tokenEndpoint: string;
  timeoutMs?: number;
};

export type RefreshTokenResult = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  raw: unknown;
};

function isExpired(expiresAt: number | null | undefined, nowTs: number, skewSec: number): boolean {
  if (!expiresAt || !Number.isFinite(expiresAt)) return false;
  return expiresAt <= nowTs + skewSec;
}

function normalizeToken(raw?: string | null): string {
  return String(raw ?? "").trim();
}

export function resolveSendToken(input: ResolveSendTokenInput): ResolveSendTokenResult {
  const nowTs = input.nowTs ?? Math.floor(Date.now() / 1000);
  const skewSec = input.skewSec ?? 30;

  const eventAccess = normalizeToken(input.eventAuth?.accessToken);
  const storedAccess = normalizeToken(input.stored?.accessToken);

  const eventExpired = isExpired(input.eventAuth?.expiresAt, nowTs, skewSec);
  const storedExpired = isExpired(input.stored?.expiresAt, nowTs, skewSec);

  if (eventAccess && !eventExpired) {
    return {
      accessToken: eventAccess,
      source: "event_auth",
      needsRefresh: false,
      refreshToken: normalizeToken(input.eventAuth?.refreshToken) || undefined,
    };
  }

  if (storedAccess) {
    return {
      accessToken: storedAccess,
      source: "stored",
      needsRefresh: storedExpired,
      refreshToken: normalizeToken(input.stored?.refreshToken) || undefined,
    };
  }

  throw new Error("no access token available");
}

export async function refreshAccessToken(params: RefreshTokenParams): Promise<RefreshTokenResult> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: params.clientId,
    client_secret: params.clientSecret,
    refresh_token: params.refreshToken,
  });

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), params.timeoutMs ?? 15000);

  try {
    const response = await fetch(params.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: ctrl.signal,
    });

    const rawText = await response.text();
    const parsed = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
      throw new Error(`token refresh HTTP ${response.status}: ${rawText}`);
    }
    if (parsed?.error) {
      throw new Error(`token refresh error: ${parsed.error} (${parsed.error_description ?? ""})`);
    }

    const accessToken = normalizeToken(parsed?.access_token);
    if (!accessToken) {
      throw new Error("token refresh returned empty access_token");
    }

    const refreshToken = normalizeToken(parsed?.refresh_token) || undefined;
    const expiresIn = Number(parsed?.expires_in ?? 0);
    const expiresAt = expiresIn > 0 ? Math.floor(Date.now() / 1000) + expiresIn : undefined;

    return {
      accessToken,
      ...(refreshToken ? { refreshToken } : {}),
      ...(expiresAt ? { expiresAt } : {}),
      raw: parsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}
