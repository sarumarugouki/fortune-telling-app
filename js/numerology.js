// 数秘術（計算と表示）
const NUM_KANA_LIST = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const NUM_SMALL_KANA = { "ぁ": "あ", "ぃ": "い", "ぅ": "う", "ぇ": "え", "ぉ": "お", "ゃ": "や", "ゅ": "ゆ", "ょ": "よ", "ゎ": "わ", "っ": "つ" };
let numNameValueMap = null;

function numDigitSum(n) {
  return String(n).split("").reduce((sum, c) => sum + Number(c), 0);
}
function numReduceSingle(n) {
  while (n > 9) n = numDigitSum(n);
  return n;
}
function numReduceKeepMaster(n) {
  while (n > 9 && ![11, 22, 33].includes(n)) n = numDigitSum(n);
  return n;
}
function numLifePathOf(dateStr) {
  return numReduceKeepMaster(numDigitSum(dateStr.replace(/-/g, "")));
}
function numBirthdayOf(dateStr) {
  return numReduceKeepMaster(Number(dateStr.split("-")[2]));
}
function numPersonalYearOf(dateStr, year) {
  const [, m, d] = dateStr.split("-").map(Number);
  return numReduceSingle(numDigitSum(m) + numDigitSum(d) + numDigitSum(year));
}
function numPersonalMonthOf(personalYear, month) {
  return numReduceSingle(personalYear + month);
}

// ひらがな・カタカナを、ひらがなに統一する
function numToHiragana(text) {
  return text.replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// 名前数（このアプリ独自の計算方式）
function numNameNumberOf(reading) {
  if (!numNameValueMap) {
    numNameValueMap = new Map();
    [...NUM_KANA_LIST].forEach((ch, i) => numNameValueMap.set(ch, (i % 9) + 1));
  }
  const chars = [...numToHiragana(reading).replace(/[\s　]/g, "")];
  let total = 0;
  let valid = 0;
  const unknown = [];
  for (const ch of chars) {
    const base = NUM_SMALL_KANA[ch] ?? ch.normalize("NFD").charAt(0);
    const value = numNameValueMap.get(base);
    if (value === undefined) unknown.push(ch);
    else { total += value; valid++; }
  }
  return { number: valid > 0 ? numReduceKeepMaster(total) : null, total, unknown };
}

function numSection(title, body) {
  return `<div class="fortune-card"><h3>${title}</h3>${body}</div>`;
}
function numLine(text) {
  return `<p>${escapeHtml(text)}</p>`;
}
function numAdvice(text) {
  return `<p><strong>アドバイス：</strong>${escapeHtml(text)}</p>`;
}

function numNameSection() {
  const explain = numSection(
    "名前数の計算方式について",
    numLine("名前数は、あいうえお順の文字に1から9までの数字を、順番に繰り返し割り当てて求めます。ふりがなの各文字の数字を合計し、その合計をさらに1桁の数字に整えます（11、22、33は、そのまま表示します）。一般的な数秘術の表とは異なる、このアプリ独自の計算方式です。濁音・半濁音は基本の文字として、小さい文字（ゃ・ゅ・ょ・っなど）は通常の文字と同じ数字として数えます。")
  );

  if (!NAME_FEATURE_ENABLED) {
    return explain + numSection("名前数", numLine("名前数は、有料プランでご利用いただけます。"));
  }
  const reading = document.getElementById("nameReading").value.trim();
  if (!reading) {
    return explain + numSection("名前数", numLine("ふりがなを入力すると、名前数が表示されます。"));
  }
  const result = numNameNumberOf(reading);
  if (result.number === null) {
    return explain + numSection("名前数", `<p class="error">ひらがなまたはカタカナで入力してください。</p>`);
  }
  const info = NUMEROLOGY_DATA.nameNumber[result.number];
  const unknownNote = result.unknown.length
    ? `<p class="small">読み取れなかった文字：${escapeHtml(result.unknown.join(""))}（ふりがなを確認してください）</p>`
    : "";
  return explain + numSection(
    `名前数：${result.number}（${info.title}）`,
    `<p class="small">文字の数字の合計：${result.total}</p>` + numLine(info.text) + numAdvice(info.advice) + unknownNote
  );
}

function showNumerologyPro() {
  const value = document.getElementById("numDate").value;
  const check = FortuneCore.validateBirthday(value);
  if (!check.ok) return showError("numResult", check.message);

  const today = FortuneCore.todayJST();
  const currentYear = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7));

  const lifePath = numLifePathOf(value);
  const life = NUMEROLOGY_DATA.life[lifePath];
  const birthdayNum = numBirthdayOf(value);
  const personalYear = numPersonalYearOf(value, currentYear);
  const personalMonth = numPersonalMonthOf(personalYear, currentMonth);
  const py = NUMEROLOGY_DATA.personalYear[personalYear];
  const pm = NUMEROLOGY_DATA.personalMonth[personalMonth];

  const lifeHeader = `
    <div class="fortune-card">
      <h3>ライフパスナンバー：${lifePath}（${life.title}）</h3>
      <p class="small">キーワード：${life.keyword}</p>
    </div>`;

  const lifeItems = [
    ["基本性格", life.personality],
    ["長所", life.strengths],
    ["短所", life.weaknesses],
    ["隠れた才能", life.hiddenTalent],
    ["適職", life.careers],
    ["恋愛傾向", life.love],
    ["結婚観", life.marriage],
    ["人間関係", life.relationships],
    ["人生のテーマ", life.theme],
    ["成長へのアドバイス", life.growth]
  ].map(([title, body]) => numSection(title, numLine(body))).join("");

  const birthdaySection = numSection(
    `誕生日数：${birthdayNum}`,
    numLine(BIRTHDAY_NUMBERS[birthdayNum])
  );

  const yearSection = numSection(
    `${currentYear}年の個人年数：${personalYear}（${py.theme}）`,
    numLine(py.text) + numAdvice(py.advice)
  );

  const monthSection = numSection(
    `${currentMonth}月の個人月数：${personalMonth}（${pm.theme}）`,
    numLine(pm.text) + numAdvice(pm.advice)
  );

  document.getElementById("numResult").innerHTML = `
    ${lifeHeader}
    ${lifeItems}
    ${birthdaySection}
    ${yearSection}
    ${monthSection}
    ${numNameSection()}
    <p class="fortune-disclaimer">※ 数秘術は娯楽としてお楽しみください。大切な判断は、ご自身の考えと専門家への相談を重ねて行ってください。</p>`;
}

// 数秘術のボタンを、新しい処理に付け替える（古い処理の登録を外すため）
(function rebindNumerologyButton() {
  const oldBtn = document.getElementById("numBtn");
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.replaceWith(newBtn);
  newBtn.addEventListener("click", showNumerologyPro);
})();