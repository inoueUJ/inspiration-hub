/**
 * 「日替わり」の基準タイムゾーン
 * ターゲットユーザーが日本在住のため、日付の切り替わりは JST 0:00 とする。
 * （Cron も UTC 15:00 = JST 0:00 に実行する）
 */
export const DAILY_TIME_ZONE = "Asia/Tokyo"

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DAILY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const displayFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: DAILY_TIME_ZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
})

/**
 * 日替わり名言のキー（YYYY-MM-DD）を返す
 * `en-CA` ロケールは ISO 形式の日付を返すため、文字列操作なしで得られる
 */
export function getDateKey(date: Date = new Date()): string {
  return dateKeyFormatter.format(date)
}

/**
 * YYYY-MM-DD を「2026年10月16日(金)」形式に整形
 */
export function formatDateKey(dateKey: string): string {
  // 正午を基準にしてタイムゾーン差で日付がずれないようにする
  return displayFormatter.format(new Date(`${dateKey}T12:00:00+09:00`))
}

/**
 * 文字列から 32bit の決定的なハッシュ値を得る（FNV-1a）
 * 日付をシードにした「今日の一言」の選定などに使う
 */
export function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
