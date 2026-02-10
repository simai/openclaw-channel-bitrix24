import type { IncomingMessage, ServerResponse } from "node:http";
import { executeInboundRuntime } from "./inbound-runtime.js";
import { recordInboundLiveError, recordInboundLiveHit } from "./runtime.js";

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

export async function handleBitrixInboundHttp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if ((req.method || "GET").toUpperCase() !== "POST") {
    writeJson(res, 405, { ok: false, error: "method not allowed" });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const runtime = executeInboundRuntime({ payload });

    if (!runtime.ok) {
      recordInboundLiveError(runtime.error || "inbound normalize failed");
      writeJson(res, 400, {
        ok: false,
        phase: runtime.phase,
        error: runtime.error,
      });
      return;
    }

    recordInboundLiveHit();

    // Step D9.2+: live webhook intake is now wired at plugin runtime route.
    // Full handoff into an internal channel event bus remains part of final runtime completion.
    writeJson(res, 202, {
      ok: true,
      phase: runtime.phase,
      accepted: true,
      sessionKey: runtime.normalized?.sessionKey,
      chatType: runtime.normalized?.chatType,
    });
  } catch (e: any) {
    const err = String(e?.message || e);
    recordInboundLiveError(err);
    writeJson(res, 400, { ok: false, error: err });
  }
}
