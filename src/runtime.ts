import type { PluginRuntime } from "openclaw/plugin-sdk";

let runtime: PluginRuntime | null = null;

export function setBitrix24Runtime(next: PluginRuntime) {
  runtime = next;
}

export function getBitrix24Runtime(): PluginRuntime {
  if (!runtime) {
    throw new Error("Bitrix24 runtime not initialized");
  }
  return runtime;
}
