import type { PluginRuntime } from "openclaw-cn-termux/plugin-sdk";

let runtime: PluginRuntime | null = null;

export function setLineRuntime(r: PluginRuntime): void {
  runtime = r;
}

export function getLineRuntime(): PluginRuntime {
  if (!runtime) {
    throw new Error("LINE runtime not initialized - plugin not registered");
  }
  return runtime;
}
