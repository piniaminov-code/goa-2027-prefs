/* Pini Tours: individual questionnaires. No previous answers are embedded. */
(function(){
'use strict';
const families=[
{id:'aminov',name:'אמינוב',people:[['pini','פיני',0],['shani','שני',0],['lian','ליאן',11],['agam','אגם',8],['mia','מיה',5]]},
{id:'teper',name:'טפר',people:[['liran','לירן',0],['yafit','יפית',0],['asaf','אסף',11],['guy-teper','גיא',9],['roi','רועי',7]]},
{id:'greenwald',name:'גרינולד',people:[['guy-greenwald','גיא',0],['renana','רננה',0],['emily','אמילי',11],['ella','אלה',7]]}
];
const q=(id,text,choices,help)=>({id,text,choices,help});
const adult=[
['הטיול שבאמת רוצים',[
q('memory','בעוד עשר שנים, איזה רגע מהטיול היית רוצה שהמשפחה עדיין תספר עליו?'),
q('you','איזה דבר היית רוצה לעשות בשביל עצמך, גם אם הוא לא הבחירה של שאר הקבוצה?'),
q('past','איזו חופשה קודמת הייתה הצלחה בשבילך, ומה בדיוק עבד בה? ומה לא רוצים לשחזר?'),
q('dream','בחרו שני דברים ששווה להתאמץ בשבילם, ודבר אחד שקל לוותר עליו.',['טבע','חוף ובריכה','אוכל מיוחד','תרבות ומפגש מקומי','שופינג','בילוי ערב','זמן משפחתי','מנוחה']),
q('surprise','כמה מקום להשאיר להפתעות, ומה חשוב לדעת מראש?',['להפתיע אותי','הפתעות קטנות בלבד','לדעת מראש מה התוכנית'])]],
['המשפחה והקצב',[
q('children','לכל ילד או ילדה שלכם: מה הכי ישמח אותם, מה עלול להציף אותם, ומה עוזר כשנגמר הכוח?','', 'אין צורך באבחנות או במידע רפואי. רק התאמות מעשיות לתכנון.'),
q('morning','מתי הבוקר באמת יכול להתחיל בחופשה, ועד מתי מתאים להישאר בחוץ בערב?'),
q('pace','בשבוע טיפוסי, כמה ימי יציאה וכמה ימי מנוחה יתאימו לכם? וכמה זמן מזגן/בריכה צריך בצהריים?'),
q('drive','מה גבול הנסיעה הנוח ברצף וביום שלם, והאם יש רגישות לנסיעות או לשייט שצריך להתחשב בה?'),
q('separate','מתי תרצו זמן משפחתי נפרד, זמן זוגי או זמן לעצמכם? ואילו רגעים חייבים לחוות עם כולם?'),
q('supervision','בבילוי מבוגרים או במועדון ילדים, איזה סידור השגחה מקובל עליכם? בלי להניח שמישהו אחר שומר.')]],
['לינה, אוכל וכסף',[
q('room','מעבר לדלת מקשרת מובטחת בכתב: מה חלוקת המיטות, שעות השינה והשקט שצריך? האם יחידה עם חדרי שינה נפרדים היא אפשרות שתרצו לבדוק?'),
q('lodging','מה קודם כשצריך לבחור: רמת הריזורט, חוף בהליכה, מועדון ילדים, בריכה, או קרבה לשאר המשפחות? דרגו שלושה.'),
q('budget','באיזה טווח בשקלים נוח לכם ללילה לכל המשפחה, ומה התקרה הכוללת לקרקע, בלי הטיסות שכבר הוזמנו? אפשר לכתוב טווח או לבקש לדבר בפרטי.'),
q('splurge','על איזה רגע מיוחד תהיו מוכנים להוסיף כסף, ואיפה דווקא תרצו לחסוך?'),
q('cancel','מה חשוב לכם בתנאי ביטול, מקדמות ותשלום מראש? המחיר לבדו לא יכריע.'),
q('food','אילו מנות באמת יעבדו לכל ילד, כמה הרפתקה קולינרית מתאימה למבוגרים, והאם צריך שתי אפשרויות באותה ארוחה?'),
q('food-private','האם יש הגבלת מזון שדורשת בירור אישי לפני הזמנה?',['לא ידוע על משהו נוסף','כן, לדבר איתי בפרטי'], 'אל תכתבו כאן אבחנות, תרופות או פירוט אלרגיות. מידע בטיחותי נברר ישירות לפני בחירת ספק.')]],
['חוויות, גבולות וזיכרונות',[
q('water','למי מתאימים ים, בריכה ושייט, ומי צריך חלופה יבשתית או השגחה צמודה? אין כאן אישור לפעילות מים.'),
q('activity','מבין טבע, מפלים, שייט, שוק, סדנה, תרבות ובילוי שקיעה: מה שני הדברים שהכי חשובים לך, ומה בשום אופן לא?'),
q('seder','מה מתאים לכם בערב הסדר: ארוחה עם כל הקבוצה, חב״ד אם יתאים, ארוחה משפחתית אחרת, או תוכנית פתוחה?'),
q('access','האם צריך התאמה להליכה, מדרגות, חום, רעש או נגישות? אפשר רק לבקש שיחה פרטית, בלי לפרט כאן.'),
q('airport','בלילה בדלהי, מה יעזור לכם להתאפס לפני טיסת ההמשך: אוכל, שינה מוקדמת, ארוחת בוקר או מינימום הליכה?'),
q('memories','איך היית רוצה לשמור זיכרונות: אלבום, סרטון, יומן ילדים, שיר, צילום משפחתי או בלי מצלמה כל הזמן? מה לא מצלמים ולא משתפים?'),
q('group','כשלא כולם רוצים אותו דבר, מה נוח לך: להתפצל בלי רגשות אשם, להצביע, או לקבוע כמה עוגנים משותפים מראש?'),
q('private','יש משהו שמשפיע על התכנון שתרצו לספר רק לפיני? אפשר לכתוב רק "לדבר איתי", בלי לפרט כאן.')]]
];
const specific={
pini:q('personal','פיני, מה יהפוך את הטיול להצלחה גם בשבילך, מעבר לכך שכולם יהיו מרוצים? ומה היית רוצה לא לנהל בעצמך?'),
shani:q('personal','שני, בלי לבחור צפון או דרום לפני שאת מכירה את המקומות: איך נראה היום המושלם שלך, מהבוקר ועד הלילה?'),
liran:q('personal','לירן, כדי לדייק את הרצון בטבע בלי להפוך את החופשה למסע: מה מושך אותך יותר, הליכה קלה, מפלים, בעלי חיים בתצפית או מפגש מקומי?'),
yafit:q('personal','יפית, מה חשוב לך באופן אישי שאולי לא נכנס לתשובה המשפחתית, ואיזה שילוב בין זמן עם הבנים לזמן לעצמך ישמח אותך?'),
'guy-greenwald':q('personal','גיא, איך ייראה יום עם מספיק אקשן אבל בלי לוח זמנים צפוף ונסיעות ארוכות? מה יהיה העוגן היחיד שלו?'),
renana:q('personal','רננה, איך היית רוצה לציין אירוע אישי בחופשה: ערב אינטימי, חגיגה עם כולם, חוויה מיוחדת, או בלי תשומת לב גדולה? מה ממש לא מתאים לך?')};
function children(p){let [id,name,age]=p;let young=age<=5,small=age<=7;let opening=young?'ממלאים עם מבוגר שקורא, ואת בוחרת. אפשר גם להגיד בקול והמבוגר יכתוב.':small?'אפשר לבקש ממבוגר לקרוא ולעזור לכתוב. אין תשובות לא נכונות.':'זה השאלון שלך, לא של ההורים. אפשר לדלג על כל שאלה.';
let list=young?[
q('wish','מיה, מה הכי בא לך בחופשה?',['בריכה','חול וים','גלידה','סירה עם המשפחה','לשחק']),
q('happy','מה גורם לך לחייך? אפשר לבחור שניים.',['משחק','ריקוד','סיפור','לצייר','חיבוק']),
q('food','איזה אוכל מוכר וטעים לך?'),q('tired','כשאת עייפה, מה יעזור?',['לנוח עם הורה','שקט','סיפור','משהו לאכול','צעצוע מהבית']),
q('no','יש משהו שלא בא לך לעשות? אפשר להגיד למבוגר.'),q('together','עם מי תרצי לשחק ומה תרצו לשחק ביחד?'),q('magic','אם היית בוחרת רגע קסום אחד לחופשה, מה הוא היה?')
]:[
q('wish',name+', איזה דבר אחד יהפוך את הטיול הזה לממש שלך?'),
q('choose','אילו שלושה דברים הכי בא לך לעשות?',['בריכה','ים וחול','סירה ותצפית בדולפינים','טבע ומפלים','סדנת בישול או יצירה','שוק וקניות','ספורט ומשחקים','זמן שקט']),
q('day',small?'מה יותר כיף לך: הרבה משחקים או גם זמן שקט באמצע?':'איך נראה יום מושלם שלך? כמה פעילות, כמה זמן חופשי, ומה לא חייבים להספיק?'),
q('new',small?'יש משהו חדש שתרצה או תרצי לנסות עם מבוגר לידך?':'מה מסקרן אותך בהודו, ואיזה דבר חדש היית מוכן או מוכנה לנסות בתנאים שנוחים לך?'),
q('food','מה בטוח תרצו לאכול, ומה אולי תסכימו לטעום?'),
q('rest',small?'איך מבוגר ידע שנמאס לך או שהתעייפת? ומה יעזור?':'מה עלול להרוס לך יום: נסיעות, חום, רעש, לחכות, לקום מוקדם או משהו אחר? מה עוזר לך?'),
q('water','מה כיף לך במים, וממה מעדיפים להימנע?',['בריכה ליד מבוגר','חול בלי להיכנס לים','סירה עם מבוגר','לא מתאים לי מים','רוצה לדבר עם ההורים']),
q('friends','עם מי בחבורה בא לך להיות, ואיזה משחק או משימה היית רוצה לעשות ביחד?'),
q('own',small?'איזה משחק או חפץ קטן תרצו להביא מהבית?':'מתי בא לך זמן משלך, ומה היית רוצה לבחור בעצמך במקום שמבוגרים יחליטו?'),
q('remember',small?'מה תרצו לצלם או לצייר כדי לזכור את הטיול?':'איזה תפקיד כיפי היית רוצה: צילום, מוזיקה, יומן, חידון, לחפש מנה טעימה, או בלי תפקיד?'),
q('no','מה לא בא לך לעשות, גם אם אחרים מתלהבים? מותר להגיד לא.'),
q('secret','יש בקשה שרוצים לספר להורה או לפיני בשקט? אפשר רק לבחור.',['לא כרגע','כן, אדבר איתם'])
];
return {opening,sections:[['מה בא לי בחופשה',list.slice(0,small?4:6)],['כדי שיהיה לי טוב',list.slice(small?4:6)]]};}
function questionnaire(p){if(p[2])return children(p);return {opening:'כל מבוגר עונה בנפרד. מתחילים מההעדפות שכבר נמסרו, ומעמיקים במקום לחזור על טופס בסיסי. אפשר לדלג ולבקש שיחה פרטית.',sections:adult.map((s,i)=>[s[0],i===0?[specific[p[0]],...s[1]]:s[1]])};}
window.GoaPersonalQuestions={families,questionnaire};
})();

