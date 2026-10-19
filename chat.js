/* Goa 2027 trip bot widget — calls the goa-bot Supabase edge function (Gemini key stays server-side). */
(function () {
  var FN = 'https://ufiggucmbbjmlhjpcerz.supabase.co/functions/v1/goa-bot';
  if (window.__goaBotInit) return; window.__goaBotInit = true;

  var css = ''
  + '#goa-chat-btn{position:fixed;bottom:16px;right:16px;z-index:9000;border:none;cursor:pointer;'
  + 'background:linear-gradient(135deg,#ff5fa2,#a855f7);color:#fff;font-size:15px;font-weight:700;'
  + 'border-radius:999px;padding:12px 18px;box-shadow:0 4px 18px rgba(168,85,247,.45);display:flex;align-items:center;gap:8px;font-family:inherit}'
  + '#goa-chat-btn:active{transform:scale(.96)}'
  + '#goa-chat-panel{position:fixed;bottom:78px;right:16px;z-index:9000;width:min(360px,calc(100vw - 32px));'
  + 'height:min(480px,calc(100dvh - 120px));display:none;flex-direction:column;overflow:hidden;'
  + 'background:rgba(24,10,46,.97);border:1px solid rgba(255,255,255,.14);border-radius:18px;'
  + 'box-shadow:0 12px 40px rgba(0,0,0,.55);direction:rtl;font-family:inherit}'
  + '#goa-chat-panel.open{display:flex}'
  + '#goa-chat-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;'
  + 'background:linear-gradient(135deg,rgba(255,95,162,.25),rgba(168,85,247,.25));border-bottom:1px solid rgba(255,255,255,.1)}'
  + '#goa-chat-head b{color:#fff;font-size:15px}'
  + '#goa-chat-close{background:none;border:none;color:#cbb6e8;font-size:20px;cursor:pointer;line-height:1;padding:2px 6px}'
  + '#goa-chat-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}'
  + '.gcb-msg{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word}'
  + '.gcb-bot{align-self:flex-start;background:rgba(255,255,255,.08);color:#f3ecff;border-bottom-left-radius:4px}'
  + '.gcb-user{align-self:flex-end;background:linear-gradient(135deg,#ff5fa2,#a855f7);color:#fff;border-bottom-right-radius:4px}'
  + '.gcb-badge{align-self:flex-start;font-size:11px;color:#ffd28a;background:rgba(255,190,80,.12);'
  + 'border:1px solid rgba(255,190,80,.35);border-radius:8px;padding:2px 8px}'
  + '.gcb-dots{align-self:flex-start;color:#cbb6e8;font-size:18px;letter-spacing:2px;padding:4px 12px}'
  + '#goa-chat-inputrow{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(255,255,255,.1);align-items:center}'
  + '#goa-chat-input{flex:1;box-sizing:border-box;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:12px;'
  + 'color:#fff;font-size:14px;padding:10px 12px;outline:none;font-family:inherit;resize:none;height:42px}'
  + '#goa-chat-send{box-sizing:border-box;height:42px;background:linear-gradient(135deg,#ff5fa2,#a855f7);border:none;color:#fff;font-weight:700;'
  + 'border-radius:12px;padding:0 16px;cursor:pointer;font-size:14px;font-family:inherit}'
  + '#goa-chat-send:disabled{opacity:.5;cursor:default}'
  + '#goa-chat-note{padding:7px 12px 9px;font-size:10.5px;color:#9d8ac0;line-height:1.4;border-top:1px solid rgba(255,255,255,.06)}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'goa-chat-btn'; btn.type = 'button';
  btn.setAttribute('aria-label', 'פתחו את בוט הטיול');
  btn.innerHTML = '<span style="font-size:18px">🦚</span><span>שאלו את הבוט</span>';

  var panel = document.createElement('div');
  panel.id = 'goa-chat-panel';
  panel.innerHTML = ''
    + '<div id="goa-chat-head"><b>בוט גואה 2027 🦚</b><button id="goa-chat-close" type="button" aria-label="סגירה">✕</button></div>'
    + '<div id="goa-chat-msgs"></div>'
    + '<div id="goa-chat-inputrow"><textarea id="goa-chat-input" maxlength="400" rows="1" placeholder="שאלו שאלה על הטיול…"></textarea>'
    + '<button id="goa-chat-send" type="button">שלח</button></div>'
    + '<div id="goa-chat-note">מופעל ע״י Google Gemini (חינמי). השאלות נשלחות ל-Google Gemini ועשויות לשמש לשיפור מוצרי Google. אל תכתבו פרטים אישיים. הסינון והגבלת הקצב הם בסיסיים בלבד · תשובות מסומנות ⚠️ לא מאומת הן מחוץ למידע האתר.</div>';

  document.body.appendChild(btn); document.body.appendChild(panel);

  var msgs = panel.querySelector('#goa-chat-msgs');
  var input = panel.querySelector('#goa-chat-input');
  var send = panel.querySelector('#goa-chat-send');
  var busy = false;

  function addMsg(text, who) {
    var d = document.createElement('div');
    d.className = 'gcb-msg ' + (who === 'user' ? 'gcb-user' : 'gcb-bot');
    d.textContent = text;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function addBadge() {
    var d = document.createElement('div');
    d.className = 'gcb-badge'; d.textContent = '⚠️ לא מאומת — מחוץ למידע האתר';
    msgs.appendChild(d);
  }

  btn.addEventListener('click', function () {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !msgs.children.length) {
      addMsg('היי! אני הבוט של הטיול 🌴 שאלו אותי על לינה, אוכל, אטרקציות, ויזה — על הכל.', 'bot');
      input.focus();
    }
  });
  panel.querySelector('#goa-chat-close').addEventListener('click', function () { panel.classList.remove('open'); });

  async function ask() {
    var q = input.value.trim();
    if (!q || busy) return;
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(q) || /(?:\+?\d[\s().-]*){7,}/.test(q) || /\b[A-Z]{1,3}\d{6,9}\b/i.test(q)) {
      addMsg('הסירו מהשאלה מספרי טלפון, כתובות אימייל או מספרי מסמכים. השאלה לא נשלחה.', 'bot'); return;
    }
    busy = true; send.disabled = true;
    addMsg(q, 'user'); input.value = '';
    var dots = document.createElement('div');
    dots.className = 'gcb-dots'; dots.textContent = '•••';
    msgs.appendChild(dots); msgs.scrollTop = msgs.scrollHeight;
    try {
      var res = await fetch(FN, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ q: q }),
      });
      var data = await res.json();
      dots.remove();
      var ans = String(data && data.answer || 'לא הצלחתי לענות. נסו שוב 🙂');
      if (data && data.grounded === false) {
        ans = ans.replace(/^⚠️\s*לא מאומת[.:]?\s*/, '');
        addBadge();
      }
      addMsg(ans, 'bot');
    } catch (e) {
      dots.remove();
      addMsg('אופס, התחברות נכשלה. נסו שוב בעוד רגע 🙂', 'bot');
    }
    busy = false; send.disabled = false; input.focus();
  }
  send.addEventListener('click', ask);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); }
  });
})();
