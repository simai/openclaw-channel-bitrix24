import type { IncomingMessage, ServerResponse } from "node:http";
import { createReplyPrefixOptions } from "openclaw/plugin-sdk";
import type { OpenClawConfig, PluginRuntime } from "openclaw/plugin-sdk";
import { getBitrix24PluginConfig } from "./config.js";
import { executeInboundRuntime } from "./inbound-runtime.js";
import { sendBitrixImbotMessage } from "./outbound.js";
import {
  recordInboundHandoffError,
  recordInboundHandoffSuccess,
  recordInboundLiveError,
  recordInboundLiveHit,
} from "./runtime.js";

const CHANNEL_ID = "bitrix24";

function writeJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function extractInboundToken(req: IncomingMessage): string {
  const h = req.headers || {};
  const fromHeader = String(h["x-channel-token"] || h["x-bitrix24-token"] || "").trim();
  if (fromHeader) return fromHeader;

  const auth = String(h.authorization || "").trim();
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

export async function handleBitrixInboundHttp(
  req: IncomingMessage,
  res: ServerResponse,
  deps: { runtime: PluginRuntime; cfg: OpenClawConfig },
): Promise<void> {
  if ((req.method || "GET").toUpperCase() !== "POST") {
    writeJson(res, 405, { ok: false, error: "method not allowed" });
    return;
  }

  try {
    const pluginCfg = getBitrix24PluginConfig(deps.cfg as any);

    // Inbound auth token for webhook route:
    // prefer direct.bridgeToken (current direct-mode secret), fallback to channel.channelToken.
    const expectedInboundToken = String(
      pluginCfg.direct?.bridgeToken || pluginCfg.channel?.channelToken || "",
    ).trim();
    if (expectedInboundToken) {
      const incomingToken = extractInboundToken(req);
      if (!incomingToken || incomingToken !== expectedInboundToken) {
        writeJson(res, 401, { ok: false, error: "unauthorized: invalid channel token" });
        return;
      }
    }

    const payload = await readJsonBody(req);
    const runtime = executeInboundRuntime({ payload });

    if (!runtime.ok || !runtime.normalized) {
      recordInboundLiveError(runtime.error || "inbound normalize failed");
      writeJson(res, 400, {
        ok: false,
        phase: runtime.phase,
        error: runtime.error,
      });
      return;
    }

    recordInboundLiveHit();

    const accessToken = String(pluginCfg.direct?.accessToken || "").trim();
    if (!accessToken) {
      const err = "bitrix24 direct.accessToken is required for live inbound handoff";
      recordInboundHandoffError(err);
      writeJson(res, 500, { ok: false, error: err });
      return;
    }

    const isGroup = (runtime.normalized.chatType || "P").toUpperCase() !== "P";
    const route = deps.runtime.channel.routing.resolveAgentRoute({
      cfg: deps.cfg,
      channel: CHANNEL_ID,
      accountId: "default",
      peer: {
        kind: isGroup ? "group" : "dm",
        id: isGroup ? runtime.normalized.dialogId : runtime.normalized.authorId,
      },
    });

    const storePath = deps.runtime.channel.session.resolveStorePath(deps.cfg.session?.store, {
      agentId: route.agentId,
    });
    const envelopeOptions = deps.runtime.channel.reply.resolveEnvelopeFormatOptions(deps.cfg);
    const previousTimestamp = deps.runtime.channel.session.readSessionUpdatedAt({
      storePath,
      sessionKey: route.sessionKey,
    });

    const timestamp = Date.now();
    const fromLabel = isGroup
      ? `chat:${runtime.normalized.dialogId}`
      : `user:${runtime.normalized.authorId}`;

    const body = deps.runtime.channel.reply.formatAgentEnvelope({
      channel: "Bitrix24",
      from: fromLabel,
      timestamp,
      previousTimestamp,
      envelope: envelopeOptions,
      body: runtime.normalized.text,
    });

    const ctxPayload = deps.runtime.channel.reply.finalizeInboundContext({
      Body: body,
      RawBody: runtime.normalized.text,
      CommandBody: runtime.normalized.text,
      From: `bitrix24:${runtime.normalized.authorId}`,
      To: `bitrix24:${runtime.normalized.domain}:${runtime.normalized.dialogId}`,
      SessionKey: route.sessionKey,
      AccountId: route.accountId,
      ChatType: isGroup ? "group" : "direct",
      ConversationLabel: fromLabel,
      SenderId: runtime.normalized.authorId,
      MessageSid: runtime.normalized.messageId,
      Timestamp: timestamp,
      Provider: CHANNEL_ID,
      Surface: CHANNEL_ID,
      OriginatingChannel: CHANNEL_ID,
      OriginatingTo: `bitrix24:${runtime.normalized.domain}:${runtime.normalized.dialogId}`,
      CommandAuthorized: true,
    });

    await deps.runtime.channel.session.recordInboundSession({
      storePath,
      sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
      ctx: ctxPayload,
      onRecordError: () => {
        // keep live path best-effort; do not fail webhook on metadata write issues
      },
    });

    const { onModelSelected, ...prefixOptions } = createReplyPrefixOptions({
      cfg: deps.cfg,
      agentId: route.agentId,
      channel: CHANNEL_ID,
      accountId: route.accountId,
    });

    await deps.runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
      ctx: ctxPayload,
      cfg: deps.cfg,
      dispatcherOptions: {
        ...prefixOptions,
        deliver: async (replyPayload) => {
          const text = String((replyPayload as any)?.text || "").trim();
          if (!text) return;
          await sendBitrixImbotMessage({
            domain: runtime.normalized!.domain,
            accessToken,
            dialogId: runtime.normalized!.dialogId,
            message: text,
            timeoutMs: pluginCfg.direct?.timeoutMs,
          });
        },
        onError: (err) => {
          recordInboundHandoffError(String(err));
        },
      },
      replyOptions: {
        onModelSelected,
      },
    });

    recordInboundHandoffSuccess();

    writeJson(res, 202, {
      ok: true,
      accepted: true,
      handedOff: true,
      sessionKey: route.sessionKey,
      chatType: runtime.normalized.chatType,
    });
  } catch (e: any) {
    const err = String(e?.message || e);
    recordInboundLiveError(err);
    recordInboundHandoffError(err);
    writeJson(res, 400, { ok: false, error: err });
  }
}
