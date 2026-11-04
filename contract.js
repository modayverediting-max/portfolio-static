/* ========================================
   Contract maker (contract.html → contract-page.html)
   A friendly electronic agreement between a freelancer and a client.
   Nothing leaves the visitor's browser: the contract travels inside the
   link (#c=…), inside the square code and inside the downloaded file.
   Arabic and English are both here; the page follows the site's AR / EN switch.
   ======================================== */
(function () {
  'use strict';

  var app = document.getElementById('cmApp');
  if (!app) return;

  var LIBS = {
    qr: 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
    canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    pdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  };
  var DRAFT_KEY = 'modayver-contract-draft';
  var STEPS = 6;
  var MAX_VIDEOS = 20;

  /* ---------- language ---------- */
  function isEn() { return document.documentElement.lang === 'en'; }
  function L(ar, en) { return isEn() ? en : ar; }

  var UI = {
    restart: ['ابدأ من جديد', 'Start over'],
    resumed: ['كمّلنا من حيث وقفت.', 'Picked up where you left off.'],
    stepOf: ['الخطوة {n} من {m}', 'Step {n} of {m}'],
    next: ['التالي', 'Next'],
    back: ['السابق', 'Back'],
    show: ['اعرض العقد', 'Show the contract'],
    optional: ['اختياري', 'optional'],
    // step titles
    s1: ['الطرفين', 'The two sides'],
    s2: ['المشروع', 'The project'],
    s3: ['الفيديوهات والسعر', 'Videos & price'],
    s4: ['وش يشمل السعر؟', 'What the price includes'],
    s5: ['الدفع', 'Payment'],
    s6: ['التعديلات والمواعيد', 'Revisions & timing'],
    // step 1
    who: ['مين أنت؟', 'Who are you?'],
    roleF: ['أنا الفريلانسر', "I'm the freelancer"],
    roleFsub: ['اللي بيسوي المونتاج', "I'll do the editing"],
    roleC: ['أنا العميل', "I'm the client"],
    roleCsub: ['صاحب الفيديو', 'I own the video'],
    fl: ['الفريلانسر', 'Freelancer'],
    cl: ['العميل', 'Client'],
    you: ['أنت', 'You'],
    name: ['الاسم', 'Name'],
    namePh: ['الاسم اللي يظهر في العقد', 'Name shown in the contract'],
    country: ['الدولة', 'Country'],
    countryPh: ['مثلاً: السعودية', 'e.g. Saudi Arabia'],
    contact: ['رقم التواصل أو الحساب', 'Phone number or handle'],
    contactPh: ['مثلاً: 966500000000+', 'e.g. +966500000000'],
    channel: ['وين بتتواصلون؟', 'Where will you talk?'],
    channelHint: ['كل الموافقات والملاحظات تكون مكتوبة هنا.', 'All approvals and notes are written here.'],
    other: ['اكتبها', 'Type it'],
    // step 2
    type: ['نوع الفيديو', 'Video type'],
    style: ['الستايل المطلوب', 'Requested style'],
    stylePh: ['مثلاً: قص سريع، كتابة متحركة، مؤثرات صوتية', 'e.g. fast cuts, animated captions, sound effects'],
    ref: ['رابط فيديو مرجعي', 'Reference video link'],
    refHint: ['أقوى شي يمنع «مش هذا اللي أبيه». إذا ما فيه مرجع، الفريلانسر يختار الستايل المناسب.', 'The best way to avoid “that’s not what I wanted”. With no reference, the freelancer picks a suitable style.'],
    size: ['المقاس', 'Size'],
    quality: ['الجودة', 'Quality'],
    // step 3
    currency: ['العملة', 'Currency'],
    videos: ['الفيديوهات', 'Videos'],
    video: ['فيديو', 'Video'],
    vDesc: ['وش الفيديو؟', 'What’s the video?'],
    vDescSmall: ['وصف قصير، اختياري', 'short description, optional'],
    vDescPh: ['مثلاً: إعلان عروض نهاية الأسبوع', 'e.g. weekend sale ad'],
    vLen: ['المدة', 'Length'],
    vLenPh: ['مثلاً: 60 ثانية', 'e.g. 60 sec'],
    vPrice: ['السعر', 'Price'],
    vDate: ['موعد المعاينة', 'Preview date'],
    vDateHint: ['موعد المعاينة = متى يرسل الفريلانسر أول نسخة كاملة من الفيديو.', 'Preview date = when the freelancer sends the first full version of the video.'],
    add: ['+ أضف فيديو', '+ Add a video'],
    remove: ['حذف', 'Remove'],
    total: ['المجموع', 'Total'],
    pricing: ['كيف السعر؟', 'How is it priced?'],
    kCount: ['عدد الفيديوهات', 'Number of videos'],
    kPrice: ['سعر الباقة كاملة', 'Price of the whole package'],
    kEach: ['يعني حوالي {x} للفيديو الواحد', 'That’s about {x} per video'],
    kDesc: ['وش الفيديوهات؟', 'What are the videos?'],
    kDescPh: ['مثلاً: ريلز إعلانية للمتجر', 'e.g. promo reels for the store'],
    kLen: ['مدة الفيديو تقريباً', 'Approximate length'],
    kLenPh: ['مثلاً: من 30 إلى 60 ثانية', 'e.g. 30–60 seconds'],
    kSched: ['جدول التسليم', 'Delivery schedule'],
    kSchedPh: ['مثلاً: 5 فيديوهات كل أسبوع', 'e.g. 5 videos a week'],
    kLast: ['آخر موعد لمعاينات كل الفيديوهات', 'Deadline for all previews'],
    kHint: ['ما تحتاج تكتب كل فيديو لحاله: العدد والسعر يكفون.', 'No need to list every video: the count and the price are enough.'],
    needPackage: ['اكتب عدد الفيديوهات وسعر الباقة (أرقام بس).', 'Enter the number of videos and the package price (numbers only).'],
    // step 4
    incl: ['اختر كل شي داخل في السعر', 'Pick everything the price covers'],
    inclOther: ['شي ثاني داخل في السعر', 'Something else included'],
    music: ['الموسيقى من مين؟', 'Who provides the music?'],
    // step 5
    payBy: ['طريقة الدفع', 'Payment method'],
    account: ['بيانات الحساب', 'Account details'],
    accountPh: ['مثلاً: إيميل البايبال أو رقم الحساب', 'e.g. PayPal email or account number'],
    deposit: ['الدفعة المقدمة', 'Upfront payment'],
    depositHint: ['تندفع قبل بدء العمل، والباقي بعد الموافقة على المعاينة.', 'Paid before work starts; the rest after the preview is approved.'],
    scope: ['الدفع يُحسب', 'Payment applies'],
    fees: ['رسوم التحويل على مين؟', 'Who pays transfer fees?'],
    // step 6
    rounds: ['جولات التعديل لكل فيديو', 'Revision rounds per video'],
    extra: ['سعر الجولة الإضافية', 'Price of an extra round'],
    review: ['مدة مراجعة المعاينة', 'Time to review the preview'],
    turn: ['مدة تنفيذ كل جولة تعديل', 'Time to apply each revision'],
    notice: ['مهلة الانقطاع', 'No-reply grace period'],
    noticeHint: ['لو أحد الطرفين اختفى، كم ينتظر الثاني قبل ما ينحسب إلغاء.', 'If one side goes silent, how long the other waits before it counts as cancelling.'],
    workDays: ['أيام العمل والتوقيت', 'Work days & time zone'],
    workDaysPh: ['مثلاً: من الأحد إلى الخميس، بتوقيت مكة', 'e.g. Sun–Thu, Mecca time'],
    workDaysHint: ['إذا تركتها فاضية: أيام العمل الرسمية وتوقيت بلد الفريلانسر.', "If left empty: the official work days and time zone of the freelancer's country."],
    portfolio: ['معرض الأعمال', 'Portfolio'],
    portfolioOn: ['يسمح العميل للفريلانسر يعرض الفيديو في معرض أعماله بعد النشر', 'The client lets the freelancer show the video in their portfolio after it’s published'],
    terms: ['شروط إضافية', 'Extra terms'],
    termsPh: ['أي شي اتفقتوا عليه وما هو مذكور', 'Anything you agreed that isn’t covered'],
    workDay: ['يوم عمل', 'work days'],
    // validation
    needNames: ['اكتب اسم الفريلانسر واسم العميل.', 'Enter both the freelancer’s and the client’s name.'],
    needPrice: ['اكتب سعر كل فيديو (أرقام بس).', 'Enter a price for every video (numbers only).'],
    // result
    ready: ['العقد جاهز', 'Your contract is ready'],
    readySub: ['راجعه، وبعدين نزّله أو أرسله للطرف الثاني.', 'Check it, then download it or send it to the other side.'],
    received: ['وصلك عقد مونتاج', 'You received an editing contract'],
    receivedSub: ['هذي النسخة الأصلية كما انرسلت بالضبط. اقرأه، وإذا موافق اضغط «أوافق».', 'This is the original, exactly as it was sent. Read it, and if you agree, press “I agree”.'],
    badLink: ['الرابط ناقص أو تالف. اطلب من الطرف الثاني يرسله مرة ثانية.', 'This link is incomplete or broken. Ask the other side to send it again.'],
    download: ['تنزيل العقد', 'Download'],
    send: ['أرسل العقد', 'Send it'],
    copy: ['نسخ الرابط', 'Copy link'],
    edit: ['تعديل', 'Edit'],
    editNew: ['تعديل (نسخة جديدة)', 'Edit (new version)'],
    makeOwn: ['اصنع عقدك', 'Make your own'],
    darkOn: ['قراءة داكنة', 'Dark reading'],
    darkOff: ['قراءة فاتحة', 'Light reading'],
    agree: ['أوافق — أرسل موافقتي', 'I agree — send my approval'],
    approveTitle: ['الموافقة على العقد', 'Approving the contract'],
    approveText: ['كل طرف يرسل هذي الرسالة في {ch}:', 'Each side sends this message on {ch}:'],
    copied: ['تم النسخ', 'Copied'],
    msgCopied: ['انسخنا الرسالة، أرسلها في {ch}', 'Message copied — send it on {ch}'],
    making: ['نجهّز الملف…', 'Preparing the file…'],
    fileFail: ['ما قدرنا نجهّز الملف. تأكد من الإنترنت وجرّب مرة ثانية.', 'We couldn’t prepare the file. Check your connection and try again.'],
    code: ['رمز العقد', 'Contract code'],
    ver: ['النسخة', 'Version']
  };

  function t(key, vars) {
    var v = UI[key];
    var s = v ? (isEn() ? v[1] : v[0]) : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  // [value, Arabic, English]
  var OPT = {
    ch: [['wa', 'واتساب', 'WhatsApp'], ['em', 'الإيميل', 'Email'], ['tg', 'تيليجرام', 'Telegram'], ['dc', 'ديسكورد', 'Discord'], ['ig', 'إنستغرام', 'Instagram'], ['ot', 'أخرى', 'Other']],
    ty: [['reels', 'ريلز قصيرة', 'Short reels'], ['yt', 'فيديو يوتيوب', 'YouTube video'], ['ad', 'إعلان', 'Ad'], ['react', 'ريأكشن', 'Reaction'], ['re', 'عقاري', 'Real estate'], ['ot', 'أخرى', 'Other']],
    sz: [['916', 'طولي 9:16', 'Vertical 9:16'], ['169', 'أفقي 16:9', 'Horizontal 16:9'], ['11', 'مربع 1:1', 'Square 1:1'], ['ot', 'أخرى', 'Other']],
    q: [['1080', '1080', '1080p'], ['4k', '4K', '4K'], ['ot', 'أخرى', 'Other']],
    cu: [['USD', 'دولار', 'USD'], ['USDT', 'USDT', 'USDT'], ['SAR', 'ريال سعودي', 'SAR'], ['AED', 'درهم إماراتي', 'AED'], ['EUR', 'يورو', 'EUR'], ['DZD', 'دينار جزائري', 'DZD'], ['ot', 'أخرى', 'Other']],
    in: [['cut', 'القص والترتيب', 'Cutting & assembly'], ['cap', 'الكابشن والنصوص', 'Captions & text'], ['mg', 'الموشن جرافيك', 'Motion graphics'], ['col', 'تصحيح الألوان', 'Color correction'], ['snd', 'الهندسة الصوتية والمؤثرات', 'Sound design & SFX'], ['mus', 'الموسيقى', 'Music'], ['thumb', 'الصورة المصغرة', 'Thumbnail'], ['src', 'ملفات المشروع المفتوحة', 'Editable project files']],
    mu: [['f', 'الفريلانسر (مرخصة أو مجانية)', 'The freelancer (licensed or free)'], ['c', 'العميل', 'The client'], ['n', 'بدون موسيقى', 'No music']],
    pm: [['pp', 'PayPal', 'PayPal'], ['bank', 'تحويل بنكي', 'Bank transfer'], ['bm', 'بريدي موب', 'BaridiMob'], ['usdt', 'USDT', 'USDT'], ['ot', 'أخرى', 'Other']],
    dp: [[0, 'بدون', 'None'], [30, '30%', '30%'], [50, '50%', '50%'], [70, '70%', '70%'], [100, '100%', '100%']],
    sc: [['v', 'لكل فيديو لحاله', 'Per video'], ['p', 'للمشروع كامل', 'For the whole project']],
    fe: [['c', 'العميل', 'The client'], ['f', 'الفريلانسر', 'The freelancer'], ['h', 'مناصفة', 'Split equally']],
    md: [['v', 'كل فيديو بسعره', 'Each video has its price'], ['p', 'باقة: عدد فيديوهات بسعر واحد', 'Package: several videos, one price']]
  };
  function optLabel(group, val) {
    var o = OPT[group].filter(function (x) { return String(x[0]) === String(val); })[0];
    return o ? (isEn() ? o[2] : o[1]) : '';
  }

  /* ---------- the contract data ---------- */
  var DEF = {
    v: 1, ver: 1, dt: '', ro: 'f',
    fn: '', fc: '', fx: '', cn: '', cc: '', cx: '',
    ch: 'wa', co: '',
    ty: 'reels', to: '', st: '', rf: '', sz: '916', so: '', q: '1080', qo: '',
    vd: [{ d: '', l: '', p: '', t: '' }], cu: 'USD', cuo: '',
    in: ['cut', 'cap', 'snd'], io: '', mu: 'f',
    pm: ['pp'], pmo: '', ac: '', dp: 50, sc: 'v', fe: 'c',
    rd: 2, ex: '', rv: 3, tn: 2, nt: 5, wd: '', pf: 0, tr: '',
    // package mode (md = 'p'): a number of videos for one price. New keys keep
    // defaults that change nothing, so contracts already sent read the same.
    md: 'v', kn: 10, kp: '', kd: '', kl: '', ks: '', kt: ''
  };
  var LIMITS = { fn: 60, fc: 40, fx: 60, cn: 60, cc: 40, cx: 60, co: 40, to: 40, st: 140, rf: 200, so: 30, qo: 30, cuo: 20, io: 80, pmo: 40, ac: 120, ex: 20, wd: 80, tr: 400, kp: 14, kd: 80, kl: 30, ks: 80 };
  var NUMS = { rd: [0, 10], rv: [1, 14], tn: [1, 14], nt: [1, 30], kn: [1, 200] };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function str(x, max) { return String(x == null ? '' : x).slice(0, max || 200); }
  function inList(group, val, fallback) { return OPT[group].some(function (o) { return String(o[0]) === String(val); }) ? val : fallback; }

  // Brings any object (a draft, or data from a link — never trusted) to the exact expected shape
  function normalize(src) {
    src = src && typeof src === 'object' ? src : {};
    var s = clone(DEF);
    Object.keys(LIMITS).forEach(function (k) { if (src[k] != null) s[k] = str(src[k], LIMITS[k]); });
    Object.keys(NUMS).forEach(function (k) {
      var n = parseInt(src[k], 10);
      if (!isNaN(n)) s[k] = Math.min(NUMS[k][1], Math.max(NUMS[k][0], n));
    });
    s.ver = Math.max(1, Math.min(999, parseInt(src.ver, 10) || 1));
    s.dt = /^\d{4}-\d{2}-\d{2}$/.test(src.dt || '') ? src.dt : '';
    s.ro = src.ro === 'c' ? 'c' : 'f';
    s.ch = inList('ch', src.ch, 'wa');
    s.ty = inList('ty', src.ty, 'reels');
    s.sz = inList('sz', src.sz, '916');
    s.q = inList('q', src.q, '1080');
    s.cu = inList('cu', src.cu, 'USD');
    s.mu = inList('mu', src.mu, 'f');
    s.sc = inList('sc', src.sc, 'v');
    s.fe = inList('fe', src.fe, 'c');
    var dp = parseInt(src.dp, 10);
    s.dp = OPT.dp.some(function (o) { return o[0] === dp; }) ? dp : 50;
    s.pf = src.pf ? 1 : 0;
    s.md = src.md === 'p' ? 'p' : 'v';
    s.kt = /^\d{4}-\d{2}-\d{2}$/.test(src.kt || '') ? src.kt : '';
    if (Array.isArray(src.in)) s.in = OPT.in.map(function (o) { return o[0]; }).filter(function (k) { return src.in.indexOf(k) !== -1; });
    if (Array.isArray(src.pm)) s.pm = OPT.pm.map(function (o) { return o[0]; }).filter(function (k) { return src.pm.indexOf(k) !== -1; });
    if (Array.isArray(src.vd) && src.vd.length) {
      s.vd = src.vd.slice(0, MAX_VIDEOS).map(function (v) {
        v = v && typeof v === 'object' ? v : {};
        return { d: str(v.d, 80), l: str(v.l, 30), p: str(v.p, 14), t: /^\d{4}-\d{2}-\d{2}$/.test(v.t || '') ? v.t : '' };
      });
    }
    return s;
  }

  // Only what differs from the defaults travels in the link, so the square code stays small
  function pack(s) {
    var out = {};
    Object.keys(DEF).forEach(function (k) {
      if (JSON.stringify(s[k]) !== JSON.stringify(DEF[k])) out[k] = s[k];
    });
    out.v = 1;
    return out;
  }

  function sortedJSON(x) {
    if (Array.isArray(x)) return '[' + x.map(sortedJSON).join(',') + ']';
    if (x && typeof x === 'object') return '{' + Object.keys(x).sort().map(function (k) { return JSON.stringify(k) + ':' + sortedJSON(x[k]); }).join(',') + '}';
    return JSON.stringify(x);
  }

  /* ---------- link encoding (compressed, URL-safe) ---------- */
  function toB64url(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64url(text) {
    text = text.replace(/-/g, '+').replace(/_/g, '/');
    while (text.length % 4) text += '=';
    var bin = atob(text), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function pipe(bytes, stream) {
    return new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  function encodeState(s) {
    var bytes = new TextEncoder().encode(JSON.stringify(pack(s)));
    if (!window.CompressionStream) return Promise.resolve('j' + toB64url(bytes));
    return pipe(bytes, new CompressionStream('deflate-raw')).then(function (z) {
      return z.length < bytes.length ? 'z' + toB64url(z) : 'j' + toB64url(bytes);
    }).catch(function () { return 'j' + toB64url(bytes); });
  }
  function decodeState(text) {
    return Promise.resolve().then(function () {
      var kind = text.charAt(0), bytes = fromB64url(text.slice(1));
      if (kind === 'z') return pipe(bytes, new DecompressionStream('deflate-raw'));
      if (kind === 'j') return bytes;
      throw new Error('bad kind');
    }).then(function (bytes) {
      return normalize(JSON.parse(new TextDecoder().decode(bytes)));
    });
  }

  // Contract code: changes if anything in the contract changes
  var B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  function codeOf(s) {
    var data = new TextEncoder().encode(sortedJSON(normalize(s)));
    var digest = window.crypto && crypto.subtle
      ? crypto.subtle.digest('SHA-256', data).then(function (b) { return new Uint8Array(b); })
      : Promise.resolve(fnv(data));
    return digest.then(function (h) {
      var bits = 0, value = 0, out = '';
      for (var i = 0; i < h.length && out.length < 8; i++) {
        value = (value << 8) | h[i]; bits += 8;
        while (bits >= 5 && out.length < 8) { out += B32.charAt((value >>> (bits - 5)) & 31); bits -= 5; }
      }
      return out.slice(0, 4) + '-' + out.slice(4, 8);
    });
  }
  function fnv(data) {
    var h = 0x811c9dc5, out = new Uint8Array(8);
    for (var i = 0; i < data.length; i++) { h ^= data[i]; h = Math.imul(h, 16777619) >>> 0; }
    for (var j = 0; j < 8; j++) { out[j] = h & 255; h = Math.imul(h ^ (j * 2654435761), 16777619) >>> 0; }
    return out;
  }

  /* ---------- helpers ---------- */
  function esc(x) {
    return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Filled-in values. Phone numbers, links and codes have no letters to set their
  // direction, so they are pinned left-to-right (an Arabic line would flip them)
  function V(x) {
    var s = String(x == null ? '' : x);
    var ltr = !/[֐-ࣿ]/.test(s) && /[0-9A-Za-z+@]/.test(s);
    return '<bdi class="cm-v"' + (ltr ? ' dir="ltr"' : '') + '>' + esc(s) + '</bdi>';
  }
  function digits(x) { return String(x || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[٫,]/g, '.').trim(); }
  function price(x) { var n = parseFloat(digits(x)); return isNaN(n) || n < 0 || !/^\d+(\.\d+)?$/.test(digits(x)) ? null : n; }
  function money(n) { return n == null ? '—' : (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function total(s) {
    if (s.md === 'p') return price(s.kp);
    var sum = 0;
    for (var i = 0; i < s.vd.length; i++) { var p = price(s.vd[i].p); if (p == null) return null; sum += p; }
    return sum;
  }
  function videoCount(s) { return s.md === 'p' ? s.kn : s.vd.length; }
  function perVideo(s) { var t = total(s); return t == null ? null : t / Math.max(1, s.kn); }
  function curName(s) { return s.cu === 'ot' ? (s.cuo || '') : optLabel('cu', s.cu); }
  function amount(n, s) { return money(n) + ' ' + curName(s); }
  function fmtDate(d) { if (!d) return '—'; var p = d.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function chName(s) { return s.ch === 'ot' ? (s.co || optLabel('ch', 'ot')) : optLabel('ch', s.ch); }
  function days(n) {
    if (isEn()) return n + (n === 1 ? ' work day' : ' work days');
    if (n === 1) return 'يوم عمل واحد';
    if (n === 2) return 'يوما عمل';
    return n + (n <= 10 ? ' أيام عمل' : ' يوم عمل');
  }
  function rounds(n) {
    if (isEn()) return n + (n === 1 ? ' revision round' : ' revision rounds');
    if (n === 1) return 'جولة تعديل واحدة';
    if (n === 2) return 'جولتا تعديل';
    return n + (n <= 10 ? ' جولات تعديل' : ' جولة تعديل');
  }
  function videosCount(n) {
    if (isEn()) return n + (n === 1 ? ' video' : ' videos');
    if (n === 1) return 'فيديو واحد';
    if (n === 2) return 'فيديوين';
    return n + (n <= 10 ? ' فيديوهات' : ' فيديو');
  }
  function listJoin(arr) {
    if (arr.length < 2) return arr.join('');
    return isEn() ? arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1] : arr.slice(0, -1).join('، ') + ' و' + arr[arr.length - 1];
  }

  /* ---------- the contract text (Arabic + English) ---------- */
  function sections(s, code) {
    var N = videoCount(s), sum = total(s), en = isEn(), pack = s.md === 'p';
    var type = s.ty === 'ot' ? (s.to || optLabel('ty', 'ot')) : optLabel('ty', s.ty);
    var size = s.sz === 'ot' ? (s.so || optLabel('sz', 'ot')) : optLabel('sz', s.sz);
    var qual = s.q === 'ot' ? (s.qo || optLabel('q', 'ot')) : optLabel('q', s.q);
    var incl = s.in.map(function (k) { return optLabel('in', k); });
    if (s.io) incl.push(s.io);
    var pays = s.pm.map(function (k) { return k === 'ot' ? (s.pmo || optLabel('pm', 'ot')) : optLabel('pm', k); });
    var ch = chName(s);
    var dep = sum == null ? null : sum * s.dp / 100;
    var rest = sum == null ? null : sum - dep;
    var out = [];

    // 1 Project
    var s1 = [];
    s1.push(pack
      ? L('يقوم الفريلانسر ' + V(s.fn) + ' بمونتاج ' + V(videosCount(N)) + ' للعميل ' + V(s.cn) + ' ضمن باقة واحدة' + (s.kd ? ': ' + V(s.kd) : '') + '، كما في جدول الباقة.',
          'The freelancer ' + V(s.fn) + ' will edit ' + V(videosCount(N)) + ' for the client ' + V(s.cn) + ' as one package' + (s.kd ? ': ' + V(s.kd) : '') + ', as in the package table.')
      : L('يقوم الفريلانسر ' + V(s.fn) + ' بمونتاج ' + V(videosCount(N)) + ' للعميل ' + V(s.cn) + '، كما في جدول الفيديوهات.',
          'The freelancer ' + V(s.fn) + ' will edit ' + V(videosCount(N)) + ' for the client ' + V(s.cn) + ', as listed in the videos table.'));
    s1.push(L('نوع الفيديو: ' + V(type) + (s.st ? '، والستايل المطلوب: ' + V(s.st) : '') + '.',
              'Video type: ' + V(type) + (s.st ? '; requested style: ' + V(s.st) : '') + '.'));
    s1.push(s.rf
      ? L('الفيديو المرجعي: ' + V(s.rf) + '، ويُعدّ جزءًا من الاتفاق.', 'Reference video: ' + V(s.rf) + ' — it is part of this agreement.')
      : L('لا يوجد فيديو مرجعي، فيختار الفريلانسر الستايل المناسب لنوع الفيديو.', 'There is no reference video, so the freelancer picks a style that suits the video type.'));
    s1.push(L('المقاس: ' + V(size) + '، والجودة النهائية: ' + V(qual) + '.', 'Size: ' + V(size) + '; final quality: ' + V(qual) + '.'));
    s1.push(incl.length
      ? L('يشمل السعر: ' + V(listJoin(incl)) + '. وأي عمل غير مذكور يُعدّ عملًا إضافيًا (البند 4).', 'The price includes: ' + V(listJoin(incl)) + '. Anything not listed is extra work (section 4).')
      : L('لم تُحدَّد أعمال داخلة في السعر، فأي عمل يُتفق عليه كتابيًا قبل البدء.', 'No included work was chosen, so any work is agreed in writing before starting.'));
    s1.push(L('يرسل العميل كل المواد اللازمة بجودة صالحة، ويضمن أن له حق استخدامها. ولا يتحمل الفريلانسر ضعف جودة المواد الأصلية.',
              'The client sends all needed materials in usable quality and confirms they have the right to use them. The freelancer isn’t responsible for poor quality in the original footage.'));
    if (!pack) {
      s1.push(L('موعد التسليم هو موعد إرسال أول نسخة معاينة كاملة لكل فيديو، كما في الجدول.',
                'The delivery date is when the first full preview of each video is sent, as in the table.'));
    } else if (s.ks || s.kt) {
      s1.push(L('موعد التسليم هو موعد إرسال أول نسخة معاينة كاملة لكل فيديو' + (s.ks ? '، حسب جدول التسليم: ' + V(s.ks) : '') + (s.kt ? '، وآخر موعد لمعاينات كل الفيديوهات ' + V(fmtDate(s.kt)) : '') + '.',
                'The delivery date is when the first full preview of each video is sent' + (s.ks ? ', following the schedule: ' + V(s.ks) : '') + (s.kt ? '; the deadline for all previews is ' + V(fmtDate(s.kt)) : '') + '.'));
    } else {
      s1.push(L('موعد التسليم هو موعد إرسال أول نسخة معاينة كاملة لكل فيديو، ويُتفق عليه كتابيًا قبل بدء العمل على الفيديو.',
                'The delivery date is when the first full preview of each video is sent; it is agreed in writing before work on that video starts.'));
    }
    out.push({ t: L('تفاصيل المشروع', 'Project details'), items: s1 });

    // 2 Price & payment
    var s2 = [];
    s2.push(pack
      ? L('سعر الباقة: ' + V(amount(sum, s)) + ' مقابل ' + V(videosCount(N)) + '، أي ' + V(amount(perVideo(s), s)) + ' للفيديو الواحد.',
          'Package price: ' + V(amount(sum, s)) + ' for ' + V(videosCount(N)) + ', i.e. ' + V(amount(perVideo(s), s)) + ' per video.')
      : L('السعر الإجمالي: ' + V(amount(sum, s)) + '.', 'Total price: ' + V(amount(sum, s)) + '.'));
    if (s.dp === 0) {
      s2.push(L('لا توجد دفعة مقدمة، ويبدأ العمل ويُحسب موعد التسليم من يوم استلام كل المواد.',
                'There is no upfront payment; work starts, and the delivery date counts, from the day all materials are received.'));
    } else if (s.dp === 100) {
      s2.push(L('يُدفع المبلغ كاملًا قبل بدء العمل، ويبدأ العمل ويُحسب موعد التسليم من يوم استلامه مع كل المواد.',
                'The full amount is paid before work starts; work starts, and the delivery date counts, from the day it’s received along with all materials.'));
    } else {
      s2.push(L('الدفعة المقدمة: ' + V(s.dp + '% = ' + amount(dep, s)) + '، تُدفع قبل بدء العمل، ويبدأ العمل ويُحسب موعد التسليم من يوم استلامها مع كل المواد.',
                'Upfront payment: ' + V(s.dp + '% = ' + amount(dep, s)) + ', paid before work starts; work starts, and the delivery date counts, from the day it’s received along with all materials.'));
      s2.push(L('المبلغ المتبقي: ' + V((100 - s.dp) + '% = ' + amount(rest, s)) + '، يُدفع بعد موافقة العميل على المعاينة، وقبل تسليم النسخة النهائية.',
                'The remaining ' + V((100 - s.dp) + '% = ' + amount(rest, s)) + ' is paid after the client approves the preview and before the final version is delivered.'));
    }
    if (N > 1) s2.push(L('يُطبَّق الدفع ' + V(s.sc === 'p' ? 'على المشروع كاملًا' : 'على كل فيديو لحاله') + '.', 'Payment applies ' + V(s.sc === 'p' ? 'to the whole project' : 'to each video separately') + '.'));
    if (pays.length) s2.push(L('طريقة الدفع: ' + V(listJoin(pays)) + (s.ac ? '. بيانات الحساب: ' + V(s.ac) : '') + '.', 'Payment method: ' + V(listJoin(pays)) + (s.ac ? '. Account details: ' + V(s.ac) : '') + '.'));
    var payer = { c: L('العميل', 'the client'), f: L('الفريلانسر', 'the freelancer'), h: L('الطرفين مناصفة', 'both sides, split equally') }[s.fe];
    s2.push(L('رسوم التحويل وفرق العملة على ' + V(payer) + (s.fe === 'c' ? '، بحيث يصل للفريلانسر المبلغ المتفق عليه كاملًا' : '') + '.',
              'Transfer fees and currency differences are paid by ' + V(payer) + (s.fe === 'c' ? ', so the freelancer receives the full agreed amount' : '') + '.'));
    out.push({ t: L('السعر والدفع', 'Price & payment'), items: s2 });

    // 3 Preview & delivery
    var s3 = [];
    s3.push(L('يرسل الفريلانسر نسخة معاينة كاملة بجودة أقل أو بعلامة مائية' + (s.dp < 100 ? '، قبل دفع المبلغ المتبقي' : '') + '.',
              'The freelancer sends a full preview in lower quality or with a watermark' + (s.dp < 100 ? ', before the remaining amount is paid' : '') + '.'));
    s3.push(L('يراجع العميل المعاينة خلال ' + V(days(s.rv)) + '، ويرسل كل ملاحظاته مكتوبة في رسالة واحدة.',
              'The client reviews the preview within ' + V(days(s.rv)) + ' and sends all notes in writing, in one message.'));
    s3.push(L('سكوت العميل لا يُعدّ موافقة. وإذا انتهت مدة المراجعة دون رد، يذكّره الفريلانسر كتابيًا، ثم تُطبَّق قاعدة الانقطاع (البند 7).',
              'Silence is not approval. If the review time ends with no reply, the freelancer reminds the client in writing, then the no-reply rule applies (section 7).'));
    s3.push(L('الموافقة على المعاينة تكون مكتوبة في ' + V(ch) + '، مثل: «موافق على الفيديو».',
              'Approving the preview is done in writing on ' + V(ch) + ', e.g. “Approved”.'));
    s3.push(L('يرسل الفريلانسر النسخة النهائية خلال يوم عمل واحد من ' + (s.dp < 100 ? 'استلام المبلغ المتبقي' : 'الموافقة على المعاينة') + '، بالجودة المتفق عليها وبدون علامة مائية.',
              'The freelancer sends the final version within one work day of ' + (s.dp < 100 ? 'receiving the remaining amount' : 'the preview approval') + ', in the agreed quality and without a watermark.'));
    if (s.dp < 100) s3.push(L('لا يجوز نشر المعاينة أو استخدامها قبل السداد الكامل، وإذا نُشرت يصبح المبلغ المتبقي مستحقًا فورًا.',
                              'The preview may not be published or used before full payment; if it is, the remaining amount is due at once.'));
    out.push({ t: L('المعاينة والتسليم', 'Preview & delivery'), items: s3 });

    // 4 Revisions
    var s4 = [];
    if (s.rd === 0) {
      s4.push(L('لا يشمل السعر جولات تعديل، وأي تعديل يُتفق على سعره كتابيًا قبل تنفيذه.', 'The price includes no revision rounds; any revision is priced in writing before it’s done.'));
    } else {
      s4.push(L('يشمل السعر ' + V(rounds(s.rd)) + ' لكل فيديو. ' + (s.ex ? 'وكل جولة إضافية بسعر ' + V(s.ex + ' ' + curName(s)) + '.' : 'وسعر أي جولة إضافية يُتفق عليه كتابيًا قبل تنفيذها.'),
                'The price includes ' + V(rounds(s.rd)) + ' per video. ' + (s.ex ? 'Each extra round costs ' + V(s.ex + ' ' + curName(s)) + '.' : 'Any extra round is priced in writing before it’s done.')));
      s4.push(L('جولة التعديل: أن يجمع العميل كل ملاحظاته على النسخة ويرسلها مرة واحدة. وأي ملاحظات تُرسل بعدها على النسخة نفسها تُحسب جولة جديدة.',
                'A revision round means the client gathers all notes on a version and sends them at once. Notes sent later on the same version count as a new round.'));
    }
    s4.push(L('التعديل المشمول: تغيير داخل الفكرة والستايل المتفق عليهما، مثل القص والتوقيت والنصوص والألوان والموسيقى.',
              'Included revisions are changes within the agreed idea and style — cuts, timing, text, colors, music.'));
    s4.push(L('العمل الإضافي: تغيير الفكرة أو الستايل أو المرجع، أو إضافة مقاطع أو فيديوهات جديدة، ويُتفق على سعره ومدته كتابيًا قبل تنفيذه.',
              'Extra work means changing the idea, style or reference, or adding new clips or videos; its price and time are agreed in writing before it’s done.'));
    s4.push(L('ينفّذ الفريلانسر كل جولة خلال ' + V(days(s.tn)) + ' من استلام الملاحظات.', 'The freelancer applies each round within ' + V(days(s.tn)) + ' of receiving the notes.'));
    s4.push(L('أخطاء الفريلانسر التي تخالف المتفق عليه يصححها مجانًا، ولا تُحسب من الجولات.', 'The freelancer fixes their own mistakes for free; these don’t count as rounds.'));
    s4.push(L('بعد تسليم النسخة النهائية، أي تعديل جديد يُعدّ عملًا إضافيًا، ما عدا أخطاء الفريلانسر التي يُبلَّغ عنها خلال 7 أيام.',
              'After the final delivery, any new change is extra work — except the freelancer’s mistakes reported within 7 days.'));
    out.push({ t: L('التعديلات', 'Revisions'), items: s4 });

    // 5 Timing & communication
    var s5 = [];
    s5.push(L('قناة التواصل المعتمدة: ' + V(ch) + '. وكلمة «كتابيًا» في هذا العقد تعني رسالة مكتوبة فيها، ولا تُعتمد الموافقات الشفهية أو بالمكالمات.',
              'Agreed channel: ' + V(ch) + '. “In writing” in this contract means a written message there; verbal or call approvals don’t count.'));
    s5.push(L('يرد كل طرف خلال 24 ساعة في أيام العمل، أو يبلّغ الطرف الآخر متى سيرد.', 'Each side replies within 24 hours on work days, or says when they will reply.'));
    s5.push(s.wd
      ? L('أيام العمل والتوقيت: ' + V(s.wd) + '، وكل المواعيد تُحسب بها.', 'Work days and time zone: ' + V(s.wd) + '; all deadlines follow them.')
      : L('أيام العمل والتوقيت: أيام العمل الرسمية وتوقيت بلد الفريلانسر' + (s.fc ? ' (' + V(s.fc) + ')' : '') + '، وكل المواعيد تُحسب بها.',
          'Work days and time zone: the official work days and time zone of the freelancer’s country' + (s.fc ? ' (' + V(s.fc) + ')' : '') + '; all deadlines follow them.'));
    s5.push(L('إذا تأخر العميل في إرسال الدفعة أو المواد أو الملاحظات، يتأخر موعد التسليم بعدد أيام التأخير نفسه.',
              'If the client is late sending payment, materials or notes, the delivery date moves by the same number of days.'));
    s5.push(L('إذا توقّع الفريلانسر تأخرًا، يبلّغ العميل قبل الموعد ويتفقان كتابيًا على موعد جديد. وإذا تأخر دون اتفاق، يحق للعميل الإلغاء وتُطبَّق قاعدة إلغاء الفريلانسر (البند 7).',
              'If the freelancer expects a delay, they tell the client before the deadline and agree a new date in writing. If they’re late without agreement, the client may cancel and the freelancer-cancellation rule applies (section 7).'));
    s5.push(L('الظروف الطارئة (مثل المرض أو انقطاع الكهرباء أو الإنترنت): يبلّغ الطرف المتأثر فورًا وتتمدد المواعيد بقدرها. وإذا زادت عن 7 أيام، يحق للطرف الآخر الإلغاء، ويُعامَل كأنه إلغاء من الطرف المتأثر.',
              'Emergencies (illness, power or internet outage): the affected side tells the other at once and deadlines extend by the same time. Beyond 7 days, the other side may cancel, treated as a cancellation by the affected side.'));
    out.push({ t: L('المواعيد والتواصل', 'Timing & communication'), items: s5 });

    // 6 Rights & privacy
    var s6 = [];
    s6.push(L('يبقى الفيديو ملكًا للفريلانسر حتى السداد الكامل. وبعد السداد، يحق للعميل استخدام النسخة النهائية ونشرها في أي منصة أو غرض.',
              'The video belongs to the freelancer until full payment. After payment, the client may use and publish the final version on any platform, for any purpose.'));
    var src = s.in.indexOf('src') !== -1;
    s6.push(L('ملفات المشروع المفتوحة: ' + V(src ? 'مشمولة في السعر وتُسلَّم مع النسخة النهائية' : 'غير مشمولة ولا تُسلَّم') + '.',
              'Editable project files: ' + V(src ? 'included and delivered with the final version' : 'not included and not delivered') + '.'));
    s6.push(L('قوالب الفريلانسر وإعداداته ومؤثراته الخاصة تبقى ملكه، ويُستخدم ما فيها داخل الفيديو فقط.', 'The freelancer’s own templates, presets and effects stay theirs and are used inside the video only.'));
    s6.push({
      c: L('الموسيقى والعناصر الخارجية يرسلها العميل، وهي على مسؤوليته.', 'Music and outside elements come from the client, at the client’s responsibility.'),
      f: L('الموسيقى والعناصر الخارجية يضيفها الفريلانسر من مصادر مرخصة أو مجانية للاستخدام.', 'Music and outside elements are added by the freelancer from licensed or free sources.'),
      n: L('لا يحتوي الفيديو على موسيقى، وأي عناصر خارجية يرسلها العميل تكون على مسؤوليته.', 'The video has no music; any outside elements the client sends are at the client’s responsibility.')
    }[s.mu]);
    s6.push(L('مواد العميل ملكه، ويحافظ الفريلانسر على سريتها، ولا ينشرها ولا يشاركها مع أحد.', 'The client’s materials are theirs; the freelancer keeps them private and doesn’t publish or share them.'));
    s6.push(s.pf
      ? L('يحق للفريلانسر عرض الفيديو في معرض أعماله بعد أن ينشره العميل.', 'The freelancer may show the video in their portfolio after the client publishes it.')
      : L('لا يعرض الفريلانسر الفيديو في معرض أعماله إلا بإذن مكتوب من العميل.', 'The freelancer won’t show the video in their portfolio without the client’s written permission.'));
    s6.push(L('يحتفظ الفريلانسر بملفات المشروع 30 يومًا من تسليم النسخة النهائية، ولا يُطالَب بها بعد ذلك.', 'The freelancer keeps the project files for 30 days after the final delivery and isn’t responsible for them after that.'));
    out.push({ t: L('الحقوق والسرية', 'Rights & privacy'), items: s6 });

    // 7 Cancelling
    var s7 = [];
    s7.push(L('الانقطاع: إذا توقف أحد الطرفين عن الرد بما يعطّل العمل، ينبّهه الآخر كتابيًا ويمهله ' + V(days(s.nt)) + '. فإذا لم يرد خلالها، يُعدّ ذلك إلغاءً منه.',
              'No reply: if one side stops replying and blocks the work, the other warns them in writing and gives them ' + V(days(s.nt)) + '. With no reply by then, it counts as a cancellation by them.'));
    s7.push(L('إلغاء العميل قبل بدء العمل: ' + (s.dp > 0 ? 'تُرد له الدفعة المقدمة كاملة.' : 'لا يُستحق شيء.'),
              'If the client cancels before work starts: ' + (s.dp > 0 ? 'the upfront payment is refunded in full.' : 'nothing is owed.')));
    s7.push(L('إلغاء العميل بعد بدء العمل: يستحق الفريلانسر عن كل فيديو سعره كاملًا إذا أُرسلت معاينته، ونصف سعره إذا بدأ العمل عليه بلا معاينة، ولا شيء إذا لم يبدأ.' + (pack ? ' وفي الباقة، سعر الفيديو الواحد = سعر الباقة ÷ عدد الفيديوهات (' + V(amount(perVideo(s), s)) + ').' : ''),
              'If the client cancels after work starts, the freelancer is owed, per video: the full price if its preview was sent, half if work started without a preview, nothing if it hadn’t started.' + (pack ? ' In a package, one video’s price = the package price ÷ the number of videos (' + V(amount(perVideo(s), s)) + ').' : '')));
    s7.push(L('إلغاء الفريلانسر: يرد للعميل كل ما دفعه عن أي فيديو لم تُسلَّم نسخته النهائية.', 'If the freelancer cancels, they refund everything paid for any video whose final version wasn’t delivered.'));
    s7.push(L('التسوية: يُقارَن ما دفعه العميل بما يستحقه الفريلانسر، ويُرد الفرق أو يُكمَّل خلال 7 أيام من الإلغاء بطريقة الدفع نفسها. وكل فيديو يُدفع سعره كاملًا تُسلَّم نسخته النهائية.',
              'Settlement: what the client paid is compared with what the freelancer is owed, and the difference is refunded or completed within 7 days, by the same payment method. Every video paid in full gets its final version.'));
    s7.push(L('يكون الإلغاء برسالة مكتوبة في قناة التواصل المعتمدة.', 'Cancelling is done by a written message on the agreed channel.'));
    out.push({ t: L('الإلغاء والتوقف', 'Cancelling'), items: s7 });

    // 8 Electronic agreement
    var s8 = [];
    s8.push(L('طبيعة العقد: اتفاق ودي إلكتروني، وليس عقدًا رسميًا أو حكوميًا. هدفه توضيح ما اتفق عليه الطرفان والرجوع إليه عند أي اختلاف، ولا يحتاج طباعة ولا توقيعًا.',
              'This is a friendly electronic agreement, not an official or government contract. It records what both sides agreed so they can refer to it if they disagree. No printing or signature is needed.'));
    s8.push(L('الموافقة: يرسل كل طرف في ' + V(ch) + ': ' + V(approvalText(s, code)) + '. وهذه الرسالة تعني موافقته على كل ما فيه.',
              'Approval: each side sends on ' + V(ch) + ': ' + V(approvalText(s, code)) + '. That message means they accept everything in it.'));
    s8.push(L('رمز العقد يتغيّر إذا تغيّر أي شيء فيه، والكود المربع في آخره يفتح النسخة الأصلية للتأكد منها.',
              'The contract code changes if anything in it changes, and the square code at the end opens the original version to check it.'));
    s8.push(L('أي تعديل يكون بنسخة جديدة برقم جديد يوافق عليها الطرفان بالطريقة نفسها، ولا يغيّر أي طرف الاتفاق وحده.',
              'Any change is made as a new version with a new number, approved the same way; neither side changes the agreement alone.'));
    if (s.tr) s8.push(L('شروط إضافية (تُقدَّم على البنود إذا تعارضت معها): ' + V(s.tr), 'Extra terms (these override the clauses above if they conflict): ' + V(s.tr)));
    s8.push(L('عند الخلاف: يرجع الطرفان أولًا إلى هذا العقد، ثم إلى الرسائل المكتوبة في قناة التواصل، ويحاولان الحل بالتراضي.',
              'If you disagree: first refer to this contract, then to the written messages on the agreed channel, and settle it amicably.'));
    out.push({ t: L('الاتفاق الإلكتروني', 'Electronic agreement'), items: s8 });
    return out;
  }

  function approvalText(s, code) {
    return L('أوافق على العقد، النسخة ' + s.ver + '، الرمز ' + code, 'I agree to the contract, version ' + s.ver + ', code ' + code);
  }

  // The contract sheet. blocks: data-block marks the pieces the PDF can put on pages
  function paperHTML(s, code, url, qrImg) {
    var sum = total(s);
    var h = '';
    h += '<header class="cm-p-head" data-block="head">' +
      '<h2 class="cm-p-title">' + L('عقد خدمات المونتاج', 'Video Editing Agreement') + '</h2>' +
      '<p class="cm-p-subtitle">' + L('اتفاق ودي إلكتروني بين الفريلانسر والعميل', 'A friendly electronic agreement between the freelancer and the client') + '</p>' +
      '<div class="cm-p-meta"><span>' + t('ver') + ' <b>' + s.ver + '</b></span><span>' + fmtDate(s.dt) + '</span><span>' + t('code') + ' <b class="cm-code">' + esc(code) + '</b></span></div>' +
      '</header><div class="cm-p-body">';

    // Parties
    h += '<div class="cm-p-block" data-block="parties"><div class="cm-p-parties">';
    [['f', s.fn, s.fc, s.fx], ['c', s.cn, s.cc, s.cx]].forEach(function (p) {
      h += '<div class="cm-p-party"><h4>' + (p[0] === 'f' ? t('fl') : t('cl')) + '</h4>' +
        '<div><span>' + t('name') + ':</span> ' + V(p[1] || '—') + '</div>' +
        '<div><span>' + t('country') + ':</span> ' + V(p[2] || '—') + '</div>' +
        '<div><span>' + L('التواصل', 'Contact') + ':</span> ' + V(p[3] || '—') + '</div></div>';
    });
    h += '</div></div>';

    if (s.md === 'p') {
      // Package: one small table instead of a row per video
      var rows = [[t('kCount'), videosCount(s.kn)], [L('سعر الباقة', 'Package price'), amount(sum, s)], [L('سعر الفيديو الواحد', 'Price per video'), amount(perVideo(s), s)]];
      if (s.kd) rows.push([t('kDesc'), s.kd]);
      if (s.kl) rows.push([t('kLen'), s.kl]);
      if (s.ks) rows.push([t('kSched'), s.ks]);
      if (s.kt) rows.push([t('kLast'), fmtDate(s.kt)]);
      h += '<div class="cm-p-block" data-block="videos"><table class="cm-p-table cm-p-kv"><thead><tr><th colspan="2">' + L('الباقة', 'The package') + '</th></tr></thead><tbody>';
      rows.forEach(function (r) { h += '<tr><td>' + esc(r[0]) + '</td><td>' + V(r[1]) + '</td></tr>'; });
      h += '</tbody></table></div>';
    } else {
      h += '<div class="cm-p-block" data-block="videos"><table class="cm-p-table"><thead><tr><th>' + L('م', '#') + '</th><th>' + t('video') + '</th><th>' + t('vLen') + '</th><th>' + t('vPrice') + '</th><th>' + t('vDate') + '</th></tr></thead><tbody>';
      s.vd.forEach(function (v, i) {
        h += '<tr><td>' + (i + 1) + '</td><td>' + V(v.d || (t('video') + ' ' + (i + 1))) + '</td><td>' + V(v.l || '—') + '</td><td>' + V(price(v.p) == null ? '—' : amount(price(v.p), s)) + '</td><td>' + esc(fmtDate(v.t)) + '</td></tr>';
      });
      h += '</tbody><tfoot><tr><td colspan="3">' + t('total') + '</td><td colspan="2">' + V(amount(sum, s)) + '</td></tr></tfoot></table></div>';
    }

    // Clauses
    sections(s, code).forEach(function (sec, i) {
      h += '<section class="cm-p-sec" data-block="sec"><h3><i>' + (i + 1) + '</i>' + sec.t + '</h3><div class="cm-p-items">';
      sec.items.forEach(function (it, j) { h += '<div class="cm-li"><span class="cm-li-n">' + (j + 1) + '</span><div>' + it + '</div></div>'; });
      h += '</div></section>';
    });

    // Square code
    h += '<div class="cm-p-block" data-block="qr"><div class="cm-p-qr">' + (qrImg ? '<img src="' + qrImg + '" alt="QR">' : '') +
      '<p>' + L('امسح الكود بكاميرا الجوال لفتح النسخة الأصلية من هذا العقد والتأكد منها.', 'Scan with a phone camera to open and verify the original version of this contract.') +
      '<br>' + t('code') + ': <b class="cm-code">' + esc(code) + '</b></p></div>' +
      '<p class="cm-p-foot">' + L('اتفاق ودي للتوضيح والرجوع إليه عند الاختلاف، وليس عقدًا رسميًا أو حكوميًا.', 'A friendly agreement for clarity and reference — not an official or government contract.') + '</p></div>';
    h += '</div>';
    return h;
  }

  /* ---------- libraries (loaded only when needed) ---------- */
  var libPromises = {};
  var LIB_READY = { qr: function () { return window.qrcode; }, canvas: function () { return window.html2canvas; }, pdf: function () { return window.jspdf; } };
  function loadLib(name) {
    if (LIB_READY[name]()) return Promise.resolve();
    if (libPromises[name]) return libPromises[name];
    libPromises[name] = new Promise(function (resolve, reject) {
      var sc = document.createElement('script');
      sc.src = LIBS[name];
      sc.crossOrigin = 'anonymous';
      sc.onload = resolve;
      sc.onerror = function () { libPromises[name] = null; reject(new Error('load ' + name)); };
      document.head.appendChild(sc);
    });
    return libPromises[name];
  }
  function qrDataUrl(text) {
    return loadLib('qr').then(function () {
      var qr = window.qrcode(0, 'L');
      qr.addData(text);
      qr.make();
      var n = qr.getModuleCount();
      var cell = Math.max(2, Math.ceil(360 / n));   // crisp at 180 css px on 2x screens and in the file
      return qr.createDataURL(cell, cell * 2);
    }).catch(function () { return ''; });
  }

  /* ---------- state ---------- */
  var S = null;          // the contract being made or read
  var step = 1;
  var mode = 'wizard';   // wizard | result | received | bad
  var dark = null;       // the sheet's own light / dark reading; null = follow the site's theme
  function paperDark() { return dark === null ? document.documentElement.getAttribute('data-theme') === 'dark' : dark; }
  var current = { code: '', url: '', qr: '' };
  var fromLink = false;

  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ s: S, step: step })); } catch (e) {}
  }
  function loadDraft() {
    try { var d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); return d && d.s ? d : null; } catch (e) { return null; }
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }

  function shareBase() {
    var live = /(^|\.)modayver\.com$/.test(location.hostname);
    if (live) return location.origin + '/contract';
    return location.href.split('#')[0].split('?')[0].replace(/contract-page\.html$/, 'contract.html');
  }

  /* ---------- rendering: wizard ---------- */
  function chips(group, key, multi) {
    var val = S[key];
    return '<div class="cm-chips" role="group">' + OPT[group].map(function (o) {
      var on = multi ? val.indexOf(o[0]) !== -1 : String(val) === String(o[0]);
      return '<button type="button" class="cm-chip" ' + (multi ? 'data-multi' : 'data-chip') + '="' + key + '" data-val="' + o[0] + '" aria-pressed="' + on + '">' + esc(isEn() ? o[2] : o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function input(key, ph, attrs) {
    return '<input class="cm-input" dir="auto" data-set="' + key + '" value="' + esc(S[key]) + '" placeholder="' + esc(ph || '') + '" maxlength="' + (LIMITS[key] || 100) + '"' + (attrs || '') + '>';
  }
  function field(label, inner, hint, opt) {
    return '<div class="cm-field"><label class="cm-label">' + label + (opt ? ' <small>(' + t('optional') + ')</small>' : '') + '</label>' + inner + (hint ? '<p class="cm-hint">' + hint + '</p>' : '') + '</div>';
  }
  function stepper(key, unit) {
    return '<div class="cm-stepper-row"><div class="cm-stepper"><button type="button" data-step-key="' + key + '" data-delta="-1" aria-label="−">−</button><output>' + S[key] + '</output><button type="button" data-step-key="' + key + '" data-delta="1" aria-label="+">+</button></div>' + (unit ? '<span class="cm-unit">' + unit + '</span>' : '') + '</div>';
  }

  function stepBody() {
    var h = '';
    if (step === 1) {
      h += '<p class="cm-label">' + t('who') + '</p><div class="cm-roles">' +
        roleCard('f', t('roleF'), t('roleFsub'), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M10 8.5l3 1.5-3 1.5z"/></svg>') +
        roleCard('c', t('roleC'), t('roleCsub'), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/></svg>') +
        '</div>';
      var order = S.ro === 'c' ? ['c', 'f'] : ['f', 'c'];
      order.forEach(function (p) {
        var k = p === 'f' ? ['fn', 'fc', 'fx'] : ['cn', 'cc', 'cx'];
        h += '<div class="cm-party"><h3>' + (p === 'f' ? t('fl') : t('cl')) + (S.ro === p ? ' <span class="cm-you">' + t('you') + '</span>' : '') + '</h3>' +
          field(t('name'), input(k[0], t('namePh'), ' autocomplete="off"')) +
          '<div class="cm-grid2">' + field(t('country'), input(k[1], t('countryPh'))) + field(t('contact'), input(k[2], t('contactPh'), ' inputmode="tel"')) + '</div></div>';
      });
      h += field(t('channel'), chips('ch', 'ch') + (S.ch === 'ot' ? '<div class="cm-gap">' + input('co', t('other')) + '</div>' : ''), t('channelHint'));
    } else if (step === 2) {
      h += field(t('type'), chips('ty', 'ty') + (S.ty === 'ot' ? '<div class="cm-gap">' + input('to', t('other')) + '</div>' : ''));
      h += field(t('style'), input('st', t('stylePh')), '', true);
      h += field(t('ref'), input('rf', 'https://', ' inputmode="url"'), t('refHint'), true);
      h += field(t('size'), chips('sz', 'sz') + (S.sz === 'ot' ? '<div class="cm-gap">' + input('so', t('other')) + '</div>' : ''));
      h += field(t('quality'), chips('q', 'q') + (S.q === 'ot' ? '<div class="cm-gap">' + input('qo', t('other')) + '</div>' : ''));
    } else if (step === 3 && S.md === 'p') {
      h += field(t('pricing'), chips('md', 'md'));
      h += field(t('currency'), chips('cu', 'cu') + (S.cu === 'ot' ? '<div class="cm-gap">' + input('cuo', t('other')) + '</div>' : ''));
      h += '<div class="cm-video cm-package"><p class="cm-hint cm-hint-top">' + t('kHint') + '</p>' +
        '<div class="cm-grid2">' +
        field(t('kCount'), '<div class="cm-count"><button type="button" data-step-key="kn" data-delta="-1" aria-label="−">−</button>' +
          '<input class="cm-input" dir="ltr" inputmode="numeric" data-num="kn" value="' + S.kn + '" maxlength="3" aria-label="' + esc(t('kCount')) + '">' +
          '<button type="button" data-step-key="kn" data-delta="1" aria-label="+">+</button></div>') +
        field(t('kPrice'), '<input class="cm-input" dir="ltr" inputmode="decimal" data-set="kp" value="' + esc(S.kp) + '" placeholder="0" maxlength="14">') +
        '</div><p class="cm-each" id="cmEach">' + eachText() + '</p>' +
        field(t('kDesc'), input('kd', t('kDescPh')), '', true) +
        '<div class="cm-grid2">' + field(t('kLen'), input('kl', t('kLenPh')), '', true) + field(t('kSched'), input('ks', t('kSchedPh')), '', true) + '</div>' +
        field(t('kLast'), '<input class="cm-input" type="date" dir="ltr" data-set="kt" value="' + esc(S.kt) + '">', '', true) +
        '</div>';
      h += '<div class="cm-total"><span>' + L('سعر الباقة', 'Package price') + '</span><b id="cmTotal">' + esc(amount(total(S), S)) + '</b></div>';
    } else if (step === 3) {
      h += field(t('pricing'), chips('md', 'md'));
      h += field(t('currency'), chips('cu', 'cu') + (S.cu === 'ot' ? '<div class="cm-gap">' + input('cuo', t('other')) + '</div>' : ''));
      h += '<p class="cm-label">' + t('videos') + '</p>';
      S.vd.forEach(function (v, i) {
        h += '<div class="cm-video"><div class="cm-video-head"><span class="cm-video-num">' + t('video') + ' ' + (i + 1) + '</span>' +
          (S.vd.length > 1 ? '<button type="button" class="cm-remove" data-vrm="' + i + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>' + t('remove') + '</button>' : '') + '</div>' +
          '<label class="cm-mini cm-mini-wide"><span>' + t('vDesc') + ' <small>(' + t('vDescSmall') + ')</small></span><input class="cm-input" dir="auto" data-vid="' + i + '" data-vf="d" value="' + esc(v.d) + '" placeholder="' + esc(t('vDescPh')) + '" maxlength="80"></label>' +
          '<div class="cm-grid3">' +
          '<label class="cm-mini"><span>' + t('vLen') + '</span><input class="cm-input" dir="auto" data-vid="' + i + '" data-vf="l" value="' + esc(v.l) + '" placeholder="' + esc(t('vLenPh')) + '" maxlength="30"></label>' +
          '<label class="cm-mini"><span>' + t('vPrice') + '</span><input class="cm-input" dir="ltr" inputmode="decimal" data-vid="' + i + '" data-vf="p" value="' + esc(v.p) + '" placeholder="0" maxlength="14"></label>' +
          '<label class="cm-mini"><span>' + t('vDate') + '</span><input class="cm-input" type="date" dir="ltr" data-vid="' + i + '" data-vf="t" value="' + esc(v.t) + '"></label>' +
          '</div></div>';
      });
      if (S.vd.length < MAX_VIDEOS) h += '<button type="button" class="cm-add" data-vadd="1">' + t('add') + '</button>';
      h += '<div class="cm-total"><span>' + t('total') + '</span><b id="cmTotal">' + esc(amount(total(S), S)) + '</b></div>';
      h += '<p class="cm-hint">' + t('vDateHint') + '</p>';
    } else if (step === 4) {
      h += field(t('incl'), chips('in', 'in', true));
      h += field(t('inclOther'), input('io', ''), '', true);
      h += field(t('music'), chips('mu', 'mu'));
    } else if (step === 5) {
      h += field(t('payBy'), chips('pm', 'pm', true) + (S.pm.indexOf('ot') !== -1 ? '<div class="cm-gap">' + input('pmo', t('other')) + '</div>' : ''));
      h += field(t('account'), input('ac', t('accountPh')), '', true);
      h += field(t('deposit'), chips('dp', 'dp'), t('depositHint'));
      if (videoCount(S) > 1) h += field(t('scope'), chips('sc', 'sc'));
      h += field(t('fees'), chips('fe', 'fe'));
    } else if (step === 6) {
      h += field(t('rounds'), stepper('rd'));
      if (S.rd > 0) h += field(t('extra'), input('ex', curName(S) || '0', ' inputmode="decimal"'), '', true);
      h += field(t('review'), stepper('rv', t('workDay')));
      h += field(t('turn'), stepper('tn', t('workDay')));
      h += field(t('notice'), stepper('nt', t('workDay')), t('noticeHint'));
      h += field(t('workDays'), input('wd', t('workDaysPh')), t('workDaysHint'), true);
      h += field(t('portfolio'), '<label class="cm-switch"><input type="checkbox" data-toggle="pf"' + (S.pf ? ' checked' : '') + '><span>' + t('portfolioOn') + '</span></label>');
      h += field(t('terms'), '<textarea class="cm-textarea" dir="auto" data-set="tr" maxlength="400" placeholder="' + esc(t('termsPh')) + '">' + esc(S.tr) + '</textarea>', '', true);
    }
    return h;
  }
  function roleCard(val, title, sub, icon) {
    return '<button type="button" class="cm-role" data-chip="ro" data-val="' + val + '" aria-pressed="' + (S.ro === val) + '">' + icon + '<b>' + title + '</b><small>' + sub + '</small></button>';
  }

  function renderWizard(note) {
    var bars = '';
    for (var i = 1; i <= STEPS; i++) bars += '<span class="' + (i <= step ? 'on' : '') + '"></span>';
    app.innerHTML = '<div class="cm-card cm-fade" id="cmCard">' +
      '<div class="cm-steps" aria-hidden="true">' + bars + '</div>' +
      '<div class="cm-step-head"><h2 class="cm-step-title">' + t('s' + step) + '</h2><span class="cm-step-count">' + t('stepOf', { n: step, m: STEPS }) + '</span></div>' +
      (note ? '<div class="cm-note">' + note + ' <button type="button" class="cm-link" data-go="restart">' + t('restart') + '</button></div>' : '') +
      stepBody() +
      '<p class="cm-error" id="cmError" hidden></p>' +
      '<div class="cm-nav">' +
      (step > 1 ? '<button type="button" class="cm-btn cm-btn-ghost" data-go="back">' + t('back') + '</button>' : '') +
      '<button type="button" class="cm-btn cm-btn-primary" data-go="' + (step < STEPS ? 'next' : 'show') + '">' + (step < STEPS ? t('next') : t('show')) + '</button>' +
      '</div></div>';
  }

  function validate() {
    if (step === 1 && (!S.fn.trim() || !S.cn.trim())) return t('needNames');
    if (step === 3 && total(S) == null) return S.md === 'p' ? t('needPackage') : t('needPrice');
    return '';
  }
  function eachText() {
    var p = perVideo(S);
    return p == null ? '' : t('kEach', { x: amount(p, S) });
  }
  function showError(msg) {
    var el = document.getElementById('cmError');
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
    if (msg) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function scrollToCard() {
    var card = document.getElementById('cmCard') || app;
    var top = card.getBoundingClientRect().top + window.pageYOffset - 90;
    if (Math.abs(window.pageYOffset - top) > 40) window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* ---------- rendering: the finished contract ---------- */
  function build() {
    if (!S.dt) S.dt = today();
    return encodeState(S).then(function (enc) {
      current.url = shareBase() + '#c=' + enc;
      return codeOf(S);
    }).then(function (code) {
      current.code = code;
      return qrDataUrl(current.url);
    }).then(function (qr) { current.qr = qr; });
  }

  function renderResult() {
    var received = mode === 'received';
    var actions =
      (received ? '<button type="button" class="cm-btn cm-btn-primary" data-act="approve">' + t('agree') + '</button>' : '<button type="button" class="cm-btn cm-btn-primary" data-act="send">' + icon('send') + t('send') + '</button>') +
      '<button type="button" class="cm-btn cm-btn-soft" data-act="pdf">' + icon('down') + t('download') + '</button>' +
      '<button type="button" class="cm-btn cm-btn-soft" data-act="copy">' + icon('link') + t('copy') + '</button>' +
      '<button type="button" class="cm-btn cm-btn-soft" data-go="' + (received ? 'editnew' : 'edit') + '">' + icon('edit') + (received ? t('editNew') : t('edit')) + '</button>';
    app.innerHTML =
      '<div class="cm-result cm-fade">' +
      '<div class="cm-ready"><span class="cm-ok">' + icon('ok') + '</span><h2>' + (received ? t('received') : t('ready')) + '</h2><p>' + (received ? t('receivedSub') : t('readySub')) + '</p></div>' +
      '<div class="cm-actions">' + actions + '</div>' +
      '<div class="cm-toolbar"><span class="cm-code-pill">' + t('code') + ' <code>' + esc(current.code) + '</code></span>' +
      '<button type="button" class="cm-link" data-act="dark">' + (paperDark() ? t('darkOff') : t('darkOn')) + '</button></div>' +
      '<article class="cm-paper' + (paperDark() ? ' dark' : '') + '" id="cmPaper">' + paperHTML(S, current.code, current.url, current.qr) + '</article>' +
      '<div class="cm-approve"><h3>' + t('approveTitle') + '</h3><p>' + t('approveText', { ch: esc(chName(S)) }) + '</p><q dir="auto">' + esc(approvalText(S, current.code)) + '</q>' +
      (received ? '' : '<button type="button" class="cm-btn cm-btn-primary" data-act="approve">' + t('agree') + '</button>') +
      (received ? '<a class="cm-link" href="' + esc(shareBase().replace(/#.*$/, '')) + '" data-go="restart">' + t('makeOwn') + '</a>' : '') +
      '</div></div>';
  }

  function icon(name) {
    var p = {
      send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
      down: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
      link: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>',
      edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
      ok: '<path d="M20 6 9 17l-5-5"/>'
    }[name];
    return '<svg class="cm-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  function renderBad() {
    app.innerHTML = '<div class="cm-card cm-fade"><p class="cm-error">' + t('badLink') + '</p><div class="cm-nav"><button type="button" class="cm-btn cm-btn-primary" data-go="restart">' + t('makeOwn') + '</button></div></div>';
  }

  function render(note) {
    if (mode === 'wizard') renderWizard(note);
    else if (mode === 'bad') renderBad();
    else renderResult();
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('cmToast');
    if (!el) { el = document.createElement('div'); el.id = 'cmToast'; el.className = 'cm-toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove(); resolve();
    });
  }

  /* ---------- the file (A4 pages, never cutting a clause in half) ---------- */
  function makePdf() {
    var holder = document.createElement('div');
    holder.className = 'cm-print';
    holder.setAttribute('dir', document.documentElement.dir);
    document.body.appendChild(holder);
    return Promise.all([loadLib('canvas'), loadLib('pdf'), document.fonts ? document.fonts.ready : null]).then(function () {
      // Lay the whole sheet out once at A4 width to measure it. Clauses are the
      // smallest pieces: a section can continue on the next page, but a clause
      // is never cut in half and a section title never sits alone at the bottom.
      holder.innerHTML = '<div class="cm-paper">' + paperHTML(S, current.code, current.url, current.qr) + '</div>';
      var paper = holder.firstChild;
      var head = paper.querySelector('[data-block="head"]');
      var units = [];
      Array.prototype.forEach.call(paper.querySelector('.cm-p-body').children, function (b) {
        if (!b.classList.contains('cm-p-sec')) { units.push({ el: b, h: b.offsetHeight + 14 }); return; }
        var h3 = b.querySelector('h3');
        var over = h3.offsetHeight + 8 + 18 + 14;   // title + its gap, box padding and border, gap after the section
        Array.prototype.forEach.call(b.querySelectorAll('.cm-li'), function (li, j) {
          units.push({ sec: b, h3: h3, li: li, first: j === 0, h: li.offsetHeight + 1, over: over });
        });
      });
      var LIMIT = 1123 - 40 - 24;   // page height − page-number strip − bottom padding
      var pages = [], pg;
      function newPage(first) { pg = { items: [], used: (first ? head.offsetHeight : 0) + 22, open: null }; pages.push(pg); }
      newPage(true);
      units.forEach(function (u) {
        var need = u.el ? u.h : (pg.open === u.sec ? u.h : u.over + u.h);
        if (pg.items.length && pg.used + need > LIMIT) { newPage(false); need = u.el ? u.h : u.over + u.h; }
        if (u.el) { pg.items.push({ el: u.el }); pg.open = null; }
        else if (pg.open === u.sec) pg.items[pg.items.length - 1].lis.push(u.li);
        else { pg.items.push({ h3: u.h3, cont: !u.first, lis: [u.li] }); pg.open = u.sec; }
        pg.used += need;
      });

      var pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      var chain = Promise.resolve();
      pages.forEach(function (list, i) {
        chain = chain.then(function () {
          var page = document.createElement('div');
          page.className = 'cm-page';
          var sheet = document.createElement('div');
          sheet.className = 'cm-paper';
          if (i === 0) sheet.appendChild(head.cloneNode(true));
          var body = document.createElement('div');
          body.className = 'cm-p-body';
          list.items.forEach(function (it) {
            if (it.el) { body.appendChild(it.el.cloneNode(true)); return; }
            var sec = document.createElement('section');
            sec.className = 'cm-p-sec';
            var h3 = it.h3.cloneNode(true);
            if (it.cont) {
              var more = document.createElement('small');
              more.className = 'cm-cont';
              more.textContent = L('تابع', 'continued');
              h3.appendChild(more);
            }
            sec.appendChild(h3);
            var box = document.createElement('div');
            box.className = 'cm-p-items';
            it.lis.forEach(function (li) { box.appendChild(li.cloneNode(true)); });
            sec.appendChild(box);
            body.appendChild(sec);
          });
          sheet.appendChild(body);
          page.appendChild(sheet);
          var num = document.createElement('div');
          num.className = 'cm-page-num';
          num.textContent = (i + 1) + ' / ' + pages.length + '   ·   ' + t('code') + ' ' + current.code;
          page.appendChild(num);
          holder.appendChild(page);
          return window.html2canvas(page, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false }).then(function (canvas) {
            if (i > 0) pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
            page.remove();
          });
        });
      });
      return chain.then(function () { return pdf; });
    }).then(function (pdf) {
      holder.remove();
      return pdf;
    }, function (err) {
      holder.remove();
      throw err;
    });
  }
  function fileName() { return L('عقد مونتاج ', 'Editing contract ') + current.code + '.pdf'; }

  function busy(btn, on) {
    if (!btn) return;
    if (on) { btn._html = btn.innerHTML; btn.innerHTML = '<span class="cm-spin"></span>' + t('making'); btn.disabled = true; }
    else { btn.innerHTML = btn._html || btn.innerHTML; btn.disabled = false; }
  }

  function doPdf(btn) {
    busy(btn, true);
    return makePdf().then(function (pdf) { pdf.save(fileName()); })
      .catch(function (e) { console.error(e); toast(t('fileFail')); })
      .then(function () { busy(btn, false); });
  }

  function shareMessage() {
    return L('هذا عقد المونتاج بيننا (النسخة ' + S.ver + '، الرمز ' + current.code + '). افتحه من الرابط، وإذا موافق رد بالرسالة اللي في آخره:\n',
             'Here is our editing contract (version ' + S.ver + ', code ' + current.code + '). Open it from the link, and if you agree, reply with the message at its end:\n') + current.url;
  }

  // Phone number of the other side, if the chat app is WhatsApp and it looks like a number
  function phoneOf(who) {
    var raw = who === 'f' ? S.fx : S.cx;
    var d = digits(raw).replace(/[^\d]/g, '');
    return S.ch === 'wa' && d.length >= 8 ? d : '';
  }
  function openChat(text, who) {
    if (S.ch === 'wa') {
      var ph = phoneOf(who);
      window.open('https://wa.me/' + ph + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      return;
    }
    if (S.ch === 'tg') { window.open('https://t.me/share/url?url=' + encodeURIComponent(current.url) + '&text=' + encodeURIComponent(text.replace(current.url, '')), '_blank', 'noopener'); return; }
    if (S.ch === 'em') {
      var mail = who === 'f' ? S.fx : S.cx;
      location.href = 'mailto:' + (/@/.test(mail) ? encodeURIComponent(mail.trim()) : '') + '?subject=' + encodeURIComponent(L('عقد المونتاج', 'Editing contract')) + '&body=' + encodeURIComponent(text);
      return;
    }
    copyText(text).then(function () { toast(t('msgCopied', { ch: chName(S) })); });
  }

  function isPhone() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
  }

  // On a phone the file itself goes through the share sheet (WhatsApp, Telegram…);
  // on a computer the chat opens with the link, which shows the same contract
  function doSend(btn) {
    var other = S.ro === 'c' ? 'f' : 'c';
    var canFiles = isPhone() && navigator.canShare && window.File;
    if (!canFiles) { openChat(shareMessage(), other); return; }
    busy(btn, true);
    makePdf().then(function (pdf) {
      var file = new File([pdf.output('blob')], fileName(), { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], text: shareMessage() }).catch(function (e) { if (e && e.name !== 'AbortError') throw e; });
      }
      openChat(shareMessage(), other);
    }).catch(function (e) { console.error(e); openChat(shareMessage(), other); })
      .then(function () { busy(btn, false); });
  }

  function doApprove() {
    // A received contract goes back to whoever made it; your own goes to the other side
    var to = mode === 'received' ? S.ro : (S.ro === 'c' ? 'f' : 'c');
    openChat(approvalText(S, current.code), to);
  }

  /* ---------- events ---------- */
  app.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-set')) {
      S[el.getAttribute('data-set')] = el.value;
      if (/^(cuo|kp)$/.test(el.getAttribute('data-set'))) updateTotal();
      saveDraft();
    } else if (el.hasAttribute('data-num')) {
      var nk = el.getAttribute('data-num'), n = parseInt(digits(el.value), 10);
      if (!isNaN(n)) { S[nk] = Math.min(NUMS[nk][1], Math.max(NUMS[nk][0], n)); updateTotal(); saveDraft(); }
    } else if (el.hasAttribute('data-vid')) {
      S.vd[+el.getAttribute('data-vid')][el.getAttribute('data-vf')] = el.value;
      if (el.getAttribute('data-vf') === 'p') updateTotal();
      saveDraft();
    }
  });
  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-toggle')) { S[el.getAttribute('data-toggle')] = el.checked ? 1 : 0; saveDraft(); }
  });
  function updateTotal() {
    var el = document.getElementById('cmTotal');
    if (el) el.textContent = amount(total(S), S);
    var each = document.getElementById('cmEach');
    if (each) each.textContent = eachText();
  }

  app.addEventListener('click', function (e) {
    var el = e.target.closest('button, a');
    if (!el || !app.contains(el)) return;
    var v;
    if (el.hasAttribute('data-chip')) {
      var key = el.getAttribute('data-chip');
      v = el.getAttribute('data-val');
      S[key] = key === 'dp' ? parseInt(v, 10) : v;
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-multi')) {
      var mk = el.getAttribute('data-multi');
      v = el.getAttribute('data-val');
      var i = S[mk].indexOf(v);
      if (i === -1) S[mk].push(v); else S[mk].splice(i, 1);
      var order = OPT[mk === 'in' ? 'in' : 'pm'].map(function (o) { return o[0]; });
      S[mk].sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-step-key')) {
      var sk = el.getAttribute('data-step-key');
      S[sk] = Math.min(NUMS[sk][1], Math.max(NUMS[sk][0], S[sk] + parseInt(el.getAttribute('data-delta'), 10)));
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-vadd')) {
      S.vd.push({ d: '', l: '', p: S.vd.length ? S.vd[S.vd.length - 1].p : '', t: '' });
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-vrm')) {
      S.vd.splice(+el.getAttribute('data-vrm'), 1);
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-go')) {
      e.preventDefault();
      go(el.getAttribute('data-go'));
    } else if (el.hasAttribute('data-act')) {
      var act = el.getAttribute('data-act');
      if (act === 'pdf') doPdf(el);
      else if (act === 'send') doSend(el);
      else if (act === 'copy') copyText(current.url).then(function () { toast(t('copied')); });
      else if (act === 'approve') doApprove();
      else if (act === 'dark') { dark = !paperDark(); keepScroll(render); }
    }
  });

  function keepScroll(fn) {
    var y = window.pageYOffset;
    fn();
    window.scrollTo(0, y);
  }

  function go(where) {
    if (where === 'next') {
      var err = validate();
      if (err) { showError(err); return; }
      step = Math.min(STEPS, step + 1); saveDraft(); render(); scrollToCard();
    } else if (where === 'back') {
      step = Math.max(1, step - 1); saveDraft(); render(); scrollToCard();
    } else if (where === 'show') {
      for (var s = 1; s <= STEPS; s++) { step = s; var bad = validate(); if (bad) { render(); showError(bad); scrollToCard(); return; } }
      step = STEPS;
      S = normalize(S);
      build().then(function () {
        mode = 'result'; saveDraft(); render(); scrollToCard();
        history.replaceState(history.state, '', location.href.split('#')[0]);
      }).catch(function (e) { console.error(e); showError(t('fileFail')); });
    } else if (where === 'edit') {
      mode = 'wizard'; step = 1; render(); scrollToCard();
    } else if (where === 'editnew') {
      S.ver += 1; S.dt = today(); fromLink = false;
      mode = 'wizard'; step = 1; saveDraft(); render(); scrollToCard();
      history.replaceState(history.state, '', location.href.split('#')[0]);
    } else if (where === 'restart') {
      clearDraft(); S = clone(DEF); step = 1; mode = 'wizard'; fromLink = false;
      history.replaceState(history.state, '', location.href.split('#')[0]);
      render(); scrollToCard();
    }
  }

  // Follow the site's AR / EN switch: everything re-renders in the new language.
  // The moon / sun button only matters for the sheet (it follows the site unless set by hand).
  new MutationObserver(function (list) {
    var langChanged = list.some(function (m) { return m.attributeName === 'lang'; });
    if (langChanged) { keepScroll(render); return; }
    var paper = document.getElementById('cmPaper');
    if (paper && dark === null) {
      paper.classList.toggle('dark', paperDark());
      var btn = app.querySelector('[data-act="dark"]');
      if (btn) btn.textContent = paperDark() ? t('darkOff') : t('darkOn');
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });

  /* ---------- start ---------- */
  function start() {
    var m = location.hash.match(/[#&]c=([A-Za-z0-9_-]+)/);
    if (m) {
      app.innerHTML = '<div class="cm-card"><span class="cm-spin dark"></span></div>';
      decodeState(m[1]).then(function (s) {
        S = s; fromLink = true; mode = 'received';
        return build();
      }).then(function () { render(); })
        .catch(function (e) { console.error(e); S = clone(DEF); mode = 'bad'; render(); });
      return;
    }
    var d = loadDraft();
    if (d) {
      S = normalize(d.s); step = Math.min(STEPS, Math.max(1, d.step || 1));
      render(t('resumed'));
    } else {
      S = clone(DEF);
      render();
    }
  }
  start();
  // A contract link opened while the page is already open (same address, new #c=…)
  window.addEventListener('hashchange', function () {
    if (/[#&]c=/.test(location.hash)) { start(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
})();
