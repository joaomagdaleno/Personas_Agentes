/**
 * Parse and patch Bun's Windows .bunx metadata files.
 *
 * Commands:
 *   bun run bunx-util.ts inspect <path-to-file.bunx>
 *   bun run bunx-util.ts patch-shebang <path-to-file.bunx> [--out <dest-path>] [--no-backup]
 * 
 * Format reference (from src/install/windows-shim/BinLinkingShim.zig):
 *
 * Layout (UTF-16LE unless noted):
 *   [WSTR:bin_path][u16: '"'][u16: 0] (shebang?) [flags:u16]
 *
 * If shebang present (flags.has_shebang == 1):
 *   [WSTR:launcher_with_trailing_space]
 *   [u32:bin_path_byte_len][u32:args_len_bytes]  // little-endian
 *   [u16:flags]
 *
 * Where:
 *   - launcher_with_trailing_space = launcher WSTR + trailing space
 *   - args_len_bytes = (launcher UTF16 length in bytes) + 2 (for trailing space)
 *   - bin_path_byte_len = bin_path UTF16 length in bytes (no terminator)
 *
 * Validation used by bun_shim_impl.zig:
 *   - flags.version_tag must match current (v5 = 5478) for "valid" shim fast-path
 *   - if shebang: (bin_path_byte_len + args_len_bytes) + 14 == file_size
 *       14 accounts for: u16 '"' + u16 0 + u32 bin_len + u32 args_len + u16 flags
 *
 * Flags bit layout (packed u16, fields in source order, little-endian):
 *   bit 0: is_node_or_bun (bool)
 *   bit 1: is_node        (bool)
 *   bit 2: has_shebang    (bool)
 *   bits 3..15: version_tag (u13)
 *
 * VersionFlag values (see BinLinkingShim.zig):
 *   v1=5474, v2=5475, v3=5476, v4=5477, v5=5478 (current)
 */

import { promises as fs } from "node:fs";
import * as pathMod from "node:path";
import { parseArgs } from "node:util";

type UInt16 = number;
type UInt32 = number;

export const VersionFlag = {
  v1: 5474,
  v2: 5475,
  v3: 5476,
  v4: 5477,
  v5: 5478,
} as const;
export type VersionFlagValue = (typeof VersionFlag)[keyof typeof VersionFlag];

export interface BunxFlags {
  raw: UInt16;
  version: VersionFlagValue | number;
  hasShebang: boolean;
  isNodeOrBun: boolean;
  isNode: boolean;
  isValidVersion: boolean; // matches current (v5)
}

export interface BunxShebang {
  launcher: string;
  launcherWithTrailingSpace: string;
  argsByteLength: UInt32; // launcher bytes length including trailing space
}

export interface BunxInfo {
  binPath: string; // UTF-16LE, relative to node_modules
  binPathByteLength: UInt32;

  quoteCharAtBoundary: '"' | null; // should be '"'
  zeroTerminatorPresent: boolean; // should be true

  flags: BunxFlags;

  shebang?: BunxShebang;
}

export interface ParseSuccess {
  ok: true;
  info: BunxInfo;
  _raw?: {
    bytes: Uint8Array;
    binPathBytes: Uint8Array;
    launcherBytes?: Uint8Array; // launcher + trailing space
  };
}

