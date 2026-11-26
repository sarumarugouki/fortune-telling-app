// 占いの共通処理（日付・乱数・入力チェック）
const FortuneCore = (() => {
  // 日本時間（JST）の今日の日付を「YYYY-MM-DD」で返す
  function todayJST() {
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const get = type => parts.find(p => p.type === type).value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  }

  // 「2026-11-26」を「2026年11月26日（木）」の形式にする
  function formatJapaneseDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
    return `${y}年${m}月${d}日（${weekday}）`;
  }

  // 文字列から数値の種を作る（FNV-1a）
  function hashString(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // 同じ文字列からは、毎回同じ乱数の列が出る
  function createRng(seedText) {
    let a = hashString(seedText);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickSeeded(rng, list) {
    return list[Math.floor(rng() * list.length)];
  }

  // 生年月日の入力チェック
  function validateBirthday(value) {
    if (!value) return { ok: false, message: "生年月日を入力してください。" };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { ok: false, message: "生年月日の形式が正しくありません。" };
    }
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
      return { ok: false, message: "存在しない日付です。正しい生年月日を入力してください。" };
    }
    if (y < 1900) return { ok: false, message: "1900年以降の生年月日を入力してください。" };
    if (value > todayJST()) return { ok: false, message: "未来の日付は入力できません。" };
    return { ok: true };
  }

  return { todayJST, formatJapaneseDate, hashString, createRng, pickSeeded, validateBirthday };
})();