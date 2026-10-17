/**
 * 文字列の SHA-256 を16進文字列で返す
 * Web Crypto API を使うため Node.js / Cloudflare Workers の両方で動作する
 */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
}