export interface ParseFailure {
  ok: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

const CURRENT_VERSION: VersionFlagValue = VersionFlag.v5;

function readU16LE(buf: Uint8Array, off: number): number {
  if (off < 0 || off + 2 > buf.length)
    throw new Error("Out of bounds u16 read");
  return buf[off]! | (buf[off + 1]! << 8);
}
function writeU16LE(buf: Uint8Array, off: number, value: number) {
  if (off < 0 || off + 2 > buf.length)
    throw new Error("Out of bounds u16 write");
  buf[off] = value & 0xff;
  buf[off + 1] = (value >>> 8) & 0xff;
}
function readU32LE(buf: Uint8Array, off: number): number {
  if (off < 0 || off + 4 > buf.length)
    throw new Error("Out of bounds u32 read");
  return (
    (buf[off]! |
      (buf[off + 1]! << 8) |
      (buf[off + 2]! << 16) |
      (buf[off + 3]! << 24)) >>>
    0
  );
}
function writeU32LE(buf: Uint8Array, off: number, value: number) {
  if (off < 0 || off + 4 > buf.length)
    throw new Error("Out of bounds u32 write");
  buf[off] = value & 0xff;
  buf[off + 1] = (value >>> 8) & 0xff;
  buf[off + 2] = (value >>> 16) & 0xff;
  buf[off + 3] = (value >>> 24) & 0xff;
}

const tdUtf16LE = new TextDecoder(("utf-16le" as unknown) as any);
// JS strings are UTF-16, so encode by writing code units as LE bytes
function encodeUTF16LE(str: string): Uint8Array {
  const out = new Uint8Array(str.length * 2);
  let o = 0;
  for (let i = 0; i < str.length; i++) {
    const cu = str.charCodeAt(i);
    out[o++] = cu & 0xff;
    out[o++] = (cu >>> 8) & 0xff;
  }
  return out;
}
function decodeUTF16LE(bytes: Uint8Array): string {
  if (bytes.length % 2 !== 0) throw new Error("Invalid UTF-16LE byte length");
  return tdUtf16LE.decode(bytes);
}

function parseFlags(raw: UInt16): BunxFlags {
  const isNodeOrBun = !!(raw & 0b1);
  const isNode = !!(raw & 0b10);
  const hasShebang = !!(raw & 0b100);
  const version = raw >>> 3;
  const isValidVersion = version === CURRENT_VERSION;
  return {
    raw,
    version,
    hasShebang,
    isNodeOrBun,
    isNode,
    isValidVersion,
  };
}

export function parseBunxBytes(
  bytes: Uint8Array,
  keepRawPieces = false
): ParseResult {
  try {
    if (bytes.length < 6) {
      return { ok: false, error: "File too small to be a .bunx" };
    }

    const flagsRaw = readU16LE(bytes, bytes.length - 2);
    const flags = parseFlags(flagsRaw);

    if (flags.hasShebang) {
      if (bytes.length < 10) {
        return {
          ok: false,
          error: "Corrupt .bunx: too small for shebang metadata",
        };
      }
      const binLen = readU32LE(bytes, bytes.length - 10);
      const argsLen = readU32LE(bytes, bytes.length - 6);

      const validationLengthOffset = 14;
      if (
        argsLen === 0 ||
        binLen + argsLen + validationLengthOffset !== bytes.length
      ) {
        return { ok: false, error: "Corrupt .bunx: invalid shebang bounds" };
      }

      // [bin_path][u16 '"'][u16 0][launcher_with_trailing_space][u32 binLen][u32 argsLen][u16 flags]
      const quoteOffset = binLen;
      const zeroOffset = binLen + 2;
      const launcherStart = binLen + 4;
      const launcherEnd = launcherStart + argsLen;

      if (launcherEnd + 10 !== bytes.length) {
        return {
          ok: false,
          error: "Corrupt .bunx: computed launcher end mismatch",
        };
      }

      const quote = readU16LE(bytes, quoteOffset);
      const zero = readU16LE(bytes, zeroOffset);
      const quoteCharAtBoundary: '"' | null = quote === 0x22 ? '"' : null;
      const zeroTerminatorPresent = zero === 0;

      const binPathBytes = bytes.subarray(0, binLen);
      const launcherWithSpaceBytes = bytes.subarray(launcherStart, launcherEnd);

      if (
        binPathBytes.length % 2 !== 0 ||
        launcherWithSpaceBytes.length % 2 !== 0
      ) {
        return {
          ok: false,
          error: "Corrupt .bunx: odd-length UTF-16LE segment",
        };
      }

      const hasTrailingSpace =
        launcherWithSpaceBytes.length >= 2 &&
        readU16LE(launcherWithSpaceBytes, launcherWithSpaceBytes.length - 2) ===
          0x20;
      if (!hasTrailingSpace) {
        return {
          ok: false,
          error: "Corrupt .bunx: launcher missing trailing space",
        };
      }

      const binPath = decodeUTF16LE(binPathBytes);
      const launcherWithTrailingSpace = decodeUTF16LE(launcherWithSpaceBytes);
      const launcher = launcherWithTrailingSpace.slice(0, -1);

      const info: BunxInfo = {
        binPath,
        binPathByteLength: binLen,
        quoteCharAtBoundary,
        zeroTerminatorPresent,
        flags,
        shebang: {
          launcher,
          launcherWithTrailingSpace,
          argsByteLength: argsLen,
        },
      };

      const result: ParseSuccess = { ok: true, info };
      if (keepRawPieces) {
        result._raw = {
          bytes,
          binPathBytes,
          launcherBytes: launcherWithSpaceBytes,
        };
      }
      return result;
    } else {
      // No shebang: [bin_path][u16 '"'][u16 0][u16 flags]
      const binLen = bytes.length - (2 + 2 + 2);
      if (binLen < 0)
        return { ok: false, error: "Corrupt .bunx: negative bin path length" };
      if (binLen % 2 !== 0)
        return { ok: false, error: "Corrupt .bunx: odd bin path length" };

      const quoteOffset = binLen;
      const zeroOffset = binLen + 2;
      const quote = readU16LE(bytes, quoteOffset);
      const zero = readU16LE(bytes, zeroOffset);

      const quoteCharAtBoundary: '"' | null = quote === 0x22 ? '"' : null;
      const zeroTerminatorPresent = zero === 0;

      const binPath = decodeUTF16LE(bytes.subarray(0, binLen));

      const info: BunxInfo = {
        binPath,
        binPathByteLength: binLen >>> 0,
        quoteCharAtBoundary,
        zeroTerminatorPresent,
        flags,
      };

      const result: ParseSuccess = { ok: true, info };
      if (keepRawPieces) {
        result._raw = {
          bytes,
          binPathBytes: bytes.subarray(0, binLen),
        };
      }
      return result;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function parseBunxFile(
  path: string,
  keepRawPieces = false
): Promise<ParseResult> {
  const f = Bun.file(path);
  if (!(await f.exists())) {
    return { ok: false, error: `No such file: ${path}` };
  }
  const buf = new Uint8Array(await f.arrayBuffer());
  return parseBunxBytes(buf, keepRawPieces);
}

function buildFlagsRaw({
  version,
  hasShebang,
  isNodeOrBun,
  isNode,
}: {
  version: number;
  hasShebang: boolean;
  isNodeOrBun: boolean;
  isNode: boolean;
}): UInt16 {
  const v = (version & 0x1fff) << 3;
  const h = (hasShebang ? 1 : 0) << 2;
  const n = (isNode ? 1 : 0) << 1;
  const nob = isNodeOrBun ? 1 : 0;
  return (v | h | n | nob) & 0xffff;
}

function patchLauncherNodeToBun(launcherWithTrailingSpace: string): string {
  if (!launcherWithTrailingSpace.endsWith(" ")) {
    throw new Error("Launcher is missing trailing space");
  }
  const base = launcherWithTrailingSpace.slice(0, -1);
  if (base === "node") return "bun ";
  if (base.startsWith("node ")) return "bun " + base.slice(5) + " ";
  throw new Error(`Launcher does not start with "node": "${base}"`);
}

async function writeFileAtomic(
  targetPath: string,
  data: Uint8Array,
  opts?: { backup?: boolean }
): Promise<void> {
  const dir = pathMod.dirname(targetPath);
  const base = pathMod.basename(targetPath);
  const tmp = pathMod.join(
    dir,
    `.${base}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
  );

  // 1) Write to temporary file first
  await Bun.write(tmp, data);

  // 2) Optional backup (best-effort, ignore errors if already exists or denied)
  if (opts?.backup !== false) {
    const backup = `${targetPath}.bak`;
    try {
      await fs.copyFile(targetPath, backup);
    } catch {
      // ignore
    }
  }

  // 3) Try rename (replace). If it fails, try unlink + rename, then copy fallback.
  try {
    await fs.rename(tmp, targetPath);
    return;
  } catch (e1) {
    try {
      await fs.rm(targetPath);
      await fs.rename(tmp, targetPath);
      return;
    } catch (e2) {
      try {
        await fs.copyFile(tmp, targetPath);
        await fs.rm(tmp);
        return;
      } catch (e3) {
        // Final cleanup attempt
        try {
          await fs.rm(tmp);
        } catch {}
        const msg1 = e1 instanceof Error ? e1.message : String(e1);
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        const msg3 = e3 instanceof Error ? e3.message : String(e3);
        throw new Error(`Failed to replace file atomically:
 - rename: ${msg1}
 - unlink+rename: ${msg2}
 - copy fallback: ${msg3}`);
      }
    }
  }
}

export async function patchShebangNodeToBun(
  path: string,
  options?: { outPath?: string; backup?: boolean }
): Promise<{
  changed: boolean;
  newBytes?: Uint8Array;
  message: string;
}> {
  const parsed = await parseBunxFile(path, true);
  if (!parsed.ok) {
    return { changed: false, message: parsed.error };
  }
  const info = parsed.info;
  const raw = parsed._raw!;
  if (!info.flags.hasShebang) {
    return {
      changed: false,
      message: "No shebang present in .bunx (nothing to patch)",
    };
  }
  if (!info.flags.isValidVersion) {
    return {
      changed: false,
      message: `Unsupported .bunx version_tag=${info.flags.version}, expected ${CURRENT_VERSION}`,
    };
  }
  if (!info.flags.isNode) {
    if (info.flags.isNodeOrBun) {
      return {
        changed: false,
        message: "Shebang already uses bun (or not node)",
      };
    }
    return {
      changed: false,
      message: "Shebang launcher is not node/bun (cmd/powershell/other)",
    };
  }
  if (!info.shebang) {
    return { changed: false, message: "Shebang metadata missing" };
  }

  // Build new launcher (UTF16LE) with trailing space
  const newLauncherWithTrailingSpace = patchLauncherNodeToBun(
    info.shebang.launcherWithTrailingSpace
  );
  const newLauncherBytes = encodeUTF16LE(newLauncherWithTrailingSpace);
  const newArgsLen = newLauncherBytes.length >>> 0;

  // Existing segments
  const binLen = info.binPathByteLength;
  const binPathBytes = raw.binPathBytes;
  const quoteChar = 0x22;
  const zeroChar = 0x0000;

  // Construct new flags: keep version, hasShebang=true, isNodeOrBun=true, isNode=false
  const newFlagsRaw = buildFlagsRaw({
    version: info.flags.version,
    hasShebang: true,
    isNodeOrBun: true,
    isNode: false,
  });

  // Construct new file buffer:
  // [binPathBytes][u16 '"'][u16 0][newLauncherBytes][u32 binLen][u32 newArgsLen][u16 flags]
  const newSize = binLen + 2 + 2 + newArgsLen + 4 + 4 + 2;
  const out = new Uint8Array(newSize);
  let o = 0;

  out.set(binPathBytes, o);
  o += binLen;

  writeU16LE(out, o, quoteChar);
  o += 2;
  writeU16LE(out, o, zeroChar);
  o += 2;

  out.set(newLauncherBytes, o);
  o += newArgsLen;

  writeU32LE(out, o, binLen);
  o += 4;
  writeU32LE(out, o, newArgsLen);
  o += 4;

  writeU16LE(out, o, newFlagsRaw);
  o += 2;

  if (o !== newSize) {
    throw new Error(`Internal error: wrote ${o} bytes but expected ${newSize}`);
  }

  // Validate new buffer like bun_shim_impl.zig
  const checkBinLen = readU32LE(out, out.length - 10);
  const checkArgsLen = readU32LE(out, out.length - 6);
  const validationLengthOffset = 14;
  if (checkBinLen + checkArgsLen + validationLengthOffset !== out.length) {
    throw new Error("Validation failed: size mismatch after patch");
  }
  const checkFlags = parseFlags(readU16LE(out, out.length - 2));
  if (!checkFlags.hasShebang || !checkFlags.isNodeOrBun || checkFlags.isNode) {
    throw new Error("Validation failed: flags mismatch after patch");
  }

  const destPath = options?.outPath ?? path;
  try {
    if (options?.outPath) {
      await Bun.write(destPath, out);
    } else {
      await writeFileAtomic(destPath, out, {
        backup: options?.backup !== false,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      changed: false,
      message: `Failed to write patched file (${destPath}): ${msg}\n`,
    };
  }

  let message = "Patched shebang ";
  if (options?.outPath) {
    message += "written to output path";
  } else {
    message += "in-place ";
    message += options?.backup !== false
      ? "(backup created as .bak)"
      : "(no backup created)";
  }

  return {
    changed: true,
    newBytes: out,
    message,
  };
}

if (import.meta.main) {
  if (typeof Bun === "undefined") {
    console.error("This script must be run with Bun.");
    process.exit(1);
  }

  const parsed = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      out: { type: "string" },
      "no-backup": { type: "boolean" },
    },
  });

  const cmd = parsed.positionals[0];
  if (!cmd || (cmd !== "inspect" && cmd !== "patch-shebang")) {
    console.error("Usage:");
    console.error("  bun run bunx-util.ts inspect <path-to-file.bunx>");
    console.error(
      "  bun run bunx-util.ts patch-shebang <path-to-file.bunx> [--out <dest-path>] [--no-backup]"
    );
    process.exit(2);
  }

  if (cmd === "inspect") {
    const filePath = parsed.positionals[1];
    if (!filePath) {
      console.error("inspect requires a path argument");
      process.exit(2);
    }
    const res = await parseBunxFile(filePath);
    if (!res.ok) {
      console.error(`Failed to parse .bunx: ${res.error}`);
      process.exit(1);
    }
    const { info } = res;
    const out = {
      binPath: info.binPath,
      binPathByteLength: info.binPathByteLength,
      boundary: {
        quoteCharAtBoundary: info.quoteCharAtBoundary,
        zeroTerminatorPresent: info.zeroTerminatorPresent,
      },
      flags: {
          version: info.flags.version,
          isValidVersion: info.flags.isValidVersion,
          hasShebang: info.flags.hasShebang,
          isNodeOrBun: info.flags.isNodeOrBun,
          isNode: info.flags.isNode,
        },
        shebang: info.shebang
          ? {
              launcher: info.shebang.launcher,
              argsByteLength: info.shebang.argsByteLength,
            }
          : null,
      sizeValidation:
        info.flags.hasShebang && info.shebang
          ? info.binPathByteLength + info.shebang.argsByteLength + 14
          : null,
    };
    console.log(out);
  } else if (cmd === "patch-shebang") {
    const filePath = parsed.positionals[1];
    if (!filePath) {
      console.error("patch-shebang requires a path argument");
      process.exit(2);
    }

    const outPath: string | undefined = parsed.values.out as string | undefined;
    const noBackup = !!parsed.values["no-backup"];
    const backup = !noBackup;

    const res = await patchShebangNodeToBun(filePath, { outPath, backup });
    if (!res.changed) {
      console.error(res.message);
      process.exit(1);
    }
    console.log(res.message);
  }
}
