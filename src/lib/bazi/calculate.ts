import { Solar } from 'lunar-typescript';

export type BaziPillar = {
  /** 干支（例: "乙亥"） */
  ganZhi: string;
  /** 天干（例: "乙"） */
  gan: string;
  /** 地支（例: "亥"） */
  zhi: string;
  /** 干・支それぞれの五行を連結した文字列（例: "木水"） */
  wuXing: string;
};

export type WuXingElement = '木' | '火' | '土' | '金' | '水';

export type WuXingCounts = Record<WuXingElement, number>;

export type BaziChart = {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  /** 出生時刻が不明な場合はnull */
  time: BaziPillar | null;
  /** 時柱が不明なため五行バランスの集計から除外されている場合はtrue */
  timeUnknown: boolean;
  wuXingCounts: WuXingCounts;
  calculatedAt: string;
};

const WUXING_ELEMENTS: WuXingElement[] = ['木', '火', '土', '金', '水'];

function isWuXingElement(char: string): char is WuXingElement {
  return (WUXING_ELEMENTS as string[]).includes(char);
}

function countWuXing(pillars: BaziPillar[]): WuXingCounts {
  const counts: WuXingCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const pillar of pillars) {
    for (const char of pillar.wuXing) {
      if (isWuXingElement(char)) {
        counts[char] += 1;
      }
    }
  }
  return counts;
}

/**
 * 生年月日（＋任意の出生時刻）から四柱推命（八字）の命式を計算する。
 *
 * birthDate/birthTimeはPrisma（Postgresの@db.Date/@db.Time）から取得したDateを
 * 想定しており、両者ともUTC基準の値として格納されている（ローカルタイムゾーンの
 * 影響を受けない）。そのため年月日・時分秒の取り出しには必ずUTC系のアクセサを使う。
 */
export function calculateBaziChart(birthDate: Date, birthTime?: Date | null): BaziChart {
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();

  const hasTime = birthTime != null;
  const hour = hasTime ? birthTime.getUTCHours() : 0;
  const minute = hasTime ? birthTime.getUTCMinutes() : 0;
  const second = hasTime ? birthTime.getUTCSeconds() : 0;

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, second);
  const eightChar = solar.getLunar().getEightChar();

  const yearPillar: BaziPillar = {
    ganZhi: eightChar.getYear(),
    gan: eightChar.getYearGan(),
    zhi: eightChar.getYearZhi(),
    wuXing: eightChar.getYearWuXing(),
  };
  const monthPillar: BaziPillar = {
    ganZhi: eightChar.getMonth(),
    gan: eightChar.getMonthGan(),
    zhi: eightChar.getMonthZhi(),
    wuXing: eightChar.getMonthWuXing(),
  };
  const dayPillar: BaziPillar = {
    ganZhi: eightChar.getDay(),
    gan: eightChar.getDayGan(),
    zhi: eightChar.getDayZhi(),
    wuXing: eightChar.getDayWuXing(),
  };
  const timePillar: BaziPillar | null = hasTime
    ? {
        ganZhi: eightChar.getTime(),
        gan: eightChar.getTimeGan(),
        zhi: eightChar.getTimeZhi(),
        wuXing: eightChar.getTimeWuXing(),
      }
    : null;

  const pillarsForWuXing = [yearPillar, monthPillar, dayPillar, ...(timePillar ? [timePillar] : [])];

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    time: timePillar,
    timeUnknown: !hasTime,
    wuXingCounts: countWuXing(pillarsForWuXing),
    calculatedAt: new Date().toISOString(),
  };
}
