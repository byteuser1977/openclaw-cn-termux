import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import {
  installTermuxSvService,
  uninstallTermuxSvService,
  stopTermuxSvService,
  restartTermuxSvService,
  isTermuxSvServiceEnabled,
  readTermuxSvServiceRuntime,
  readTermuxSvServiceCommand,
} from "./termux-sv.js";
import { resolveHomeDir } from "./paths.js";

vi.mock("node:child_process");
vi.mock("node:fs/promises");
vi.mock("./paths.js");

const mockExecFile = vi.mocked(execFile);
const mockFs = vi.mocked(fs);
const mockResolveHomeDir = vi.mocked(resolveHomeDir);

describe("Termux runit service", () => {
  const mockHomeDir = "/data/data/com.termux/files/home";
  const mockEnv = {
    OPENCLAW_PROFILE: "default",
    OPENCLAW_SERVICE_VERSION: "1.0.0",
  };
  const mockStdout = {
    write: vi.fn(),
  } as unknown as NodeJS.WritableStream;

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveHomeDir.mockReturnValue(mockHomeDir);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.chmod.mockResolvedValue(undefined);
    mockFs.unlink.mockResolvedValue(undefined);
    mockFs.access.mockResolvedValue(undefined);
    mockFs.rm.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue(
      `#!/bin/sh
# OpenClaw Gateway Service (Termux runit)
# Description: OpenClaw Gateway Service (default)

cd "/data/data/com.termux/files/home"
export OPENCLAW_PROFILE="default"
export OPENCLAW_SERVICE_VERSION="1.0.0"
exec node /data/data/com.termux/files/home/openclaw-cn/src/index.js
`
    );
    mockExecFile.mockImplementation((command, args, options, callback) => {
      if (command === "sv" && args?.includes("--version")) {
        if (callback) {
          callback(new Error("Command not found"), undefined, undefined);
        }
        return {} as any;
      }
      if (command === "sv" && args?.includes("status")) {
        if (callback) {
          callback(null, "runsvdir: openclaw-gateway: up (PID 1234)", "");
        }
        return {} as any;
      }
      if (callback) {
        callback(null, "Success", "");
      }
      return {} as any;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("assertRunitAvailable", () => {
    it("should throw error when sv is not available", async () => {
      mockExecFile.mockImplementationOnce((command, args, options, callback) => {
        if (callback) {
          callback(new Error("Command not found"), undefined, undefined);
        }
        return {} as any;
      });

      const { installTermuxSvService } = await import("./termux-sv.js");
      await expect(
        installTermuxSvService({
          env: mockEnv,
          stdout: mockStdout,
          programArguments: ["node", "index.js"],
        })
      ).rejects.toThrow("Termux runit (sv) is not available");
    });
  });

  describe("installTermuxSvService", () => {
    it("should install service correctly", async () => {
      mockExecFile.mockImplementation((command, args, options, callback) => {
        if (command === "sv" && args?.includes("--version")) {
          if (callback) {
            callback(null, "runsvdir -- version", "");
          }
          return {} as any;
        }
        if (callback) {
          callback(null, "Success", "");
        }
        return {} as any;
      });

      const { installTermuxSvService } = await import("./termux-sv.js");
      const result = await installTermuxSvService({
        env: mockEnv,
        stdout: mockStdout,
        programArguments: ["node", "index.js"],
        workingDirectory: mockHomeDir,
        environment: mockEnv,
      });

      expect(result).toBeDefined();
      expect(result.serviceDir).toContain("runit/openclaw-gateway");
      expect(result.logDir).toContain("runit/openclaw-gateway-log");
      expect(mockFs.mkdir).toHaveBeenCalledTimes(3);
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
      expect(mockFs.chmod).toHaveBeenCalledTimes(2);
    });
  });

  describe("uninstallTermuxSvService", () => {
    it("should uninstall service correctly", async () => {
      mockExecFile.mockImplementation((command, args, options, callback) => {
        if (command === "sv" && args?.includes("--version")) {
          if (callback) {
            callback(null, "runsvdir -- version", "");
          }
          return {} as any;
        }
        if (callback) {
          callback(null, "Success", "");
        }
        return {} as any;
      });

      const { uninstallTermuxSvService } = await import("./termux-sv.js");
      await uninstallTermuxSvService({
        env: mockEnv,
        stdout: mockStdout,
      });

      expect(mockFs.unlink).toHaveBeenCalled();
      expect(mockFs.rm).toHaveBeenCalled();
    });
  });

  describe("stopTermuxSvService", () => {
    it("should stop service correctly", async () => {
      mockExecFile.mockImplementation((command, args, options, callback) => {
        if (command === "sv" && args?.includes("--version")) {
          if (callback) {
            callback(null, "runsvdir -- version", "");
          }
          return {} as any;
        }
        if (callback) {
          callback(null, "ok: down: openclaw-gateway: 0s, normally up", "");
        }
        return {} as any;
      });

      const { stopTermuxSvService } = await import("./termux-sv.js");
      await stopTermuxSvService({
        stdout: mockStdout,
        env: mockEnv,
      });

      expect(mockExecFile).toHaveBeenCalledWith("sv", ["down", "openclaw-gateway"], {
        encoding: "utf8",
      });
    });
  });

  describe("restartTermuxSvService", () => {
    it("should restart service correctly", async () => {
      mockExecFile.mockImplementation((command, args, options, callback) => {
        if (command === "sv" && args?.includes("--version")) {
          if (callback) {
            callback(null, "runsvdir -- version", "");
          }
          return {} as any;
        }
        if (callback) {
          callback(null, "ok: restart: openclaw-gateway: (PID 1234)", "");
        }
        return {} as any;
      });

      const { restartTermuxSvService } = await import("./termux-sv.js");
      await restartTermuxSvService({
        stdout: mockStdout,
        env: mockEnv,
      });

      expect(mockExecFile).toHaveBeenCalledWith("sv", ["restart", "openclaw-gateway"], {
        encoding: "utf8",
      });
    });
  });

  describe("isTermuxSvServiceEnabled", () => {
    it("should return true when service exists", async () => {
      mockFs.access.mockResolvedValue(undefined);

      const { isTermuxSvServiceEnabled } = await import("./termux-sv.js");
      const result = await isTermuxSvServiceEnabled({ env: mockEnv });

      expect(result).toBe(true);
    });

    it("should return false when service does not exist", async () => {
      mockFs.access.mockRejectedValue(new Error("ENOENT"));

      const { isTermuxSvServiceEnabled } = await import("./termux-sv.js");
      const result = await isTermuxSvServiceEnabled({ env: mockEnv });

      expect(result).toBe(false);
    });
  });

  describe("readTermuxSvServiceRuntime", () => {
    it("should return running status when service is up", async () => {
      mockExecFile.mockImplementation((command, args, options, callback) => {
        if (command === "sv" && args?.includes("status")) {
          if (callback) {
            callback(null, "runsvdir: openclaw-gateway: up (PID 1234)", "");
          }
          return {} as any;
        }
        return {} as any;
      });

      const { readTermuxSvServiceRuntime } = await import("./termux-sv.js");
      const result = await readTermuxSvServiceRuntime(mockEnv);

      expect(result).toEqual({
        status: "running",
        pid: 1234,
      });
    });

    it("should return stopped status when service is down", async () => {
      mockExecFile.mockImplementation((command, args, options, callback) => {
        if (command === "sv" && args?.includes("status")) {
          if (callback) {
            callback(null, "runsvdir: openclaw-gateway: down", "");
          }
          return {} as any;
        }
        return {} as any;
      });

      const { readTermuxSvServiceRuntime } = await import("./termux-sv.js");
      const result = await readTermuxSvServiceRuntime(mockEnv);

      expect(result).toEqual({
        status: "stopped",
      });
    });

    it("should return stopped status when service not found", async () => {
      mockFs.access.mockRejectedValue(new Error("ENOENT"));

      const { readTermuxSvServiceRuntime } = await import("./termux-sv.js");
      const result = await readTermuxSvServiceRuntime(mockEnv);

      expect(result).toEqual({
        status: "stopped",
        detail: "Termux runit service not found",
      });
    });
  });

  describe("readTermuxSvServiceCommand", () => {
    it("should read service command correctly", async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(
        `#!/bin/sh
cd "/data/data/com.termux/files/home"
export OPENCLAW_PROFILE="default"
export OPENCLAW_SERVICE_VERSION="1.0.0"
exec node /data/data/com.termux/files/home/openclaw-cn/src/index.js
`
      );

      const { readTermuxSvServiceCommand } = await import("./termux-sv.js");
      const result = await readTermuxSvServiceCommand(mockEnv);

      expect(result).toEqual({
        programArguments: ["node", "/data/data/com.termux/files/home/openclaw-cn/src/index.js"],
        workingDirectory: "/data/data/com.termux/files/home",
        environment: {
          OPENCLAW_PROFILE: "default",
          OPENCLAW_SERVICE_VERSION: "1.0.0",
        },
        sourcePath: expect.any(String),
      });
    });

    it("should return null when run script not found", async () => {
      mockFs.access.mockRejectedValue(new Error("ENOENT"));

      const { readTermuxSvServiceCommand } = await import("./termux-sv.js");
      const result = await readTermuxSvServiceCommand(mockEnv);

      expect(result).toBeNull();
    });
  });
});
