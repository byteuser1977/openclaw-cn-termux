import os from "node:os";
import { getPrimaryIPv4Interfaces } from "./network-interfaces.js";

const originalNetworkInterfaces = os.networkInterfaces;

export function overloadOsNetworkInterfaces(): void {
  os.networkInterfaces = function(this: typeof os): ReturnType<typeof os.networkInterfaces> {
    try {
      return originalNetworkInterfaces.call(this);
    } catch (error) {
      return getPrimaryIPv4Interfaces();
    }
  } as typeof originalNetworkInterfaces;
  
  console.log("[openclaw-cn] os.networkInterfaces() 方法已重载");
}

export function restoreOsNetworkInterfaces(): void {
  os.networkInterfaces = originalNetworkInterfaces;
  console.log("[openclaw-cn] os.networkInterfaces() 方法已恢复原始实现");
}
