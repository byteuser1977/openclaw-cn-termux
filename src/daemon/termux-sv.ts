import { execFile, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { colorize, isRich, theme } from "../terminal/theme.js";
import { formatGatewayServiceDescription } from "./constants.js";
import type { GatewayServiceRuntime } from "./service-runtime.js";
import { resolveHomeDir } from "./paths.js";

const toPosixPath = (value: string) => value.replace(/\\/g, "/");

const formatLine = (label: string, value: string) => {
  const rich = isRich();
  return `${colorize(rich, theme.muted, `${label}:`)} ${colorize(rich, theme.command, value)}`;
};

function resolveServiceDir(env: Record<string, string | undefined>): string {
  const home = toPosixPath(resolveHomeDir(env));
  return path.posix.join(home, ".termux", "runit", "openclaw-gateway");
}

function resolveServiceLogDir(env: Record<string, string | undefined>): string {
  const home = toPosixPath(resolveHomeDir(env));
  return path.posix.join(home, ".termux", "runit", "openclaw-gateway-log");
}

function buildServiceRunScript({
  description,
  programArguments,
  workingDirectory,
  environment,
}: {
  description: string;
  programArguments: string[];
  workingDirectory?: string;
  environment?: Record<string, string | undefined>;
}): string {
  const envVars = Object.entries(environment || {})
    .map(([key, value]) => `export ${key}="${value || ""}"`)
    .join("\n");

  const cmd = programArguments.map((arg) => `"${arg}"`).join(" ");
  const workDir = workingDirectory || '$(dirname "$0")';

  return `#!/bin/sh
# OpenClaw Gateway Service (Termux runit)
# Description: ${description}

cd "${workDir}"
${envVars}
exec ${cmd}
`;
}

function buildServiceLogRunScript({
  description,
  logFile,
}: {
  description: string;
  logFile: string;
}): string {
  return `#!/bin/sh
# OpenClaw Gateway Service Log (Termux runit)
# Description: ${description}

exec svlogd -tt "${logFile}"
`;
}

async function executeCommand(
  command: string,
  args: string[],
  options?: { encoding: BufferEncoding },
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, options ?? { encoding: "utf-8" }, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout?.toString() ?? "");
      }
    });
  });
}

async function assertRunitAvailable() {
  let errorDetails = "";

  try {
    await executeCommand("sv", ["help"], {
      encoding: "utf8",
    });
    return;
  } catch (error) {
    errorDetails = String(error);
  }

  // Try to gather more diagnostic info
  try {
    const result = spawnSync("which", ["sv"], { encoding: "utf8" });
    if (result.status === 0) {
      errorDetails += `\n\nsv found at: ${result.stdout.trim()}`;
    } else {
      errorDetails += "\n\nsv not found in PATH";
    }
  } catch {
    errorDetails += "\n\nCould not check sv location";
  }

  try {
    const result = spawnSync("pkg", ["list-installed", "termux-services"], { encoding: "utf8" });
    if (result.stdout.includes("termux-services")) {
      errorDetails += "\ntermux-services is installed";
    } else {
      errorDetails += "\ntermux-services is NOT installed";
    }
  } catch {
    // Ignore
  }

  throw new Error(
    "Termux runit (sv) is not available.\n\n" +
      "Please install termux-services package:\n" +
      "  pkg install termux-services -y\n\n" +
      "Then, if it's your first time, you may need to:\n" +
      "1. Restart Termux\n" +
      "2. Or start the service manager manually: sv up\n\n" +
      `Diagnostics:\n${errorDetails}`,
  );
}

