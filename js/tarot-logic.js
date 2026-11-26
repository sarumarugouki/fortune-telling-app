// タロット占い（計算と表示）
// 鑑定データ（TAROT_DATA）は、tarot-data.js 以降のファイルで追加します。
const TAROT_THEMES = {
  overall: { label: "総合運" },
  love: { label: "恋愛" },
  work: { label: "仕事" },
  money: { label: "金運" },
  people: { label: "人間関係" }
};
const TAROT_POSITIONS_3 = ["過去", "現在", "未来"];
const TAROT_SUIT_LABELS = { wands: "ワンド", cups: "カップ", swords: "ソード", pentacles: "ペンタクル" };

// テーマ別の具体的な行動アドバイス（正位置が多い場合は up、逆位置が多い場合は rev）
const TAROT_ACTIONS = {
  overall: {
    up: [
      "今週のうちに、懸案を一つ片付けてみてください。",
      "朝の数分で、今の目標を紙に書き出してみてください。",
      "迷ったときは、信頼できる人に一言相談してみてください。"
    ],
    rev: [
      "予定を一つ減らし、休息の時間を確保してください。",
      "大事な判断は、一晩置いてから決めてください。",
      "焦りを感じたら、やるべきことを一つに絞ってください。"
    ]
  },
  love: {
    up: [
      "気持ちを、言葉で一度はっきり伝えてみてください。",
      "相手の好きなことを尋ね、会話の時間を増やしてみてください。",
      "感謝の言葉を、照れずに直接伝えてみてください。"
    ],
    rev: [
      "相手に期待しすぎず、自分の気持ちを整理してください。",
      "返信を急がず、落ち着いてから言葉を選んでください。",
      "一人の時間を大切にし、自分を満たすことを優先してください。"
    ]
  },
  work: {
    up: [
      "今の役割を見直し、伸ばしたい強みを一つ決めてください。",
      "締め切りの前に、進捗を上司や同僚と共有してください。",
      "新しい仕事に、小さく挑戦する機会を一つ作ってください。"
    ],
    rev: [
      "作業の優先順位を一つに絞り、残りは後回しにしてください。",
      "一度手を止めて、やり方に無理がないか振り返ってください。",
      "困っていることを、早めに周囲へ相談してください。"
    ]
  },
  money: {
    up: [
      "今月の収入と支出を、一度書き出して確認してください。",
      "将来のための積み立てを、無理のない金額で始めてみてください。",
      "興味のある分野の学びに、適切な予算を使ってみてください。"
    ],
    rev: [
      "欲しいものは、三日たってからもう一度考えてください。",
      "契約や支払いの内容を、もう一度確認してください。",
      "無駄な定期的な支払いがないか、点検してください。"
    ]
  },
  people: {
    up: [
      "最近連絡の取れていない人に、近況を尋ねるメッセージを送ってください。",
      "相手の話を最後まで聞き、要点を言い直してみてください。",
      "身近な人に、感謝を言葉にして伝えてください。"
    ],
    rev: [
      "誤解がありそうな相手には、思い込まずに直接確かめてください。",
      "言いたいことは、感情が落ち着いてから伝えてください。",
      "無理に付き合わず、心地よい距離を保つことも大切です。"
    ]
  }
};

const TAROT_THEME_CLOSERS = {
  overall: "全体の流れを信じ、一歩ずつ丁寧に進んでください。",
  love: "相手の気持ちと自分の気持ちを、どちらも大切にしてください。",
  work: "目の前の仕事を積み重ねることが、次の評価につながります。",
  money: "お金の流れを見える形にすることが、安心の土台になります。",
  people: "相手の立場を想像しながら、言葉を選んでください。"
};

// カードの識別子（鑑定データのキー）
function tarotCardId(card) {
  if (card.type === "major") {
    return `major-${pad2(MAJOR.findIndex(m => m[0] === card.name))}`;
  }
  return `minor-${card.suit}-${pad2(card.rank)}`;
}

// テーマ別の鑑定文（データがない場合は null）
function tarotThemeText(card, theme, reversed) {
  const data = TAROT_DATA[tarotCardId(card)];
  if (!data) return null;
  return data[reversed ? "rev" : "up"][theme] ?? null;
}

