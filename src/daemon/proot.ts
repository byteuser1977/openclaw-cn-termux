import path from "node:path";
import fs from "node:fs";

export function isRunningInProotDistro() {
  // 1) /proc/1/comm -------------------------------------------------------
  try {
    const comm = fs.readFileSync("/proc/1/comm", "utf8").trim();
    if (comm === "proot" || comm.includes("proot")) {
      return true;
    }
  } catch {
    // 文件不存在或无法读取，忽略
  }

  // 2) /proc/1/cmdline ---------------------------------------------------
  try {
    const cmdline = fs.readFileSync("/proc/1/cmdline", "utf8");
    if (cmdline.includes("proot")) {
      return true;
    }
  } catch {
    // 文件不存在或无法读取，忽略
  }

  // 3) /proc/1/exe -------------------------------------------------------
  try {
    const exePath = fs.readlinkSync("/proc/1/exe");
    if (exePath.includes("proot")) {
      return true;
    }
  } catch {
    // 文件不存在或无法读取，忽略
  }

  // 4) /proc/self/mountinfo ---------------------------------------------
  try {
    const mountInfo = fs.readFileSync("/proc/self/mountinfo", "utf8");
    if (mountInfo.includes("proot")) {
      return true;
    }
  } catch {
    // 文件不存在或无法读取，忽略
  }

  // 5) Termux‑specific binaries / directories ---------------------------
  const termuxRoot = "/data/data/com.termux/files/usr";
  if (
    fs.existsSync(path.join(termuxRoot, "bin", "proot")) ||
    fs.existsSync(path.join(termuxRoot, "bin", "proot-distro")) ||
    fs.existsSync(termuxRoot)
  ) {
    return true;
  }

  // 6) Environment variables -----------------------------------------------
  if (process.env.PROOT_DISTRO || process.env.PROOT_NO_SECCOMP) {
    return true;
  }

  // No detection succeeded
  return false;
}

export function isRunningInTermux() {
  if (isRunningInProotDistro()) {
    return true;
  }
  const isTermux = Boolean(
    process.env.TERMUX_VERSION ||
    process.env.TERMUX_MAIN_PACKAGE_FORMAT ||
    process.env.TERMUX_PREFIX ||
    process.env.PREFIX?.startsWith("/data/data/com.termux") ||
    process.env.ANDROID_ROOT?.includes("com.termux"),
  );
  return isTermux;
}