export async function installTermuxSvService({
  env,
  stdout,
  programArguments,
  workingDirectory,
  environment,
  description,
}: {
  env: Record<string, string | undefined>;
  stdout: NodeJS.WritableStream;
  programArguments: string[];
  workingDirectory?: string;
  environment?: Record<string, string | undefined>;
  description?: string;
}): Promise<{ serviceDir: string; logDir: string }> {
  await assertRunitAvailable();

  const serviceDir = resolveServiceDir(env);
  const logDir = resolveServiceLogDir(env);
  const logFile = path.posix.join(serviceDir, "main", "log");

  await fs.mkdir(serviceDir, { recursive: true });
  await fs.mkdir(path.join(serviceDir, "main"), { recursive: true });
  await fs.mkdir(logDir, { recursive: true });

  const serviceDescription =
    description ??
    formatGatewayServiceDescription({
      profile: env.OPENCLAW_PROFILE,
      version: environment?.OPENCLAW_SERVICE_VERSION ?? env.OPENCLAW_SERVICE_VERSION,
    });

  const runScript = buildServiceRunScript({
    description: serviceDescription,
    programArguments,
    workingDirectory,
    environment,
  });

  const logRunScript = buildServiceLogRunScript({
    description: serviceDescription,
    logFile,
  });

  await fs.writeFile(path.join(serviceDir, "run"), runScript, "utf8");
  await fs.chmod(path.join(serviceDir, "run"), 0o755);

  await fs.writeFile(path.join(logDir, "run"), logRunScript, "utf8");
  await fs.chmod(path.join(logDir, "run"), 0o755);

  stdout.write(`${formatLine("Installed Termux runit service", serviceDir)}\n`);
  stdout.write(`${formatLine("Log directory", logDir)}\n`);

  try {
    await executeCommand("sv", ["enable", "openclaw-gateway"], {
      encoding: "utf8",
    });
    stdout.write(`${formatLine("Enabled service", "openclaw-gateway")}\n`);
  } catch (error) {
    stdout.write(`Warning: Failed to enable service via sv: ${String(error)}\n`);
    stdout.write("You may need to manually link the service to runsvdir\n");
  }

  try {
    await executeCommand("sv", ["up", "openclaw-gateway"], {
      encoding: "utf8",
    });
    stdout.write(`${formatLine("Started service", "openclaw-gateway")}\n`);
  } catch (error) {
    stdout.write(`Warning: Failed to start service via sv: ${String(error)}\n`);
  }

  return { serviceDir, logDir };
}

export async function uninstallTermuxSvService({
  env,
  stdout,
}: {
  env: Record<string, string | undefined>;
  stdout: NodeJS.WritableStream;
}): Promise<void> {
  await assertRunitAvailable();

  const serviceDir = resolveServiceDir(env);
  const logDir = resolveServiceLogDir(env);

  try {
    await executeCommand("sv", ["down", "openclaw-gateway"], {
      encoding: "utf8",
    });
    stdout.write(`${formatLine("Stopped service", "openclaw-gateway")}\n`);
  } catch {
    stdout.write("Service not running\n");
  }

  try {
    await executeCommand("sv", ["disable", "openclaw-gateway"], {
      encoding: "utf8",
    });
    stdout.write(`${formatLine("Disabled service", "openclaw-gateway")}\n`);
  } catch {
    stdout.write("Service not enabled\n");
  }

  try {
    await fs.unlink(path.join(serviceDir, "run"));
    stdout.write(`${formatLine("Removed service script", path.join(serviceDir, "run"))}\n`);
  } catch {
    stdout.write(`Service script not found at ${path.join(serviceDir, "run")}\n`);
  }

  try {
    await fs.rm(serviceDir, { recursive: true });
    stdout.write(`${formatLine("Removed service directory", serviceDir)}\n`);
  } catch {
    stdout.write(`Service directory not found at ${serviceDir}\n`);
  }

  try {
    await fs.unlink(path.join(logDir, "run"));
    stdout.write(`${formatLine("Removed log script", path.join(logDir, "run"))}\n`);
  } catch {
    stdout.write(`Log script not found at ${path.join(logDir, "run")}\n`);
  }

  try {
    await fs.rm(logDir, { recursive: true });
    stdout.write(`${formatLine("Removed log directory", logDir)}\n`);
  } catch {
    stdout.write(`Log directory not found at ${logDir}\n`);
  }
}