// 3枚の関連性
function buildTarotRelation(picks) {
  const lines = [];
  const majorCount = picks.filter(c => c.type === "major").length;
  const reversedCount = picks.filter(c => c.reversed).length;
  const suitCounts = {};
  picks.forEach(c => { if (c.suit) suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; });
  const dominant = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];

  if (majorCount === 3) {
    lines.push("三枚すべてが大アルカナで、人生の大きな流れを示す配置です。");
  } else if (majorCount === 2) {
    lines.push("大アルカナが二枚含まれ、出来事の意味が深く響き合っています。");
  } else if (dominant && dominant[1] >= 2) {
    lines.push(`${TAROT_SUIT_LABELS[dominant[0]]}のカードが重なっており、テーマが一貫しています。`);
  } else {
    lines.push("三枚はそれぞれ異なるテーマを持ち、順番に流れが移り変わる配置です。");
  }

  const reversedLines = [
    "三枚とも正位置で、エネルギーが素直に流れています。",
    "逆位置が一枚あり、そこに意識を向けると流れが整います。",
    "逆位置が二枚あり、内面の調整が鍵になります。",
    "三枚とも逆位置で、焦らず立て直す時期を示しています。"
  ];
  lines.push(reversedLines[reversedCount]);

  lines.push(`${picks[0].name}から${picks[1].name}へ、流れが移り変わっています。`);
  lines.push(`その流れは、${picks[2].name}が示す未来へとつながっていきます。`);
  return lines;
}

// 鑑定全体のまとめ（1枚引き・3枚引き共通）
function buildTarotResultSummary(picks, theme) {
  const isThree = picks.length === 3;
  const lines = [];
  if (isThree) {
    lines.push(pickRandom(OPENERS));
    lines.push(...buildTarotRelation(picks));
  } else {
    const c = picks[0];
    lines.push(`${c.name}（${c.reversed ? "逆位置" : "正位置"}）が、${TAROT_THEMES[theme].label}の今の流れを映しています。`);
  }

  const reversedCount = picks.filter(c => c.reversed).length;
  const tone = reversedCount * 2 >= picks.length ? "rev" : "up";
  const actions = shuffle(TAROT_ACTIONS[theme][tone]).slice(0, 2);

  let html = `<strong>【${isThree ? "総合鑑定" : "一枚の鑑定"}】</strong>`;
  html += lines.map(l => `<p>${escapeHtml(l)}</p>`).join("");
  html += `<p><strong>${TAROT_THEMES[theme].label}に向けた具体的な行動：</strong></p>`;
  html += actions.map(a => `<p>・${escapeHtml(a)}</p>`).join("");
  html += `<p>${escapeHtml(TAROT_THEME_CLOSERS[theme])}</p>`;
  return html;
}

// カードの表示（既存のフリップ演出を使用）
function renderTarotReading(picks, theme, question) {
  clearTarotTimers();
  const count = picks.length;
  const positions = count === 3 ? TAROT_POSITIONS_3 : ["今の状況"];
  const sigils = shuffle(PLANET_SIGILS).slice(0, count);

  let html = `<p class="small">テーマ：${TAROT_THEMES[theme].label}（${count === 3 ? "3枚引き" : "1枚引き"}）</p>`;
  if (question) html += `<p><strong>質問：</strong>${escapeHtml(question)}</p>`;

  picks.forEach((c, i) => {
    const core = c.reversed ? c.rev : c.up;
    const themeText = tarotThemeText(c, theme, c.reversed);
    html += `
      <div class="tarot-slot shuffling" id="slot-${i}">
        <div class="position">${positions[i]}</div>
        <div class="tarot-flip">
          <div class="face front">
            <div class="name">${c.name}
              <span class="orientation ${c.reversed ? "reversed-label" : "upright"}">${c.reversed ? "逆位置" : "正位置"}</span>
            </div>
            <div class="card-art ${c.reversed ? "art-rev" : ""}">${cardArtHtml(c)}</div>
            <p>${escapeHtml(core)}</p>
            ${themeText ? `<p><strong>${TAROT_THEMES[theme].label}の鑑定：</strong>${escapeHtml(themeText)}</p>` : ""}
          </div>
          <div class="face back" style="--sigil: '${sigils[i]}'"></div>
        </div>
      </div>`;
  });

  html += `<div class="summary pending" id="tarotSummary">${buildTarotResultSummary(picks, theme)}</div>`;
  document.getElementById("tarotResult").innerHTML = html;

  tarotTimers.push(setTimeout(() => {
    picks.forEach((_, i) => {
      tarotTimers.push(setTimeout(() => {
        const slot = document.getElementById(`slot-${i}`);
        slot.classList.remove("shuffling");
        slot.querySelector(".tarot-flip").classList.add("flipped");
      }, i * 700));
    });
    tarotTimers.push(setTimeout(() => {
      const s = document.getElementById("tarotSummary");
      s.classList.remove("pending");
      s.classList.add("reveal");
    }, picks.length * 700 + 600));
  }, 1000));
}

