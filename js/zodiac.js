// 星座占い（基本性格・今日・今週・今月）
// 日替わり鑑定の4回分を1つにまとめる
const ZODIAC_DAILY_ALL = Object.assign(
  {},
  ZODIAC_DAILY,
  ZODIAC_DAILY_2,
  ZODIAC_DAILY_3,
  ZODIAC_DAILY_4
);

// 週の始まり（月曜日）の日付を「YYYY-MM-DD」で返す
function zodiacWeekStart(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const diff = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date.getTime() - diff * 86400000);
  const mm = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(monday.getUTCDate()).padStart(2, "0");
  return `${monday.getUTCFullYear()}-${mm}-${dd}`;
}

// 日付と星座から、今日・今週・今月の結果を作る
// 同じ星座・同じ日付・同じ週・同じ月なら、毎回同じ結果になる
function buildZodiacReading(signName, today) {
  const dailyRng = FortuneCore.createRng(`zodiac|${signName}|daily|${today}`);
  const dailyList = ZODIAC_DAILY_ALL[signName];
  const dailyText = dailyList[Math.floor(dailyRng() * dailyList.length)];
  const dailyLevel = 1 + Math.floor(dailyRng() * 5);

  const weekKey = zodiacWeekStart(today);
  const weekRng = FortuneCore.createRng(`zodiac|${signName}|week|${weekKey}`);
  const weekLevel = 1 + Math.floor(weekRng() * 5);

  const monthKey = today.slice(0, 7);
  const monthRng = FortuneCore.createRng(`zodiac|${signName}|month|${monthKey}`);
  const monthLevel = 1 + Math.floor(monthRng() * 5);

  return {
    daily: { level: dailyLevel, text: dailyText },
    week: { level: weekLevel, text: ZODIAC_WEEKLY[signName][weekLevel] },
    month: { level: monthLevel, text: ZODIAC_MONTHLY[signName][monthLevel] }
  };
}

function zodiacPeriodCard(title, item) {
  return `
    <div class="fortune-card">
      <h3>${title}</h3>
      <div class="stars">${starText(item.level)}</div>
      <p>${item.text}</p>
    </div>`;
}

function renderZodiacPanel(signName, reading, today) {
  const sign = SIGNS.find(s => s.name === signName);
  const base = ZODIAC_BASE[signName];
  return `
    <p class="small">${FortuneCore.formatJapaneseDate(today)} 時点の運勢</p>
    <div class="fortune-card">
      <h3>${signName}</h3>
      <p class="small">${ELEMENTS[sign.element]}・${sign.keywords}</p>
    </div>
    <div class="fortune-card">
      <h3>基本性格</h3>
      <p>${base.personality}</p>
    </div>
    <div class="subtabs">
      <button class="tab-btn active" data-period="daily">今日</button>
      <button class="tab-btn" data-period="week">今週</button>
      <button class="tab-btn" data-period="month">今月</button>
    </div>
    <div class="sub-panel active" id="zodiac-sub-daily">${zodiacPeriodCard("今日の運勢", reading.daily)}</div>
    <div class="sub-panel" id="zodiac-sub-week">${zodiacPeriodCard("今週の運勢", reading.week)}</div>
    <div class="sub-panel" id="zodiac-sub-month">${zodiacPeriodCard("今月の運勢", reading.month)}</div>
    <p class="fortune-disclaimer">※ 占いは娯楽としてお楽しみください。大切な判断は、ご自身の考えと専門家への相談を重ねて行ってください。</p>`;
}

function bindZodiacSubTabs(resultEl) {
  resultEl.querySelectorAll("[data-period]").forEach(btn => {
    btn.addEventListener("click", () => {
      resultEl.querySelectorAll("[data-period]").forEach(b => b.classList.toggle("active", b === btn));
      resultEl.querySelectorAll(".sub-panel").forEach(p =>
        p.classList.toggle("active", p.id === `zodiac-sub-${btn.dataset.period}`)
      );
    });
  });
}

function showZodiac() {
  const resultEl = document.getElementById("zodiacResult");
  const birthday = document.getElementById("zodiacDate").value;
  const check = FortuneCore.validateBirthday(birthday);
  if (!check.ok) return showError("zodiacResult", check.message);

  const sign = getSignByDate(birthday);
  if (!ZODIAC_DAILY_ALL[sign.name] || !ZODIAC_WEEKLY[sign.name] || !ZODIAC_MONTHLY[sign.name]) {
    return showError("zodiacResult", "星座のデータを読み込めませんでした。");
  }

  const today = FortuneCore.todayJST();
  const reading = buildZodiacReading(sign.name, today);
  resultEl.innerHTML = renderZodiacPanel(sign.name, reading, today);
  bindZodiacSubTabs(resultEl);
}