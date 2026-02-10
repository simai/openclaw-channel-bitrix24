import type { PluginRuntime } from "openclaw/plugin-sdk";

let runtime: PluginRuntime | null = null;

type InboundLiveState = {
  routePath: string;
  hits: number;
  lastInboundAt: number | null;
  lastError: string | null;
  handoffCount: number;
  lastHandoffAt: number | null;
  lastHandoffError: string | null;
};

const inboundLiveState: InboundLiveState = {
  routePath: "/bitrix24/webhook",
  hits: 0,
  lastInboundAt: null,
  lastError: null,
  handoffCount: 0,
  lastHandoffAt: null,
  lastHandoffError: null,
};

export function setBitrix24Runtime(next: PluginRuntime) {
  runtime = next;
}

export function getBitrix24Runtime(): PluginRuntime {
  if (!runtime) {
    throw new Error("Bitrix24 runtime not initialized");
  }
  return runtime;
}

export function setInboundRoutePath(path: string) {
  inboundLiveState.routePath = path;
}

export function recordInboundLiveHit() {
  inboundLiveState.hits += 1;
  inboundLiveState.lastInboundAt = Date.now();
  inboundLiveState.lastError = null;
}

export function recordInboundLiveError(error: string) {
  inboundLiveState.lastError = error;
}

export function recordInboundHandoffSuccess() {
  inboundLiveState.handoffCount += 1;
  inboundLiveState.lastHandoffAt = Date.now();
  inboundLiveState.lastHandoffError = null;
}

export function recordInboundHandoffError(error: string) {
  inboundLiveState.lastHandoffError = error;
}

export function getInboundLiveState(): InboundLiveState {
  return { ...inboundLiveState };
}
