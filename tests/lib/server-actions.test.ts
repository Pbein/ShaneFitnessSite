import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guard for a failure that reached production on 2026-08-22.
 *
 * `actions.ts` exported `EMPTY_STATE`, a plain object, alongside the Server
 * Action. Next.js allows a `"use server"` module to export **only async
 * functions**. That constraint is enforced when the module is first loaded at
 * runtime — so `tsc --noEmit` passed, `npm run build` passed, the deploy went
 * green, and the first person to submit the contact form got a 500:
 *
 *   Error: A "use server" file can only export async functions, found object.
 *
 * Nothing in the normal toolchain catches it, which is exactly why it is worth
 * a test. This scans the source rather than importing the modules, because
 * importing a "use server" module outside a Next runtime is its own problem.
 */

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

/** Files whose first non-comment, non-blank line is a "use server" directive. */
function serverActionFiles(): { path: string; source: string }[] {
  return walk(SRC)
    .map((path) => ({ path, source: readFileSync(path, "utf8") }))
    .filter(({ source }) => /^\s*["']use server["']\s*;?/.test(source));
}

/**
 * Every `export` in the file, as the text immediately following the keyword.
 * `export type` / `export interface` are erased at compile time and are fine.
 */
function exportStatements(source: string): string[] {
  return [...source.matchAll(/^export\s+(.+)$/gm)].map((m) => m[1].trim());
}

describe('"use server" modules', () => {
  const files = serverActionFiles();

  it("finds the contact action (guard against the scan silently matching nothing)", () => {
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.path.includes("contact"))).toBe(true);
  });

  it.each(files.map((f) => f.path))(
    "%s exports only async functions",
    (path) => {
      const source = readFileSync(path, "utf8");
      const offenders = exportStatements(source).filter((stmt) => {
        // Types and interfaces vanish at compile time.
        if (/^(type|interface)\s/.test(stmt)) return false;
        // The only legal runtime export.
        if (/^async\s+function\s/.test(stmt)) return false;
        return true;
      });

      expect(
        offenders,
        `${path} exports a non-async-function from a "use server" module. ` +
          `Next.js throws at runtime — a green build will still 500 on first ` +
          `use. Move it to a plain module (e.g. src/lib/) and import it.`,
      ).toEqual([]);
    },
  );
});
