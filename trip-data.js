/* Goa 2027: shared trip data for route.html and pack.html.
   Everything here is copied from what the site already says (index.html): flights, the 4 lodging stages,
   the Seder, recommended places, the Google Maps coordinates in its links, the travel times in
   "אפשרות חלופית למסלול" and the Delhi check, visa/health/money notes and cancellation dates.
   No opening hours, no prices, no bookings. Unknowns stay marked as unknown. */
(function () {
'use strict';
// n = name, sn = short name when returning to it, ll = coordinates from the site's map links,
// q = text query for Google Maps when the site has no coordinates, u = official link from the site,
// base = the area of a lodging stage whose hotel is not chosen yet (no distances are computed from it).
var P = {
 sinq:{n:'חוף סינקרים',ll:[15.4991464,73.7674666]},
 aguada:{n:'מבצר Aguada',ll:[15.4922519,73.7737462],u:'https://www.goa.gov.in/places/aguada-fort/fort-aguada/'},
 anjuna:{n:"שוק הפשפשים באנג'ונה",ll:[15.5720689,73.7419735],u:'https://goa-tourism.org.in/anjuna-flea-market-goa'},
 chapora:{n:'מבצר Chapora',ll:[15.6046375,73.7369631],u:'https://www.goa.gov.in/places/chapora-fort/'},
 vagator:{n:'חוף וגטור',ll:[15.5976,73.7357]},
 pincode:{n:'Pincode, וגטור',ll:[15.5949577,73.7528907]},
 britto:{n:"Britto's, באגה",ll:[15.5613278,73.7494609]},
 baga:{n:'חוף באגה',ll:[15.5552787,73.7517307]},
 calangute:{n:'חוף קלנגוט',ll:[15.549441,73.7534857]},
 gunpowder:{n:'Gunpowder, אסאגאו',ll:[15.5969557,73.788323]},
 splash:{n:'Splashdown (פארק מים)',u:'https://www.splashdowngoa.com/',q:'Splashdown Waterpark Goa'},
 snow:{n:'Snow Park',u:'https://snowparkgoa.com/',q:'Snow Park Goa'},
 reis:{n:'מבצר Reis Magos',u:'https://www.goa.gov.in/places/reis-magos-fort/',q:'Reis Magos Fort'},
 candolim:{n:'בסיס הצפון: קנדולים / קלנגוט',sn:'חזרה לבסיס בצפון',q:'Candolim, Goa',base:1},
 goi:{n:'שדה התעופה דבולים (GOI)',q:'Dabolim Airport, Goa'},
 palolem:{n:'בסיס פאלולם (המלון טרם נבחר)',sn:'חזרה לבסיס בפאלולם',q:'Palolem, Goa',base:1},
 palbeach:{n:'חוף פאלולם',ll:[15.0099648,74.0232186]},
 chabad:{n:'בית חב"ד פאלולם',ll:[15.01276,74.0243252]},
 palm:{n:'יוגה ב־Palm Forest',ll:[15.0132911,74.0190633],u:'https://thepalmcollection.in/palm-forest-palolem/palm-forest-palolem-yoga/'},
 luma:{n:'יוגה ב־Luma',ll:[15.0126252,74.0210419],u:'https://lumagoa.com/yoga-shala'},
 cantine:{n:'Cantine Indienne',ll:[15.0076604,74.0300394]},
 mill:{n:'The Mill',ll:[15.0110151,74.0278915]},
 agonda:{n:'חוף אגונדה',ll:[15.0425,73.9872]},
 zest:{n:'Zest, אגונדה',ll:[15.0392696,73.9892874]},
 dolce:{n:'La Dolce Vita, אגונדה',ll:[15.0374596,73.9896413]},
 butterfly:{n:'סירה לחוף הפרפרים (Butterfly) ול־Honeymoon Beach',u:'https://goatours.co.in/palolem-boat-trip-dolphins-and-beach/',q:'Butterfly Beach Goa',boat:1},
 dudh:{n:'מפלי דודסאגר (ג׳יפים מקולם)',ll:[15.3144375,74.3143073],u:'https://www.dudhsagarjeeps.com/',rq:'Collem, Goa',via:'ברכב עד קולם, ומשם בג׳יפ של המפעילים'},
 spice:{n:'מטע התבלינים Sahakari, פונדה',ll:[15.4094752,74.0237045],u:'https://sahakarispicefarm.com/'},
 south:{n:'בסיס הסיום: אזור בנאולים (המלון טרם נבחר)',sn:'חזרה לבסיס בדרום',q:'Benaulim, Goa',base:1},
 benaulim:{n:'חוף בנאולים',ll:[15.2570626,73.9187138]},
 colva:{n:'חוף קולבה',ll:[15.2805316,73.9119945]},
 beno:{n:'Beno, בנאולים',ll:[15.251476,73.9353349]},
 cavatina:{n:'Cavatina, בנאולים',ll:[15.2433783,73.9298956]},
 mobor:{n:"Fisherman's Wharf, מובור",ll:[15.1576183,73.9521909]},
 mobordol:{n:'שייט דולפינים ממובור',u:'https://goatoursplanner.com/experience/dolphin-trip',q:'Mobor Beach Goa'},
 martin:{n:"Martin's Corner, בטלבטים",ll:[15.303788,73.914329]},
 joets:{n:'Joets, בוגמלו',ll:[15.3708346,73.8325205]},
 delhiHotel:{n:'מלון ליד שדה התעופה בדלהי (טרם הוזמן)',sn:'מלון בדלהי',q:'Aerocity, New Delhi',base:1},
 del:{n:'דלהי, טרמינל 3',q:'Indira Gandhi International Airport Terminal 3'},
 tlv:{n:'נתב״ג',q:'Ben Gurion Airport'}
};

// Travel times that already appear on the site. Key = "from>to" (either direction).
var SRC_ALT = 'כרטיס "אפשרות חלופית למסלול" באתר: הערכות מקנדולים, תלוי בתנועה ובשעה';
var KNOWN = {
 'goi>candolim':{t:'כ־60 דק׳',src:SRC_ALT},
 'goi>palolem':{t:'כ־1:40 שעות',src:SRC_ALT},
 'candolim>palolem':{t:'כ־2 שעות',src:SRC_ALT},
 'candolim>splash':{t:'כ־23 דק׳',src:SRC_ALT},
 'candolim>snow':{t:'כ־24 דק׳',src:SRC_ALT},
 'candolim>reis':{t:'כ־18 דק׳',src:SRC_ALT},
 'candolim>sinq':{t:'כ־12 דק׳',src:SRC_ALT},
 'delhiHotel>del':{t:'כ־10 דק׳ (4.5-4.6 ק״מ)',src:'בדיקת המלונות בדלהי מ־20.10.2026, בתנאים רגילים'}
};

var FLIGHTS = [
 {code:'AI140',from:'tlv',to:'del',dep:'12.4 · 11:40',arr:'12.4 · 20:20',note:'נחיתה בטרמינל 3'},
 {code:'AI2495',from:'del',to:'goi',dep:'13.4 · 11:50',arr:'13.4 · 14:30',note:'להיות בשדה עד כ־09:30'},
 {code:'AI2510',from:'goi',to:'del',dep:'27.4 · 23:10',arr:'28.4 · 01:50',note:'להיות בשדה עד כ־20:00'},
 {code:'AI139',from:'del',to:'tlv',dep:'28.4 · 04:25',arr:'28.4 · 08:15',note:'קונקשן של 2:35 שעות, בלי מלון'}
];

var STAGE = {
 delhi:{n:'דלהי',s:'🛫',c:'var(--delhi)'},
 north:{n:'צפון גואה',c:'var(--north)'},
 palolem:{n:'פאלולם',c:'var(--palolem)'},
 south:{n:'סיום בדרום',c:'var(--south)'},
 home:{n:'בית',s:'🏠',c:'var(--home)'}
};

// stop = [placeKey, time?, note?, optional?]
var DAYS = [
{d:12,stage:'delhi',t:'טסים! לילה אחד בדלהי',night:'דלהי',fixed:true,
 stops:[['tlv','11:40','המראה, Air India AI140'],['del','20:20','נחיתה בטרמינל 3'],['delhiHotel','','לילה לשינה, לא לטיול. לאשר צ׳ק־אין מאוחר מול המלון']],
 rain:['אין שינוי: יום של טיסה ושינה.'],
 notes:['טיפ: תיק קטן אחד ללילה בדלהי, כדי לא לפתוח מזוודות.']},
{d:13,stage:'north',t:'דלהי ← גואה ← הצפון',night:'צפון',fixed:true,
 stops:[['delhiHotel','בוקר','צ׳ק־אאוט'],['del','11:50','AI2495 לגואה. להיות בשדה עד כ־09:30'],['goi','14:30','נחיתה בדבולים. לוודא שההסעה מדבולים ולא ממופה (GOX)'],['candolim','','צ׳ק־אין ומנוחה'],['sinq','שקיעה','הליכה על החוף, בלי להיכנס למים בלי מציל',1]],
 rain:['מוותרים על החוף ונשארים במלון אחרי יום נסיעות ארוך.'],
 notes:['יום ארוך עם ילדים: עדיף לא לתכנן שום דבר מעבר לארוחת ערב.']},
{d:14,stage:'north',t:"יום רביעי = שוק אנג'ונה",night:'צפון',
 stops:[['candolim'],['anjuna','בוקר','השוק פתוח בימי רביעי (לפי ההמלצות). להגיע מוקדם, לפני החום'],['candolim','צהריים','בריכה במלון'],['chapora','אחה״צ','',1],['pincode','ערב','ארוחת ערב בוגטור',1]],
 rain:['Snow Park (פארק שלג) - כ־24 דק׳ מקנדולים ✅.','ארוחה ארוכה באחת המסעדות מההמלצות במקום השוק.'],
 notes:["אם יורד גשם ביום רביעי, השוק של השבוע הזה כנראה ירד מהתוכנית. שוק הלילה בארפורה הוא במוצאי שבת, וזה יוצא ב־17.4 - יום המעבר לדרום."]},
{d:15,stage:'north',t:'דולפינים ומבצר',night:'צפון',
 stops:[['candolim'],['sinq','בוקר','שייט דולפינים מסינקרים, כשעה וחצי. הקישור הרשמי לא זמין כרגע; ראיית דולפינים לא מובטחת'],['aguada','','ליד סינקרים',1],['candolim','צהריים','בריכה ומנוחה'],['britto','ערב','ארוחת ערב בבאגה, נוף לים']],
 rain:['Snow Park במקום השייט (כ־24 דק׳ מקנדולים ✅).','מבצר Reis Magos הוא עצירה קצרה (כ־18 דק׳ ✅), אבל בחוץ.'],
 notes:['שייט בים פתוח: לבדוק מראש מי בקבוצה רגיש לים (גם שאלה בשאלון האישי).']},
{d:16,stage:'north',t:'יום מים',night:'צפון',
 stops:[['candolim'],['splash','בוקר','פארק מים. כ־23 דק׳ מקנדולים'],['candolim','צהריים','מנוחה'],['gunpowder','ערב','מטבח דרום הודי, אסאגאו',1]],
 rain:['Snow Park במקום פארק המים - כ־24 דק׳ ✅.'],
 notes:['חלופה ליום הזה מההמלצות: צלילה ושנורקל סביב האי Grande, טיול יום מהצפון. לא נכלל כאן כי זמני ההגעה לא נבדקו.']},
{d:17,stage:'palolem',t:'מעבר לפאלולם',night:'פאלולם',
 stops:[['candolim','בוקר','צ׳ק־אאוט'],['palolem','צהריים','כ־2 שעות נסיעה, לפי ההערכה באתר'],['palbeach','אחה״צ','החוף, במים רק באזור מסומן'],['mill','ערב','',1]],
 rain:['נוסעים כרגיל ונכנסים מוקדם למלון.'],
 notes:['יום שבת: שוק הלילה בארפורה (צפון) מתנגש עם המעבר. מי שרוצה אותו צריך להזיז את המעבר, וזה משנה את לילות הלינה בשלבים 2 ו־3.']},
{d:18,stage:'palolem',t:'יוגה וחוף',night:'פאלולם',
 stops:[['palolem'],['palm','בוקר','שיעור drop-in. אפשר גם ב־Luma',1],['palbeach','','חוף ובריכה'],['cantine','ערב','טבעוני, פאלולם']],
 rain:['שיטוט בדוכני הבוטיק ברחוב הראשי של פאלולם.','מנוחה במלון.'],
 notes:[]},
{d:19,stage:'palolem',t:'סירה לחוף הפרפרים',night:'פאלולם',
 stops:[['palolem'],['palbeach','בוקר','יוצאים מהחוף עצמו'],['butterfly','','סירה פרטית, לרוב משלבים גם Honeymoon Beach. דולפינים לא מובטחים'],['palolem','צהריים','מנוחה'],['agonda','שקיעה','',1],['zest','ערב','או La Dolce Vita, אגונדה',1]],
 rain:['אם הים סוער לא יוצאים לשייט. אפשר לנסות שוב ב־20.4 או ב־21.4 בבוקר.','רחוב הדוכנים בפאלולם.'],
 notes:[]},
{d:20,stage:'palolem',t:'יום טיול: דודסאגר ותבלינים',night:'פאלולם',
 stops:[['palolem','מוקדם'],['dudh','','הג׳יפים יוצאים מקולם. להזמין מראש אצל איגוד המפעילים'],['spice','','בדרך אפשר לשלב, פונדה',1],['palolem','ערב']],
 rain:['לא יוצאים לטיול היום הארוך ביום גשם. נשארים בפאלולם, ואת היום מזיזים לתאריך אחר בשלב הזה אם יש מקום.'],
 notes:['זה היום עם הכי הרבה נסיעה בטיול. זמני הנסיעה פאלולם-קולם-פונדה לא נבדקו: לבדוק לפני שמתחייבים, במיוחד עם הילדים הקטנים.']},
{d:21,stage:'palolem',t:'ליל הסדר',night:'פאלולם',fixed:true,
 stops:[['palolem','','יום רגוע: חוף, בריכה, מנוחה'],['chabad','ערב','סדר בבית חב״ד, ברישום מראש. רישום לתשפ״ז טרם נפתח']],
 rain:['אין שינוי. הסדר בפנים.'],
 notes:['הסדר מתחיל בערב, ולכן לא מתכננים יציאה רחוקה ביום הזה.']},
{d:22,stage:'south',t:'מעבר לסיום בדרום',night:'דרום',
 stops:[['palolem','בוקר','צ׳ק־אאוט'],['mobor','צהריים','ארוחה בדרך, אם המיקום מתאים',1],['south','אחה״צ','צ׳ק־אין']],
 rain:['נוסעים כרגיל.'],
 notes:['זמן הנסיעה מפאלולם לבסיס הסיום לא נבדק. תלוי באיזה מלון ייבחר (Sea Queen, Alila Diwa או Taj Exotica ברשימה).']},
{d:23,stage:'south',t:'דולפינים ממובור',night:'דרום',
 stops:[['south'],['mobordol','בוקר','שייט דולפינים, לפי ההמלצות'],['south','צהריים','בריכה'],['beno','ערב','או Cavatina, בנאולים',1]],
 rain:['ארוחה ארוכה ב־Martin\'s Corner בבטלבטים.','מנוחה במלון.'],
 notes:['אם השייט כבר נעשה בצפון ב־15.4, היום הזה פנוי לחוף.']},
{d:24,stage:'south',t:'יום חוף (ופסטיבל, אם יהיה)',night:'דרום',
 stops:[['south'],['benaulim','בוקר','חוף, במים רק לפי דגלי המציל'],['colva','ערב','Spirit of Goa Festival - אם ייערך בתאריכים האלה',1],['martin','ערב','',1]],
 rain:['Martin\'s Corner בבטלבטים.'],
 notes:['ב־2026 הפסטיבל נערך בקולבה ב־24-26.4. תאריכי 2027 טרם פורסמו, אז אין לדעת אם ייפול בתקופה שלנו.']},
{d:25,stage:'south',t:'יום פתוח',night:'דרום',
 stops:[['south','','בריכה, חוף, מנוחה. היום הזה נשאר פתוח בכוונה']],
 rain:['מנוחה במלון.'],
 notes:['ימים פתוחים כאן הם מקום לחלופות מהשאלונים האישיים, אחרי שיתמלאו.']},
{d:26,stage:'south',t:'יום פתוח',night:'דרום',
 stops:[['south'],['cavatina','ערב','',1]],
 rain:['מנוחה במלון.'],
 notes:[]},
{d:27,stage:'south',t:'יום אחרון, טיסה בלילה',night:'בטיסה',fixed:true,
 stops:[['south','','לבקש צ׳ק־אאוט מאוחר. הטיסה רק בלילה'],['joets','ערב','ארוחה אחרונה על החוף בבוגמלו',1],['goi','23:10','להיות בשדה עד כ־20:00. AI2510 לדלהי ממריאה ב־23:10']],
 rain:['אין שינוי.'],
 notes:['זמן הנסיעה מבסיס הסיום לשדה לא נבדק. משאירים מרווח.']},
{d:28,stage:'home',t:'נחיתה בבית',night:'בבית',fixed:true,
 stops:[['del','01:50','נחיתה, קונקשן קצר של 2:35 שעות בלי מלון'],['tlv','08:15','AI139 יוצאת מדלהי ב־04:25']],
 rain:['אין שינוי.'],
 notes:[]}
];

// Rain / heat plan by area. Only places and facts that are already on the site.
var RAIN = [
 {stage:'north',title:'צפון (13-17.4)',items:[
  {p:'snow',t:'Snow Park, פארק שלג',k:'candolim>snow'},
  {p:'reis',t:'מבצר Reis Magos: עצירה קצרה, אבל בחוץ',k:'candolim>reis'},
  {p:'britto',t:"Britto's בבאגה: ארוחה ארוכה"},
  {p:'gunpowder',t:'Gunpowder באסאגאו: מטבח דרום הודי'},
  {p:'pincode',t:'Pincode בוגטור: הודי מודרני'}]},
 {stage:'palolem',title:'פאלולם (17-22.4)',items:[
  {t:'דוכני הבוטיק והתכשיטים ברחוב הראשי של פאלולם',p:'palbeach'},
  {p:'chabad',t:'בית חב״ד: לפי האתר, בעונה יש מסעדה חלבית בימות החול'},
  {p:'cantine',t:'Cantine Indienne: טבעוני'},
  {p:'mill',t:'The Mill'}]},
 {stage:'south',title:'סיום בדרום (22-27.4)',items:[
  {p:'martin',t:"Martin's Corner בבטלבטים"},
  {p:'mobor',t:"Fisherman's Wharf במובור"},
  {p:'beno',t:'Beno בבנאולים'},
  {p:'cavatina',t:'Cavatina בבנאולים'}]}
];
var RAIN_RULES = [
 'באפריל כמעט לא יורד גשם (3-11 מ״מ בממוצע לחודש, לפי Rough Guides ו־TUI שמצוטטים באתר). החלופות האלה משמשות בעיקר לשעות החום של הצהריים.',
 'שייט דולפינים והסירה לחוף הפרפרים: אם הים סוער לא יוצאים.',
 'נכנסים למים רק לפי דגלי המציל. בקנדולים דווח על זרמי ריפ, ובפאלולם אזורי איסור הרחצה משתנים מיום ליום.',
 'טיול היום לדודסאגר הוא היום הארוך ביותר. ביום גשם לא יוצאים אליו, וזו החלטה שלנו, לא מידע מהמפעילים.',
 'שעות פתיחה ומחירים של כל המקומות: לא נבדקו. בודקים סמוך לנסיעה.'
];

// Deadlines. All dates come from the site; "if chosen" items are cancellation dates of lodging options.
var DEADLINES = [
 {date:'2027-03-15',approx:true,t:'להגיש ויזה אלקטרונית (e-Visa) לכל נוסע, כולל ילדים',src:'האתר ממליץ באמצע מרץ',link:'https://indianvisaonline.gov.in/evisa/'},
 {date:'2027-03-15',approx:true,t:'מרפאת מטיילים, כחודש לפני הנסיעה',src:'לפי ה־CDC, מצוטט באתר. מידע כללי, לא ייעוץ רפואי',link:'https://www.gov.il/he/service/vaccination_abroad'},
 {date:'2027-03-20',t:'ביטול חינם ב־The Ark Comforts (אם ייבחר)',src:'כרטיס שלב 3 בלינה',cond:true},
 {date:'2027-04-06',t:'ביטול חינם ב־The Astor (אם ייבחר)',src:'כרטיס שלב 2 בלינה',cond:true},
 {date:'2027-04-08',t:'דד־ליין רשמי לבקשת e-Visa (4 ימים לפני הנחיתה)',src:'כרטיס הוויזה באתר',link:'https://indianvisaonline.gov.in/evisa/'},
 {date:'2027-04-11',t:'ביטול חינם ב־Radisson Blu בדלהי (אם ייבחר; השעה טעונה בדיקה)',src:'כרטיס שלב 1 בלינה',cond:true},
 {date:'2027-04-12',t:'ביטול חינם ב־Airport Le Premier בדלהי עד 18:00 שעון המלון (אם ייבחר)',src:'כרטיס שלב 1 בלינה',cond:true},
 {date:'2027-04-12',t:'המראה מנתב״ג ב־11:40 (AI140)',src:'לוח הטיסות'},
 {date:'2027-04-21',t:'ליל הסדר בבית חב״ד פאלולם. הרישום לתשפ״ז טרם נפתח: לשלוח הודעה מוקדם',src:'כרטיס ליל הסדר'},
 {date:'2027-04-27',t:'להיות בשדה דבולים עד כ־20:00, המראה 23:10',src:'לוח הטיסות'}
];

// Packing / to-do checklist. Items marked src come from the site; the rest are plain practical tips.
var PACK = [
 {id:'docs',t:'מסמכים',items:[
  ['passport','דרכון לכל נוסע, בתוקף לפחות עד 12.10.2027, עם שני עמודים ריקים','כרטיס הוויזה'],
  ['eta','אישור e-Visa (ETA) מודפס לכל נוסע, כולל ילדים','כרטיס הוויזה'],
  ['tickets','כרטיסי טיסה הלוך וחזור (צריך להציג כרטיס חזור)','כרטיס הוויזה'],
  ['insurance','פוליסת ביטוח נסיעות לכל המשפחה','כרטיס ביטוח'],
  ['hotels','אישורי הזמנה של המלונות, כשיוזמנו',''],
  ['copies','צילום של הדרכונים בטלפון ובנפרד מהמקור','']]},
 {id:'money',t:'כסף',items:[
  ['card','כרטיס אשראי (מלונות ומסעדות)','כרטיס כסף'],
  ['cash','מזומן לשווקים, טיפים ומוניות','כרטיס כסף ושאלות ותשובות']]},
 {id:'tech',t:'חשמל ותקשורת',items:[
  ['adapter','מתאם אוניברסלי לשקעים C/D/M, לפחות אחד למשפחה (המתח 230V כמו בארץ)','שאלות ותשובות'],
  ['sim','סים מקומי (צריך דרכון לרישום) או eSIM מהארץ','כרטיס סים'],
  ['chargers','מטענים וסוללה ניידת','']]},
 {id:'sun',t:'שמש, חום ומים',items:[
  ['hats','כובעים לכולם','שאלות ותשובות: השמש חזקה מאוד באפריל'],
  ['sunscreen','קרם הגנה','שאלות ותשובות'],
  ['bottles','בקבוקי מים לכל יום. שותים רק מים מבוקבקים','שאלות ותשובות'],
  ['light','בגדים קלים: כ־33 מעלות ביום וכ־25 בלילה','שאלות ותשובות'],
  ['swim','בגדי ים לכולם','']]},
 {id:'kids',t:'ילדים',items:[
  ['toy','משחק או חפץ קטן מהבית','שאלה בשאלון האישי של הילדים'],
  ['ride','משהו לנסיעות הארוכות (המעבר ליום שלם ויום דודסאגר)',''],
  ['snacks','חטיף מוכר לרגעים שנגמר הכוח','']]},
 {id:'health',t:'בריאות',items:[
  ['clinic','תור במרפאת מטיילים כחודש לפני (מידע כללי, לא ייעוץ רפואי)','כרטיס בריאות וחיסונים'],
  ['meds','תרופות קבועות, אם יש, בתיק היד','']]},
 {id:'delhi',t:'הלילה בדלהי',items:[
  ['overnight','תיק קטן ללילה אחד, כדי לא לפתוח מזוודות',''],
  ['latecheckin','לאשר מול המלון צ׳ק־אין מאוחר (נחיתה ב־20:20)','כרטיס שלב 1']]},
 {id:'goa',t:'בגואה',items:[
  ['transfer','הסעה מדבולים (GOI), לא ממופה (GOX)','כרטיס הסעה מהשדה'],
  ['seder','הודעה לחב״ד פאלולם על הסדר','כרטיס ליל הסדר'],
  ['jeeps','להזמין ג׳יפים לדודסאגר מראש, אצל איגוד המפעילים','כרטיס מה עושים בדרום'],
  ['latecheckout','לבקש צ׳ק־אאוט מאוחר ביום האחרון (הטיסה ב־23:10)','כרטיס שלב 4']]}
];

function km(a, b) { var R=6371,r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)*Math.sin(dn/2); return 2*R*Math.asin(Math.sqrt(x)); }
function loc(p) { return p.ll ? p.ll.join(',') : p.q; }
// where a car actually goes (e.g. Collem for the Dudhsagar jeeps)
function rloc(p) { return p.rq || loc(p); }
// legs that are not a drive: the Butterfly Beach trip is a boat from Palolem beach
function boatLeg(a, b) { return !!((P[a] && P[a].boat) || (P[b] && P[b].boat)); }
function known(a, b) { return KNOWN[a+'>'+b] || KNOWN[b+'>'+a] || null; }
function isFlight(a, b) { return FLIGHTS.some(function (f) { return f.from === a && f.to === b; }); }
// straight-line km only between two real points from the site (never from an unchosen hotel area)
function airKm(a, b) { var p = P[a], q = P[b]; return (p && q && p.ll && q.ll && !p.base && !q.base) ? km(p.ll, q.ll) : null; }
function mapUrl(k) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc(P[k])); }
function dirUrl(a, b) { return 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(rloc(P[a])) + '&destination=' + encodeURIComponent(rloc(P[b])) + '&travelmode=driving'; }
// The day's stops in visit order, without consecutive repeats and without flight legs, ready for one Google Maps route.
function dayRoute(day) {
 var seq = [];
 day.stops.forEach(function (s) { if (!P[s[0]].boat && seq[seq.length-1] !== s[0]) seq.push(s[0]); });
 var drive = [], cur = [];
 for (var i = 0; i < seq.length; i++) {
  if (i && isFlight(seq[i-1], seq[i])) { if (cur.length > 1) drive.push(cur); cur = []; }
  cur.push(seq[i]);
 }
 if (cur.length > 1) drive.push(cur);
 return drive.map(function (r) {
  var u = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(rloc(P[r[0]])) + '&destination=' + encodeURIComponent(rloc(P[r[r.length-1]])) + '&travelmode=driving';
  var mid = r.slice(1, -1);
  if (mid.length) u += '&waypoints=' + encodeURIComponent(mid.map(function (k) { return rloc(P[k]); }).join('|'));
  return {stops:r, url:u, waypoints:mid.length};
 });
}

window.GOA_TRIP = {P:P,KNOWN:KNOWN,FLIGHTS:FLIGHTS,STAGE:STAGE,DAYS:DAYS,RAIN:RAIN,RAIN_RULES:RAIN_RULES,DEADLINES:DEADLINES,PACK:PACK,
 km:km,loc:loc,rloc:rloc,boatLeg:boatLeg,known:known,isFlight:isFlight,airKm:airKm,mapUrl:mapUrl,dirUrl:dirUrl,dayRoute:dayRoute,WD:['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳']};
})();
