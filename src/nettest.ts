import os from "node:os";
import dns from "node:dns";
import { spawnSync } from "node:child_process";

function getPrimaryIPv4Interfaces(): ReturnType<typeof os.networkInterfaces> {
  const tryNetworkInterfaces = (): ReturnType<
    typeof os.networkInterfaces
  > | null => {
    try {
      return os.networkInterfaces();
    } catch (error) {
      return null;
    }
  };

  const tryCommandLookup = (): Record<string, os.NetworkInterfaceInfo[]> => {
    const result: Record<string, os.NetworkInterfaceInfo[]> = {};
    const platform = os.platform();
    let command: string;
    let args: string[];

    if (platform === "win32") {
      command = "ipconfig";
      args = [];
    } else {
      command = "ifconfig";
      args = [];
    }

    try {
      const res = spawnSync(command, args, {
        encoding: "utf-8",
        timeout: 5000,
      });

      if (res.stdout && typeof res.stdout === "string") {
        const output = res.stdout;
        const ipv4Pattern = /inet\s+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g;
        const matches = [...output.matchAll(ipv4Pattern)];
        const uniqueIPs = [...new Set(matches.map((m) => m[1]))].filter(
          (ip) => {
            const parts = ip.split(".");
            return (
              parts.length === 4 &&
              parts.every((p) => parseInt(p) >= 0 && parseInt(p) <= 255) &&
              !ip.startsWith("127.") &&
              !ip.startsWith("0.") &&
              !ip.startsWith("255.") &&
              !ip.endsWith(".255")
            );
          },
        );

        for (const ip of uniqueIPs) {
          const interfaceName = "eth0";
          result[interfaceName] = [
            {
              address: ip,
              netmask: "255.255.255.0",
              family: "IPv4" as const,
              mac: "00:00:00:00:00:00",
              internal: false,
              cidr: `${ip}/24`,
            },
          ];
        }
      }
    } catch (error) {}

    return result;
  };

  const nets = tryNetworkInterfaces();
  if (nets) {
    return nets;
  }

  return tryCommandLookup();
}

console.log("=== System Network Information ===\n");

console.log("--- Basic System Info ---");
console.log(`Hostname: ${os.hostname()}`);
console.log(`Platform: ${os.platform()}`);
console.log(`OS Type: ${os.type()}`);
console.log(`OS Release: ${os.release()}`);
console.log(`Architecture: ${os.arch()}`);

const nets = getPrimaryIPv4Interfaces();

console.log("\n--- Network Interfaces (via getPrimaryIPv4Interfaces) ---");
for (const [name, interfaces] of Object.entries(nets)) {
  if (!interfaces) continue;
  console.log(`\nInterface: ${name}`);
  for (const iface of interfaces) {
    console.log(`  ${iface.family}: ${iface.address}`);
    console.log(`    Netmask: ${iface.netmask}`);
    console.log(`    CIDR: ${iface.cidr}`);
    console.log(`    MAC: ${iface.mac}`);
    console.log(`    Internal: ${iface.internal}`);
    if (iface.family === "IPv6") {
      console.log(`    Scope ID: ${iface.scopeid}`);
    }
  }
}

console.log("\n--- IPv4 Addresses Summary ---");
const ipv4Addresses = [];
for (const [name, interfaces] of Object.entries(nets)) {
  if (!interfaces) continue;
  for (const iface of interfaces) {
    if (iface.family === "IPv4") {
      ipv4Addresses.push({
        name,
        address: iface.address,
        internal: iface.internal,
      });
    }
  }
}

const externalIPv4 = ipv4Addresses.filter((ip) => !ip.internal);
const internalIPv4 = ipv4Addresses.filter((ip) => ip.internal);

if (externalIPv4.length > 0) {
  console.log("External IPv4:");
  for (const ip of externalIPv4) {
    console.log(`  ${ip.name}: ${ip.address}`);
  }
}

if (internalIPv4.length > 0) {
  console.log("Internal IPv4:");
  for (const ip of internalIPv4) {
    console.log(`  ${ip.name}: ${ip.address}`);
  }
}

console.log("\n--- Network Statistics ---");
let totalInterfaces = 0;
let totalIPv4 = 0;
let totalIPv6 = 0;

for (const interfaces of Object.values(nets)) {
  if (!interfaces) continue;
  totalInterfaces++;
  for (const iface of interfaces) {
    if (iface.family === "IPv4") totalIPv4++;
    if (iface.family === "IPv6") totalIPv6++;
  }
}

console.log(`Total interfaces: ${totalInterfaces}`);
console.log(`Total IPv4 addresses: ${totalIPv4}`);
console.log(`Total IPv6 addresses: ${totalIPv6}`);

console.log("\n=== End of Network Information ===");
