const jstDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const jstDateLabelFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** 日本時間における「今日」の日付を「2026年8月4日」形式で返す。 */
export function getTodayDateLabel(): string {
  return jstDateLabelFormatter.format(new Date());
}

/**
 * 日本時間における「今日」の日付を、Prismaの@db.Dateカラムに保存できる
 * UTC 0時のDateとして返す（占いの1日1回生成の判定基準に使う）。
 */
export function getTodayReadingDate(): Date {
  const [{ value: year }, , { value: month }, , { value: day }] = jstDateFormatter.formatToParts(
    new Date(),
  );
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}
