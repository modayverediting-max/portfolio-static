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
  // The contract service (a small Cloudflare Worker, folder «خادم التوثيق» next to the site
  // folder): short links, and the e-mail confirmation. Empty = both stay off.
  // VERIFY: the e-mail confirmation also needs the mail service (Resend + the domain's DNS);
  // until that is set up, only the short link uses API and the confirmation option stays hidden.
  // On this PC a test copy can be set with localStorage 'modayver-cm-api' and
  // 'modayver-cm-verify' = '1' (honoured on localhost only).
  var API = 'https://modayver-contracts.modayver-contracts.workers.dev';   // his Cloudflare account (2026-11-05)
  var VERIFY = true;   // mail service live: Resend, domain verified 2026-11-05
  try {
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      if (localStorage.getItem('modayver-cm-api')) API = localStorage.getItem('modayver-cm-api');
      if (localStorage.getItem('modayver-cm-verify') === '1') VERIFY = true;
    }
  } catch (e) {}
  var MAIL_RE = /^[^\s@<>()[\]\\,;:"']{1,64}@[A-Za-z0-9.-]{1,180}\.[A-Za-z]{2,24}$/;   // same rule as the service
  var STEPS = 6;
  var MAX_VIDEOS = 20;

  /* ---------- language ---------- */
  function isEn() { return document.documentElement.lang === 'en'; }
  function L(ar, en) { return isEn() ? en : ar; }

  var UI = {
    restart: ['ابدأ من جديد', 'Start over'],
    resumed: ['تابعنا من حيث توقفت.', 'Picked up where you left off.'],
    stepOf: ['الخطوة {n} من {m}', 'Step {n} of {m}'],
    next: ['التالي', 'Next'],
    back: ['السابق', 'Back'],
    show: ['اعرض العقد', 'Show the contract'],
    optional: ['اختياري', 'optional'],
    // step titles
    s1: ['الطرفان', 'The two sides'],
    s2: ['المشروع', 'The project'],
    s3: ['الفيديوهات والسعر', 'Videos & price'],
    s4: ['ما الذي يشمله السعر؟', 'What the price includes'],
    s5: ['الدفع', 'Payment'],
    s6: ['التعديلات والمواعيد', 'Revisions & timing'],
    // step 1
    who: ['من أنت؟', 'Who are you?'],
    roleF: ['أنا الفريلانسر', "I'm the freelancer"],
    roleFsub: ['الذي سينفّذ المونتاج', "I'll do the editing"],
    roleC: ['أنا العميل', "I'm the client"],
    roleCsub: ['صاحب الفيديو', 'I own the video'],
    fl: ['الفريلانسر', 'Freelancer'],
    cl: ['العميل', 'Client'],
    you: ['أنت', 'You'],
    name: ['الاسم', 'Name'],
    namePh: ['الاسم الذي يظهر في العقد', 'Name shown in the contract'],
    country: ['الدولة', 'Country'],
    countryPh: ['مثلًا: السعودية', 'e.g. Saudi Arabia'],
    contact: ['رقم التواصل أو الحساب', 'Phone number or handle'],
    contactPh: ['مثلًا: 966500000000+', 'e.g. +966500000000'],
    channel: ['وسيلة التواصل بين الطرفين', 'Where will you talk?'],
    channelHint: ['تكون كل الموافقات والملاحظات مكتوبة عبرها.', 'All approvals and notes are written here.'],
    other: ['اكتبها', 'Type it'],
    // step 2
    type: ['نوع الفيديو', 'Video type'],
    style: ['الستايل المطلوب', 'Requested style'],
    stylePh: ['مثلًا: قص سريع، ونصوص متحركة، ومؤثرات صوتية', 'e.g. fast cuts, animated captions, sound effects'],
    ref: ['رابط فيديو مرجعي', 'Reference video link'],
    refHint: ['أفضل وسيلة لتجنّب سوء الفهم حول الستايل. وإن لم يوجد مرجع، يختار الفريلانسر الستايل المناسب.', 'The best way to avoid “that’s not what I wanted”. With no reference, the freelancer picks a suitable style.'],
    size: ['المقاس', 'Size'],
    quality: ['الجودة', 'Quality'],
    // step 3
    currency: ['العملة', 'Currency'],
    currencySmall: ['يمكن اختيار أكثر من عملة', 'you can pick more than one'],
    curMain: ['أساسية', 'main'],
    curOwnPh: ['عملة أخرى؟ اكتبها ثم اضغط Enter أو «أضف»، مثل: جنيه مصري', 'Another currency? Type it, then Enter or “Add” — e.g. Egyptian pound'],
    curHint: ['العملة الأساسية للأسعار: {main}. ويمكن الدفع أيضًا بـ: {others}، بسعر الصرف يوم الدفع. ولتغيير العملة الأساسية، ألغِ اختيارها.',
              'Prices are in {main}. Payment is also accepted in: {others}, at the exchange rate on the payment day. To change the main currency, unselect it.'],
    videos: ['الفيديوهات', 'Videos'],
    video: ['فيديو', 'Video'],
    vDesc: ['وصف الفيديو', 'What’s the video?'],
    vDescSmall: ['باختصار، اختياري', 'short description, optional'],
    vDescPh: ['مثلًا: إعلان عروض نهاية الأسبوع', 'e.g. weekend sale ad'],
    vLen: ['المدة', 'Length'],
    vLenPh: ['مثلًا: 60 ثانية', 'e.g. 60 sec'],
    vPrice: ['السعر', 'Price'],
    vDate: ['موعد التسليم', 'Delivery date'],
    vDateHint: ['موعد التسليم: هو موعد إرسال الفريلانسر النسخة الأولى الكاملة من الفيديو للمراجعة.', 'Delivery date = when the freelancer sends the first full version of the video for review.'],
    add: ['+ أضف فيديو', '+ Add a video'],
    remove: ['حذف', 'Remove'],
    total: ['المجموع', 'Total'],
    pricing: ['طريقة التسعير', 'How is it priced?'],
    kCount: ['عدد الفيديوهات', 'Number of videos'],
    kPrice: ['سعر الباقة كاملة', 'Price of the whole package'],
    kEach: ['أي نحو {x} للفيديو الواحد', 'That’s about {x} per video'],
    kDesc: ['وصف الفيديوهات', 'What are the videos?'],
    kDescPh: ['مثلًا: مقاطع ريلز إعلانية للمتجر', 'e.g. promo reels for the store'],
    kLen: ['المدة التقريبية للفيديو', 'Approximate length'],
    kLenPh: ['مثلًا: من 30 إلى 60 ثانية', 'e.g. 30–60 seconds'],
    kSched: ['جدول التسليم', 'Delivery schedule'],
    kSchedPh: ['مثلًا: 3 فيديوهات كل أسبوع', 'e.g. 3 videos every week'],
    kSchedHint: ['اكتب كم فيديو وكل كم مدة، لا رقمًا وحده، ليكون واضحًا للطرفين.', 'Write how many videos and how often — not a number alone — so it’s clear to both sides.'],
    kLast: ['آخر موعد لتسليم كل الفيديوهات', 'Last date for all videos'],
    kHint: ['لا حاجة إلى إدخال كل فيديو على حدة؛ يكفي العدد والسعر.', 'No need to list every video: the count and the price are enough.'],
    needPackage: ['اكتب عدد الفيديوهات وسعر الباقة (بالأرقام فقط).', 'Enter the number of videos and the package price (numbers only).'],
    // step 4
    incl: ['اختر كل ما يشمله السعر', 'Pick everything the price covers'],
    inclOther: ['أعمال أخرى يشملها السعر', 'Something else included'],
    inclOtherPh: ['مثلًا: التحريك الاحترافي للكتابة', 'e.g. professional text animation'],
    inclOtherHint: ['اكتب العمل ثم اضغط Enter أو «أضف»، فيظهر مع الخيارات فوق. ولحذفه اضغط عليه.', 'Type it, then press Enter or “Add”: it joins the choices above. Tap it to remove it.'],
    addItem: ['أضف', 'Add'],
    removeItem: ['اضغط للحذف', 'Tap to remove'],
    ioMax: ['يكفي 6 أعمال إضافية. اكتب الباقي في «شروط إضافية».', 'Six extra items is the limit. Put the rest in “Extra terms”.'],
    music: ['مصدر الموسيقى', 'Who provides the music?'],
    // step 5
    payBy: ['طريقة الدفع', 'Payment method'],
    account: ['بيانات الحساب', 'Account details'],
    accountPh: ['مثلًا: بريد PayPal أو رقم الحساب البنكي', 'e.g. PayPal email or account number'],
    deposit: ['الدفعة المقدمة (العربون)', 'Upfront payment (deposit)'],
    depositHint: ['تُدفع قبل بدء العمل، ويُدفع الباقي بعد موافقة العميل على الفيديو.', 'Paid before work starts; the rest after the client approves the video.'],
    scope: ['كيف تُدفع الفيديوهات؟', 'How are the videos paid?'],
    scopeHint: ['«كل فيديو وحده»: يُدفع كل فيديو في وقته. «المشروع كله معًا»: يُدفع العربون مرة واحدة قبل البدء، والباقي مرة واحدة بعد الموافقة على كل الفيديوهات.', '“Video by video”: each video is paid in its own time. “All together”: one deposit before starting, and the rest once all the videos are approved.'],
    fees: ['من يتحمّل رسوم التحويل؟', 'Who pays transfer fees?'],
    // step 6
    rounds: ['مرات التعديل المجانية لكل فيديو', 'Free revisions per video'],
    extra: ['سعر مرة التعديل الإضافية', 'Price of an extra revision'],
    review: ['مدة مراجعة العميل للفيديو', 'Time for the client to review'],
    turn: ['مدة تنفيذ كل مرة تعديل', 'Time to apply each revision'],
    notice: ['المهلة عند عدم الرد', 'Wait time if someone stops replying'],
    noticeHint: ['إذا توقف أحد الطرفين عن الرد، فهذه هي المدة التي ينتظرها الآخر قبل أن يُعتبر ذلك إلغاءً.', 'If one side stops replying, how long the other waits before it counts as cancelling.'],
    workDays: ['أيام العمل والتوقيت', 'Work days & time zone'],
    workDaysPh: ['مثلًا: من الأحد إلى الخميس، بتوقيت مكة', 'e.g. Sun–Thu, Mecca time'],
    workDaysHint: ['إن تُركت فارغة، تُعتمد أيام العمل الرسمية وتوقيت بلد الفريلانسر.', "If left empty: the official work days and time zone of the freelancer's country."],
    portfolio: ['معرض الأعمال', 'Portfolio'],
    portfolioOn: ['يسمح العميل للفريلانسر بعرض الفيديو في معرض أعماله بعد نشره', 'The client lets the freelancer show the video in their portfolio after it’s published'],
    terms: ['شروط إضافية', 'Extra terms'],
    termsPh: ['أي اتفاق آخر غير مذكور في البنود', 'Anything you agreed that isn’t covered'],
    workDay: ['أيام عمل', 'work days'],
    keep: ['مدة احتفاظ الفريلانسر بملفات المشروع بعد التسليم', 'How long the freelancer keeps the project files after delivery'],
    keepHint: ['بعد هذه المدة لا يُطالَب الفريلانسر بالملفات، فاتفقا عليها قبل البدء.', 'After this, the freelancer isn’t responsible for the files — agree on it before starting.'],
    unitH: ['بالساعات', 'In hours'],
    unitD: ['بأيام العمل', 'In work days'],
    hourU: ['ساعة', 'hours'],
    rvHint: ['تبدأ المدة من وقت وصول الفيديو إلى العميل. والساعات أدق من الأيام، فلا يختلف الطرفان في حسابها.', 'The time starts when the video reaches the client. Hours are more precise than days, so there’s nothing to disagree about.'],
    // validation
    needNames: ['اكتب اسم الفريلانسر واسم العميل.', 'Enter both the freelancer’s and the client’s name.'],
    needPrice: ['اكتب سعر كل فيديو (بالأرقام فقط).', 'Enter a price for every video (numbers only).'],
    // result
    ready: ['العقد جاهز', 'Your contract is ready'],
    readySub: ['راجِعه، ثم نزّله أو أرسله إلى الطرف الآخر.', 'Check it, then download it or send it to the other side.'],
    received: ['وصلك عقد مونتاج', 'You received an editing contract'],
    receivedSub: ['هذه هي النسخة الأصلية كما أُرسلت تمامًا. اقرأ العقد، وإن كنت موافقًا فاضغط «أوافق».', 'This is the original, exactly as it was sent. Read it, and if you agree, press “I agree”.'],
    receivedSubMail: ['هذه هي النسخة الأصلية كما أُرسلت تمامًا. تحت هذا حالة التوثيق بالبريد لكل طرف، ثم العقد كاملًا.', 'This is the original, exactly as it was sent. Below: where each side stands on the e-mail confirmation, then the full contract.'],
    badLink: ['الرابط ناقص أو تالف. اطلب من الطرف الآخر إرساله مرة أخرى.', 'This link is incomplete or broken. Ask the other side to send it again.'],
    download: ['تنزيل العقد', 'Download'],
    send: ['أرسل العقد', 'Send it'],
    sendLink: ['أرسل رابطًا', 'Send a link'],
    linkFail: ['تعذّر تجهيز الرابط الآن. أرسل العقد ملفًا، أو حاول بعد قليل.', 'Couldn’t make the link right now. Send the file instead, or try again shortly.'],
    shareMissing: ['لم تجد واتساب في القائمة؟ نزّل الملف ثم أرفقه في المحادثة بنفسك:', 'WhatsApp not in the list? Download the file and attach it in the chat yourself:'],
    copy: ['نسخ الرابط', 'Copy link'],
    edit: ['تعديل', 'Edit'],
    makeOwn: ['اصنع عقدك', 'Make your own'],
    darkOn: ['قراءة داكنة', 'Dark reading'],
    darkOff: ['قراءة فاتحة', 'Light reading'],
    agree: ['أوافق — أرسل موافقتي', 'I agree — send my approval'],
    approveTitle: ['الموافقة على العقد', 'Approving the contract'],
    approveText: ['يرسل كل طرف هذه الرسالة عبر {ch}:', 'Each side sends this message on {ch}:'],
    copied: ['تم النسخ', 'Copied'],
    datePh: ['يوم/شهر/سنة', 'dd/mm/yyyy'],
    datePick: ['اختر التاريخ من التقويم', 'Pick the date from the calendar'],
    dateBad: ['اكتب التاريخ كاملًا بهذا الشكل: يوم/شهر/سنة، مثل 01/12/2026، أو اختره من التقويم.', 'Write the full date as dd/mm/yyyy, e.g. 01/12/2026, or pick it from the calendar.'],
    copyFail: ['تعذّر النسخ، اضغط «نسخ الرابط» مرة أخرى.', 'Couldn’t copy. Press “Copy link” again.'],
    msgCopied: ['نُسخت الرسالة، أرسلها عبر {ch}', 'Message copied — send it on {ch}'],
    making: ['جارٍ تجهيز الملف…', 'Preparing the file…'],
    fileFail: ['تعذّر تجهيز الملف. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.', 'We couldn’t prepare the file. Check your connection and try again.'],
    code: ['رمز العقد', 'Contract code'],
    ver: ['النسخة', 'Version'],
    // sending
    attachHint: ['نزّلنا ملف العقد. أرفقه في محادثة {ch} مع الرسالة، ثم أرسل.', 'The contract file is downloaded. Attach it in the {ch} chat with the message, then send.'],
    attachMail: ['نزّلنا ملف العقد. أرفقه في رسالة البريد، ثم أرسل.', 'The contract file is downloaded. Attach it to the email, then send.'],
    attachCopy: ['نسخنا الرسالة ونزّلنا ملف العقد. الصق الرسالة في {ch} وأرفق معها الملف، ثم أرسل.', 'Message copied and file downloaded. Paste the message on {ch}, attach the file, then send.'],
    openChat: ['افتح {ch}', 'Open {ch}'],
    tapSend: ['الملف جاهز — اضغط للإرسال', 'File ready — tap to send'],
    // the deal at a glance (above the clauses)
    sumTotal: ['المبلغ الإجمالي', 'Total'],
    sumPack: ['سعر الباقة', 'Package price'],
    sumPay: ['الدفع', 'Payment'],
    sumRev: ['التعديلات المجانية', 'Free revisions'],
    sumDate: ['موعد التسليم', 'Delivery date'],
    sumLast: ['آخر موعد للتسليم', 'Last delivery date'],
    // e-mail confirmation (optional)
    vmTitle: ['توثيق الموافقة بالبريد', 'Confirm by e-mail'],
    vmOn: ['أريد أن يؤكد الطرفان موافقتهما بالبريد', 'Both sides confirm their approval by e-mail'],
    vmHint: ['لمزيد من الثقة: يصل لكل طرف بريد من موقعنا ليؤكد موافقته بضغطة، ويظهر على العقد ختم «موثّق بالبريد». وبعدها لا يتغيّر العقد إلا بتعديل يؤكده الطرفان من جديد. ولإرسال الرسائل نحفظ بريد الطرفين واسميهما وتاريخ موافقة كل منهما فقط، لا نص العقد.', 'For more trust: each side gets an e-mail from our site to confirm with one click, and the contract shows a “Confirmed by e-mail” stamp. After that it only changes through an amendment both confirm again. To send the e-mails we keep only both addresses, both names and the approval dates — never the contract text.'],
    fMail: ['بريد الفريلانسر', 'Freelancer’s e-mail'],
    cMail: ['بريد العميل', 'Client’s e-mail'],
    needMails: ['اكتب بريد الفريلانسر وبريد العميل بشكل صحيح، أو ألغِ التوثيق بالبريد.', 'Enter both e-mail addresses correctly, or turn off e-mail confirmation.'],
    sameMail: ['يجب أن يكون لكل طرف بريد مختلف.', 'Each side needs a different e-mail address.'],
    vTitle: ['التوثيق بالبريد', 'E-mail confirmation'],
    vIntro: ['عند الضغط على الزر تصل لكل طرف رسالة على بريده ليؤكد موافقته، ولا يُوثَّق العقد إلا بعد تأكيد الطرفين.', 'Press the button and each side gets an e-mail to confirm. The contract is confirmed only once both have.'],
    vSend: ['أوافق — أرسل رسائل التأكيد', 'I agree — send the confirmation e-mails'],
    vResend: ['أعد إرسال رسائل التأكيد', 'Send the e-mails again'],
    vSending: ['جارٍ الإرسال…', 'Sending…'],
    vSent: ['أُرسلت الرسائل، وتصل خلال دقيقة. وإن لم تجدها فابحث في الرسائل غير المرغوب فيها.', 'Sent — they arrive within a minute. If not, check the spam folder.'],
    vWait: ['أُرسلت رسائل قبل قليل. انتظر بضع دقائق ثم حاول مرة أخرى.', 'E-mails were just sent. Wait a few minutes and try again.'],
    vBadMail: ['تحقق من عنواني البريد في العقد.', 'Check the two e-mail addresses in the contract.'],
    vError: ['تعذّر الاتصال بخدمة التوثيق الآن. حاول بعد قليل.', 'Couldn’t reach the confirmation service. Try again shortly.'],
    vLoading: ['جارٍ التحقق…', 'Checking…'],
    vDone: ['أكّد موافقته يوم {d}', 'confirmed on {d}'],
    vPending: ['بانتظار تأكيده<br><small>أُرسل الرابط إلى {m}</small>', 'waiting<br><small>link sent to {m}</small>'],
    vNotYet: ['لم تُرسل له رسالة بعد', 'not e-mailed yet'],
    vLocked: ['العقد موثّق بالبريد', 'Confirmed by e-mail'],
    vLockedSub: ['أكّد الطرفان موافقتهما يوم {d}، فالعقد ثابت كما وافقا عليه، ولا يتغيّر إلا بتعديل يوافق عليه الطرفان كلاهما.', 'Both sides confirmed on {d}, so the contract stays as they agreed; it only changes through an amendment both agree to.'],
    vMeTitle: ['أكّد موافقتك', 'Confirm your approval'],
    vMeText: ['أنت تؤكد موافقتك على هذا العقد بصفتك {r}. اقرأ العقد أولًا، ثم اضغط الزر هنا أو في آخره.', 'You are confirming this contract as {r}. Read it first, then press the button here or at its end.'],
    vMeWait: ['ننتظر الآن تأكيد الطرف الآخر، وتصل لكما رسالة حين يكتمل التوثيق.', 'Now waiting for the other side. You’ll both get an e-mail once it’s complete.'],
    vEndText: ['قرأت العقد؟ إن كنت موافقًا عليه، فأكّد موافقتك من هنا.', 'Read it all? If you agree, confirm here.'],
    vMeBtn: ['أؤكد موافقتي', 'I confirm'],
    vMeDone: ['أكّدتَ موافقتك على هذا العقد. شكرًا لك.', 'You confirmed this contract. Thank you.'],
    vOther: ['رابط التأكيد هذا يخص نسخة أخرى من العقد، لذلك لا يمكن التأكيد هنا. افتح الرابط الأحدث من بريدك.', 'This confirmation link belongs to another version of the contract, so it can’t be used here. Open the newest link from your e-mail.'],
    vBadLink: ['رابط التأكيد غير صالح. اطلب رسالة جديدة من صفحة العقد.', 'This confirmation link isn’t valid. Ask for a new e-mail from the contract page.'],
    vStamp: ['موثّق بالبريد', 'Confirmed by e-mail'],
    vMail: ['البريد', 'E-mail'],
    vMsgMail: ['مرحبًا، هذا عقد المونتاج بيننا في الملف المرفق.\nوستصلك رسالة على بريدك لتؤكد موافقتك عليه.', 'Hi, here is our editing contract (attached file).\nYou’ll also get an e-mail to confirm your approval.'],
    // short link (with the service): the message carries a one-line link, nothing to attach
    shortMsg: ['مرحبًا، هذا عقد المونتاج بيننا:\n{link}\nإن كنت موافقًا عليه، فأرسل: «{ok}»', 'Hi, here is our editing contract:\n{link}\nIf you agree, reply with: “{ok}”'],
    shortMsgMail: ['مرحبًا، هذا عقد المونتاج بيننا:\n{link}\nوستصلك رسالة على بريدك لتؤكد موافقتك عليه.', 'Hi, here is our editing contract:\n{link}\nYou’ll also get an e-mail to confirm your approval.'],
    linkMaking: ['جارٍ تجهيز الرابط…', 'Preparing the link…'],
    chatOpened: ['فُتحت المحادثة والرسالة جاهزة، وفيها رابط قصير يفتح العقد. ويُحفظ العقد مشفّرًا، فلا يقرؤه إلا من معه الرابط.', 'The chat is open with the message ready, including a short link to the contract. The contract is stored encrypted, so only people with the link can read it.'],
    tooLong: ['صار العقد أطول مما يتسع له الرابط. اختصر الأوصاف أو الشروط الإضافية، أو اصنع عقدًا جديدًا.', 'The contract is now longer than a link can carry. Shorten the descriptions or extra terms, or make a new contract.'],
    // amendments: an agreed change added to the same contract, with what was there before and after
    amAdd: ['أضف تعديلًا', 'Add an amendment'],
    amBanner: ['أنت تُعدّ تعديلًا على العقد {c}، وسيصير النسخة {v}. غيّر ما اتفقتما عليه فقط، وسيُكتب في أول العقد ما كان قبله وما صار بعده.', 'You are preparing an amendment to contract {c}; it will become version {v}. Change only what you agreed on: the start of the contract will show what it was before and what it is now.'],
    amCancel: ['إلغاء التعديل', 'Cancel the amendment'],
    amWhat: ['ما تغيّر في هذا التعديل', 'What this amendment changes'],
    amNoneYet: ['لم تغيّر أي بند بعد. ارجع إلى الخطوات السابقة وغيّر ما اتفقتما عليه.', 'Nothing has changed yet. Go back to the earlier steps and change what you agreed on.'],
    amNone: ['لم تغيّر أي بند في العقد بعد. غيّر ما اتفقتما عليه، ثم اضغط «اعرض العقد».', 'Nothing in the contract has changed yet. Change what you agreed on, then press “Show the contract”.'],
    amWhy: ['سبب التعديل', 'Reason for the amendment'],
    amWhyPh: ['مثلًا: أضفنا فيديو بطلب العميل', 'e.g. one more video, as the client asked'],
    amMax: ['وصل هذا العقد إلى أكبر عدد من التعديلات. اصنع عقدًا جديدًا.', 'This contract holds as many amendments as it can. Make a new contract.'],
    amReady: ['التعديل جاهز', 'Your amendment is ready'],
    amReadySub: ['راجِعه، ثم أرسله إلى الطرف الآخر. ولا يُعتمد التعديل إلا إذا وافق عليه الطرفان كلاهما.', 'Check it, then send it to the other side. The amendment only counts once both sides agree to it.'],
    amReceived: ['وصلك تعديل على عقد المونتاج', 'You received an amendment to the editing contract'],
    amReceivedSub: ['هذه النسخة {v} من العقد. في أوله «سجل التعديلات»: ما كان قبل كل تعديل وما صار بعده. ولا يُعتمد التعديل إلا إذا وافق عليه الطرفان كلاهما، حتى من وافق منهما على النسخة السابقة.', 'This is version {v} of the contract. At its start, “Amendments” shows what each change was before and what it is now. An amendment only counts once both sides agree to it — even one who agreed to the previous version.'],
    amTitle: ['سجل التعديلات', 'Amendments'],
    amIntro: ['عُدِّل هذا العقد بعد نسخته الأولى، وكل تعديل مكتوب هنا: ما كان قبله، وما صار بعده. ولا يُعتمد أي تعديل إلا إذا وافق عليه الطرفان كلاهما، حتى من وافق منهما على النسخة السابقة.', 'This contract was amended after its first version, and every amendment is written here: what it was before, and what it is now. No amendment counts unless both sides agree to it — even one who agreed to the previous version.'],
    amN: ['التعديل {n}', 'Amendment {n}'],
    amLatest: ['الأحدث', 'Latest'],
    amFromTo: ['من النسخة {a} إلى النسخة {b}', 'Version {a} to version {b}'],
    amTerm: ['البند', 'Term'],
    amBefore: ['قبل', 'Before'],
    amAfter: ['بعد', 'After'],
    amWhyShow: ['سبب التعديل:', 'Reason:'],
    amOf: ['النسخة التي عُدِّلت: النسخة {v}، بتاريخ {d}، رمزها {c}.', 'The version amended: version {v}, dated {d}, code {c}.'],
    amBad: ['تنبيه: هذا السجل لا يطابق رمز تلك النسخة، فلا تعتمد عليه قبل أن تقارنه بالنسخة التي عندك.', 'Warning: this record doesn’t match that version’s code — compare it with your own copy before relying on it.'],
    amNoVid: ['لا يوجد', 'Not there'],
    amGone: ['حُذف', 'Removed'],
    amNotSet: ['لم يُحدَّد', 'Not set'],
    amInPack: ['ضمن الباقة', 'Part of the package'],
    amRest: ['باقي البنود لم تتغيّر، وتبقى كما اتفق عليها الطرفان.', 'Every other term is unchanged and stays as both sides agreed.'],
    amVsBoth: ['أكّدها الطرفان بالبريد يوم {d}.', 'Both sides confirmed it by e-mail on {d}.'],
    amVsOne: ['أكّدها {who} بالبريد يوم {d}، ولم يؤكدها {other}.', '{who} confirmed it by e-mail on {d}; {other} did not.'],
    amVsNone: ['لم يؤكدها أحد بالبريد.', 'Nobody confirmed it by e-mail.'],
    // before agreeing: read it all, ask about anything unclear (red, with a box to tick)
    readWarn: ['قبل أن توافق: اقرأ العقد كاملًا، بكل بنوده وشروطه، واسأل الطرف الآخر عن أي تفصيل لم تفهمه (اضغط «اسأل» بجانب السطر). فموافقتك تعني أنك فهمت كل ما فيه وتوافق عليه.', 'Before you agree: read the whole contract, every clause and term, and ask the other side about any detail you don’t understand (press “Ask” next to the line). Agreeing means you understood all of it and accept it.'],
    // questions and answers written into the contract, under the line they are about
    clause: ['البند {s}، السطر {i}', 'clause {s}, line {i}'],
    qaHint: ['عندك سؤال عن بند؟ اضغط «اسأل» بجانب السطر واكتب سؤالك، فيُكتب في العقد تحت السطر ويجيب عنه الطرف الآخر هناك.', 'A question about a clause? Press “Ask” next to the line and write it: it is written into the contract under that line, and the other side answers it there.'],
    qaAskBtn: ['اسأل', 'Ask'],
    qaAskTitle: ['اسأل عن هذا السطر', 'Ask about this line'],
    qaAskLabel: ['سؤالك عن {k}', 'Your question about {k}'],
    qaAnsLabel: ['جوابك عن هذا السؤال', 'Your answer to this question'],
    qaAskPh: ['مثلًا: هل تُحسب أيام العطل من مدة المراجعة؟', 'e.g. Do holidays count in the review time?'],
    qaAnsPh: ['اكتب جوابك بوضوح', 'Write your answer clearly'],
    qaAskNote: ['يُكتب سؤالك في العقد تحت هذا السطر بنسخة جديدة، ثم ترسل الرابط للطرف الآخر ليجيب عنه.', 'Your question goes into the contract under this line, as a new version; then you send the link to the other side to answer.'],
    qaAnsNote: ['يُكتب جوابك في العقد تحت السؤال بنسخة جديدة، ثم ترسل الرابط للطرف الآخر.', 'Your answer goes into the contract under the question, as a new version; then you send the link to the other side.'],
    qaSendQ: ['أضف السؤال إلى العقد', 'Add the question to the contract'],
    qaSendA: ['أضف الجواب إلى العقد', 'Add the answer to the contract'],
    qaCancel: ['إلغاء', 'Cancel'],
    qaEmpty: ['اكتب النص أولًا.', 'Write it first.'],
    qaMax: ['وصل العقد إلى أكبر عدد من الأسئلة. اتفقا على الباقي برسالة.', 'The contract holds as many questions as it can. Settle the rest in a message.'],
    qaQ: ['سؤال من {who}', 'Question from the {who}'],
    qaA: ['جواب {who}', 'Answer from the {who}'],
    qaAnswerBtn: ['أجب', 'Answer'],
    qaDocQ: ['تم توثيق السؤال في هذا العقد (النسخة {q})، وهو بانتظار جواب {who}.', 'The question is written into this contract (version {q}); waiting for the {who}’s answer.'],
    qaDocBoth: ['تم توثيق السؤال والجواب في هذا العقد (السؤال في النسخة {q}، والجواب في النسخة {a}).', 'The question and the answer are written into this contract (question in version {q}, answer in version {a}).'],
    qaOther: ['أسئلة عن نص تغيّر مكانه', 'Questions about text that moved'],
    qaAbout: ['عن {k}: «{x}»', 'About {k}: “{x}”'],
    qaAskedT: ['تم توثيق سؤالك في العقد', 'Your question is written into the contract'],
    qaAskedSub: ['أرسل الرابط الآن للطرف الآخر ليجيب عنه تحت السطر نفسه. والسؤال والجواب يبقيان مكتوبين في العقد.', 'Now send the link to the other side to answer it under the same line. The question and the answer both stay written in the contract.'],
    qaAnsweredT: ['تم توثيق السؤال والجواب في العقد', 'The question and the answer are written into the contract'],
    qaAnsweredSub: ['أرسل الرابط الآن للطرف الآخر. وإن كان كل شيء واضحًا، فيمكنكما الموافقة على هذه النسخة.', 'Now send the link to the other side. If everything is clear, you can both approve this version.'],
    qaGotQT: ['وصلك سؤال عن العقد', 'You received a question about the contract'],
    qaGotQSub: ['تجد السؤال تحت السطر الذي يخصه. اضغط «أجب» واكتب جوابك، فيُوثَّق في العقد نفسه، ثم أرسله للطرف الآخر.', 'You’ll find it under its line. Press “Answer” and write yours: it is written into the contract itself; then send it back.'],
    qaGotAT: ['وصلك جواب عن سؤالك', 'Your question was answered'],
    qaGotASub: ['تجد الجواب تحت السطر نفسه، وتم توثيق السؤال والجواب في العقد. وإن كان كل شيء واضحًا، فوافق على العقد.', 'It’s under the same line; the question and the answer are written into the contract. If everything is clear, approve the contract.'],
    qaBlock: ['في العقد سؤال بانتظار جوابه. بعد الجواب يمكن الموافقة على العقد.', 'A question in the contract is waiting for its answer. Approve once it’s answered.'],
    qaMsgAsk: ['مرحبًا، كتبت سؤالًا داخل عقد المونتاج بيننا. افتح الرابط وأجب عنه تحت السطر نفسه:\n{link}', 'Hi, I wrote a question inside our editing contract. Open the link and answer it under the line:\n{link}'],
    qaMsgAns: ['مرحبًا، أجبت عن سؤالك داخل عقد المونتاج بيننا، وتجد الجواب تحت السطر نفسه:\n{link}\nإن كان كل شيء واضحًا، فوافق على العقد.', 'Hi, I answered your question inside our editing contract; it’s under the same line:\n{link}\nIf everything is clear, please approve the contract.'],
    qaClause: ['الأسئلة والأجوبة المكتوبة تحت البنود جزء من هذا الاتفاق، وتوضّح معنى السطر الذي كُتبت تحته.', 'The questions and answers written under the clauses are part of this agreement and explain the line they are under.'],
    qaTagAsk: ['سؤال', 'Question'],
    qaTagAns: ['جواب', 'Answer'],
    readOk: ['قرأت العقد كاملًا وفهمته، وأوافق على كل ما فيه.', 'I read the whole contract, I understand it, and I accept all of it.'],
    readNeed: ['ضع علامة على «قرأت العقد كاملًا» أولًا.', 'Tick “I read the whole contract” first.'],
    // after confirming: the contract can't change unless both sides agree to an amendment
    vSafe: ['وهذا العقد ثابت كما وافقتَ عليه، ولا يتغيّر فيه شيء إلا إذا وافقتما كلاكما على تعديل.', 'This contract stays exactly as you agreed to it; nothing in it changes unless you both agree to an amendment.'],
    dlgMine: ['تم تأكيد موافقتك', 'Your approval is confirmed'],
    dlgMineSub: ['ننتظر الآن تأكيد الطرف الآخر، وتصلكما رسالة حين يكتمل التوثيق.', 'Now waiting for the other side; you’ll both get an e-mail once it’s complete.'],
    dlgDone: ['اكتمل توثيق العقد', 'The contract is confirmed'],
    dlgDoneSub: ['أكّد الطرفان موافقتهما، فصار العقد موثّقًا بالبريد، وتصلكما رسالة بذلك.', 'Both sides have confirmed, so the contract is confirmed by e-mail; you’ll both get an e-mail saying so.'],
    dlgSent: ['بقي أن ترسل رسالة موافقتك', 'Now send your approval message'],
    dlgSentSub: ['جهّزنا رسالة موافقتك في {ch}. أرسلها هناك لتكتمل موافقتك على هذه النسخة.', 'Your approval message is ready on {ch}. Send it there to complete your approval of this version.'],
    dlgSafeT: ['اطمئن، العقد لا يتغيّر وحده', 'Rest assured: the contract can’t change on its own'],
    dlgSafe: ['هذا العقد محفوظ كما وافقتَ عليه تمامًا، ولا يتغيّر فيه أي بند إلا إذا وافق الطرفان كلاهما على تعديل، في أي مرحلة من المشروع.', 'It is kept exactly as you agreed to it. No term changes unless both sides agree to an amendment, at any stage of the project.'],
    dlgSafe2: ['وإذا أُضيف تعديل، فلن يُعتمد إلا إذا وافقتَ عليه أنت أيضًا، ويظهر في العقد نفسه ما كان قبله وما صار بعده.', 'If an amendment is added, it won’t count unless you agree to it too, and the contract itself shows what it was before and what it is now.'],
    dlgOk: ['تمام', 'OK']
  };

  function t(key, vars) {
    var v = UI[key];
    var s = v ? (isEn() ? v[1] : v[0]) : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  // [value, Arabic, English]
  var OPT = {
    ch: [['wa', 'واتساب', 'WhatsApp'], ['em', 'البريد الإلكتروني', 'Email'], ['tg', 'تيليجرام', 'Telegram'], ['dc', 'ديسكورد', 'Discord'], ['ig', 'إنستغرام', 'Instagram'], ['ot', 'أخرى', 'Other']],
    ty: [['reels', 'ريلز قصيرة', 'Short reels'], ['yt', 'فيديو يوتيوب', 'YouTube video'], ['ad', 'إعلان', 'Ad'], ['react', 'ريأكشن', 'Reaction'], ['re', 'عقاري', 'Real estate'], ['ot', 'أخرى', 'Other']],
    sz: [['916', 'طولي 9:16', 'Vertical 9:16'], ['169', 'أفقي 16:9', 'Horizontal 16:9'], ['11', 'مربع 1:1', 'Square 1:1'], ['ot', 'أخرى', 'Other']],
    q: [['1080', '1080', '1080p'], ['4k', '4K', '4K'], ['ot', 'أخرى', 'Other']],
    cu: [['USD', 'دولار', 'USD'], ['USDT', 'USDT', 'USDT'], ['SAR', 'ريال سعودي', 'SAR'], ['AED', 'درهم إماراتي', 'AED'], ['EUR', 'يورو', 'EUR'], ['DZD', 'دينار جزائري', 'DZD'], ['ot', 'أخرى', 'Other']],
    in: [['cut', 'القص والترتيب', 'Cutting & assembly'], ['cap', 'الكابشن والنصوص', 'Captions & text'], ['mg', 'الموشن جرافيك', 'Motion graphics'], ['col', 'تصحيح الألوان', 'Color correction'], ['snd', 'الهندسة الصوتية والمؤثرات', 'Sound design & SFX'], ['mus', 'الموسيقى', 'Music'], ['thumb', 'الصورة المصغرة', 'Thumbnail'], ['src', 'ملفات المشروع المفتوحة', 'Editable project files']],
    mu: [['f', 'الفريلانسر (مرخصة أو مجانية)', 'The freelancer (licensed or free)'], ['c', 'العميل', 'The client'], ['b', 'الطرفان معًا (جزء من كل طرف)', 'Both (part from each side)'], ['n', 'بلا موسيقى', 'No music']],
    pm: [['pp', 'PayPal', 'PayPal'], ['bank', 'تحويل بنكي', 'Bank transfer'], ['bm', 'بريدي موب', 'BaridiMob'], ['usdt', 'USDT', 'USDT'], ['bnc', 'باينانس', 'Binance'], ['ot', 'أخرى', 'Other']],
    dp: [[0, 'لا توجد', 'None'], [30, '30%', '30%'], [50, '50%', '50%'], [70, '70%', '70%'], [100, '100%', '100%']],
    sc: [['v', 'كل فيديو وحده', 'Video by video'], ['p', 'المشروع كله معًا', 'All together']],
    fe: [['c', 'العميل', 'The client'], ['f', 'الفريلانسر', 'The freelancer'], ['h', 'مناصفة', 'Split equally']],
    md: [['v', 'سعر لكل فيديو', 'Each video has its price'], ['p', 'باقة: عدد فيديوهات بسعر واحد', 'Package: several videos, one price']],
    fk: [[7, '7 أيام', '7 days'], [14, '14 يومًا', '14 days'], [30, '30 يومًا', '30 days'], [60, '60 يومًا', '60 days'], [90, '90 يومًا', '90 days']]
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
    md: 'v', kn: 10, kp: '', kd: '', kl: '', ks: '', kt: '',
    // more currencies accepted besides the main one (cu); prices are always in cu
    ca: [],
    // optional e-mail confirmation (vm = on) with each side's address
    vm: 0, fm: '', cm: '',
    // review time (rh) and time per revision (th) in hours; 0 = in work days (rv / tn), as every
    // contract made before 2026-11-05 reads. New contracts start in hours (fresh()): more precise.
    rh: 0, th: 0,
    // how long the freelancer keeps the project files after the final version (agreed; 30 as before)
    fk: 30,
    // wording version, for clauses whose MEANING changed (not just clearer words), so a contract
    // someone already agreed to never reads differently: 1 = as made before 2026-11-05 evening;
    // 2 = a video started but not sent is paid for the work done (not a flat half). fresh() → 2
    tv: 1,
    // amendments, oldest first: each keeps the code of the version it changed (c), the
    // reason given (w) and that version's value of every setting it changed (p). So the
    // contract carries its whole history, and every earlier version can be rebuilt (versions())
    am: [],
    // questions and answers about single lines, written into the contract (his ask 2026-11-05):
    // k = «section.line», x = that line's text when asked, q / by / d / qv = the question, its side
    // (f / c), date and version; a / e / av = the answer, its date and version ('' while waiting)
    qa: []
  };
  var MAX_AM = 30, MAX_QA = 12;
  var CODE_RE = /^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;   // same alphabet as B32 below
  // io = the client's own extra items of «ما يشمله السعر», one per line (a single item in contracts made before)
  var LIMITS = { fn: 60, fc: 40, fx: 60, cn: 60, cc: 40, cx: 60, co: 40, to: 40, st: 140, rf: 200, so: 30, qo: 30, cuo: 30, io: 300, pmo: 40, ac: 120, ex: 20, wd: 80, tr: 400, kp: 14, kd: 80, kl: 30, ks: 80, fm: 120, cm: 120 };
  var IO_MAX = 6, IO_LEN = 80;
  function ioItems(io) { return String(io || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
  var NUMS = { rd: [0, 10], rv: [1, 14], tn: [1, 14], nt: [1, 30], kn: [1, 200], rh: [0, 168], th: [0, 168] };
  var HOUR_STEP = 12;   // the hours steppers go 12, 24, 36 … 168
  // A new contract (not one from a link or a draft): review and revision times in hours
  function fresh() { var s = clone(DEF); s.rh = 48; s.th = 48; s.tv = 2; return s; }

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
    var fk = parseInt(src.fk, 10);
    s.fk = OPT.fk.some(function (o) { return o[0] === fk; }) ? fk : 30;
    s.tv = parseInt(src.tv, 10) === 2 ? 2 : 1;
    s.pf = src.pf ? 1 : 0;
    s.vm = src.vm ? 1 : 0;
    s.fm = s.vm ? s.fm.trim().toLowerCase() : '';
    s.cm = s.vm ? s.cm.trim().toLowerCase() : '';
    s.md = src.md === 'p' ? 'p' : 'v';
    s.ca = Array.isArray(src.ca) ? src.ca.filter(function (k, i, arr) {
      return k !== s.cu && arr.indexOf(k) === i && OPT.cu.some(function (o) { return o[0] === k; });
    }) : [];
    s.kt = /^\d{4}-\d{2}-\d{2}$/.test(src.kt || '') ? src.kt : '';
    if (Array.isArray(src.in)) s.in = OPT.in.map(function (o) { return o[0]; }).filter(function (k) { return src.in.indexOf(k) !== -1; });
    if (Array.isArray(src.pm)) s.pm = OPT.pm.map(function (o) { return o[0]; }).filter(function (k) { return src.pm.indexOf(k) !== -1; });
    if (Array.isArray(src.vd) && src.vd.length) {
      s.vd = src.vd.slice(0, MAX_VIDEOS).map(function (v) {
        v = v && typeof v === 'object' ? v : {};
        return { d: str(v.d, 80), l: str(v.l, 30), p: str(v.p, 14), t: /^\d{4}-\d{2}-\d{2}$/.test(v.t || '') ? v.t : '' };
      });
    }
    s.am = normAm(src.am);
    s.qa = normQa(src.qa);
    return s;
  }
  function normQa(list) {
    if (!Array.isArray(list)) return [];
    var day = function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x || '') ? x : ''; };
    var num = function (x) { var n = parseInt(x, 10); return n >= 1 && n <= 999 ? n : 0; };
    return list.slice(0, MAX_QA).map(function (r) {
      r = r && typeof r === 'object' ? r : {};
      return { k: /^\d{1,2}\.\d{1,2}$/.test(r.k || '') ? r.k : '', x: str(r.x, 160), q: str(r.q, 300), by: r.by === 'c' ? 'c' : 'f', d: day(r.d), qv: num(r.qv),
               a: str(r.a, 400), e: day(r.e), av: num(r.av) };
    }).filter(function (r) { return r.k && r.q.trim(); });
  }
  // The amendments a link carries (never trusted): only known settings in each one, kept
  // exactly as given (an earlier version rebuilt from them goes through normalize again)
  function normAm(list) {
    if (!Array.isArray(list)) return [];
    return list.slice(0, MAX_AM).map(function (r) {
      r = r && typeof r === 'object' ? r : {};
      var src = r.p && typeof r.p === 'object' && !Array.isArray(r.p) ? r.p : {}, p = {};
      Object.keys(DEF).forEach(function (k) { if (k !== 'am' && k !== 'v' && src[k] !== undefined) p[k] = src[k]; });
      return { c: CODE_RE.test(r.c || '') ? r.c : '', w: str(r.w, 140), p: p };
    });
  }
  // What an amendment keeps: the old value of every setting that changed
  function patchOf(a, b) {
    var p = {};
    Object.keys(DEF).forEach(function (k) {
      if (k !== 'am' && k !== 'v' && sortedJSON(a[k]) !== sortedJSON(b[k])) p[k] = clone(a[k]);
    });
    return p;
  }
  // Every version of the contract, oldest first (the last one is s itself), rebuilt
  // backwards: undoing the newest amendment gives the version before it, and so on
  function versions(s) {
    var out = [s], cur = s;
    for (var i = s.am.length - 1; i >= 0; i--) {
      var prev = clone(cur), patch = s.am[i].p;
      Object.keys(patch).forEach(function (k) { prev[k] = clone(patch[k]); });
      prev.am = s.am.slice(0, i);
      cur = normalize(prev);
      out.unshift(cur);
    }
    return out;
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

  // Contract code: changes if anything in the contract changes. Only what differs from the
  // defaults counts (as in the link), so adding a new optional setting to the maker never
  // changes the code of contracts made before it (it did until 2026-11-05).
  var B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  function digestOf(s) {
    var p = pack(normalize(s));
    delete p.v;
    var data = new TextEncoder().encode(sortedJSON(p));
    return window.crypto && crypto.subtle
      ? crypto.subtle.digest('SHA-256', data).then(function (b) { return new Uint8Array(b); })
      : Promise.resolve(fnv(data));
  }
  function codeFrom(h) {
    var bits = 0, value = 0, out = '';
    for (var i = 0; i < h.length && out.length < 8; i++) {
      value = (value << 8) | h[i]; bits += 8;
      while (bits >= 5 && out.length < 8) { out += B32.charAt((value >>> (bits - 5)) & 31); bits -= 5; }
    }
    return out.slice(0, 4) + '-' + out.slice(4, 8);
  }
  function codeOf(s) { return digestOf(s).then(codeFrom); }
  function hexOf(bytes) { return Array.prototype.map.call(bytes, function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(''); }
  function sha256hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (b) { return hexOf(new Uint8Array(b)); });
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
  // direction, so they are pinned left-to-right (an Arabic line would flip them).
  // Anything with Arabic letters is pinned right-to-left, even when it starts with a
  // Latin word («PayPal، تحويل بنكي…» would otherwise be laid out backwards).
  function V(x) {
    var s = String(x == null ? '' : x).trim();   // display only: the data (and so the code) stays as typed
    var rtl =/[֐-ࣿ]/.test(s), ltr = !rtl && /[0-9A-Za-z+@]/.test(s);
    return '<bdi class="cm-v"' + (rtl ? ' dir="rtl"' : ltr ? ' dir="ltr"' : '') + '>' + esc(s) + '</bdi>';
  }
  // The same, for narrow cells: an e-mail address may break before its «@», not mid-word
  function Vw(x) { return V(x).replace(/@/g, '<wbr>@'); }
  // A link is shown short (no tracking tail) and opens in a new tab; any other text stays
  // as it is. The data can come from anyone's link, so only plain http(s) addresses become links.
  function refLink(x) {
    var raw = String(x == null ? '' : x).trim(), u;
    if (!/^https?:\/\/[^\s<>"']+$/i.test(raw)) return V(raw);
    try { u = new URL(raw); } catch (e) { return V(raw); }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return V(raw);
    var host = u.hostname.replace(/^www\./, '').toLowerCase();
    var social = /(^|\.)(instagram\.com|tiktok\.com|facebook\.com|fb\.watch|twitter\.com|x\.com|snapchat\.com|threads\.net)$/.test(host);
    var yt = /(^|\.)youtube\.com$|^youtu\.be$/.test(host);
    var keep = [];
    if (!social) u.searchParams.forEach(function (val, key) {
      if (yt ? /^(v|t|list)$/.test(key) : !/^(utm_|fbclid$|gclid$|igsh|si$|feature$|mibextid$)/i.test(key)) keep.push(key + (val ? '=' + val : ''));
    });
    var path = u.pathname.replace(/\/+$/, '');
    try { path = decodeURI(path); } catch (e) {}
    var show = host + path + (keep.length ? '?' + keep.join('&') : '');
    if (show.length > 60) show = show.slice(0, 57) + '…';
    return '<a class="cm-v cm-url" dir="ltr" href="' + esc(u.href) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(show) + '</a>';
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
  function curName(s, k) { k = k || s.cu; return k === 'ot' ? (s.cuo || optLabel('cu', 'ot')) : optLabel('cu', k); }
  function otherCurrencies(s) { return s.ca.map(function (k) { return curName(s, k); }); }
  function amount(n, s) { return money(n) + ' ' + curName(s); }
  function fmtDate(d) { if (!d) return '—'; var p = d.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function chName(s) { return s.ch === 'ot' ? (s.co || optLabel('ch', 'ot')) : optLabel('ch', s.ch); }
  function days(n) {
    if (isEn()) return n + (n === 1 ? ' work day' : ' work days');
    if (n === 1) return 'يوم عمل واحد';
    if (n === 2) return 'يومي عمل';   // always after «خلال» or «مهلة», so this form
    return n + (n <= 10 ? ' أيام عمل' : ' يوم عمل');
  }
  function hours(n) {
    if (isEn()) return n + (n === 1 ? ' hour' : ' hours');
    if (n === 1) return 'ساعة واحدة';
    if (n === 2) return 'ساعتين';
    return n + (n <= 10 ? ' ساعات' : ' ساعة');
  }
  // How many times the client may ask for changes, as in «التعديل مرتين»
  function rounds(n) {
    if (isEn()) return n + (n === 1 ? ' revision' : ' revisions');
    if (n === 1) return 'مرة واحدة';
    if (n === 2) return 'مرتين';
    return n + (n <= 10 ? ' مرات' : ' مرة');
  }
  function videosCount(n) {
    if (isEn()) return n + (n === 1 ? ' video' : ' videos');
    if (n === 1) return 'فيديو واحد';
    if (n === 2) return 'فيديوين';
    return n + (n <= 10 ? ' فيديوهات' : ' فيديو');
  }
  function listJoin(arr) {
    if (arr.length < 2) return arr.join('');
    if (isEn()) return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
    var last = arr[arr.length - 1];   // «و» joins an Arabic word, but stands apart before a Latin one (و USDT)
    return arr.slice(0, -1).join('، ') + (/^[؀-ۿ]/.test(last) ? ' و' : ' و ') + last;
  }

  /* ---------- the contract text (Arabic + English) ---------- */
  // Plain, everyday words on purpose: both sides should get every clause on the first
  // read — «النسخة الأولى» not «المعاينة», «مرة تعديل» not «جولة»، «برسالة» not «كتابيًا».
  // Changing these words never changes a contract's code (the code comes from the data).
  function sections(s, code) {
    var N = videoCount(s), sum = total(s), pack = s.md === 'p';
    var type = s.ty === 'ot' ? (s.to || optLabel('ty', 'ot')) : optLabel('ty', s.ty);
    var size = s.sz === 'ot' ? (s.so || optLabel('sz', 'ot')) : optLabel('sz', s.sz);
    var qual = s.q === 'ot' ? (s.qo || optLabel('q', 'ot')) : optLabel('q', s.q);
    var incl = s.in.map(function (k) { return optLabel('in', k); }).concat(ioItems(s.io));
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
      ? L('الفيديو المرجعي (مثال على الستايل المطلوب): ' + refLink(s.rf) + '، وهو جزء من هذا الاتفاق.', 'Reference video (an example of the wanted style): ' + refLink(s.rf) + ' — it is part of this agreement.')
      : L('لا يوجد فيديو مرجعي، لذلك يختار الفريلانسر الستايل المناسب لنوع الفيديو.', 'There is no reference video, so the freelancer picks a style that suits the video type.'));
    s1.push(L('المقاس: ' + V(size) + '، والجودة النهائية: ' + V(qual) + '.', 'Size: ' + V(size) + '; final quality: ' + V(qual) + '.'));
    s1.push(incl.length
      ? L('يشمل السعر: ' + V(listJoin(incl)) + '. وأي عمل غير مذكور هنا يُعتبر عملًا إضافيًا له سعر منفصل (البند 4).', 'The price includes: ' + V(listJoin(incl)) + '. Anything not listed here is extra work with its own price (section 4).')
      : L('لم يُحدَّد ما يشمله السعر، لذلك يُتفق على أي عمل برسالة مكتوبة قبل البدء.', 'Nothing was listed as included, so any work is agreed in a written message before starting.'));
    // Whose materials are whose: the client's own footage, and the right to use anything added
    s1.push(L('يرسل العميل كل المواد المطلوبة بجودة جيدة، مثل المقاطع المصوّرة والصور والشعار، ويتأكد أن له حق استخدامها. والفريلانسر غير مسؤول عن ضعف جودة هذه المواد التي استلمها من العميل.',
              'The client sends all needed materials in good quality — such as footage, photos and the logo — and makes sure they have the right to use them. The freelancer isn’t responsible for poor quality in these materials received from the client.'));
    s1.push(L('أي مؤثرات أو موسيقى أو خطوط كتابة أو قوالب أو عناصر أخرى يضيفها أحد الطرفين إلى الفيديو، يجب أن يملك هو حق استخدامها (مرخصة أو مجانية الاستخدام)، ويكون هو المسؤول عنها.',
              'Any effects, music, fonts, templates or other elements either side adds to the video must be ones that side has the right to use (licensed or free to use), and that side is responsible for them.'));
    // Delivery dates, one idea per line (he found the one long sentence hard to follow)
    if (!pack) {
      s1.push(L('موعد التسليم المكتوب لكل فيديو في الجدول هو اليوم الذي يرسل فيه الفريلانسر النسخة الأولى الكاملة من ذلك الفيديو ليراجعها العميل، وليس موعد النسخة النهائية.',
                'The delivery date written for each video in the table is the day the freelancer sends the first full version of that video for the client to review — not the date of the final version.'));
    } else if (s.ks || s.kt) {
      s1.push(L('موعد التسليم هو اليوم الذي يرسل فيه الفريلانسر النسخة الأولى الكاملة من الفيديو ليراجعها العميل، وليس موعد النسخة النهائية.',
                'A delivery date is the day the freelancer sends the first full version of a video for the client to review — not the date of the final version.'));
      if (s.ks) s1.push(L('جدول التسليم المتفق عليه: ' + V(s.ks) + '.', 'Agreed delivery schedule: ' + V(s.ks) + '.'));
      if (s.kt) s1.push(L('آخر موعد: تصل النسخة الأولى من كل فيديوهات الباقة إلى العميل في موعد أقصاه ' + V(fmtDate(s.kt)) + '.',
                          'Last date: the first versions of all the package’s videos reach the client by ' + V(fmtDate(s.kt)) + ' at the latest.'));
    } else {
      s1.push(L('موعد تسليم كل فيديو هو اليوم الذي يرسل فيه الفريلانسر نسخته الأولى الكاملة ليراجعها العميل، ويُتفق عليه برسالة قبل بدء العمل على ذلك الفيديو.',
                'Each video’s delivery date — the day the freelancer sends its first full version for the client to review — is agreed in a message before work on it starts.'));
    }
    out.push({ t: L('تفاصيل المشروع', 'Project details'), items: s1 });

    // 2 Price & payment
    var s2 = [];
    s2.push(pack
      ? L('سعر الباقة: ' + V(amount(sum, s)) + ' مقابل ' + V(videosCount(N)) + '، أي ' + V(amount(perVideo(s), s)) + ' للفيديو الواحد.',
          'Package price: ' + V(amount(sum, s)) + ' for ' + V(videosCount(N)) + ', i.e. ' + V(amount(perVideo(s), s)) + ' per video.')
      : L('السعر الإجمالي: ' + V(amount(sum, s)) + '.', 'Total price: ' + V(amount(sum, s)) + '.'));
    // How and when the money is paid: one idea per line, in everyday words, with the amounts
    // written out (he found «يُحسب موعد التسليم من يوم وصوله» and «يكون الدفع للمشروع كاملًا
    // مرة واحدة» unclear). With several videos it says plainly: all together, or video by video.
    var many = N > 1, each = many && s.sc === 'v';
    if (many) s2.push(each
      ? L('الدفع عن كل فيديو وحده: يُدفع كل فيديو في وقته، دون انتظار باقي الفيديوهات' + (pack ? '، وسعر الفيديو الواحد في الباقة ' + V(amount(perVideo(s), s)) : '') + '.',
          'Each video is paid on its own, in its own time, without waiting for the other videos' + (pack ? '; one video in the package costs ' + V(amount(perVideo(s), s)) : '') + '.')
      : L('الدفع عن المشروع كله معًا، لا عن كل فيديو وحده.', 'The whole project is paid together, not video by video.'));
    if (s.dp === 0) {
      s2.push(L('لا يوجد عربون (دفعة مقدمة).', 'There is no upfront payment (deposit).'));
      s2.push(each
        ? L('يُدفع سعر كل فيديو بعد أن يوافق العميل عليه، وقبل أن يستلم نسخته النهائية.', 'Each video’s price is paid after the client approves it and before receiving its final version.')
        : L('يُدفع المبلغ كله (' + V(amount(sum, s)) + ')' + (many ? ' دفعة واحدة بعد أن يوافق العميل على كل الفيديوهات، وقبل أن يستلم نسخها النهائية.' : ' بعد أن يوافق العميل على الفيديو، وقبل أن يستلم النسخة النهائية.'),
            'The full amount (' + V(amount(sum, s)) + ') is paid ' + (many ? 'at once, after the client approves all the videos and before receiving their final versions.' : 'after the client approves the video and before receiving the final version.')));
    } else if (s.dp === 100) {
      s2.push(each
        ? L('يدفع العميل سعر كل فيديو كاملًا قبل بدء العمل عليه، والمجموع لكل الفيديوهات ' + V(amount(sum, s)) + '.', 'The client pays each video’s full price before work on it starts — ' + V(amount(sum, s)) + ' for all the videos.')
        : L('يدفع العميل المبلغ كاملًا، أي ' + V(amount(sum, s)) + '، ' + (many ? 'دفعة واحدة ' : '') + 'قبل بدء العمل.', 'The client pays the full amount — ' + V(amount(sum, s)) + ' — ' + (many ? 'at once, ' : '') + 'before work starts.'));
    } else {
      s2.push(each
        ? L('العربون (الدفعة المقدمة): يدفع العميل ' + V(s.dp + '%') + ' من سعر كل فيديو قبل بدء العمل عليه، ومجموعه لكل الفيديوهات ' + V(amount(dep, s)) + '.',
            'Deposit (upfront payment): the client pays ' + V(s.dp + '%') + ' of each video’s price before work on it starts — ' + V(amount(dep, s)) + ' for all the videos.')
        : L('العربون (الدفعة المقدمة): يدفع العميل ' + V(s.dp + '%') + ' من السعر، أي ' + V(amount(dep, s)) + '، ' + (many ? 'دفعة واحدة ' : '') + 'قبل بدء العمل.',
            'Deposit (upfront payment): the client pays ' + V(s.dp + '%') + ' of the price — ' + V(amount(dep, s)) + ' — ' + (many ? 'at once, ' : '') + 'before work starts.'));
      s2.push(each
        ? L('باقي سعر كل فيديو (' + V((100 - s.dp) + '%') + '): يدفعه العميل بعد أن يوافق على ذلك الفيديو، وقبل أن يستلم نسخته النهائية، ومجموعه لكل الفيديوهات ' + V(amount(rest, s)) + '.',
            'The rest of each video’s price (' + V((100 - s.dp) + '%') + '): paid after the client approves that video and before receiving its final version — ' + V(amount(rest, s)) + ' for all the videos.')
        : L('باقي المبلغ (' + V((100 - s.dp) + '%') + '، أي ' + V(amount(rest, s)) + '): يدفعه العميل ' + (many ? 'دفعة واحدة بعد أن يوافق على كل الفيديوهات، وقبل أن يستلم نسخها النهائية.' : 'بعد أن يوافق على الفيديو، وقبل أن يستلم النسخة النهائية.'),
            'The rest (' + V((100 - s.dp) + '%') + ' — ' + V(amount(rest, s)) + '): the client pays it ' + (many ? 'at once, after approving all the videos and before receiving their final versions.' : 'after approving the video and before receiving the final version.')));
    }
    // When work starts, and what a late payment or late materials do to the date
    var paid = s.dp === 0 ? '' : s.dp === 100 ? L(each ? ' وسعره' : ' والمبلغ', each ? ' and its price' : ' and the payment') : L(each ? ' وعربونه' : ' والعربون', each ? ' and its deposit' : ' and the deposit');
    s2.push(each
      ? L('لا يبدأ الفريلانسر العمل على أي فيديو إلا بعد أن تصله مواده المطلوبة' + paid + '. وإذا تأخر وصولها، يتأخر موعد تسليمه بنفس عدد أيام التأخير.',
          'The freelancer starts a video only once its materials' + paid + ' have arrived. If they arrive late, its delivery date moves by the same number of days.')
      : L('لا يبدأ الفريلانسر العمل إلا بعد أن تصله كل المواد المطلوبة من العميل' + paid + '. وإذا تأخر وصولها، يتأخر موعد التسليم بنفس عدد أيام التأخير.',
          'The freelancer starts only once all the needed materials' + paid + ' have arrived. If they arrive late, the delivery date moves by the same number of days.'));
    if (s.ca.length) s2.push(L('يمكن الدفع أيضًا بالعملات التالية: ' + V(listJoin(otherCurrencies(s))) + '، ويُحوَّل المبلغ بسعر الصرف يوم الدفع، بحيث يصل للفريلانسر ما يساوي المبلغ المتفق عليه.',
                               'Payment is also accepted in: ' + V(listJoin(otherCurrencies(s))) + ', converted at the exchange rate on the payment day, so the freelancer receives the equivalent of the agreed amount.'));
    if (pays.length) s2.push(L('طريقة الدفع: ' + V(listJoin(pays)) + (s.ac ? '. بيانات الحساب: ' + refLink(s.ac) : '') + '.', 'Payment method: ' + V(listJoin(pays)) + (s.ac ? '. Account details: ' + refLink(s.ac) : '') + '.'));
    // Paying with more than one method is fine, as long as every method is an agreed one
    s2.push(pays.length > 1
      ? L('لا مانع من الدفع بأكثر من طريقة، مثل جزء بطريقة وجزء بأخرى، ما دامت كلها من الطرق المتفق عليها هنا.',
          'Paying with more than one method is fine, e.g. part one way and part another, as long as each is one of the methods agreed here.')
      : pays.length === 1
        ? L('لا مانع من الدفع بطريقة أخرى أو بأكثر من طريقة، بشرط أن يتفق الطرفان عليها برسالة قبل الدفع.',
            'Paying another way, or with more than one method, is fine if both sides agree on it in a message before paying.')
        : L('يُدفع المبلغ بالطريقة التي يتفق عليها الطرفان برسالة، ولا مانع من الدفع بأكثر من طريقة.',
            'Payment is made the way both sides agree on in a message, and paying with more than one method is fine.'));
    var payer = { c: L('العميل', 'the client'), f: L('الفريلانسر', 'the freelancer'), h: L('الطرفين مناصفة', 'both sides, split equally') }[s.fe];
    s2.push(L('رسوم التحويل وفرق العملة على ' + V(payer) + (s.fe === 'c' ? '، بحيث يصل للفريلانسر المبلغ المتفق عليه كاملًا' : '') + '.',
              'Transfer fees and currency differences are paid by ' + V(payer) + (s.fe === 'c' ? ', so the freelancer receives the full agreed amount' : '') + '.'));
    out.push({ t: L('السعر والدفع', 'Price & payment'), items: s2 });

    // 3 Delivery & review
    var s3 = [];
    // Said plainly: full quality, without a watermark, only once the whole amount is paid
    s3.push(s.dp < 100
      ? L('يرسل الفريلانسر النسخة الأولى كاملة ليراجعها العميل، لكن بجودة أقل أو بعلامة مائية. ولا يستلم العميل الفيديو بالجودة الكاملة وبدون علامة مائية إلا بعد أن يدفع المبلغ كله.',
          'The freelancer sends the first full version for the client to review, but in lower quality or with a watermark. The client gets the video in full quality and without a watermark only after paying the whole amount.')
      : L('يرسل الفريلانسر النسخة الأولى كاملة ليراجعها العميل، وقد تكون بجودة أقل أو بعلامة مائية إلى أن يوافق عليها.',
          'The freelancer sends the first full version for the client to review; it may be in lower quality or watermarked until the client approves it.'));
    s3.push(s.rh
      ? L('يراجع العميل الفيديو خلال ' + V(hours(s.rh)) + ' من وقت وصوله إليه، ويرسل كل ملاحظاته مكتوبة في رسالة واحدة.',
          'The client reviews it within ' + V(hours(s.rh)) + ' of receiving it and sends all notes in writing, in one message.')
      : L('يراجع العميل الفيديو خلال ' + V(days(s.rv)) + '، ويرسل كل ملاحظاته مكتوبة في رسالة واحدة.',
          'The client reviews it within ' + V(days(s.rv)) + ' and sends all notes in writing, in one message.'));
    s3.push(L('عدم رد العميل لا يعني أنه موافق. وإذا انتهت مدة المراجعة دون رد، يذكّره الفريلانسر برسالة، ثم يُطبَّق بند «عدم الرد» (البند 7).',
              'No reply doesn’t mean approval. If the review time ends with no reply, the freelancer reminds the client by message, then the “no reply” rule applies (section 7).'));
    s3.push(L('موافقة العميل على الفيديو تكون برسالة مكتوبة في ' + V(ch) + '، مثل: «موافق على الفيديو».',
              'The client approves the video by a written message on ' + V(ch) + ', e.g. “Approved”.'));
    s3.push(L('يرسل الفريلانسر النسخة النهائية خلال يوم عمل واحد من ' + (s.dp === 0 ? 'وصول المبلغ' : s.dp < 100 ? 'وصول باقي المبلغ' : 'موافقة العميل على الفيديو') + '، بالجودة المتفق عليها وبدون علامة مائية.',
              'The freelancer sends the final version within one work day of ' + (s.dp === 0 ? 'receiving the payment' : s.dp < 100 ? 'receiving the rest of the payment' : 'the client’s approval') + ', in the agreed quality and without a watermark.'));
    if (s.dp < 100) s3.push(L('لا يحق للعميل نشر أي نسخة أو استخدامها قبل الدفع الكامل، وإذا نشرها يجب عليه دفع ' + (s.dp === 0 ? 'المبلغ كله' : 'باقي المبلغ') + ' فورًا.',
                              'The client may not publish or use any version before paying in full; if they do, ' + (s.dp === 0 ? 'the whole amount' : 'the rest') + ' is due at once.'));
    out.push({ t: L('التسليم والمراجعة', 'Delivery & review'), items: s3 });

    // 4 Revisions
    var s4 = [];
    if (s.rd === 0) {
      s4.push(L('لا يشمل السعر أي تعديل، وأي تعديل يُتفق على سعره برسالة قبل تنفيذه.', 'The price includes no revisions; any revision is priced in a message before it’s done.'));
    } else {
      s4.push(L('يشمل السعر التعديل ' + V(rounds(s.rd)) + ' لكل فيديو. ' + (s.ex ? 'وكل مرة تعديل إضافية بسعر ' + V(s.ex + ' ' + curName(s)) + '.' : 'وسعر أي تعديل إضافي يُتفق عليه برسالة قبل تنفيذه.'),
                'The price includes ' + V(rounds(s.rd)) + ' per video. ' + (s.ex ? 'Each extra revision costs ' + V(s.ex + ' ' + curName(s)) + '.' : 'Any extra revision is priced in a message before it’s done.')));
    }
    // One revision = one batch of notes, so changes can't trickle in one by one as «one revision»
    // Said plainly, with an example: every batch of notes uses up one of the agreed free revisions
    s4.push(L('مرة التعديل الواحدة = رسالة واحدة فيها كل ملاحظات العميل على النسخة. لذلك يجمع العميل ملاحظاته كلها ويرسلها معًا دفعة واحدة.',
              'One revision = one message with all the client’s notes on a version. So the client gathers all the notes and sends them together, in one go.'));
    s4.push(s.rd > 0
      ? L('إذا أرسل العميل ملاحظاته على دفعات (مرتين أو أكثر)، فكل دفعة تُحسب مرة تعديل مستقلة، وتُخصم من مرات التعديل المجانية المتفق عليها (' + V(rounds(s.rd)) + ' لكل فيديو). مثال: إذا أرسل ملاحظاته، ثم أرسل بعدها ملاحظة أخرى، فهذه مرتا تعديل، لا مرة واحدة.',
          'If the client sends notes in batches (twice or more), each batch counts as a separate revision and is taken from the agreed free revisions (' + V(rounds(s.rd)) + ' per video). Example: notes sent, then one more note after them — that’s two revisions, not one.')
      : L('إذا أرسل العميل ملاحظاته على دفعات (مرتين أو أكثر)، فكل دفعة تُحسب مرة تعديل مستقلة لها سعرها. مثال: إذا أرسل ملاحظاته، ثم أرسل بعدها ملاحظة أخرى، فهذه مرتا تعديل، لا مرة واحدة.',
          'If the client sends notes in batches (twice or more), each batch counts as a separate revision with its own price. Example: notes sent, then one more note after them — that’s two revisions, not one.'));
    s4.push(L('التعديل هو تغيير داخل الفكرة والستايل المتفق عليهما، مثل: القص والتوقيت والنصوص والألوان والموسيقى.',
              'A revision is a change within the agreed idea and style — cuts, timing, text, colors, music.'));
    s4.push(L('أما تغيير الفكرة أو الستايل أو الفيديو المرجعي، أو إضافة مقاطع أو فيديوهات جديدة، فهو عمل إضافي يُتفق على سعره ومدته برسالة قبل تنفيذه.',
              'Changing the idea, style or reference, or adding new clips or videos, is extra work; its price and time are agreed in a message before it’s done.'));
    s4.push(s.th
      ? L('ينفّذ الفريلانسر كل مرة تعديل خلال ' + V(hours(s.th)) + ' من وقت وصول الملاحظات إليه.', 'The freelancer applies each revision within ' + V(hours(s.th)) + ' of receiving the notes.')
      : L('ينفّذ الفريلانسر كل مرة تعديل خلال ' + V(days(s.tn)) + ' من وصول الملاحظات.', 'The freelancer applies each revision within ' + V(days(s.tn)) + ' of receiving the notes.'));
    s4.push(L('أخطاء الفريلانسر (أي شيء يخالف المتفق عليه) يصلحها مجانًا، ولا تُحسب من مرات التعديل.', 'The freelancer fixes their own mistakes (anything against what was agreed) for free; these don’t count as revisions.'));
    s4.push(L('بعد تسليم النسخة النهائية، أي تعديل جديد يُعتبر عملًا إضافيًا، إلا أخطاء الفريلانسر التي يُبلَّغ عنها خلال 7 أيام.',
              'After the final version is delivered, any new change is extra work — except the freelancer’s mistakes reported within 7 days.'));
    out.push({ t: L('التعديلات', 'Revisions'), items: s4 });

    // 5 Timing & communication
    var s5 = [];
    s5.push(L('وسيلة التواصل المتفق عليها: ' + V(ch) + '. وأي اتفاق أو موافقة في هذا العقد تكون برسالة مكتوبة فيها، ولا تُعتمد المكالمات أو الكلام الشفهي.',
              'Agreed channel: ' + V(ch) + '. Every agreement or approval in this contract is a written message there; calls and spoken agreements don’t count.'));
    s5.push(L('يرد كل طرف خلال 24 ساعة في أيام العمل، أو يخبر الطرف الآخر متى سيرد.', 'Each side replies within 24 hours on work days, or says when they will reply.'));
    s5.push(s.wd
      ? L('أيام العمل والتوقيت: ' + V(s.wd) + '، وكل المواعيد تُحسب على أساسها.', 'Work days and time zone: ' + V(s.wd) + '; all deadlines follow them.')
      : L('أيام العمل والتوقيت: أيام العمل الرسمية وتوقيت بلد الفريلانسر' + (s.fc ? ' (' + V(s.fc) + ')' : '') + '، وكل المواعيد تُحسب على أساسها.',
          'Work days and time zone: the official work days and time zone of the freelancer’s country' + (s.fc ? ' (' + V(s.fc) + ')' : '') + '; all deadlines follow them.'));
    s5.push(L('إذا تأخر العميل في إرسال الدفعة أو المواد أو الملاحظات، يتأخر موعد التسليم بنفس عدد أيام التأخير.',
              'If the client is late sending payment, materials or notes, the delivery date moves by the same number of days.'));
    s5.push(L('إذا توقّع الفريلانسر أنه سيتأخر، يخبر العميل قبل الموعد ويتفقان برسالة على موعد جديد. وإذا تأخر بدون اتفاق، يحق للعميل الإلغاء، ويُعتبر الإلغاء من الفريلانسر (البند 7).',
              'If the freelancer expects a delay, they tell the client before the deadline and agree a new date in a message. If they’re late without agreement, the client may cancel, and it counts as a cancellation by the freelancer (section 7).'));
    s5.push(L('الظروف الطارئة (مثل المرض أو انقطاع الكهرباء أو الإنترنت): يخبر صاحب الظرف الطرف الآخر فورًا، وتتأخر المواعيد بنفس المدة. وإذا زاد التأخير عن 7 أيام، يحق للطرف الآخر الإلغاء، ويُعتبر الإلغاء من صاحب الظرف، إلا إذا اتفق الطرفان اتفاقًا وديًا على غير ذلك، مثل تحديد موعد جديد.',
              'Emergencies (illness, power or internet outage): the affected side tells the other at once, and deadlines move by the same time. If the delay goes beyond 7 days, the other side may cancel, and it counts as a cancellation by the affected side — unless both sides agree amicably on something else, such as a new date.'));
    out.push({ t: L('المواعيد والتواصل', 'Timing & communication'), items: s5 });

    // 6 Rights & privacy
    var s6 = [];
    s6.push(L('يبقى الفيديو ملكًا للفريلانسر حتى يُدفع المبلغ كاملًا. وبعد الدفع، يحق للعميل استخدام النسخة النهائية ونشرها في أي منصة ولأي غرض.',
              'The video belongs to the freelancer until it is paid in full. After payment, the client may use and publish the final version on any platform, for any purpose.'));
    var src = s.in.indexOf('src') !== -1;
    s6.push(src
      ? L('ملفات المشروع المفتوحة (القابلة للتعديل): ' + V('مشمولة في السعر وتُسلَّم مع النسخة النهائية') + '.', 'Editable project files: ' + V('included in the price and delivered with the final version') + '.')
      : L('ملفات المشروع المفتوحة (القابلة للتعديل): ' + V('غير مشمولة في السعر ولا تُسلَّم') + '، ما لم يتفق الطرفان على غير ذلك برسالة.',
          'Editable project files: ' + V('not included in the price and not delivered') + ', unless both sides agree otherwise in a message.'));
    s6.push(L('القوالب والإعدادات الجاهزة والمؤثرات الخاصة بالفريلانسر تبقى ملكه، ويستخدمها داخل الفيديو فقط.', 'The freelancer’s own templates, presets and effects stay theirs and are used inside the video only.'));
    s6.push({
      c: L('الموسيقى والعناصر الخارجية يرسلها العميل، وهو المسؤول عنها.', 'Music and outside elements come from the client, who is responsible for them.'),
      f: L('الموسيقى والعناصر الخارجية يضيفها الفريلانسر من مصادر مرخصة أو مجانية الاستخدام.', 'Music and outside elements are added by the freelancer from licensed or free sources.'),
      b: L('الموسيقى من الطرفين معًا: يرسل العميل جزءًا منها، ويضيف الفريلانسر الجزء الآخر من مصادر مرخصة أو مجانية الاستخدام، ويتفقان على ذلك برسالة. وكل طرف مسؤول عن الموسيقى والعناصر التي يقدّمها.',
           'Music comes from both sides: the client sends part of it and the freelancer adds the rest from licensed or free sources, as agreed in a message. Each side is responsible for the music and elements it provides.'),
      n: L('الفيديو بدون موسيقى، وأي عناصر خارجية يرسلها العميل يكون هو المسؤول عنها.', 'The video has no music; the client is responsible for any outside elements they send.')
    }[s.mu]);
    s6.push(L('مواد العميل ملكه، ويحافظ الفريلانسر على خصوصيتها، فلا ينشرها ولا يشاركها مع أحد.', 'The client’s materials are theirs; the freelancer keeps them private and doesn’t publish or share them.'));
    s6.push(s.pf
      ? L('يحق للفريلانسر عرض الفيديو في معرض أعماله بعد أن ينشره العميل.', 'The freelancer may show the video in their portfolio after the client publishes it.')
      : L('لا يعرض الفريلانسر الفيديو في معرض أعماله إلا بإذن مكتوب من العميل.', 'The freelancer won’t show the video in their portfolio without the client’s written permission.'));
    s6.push(L('يحتفظ الفريلانسر بملفات المشروع مدة ' + V(optLabel('fk', s.fk)) + ' بعد تسليم النسخة النهائية، كما اتفق الطرفان، وبعدها لا يُطالَب بها.',
              'The freelancer keeps the project files for ' + V(optLabel('fk', s.fk)) + ' after the final delivery, as both sides agreed, and isn’t responsible for them after that.'));
    out.push({ t: L('الحقوق والخصوصية', 'Rights & privacy'), items: s6 });

    // 7 Cancelling
    var s7 = [];
    s7.push(L('عدم الرد: إذا توقف أحد الطرفين عن الرد وتعطّل العمل بسببه، يرسل له الآخر رسالة تنبيه ويعطيه مهلة ' + V(days(s.nt)) + '. فإذا لم يرد خلالها، يُعتبر أنه ألغى الاتفاق.',
              'No reply: if one side stops replying and the work is blocked, the other sends a warning message and gives them ' + V(days(s.nt)) + '. With no reply by then, it counts as a cancellation by them.'));
    s7.push(L('إذا ألغى العميل قبل بدء العمل: ' + (s.dp === 100 ? 'يُرجَع له ما دفعه كاملًا.' : s.dp > 0 ? 'يُرجَع له العربون كاملًا.' : 'لا يدفع شيئًا.'),
              'If the client cancels before work starts: ' + (s.dp === 100 ? 'everything paid is refunded in full.' : s.dp > 0 ? 'the upfront payment is refunded in full.' : 'nothing is owed.')));
    var onePrice = pack ? L(' وفي الباقة، سعر الفيديو الواحد = سعر الباقة ÷ عدد الفيديوهات (' + V(amount(perVideo(s), s)) + ').', ' In a package, one video’s price = the package price ÷ the number of videos (' + V(amount(perVideo(s), s)) + ').') : '';
    if (s.tv >= 2) {
      // A video started but not sent: paid for the work done, even unfinished (his rule 2026-11-05:
      // a flat half is unfair when 80% is done). Contracts made before keep the half (tv 1).
      s7.push(L('إذا ألغى العميل بعد بدء العمل، يأخذ الفريلانسر عن كل فيديو: سعره كاملًا إذا أرسل نسخته الأولى، ولا شيء إذا لم يبدأ العمل عليه.' + onePrice,
                'If the client cancels after work starts, the freelancer gets, per video: its full price if its first version was sent, and nothing if work on it hadn’t started.' + onePrice));
      s7.push(L('وإذا ألغى العميل وقد بدأ الفريلانسر العمل على فيديو ولم يرسل نسخته الأولى بعد، يأخذ الفريلانسر من سعر ذلك الفيديو بقدر ما أنجز منه، حتى لو لم يكتمل. مثلًا: إذا أنجز 80% من الفيديو، يأخذ 80% من سعره. ويُري الفريلانسر العميل ما أنجزه، مثل لقطات أو مقطع قصير من العمل، ليتفقا على النسبة.',
                'If the client cancels while the freelancer has started a video but not yet sent its first version, the freelancer gets part of that video’s price matching the work done, even if it isn’t finished. For example: 80% of the video done = 80% of its price. The freelancer shows the client what was done — such as screenshots or a short clip of the work — so both agree on the share.'));
    } else {
      s7.push(L('إذا ألغى العميل بعد بدء العمل، يأخذ الفريلانسر عن كل فيديو: سعره كاملًا إذا أرسل نسخته الأولى، ونصف سعره إذا بدأ العمل عليه ولم يرسل نسخة، ولا شيء إذا لم يبدأ فيه.' + onePrice,
                'If the client cancels after work starts, the freelancer gets, per video: the full price if its first version was sent, half if work started but no version was sent, nothing if it hadn’t started.' + onePrice));
    }
    s7.push(L('إذا ألغى الفريلانسر: يُرجِع للعميل كل ما دفعه عن أي فيديو لم يسلّم نسخته النهائية.', 'If the freelancer cancels, they refund everything paid for any video whose final version wasn’t delivered.'));
    s7.push(L('بعد أي إلغاء: يُقارَن ما دفعه العميل بما يأخذه الفريلانسر حسب هذا البند، فيُرجَع الزائد أو يُدفع الناقص خلال 7 أيام، بنفس طريقة الدفع. وكل فيديو يُدفع سعره كاملًا يستلم العميل نسخته النهائية.',
              'After any cancellation, what the client paid is compared with what the freelancer gets under this section; the extra is refunded or the shortfall paid within 7 days, by the same payment method. Every video paid in full gets its final version.'));
    s7.push(L('الإلغاء يكون برسالة مكتوبة في ' + V(ch) + '.', 'Cancelling is done by a written message on ' + V(ch) + '.'));
    out.push({ t: L('الإلغاء', 'Cancelling'), items: s7 });

    // 8 How this agreement works
    var s8 = [];
    s8.push(L('هذا اتفاق ودي إلكتروني، وليس عقدًا رسميًا أو حكوميًا. هدفه توضيح ما اتفق عليه الطرفان والرجوع إليه عند أي خلاف، ولا يحتاج طباعة أو توقيعًا.',
              'This is a friendly electronic agreement, not an official or government contract. It records what both sides agreed so they can refer to it if they disagree. No printing or signature is needed.'));
    if (s.vm) s8.push(L('الموافقة بالبريد: يصل لكل طرف رابط على بريده المذكور في أعلى العقد، فيفتح العقد ويؤكد موافقته. وبعد تأكيد الطرفين يصير العقد «موثّقًا بالبريد»، ولا يتغيّر بعدها إلا بتعديل يؤكده الطرفان بالبريد من جديد.',
                        'Approval by e-mail: each side gets a link at the e-mail shown above, opens the contract and confirms. Once both have confirmed, the contract is “confirmed by e-mail”; after that it only changes through an amendment both confirm by e-mail again.'));
    else s8.push(L('الموافقة: يرسل كل طرف في ' + V(ch) + ': ' + V(approvalText(s, code)) + '. وهذه الرسالة تعني أنه موافق على كل ما في العقد.',
              'Approval: each side sends on ' + V(ch) + ': ' + V(approvalText(s, code)) + '. That message means they accept everything in it.'));
    s8.push(L('رمز العقد يتغير إذا تغير أي شيء فيه، والباركود في آخر العقد يفتح النسخة الأصلية للتأكد منها.',
              'The contract code changes if anything in it changes, and the QR code at the end opens the original version to check it.'));
    s8.push(L('لتغيير أي شيء في العقد: يُضاف تعديل في العقد نفسه برقم نسخة جديد، ويُكتب في أوله ما كان قبله وما صار بعده. ولا يُعتمد التعديل إلا إذا وافق عليه الطرفان كلاهما، حتى من وافق منهما على النسخة السابقة، ولا يحق لأي طرف تغيير الاتفاق وحده.',
              'To change anything, an amendment is added to this same contract with a new version number, and its start shows what was there before and what is there now. An amendment only counts once both sides agree to it — even one who agreed to the previous version — and neither side changes the agreement alone.'));
    if (s.tr) s8.push(L('شروط إضافية (لها الأولوية إذا اختلفت مع البنود السابقة): ' + V(s.tr), 'Extra terms (these come first if they conflict with the clauses above): ' + V(s.tr)));
    s8.push(L('عند أي خلاف: يرجع الطرفان أولًا إلى هذا العقد، ثم إلى رسائلهما في ' + V(ch) + '، ويحاولان الحل بالتفاهم.',
              'If you disagree: first refer to this contract, then to your messages on ' + V(ch) + ', and settle it amicably.'));
    // Last, so the lines above keep their numbers (a question names its line by number)
    if (s.qa.length) s8.push(t('qaClause'));
    out.push({ t: L('الموافقة على العقد', 'Approving the agreement'), items: s8 });
    return out;
  }

  // The deal at a glance (four tiles above the clauses)
  function glance(s) {
    var sum = total(s), N = videoCount(s), out = [];
    out.push([s.md === 'p' ? t('sumPack') : t('sumTotal'), sum == null ? '—' : amount(sum, s)]);
    out.push([t('sumPay'), s.dp === 0 ? L('بعد الموافقة على الفيديو', 'After the video is approved')
      : s.dp === 100 ? L('كاملًا قبل بدء العمل', 'In full, before work starts')
      : L(s.dp + '% قبل البدء، والباقي ' + (100 - s.dp) + '% بعد الموافقة', s.dp + '% before work, ' + (100 - s.dp) + '% after approval')]);
    out.push([t('sumRev'), s.rd === 0 ? L('غير مشمولة', 'Not included') : rounds(s.rd) + (N > 1 ? L(' لكل فيديو', ' per video') : '')]);
    var dates = s.md === 'p' ? (s.kt ? [s.kt] : []) : s.vd.map(function (v) { return v.t; }).filter(Boolean).sort();
    var many = s.md === 'p' || s.vd.length > 1;
    out.push([many && dates.length ? t('sumLast') : t('sumDate'),
      dates.length ? fmtDate(dates[dates.length - 1]) : (s.md === 'p' && s.ks ? L('حسب جدول التسليم', 'Per the schedule') : L('يُتفق عليه برسالة', 'Agreed by message'))]);
    return out;
  }

  function approvalText(s, code) {
    return L('أوافق على العقد، النسخة ' + s.ver + '، الرمز ' + code, 'I agree to the contract, version ' + s.ver + ', code ' + code);
  }

  /* ---------- amendments: what changed, before and after ---------- */
  // The terms as a reader sees them, [id, label, value], in the order of the maker's steps
  function terms(s, bridge) {
    var out = [], pk = s.md === 'p', none = t('amNotSet');
    function add(id, label, val) { val = String(val == null ? '' : val).trim(); out.push([id, label, val || none]); }
    [['f', s.fn, s.fc, s.fx, s.fm], ['c', s.cn, s.cc, s.cx, s.cm]].forEach(function (p) {
      var who = p[0] === 'f' ? t('fl') : t('cl');
      add(p[0] + 'n', who + ': ' + t('name'), p[1]);
      add(p[0] + 'c', who + ': ' + t('country'), p[2]);
      add(p[0] + 'x', who + ': ' + L('التواصل', 'Contact'), p[3]);
      if (s.vm) add(p[0] + 'm', who + ': ' + t('vMail'), p[4]);
    });
    add('ch', L('وسيلة التواصل', 'Channel'), chName(s));
    add('ty', t('type'), s.ty === 'ot' ? (s.to || optLabel('ty', 'ot')) : optLabel('ty', s.ty));
    add('st', t('style'), s.st);
    add('rf', L('الفيديو المرجعي', 'Reference video'), s.rf);
    add('sz', t('size'), s.sz === 'ot' ? (s.so || optLabel('sz', 'ot')) : optLabel('sz', s.sz));
    add('q', t('quality'), s.q === 'ot' ? (s.qo || optLabel('q', 'ot')) : optLabel('q', s.q));
    add('md', t('pricing'), optLabel('md', s.md));
    add('cu', t('currency'), curName(s) + (s.ca.length ? L('، ويُقبل أيضًا: ', '; also accepted: ') + listJoin(otherCurrencies(s)) : ''));
    // The total in BOTH ways of pricing (a package's price is its total), so an amendment
    // always shows how much it was before and after — even when the pricing way changes
    add('sum', L('السعر الإجمالي', 'Total price'), amount(total(s), s));
    if (bridge) {
      // The pricing way changed (package ↔ a price per video): the same questions answered for
      // both ways, so «after» always says what it is now (he found an empty «—» unclear)
      var dates = s.vd.map(function (v) { return v.t; }).filter(Boolean).sort();
      var prices = s.vd.map(function (v) { return price(v.p); });
      var same = prices.every(function (x) { return x != null && x === prices[0]; });
      add('cnt', t('kCount'), videosCount(videoCount(s)));
      add('per', L('سعر الفيديو الواحد', 'Price per video'), pk ? amount(perVideo(s), s) : same ? amount(prices[0], s) : L('يختلف من فيديو لآخر (في الجدول)', 'Differs per video (see the table)'));
      add('desc', t('kDesc'), pk ? s.kd : listJoin(s.vd.map(function (v) { return String(v.d || '').trim(); }).filter(Boolean)));
      add('len', L('مدة الفيديو', 'Video length'), pk ? s.kl : listJoin(s.vd.map(function (v) { return String(v.l || '').trim(); }).filter(function (x, i, arr) { return x && arr.indexOf(x) === i; })));
      add('sched', t('kSched'), pk ? s.ks : L('موعد لكل فيديو في جدول الفيديوهات', 'A date for each video in the videos table'));
      add('last', L('آخر موعد للتسليم', 'Last delivery date'), pk ? (s.kt ? fmtDate(s.kt) : '') : (dates.length ? fmtDate(dates[dates.length - 1]) : ''));
    } else if (pk) {
      add('kn', t('kCount'), videosCount(s.kn));
      add('kd', t('kDesc'), s.kd);
      add('kl', t('kLen'), s.kl);
      add('ks', t('kSched'), s.ks);
      add('kt', t('kLast'), s.kt ? fmtDate(s.kt) : '');
    }
    if (!pk) {
      s.vd.forEach(function (v, i) {
        var n = t('video') + ' ' + (i + 1), pr = price(v.p) == null ? '' : amount(price(v.p), s), dt = v.t ? fmtDate(v.t) : '';
        add('v' + i, n, [v.d, v.l, pr, dt].map(function (x) { return String(x || '').trim(); }).filter(Boolean).join(' · '));
        add('v' + i + 'd', n + ': ' + L('الوصف', 'description'), v.d);
        add('v' + i + 'l', n + ': ' + t('vLen'), v.l);
        add('v' + i + 'p', n + ': ' + t('vPrice'), pr);
        add('v' + i + 't', n + ': ' + t('vDate'), dt);
      });
    }
    add('in', L('ما يشمله السعر', 'What the price includes'), listJoin(s.in.map(function (k) { return optLabel('in', k); }).concat(ioItems(s.io))));
    add('mu', t('music'), optLabel('mu', s.mu));
    add('pm', t('payBy'), listJoin(s.pm.map(function (k) { return k === 'ot' ? (s.pmo || optLabel('pm', 'ot')) : optLabel('pm', k); })));
    add('ac', t('account'), s.ac);
    add('dp', t('deposit'), s.dp === 0 ? optLabel('dp', 0) : s.dp + '%');
    add('sc', L('دفع الفيديوهات', 'Paying the videos'), videoCount(s) > 1 ? optLabel('sc', s.sc) : L('لا ينطبق (فيديو واحد)', 'Not needed (one video)'));
    add('fe', L('رسوم التحويل على', 'Transfer fees paid by'), optLabel('fe', s.fe));
    add('rd', t('rounds'), s.rd === 0 ? L('لا يوجد', 'None') : rounds(s.rd));
    add('ex', t('extra'), s.ex ? s.ex + ' ' + curName(s) : '');
    add('rv', t('review'), s.rh ? hours(s.rh) : days(s.rv));
    add('tn', t('turn'), s.th ? hours(s.th) : days(s.tn));
    add('nt', t('notice'), days(s.nt));
    add('wd', t('workDays'), s.wd || L('أيام العمل الرسمية وتوقيت بلد الفريلانسر', 'The freelancer’s official work days and time zone'));
    add('fk', L('مدة الاحتفاظ بملفات المشروع', 'Keeping the project files'), optLabel('fk', s.fk));
    add('pf', t('portfolio'), s.pf ? L('مسموح بعد نشر الفيديو', 'Allowed once the video is published') : L('بإذن مكتوب من العميل فقط', 'Only with the client’s written permission'));
    add('tr', t('terms'), s.tr);
    add('vm', t('vTitle'), s.vm ? L('نعم', 'Yes') : L('لا', 'No'));
    s.qa.forEach(function (r, i) {
      add('qa' + i, L('سؤال عن ', 'Question about ') + clauseName(r.k), L('س: ', 'Q: ') + r.q + (r.a ? L(' — ج: ', ' — A: ') + r.a : L(' (بانتظار الجواب)', ' (waiting for the answer)')));
    });
    return out;
  }
  // What changed from version a to version b: [label, before, after]. A video found in both
  // is compared field by field; a video added or removed takes one line.
  function changes(a, b) {
    var bridge = a.md !== b.md, la = terms(a, bridge), lb = terms(b, bridge), A = {}, B = {}, ids = [], seen = {}, ia = 0;
    la.forEach(function (x) { A[x[0]] = x; });
    lb.forEach(function (x) { B[x[0]] = x; });
    function take(id) { if (!seen[id]) { seen[id] = 1; ids.push(id); } }
    lb.forEach(function (x) {   // b's order, with what only a had kept near its old place
      if (A[x[0]]) for (; ia < la.length && la[ia][0] !== x[0]; ia++) { if (!B[la[ia][0]]) take(la[ia][0]); }
      take(x[0]);
    });
    for (; ia < la.length; ia++) if (!B[la[ia][0]]) take(la[ia][0]);
    var out = [];
    ids.forEach(function (id) {
      var m = id.match(/^v(\d+)([dlpt]?)$/);
      if (m) {
        var both = !!(A['v' + m[1]] && B['v' + m[1]]);
        if (m[2] ? !both : both) return;
      }
      var x = A[id], y = B[id], before = x ? x[2] : t('amNotSet'), after = y ? y[2] : t('amNotSet');
      if (m && !m[2]) {   // a video row on one side only: added, removed, or (pricing way changed) in the package
        if (!x) before = bridge ? t('amInPack') : t('amNoVid');
        if (!y) after = bridge ? t('amInPack') : t('amGone');
      }
      if (before !== after) out.push([(y || x)[1], before, after, id]);
    });
    return out;
  }
  // The amendments, newest first, with each changed version rebuilt and checked against the
  // code the amendment names (a link put together by hand would not match)
  function historyOf(s) {
    if (!s.am.length) return Promise.resolve([]);
    var vs = versions(s), olds = vs.slice(0, -1);
    return Promise.all(olds.map(digestOf)).then(function (dg) {
      return Promise.all(olds.map(function (v, k) {
        return v.vm && dg[k].length === 32 ? sha256hex(v.fm + '|' + v.cm) : '';
      })).then(function (pairs) {
        return olds.map(function (v, k) {
          var code = codeFrom(dg[k]);
          return { n: k + 1, from: v, to: vs[k + 1], code: code, ok: s.am[k].c === code, why: s.am[k].w,
                   hash: dg[k].length === 32 ? hexOf(dg[k]) : '', pair: pairs[k], vs: null };
        }).reverse();
      });
    });
  }
  // Where the changed version stood on the e-mail confirmation (loaded after the page shows)
  function histStatus(a) {
    var vs = a.vs, s = a.from;
    if (!vs || vs.error || !s.vm) return '';
    if (vs.state === 'locked') return t('amVsBoth', { d: esc(dayOf(vs.locked_at)) });
    var f = vs.f && vs.f.confirmed_at, c = vs.c && vs.c.confirmed_at;
    if (!f && !c) return t('amVsNone');
    var who = f ? 'f' : 'c', other = f ? 'c' : 'f';
    function nm(r) { return esc((r === 'f' ? s.fn : s.cn) || '—') + ' (' + (r === 'f' ? t('fl') : t('cl')) + ')'; }
    return t('amVsOne', { who: nm(who), other: nm(other), d: esc(dayOf(vs[who].confirmed_at)) });
  }
  /* ---------- questions and answers under the lines (written into the contract) ---------- */
  function clauseName(k) { var p = String(k).split('.'); return t('clause', { s: p[0], i: p[1] }); }
  // Who is looking: from a confirmation e-mail we know; a received contract is read by the side that
  // didn't make this version; your own result is yours
  function viewerRole() {
    if (confirmInfo && !confirmInfo.error && confirmInfo.role) return confirmInfo.role;
    return mode === 'received' ? (S.ro === 'c' ? 'f' : 'c') : S.ro;
  }
  function canAnswer(r) { return (mode === 'received' || mode === 'result') && !r.a && viewerRole() !== r.by; }
  // «اسأل» shows on every contract on the page, received or your own (his ask 2026-11-06: hiding it
  // on a contract you made looked like the button was missing)
  function askable() { return mode === 'received' || mode === 'result'; }
  function qaOpen(s) { return (s || S).qa.some(function (r) { return !r.a; }); }
  // The newest version only asked or answered something: 'ask' | 'answer' | ''
  function lastQaKind() {
    var h = current.hist && current.hist[0];
    if (!h) return '';
    var done = function (s) { return s.qa.filter(function (r) { return r.a; }).length; };
    if (done(h.to) > done(h.from)) return 'answer';
    if (h.to.qa.length > h.from.qa.length) return 'ask';
    return '';
  }
  // The questions picked by «pick», each with its answer (or who it waits for) and a line saying
  // it is written into this contract, with the versions
  function qaHTML(s, pick, forFile, withText) {
    return s.qa.map(function (r, idx) {
      if (!pick(r)) return '';
      var asker = r.by === 'f' ? t('fl') : t('cl'), other = r.by === 'f' ? t('cl') : t('fl');
      var h = '<div class="cm-qa">' + (withText && r.x ? '<p class="cm-qa-x">' + t('qaAbout', { k: esc(clauseName(r.k)), x: esc(r.x) }) + '</p>' : '') +
        '<div class="cm-qa-q"><b>' + t('qaQ', { who: asker }) + '</b> <small><bdi dir="ltr">' + esc(fmtDate(r.d)) + '</bdi></small><p>' + V(r.q) + '</p></div>';
      if (r.a) {
        h += '<div class="cm-qa-a"><b>' + t('qaA', { who: other }) + '</b> <small><bdi dir="ltr">' + esc(fmtDate(r.e)) + '</bdi></small><p>' + V(r.a) + '</p></div>' +
          '<p class="cm-qa-doc">' + icon('ok') + '<span>' + t('qaDocBoth', { q: r.qv || '—', a: r.av || '—' }) + '</span></p>';
      } else {
        h += '<p class="cm-qa-doc cm-qa-open">' + icon('ok') + '<span>' + t('qaDocQ', { q: r.qv || '—', who: other }) + '</span>' +
          (!forFile && canAnswer(r) ? ' <button type="button" class="cm-btn cm-btn-primary cm-qa-btn" data-qa-ans="' + idx + '">' + t('qaAnswerBtn') + '</button>' : '') + '</p>';
      }
      return h + '</div>';
    }).join('');
  }
  // A question or an answer = a new version of the same contract, kept in its history (like an amendment)
  function qaVersion(change, kind) {
    var base = clone(S), code = current.code, next = clone(S);
    change(next);
    next.ver = Math.min(999, next.ver + 1); next.dt = today();
    next.am = base.am.concat([{ c: code, w: '', p: patchOf(base, next) }]);
    S = normalize(next);
    amend = null; confirmToken = ''; confirmInfo = null; fromLink = false; qaJust = kind;
    return build().then(function () {
      if ((current.url.split('#c=')[1] || '').length > 11500) { toast(t('tooLong')); }
      mode = 'result'; saveDraft(); render(); scrollToCard();
      try { history.replaceState(history.state, '', location.pathname); } catch (e) {}
    });
  }
  function openAsk(li, ansIdx) {
    closeAsk();
    var k = li.getAttribute('data-k'), ans = ansIdx != null, box = document.createElement('div');
    if (!ans && S.qa.length >= MAX_QA) { toast(t('qaMax')); return; }
    box.className = 'cm-ask';
    box.innerHTML = '<label class="cm-label">' + (ans ? t('qaAnsLabel') : t('qaAskLabel', { k: esc(clauseName(k)) })) + '</label>' +
      '<textarea class="cm-textarea" dir="auto" maxlength="' + (ans ? 400 : 300) + '" placeholder="' + esc(t(ans ? 'qaAnsPh' : 'qaAskPh')) + '"></textarea>' +
      '<p class="cm-hint">' + t(ans ? 'qaAnsNote' : 'qaAskNote') + '</p>' +
      '<div class="cm-ask-row"><button type="button" class="cm-btn cm-btn-primary" data-ask-send="' + (ans ? 'a' + ansIdx : 'q' + k) + '">' + t(ans ? 'qaSendA' : 'qaSendQ') + '</button>' +
      '<button type="button" class="cm-btn cm-btn-ghost" data-ask-close>' + t('qaCancel') + '</button></div>';
    (li.querySelector('.cm-li > div') || li).appendChild(box);
    li.classList.add('cm-li-on');
    var ta = box.querySelector('textarea');
    try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); }
    var r = box.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 20) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function closeAsk() {
    var old = app.querySelector('.cm-ask');
    if (old) old.remove();
    Array.prototype.forEach.call(app.querySelectorAll('.cm-li-on'), function (x) { x.classList.remove('cm-li-on'); });
  }
  function sendAsk(btn) {
    var box = btn.closest('.cm-ask'), ta = box && box.querySelector('textarea'), text = ta ? ta.value.replace(/\s+/g, ' ').trim() : '';
    if (!text) { if (ta) ta.focus(); toast(t('qaEmpty')); return; }
    var what = btn.getAttribute('data-ask-send'), me = viewerRole(), day = today();
    busy(btn, true, t('making'));
    if (what.charAt(0) === 'q') {
      var k = what.slice(1), li = btn.closest('.cm-li'), body = li && li.querySelector('.cm-li > div');
      var line = '';
      if (body) { var c = body.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll('.cm-qa, .cm-ask, .cm-ask-btn'), function (x) { x.remove(); }); line = c.textContent.replace(/\s+/g, ' ').trim().slice(0, 160); }
      qaVersion(function (n) { n.ro = me; n.qa.push({ k: k, x: line, q: text.slice(0, 300), by: me, d: day, qv: n.ver + 1, a: '', e: '', av: 0 }); }, 'ask');
    } else {
      var i = +what.slice(1);
      if (!S.qa[i] || S.qa[i].a) { busy(btn, false); return; }
      qaVersion(function (n) { n.ro = me; n.qa[i].a = text.slice(0, 400); n.qa[i].e = day; n.qa[i].av = n.ver + 1; }, 'answer');
    }
  }
  var qaJust = '';   // this page just added a question or an answer ('ask' / 'answer')

  // «سجل التعديلات» at the top of the sheet: one block per amendment, newest first
  function amendHTML() {
    var hist = current.hist || [];
    if (!hist.length) return '';
    var h = '<div class="cm-p-block cm-am-head" data-block="am"><h3><i>' + icon('edit') + '</i>' + t('amTitle') + '</h3><p>' + t('amIntro') + '</p></div>';
    hist.forEach(function (a, i) {
      var rows = changes(a.from, a.to);
      // A version that only asked or answered a question says so
      var qaOnly = rows.length && rows.every(function (r) { return /^qa\d+$/.test(r[3]); });
      var done = function (s) { return s.qa.filter(function (r) { return r.a; }).length; };
      var tag = qaOnly ? t(done(a.to) > done(a.from) ? 'qaTagAns' : 'qaTagAsk') : '';
      h += '<div class="cm-p-block cm-am" data-block="am">' +
        '<div class="cm-am-top"><b>' + t('amN', { n: a.n }) + '</b>' + (tag ? '<span class="cm-am-tag">' + tag + '</span>' : '') + (i === 0 && hist.length > 1 ? '<span class="cm-am-new">' + t('amLatest') + '</span>' : '') +
        '<span class="cm-am-meta">' + t('amFromTo', { a: a.from.ver, b: a.to.ver }) + ' · <bdi dir="ltr">' + esc(fmtDate(a.to.dt)) + '</bdi></span></div>' +
        (a.why ? '<p class="cm-am-why"><span>' + t('amWhyShow') + '</span> ' + V(a.why) + '</p>' : '') +
        '<div class="cm-am-rows"><div class="cm-am-row cm-am-hd"><span>' + t('amTerm') + '</span><span>' + t('amBefore') + '</span><span>' + t('amAfter') + '</span></div>' +
        rows.map(function (r) {
          return '<div class="cm-am-row"><span class="cm-am-k">' + esc(r[0]) + '</span><span class="cm-am-b"><small>' + t('amBefore') + '</small>' + Vw(r[1]) + '</span><span class="cm-am-a"><small>' + t('amAfter') + '</small>' + Vw(r[2]) + '</span></div>';
        }).join('') + '</div>' +
        '<p class="cm-am-rest">' + icon('ok') + '<span>' + t('amRest') + '</span></p>' +
        '<p class="cm-am-of">' + t('amOf', { v: a.from.ver, d: '<bdi dir="ltr">' + esc(fmtDate(a.from.dt)) + '</bdi>', c: '<b class="cm-code">' + esc(a.code) + '</b>' }) +
        ' <span data-am-vs="' + a.n + '">' + histStatus(a) + '</span>' +
        (a.ok ? '' : '<em class="cm-am-bad">' + t('amBad') + '</em>') + '</p></div>';
    });
    return h;
  }

  // The contract sheet. blocks: data-block marks the pieces the PDF can put on pages
  function paperHTML(s, code, url, qrImg, forFile) {
    var sum = total(s);
    var h = '';
    h += '<header class="cm-p-head" data-block="head">' +
      '<h2 class="cm-p-title">' + L('عقد خدمات المونتاج', 'Video Editing Agreement') + '</h2>' +
      '<p class="cm-p-subtitle">' + L('اتفاق ودي إلكتروني بين الفريلانسر والعميل', 'A friendly electronic agreement between the freelancer and the client') + '</p>' +
      '<div class="cm-p-meta"><span>' + t('ver') + ' <b>' + s.ver + '</b></span><span>' + fmtDate(s.dt) + '</span><span>' + t('code') + ' <b class="cm-code">' + esc(code) + '</b></span>' + stampHTML() + '</div>' +
      '</header><div class="cm-p-body">';

    // An amended contract opens with what each amendment changed (before / after)
    h += amendHTML();

    // Parties
    h += '<div class="cm-p-block" data-block="parties"><div class="cm-p-parties">';
    [['f', s.fn, s.fc, s.fx, s.fm], ['c', s.cn, s.cc, s.cx, s.cm]].forEach(function (p) {
      h += '<div class="cm-p-party"><h4>' + (p[0] === 'f' ? t('fl') : t('cl')) + '</h4>' +
        '<div><span>' + t('name') + ':</span> ' + V(p[1] || '—') + '</div>' +
        '<div><span>' + t('country') + ':</span> ' + V(p[2] || '—') + '</div>' +
        '<div><span>' + L('التواصل', 'Contact') + ':</span> ' + V(p[3] || '—') + '</div>' +
        (s.vm ? '<div><span>' + t('vMail') + ':</span> ' + V(p[4] || '—') + '</div>' : '') + '</div>';
    });
    h += '</div></div>';

    // The deal at a glance, before any clause
    h += '<div class="cm-p-block" data-block="sum"><div class="cm-p-sum">' + glance(s).map(function (g) {
      return '<div><span>' + esc(g[0]) + '</span><b>' + V(g[1]) + '</b></div>';
    }).join('') + '</div></div>';

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

    // Clauses; each line carries its key (section.line) and, under it, the questions asked about it
    var seen = {}, ask = !forFile && askable();   // «اسأل» on the page only, never in the file
    var askBtn = ask ? '<button type="button" class="cm-ask-btn" data-qa-ask title="' + esc(t('qaAskTitle')) + '" aria-label="' + esc(t('qaAskTitle')) + '">' + icon('ask') + t('qaAskBtn') + '</button>' : '';
    sections(s, code).forEach(function (sec, i) {
      h += '<section class="cm-p-sec" data-block="sec"><h3><i>' + (i + 1) + '</i>' + sec.t + '</h3><div class="cm-p-items">';
      sec.items.forEach(function (it, j) {
        var k = (i + 1) + '.' + (j + 1);
        seen[k] = 1;
        h += '<div class="cm-li' + (ask ? ' cm-li-ask' : '') + '" data-k="' + k + '"><span class="cm-li-n">' + (j + 1) + '</span><div>' + it + askBtn + qaHTML(s, function (r) { return r.k === k; }, forFile) + '</div></div>';
      });
      h += '</div></section>';
    });
    // A question whose line no longer exists (an amendment changed the clause): kept, with the text it was about
    var lost = s.qa.filter(function (r) { return !seen[r.k]; });
    if (lost.length) h += '<section class="cm-p-sec" data-block="sec"><h3><i>؟</i>' + t('qaOther') + '</h3><div class="cm-p-items"><div class="cm-li"><div>' +
      qaHTML(s, function (r) { return !seen[r.k]; }, forFile, true) + '</div></div></div></section>';

    // Square code
    h += '<div class="cm-p-block" data-block="qr"><div class="cm-p-qr">' + (qrImg ? '<img src="' + qrImg + '" alt="QR">' : '') +
      '<p>' + (forFile
        ? L('امسح الباركود أو اضغط عليه لفتح النسخة الأصلية من هذا العقد والتأكد منها.', 'Scan or tap the QR code to open and verify the original version of this contract.')
        : L('امسح الباركود بكاميرا الجوال لفتح النسخة الأصلية من هذا العقد والتأكد منها.', 'Scan the QR code with a phone camera to open and verify the original version of this contract.')) +
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
  // hash = the contract's full fingerprint, pair = fingerprint of the two e-mails,
  // vs = what the confirmation service says (null until asked)
  var current = { code: '', url: '', qr: '', hash: '', pair: '', vs: null, hist: [] };
  var confirmToken = '';   // the secret from a confirmation e-mail (?v=…)
  var confirmInfo = null;  // what that secret belongs to, or { error }
  var vNote = '';          // last message of the confirmation box
  var fromLink = false;
  // An amendment being made: the version it changes (base) and its code, the reason (w), and
  // where to go back if it's cancelled (back = 'received' | 'result', link = the old #s=/#c=)
  var amend = null;
  var readOk = false;      // «قرأت العقد كاملًا» ticked (asked before any approval of a received contract)

  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ s: S, step: step, am: amend })); } catch (e) {}
  }
  // An amendment kept in a draft (never trusted, like any stored data)
  function amendFrom(a) {
    if (!a || typeof a !== 'object' || !a.base || !CODE_RE.test(a.code || '')) return null;
    var link = String(a.link || '');
    return { base: normalize(a.base), code: a.code, w: str(a.w, 140), back: a.back === 'result' ? 'result' : 'received',
             link: /^#(s=[A-Za-z0-9]{8}\.[A-Za-z0-9_-]{22}|c=[A-Za-z0-9_-]+)$/.test(link) ? link : '' };
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
  // «ما يشمله السعر»: the listed choices, then his own items (pressed; a tap removes one)
  function inclChips() {
    var own = ioItems(S.io).map(function (x, i) {
      return '<button type="button" class="cm-chip cm-chip-own" data-iorm="' + i + '" aria-pressed="true" title="' + esc(t('removeItem')) + '">' + esc(x) + '<span class="cm-x" aria-hidden="true">×</span></button>';
    }).join('');
    return chips('in', 'in', true).replace(/<\/div>$/, own + '</div>');
  }
  // Adds what was typed in «أعمال أخرى» as one more choice; false when there was nothing to add
  function addIo(text) {
    text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, IO_LEN);
    if (!text) return false;
    var items = ioItems(S.io);
    if (items.indexOf(text) === -1) {
      if (items.length >= IO_MAX) { toast(t('ioMax')); return false; }
      items.push(text);
    }
    S.io = items.join('\n');
    saveDraft();
    return true;
  }
  // Leaving the step with something still typed in the box: it is kept, not lost
  function flushIo() {
    var box = app.querySelector('[data-ioadd]');
    if (box && box.value.trim()) addIo(box.value);
  }
  function input(key, ph, attrs) {
    return '<input class="cm-input" dir="auto" data-set="' + key + '" value="' + esc(S[key]) + '" placeholder="' + esc(ph || '') + '" maxlength="' + (LIMITS[key] || 100) + '"' + (attrs || '') + '>';
  }
  // A date box that always shows Western digits (dd/mm/yyyy), whatever the browser's language.
  // The button opens the browser's own calendar (a hidden date box); the contract keeps yyyy-mm-dd.
  function dateBox(attrs, iso) {
    return '<div class="cm-date">' +
      '<input class="cm-input cm-date-text" type="text" dir="ltr" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="' + esc(t('datePh')) + '" value="' + esc(iso ? fmtDate(iso) : '') + '" data-date ' + attrs + '>' +
      '<button type="button" class="cm-date-btn" data-datepick aria-label="' + esc(t('datePick')) + '" title="' + esc(t('datePick')) + '">' + icon('cal') + '</button>' +
      '<input class="cm-date-native" type="date" tabindex="-1" aria-hidden="true" value="' + esc(iso || '') + '">' +
      '</div>';
  }
  function westDigits(x) {
    return String(x || '').replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }).replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); });
  }
  // «ddmmyyyy» → «yyyy-mm-dd» when it is a real date, else ''
  function isoFromDMY(raw) {
    var d = +raw.slice(0, 2), m = +raw.slice(2, 4), y = +raw.slice(4, 8);
    if (raw.length !== 8 || y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > new Date(y, m, 0).getDate()) return '';
    return raw.slice(4, 8) + '-' + raw.slice(2, 4) + '-' + raw.slice(0, 2);
  }
  function dateDigits(el) { return westDigits(el.value).replace(/\D/g, '').slice(0, 8); }
  function setDate(el, iso) {
    var k = el.getAttribute('data-date-key'), vid = el.getAttribute('data-date-vid');
    if (k) S[k] = iso;
    else if (vid !== null && S.vd[+vid]) S.vd[+vid].t = iso;
    var nat = el.parentNode.querySelector('.cm-date-native');
    if (nat && nat.value !== iso) nat.value = iso;
  }
  function field(label, inner, hint, opt) {
    return '<div class="cm-field"><label class="cm-label">' + label + (opt ? ' <small>(' + t('optional') + ')</small>' : '') + '</label>' + inner + (hint ? '<p class="cm-hint">' + hint + '</p>' : '') + '</div>';
  }
  function stepper(key, unit, by) {
    by = by || 1;
    return '<div class="cm-stepper-row"><div class="cm-stepper"><button type="button" data-step-key="' + key + '" data-delta="-' + by + '" aria-label="−">−</button><output>' + S[key] + '</output><button type="button" data-step-key="' + key + '" data-delta="' + by + '" aria-label="+">+</button></div>' + (unit ? '<span class="cm-unit">' + unit + '</span>' : '') + '</div>';
  }
  // «بالساعات / بأيام العمل» for the review time (rh) and the time per revision (th)
  function unitChips(key) {
    var on = S[key] > 0;
    return '<div class="cm-chips" role="group">' +
      '<button type="button" class="cm-chip" data-hunit="' + key + '" data-val="1" aria-pressed="' + on + '">' + esc(t('unitH')) + '</button>' +
      '<button type="button" class="cm-chip" data-hunit="' + key + '" data-val="0" aria-pressed="' + !on + '">' + esc(t('unitD')) + '</button></div>';
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
      h += currencyField();
      h += '<div class="cm-video cm-package"><p class="cm-hint cm-hint-top">' + t('kHint') + '</p>' +
        '<div class="cm-grid2">' +
        field(t('kCount'), '<div class="cm-count"><button type="button" data-step-key="kn" data-delta="-1" aria-label="−">−</button>' +
          '<input class="cm-input" dir="ltr" inputmode="numeric" data-num="kn" value="' + S.kn + '" maxlength="3" aria-label="' + esc(t('kCount')) + '">' +
          '<button type="button" data-step-key="kn" data-delta="1" aria-label="+">+</button></div>') +
        field(t('kPrice'), '<input class="cm-input" dir="ltr" inputmode="decimal" data-set="kp" value="' + esc(S.kp) + '" placeholder="0" maxlength="14">') +
        '</div><p class="cm-each" id="cmEach">' + eachText() + '</p>' +
        field(t('kDesc'), input('kd', t('kDescPh')), '', true) +
        field(t('kLen'), input('kl', t('kLenPh')), '', true) +
        field(t('kSched'), input('ks', t('kSchedPh')), t('kSchedHint'), true) +
        field(t('kLast'), dateBox('data-date-key="kt"', S.kt), '', true) +
        '</div>';
      h += '<div class="cm-total"><span>' + L('سعر الباقة', 'Package price') + '</span><b id="cmTotal">' + esc(amount(total(S), S)) + '</b></div>';
    } else if (step === 3) {
      h += field(t('pricing'), chips('md', 'md'));
      h += currencyField();
      h += '<p class="cm-label">' + t('videos') + '</p>';
      S.vd.forEach(function (v, i) {
        h += '<div class="cm-video"><div class="cm-video-head"><span class="cm-video-num">' + t('video') + ' ' + (i + 1) + '</span>' +
          (S.vd.length > 1 ? '<button type="button" class="cm-remove" data-vrm="' + i + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>' + t('remove') + '</button>' : '') + '</div>' +
          '<label class="cm-mini cm-mini-wide"><span>' + t('vDesc') + ' <small>(' + t('vDescSmall') + ')</small></span><input class="cm-input" dir="auto" data-vid="' + i + '" data-vf="d" value="' + esc(v.d) + '" placeholder="' + esc(t('vDescPh')) + '" maxlength="80"></label>' +
          '<div class="cm-grid3">' +
          '<label class="cm-mini"><span>' + t('vLen') + '</span><input class="cm-input" dir="auto" data-vid="' + i + '" data-vf="l" value="' + esc(v.l) + '" placeholder="' + esc(t('vLenPh')) + '" maxlength="30"></label>' +
          '<label class="cm-mini"><span>' + t('vPrice') + '</span><input class="cm-input" dir="ltr" inputmode="decimal" data-vid="' + i + '" data-vf="p" value="' + esc(v.p) + '" placeholder="0" maxlength="14"></label>' +
          '<label class="cm-mini"><span>' + t('vDate') + '</span>' + dateBox('data-date-vid="' + i + '"', v.t) + '</label>' +
          '</div></div>';
      });
      if (S.vd.length < MAX_VIDEOS) h += '<button type="button" class="cm-add" data-vadd="1">' + t('add') + '</button>';
      h += '<div class="cm-total"><span>' + t('total') + '</span><b id="cmTotal">' + esc(amount(total(S), S)) + '</b></div>';
      h += '<p class="cm-hint">' + t('vDateHint') + '</p>';
    } else if (step === 4) {
      h += field(t('incl'), inclChips());
      // His own items: typed, then Enter (or «أضف») puts each one among the choices above
      h += field(t('inclOther'), '<div class="cm-addrow"><input class="cm-input" dir="auto" data-ioadd maxlength="' + IO_LEN + '" enterkeyhint="enter" autocomplete="off" placeholder="' + esc(t('inclOtherPh')) + '">' +
        '<button type="button" class="cm-btn cm-btn-soft cm-addbtn" data-ioadd-btn>' + t('addItem') + '</button></div>', t('inclOtherHint'), true);
      h += field(t('music'), chips('mu', 'mu'));
    } else if (step === 5) {
      h += field(t('payBy'), chips('pm', 'pm', true) + (S.pm.indexOf('ot') !== -1 ? '<div class="cm-gap">' + input('pmo', t('other')) + '</div>' : ''));
      h += field(t('account'), input('ac', t('accountPh')), '', true);
      h += field(t('deposit'), chips('dp', 'dp'), t('depositHint'));
      if (videoCount(S) > 1) h += field(t('scope'), chips('sc', 'sc'), t('scopeHint'));
      h += field(t('fees'), chips('fe', 'fe'));
    } else if (step === 6) {
      h += field(t('rounds'), stepper('rd'));
      if (S.rd > 0) h += field(t('extra'), input('ex', curName(S) || '0', ' inputmode="decimal"'), '', true);
      // Hours (more precise) or work days, for the two short times
      h += field(t('review'), unitChips('rh') + '<div class="cm-gap">' + (S.rh ? stepper('rh', t('hourU'), HOUR_STEP) : stepper('rv', t('workDay'))) + '</div>', t('rvHint'));
      h += field(t('turn'), unitChips('th') + '<div class="cm-gap">' + (S.th ? stepper('th', t('hourU'), HOUR_STEP) : stepper('tn', t('workDay'))) + '</div>');
      h += field(t('notice'), stepper('nt', t('workDay')), t('noticeHint'));
      h += field(t('keep'), chips('fk', 'fk'), t('keepHint'));
      h += field(t('workDays'), input('wd', t('workDaysPh')), t('workDaysHint'), true);
      h += field(t('portfolio'), '<label class="cm-switch"><input type="checkbox" data-toggle="pf"' + (S.pf ? ' checked' : '') + '><span>' + t('portfolioOn') + '</span></label>');
      h += field(t('terms'), '<textarea class="cm-textarea" dir="auto" data-set="tr" maxlength="400" placeholder="' + esc(t('termsPh')) + '">' + esc(S.tr) + '</textarea>', '', true);
      if (API && VERIFY) {
        h += field(t('vmTitle'), '<label class="cm-switch"><input type="checkbox" data-toggle="vm"' + (S.vm ? ' checked' : '') + '><span>' + t('vmOn') + '</span></label>' +
          (S.vm ? '<div class="cm-grid2 cm-gap">' + field(t('fMail'), mailInput('fm')) + field(t('cMail'), mailInput('cm')) + '</div>' : ''), t('vmHint'), true);
      }
      // An amendment: what changed so far (before → after) and why, before showing the contract
      if (amend) {
        h += '<div class="cm-field cm-amend-box" id="cmAmendBox"><label class="cm-label">' + t('amWhat') + '</label>' + amendListHTML(changes(amend.base, normalize(S))) + '</div>';
        h += field(t('amWhy'), '<input class="cm-input" dir="auto" data-amwhy value="' + esc(amend.w) + '" placeholder="' + esc(t('amWhyPh')) + '" maxlength="140">', '', true);
      }
    }
    return h;
  }
  function amendListHTML(rows) {
    if (!rows.length) return '<p class="cm-hint cm-amend-list">' + t('amNoneYet') + '</p>';
    return '<ul class="cm-amend-list">' + rows.map(function (r) {
      return '<li><b>' + esc(r[0]) + '</b><span><s>' + Vw(r[1]) + '</s><i aria-hidden="true">' + L('←', '→') + '</i>' + Vw(r[2]) + '</span></li>';
    }).join('') + '<li class="cm-amend-rest">' + icon('ok') + '<span>' + t('amRest') + '</span></li></ul>';
  }
  function refreshAmendBox() {
    var box = amend && document.getElementById('cmAmendBox');
    var list = box && box.querySelector('.cm-amend-list');
    if (list) list.outerHTML = amendListHTML(changes(amend.base, normalize(S)));
  }
  function mailInput(key) {
    return '<input class="cm-input" type="email" dir="ltr" inputmode="email" autocomplete="email" data-set="' + key + '" value="' + esc(S[key]) + '" placeholder="name@example.com" maxlength="120">';
  }
  // Currencies: several can be picked; the first one picked is the main one (prices are in it)
  // His own currency (his ask 2026-11-05): typed under the chips, Enter / «أضف» puts it among them
  // (kept as the «أخرى» currency: cu / ca hold 'ot', cuo its name, as contracts made before)
  function currencyField() {
    var sel = [S.cu].concat(S.ca), ownOn = sel.indexOf('ot') !== -1, own = ownOn && String(S.cuo || '').trim();
    var chipsHtml = '<div class="cm-chips" role="group">' + OPT.cu.filter(function (o) { return o[0] !== 'ot' || ownOn; }).map(function (o) {
      var on = sel.indexOf(o[0]) !== -1, main = o[0] === S.cu && S.ca.length > 0, mine = o[0] === 'ot';
      return '<button type="button" class="cm-chip' + (mine ? ' cm-chip-own' : '') + '" data-cur="' + o[0] + '" aria-pressed="' + on + '"' + (mine ? ' title="' + esc(t('removeItem')) + '"' : '') + '>' +
        esc(mine ? curName(S, 'ot') : (isEn() ? o[2] : o[1])) +
        (main ? ' <small class="cm-main">' + t('curMain') + '</small>' : '') + (mine ? '<span class="cm-x" aria-hidden="true">×</span>' : '') + '</button>';
    }).join('') + '</div>';
    var add = own ? '' : '<div class="cm-addrow cm-gap"><input class="cm-input" dir="auto" data-curadd maxlength="' + LIMITS.cuo + '" enterkeyhint="enter" autocomplete="off" placeholder="' + esc(t('curOwnPh')) + '">' +
      '<button type="button" class="cm-btn cm-btn-soft cm-addbtn" data-curadd-btn>' + t('addItem') + '</button></div>';
    var hint = S.ca.length ? '<p class="cm-hint">' + t('curHint', { main: esc(curName(S)), others: esc(listJoin(otherCurrencies(S))) }) + '</p>' : '';
    return '<div class="cm-field"><label class="cm-label">' + t('currency') + ' <small>(' + t('currencySmall') + ')</small></label>' + chipsHtml + add + hint + '</div>';
  }
  // Adds his own currency (an extra accepted one; to make it the main one, unselect the others)
  function addCur(text) {
    text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, LIMITS.cuo);
    if (!text) return false;
    S.cuo = text;
    if (S.cu !== 'ot' && S.ca.indexOf('ot') === -1) S.ca.push('ot');
    saveDraft();
    return true;
  }
  function flushCur() {
    var box = app.querySelector('[data-curadd]');
    if (box && box.value.trim()) addCur(box.value);
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
      (amend ? '<div class="cm-amend-note">' + icon('edit') + '<span>' + t('amBanner', { c: '<b class="cm-code">' + esc(amend.code) + '</b>', v: S.ver }) +
        ' <button type="button" class="cm-link" data-go="amendcancel">' + t('amCancel') + '</button></span></div>' : '') +
      (note && !amend ? '<div class="cm-note">' + note + ' <button type="button" class="cm-link" data-go="restart">' + t('restart') + '</button></div>' : '') +
      stepBody() +
      '<p class="cm-error" id="cmError" hidden></p>' +
      '<div class="cm-nav">' +
      (step > 1 ? '<button type="button" class="cm-btn cm-btn-ghost" data-go="back">' + t('back') + '</button>' : '') +
      '<button type="button" class="cm-btn cm-btn-primary" data-go="' + (step < STEPS ? 'next' : 'show') + '">' + (step < STEPS ? t('next') : t('show')) + '</button>' +
      '</div></div>';
  }

  function validate() {
    if (app.querySelector('.cm-date-text[aria-invalid="true"]')) return t('dateBad');
    if (step === 1 && (!S.fn.trim() || !S.cn.trim())) return t('needNames');
    if (step === 3 && total(S) == null) return S.md === 'p' ? t('needPackage') : t('needPrice');
    if (step === 6 && S.vm) {
      var a = String(S.fm).trim().toLowerCase(), b = String(S.cm).trim().toLowerCase();
      if (!MAIL_RE.test(a) || !MAIL_RE.test(b)) return t('needMails');
      if (a === b) return t('sameMail');
    }
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
    current.vs = null;
    current.hist = [];
    vNote = '';
    readOk = false;
    return encodeState(S).then(function (enc) {
      current.url = shareBase() + '#c=' + enc;
      return digestOf(S);
    }).then(function (h) {
      current.code = codeFrom(h);
      current.hash = h.length === 32 ? hexOf(h) : '';
      return S.vm && current.hash ? sha256hex(S.fm + '|' + S.cm) : '';
    }).then(function (pair) {
      current.pair = pair;
      return qrDataUrl(current.url);
    }).then(function (qr) {
      current.qr = qr;
      return historyOf(S);
    }).then(function (hist) { current.hist = hist; });
  }

  // Once someone confirmed this contract, changing it means an amendment (kept on record), never an edit in place
  function pinned() { return !!(current.vs && (current.vs.state === 'partial' || current.vs.state === 'locked')); }
  function editBtnHTML() {
    var add = mode === 'received' || (!amend && pinned());
    return '<button type="button" class="cm-btn cm-btn-soft" id="cmEditBtn" data-go="' + (add ? 'amend' : 'edit') + '">' + icon('edit') + (add ? t('amAdd') : t('edit')) + '</button>';
  }
  // Red, above every approval of a received contract: read it all and ask before agreeing
  function readGateHTML(id) {
    return '<div class="cm-readfirst' + (readOk ? ' cm-read-ok' : '') + '"' + (id ? ' id="' + id + '"' : '') + '><p class="cm-warn">' + icon('warn') + '<span>' + t('readWarn') + '</span></p>' +
      '<label class="cm-check"><input type="checkbox" data-readok' + (readOk ? ' checked' : '') + '><span>' + t('readOk') + '</span></label>' +
      '<p class="cm-readneed" role="alert" hidden>' + t('readNeed') + '</p></div>';
  }

  function renderResult() {
    var received = mode === 'received', verify = verifying(), am = S.am.length > 0;
    var linkInBar = !!(API && !received);   // with «أرسل رابطًا» in the row, «نسخ الرابط» moves to the bar under it
    var actions =
      (!received ? '<button type="button" class="cm-btn cm-btn-primary" data-act="send">' + icon('send') + t('send') + '</button>' +
          (API ? '<button type="button" class="cm-btn cm-btn-soft" data-act="sendlink">' + icon('link') + t('sendLink') + '</button>' : '')
        : verify ? ''   // the e-mail box at the top takes the approval
        : '<button type="button" class="cm-btn cm-btn-primary" data-act="approve">' + t('agree') + '</button>') +
      '<button type="button" class="cm-btn cm-btn-soft" data-act="pdf">' + icon('down') + t('download') + '</button>' +
      (linkInBar ? '' : '<button type="button" class="cm-btn cm-btn-soft" data-act="copy">' + icon('link') + t('copy') + '</button>') +
      editBtnHTML();
    var title = received ? t(am ? 'amReceived' : 'received') : t(amend ? 'amReady' : 'ready');
    var sub = received ? (am ? t('amReceivedSub', { v: S.ver }) : t(verify ? 'receivedSubMail' : 'receivedSub')) : t(amend ? 'amReadySub' : 'readySub');
    // A question or an answer just added here, or received: say so first
    var qk = received ? lastQaKind() : qaJust;
    var forMe = received && S.qa.some(canAnswer);
    if (!received && qk === 'ask') { title = t('qaAskedT'); sub = t('qaAskedSub'); }
    else if (!received && qk === 'answer') { title = t('qaAnsweredT'); sub = t('qaAnsweredSub'); }
    else if (forMe) { title = t('qaGotQT'); sub = t('qaGotQSub'); }
    else if (received && qk === 'answer') { title = t('qaGotAT'); sub = t('qaGotASub'); }
    app.innerHTML =
      '<div class="cm-result cm-fade">' +
      '<div class="cm-ready"><span class="cm-ok">' + icon(qk || forMe ? 'ask' : am ? 'edit' : 'ok') + '</span><h2>' + title + '</h2><p>' + sub + '</p></div>' +
      // The e-mail box comes first, so each side sees where the other one stands before the contract
      (verify ? '<div class="cm-approve cm-verify cm-verify-first' + (confirmToken ? ' cm-verify-mine' : '') + '" id="cmVerify">' + verifyHTML() + '</div>' : '') +
      (received && !verify ? readGateHTML('cmReadTop') : '') +
      '<div class="cm-actions">' + actions + '</div>' +
      '<p class="cm-sendnote" id="cmSendNote" role="status" hidden></p>' +
      '<div class="cm-toolbar"><span class="cm-code-pill">' + t('code') + ' <code>' + esc(current.code) + '</code></span>' +
      '<span class="cm-toolbar-end">' + (linkInBar ? '<button type="button" class="cm-link" data-act="copy">' + t('copy') + '</button>' : '') +
      '<button type="button" class="cm-link" data-act="dark">' + (paperDark() ? t('darkOff') : t('darkOn')) + '</button></span></div>' +
      (askable() ? '<p class="cm-qa-hint">' + icon('ask') + '<span>' + t('qaHint') + '</span></p>' : '') +
      '<article class="cm-paper' + (paperDark() ? ' dark' : '') + '" id="cmPaper">' + paperHTML(S, current.code, current.url, current.qr) + '</article>' +
      (verify
        ? '<div class="cm-approve cm-verify" id="cmVerifyEnd"' + (verifyEndHTML() ? '' : ' hidden') + '>' + verifyEndHTML() + '</div>'
        : '<div class="cm-approve"><h3>' + t('approveTitle') + '</h3><p>' + t('approveText', { ch: esc(chName(S)) }) + '</p><q dir="auto">' + esc(approvalText(S, current.code)) + '</q>' +
          (received ? readGateHTML() : '') +
          '<button type="button" class="cm-btn cm-btn-primary" data-act="approve">' + t('agree') + '</button>' +
          (received ? '<a class="cm-link" href="' + esc(shareBase().replace(/#.*$/, '')) + '" data-go="restart">' + t('makeOwn') + '</a>' : '') +
          '</div>') +
      '</div>';
    if (verify) loadVerify();
    loadHistory();
  }
  // Where each amended version stood on the e-mail confirmation (one question per version, once)
  function loadHistory() {
    if (!API || !VERIFY) return;
    var code = current.code;
    (current.hist || []).forEach(function (a) {
      if (a.vs || !a.from.vm || !a.hash || !a.pair) return;
      a.vs = { loading: true };
      api('/status?h=' + a.hash + '&p=' + a.pair).then(function (vs) {
        if (current.code !== code) return;
        a.vs = vs;
        var el = app.querySelector('[data-am-vs="' + a.n + '"]');
        if (el) el.innerHTML = histStatus(a);
      }, function () { a.vs = null; });
    });
  }

  /* ---------- short link (needs the service at API) ---------- */
  // The contract is encrypted here with a fresh key. The service keeps only the unreadable
  // result; the key travels in the link after #s= (a part of the address never sent anywhere).
  var shortJob = null;
  function shortLink() {
    if (!API || !(window.crypto && crypto.subtle) || !current.url) return Promise.resolve('');
    if (current.short && current.shortFor === current.code) return Promise.resolve(current.short);
    if (shortJob && shortJob.code === current.code) return shortJob.p;
    var code = current.code, payload = current.url.split('#c=')[1] || '';
    var key = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    var p = crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']).then(function (k) {
      return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(payload));
    }).then(function (ct) {
      var all = new Uint8Array(12 + ct.byteLength);
      all.set(iv, 0);
      all.set(new Uint8Array(ct), 12);
      return api('/s', { d: toB64url(all) });
    }).then(function (r) {
      var link = shareBase() + '#s=' + r.id + '.' + toB64url(key);
      if (current.code === code) { current.short = link; current.shortFor = code; }
      return link;
    }).catch(function (e) { console.error(e); shortJob = null; return ''; });
    shortJob = { code: code, p: p };
    return p;
  }
  function openShort(id, keyText) {
    return api('/s/' + id).then(function (r) {
      var all = fromB64url(r.d);
      return crypto.subtle.importKey('raw', fromB64url(keyText), 'AES-GCM', false, ['decrypt']).then(function (k) {
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.slice(0, 12) }, k, all.slice(12));
      });
    }).then(function (plain) { return new TextDecoder().decode(plain); });
  }

  /* ---------- e-mail confirmation (optional; needs the service at API) ---------- */
  function verifying() { return !!(S && S.vm && API && VERIFY && current.hash && current.pair); }
  function lockedAt() { return S && S.vm && current.vs && current.vs.state === 'locked' ? current.vs.locked_at : 0; }
  function dayOf(ms) { var d = new Date(ms); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function stampHTML() { var at = lockedAt(); return at ? '<span class="cm-p-ok">✓ ' + t('vStamp') + ' · ' + esc(dayOf(at)) + '</span>' : ''; }

  function api(path, body) {
    var opt = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' };
    return fetch(API.replace(/\/+$/, '') + path, opt).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || 'http'); e.code = j.error || 'http'; throw e; }
        return j;
      });
    }, function () { var e = new Error('net'); e.code = 'net'; throw e; });
  }

  // Asks the service once per contract (again only after an error)
  function loadVerify() {
    if (!verifying() || (current.vs && !current.vs.error)) return;
    var hash = current.hash;
    var jobs = [api('/status?h=' + current.hash + '&p=' + current.pair)];
    if (confirmToken && !confirmInfo) {
      jobs.push(api('/token?t=' + encodeURIComponent(confirmToken)).catch(function (e) { return { error: e.code === 'bad_token' ? 'bad_token' : 'net' }; }));
    }
    Promise.all(jobs).then(function (r) {
      if (hash !== current.hash) return;   // another contract was opened meanwhile
      current.vs = r[0];
      if (r[1]) confirmInfo = r[1].error ? r[1] : (r[1].hash === current.hash && r[1].pair === current.pair ? r[1] : { error: 'other_contract' });
      updateVerify();
    }, function (e) {
      if (hash !== current.hash) return;
      current.vs = { error: e.code || 'net' };
      updateVerify();
    });
  }
  function updateVerify() {
    var box = document.getElementById('cmVerify');
    if (box) box.innerHTML = verifyHTML();
    var end = document.getElementById('cmVerifyEnd');
    if (end) { var e = verifyEndHTML(); end.innerHTML = e; end.hidden = !e; }
    var meta = document.querySelector('#cmPaper .cm-p-meta');
    if (meta && !meta.querySelector('.cm-p-ok')) meta.insertAdjacentHTML('beforeend', stampHTML());
    // Someone confirmed your contract: from now on a change is an amendment, kept on record
    var eb = document.getElementById('cmEditBtn');
    if (eb && mode === 'result' && !amend && pinned() && eb.getAttribute('data-go') !== 'amend') {
      eb.setAttribute('data-go', 'amend');
      eb.innerHTML = icon('edit') + t('amAdd');
    }
  }
  function canConfirm() {
    var vs = current.vs;
    return !!(confirmToken && confirmInfo && !confirmInfo.error && vs && !vs.error && !(vs[confirmInfo.role] && vs[confirmInfo.role].confirmed_at));
  }

  // The e-mail box at the top of the contract: where each side stands, and the buttons.
  // Opened from a confirmation e-mail, it also says whom you confirm as.
  function verifyHTML() {
    var vs = current.vs, h = '<h3>' + t('vTitle') + '</h3>';
    if (!vs || (confirmToken && !confirmInfo)) return h + '<p class="cm-vmsg"><span class="cm-spin cm-spin-sm"></span>' + t('vLoading') + '</p>';
    if (vs.error) return h + '<p class="cm-vmsg">' + t('vError') + '</p>';
    var me = confirmToken && confirmInfo && !confirmInfo.error ? confirmInfo.role : '';
    if (vs.state === 'locked') h += '<div class="cm-vseal">' + icon('ok') + '<div><b>' + t('vLocked') + '</b><small>' + t('vLockedSub', { d: esc(dayOf(vs.locked_at)) }) + '</small></div></div>';
    else if (me && vs[me] && vs[me].confirmed_at) h += '<div class="cm-vseal">' + icon('ok') + '<div><b>' + t('vMeDone') + '</b><small>' + t('vMeWait') + ' ' + t('vSafe') + '</small></div></div>';
    else if (canConfirm()) h += '<p>' + t('vMeText', { r: '<b>' + (me === 'f' ? t('fl') : t('cl')) + '</b>' }) + '</p>';
    else h += '<p>' + t('vIntro') + '</p>';
    h += '<ul class="cm-vlist">' + ['f', 'c'].map(function (r) {
      var sd = vs[r], ok = !!(sd && sd.confirmed_at);
      var line = ok ? t('vDone', { d: esc(dayOf(sd.confirmed_at)) }) : sd && sd.sent_at ? t('vPending', { m: '<bdi dir="ltr">' + esc(sd.email).replace('@', '<wbr>@') + '</bdi>' }) : t('vNotYet');
      return '<li' + (ok ? ' class="ok"' : '') + '><span class="cm-vdot">' + (ok ? icon('ok') : '') + '</span><span><b>' + esc((r === 'f' ? S.fn : S.cn) || '—') + '</b> <small>(' + (r === 'f' ? t('fl') : t('cl')) + ')</small><br>' + line + '</span></li>';
    }).join('') + '</ul>';
    if (confirmToken && confirmInfo && confirmInfo.error) h += '<p class="cm-vmsg">' + (confirmInfo.error === 'other_contract' ? t('vOther') : confirmInfo.error === 'bad_token' ? t('vBadLink') : t('vError')) + '</p>';
    // Every «أوافق / أؤكد» of a received contract comes after the red «read it all» note
    if (canConfirm()) h += readGateHTML() + '<button type="button" class="cm-btn cm-btn-primary" data-act="vconfirm">' + icon('ok') + t('vMeBtn') + '</button>';
    else if (vs.state !== 'locked') h += (vs.state === 'none' && mode === 'received' ? readGateHTML() : '') + '<button type="button" class="cm-btn ' + (vs.state === 'none' ? 'cm-btn-primary' : 'cm-btn-soft') + '" data-act="vsend">' + (vs.state === 'none' ? t('vSend') : t('vResend')) + '</button>';
    if (vNote) h += '<p class="cm-vmsg">' + vNote + '</p>';
    return h;
  }

  // At the end of the contract, for whoever reads to the bottom before confirming
  function verifyEndHTML() {
    if (!canConfirm()) return '';
    return '<h3>' + t('vMeTitle') + '</h3><p>' + t('vEndText') + '</p>' + readGateHTML() +
      '<button type="button" class="cm-btn cm-btn-primary" data-act="vconfirm">' + icon('ok') + t('vMeBtn') + '</button>';
  }
  // No approval while a question in the contract waits for its answer (his rule: ask, answer, then agree)
  function qaBlocks(act) { return (act === 'approve' || act === 'vconfirm' || act === 'vsend') && qaOpen(); }
  function showOpenQuestion() {
    toast(t('qaBlock'));
    var q = app.querySelector('#cmPaper .cm-qa-open');
    if (!q) return;
    q.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var box = q.closest('.cm-qa');
    if (box) { box.classList.remove('cm-need'); void box.offsetWidth; box.classList.add('cm-need'); }
  }
  // Approvals of a received contract wait for «قرأت العقد كاملًا»
  function needsRead(act) {
    if (mode !== 'received' || readOk) return false;
    return act === 'approve' || act === 'vconfirm' || (act === 'vsend' && !(current.vs && current.vs.state && current.vs.state !== 'none'));
  }
  function nudgeRead(btn) {
    var box = btn.parentNode, g = box.querySelector('.cm-readfirst');
    if (!g && box.previousElementSibling && box.previousElementSibling.classList.contains('cm-readfirst')) g = box.previousElementSibling;
    if (!g) return;
    g.classList.remove('cm-need');
    void g.offsetWidth;   // restarts the shake
    g.classList.add('cm-need');
    var m = g.querySelector('.cm-readneed');
    if (m) m.hidden = false;
    var top = g.getBoundingClientRect().top;
    if (top < 80 || top > window.innerHeight - 160) g.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var cb = g.querySelector('input');
    if (cb) try { cb.focus({ preventScroll: true }); } catch (e) { cb.focus(); }
  }

  /* ---------- a short message over the page (after confirming / approving) ---------- */
  function showDialog(html) {
    var old = document.getElementById('cmDialog');
    if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'cmDialog';
    d.className = 'cm-dialog';
    d.innerHTML = '<div class="cm-dialog-box" role="dialog" aria-modal="true" aria-labelledby="cmDialogT">' + html +
      '<button type="button" class="cm-btn cm-btn-primary" data-dclose>' + t('dlgOk') + '</button></div>';
    document.body.appendChild(d);
    function key(e) { if (e.key === 'Escape') close(); }
    function close() {
      document.removeEventListener('keydown', key);
      d.classList.remove('show');
      setTimeout(function () { d.remove(); }, 260);
    }
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-dclose]')) close(); });
    document.addEventListener('keydown', key);
    requestAnimationFrame(function () {
      d.classList.add('show');
      var b = d.querySelector('[data-dclose]');
      if (b) try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
    });
  }
  // The contract can't change unless both sides agree to an amendment
  function safeBox() {
    return '<div class="cm-dialog-safe">' + icon('lock') + '<div><b>' + t('dlgSafeT') + '</b><span>' + t('dlgSafe') + '</span><span>' + t('dlgSafe2') + '</span></div></div>';
  }
  function confirmedDialog(locked) {
    showDialog('<span class="cm-dialog-ic">' + icon('ok') + '</span><h3 id="cmDialogT">' + t(locked ? 'dlgDone' : 'dlgMine') + '</h3>' +
      '<p>' + t(locked ? 'dlgDoneSub' : 'dlgMineSub') + '</p>' + safeBox());
  }
  function sentDialog() {
    showDialog('<span class="cm-dialog-ic">' + icon('send') + '</span><h3 id="cmDialogT">' + t('dlgSent') + '</h3>' +
      '<p>' + t('dlgSentSub', { ch: esc(chName(S)) }) + '</p>' + safeBox());
  }

  function vSend(btn) {
    if (!verifying()) return;
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="cm-spin"></span>' + t('vSending'); }
    vNote = '';
    var last = S.am.length ? S.am[S.am.length - 1] : null;   // an amendment: the mails say so, with the code it changes
    api('/request', {
      hash: current.hash, code: current.code, ver: S.ver, lang: isEn() ? 'en' : 'ar', link: current.url, total: amount(total(S), S),
      f: { name: S.fn, email: S.fm }, c: { name: S.cn, email: S.cm },
      prev: last && last.c ? last.c : undefined, n: last ? S.am.length : undefined
    }).then(function (st) {
      current.vs = st;
      vNote = st.state === 'locked' ? '' : t('vSent');
    }, function (e) {
      vNote = e.code === 'wait' || e.code === 'limit' ? t('vWait') : e.code === 'bad_email' || e.code === 'same_email' ? t('vBadMail') : t('vError');
    }).then(updateVerify);
  }

  function vConfirm() {
    if (!canConfirm()) return;
    Array.prototype.forEach.call(app.querySelectorAll('[data-act="vconfirm"]'), function (b) { b.disabled = true; b.innerHTML = '<span class="cm-spin"></span>' + t('vSending'); });
    vNote = '';
    var done = false;
    api('/confirm', { t: confirmToken, hash: current.hash, link: current.url }).then(function (st) {
      current.vs = st;
      done = true;
      // the secret has done its job here: take it out of the address bar
      try {
        var q = new URLSearchParams(location.search);
        q.delete('v');
        history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
      } catch (e) {}
    }, function (e) {
      if (e.code === 'other_contract' || e.code === 'bad_token') confirmInfo = { error: e.code };
      else vNote = t('vError');
    }).then(function () {
      updateVerify();
      // Confirmed: say so clearly, and that nothing changes now unless both agree to an amendment
      if (done) confirmedDialog(current.vs && current.vs.state === 'locked');
    });
  }

  function icon(name) {
    var p = {
      send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
      down: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
      link: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>',
      edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
      ok: '<path d="M20 6 9 17l-5-5"/>',
      cal: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
      warn: '<path d="M10.3 3.9 1.8 18.5a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17.5h.01"/>',
      ask: '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12z"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.4M12 16.6h.01"/>',
      lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'
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
  // Resolves true only when the text really reached the clipboard
  function copyText(text) {
    function byHand() {
      var ta = document.createElement('textarea'), ok = false;
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, byHand);
    return Promise.resolve(byHand());
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
      holder.innerHTML = '<div class="cm-paper">' + paperHTML(S, current.code, current.url, current.qr, true) + '</div>';
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
          // the code and the page count are isolated, so an Arabic line can't pull their digits apart
          num.innerHTML = esc(t('code')) + ' <bdi dir="ltr">' + esc(current.code) + '</bdi> &nbsp;·&nbsp; <bdi dir="ltr">' + (i + 1) + ' / ' + pages.length + '</bdi>';
          page.appendChild(num);
          holder.appendChild(page);
          return window.html2canvas(page, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false }).then(function (canvas) {
            if (i > 0) pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
            // In the file, the square code is also a button that opens the contract online
            var qr = page.querySelector('.cm-p-qr');
            if (qr && current.url) {
              var pr = page.getBoundingClientRect(), r = qr.getBoundingClientRect(), k = 210 / pr.width;
              pdf.link((r.left - pr.left) * k, (r.top - pr.top) * k, r.width * k, r.height * k, { url: current.url });
            }
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

  function busy(btn, on, text) {
    if (!btn) return;
    if (on) { btn._html = btn.innerHTML; btn.innerHTML = '<span class="cm-spin"></span>' + (text || t('making')); btn.disabled = true; }
    else { btn.innerHTML = btn._html || btn.innerHTML; btn.disabled = false; }
  }

  // The file is made once per contract and language, then reused (download, send again…)
  var fileCache = null, fileJob = null;
  function fileKey() { return current.code + '|' + document.documentElement.lang + '|' + lockedAt(); }   // the stamp changes the file
  function cachedFile() { return fileCache && fileCache.key === fileKey() ? fileCache.file : null; }
  function getFile() {
    var key = fileKey();
    if (cachedFile()) return Promise.resolve(fileCache.file);
    if (fileJob && fileJob.key === key) return fileJob.p;
    var p = makePdf().then(function (pdf) {
      var file = new File([pdf.output('blob')], fileName(), { type: 'application/pdf' });
      fileCache = { key: key, file: file };
      return file;
    });
    function done() { if (fileJob && fileJob.p === p) fileJob = null; }
    p.then(done, done);
    fileJob = { key: key, p: p };
    return p;
  }
  function saveFile(file) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 60000);
  }

  function doPdf(btn) {
    if (cachedFile()) { saveFile(cachedFile()); return; }
    busy(btn, true);
    return getFile().then(saveFile)
      .catch(function (e) { console.error(e); toast(t('fileFail')); })
      .then(function () { busy(btn, false); });
  }

  // What goes with the file: two short lines, no long link
  function fileMessage() {
    return L('مرحبًا، هذا عقد المونتاج بيننا في الملف المرفق.\nإن كنت موافقًا عليه، فأرسل: «', 'Hi, here is our editing contract (attached file).\nIf you agree, reply with: “') +
      approvalText(S, current.code) + L('»', '”');
  }
  // Instagram messages can't carry a file, so there the contract goes as a link
  function linkMessage() {
    return L('هذا عقد المونتاج بيننا (النسخة ' + S.ver + '، الرمز ' + current.code + '). افتح الرابط لقراءته، وإن كنت موافقًا فأرسل الرسالة المذكورة في آخره:\n',
             'Here is our editing contract (version ' + S.ver + ', code ' + current.code + '). Open it from the link, and if you agree, reply with the message at its end:\n') + current.url;
  }

  // Phone number of the other side, if the chat app is WhatsApp and it looks like a number
  function phoneOf(who) {
    var raw = who === 'f' ? S.fx : S.cx;
    var d = digits(raw).replace(/[^\d]/g, '');
    return S.ch === 'wa' && d.length >= 8 ? d : '';
  }
  // A ready chat for WhatsApp and email; other apps get the text copied instead
  function chatUrl(text, who) {
    if (S.ch === 'wa') return 'https://wa.me/' + phoneOf(who) + '?text=' + encodeURIComponent(text);
    if (S.ch === 'em') {
      var mail = who === 'f' ? S.fx : S.cx;
      return 'mailto:' + (/@/.test(mail) ? encodeURIComponent(mail.trim()) : '') + '?subject=' + encodeURIComponent(L('عقد المونتاج', 'Editing contract')) + '&body=' + encodeURIComponent(text);
    }
    return '';
  }
  function openChat(text, who) {
    var url = chatUrl(text, who);
    if (!url) { copyText(text).then(function () { toast(t('msgCopied', { ch: chName(S) })); }); return; }
    if (S.ch === 'em') { location.href = url; return; }
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} }
  }

  function isPhone() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
  }

  // The note under the buttons: what just happened and what's left to do
  function sendNote(html) {
    var el = document.getElementById('cmSendNote');
    if (!el) return;
    el.innerHTML = icon('ok') + '<span>' + html + '</span>';
    el.hidden = false;
  }
  function readyBtn(btn, on) {
    if (!btn) return;
    btn.innerHTML = icon('send') + (on ? t('tapSend') : t('send'));
    btn.classList.toggle('cm-pulse', on);
  }

  // «أرسل العقد»: the PDF itself reaches the other side. Where the browser can share files
  // (phones, and Chrome / Edge / Safari on computers) the system share list opens with the
  // file and two short lines, so WhatsApp gets the file directly. Elsewhere the file
  // downloads and the chat opens with the lines ready, to attach it by hand.
  function doSend(btn) {
    var other = S.ro === 'c' ? 'f' : 'c';
    // With e-mail confirmation on, sending the contract also sends the confirmation e-mails (once),
    // but not while a question waits for its answer (confirming comes after the answers)
    if (verifying() && !qaOpen() && (!current.vs || current.vs.state === 'none')) vSend(null);
    sendFile(btn, other);
  }
  // «أرسل رابطًا» (with the service): three short lines with a one-line link to the contract
  function doSendLink(btn) {
    var other = S.ro === 'c' ? 'f' : 'c';
    if (verifying() && !qaOpen() && (!current.vs || current.vs.state === 'none')) vSend(null);
    var ready = current.short && current.shortFor === current.code ? current.short : '';
    if (ready) { sendLink(ready, other); return; }
    busy(btn, true, t('linkMaking'));
    shortLink().then(function (link) {
      busy(btn, false);
      if (link) sendLink(link, other); else toast(t('linkFail'));
    });
  }
  // «نسخ الرابط»: only the one-line link goes to the clipboard, never the long one
  function doCopy() {
    var ready = current.short && current.shortFor === current.code ? current.short : '';
    if (ready || !API) { copyNow(ready || current.url); return; }   // no service = local copies only
    shortLink().then(function (l) { return l || shortLink(); }).then(function (l) {
      if (l) copyNow(l); else toast(t('linkFail'));
    });
  }
  function copyNow(text) {
    copyText(text).then(function (ok) { toast(t(ok ? 'copied' : 'copyFail')); });
  }
  function sendLink(link, other) {
    var qk = qaKindHere();
    var msg = qk === 'ask' ? t('qaMsgAsk', { link: link }) : qk === 'answer' ? t('qaMsgAns', { link: link })
      : t(verifying() ? 'shortMsgMail' : 'shortMsg', { link: link, ok: approvalText(S, current.code) });
    if (isPhone() && navigator.share) {
      navigator.share({ text: msg }).catch(function (e) { if (e && e.name === 'NotAllowedError') openChat(msg, other); });
      return;
    }
    var url = chatUrl(msg, other);
    openChat(msg, other);
    if (url && S.ch !== 'em') sendNote(t('chatOpened') + ' <a class="cm-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + t('openChat', { ch: esc(chName(S)) }) + '</a>');
  }
  // This page just asked or answered something (the message then says so, and goes as a link:
  // the other side answers on the page, not in a file)
  function qaKindHere() { return mode === 'result' ? (qaJust || lastQaKind()) : ''; }
  function sendFile(btn, other) {
    if (S.ch === 'ig' || qaKindHere()) {   // Instagram can't carry a file; a question / answer needs the page: a link goes
      (API ? shortLink() : Promise.resolve('')).then(function (l) { if (l) sendLink(l, other); else openChat(linkMessage(), other); });
      return;
    }
    var msg = verifying() ? t('vMsgMail') : fileMessage();
    var share = !!(navigator.canShare && navigator.share && window.File);
    if (share && cachedFile()) { shareFile(cachedFile(), msg, other, btn); return; }
    busy(btn, true);
    getFile().then(function (file) {
      busy(btn, false);
      if (share) shareFile(file, msg, other, btn);
      else { saveFile(file); afterSave(msg, other); }
    }).catch(function (e) { console.error(e); busy(btn, false); toast(t('fileFail')); });
  }
  function shareFile(file, msg, other, btn) {
    if (!navigator.canShare({ files: [file] })) { saveFile(file); afterSave(msg, other); return; }
    navigator.share({ files: [file], text: msg }).then(function () { readyBtn(btn, false); }, function (e) {
      // Closed the list: on a computer WhatsApp may simply not be in it, so offer the by-hand way
      if (e && e.name === 'AbortError') { if (!isPhone()) manualNote(msg, other); return; }
      // Making the file took longer than one tap allows: the next tap sends it at once
      if (e && e.name === 'NotAllowedError') { readyBtn(btn, true); return; }
      saveFile(file); afterSave(msg, other);
    });
  }
  function manualNote(msg, other) {
    var ch = esc(chName(S)), url = chatUrl(msg, other);
    sendNote(t('shareMissing') + ' <button type="button" class="cm-link" data-act="pdf">' + t('download') + '</button>' +
      (url && S.ch !== 'em' ? ' · <a class="cm-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + t('openChat', { ch: ch }) + '</a>' : ''));
  }
  function afterSave(msg, other) {
    var ch = esc(chName(S)), url = chatUrl(msg, other);
    if (!url) { copyText(msg).then(function () { sendNote(t('attachCopy', { ch: ch })); }); return; }
    openChat(msg, other);
    if (S.ch === 'em') { sendNote(t('attachMail')); return; }
    sendNote(t('attachHint', { ch: ch }) + ' <a class="cm-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + t('openChat', { ch: ch }) + '</a>');
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
    } else if (el.hasAttribute('data-amwhy')) {
      if (amend) { amend.w = el.value; saveDraft(); }
      return;
    } else if (el.hasAttribute('data-date')) {
      // Typed date: Western digits only, the slashes come by themselves, a full real date is kept
      var raw = dateDigits(el);
      var shown = raw.length > 4 ? raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4) : raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
      if (el.value !== shown) el.value = shown;
      var iso = isoFromDMY(raw);
      if (!raw || iso) el.removeAttribute('aria-invalid');
      setDate(el, iso);
      saveDraft();
    } else if (el.classList.contains('cm-date-native')) {
      // Picked from the calendar: shown in the box with Western digits
      var box = el.parentNode.querySelector('.cm-date-text');
      box.value = el.value ? fmtDate(el.value) : '';
      box.removeAttribute('aria-invalid');
      setDate(box, el.value);
      saveDraft();
    }
    refreshAmendBox();   // an amendment's last step lists the changes as they are typed
  });
  // A date left half-written or impossible (like 31/02) is marked, and «التالي» says how to write it
  app.addEventListener('focusout', function (e) {
    var el = e.target;
    if (!el.hasAttribute || !el.hasAttribute('data-date')) return;
    var raw = dateDigits(el);
    if (raw && !isoFromDMY(raw)) el.setAttribute('aria-invalid', 'true');
  });
  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-toggle')) {
      var tk = el.getAttribute('data-toggle');
      S[tk] = el.checked ? 1 : 0;
      saveDraft();
      if (tk === 'vm') keepScroll(render);   // shows / hides the two e-mail fields
      else refreshAmendBox();
    } else if (el.hasAttribute('data-readok')) {
      // «قرأت العقد كاملًا»: one tick counts for every approval button on the page
      readOk = el.checked;
      Array.prototype.forEach.call(app.querySelectorAll('[data-readok]'), function (c) { c.checked = readOk; });
      Array.prototype.forEach.call(app.querySelectorAll('.cm-readfirst'), function (g) {
        g.classList.remove('cm-need');
        g.classList.toggle('cm-read-ok', readOk);
        var m = g.querySelector('.cm-readneed');
        if (m) m.hidden = true;
      });
    }
  });
  // «أعمال أخرى»: Enter adds what was typed as one more choice, and the box is ready for the next one
  app.addEventListener('keydown', function (e) {
    var el = e.target;
    if (e.key !== 'Enter' || e.isComposing || !el.hasAttribute) return;
    if (el.hasAttribute('data-ioadd')) {
      e.preventDefault();
      if (addIo(el.value)) { keepScroll(render); focusIoBox(); }
    } else if (el.hasAttribute('data-curadd')) {   // his own currency, the same way
      e.preventDefault();
      if (addCur(el.value)) keepScroll(render);
    }
  });
  function focusIoBox() {
    var b = app.querySelector('[data-ioadd]');
    if (b) try { b.focus({ preventScroll: true }); } catch (err) { b.focus(); }
  }
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
      S[key] = key === 'dp' || key === 'fk' ? parseInt(v, 10) : v;
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-multi')) {
      var mk = el.getAttribute('data-multi');
      v = el.getAttribute('data-val');
      var i = S[mk].indexOf(v);
      if (i === -1) S[mk].push(v); else S[mk].splice(i, 1);
      var order = OPT[mk === 'in' ? 'in' : 'pm'].map(function (o) { return o[0]; });
      S[mk].sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-cur')) {
      v = el.getAttribute('data-cur');
      if (v === S.cu) { if (S.ca.length) S.cu = S.ca.shift(); }   // the last currency can't be removed
      else if (S.ca.indexOf(v) !== -1) S.ca.splice(S.ca.indexOf(v), 1);
      else S.ca.push(v);
      if (S.cu !== 'ot' && S.ca.indexOf('ot') === -1) S.cuo = '';   // his own currency taken away: its name goes too
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-qa-ask')) {
      var ali = el.closest('.cm-li');
      if (ali) { if (ali.classList.contains('cm-li-on')) closeAsk(); else openAsk(ali); }
    } else if (el.hasAttribute('data-qa-ans')) {
      var qli = el.closest('.cm-li');
      if (qli) openAsk(qli, +el.getAttribute('data-qa-ans'));
    } else if (el.hasAttribute('data-ask-send')) {
      sendAsk(el);
    } else if (el.hasAttribute('data-ask-close')) {
      closeAsk();
    } else if (el.hasAttribute('data-curadd-btn')) {
      var cb = app.querySelector('[data-curadd]');
      if (cb && addCur(cb.value)) keepScroll(render); else if (cb) cb.focus();
    } else if (el.hasAttribute('data-step-key')) {
      var sk = el.getAttribute('data-step-key');
      var lo = sk === 'rh' || sk === 'th' ? HOUR_STEP : NUMS[sk][0];   // in hours, never below 12 (0 means days)
      S[sk] = Math.min(NUMS[sk][1], Math.max(lo, S[sk] + parseInt(el.getAttribute('data-delta'), 10)));
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-hunit')) {
      var hk = el.getAttribute('data-hunit');
      // to hours: as many hours as the days were (2 work days → 48); to days: back to the days kept
      if (el.getAttribute('data-val') === '1') { if (!S[hk]) S[hk] = Math.min(NUMS[hk][1], Math.max(HOUR_STEP, (hk === 'rh' ? S.rv : S.tn) * 24)); }
      else S[hk] = 0;
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-vadd')) {
      S.vd.push({ d: '', l: '', p: S.vd.length ? S.vd[S.vd.length - 1].p : '', t: '' });
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-vrm')) {
      S.vd.splice(+el.getAttribute('data-vrm'), 1);
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-datepick')) {
      var nat = el.parentNode.querySelector('.cm-date-native');
      try { nat.showPicker(); } catch (err) { nat.focus(); try { nat.click(); } catch (err2) {} }
    } else if (el.hasAttribute('data-ioadd-btn')) {
      var ib = app.querySelector('[data-ioadd]');
      if (ib && addIo(ib.value)) { keepScroll(render); focusIoBox(); } else if (ib) ib.focus();
    } else if (el.hasAttribute('data-iorm')) {
      var own = ioItems(S.io);
      own.splice(+el.getAttribute('data-iorm'), 1);
      S.io = own.join('\n');
      saveDraft(); keepScroll(render);
    } else if (el.hasAttribute('data-go')) {
      e.preventDefault();
      go(el.getAttribute('data-go'));
    } else if (el.hasAttribute('data-act')) {
      var act = el.getAttribute('data-act');
      if (qaBlocks(act)) { showOpenQuestion(); return; }   // a question waits for its answer
      if (needsRead(act)) { nudgeRead(el); return; }   // «قرأت العقد كاملًا» first
      if (act === 'pdf') doPdf(el);
      else if (act === 'send') doSend(el);
      else if (act === 'sendlink') doSendLink(el);
      else if (act === 'copy') doCopy();
      else if (act === 'approve') { doApprove(); if (mode === 'received') sentDialog(); }
      else if (act === 'dark') { dark = !paperDark(); keepScroll(render); }
      else if (act === 'vsend') vSend(el);
      else if (act === 'vconfirm') vConfirm();
    }
  });

  // A tap on a line of the contract opens the box to ask about it (not on links, buttons or the boxes)
  app.addEventListener('click', function (e) {
    if (!askable() || !e.target.closest) return;
    var li = e.target.closest('#cmPaper .cm-li[data-k]');
    if (!li || e.target.closest('a, button, input, textarea, .cm-qa, .cm-ask')) return;
    if (window.getSelection && String(window.getSelection())) return;   // selecting text to copy, not asking
    if (li.classList.contains('cm-li-on')) { closeAsk(); return; }
    openAsk(li);
  });

  // On a computer, start making the file as soon as the mouse reaches the send / download buttons
  // (and the short link when the mouse reaches «أرسل رابطًا» / «نسخ الرابط»)
  app.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse' || (mode !== 'result' && mode !== 'received') || !current.code || !e.target.closest) return;
    if (!cachedFile() && e.target.closest('[data-act="send"], [data-act="pdf"]')) getFile().catch(function () {});
    if (API && e.target.closest('[data-act="sendlink"], [data-act="copy"]')) shortLink();
  });

  function keepScroll(fn) {
    var y = window.pageYOffset;
    fn();
    window.scrollTo(0, y);
  }

  function go(where) {
    if (mode === 'wizard' && (where === 'next' || where === 'back' || where === 'show')) { flushIo(); flushCur(); }
    if (where !== 'next' && where !== 'back') qaJust = '';   // only right after asking / answering
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
      if (amend) {
        // The amendment keeps what the changed version said, so before / after can always be shown
        if (!changes(amend.base, S).length) { showError(t('amNone')); return; }
        S.am = amend.base.am.concat([{ c: amend.code, w: amend.w.trim(), p: patchOf(amend.base, S) }]);
        S = normalize(S);
      }
      build().then(function () {
        if ((current.url.split('#c=')[1] || '').length > 11500) { showError(t('tooLong')); return; }   // what the service's links can carry
        mode = 'result'; saveDraft(); render(); scrollToCard();
        history.replaceState(history.state, '', location.href.split('#')[0]);
      }).catch(function (e) { console.error(e); showError(t('fileFail')); });
    } else if (where === 'edit') {
      mode = 'wizard'; step = 1; render(); scrollToCard();
    } else if (where === 'amend' || where === 'editnew') {
      // A change to a contract that was sent: an amendment on the same contract, never a new one
      if (S.am.length >= MAX_AM) { toast(t('amMax')); return; }
      var role = confirmInfo && !confirmInfo.error ? confirmInfo.role : '';   // opened from your confirmation e-mail
      var back = current.short && current.shortFor === current.code ? current.short.slice(current.short.indexOf('#')) : location.hash;
      amend = { base: clone(S), code: current.code, w: '', back: mode === 'received' ? 'received' : 'result',
                link: /^#(s=[A-Za-z0-9]{8}\.[A-Za-z0-9_-]{22}|c=[A-Za-z0-9_-]+)$/.test(back || '') ? back : '' };
      S = clone(S);
      if (role) S.ro = role;
      S.ver = Math.min(999, S.ver + 1); S.dt = today(); fromLink = false;
      confirmToken = ''; confirmInfo = null;   // a confirmation link belongs to the old version
      mode = 'wizard'; step = 1; saveDraft(); render(); scrollToCard();
      try {
        var q = new URLSearchParams(location.search);
        q.delete('v');
        history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : ''));
      } catch (e) {}
    } else if (where === 'amendcancel') {
      // Back to the contract as it was, nothing changed
      if (!amend) return;
      var a = amend;
      amend = null;
      S = normalize(a.base); fromLink = a.back === 'received';
      build().then(function () {
        mode = a.back;
        if (mode === 'received') clearDraft(); else saveDraft();
        render(); scrollToCard();
        if (a.link) try { history.replaceState(history.state, '', location.pathname + location.search + a.link); } catch (e) {}
      }).catch(function (e) { console.error(e); S = clone(DEF); mode = 'bad'; render(); });
    } else if (where === 'restart') {
      clearDraft(); S = fresh(); step = 1; mode = 'wizard'; fromLink = false; amend = null;
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
    // a link from a confirmation e-mail carries its secret as ?v=…
    try {
      var tv = new URLSearchParams(location.search).get('v') || '';
      confirmToken = /^[A-Za-z0-9_-]{43}$/.test(tv) ? tv : '';
    } catch (e) { confirmToken = ''; }
    confirmInfo = null;
    // a short link (#s=<id>.<key>) or a full one (#c=<contract>)
    var sm = location.hash.match(/[#&]s=([A-Za-z0-9]{8})\.([A-Za-z0-9_-]{22})/);
    var m = location.hash.match(/[#&]c=([A-Za-z0-9_-]+)/);
    if (sm || m) {
      app.innerHTML = '<div class="cm-card"><span class="cm-spin dark"></span></div>';
      (sm ? (API ? openShort(sm[1], sm[2]) : Promise.reject(new Error('no service'))) : Promise.resolve(m[1])).then(function (payload) {
        if (!/^[A-Za-z0-9_-]+$/.test(payload)) throw new Error('bad payload');
        return decodeState(payload);
      }).then(function (s) {
        S = s; fromLink = true; mode = 'received'; amend = null; qaJust = '';
        return build();
      }).then(function () {
        if (sm) { current.short = shareBase() + '#s=' + sm[1] + '.' + sm[2]; current.shortFor = current.code; }
        render();
        if (confirmToken) scrollToCard();   // from a confirmation e-mail: the e-mail box is the first thing in view
        // An older long link (#c=…): the address bar switches to the one-line link, so a link
        // copied from the bar or the browser's share menu is short too
        if (!sm) {
          var c0 = current.code;
          shortLink().then(function (l) {
            if (!l || mode !== 'received' || current.code !== c0 || !/[#&]c=/.test(location.hash)) return;
            try { history.replaceState(history.state, '', location.pathname + location.search + l.slice(l.indexOf('#'))); } catch (e) {}
          });
        }
      }).catch(function (e) { console.error(e); S = clone(DEF); mode = 'bad'; render(); });
      return;
    }
    var d = loadDraft();
    if (d) {
      S = normalize(d.s); step = Math.min(STEPS, Math.max(1, d.step || 1));
      amend = amendFrom(d.am);   // an amendment in progress picks up where it stopped
      if (!amend) S.tv = 2;      // a draft isn't agreed yet: today's wording (an amendment keeps its contract's)
      render(t('resumed'));
    } else {
      S = fresh(); amend = null;
      render();
    }
  }
  start();
  // A contract link opened while the page is already open (same address, new #c=…)
  window.addEventListener('hashchange', function () {
    if (/[#&][cs]=/.test(location.hash)) { start(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
})();
