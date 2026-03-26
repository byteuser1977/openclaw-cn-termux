import lockfile from "proper-lockfile";
import type { LockOptions } from "proper-lockfile";

export { resolvePreferredOpenClawTmpDir } from "../infra/tmp-openclaw-dir.js";

/**
 * Execute a function while holding a file lock via proper-lockfile.
 * Plugins use this to serialize file read/write operations.
 */
export async function withFileLock<T>(
  filePath: string,
  options: LockOptions,
  fn: () => Promise<T>,
): Promise<T> {
  let release: (() => Promise<void>) | undefined;
  try {
    release = await lockfile.lock(filePath, options);
    return await fn();
  } finally {
    if (release) {
      try {
        await release();
      } catch {
        // ignore unlock errors
      }
    }
  }
}