export async function stopTermuxSvService({
  stdout,
  env: _env,
}: {
  stdout: NodeJS.WritableStream;
  env?: Record<string, string | undefined>;
}): Promise<void> {
  await assertRunitAvailable();

  try {
    const result = await executeCommand("sv", ["down", "openclaw-gateway"], {
      encoding: "utf8",
    });
    stdout.write(`${result}\n`);
    stdout.write(`${formatLine("Stopped service", "openclaw-gateway")}\n`);
  } catch (error) {
    stdout.write(`Failed to stop service: ${String(error)}\n`);
  }
}

export async function restartTermuxSvService({
  stdout,
  env: _env,
}: {
  stdout: NodeJS.WritableStream;
  env?: Record<string, string | undefined>;
}): Promise<void> {
  await assertRunitAvailable();

  try {
    const result = await executeCommand("sv", ["restart", "openclaw-gateway"], {
      encoding: "utf8",
    });
    stdout.write(`${result}\n`);
    stdout.write(`${formatLine("Restarted service", "openclaw-gateway")}\n`);
  } catch (error) {
    stdout.write(`Failed to restart service: ${String(error)}\n`);
  }
}

export async function isTermuxSvServiceEnabled(args: {
  env?: Record<string, string | undefined>;
}): Promise<boolean> {
  const serviceDir = resolveServiceDir(args.env ?? {});
  try {
    await fs.access(path.join(serviceDir, "run"));
    return true;
  } catch {
    return false;
  }
}

export async function readTermuxSvServiceRuntime(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): Promise<GatewayServiceRuntime> {
  const serviceDir = resolveServiceDir(env);

  try {
    await fs.access(path.join(serviceDir, "run"));
  } catch {
    return {
      status: "stopped",
      detail: "Termux runit service not found",
    };
  }

  try {
    const result = await executeCommand("sv", ["status", "openclaw-gateway"], {
      encoding: "utf8",
    });

    const match = result.match(/runsvdir: (.+): .+ \((\d+)\)/);
    if (match) {
      const status = match[1].trim();
      const pid = parseInt(match[2], 10);

      if (status === "up") {
        return {
          status: "running",
          pid,
        };
      } else if (status === "down") {
        return {
          status: "stopped",
        };
      }
    }

    return {
      status: "unknown",
      detail: result.trim(),
    };
  } catch (error) {
    return {
      status: "unknown",
      detail: String(error),
    };
  }
}

export async function readTermuxSvServiceCommand(env: Record<string, string | undefined>): Promise<{
  programArguments: string[];
  workingDirectory?: string;
  environment?: Record<string, string>;
  sourcePath?: string;
} | null> {
  const serviceDir = resolveServiceDir(env);
  const runScriptPath = path.join(serviceDir, "run");

  try {
    const content = await fs.readFile(runScriptPath, "utf8");

    let cmdLine = "";
    let workingDirectory = "";
    const environment: Record<string, string> = {};

    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();
      if (line.startsWith("export ")) {
        const match = line.match(/export (\w+)="(.*)"/);
        if (match) {
          environment[match[1]] = match[2];
        }
      } else if (line.startsWith("exec ")) {
        cmdLine = line.slice("exec ".length).trim();
      } else if (line.startsWith("cd ")) {
        workingDirectory = line.slice("cd ".length).trim();
        workingDirectory = workingDirectory.replace(/^"|"$/g, "");
      }
    }

    if (!cmdLine) return null;

    const programArguments = [];
    let currentArg = "";
    let inQuotes = false;

    for (let i = 0; i < cmdLine.length; i++) {
      const char = cmdLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === " " && !inQuotes) {
        if (currentArg) {
          programArguments.push(currentArg);
          currentArg = "";
        }
      } else {
        currentArg += char;
      }
    }

    if (currentArg) {
      programArguments.push(currentArg);
    }

    return {
      programArguments,
      ...(workingDirectory ? { workingDirectory } : {}),
      ...(Object.keys(environment).length > 0 ? { environment } : {}),
      sourcePath: runScriptPath,
    };
  } catch {
    return null;
  }
}
