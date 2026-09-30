const source = `月日は百代の過客にして、行きこう年もまた旅人なり。舟の上に生涯を浮かべ、馬の口とらえて老いを迎うる物は、日々旅にして旅をすみかとす。古人も多く旅に死せるあり。予もいづれの年よりか、片雲の風にさそわれて、漂白の思いやまず、海浜にさすらえて、去年（こぞ）の秋、江上（こうしょう）の破屋（はおく）に蜘蛛の古巣をはらいて、やや年も暮れ、春たてる霞の空に、白河の関越えんと、そぞろ神の物につきて心をくるわせ、道祖神の招きにあいて、取るもの手につかず、股引（ももひき）の破れを綴り、笠の緒付けかえて、三里に灸すゆるより、松島の月まづ心にかかりて、住めるかたは人に譲りて、杉風（こんぷう）が別しょに移るに、草の戸も、住み替わる代ぞ、雛の家、面八句を庵の柱に懸け置く。
三代の栄輝（えよう）一睡（いっすい）のうちにして、大門の跡は一里こなたにあり。秀衡（ひでひら）が跡は田野になりて、金鶏山（きんけいざん）のみ形を残す。まず、高館（たかだち）に登れば、北上川、南部より流るる大河なり。衣川は、和泉が城をめぐりて、高館の下（もと）にて大河に落ち入る。泰衡らが旧跡は、衣が関を隔てて南部口をさし固め、夷（えぞ）を防ぐと見えたり。さても義臣すぐってこの城に籠もり、功名一時の草むらとなる。国破れて山河あり、城春にして草青みたりと笠打ち敷きて、時のうつるまで涙を落としはべりぬ。夏草や、兵どもが、夢の跡、卯の花に、兼房見ゆる、白毛かな、曾良、かねて耳驚かしたるニ堂開帳（にどうかいちょう）す。経堂（きょうどう）は三将（さんしょう）の像を残し、光堂（ひかりどう）は三代の棺を納め、三尊（さんぞん）の仏を安置す。七宝（しっぽう）散り失せて、玉（ぎょく）の扉風に破れ、金（こがね）の柱（はしら）霜雪（そうせつ）に朽ちて、既に頽廃空虚（たいはいくうきょ）の草むらとなるべきを、四面（しめん）新たに囲みて、甍（いらか）を覆いて風雨を凌ぎ、しばらく千歳の記念（かたみ）とはなれり。五月雨（さみだれ）の、降り残してや、光堂（ひかりどう）`;
const paragraphs = source.split('\n');
const segments = [];
paragraphs.forEach((text, paragraphIndex) => {
  text.split(/(?<=[、。])/u).filter(Boolean).forEach((chunk) => {
    const body = chunk.replace(/[、。]$/u, '').trim();
    if (body) segments.push({ text: body, paragraphIndex });
  });
});
const escapeHtml = (value) => value.replace(/[&<>"']/gu, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function ruby(text) { return escapeHtml(text).replace(/([^（）]+?)（([^（）]+)）/gu, '<ruby>$1<rt>$2</rt></ruby>'); }
const key = 'oku-no-hosomichi-study-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
let mastered = new Set(saved.mastered || []), review = new Set(saved.review || []), index = 0, soundOn = saved.soundOn !== false, seconds = 240, timer = null;
const $ = (id) => document.getElementById(id), pad = (n) => String(n).padStart(2, '0');
function persist() { localStorage.setItem(key, JSON.stringify({ mastered: [...mastered], review: [...review], soundOn })); }
function speak(text) { if (!soundOn || !('speechSynthesis' in window)) return; speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'ja-JP'; utterance.rate = .86; speechSynthesis.speak(utterance); }
function select(i) {
  index = Math.max(0, Math.min(segments.length - 1, i)); const item = segments[index];
  $('answer-text').hidden = true; $('hint-text').hidden = false; $('self-grade').hidden = true; $('recall-input').value = ''; $('check-feedback').textContent = '';
  $('answer-text').innerHTML = ruby(item.text); $('progress-number').textContent = pad(index + 1); $('progress-fill').style.width = ((index + 1) / segments.length * 100) + '%';
  $('paragraph-chip').textContent = item.paragraphIndex ? '平泉' : '序章'; $('progress-total').textContent = segments.length; $('total-count').textContent = segments.length;
  $('prev-button').disabled = !index; $('next-button').disabled = index === segments.length - 1;
  $('mastery-label').textContent = mastered.has(index) ? '習得済み ✓' : review.has(index) ? '復習でもう一度' : '声に出してみよう';
  $('streak-label').textContent = '今日の正解　' + mastered.size + '節';
}
function reveal() { $('hint-text').hidden = true; $('answer-text').hidden = false; $('self-grade').hidden = false; speak(segments[index].text); }
function grade(got) { if (got) { mastered.add(index); review.delete(index); } else { mastered.delete(index); review.add(index); } persist(); if (index < segments.length - 1) select(index + 1); else renderReview(); }
function mode(name) {
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === name));
  $('learn-panel').hidden = name !== 'learn'; $('recite-panel').hidden = name !== 'recite'; $('review-panel').hidden = name !== 'review';
  if (name === 'review') renderReview();
}
function renderReview() {
  $('review-count').textContent = review.size + '節';
  $('review-list').innerHTML = review.size ? [...review].sort((a,b)=>a-b).map((i)=>'<div class="review-item"><div class="review-item-text">'+ruby(segments[i].text)+'</div><button data-open="'+i+'">練習する →</button></div>').join('') : '<div class="empty-review">復習する節はまだありません。<br>一節ずつ練習して「もう一度」を選ぶと、ここに追加されます。</div>';
}
document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => mode(tab.dataset.mode)));
$('reveal-button').addEventListener('click', reveal);
$('self-grade').addEventListener('click', (e) => { const b = e.target.closest('[data-grade]'); if (b) grade(b.dataset.grade === 'gotit'); });
$('prev-button').addEventListener('click', () => select(index - 1)); $('next-button').addEventListener('click', () => select(index + 1));
$('recall-form').addEventListener('submit', (e) => {
  e.preventDefault(); const clean = (s) => s.replace(/[\s、。，．,.]/gu, '');
  const ok = clean($('recall-input').value) === clean(segments[index].text), f = $('check-feedback');
  f.textContent = ok ? 'ぴったり！声にも出して、答えを見比べてみよう。' : '少し違うところがあるみたい。答えを開いて確かめよう。';
  f.className = 'feedback' + (ok ? '' : ' wrong');
  if (ok) { mastered.add(index); review.delete(index); persist(); $('mastery-label').textContent = '習得済み ✓'; $('streak-label').textContent = '今日の正解　' + mastered.size + '節'; }
});
function updateTimer() { $('timer-display').textContent = pad(Math.floor(seconds / 60)) + ':' + pad(seconds % 60); $('timer-display').classList.toggle('urgent', seconds <= 30); $('timer-fill').style.width = seconds / 240 * 100 + '%'; }
$('timer-start').addEventListener('click', () => {
  if (seconds === 0) seconds = 240;
  if (timer) { clearInterval(timer); timer = null; $('timer-start').innerHTML = '再開する <span>→</span>'; $('timer-message').textContent = '一時停止中。準備ができたら再開しよう。'; return; }
  $('full-text').hidden = true; $('fulltext-toggle').disabled = true; $('fulltext-toggle').textContent = '暗唱中は本文を表示できません';
  $('timer-start').innerHTML = '一時停止 <span>Ⅱ</span>'; $('timer-message').textContent = '落ち着いて、最初の一節から。';
  timer = setInterval(() => { seconds--; updateTimer(); if (seconds <= 0) { clearInterval(timer); timer = null; $('timer-start').textContent = 'もう一度挑戦'; $('timer-message').textContent = '4分終了。どこまで言えたか、本文を開いて確認しよう。'; $('fulltext-toggle').disabled = false; $('fulltext-toggle').innerHTML = '本文を表示して確認 <span>↓</span>'; } }, 1000);
});
$('timer-reset').addEventListener('click', () => { clearInterval(timer); timer = null; seconds = 240; updateTimer(); $('fulltext-toggle').disabled = false; $('fulltext-toggle').innerHTML = '本文を表示して確認 <span>↓</span>'; $('timer-start').innerHTML = '暗唱を始める <span>→</span>'; $('timer-message').textContent = '準備ができたら、スタート。'; });
$('fulltext-toggle').addEventListener('click', () => {
  const pane = $('full-text'); pane.hidden = !pane.hidden; $('fulltext-toggle').innerHTML = pane.hidden ? '本文を表示して確認 <span>↓</span>' : '本文を閉じる <span>↑</span>';
  if (!pane.hidden) pane.innerHTML = paragraphs.map((p) => '<p>'+ruby(p)+'</p>').join('');
});
$('review-list').addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) { select(Number(b.dataset.open)); mode('learn'); window.scrollTo({top:0,behavior:'smooth'}); } });
$('sound-toggle').textContent = soundOn ? '🔊' : '🔇'; $('sound-toggle').addEventListener('click', () => { soundOn = !soundOn; $('sound-toggle').textContent = soundOn ? '🔊' : '🔇'; persist(); if (!soundOn && 'speechSynthesis' in window) speechSynthesis.cancel(); });
$('reset-progress').addEventListener('click', () => { if (!confirm('暗唱の進捗と復習リストをリセットしますか？')) return; mastered.clear(); review.clear(); persist(); select(index); });
select(0); updateTimer();