// 引き方（ランダム／自分で選ぶ）
function startTarot() {
  clearTarotTimers();
  const question = document.getElementById("question").value.trim();
  const theme = document.getElementById("tarotTheme").value;
  const count = Number(document.getElementById("tarotCount").value);
  const selfPick = document.getElementById("tarotSelfPick").checked;

  if (!selfPick) {
    const picks = shuffle(DECK).slice(0, count).map(c => ({ ...c, reversed: Math.random() < 0.5 }));
    return renderTarotReading(picks, theme, question);
  }

  const deck = shuffle(DECK);
  const chosen = [];
  document.getElementById("tarotResult").innerHTML = `
    <p class="small" id="pickStatus">カードを${count}枚選んでください。</p>
    <div class="tarot-pick-grid" id="pickGrid">
      ${deck.map((_, i) => `<button type="button" class="tarot-pick" data-i="${i}">✦</button>`).join("")}
    </div>`;

  document.getElementById("pickGrid").addEventListener("click", e => {
    const btn = e.target.closest(".tarot-pick");
    if (!btn || btn.classList.contains("chosen")) return;
    chosen.push(Number(btn.dataset.i));
    btn.classList.add("chosen");
    if (chosen.length === count) {
      const picks = chosen.map(idx => ({ ...deck[idx], reversed: Math.random() < 0.5 }));
      renderTarotReading(picks, theme, question);
    } else {
      document.getElementById("pickStatus").textContent = `あと${count - chosen.length}枚選んでください。`;
    }
  });
}

// 自分でカードを選ぶときの見た目
(function injectTarotStyle() {
  const style = document.createElement("style");
  style.textContent = `
    .tarot-pick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(48px, 1fr)); gap: 8px; margin: 14px 0; }
    .tarot-pick {
      aspect-ratio: 2 / 3; padding: 0; margin: 0; border-radius: 8px;
      border: 1px solid rgba(255, 217, 138, 0.5); color: #ffd98a; font-size: 16px; box-shadow: none;
      background: radial-gradient(circle at 50% 40%, #4a3a8a, #1c1440 70%);
    }
    .tarot-pick:hover { transform: none; box-shadow: 0 0 12px rgba(255, 217, 138, 0.5); }
    .tarot-pick.chosen { opacity: 0.3; cursor: default; box-shadow: none; }
  `;
  document.head.appendChild(style);
})();

// 引く枚数・テーマ・自分で選ぶ設定を追加し、ボタンを新しい処理に付け替える
(function setupTarotPro() {
  const btn = document.getElementById("drawBtn");

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <label for="tarotTheme">占いのテーマ</label>
    <select id="tarotTheme" style="width:100%;padding:10px 12px;font-size:16px;font-family:inherit;color:#ece6ff;background:rgba(10,8,30,0.6);border:1px solid rgba(255,217,138,0.3);border-radius:10px;margin-bottom:14px;">
      <option value="overall">総合運</option>
      <option value="love">恋愛</option>
      <option value="work">仕事</option>
      <option value="money">金運</option>
      <option value="people">人間関係</option>
    </select>
    <label for="tarotCount">引く枚数</label>
    <select id="tarotCount" style="width:100%;padding:10px 12px;font-size:16px;font-family:inherit;color:#ece6ff;background:rgba(10,8,30,0.6);border:1px solid rgba(255,217,138,0.3);border-radius:10px;margin-bottom:14px;">
      <option value="1">1枚引き</option>
      <option value="3" selected>3枚引き（過去・現在・未来）</option>
    </select>
    <label style="display:flex;align-items:center;color:var(--mist);margin:10px 0;cursor:pointer;">
      <input type="checkbox" id="tarotSelfPick" style="width:auto;margin:0 8px 0 0;">
      自分でカードを選ぶ
    </label>`;
  btn.parentNode.insertBefore(wrap, btn);

  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);
  newBtn.addEventListener("click", startTarot);
})();