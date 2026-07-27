import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

function hashesEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

export const verifyAdminPasscode = createServerFn({ method: "POST" })
  .inputValidator((data: { passcode: string }) => {
    if (!data || typeof data.passcode !== "string") throw new Error("Invalid input");
    return data;
  })
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSCODE;
    if (!expected) {
      return { ok: false as const, reason: "not-configured" as const };
    }
    return hashesEqual(data.passcode, expected)
      ? { ok: true as const }
      : { ok: false as const, reason: "invalid" as const };
  });
