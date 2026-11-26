// 相性占い（計算と表示）
// 鑑定データ（COMPAT_DATA）は、compat-data-1.js 以降のファイルで追加します。
const COMPAT_RELATIONS = {
  lover: {
    label: "恋人",
    basic: "恋人として向き合うとき、ときめきと安心感の両立を意識すると良い関係になります。",
    deepen: "二人だけの小さな約束や習慣を作ると、関係が一段と深まります。",
    summary: "恋人としては、言葉と態度で想いを伝え続けることが、関係を長く支えます。"
  },
  couple: {
    label: "夫婦",
    basic: "夫婦として暮らす場合は、日々の役割分担と感謝の言葉が、関係の土台になります。",
    deepen: "週末に一緒に過ごし、家計や将来について話す機会を持ちましょう。",
    summary: "夫婦としては、小さな不満をためず、早めに話し合うことが安定の鍵です。"
  },
  friend: {
    label: "友人",
    basic: "友人として付き合う場合は、互いの自由を尊重しながら、気軽に会える距離感が心地よさを生みます。",
    deepen: "予定が合うときに、共通の趣味を楽しむ時間を大切にしてください。",
    summary: "友人としては、適度な距離を保ちながら、会ったときに本音で話せることが大切です。"
  },
  work: {
    label: "職場の人",
    basic: "職場の人として関わる場合は、役割と期限を明確にし、感情と仕事を分けて考える姿勢が大切です。",
    deepen: "定期的に振り返りの時間を持ち、互いの成果を認め合う習慣をつくってください。",
    summary: "職場では、結果とプロセスの両方を尊重し合うことで、信頼が深まります。"
  }
};

// 数秘術の差（ライフパスの違い）による相性の文章。スコアは 5〜1
const COMPAT_NUM_BANDS = {
  5: "同じ数字の響きを持つため、生き方の方向性が自然に重なります。",
  4: "近い数字の流れを持ち、互いの考え方を理解しやすい組み合わせです。",
  3: "数字の流れに違いがあり、補い合うことで深まる組み合わせです。",
  2: "数字の流れが離れているため、互いの世界を知る努力が大切です。",
  1: "数字の流れが大きく異なり、最初は戸惑いやすい組み合わせです。違いを発見の喜びに変えていきましょう。"
};

// 組み合わせの鑑定データを探す（星座の順番を問わず、両方向で検索する）
function findCompatData(signA, signB) {
  return COMPAT_DATA[`${signA.name}|${signB.name}`]
    || COMPAT_DATA[`${signB.name}|${signA.name}`]
    || null;
}

// 星座の元素による相性
function compatElementRelation(signA, signB) {
  if (signA.element === signB.element) return ELEMENT_COMPAT.same;
  const harmony = HARMONY_PAIRS.some(([x, y]) =>
    (x === signA.element && y === signB.element) || (x === signB.element && y === signA.element)
  );
  return harmony ? ELEMENT_COMPAT.harmony : ELEMENT_COMPAT.challenge;
}

// ライフパスの差による相性
function compatLifeNumbers(dateA, dateB) {
  const lifeA = numLifePathOf(dateA);
  const lifeB = numLifePathOf(dateB);
  const diff = Math.abs(toBase(lifeA) - toBase(lifeB));
  const numScore = Math.max(1, 5 - Math.min(diff, 4));
  return { lifeA, lifeB, numScore, text: COMPAT_NUM_BANDS[numScore] };
}

function compatCard(title, body) {
  return `<div class="fortune-card"><h3>${title}</h3><p>${body}</p></div>`;
}

function showCouplePro() {
  const dateA = document.getElementById("coupleA").value;
  const dateB = document.getElementById("coupleB").value;
  const relationKey = document.getElementById("relationType").value;

  const checkA = FortuneCore.validateBirthday(dateA);
  if (!checkA.ok) return showError("coupleResult", `あなたの生年月日：${checkA.message}`);
  const checkB = FortuneCore.validateBirthday(dateB);
  if (!checkB.ok) return showError("coupleResult", `相手の生年月日：${checkB.message}`);

  const signA = getSignByDate(dateA);
  const signB = getSignByDate(dateB);
  const data = findCompatData(signA, signB);
  if (!data) {
    return showError("coupleResult", "この組み合わせの鑑定は、現在準備中です。");
  }

  const rel = COMPAT_RELATIONS[relationKey];
  const elem = compatElementRelation(signA, signB);
  const num = compatLifeNumbers(dateA, dateB);
  const overall = Math.round((elem.score + num.numScore) / 2);
  const overallText = overall >= 4
    ? "全体として、相性は良好な組み合わせです。"
    : overall === 3
      ? "穏やかに支え合える、安定した組み合わせです。"
      : "違いを理解し合うことで、関係がさらに深まる組み合わせです。";

  const lifeA = NUMEROLOGY_DATA.life[num.lifeA];
  const lifeB = NUMEROLOGY_DATA.life[num.lifeB];
  const numberLine = `数字の観点では、${num.lifeA}（${lifeA.keyword}）と${num.lifeB}（${lifeB.keyword}）の組み合わせです。`;

  document.getElementById("coupleResult").innerHTML = `
    <p class="small">${signA.name}（${ELEMENTS[signA.element]}）× ${signB.name}（${ELEMENTS[signB.element]}）｜関係性：${rel.label}</p>

    <div class="fortune-card">
      <h3>相性の評価</h3>
      <div class="score-row"><span class="score-label">星座の相性</span><span class="stars">${stars(elem.score)}</span></div>
      <p>${elem.text}</p>
      <div class="score-row"><span class="score-label">数秘術の相性</span><span class="stars">${stars(num.numScore)}</span></div>
      <p>${num.text}</p>
      <div class="score-row"><span class="score-label">総合評価</span><span class="stars">${stars(overall)}</span></div>
      <p><strong>${overallText}</strong></p>
    </div>

    ${compatCard("基本相性", `${data.basic}${rel.basic}`)}
    ${compatCard("価値観", data.values)}
    ${compatCard("コミュニケーション", data.communication)}
    ${compatCard("信頼関係", data.trust)}
    ${compatCard("長所", data.strengths)}
    ${compatCard("注意点", data.cautions)}
    ${compatCard("関係を深める方法", `${data.deepen}${rel.deepen}`)}
    ${compatCard("総合アドバイス", `${data.summary}${rel.summary}${numberLine}`)}

    <p class="fortune-disclaimer">※ 相性占いは娯楽としてお楽しみください。大切な判断は、ご自身の考えと専門家への相談を重ねて行ってください。</p>`;
}

// 関係性の選択欄を追加し、ボタンを新しい処理に付け替える
(function setupCouplePro() {
  const btn = document.getElementById("coupleBtn");

  const relWrap = document.createElement("div");
  relWrap.innerHTML = `
    <label for="relationType">関係性</label>
    <select id="relationType" style="width:100%;padding:10px 12px;font-size:16px;font-family:inherit;color:#ece6ff;background:rgba(10,8,30,0.6);border:1px solid rgba(255,217,138,0.3);border-radius:10px;margin-bottom:14px;">
      <option value="lover">恋人</option>
      <option value="couple">夫婦</option>
      <option value="friend">友人</option>
      <option value="work">職場の人</option>
    </select>`;
  btn.parentNode.insertBefore(relWrap, btn);

  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);
  newBtn.addEventListener("click", showCouplePro);
})();