/* Existing write-only intake. No reads, updates, deletes, or local draft storage. */
(function(){
const endpoint="https://ufiggucmbbjmlhjpcerz.supabase.co/rest/v1/goa27_prefs",key="sb_publishable_bxXkuwmJ84zh3OhdGnEwyQ_Mbpo5mFf";
window.GoaQuestionnaireTransport=async function(record){
 const response=await fetch(endpoint,{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({id:record.id,name:record.payload.respondent,payload:record.payload})});
 if(response.ok)return;
 if(response.status===409){const error=await response.json();if(error.code==='23505'&&String(error.message).includes('goa27_prefs_pkey'))return;}
 throw new Error('submission-not-confirmed');
};
})();

(function(){
'use strict';
const {families,questionnaire}=window.GoaPersonalQuestions;
const root=document.createElement('section');root.id='personal-questionnaires';root.className='card personal-questions';
document.querySelector('main').prepend(root);
for(const id of ['surveybox','kidsbox']){const legacy=document.getElementById(id);if(legacy){legacy.hidden=true;legacy.style.display='none'}}
const style=document.createElement('style');style.textContent=`
body.pq-in-view #goa-chat-btn,body.pq-in-view #goa-music{display:none!important}.personal-questions{scroll-margin-top:20px}.pq-intro{color:#e3d9fa}.pq-tabs,.pq-people,.pq-choices{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.pq-tabs button,.pq-people button,.pq-choices button,.pq-nav button,.pq-private button{font:inherit;min-height:44px;cursor:pointer;border-radius:14px;border:1px solid #ffffff55;background:#ffffff0d;color:#fff;padding:10px 14px;overflow-wrap:anywhere}.pq-tabs button[aria-selected=true],.pq-people button[aria-pressed=true],.pq-choices button[aria-pressed=true]{background:#582a91;border-color:#19f0ff;color:#fff;font-weight:700}.pq-people button{flex:1 1 80px}.pq-notice{padding:14px;background:#ffffff0b;border:1px solid #ffffff33;border-radius:14px;font-size:14px;line-height:1.7}.pq-progress{margin:20px 0}.pq-progress progress{width:100%;height:8px;accent-color:#19f0ff}.pq-field{margin:24px 0;display:block}.pq-field>label{display:block;font-weight:700;line-height:1.6}.pq-field textarea{font-size:16px;min-height:90px}.pq-field small{display:block;color:#d2c2ef;margin:6px 0}.pq-nav{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0}.pq-nav button{flex:1 1 120px}.pq-nav .pq-primary{background:#622aa5;border-color:#b487ed;font-weight:700}.pq-nav button:disabled{opacity:.5;cursor:default}.pq-review{white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;line-height:1.8}.pq-private{border:1px solid #b487ed;border-radius:14px;padding:16px;background:#271244;margin:16px 0}.pq-private button{margin:5px}.pq-steps{font-size:14px;color:#dfc9ff}.pq-status{line-height:1.8;overflow-wrap:anywhere}.personal-questions button:focus-visible,.personal-questions a:focus-visible{outline:3px solid #19f0ff;outline-offset:3px}@media(max-width:360px){.pq-tabs button{flex:1 1 100%}.pq-tabs{gap:6px}.personal-questions{padding:16px 12px!important}}`;
document.head.append(style);
new IntersectionObserver(entries=>{document.body.classList.toggle('pq-in-view',entries[0].isIntersecting)},{threshold:0}).observe(root);
let family=null,person=null,step=0,answers={},dirty=false,sent=false,summaryShown=false,pending=null,submission=null;
function el(tag,text,props){let n=document.createElement(tag);if(text)n.textContent=text;Object.assign(n,props||{});return n}
function button(text,action){let n=el('button',text,{type:'button'});n.onclick=action;return n}
function clear(){answers={};dirty=false;sent=false;summaryShown=false;step=0;submission=null}
function requestSwitch(fn){if(dirty&&!sent){pending=fn;showDiscard();return}clear();fn();render()}
function showDiscard(){let old=root.querySelector('.pq-private');if(old)old.remove();let box=el('div',null,{className:'pq-private'});box.setAttribute('role','alert');box.append(el('strong','יש כאן תשובות שעוד לא נשלחו.'),el('p','אפשר להישאר ולשלוח, או לשמור קובץ אישי לפני המעבר. במעבר התשובות יימחקו מהמסך, כדי שהמשיב הבא לא יראה אותן.'));box.append(button('להישאר בשאלון',()=>{pending=null;box.remove()}),button('הורדת התשובות שלי',download),button('למחוק ולעבור',()=>{let go=pending;pending=null;clear();go();render()}));root.querySelector('.pq-body').prepend(box);box.scrollIntoView({behavior:'smooth',block:'center'})}
function summary(){let data=questionnaire(person);let lines=['פיני טורס | שאלון אישי',family.name+' | '+person[1]+' | '+(person[2]?'גיל בטיול: '+person[2]:'מבוגר/ת'),''];data.sections.forEach(s=>{lines.push(s[0]);s[1].forEach(item=>{let a=answers[item.id];lines.push(item.text+'\n'+(Array.isArray(a)?a.join(', '):a||'דילוג')+'\n')})});return lines.join('\n')}
function download(){let a=el('a');let u=URL.createObjectURL(new Blob(['\ufeff'+summary()],{type:'text/plain;charset=utf-8'}));a.href=u;a.download='goa-personal-answers.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function updateProgress(){let all=questionnaire(person).sections.flatMap(s=>s[1]),filled=all.filter(x=>{let v=answers[x.id];return Array.isArray(v)?v.length:typeof v==='string'&&v.trim()}).length;let t=root.querySelector('.pq-count');if(t)t.textContent=filled+' מתוך '+all.length+' שאלות קיבלו תשובה. אפשר לדלג.';let p=root.querySelector('progress');if(p){p.max=all.length;p.value=filled}}
function field(item,index){let wrap=el('div',null,{className:'pq-field'});let id='pq-'+person[0]+'-'+item.id;let label=el('label',(index+1)+'. '+item.text);label.htmlFor=id;wrap.append(label);if(item.help)wrap.append(el('small',item.help));if(Array.isArray(item.choices)){let choices=el('div',null,{className:'pq-choices'});choices.setAttribute('role','group');choices.setAttribute('aria-label',item.text);item.choices.forEach(c=>{let b=button(c,()=>{let old=Array.isArray(answers[item.id])?answers[item.id]:[];answers[item.id]=old.includes(c)?old.filter(x=>x!==c):[...old,c];submission=null;dirty=true;b.setAttribute('aria-pressed',String(answers[item.id].includes(c)));updateProgress()});b.setAttribute('aria-pressed',String((answers[item.id]||[]).includes(c)));choices.append(b)});wrap.append(choices)}else{let input=el('textarea',null,{id,maxLength:1800,value:answers[item.id]||'',placeholder:'אפשר לענות בקצרה, להרחיב או לדלג',autocomplete:'off'});input.oninput=()=>{answers[item.id]=input.value;submission=null;dirty=true;updateProgress()};wrap.append(input)}return wrap}
function render(){root.replaceChildren();root.append(el('h2','כל אחד והגואה שלו'),el('p','שלוש משפחות. ארבעה עשר קולות. טיול אחד שנבנה ממה שחשוב לכם באמת.',{className:'pq-intro'}));
let notice=el('p','אין כאן תשובות קודמות של אף אחד. הבחירה בשם אינה התחברות לחשבון. לא ממלאים מספרי מסמכים, כתובות או מידע רפואי. ילדים ממלאים עם הורה לפי הצורך.',{className:'pq-notice'});root.append(notice);
let tabs=el('div',null,{className:'pq-tabs'});tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','בחירת משפחה');families.forEach(f=>{let b=button('משפחת '+f.name,()=>requestSwitch(()=>{family=f;person=null}));b.setAttribute('role','tab');b.setAttribute('aria-selected',String(family===f));tabs.append(b)});root.append(tabs);
let body=el('div',null,{className:'pq-body'});body.setAttribute('role','tabpanel');root.append(body);
if(!family){body.append(el('p','בוחרים משפחה, ואז כל אחד בוחר את השם שלו וממלא בנפרד.'));return}
let people=el('div',null,{className:'pq-people'});people.setAttribute('aria-label','בחירת המשיב או המשיבה');family.people.forEach(p=>{let b=button(p[1],()=>requestSwitch(()=>person=p));b.setAttribute('aria-pressed',String(person===p));people.append(b)});body.append(people);
if(!person){body.append(el('p','מי רוצה לענות עכשיו? התשובות של האדם הקודם אינן נשמרות במכשיר הזה.'));return}
let data=questionnaire(person);body.append(el('h3',person[1]+' | '+(person[2]?'השאלון שלי, גיל '+person[2]+' בטיול':'השאלון האישי שלי')),el('p',data.opening));
let privacy=el('p','התשובות לא מופיעות באתר ולא נשמרות בדפדפן. הן יישלחו רק בלחיצה מפורשת. עד השליחה, רענון או סגירת העמוד ימחקו את הטיוטה.',{className:'pq-notice'});body.append(privacy);
let progress=el('div',null,{className:'pq-progress'});progress.append(el('span','',{className:'pq-count'}),el('progress'));body.append(progress);
if(sent){body.append(el('p','התשובות נשלחו. תודה! כדי לענות שוב מתחילים שאלון חדש.',{className:'pq-status'}));let nav=el('div',null,{className:'pq-nav'});nav.append(button('סיום ומחיקת התשובות מהמסך',()=>{clear();person=null;render()}));body.append(nav);return}
if(summaryShown){body.append(el('h3','לפני השליחה'),el('p','אפשר לחזור ולשנות. שליחה אינה מזמינה פעילות ולא מאשרת תשלום.'),el('div',summary(),{className:'pq-review'}));let nav=el('div',null,{className:'pq-nav'});nav.append(button('חזרה לעריכה',()=>{summaryShown=false;render()}));let submit=button('שליחת התשובות לפיני',()=>send(submit));submit.className='pq-primary';nav.append(submit);body.append(nav,el('p','',{className:'pq-status'}));updateProgress();return}
body.append(el('p','חלק '+(step+1)+' מתוך '+data.sections.length,{className:'pq-steps'}),el('h3',data.sections[step][0]));let offset=data.sections.slice(0,step).reduce((n,s)=>n+s[1].length,0);data.sections[step][1].forEach((item,i)=>body.append(field(item,offset+i)));
let nav=el('div',null,{className:'pq-nav'});if(step>0)nav.append(button('לחלק הקודם',()=>{step--;render();bodyTop()}));let next=button(step===data.sections.length-1?'לסיכום לפני שליחה':'להמשך',()=>{if(step<data.sections.length-1)step++;else summaryShown=true;render();bodyTop()});next.className='pq-primary';nav.append(next);body.append(nav);updateProgress()}
function bodyTop(){root.querySelector('.pq-body').scrollIntoView({behavior:'smooth',block:'start'})}
async function send(b){let status=root.querySelector('.pq-status');b.disabled=true;status.textContent='בודקים ושולחים...';try{if(!window.GoaQuestionnaireTransport)throw Error('not-configured');if(!submission)submission={id:crypto.randomUUID(),payload:{family:family.id,respondent:person[0],ageAtTrip:person[2]||null,answers:JSON.parse(JSON.stringify(answers)),summary:summary(),version:'personal-v1'}};await window.GoaQuestionnaireTransport(submission);sent=true;dirty=false;render()}catch(e){status.textContent='התשובות עדיין לא נשלחו. הטיוטה נשארה במסך הזה. אין לרענן לפני שמנסים שוב או מורידים עותק.';b.disabled=false;let d=button('הורדת גיבוי אישי',download);status.append(document.createElement('br'),d)}}
window.addEventListener('beforeunload',e=>{if(dirty&&!sent){e.preventDefault();e.returnValue=''}});
for(const [id,text] of [['survey-open','השאלונים האישיים של כולנו'],['kids-open','גם לילדים יש שאלון משלהם']]){let old=document.getElementById(id);if(old){let shortcut=old.cloneNode(true);old.replaceWith(shortcut);shortcut.href='#personal-questionnaires';shortcut.textContent=text;shortcut.onclick=()=>{root.scrollIntoView({behavior:'smooth',block:'start'})}}}
render();
if(['#personal-questionnaires','#survey','#kids','#kidsbox'].includes(location.hash)){requestAnimationFrame(()=>root.scrollIntoView({block:'start'}))}
})();
