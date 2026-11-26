// 今日の総合運の表示
const DAILY_CATEGORY_KEYS = ["overall", "love", "work", "money", "people"];

function starText(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function dailyCard(title, body, score) {
  const scoreHtml = score ? `<div class="stars">${starText(score)}</div>` : "";
  return `
    <div class="fortune-card">
      <h3>${title}</h3>
      ${scoreHtml}
      <p>${body}</p>
    </div>`;
}

function showDaily() {
  const birthday = document.getElementById("dailyDate").value;
  const check = FortuneCore.validateBirthday(birthday);
  if (!check.ok) return showError("dailyResult", check.message);

  const today = FortuneCore.todayJST();
  // 生年月日と日本時間の日付から種を作るので、同じ日は同じ結果になる
  const rng = FortuneCore.createRng(`daily|${birthday}|${today}`);

  const scores = {};
  const texts = {};
  DAILY_CATEGORY_KEYS.forEach(key => {
    const category = DAILY_DATA.categories[key];
    const level = 1 + Math.floor(rng() * 5);
    const variants = category.levels[level];
    scores[key] = level;
    texts[key] = variants[Math.floor(rng() * variants.length)];
  });

  const lowest = DAILY_CATEGORY_KEYS.reduce((a, b) => (scores[b] < scores[a] ? b : a));
  const highest = DAILY_CATEGORY_KEYS.reduce((a, b) => (scores[b] > scores[a] ? b : a));

  const warning = FortuneCore.pickSeeded(rng, DAILY_DATA.warnings[lowest]);
  const action = FortuneCore.pickSeeded(rng, DAILY_DATA.actions[highest]);
  const color = FortuneCore.pickSeeded(rng, DAILY_DATA.colors);
  const number = FortuneCore.pickSeeded(rng, DAILY_DATA.numbers);
  const item = FortuneCore.pickSeeded(rng, DAILY_DATA.items);
  const food = FortuneCore.pickSeeded(rng, DAILY_DATA.foods);

  const categoryCards = DAILY_CATEGORY_KEYS
    .map(key => dailyCard(DAILY_DATA.categories[key].label, texts[key], scores[key]))
    .join("");

  document.getElementById("dailyResult").innerHTML = `
    <p class="small">${FortuneCore.formatJapaneseDate(today)} の運勢</p>
    ${categoryCards}
    ${dailyCard("注意点", warning)}
    ${dailyCard("開運アクション", action)}
    <div class="fortune-card">
      <h3>ラッキーアイテム</h3>
      <ul>
        <li><strong>カラー：</strong>${color.name}（${color.meaning}）</li>
        <li><strong>ナンバー：</strong>${number.number}（${number.meaning}）</li>
        <li><strong>アイテム：</strong>${item.name}（${item.meaning}）</li>
        <li><strong>フード：</strong>${food.name}（${food.meaning}）</li>
      </ul>
    </div>
    <p class="fortune-disclaimer">※ 占いは娯楽としてお楽しみください。大切な判断は、ご自身の考えと専門家への相談を重ねて行ってください。</p>`;
}