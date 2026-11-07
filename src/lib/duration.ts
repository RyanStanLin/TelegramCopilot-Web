export function formatDuration(
  seconds: number | null | undefined,
  locale = "zh-CN",
): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  let rest = Math.round(seconds * 1000);
  const zh = locale.startsWith("zh");
  const number = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(n);
  if (rest < 60000) return `${number(rest / 1000)}s`;
  const parts: string[] = [];
  for (const [unit, suffix] of [
    [86400000, zh ? "天" : "d"],
    [3600000, zh ? "小时" : "h"],
    [60000, zh ? (seconds < 3600 ? "分钟" : "分") : "m"],
  ] as const) {
    const n = Math.floor(rest / unit);
    if (n) parts.push(`${number(n)}${suffix}`);
    rest %= unit;
  }
  if (rest) parts.push(`${number(rest / 1000)}${zh ? "秒" : "s"}`);
  return parts.join(zh ? "" : " ");
}

export function parseDuration(input: unknown): number {
  if (typeof input === "number" && Number.isSafeInteger(input) && input >= 0)
    return input;
  const text = String(input ?? "")
    .trim()
    .toLowerCase();
  if (/^\d+$/.test(text) && Number.isSafeInteger(Number(text)))
    return Number(text);
  const units: Record<string, number> = {
    d: 86400,
    day: 86400,
    days: 86400,
    天: 86400,
    h: 3600,
    hr: 3600,
    hour: 3600,
    hours: 3600,
    小时: 3600,
    时: 3600,
    m: 60,
    min: 60,
    minute: 60,
    minutes: 60,
    分钟: 60,
    分: 60,
    s: 1,
    sec: 1,
    second: 1,
    seconds: 1,
    秒: 1,
  };
  const pattern =
    /(\d+)\s*(days?|d|hours?|hr|h|minutes?|min|m|seconds?|sec|s|小时|分钟|天|时|分|秒)/gy;
  let position = 0,
    total = 0,
    previous = Infinity;
  while (position < text.length) {
    while (/\s/.test(text[position] ?? "") && position < text.length)
      position++;
    if (position === text.length) break;
    pattern.lastIndex = position;
    const match = pattern.exec(text);
    if (!match) throw new Error("invalidDuration");
    const unit = units[match[2]];
    if (unit >= previous) throw new Error("invalidDuration");
    previous = unit;
    total += Number(match[1]) * unit;
    if (!Number.isSafeInteger(total)) throw new Error("invalidDuration");
    position = pattern.lastIndex;
  }
  if (!text || position === 0) throw new Error("invalidDuration");
  return total;
}
