/* ========================================
   Sales page for business owners (modayver.com/business), and the same page
   for real estate (modayver.com/real-estate).
   Runs before i18n.js: it adds this page's English text, so the shared
   translations file stays untouched and the page can be removed by deleting
   its own files (business.html, real-estate.html, business-page.html,
   business.css, business.js).
   ======================================== */
(function () {
  var WA = 'https://wa.me/213775051301?text=';

  // real-estate.html is built from the same page and marks itself on <html> (see build_shells.py).
  // Only the lines in the real-estate block below differ; change anything else once and both follow.
  var REAL_ESTATE = document.documentElement.getAttribute('data-sector') === 'real-estate';
  var PAGE_NAME = REAL_ESTATE ? 'صفحة العقار' : 'صفحة أصحاب الأعمال';

  // What the visitor's WhatsApp message starts with
  var MSG_AR = {
    sample: 'هلا خالد، شفت صفحتك وأبي أجرّب أول فيديوهين.',
    talk: 'هلا خالد، شفت صفحتك وأبي أكلمك عن مشروعي.',
    p1: 'هلا خالد، أبي أسأل عن باقة البداية (4 فيديوهات في الشهر).',
    p2: 'هلا خالد، أبي أسأل عن الباقة المتوسطة (8 فيديوهات في الشهر).',
    p3: 'هلا خالد، أبي أسأل عن الباقة الكاملة (12 فيديو في الشهر).'
  };
  var MSG_EN = {
    sample: 'Hi Khalid, I saw your page and I would like to try the first two videos.',
    talk: 'Hi Khalid, I saw your page and I would like to tell you about my project.',
    p1: 'Hi Khalid, I would like to ask about the Starter package (4 videos a month).',
    p2: 'Hi Khalid, I would like to ask about the Medium package (8 videos a month).',
    p3: 'Hi Khalid, I would like to ask about the Full package (12 videos a month).'
  };

  if (REAL_ESTATE) {
    MSG_AR.talk = 'هلا خالد، شفت صفحتك وأبي أكلمك عن شغلي في العقار.';
    MSG_EN.talk = 'Hi Khalid, I saw your page and I would like to tell you about my real estate business.';
  }

  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.setAttribute('href', WA + encodeURIComponent(MSG_AR[a.getAttribute('data-wa')]));
  });

  var en = window.TRANSLATIONS_EN = window.TRANSLATIONS_EN || {};
  Object.keys(MSG_EN).forEach(function (k) {
    en['biz.wa_' + k] = WA + encodeURIComponent(MSG_EN[k]);
  });

  Object.assign(en, {
    'biz.badge': 'For business owners, especially in the UAE and the Gulf',
    'biz.title': 'How many clients went to someone else this month?',
    'biz.desc': 'I help you get more messages from serious clients, <br class="biz-m">and all you have to do is film.',
    'biz.btn_sample': 'Try the first two videos',
    'biz.alt_btn': 'Leave your number and I will message you',
    'biz.btn_work': 'See my work',
    'biz.proof1': 'million views on my videos',
    'biz.proof2': 'videos delivered to channels',
    'biz.proof3': 'years working in video',

    'biz.pain_title': 'Why do sales slip away from you?',
    'biz.pain_sub': 'Your client looks you up before buying. If they find nothing new, they go to the one they see every day.',
    'biz.pain1_t': 'Clips waiting on your phone',
    'biz.pain1_d': 'You get excited and film, then the clips pile up because editing needs time you do not have. Every clip that never goes out is a sale you missed.',
    'biz.pain2_t': 'One week on, one month gone',
    'biz.pain2_d': 'Every time you stop posting, you start again from zero.',
    'biz.pain3_t': 'A good message nobody finishes',
    'biz.pain3_d': 'You have something worth saying, but viewers leave before they reach it.',
    'biz.pain4_t': 'An editor who became a new problem',
    'biz.pain4_d': 'Late delivery, daily follow-ups and endless changes. You wanted less work and got more.',

    'biz.sell': '<strong>Your customer buys from the one their eyes are used to seeing daily, and every appearance builds their trust in you even more.</strong><br>One video a month will not reach them.',
    'biz.ben_title': 'What do you and your customer gain?',
    'biz.ben1_t': 'You, the business owner',
    'biz.ben1_a': 'Your customers see you on social media every day, so when they are ready to buy, your name comes to mind first. In the market, whoever shows up more sells more.',
    'biz.ben1_b': 'The more you show up, the more serious people see you, and the messages come from people who want to buy, not just views.',
    'biz.ben1_c': 'No pressure from editing and endless tasks. Your mind is clear and your focus is on your customer, and that is what grows your sales.',
    'biz.ben2_t': 'Your customer, the buyer',
    'biz.ben2_a': 'Your message reaches them clear and well ordered, so they see what you sell as it really is before buying, whether it is a property, a product or a service.',
    'biz.ben2_b': 'Every second of the video is counted, so they understand what sets you apart in under a minute.',
    'biz.ben2_c': 'Every word is chosen so they feel you know your business, and they trust you before sending a message.',
    'biz.change_title': 'Your month once we start',
    'biz.change_sub': 'The same filming, in an order that keeps you present all month.',
    'biz.cal1': 'Without organization',
    'biz.cal1_f': '3 videos a month',
    'biz.cal1_r': 'Your client sees you less and forgets you',
    'biz.cal2': 'With organization',
    'biz.cal2_f': '8 videos a month',
    'biz.cal2_r': 'Your client sees you more and remembers you',
    'biz.week1': 'Week 1',
    'biz.week2': 'Week 2',
    'biz.week3': 'Week 3',
    'biz.week4': 'Week 4',
    'biz.week_none': 'None',
    'biz.cal_note': 'An illustration. We set the number of videos together.',

    'biz.steps_title': 'How we work together',
    'biz.steps_sub': 'Four clear steps, and you always know where we are.',
    'biz.step1_t': 'We define the result you want',
    'biz.step1_d': 'Before we start, I learn how many messages you want and from which clients, and together we choose the type of video that gets you there.',
    'biz.step2_t': 'You film and send it to me',
    'biz.step2_d': 'All the clips in one link, and beforehand I tell you how to film so you do not have to film again.',
    'biz.step3_t': 'I turn your footage into videos that make clients message you',
    'biz.step3_d': 'I pick the strongest opening and arrange your words. You get the first version within 72 hours and approve it before it goes out.',
    'biz.step4_t': 'We review the result and improve',
    'biz.step4_d': 'Every month we look at how many serious messages reached you and adjust the next videos accordingly.',

    'biz.proof_title': 'I have worked with channels followed by millions',
    'biz.proof_sub': 'The same experience, put into your videos so they reach your customers and sell.',
    'biz.ch1': '900K subscribers',
    'biz.ch2': '1.81M subscribers',
    'biz.ch3': '1.55M subscribers',
    'biz.work_title': 'Ads and videos for companies and projects',
    'biz.v1': 'Ad for Yango Play',
    'biz.v2': 'Trading course',
    'biz.v3': 'Ad for the game Tahaddi Al-Mulook',
    'biz.v4': 'Ad for a PC builds store',
    'biz.v5': 'Introduction video',

    'biz.pack_title': 'How many times a month do you want your client to see you?',
    'biz.pack_sub': 'Each package lasts one month.',
    'biz.pack_unit': 'short videos a month',
    'biz.pack_unit12': 'short videos a month',
    'biz.pack_btn': 'Ask about this package',
    'biz.p1_name': 'Starter',
    'biz.p1_d': 'One video a week. A light start to test the results.',
    'biz.p2_tag': 'My recommendation',
    'biz.p2_name': 'Medium',
    'biz.p2_d': 'Two videos a week. The balance between presence and budget.',
    'biz.p3_name': 'Full',
    'biz.p3_d': 'Three videos a week. For when you want to grow your business and stay ahead of your competitors.',

    'biz.try_tag': 'No commitment',
    'biz.try_title': 'Try before you decide',
    'biz.try_desc': 'The first two videos are a trial. If you like the work, we continue and agree on a price that includes them.',
    'biz.try_btn': 'Start the trial',
    'biz.try1': 'If you do not like the work, you pay nothing',
    'biz.try2': 'No talk of price or contracts before the two videos',
    'biz.try3': 'A set delivery date for every video',

    'biz.faq_title': 'Questions before we start',
    'biz.q1': 'Do I need a professional camera?',
    'biz.a1': 'No. A recent phone and good light are enough.',
    'biz.q2': 'Do you do the filming?',
    'biz.a2': 'No, the filming is on your side. I arrange the idea and message of every clip and shape them in an organized way that serves your sales.',
    'biz.q3': 'How do I send the clips?',
    'biz.a3': 'With a link, such as Google Drive. You do not need any special software.',
    'biz.q4': 'How many changes can I ask for?',
    'biz.a4': 'We set the number of revisions together before we start, so there are no surprises for either side.',
    'biz.q7': 'What does the work include?',
    'biz.a7': 'From the idea of the video until it reaches you ready to publish, and we focus on what brought results.',
    'biz.q5': 'How much does it cost?',
    'biz.a5': 'We agree on it after the first two videos, if you like the work. Until then you pay nothing.',
    'biz.q6': 'How do I pay?',
    'biz.a6': 'With a monthly invoice through PayPal, or another way we agree on.',

    'biz.lead_name': 'Your name',
    'biz.lead_name_ph': 'Type your name',
    'biz.lead_phone': 'WhatsApp number',
    'biz.lead_country': 'Country',
    'biz.lead_btn': 'Send my number',
    'biz.lead_note': 'Only I see your number, and I never share it.',
    'biz.lead_done_t': 'I have your number',
    'biz.lead_done_d': 'I will message you on WhatsApp soon.',
    'biz.alt': 'Or leave your number and I will message you',
    'biz.cta_title': 'The first step is one message',
    'biz.cta_sub': 'Leave your number here and I will message you on WhatsApp, or message me directly.',
    'biz.cta_btn': 'Talk to me on WhatsApp',
    'biz.cta_other': 'Other ways to reach me'
  });

  // The real-estate page: these lines replace the general ones. This runs before i18n.js
  // stores the Arabic, so switching language and back keeps them.
  if (REAL_ESTATE) {
    var RE_AR = {
      'biz.badge': 'لأصحاب العقار، وبالأخص في الإمارات والخليج',
      'biz.ben1_t': 'انت، اللي تبيع العقار',
      'biz.ben1_a': 'عميلك يشوفك كل يوم على السوشيال ميديا، فيوم يقرر يشتري عقار يجي اسمك في باله قبل غيرك. وفي سوق العقار، اللي يظهر أكثر يبيع أكثر.',
      'biz.ben1_b': 'كل ما زاد ظهورك، شافك ناس جادين أكثر. وتوصلك رسايل من ناس تبي تشتري عقار، مو بس مشاهدات.',
      'biz.ben1_c': 'ما تكون مضغوط بالمونتاج وكثرة المهام. بالك مرتاح وتركيزك كله على عميلك، وهذا اللي يقفل الصفقات.',
      'biz.ben2_a': 'رسالتك توصله مرتبة وواضحة، فيشوف العقار زي ما هو قبل لا يزوره.',
      'biz.ben2_b': 'كل ثانية في الفيديو محسوبة، فيفهم المكان والمميزات في أقل من دقيقة.',
      'biz.ben2_c': 'كل كلمة مختارة عشان يحس إنك فاهم السوق، فيثق فيك قبل لا يراسلك.',
      'biz.pain_title': 'ليش تضيع عليك الصفقات؟',
      'biz.pain_sub': 'عميلك يدوّر عليك قبل لا يحجز معاينة. إذا ما لقى لك شي جديد، يروح للي يشوفه كل يوم.',
      'biz.pain1_d': 'تتحمس وتصوّر العقار، بس المونتاج ياخذ وقت وانت مشغول بالمعاينات، فتظل المقاطع مكانها. وكل مقطع ما نزل، فرصة بيع راحت عليك.',
      'biz.pain3_d': 'كلامك زين، بس المشاهد يطلع من الفيديو قبل لا يوصل لأقوى ميزة في العقار.',
      'biz.step1_d': 'قبل لا نبدأ، أفهم أي عقار تبي تبيعه أول، وكم رسالة تبي توصلك ومن أي مشترين، ونختار مع بعض نوع الفيديو اللي يوصلك لها.',
      'biz.step2_d': 'كل المقاطع برابط واحد، وأقول لك قبلها كيف تصوّر العقار عشان ما تعيد التصوير.',
      'biz.step3_d': 'أبدأ بأقوى لقطة في العقار، وأرتب كلامك. توصلك أول نسخة خلال 72 ساعة، وتوافق عليها قبل النشر.',
      'biz.proof_sub': 'نفس الخبرة اللي اشتغلت فيها معهم، أحطها في فيديوهات عقاراتك عشان توصل لعميلك وتبيع.'
    };
    Object.keys(RE_AR).forEach(function (k) {
      var el = document.querySelector('[data-i18n="' + k + '"]');
      if (el) el.innerHTML = RE_AR[k];
    });
    Object.assign(en, {
      'biz.badge': 'For real estate owners, especially in the UAE and the Gulf',
      'biz.ben1_t': 'You, the one selling the property',
      'biz.ben1_a': 'Your customer sees you every day on social media, so the day they decide to buy a property, your name comes to mind before anyone else. In real estate, whoever shows up more sells more.',
      'biz.ben1_b': 'The more you show up, the more serious people see you. You get messages from people who want to buy a property, not just views.',
      'biz.ben1_c': 'No pressure from editing and endless tasks. Your mind is clear and your focus is on your customer, and that is what closes deals.',
      'biz.ben2_a': 'Your message reaches them clear and well ordered, so they see the property as it really is before visiting.',
      'biz.ben2_b': 'Every second of the video is counted, so they understand the location and features in under a minute.',
      'biz.ben2_c': 'Every word is chosen so they feel you know the market, and they trust you before sending a message.',
      'biz.pain_title': 'Why do deals slip away from you?',
      'biz.pain_sub': 'Your customer looks you up before booking a viewing. If they find nothing new, they go to the one they see every day.',
      'biz.pain1_d': 'You get excited and film the property, but editing takes time and you are busy with viewings, so the clips stay where they are. Every clip that never goes out is a sale you lost.',
      'biz.pain3_d': 'What you say is good, but the viewer leaves before reaching the best feature of the property.',
      'biz.step1_d': 'Before we start, I learn which property you want to sell first, how many messages you want and from which buyers, and we choose together the type of video that gets you there.',
      'biz.step2_d': 'All the clips in one link, and beforehand I tell you how to film the property so you do not have to film again.',
      'biz.step3_d': 'I open with the strongest shot of the property and arrange what you say. Your first version reaches you within 72 hours, and you approve it before it goes out.',
      'biz.proof_sub': 'The same experience, put into your property videos so they reach your customers and sell.'
    });
    var buyerTitle = document.querySelector('[data-i18n="biz.ben2_t"]');
    var buyerIcon = buyerTitle && buyerTitle.parentNode.querySelector('.service-badge svg');
    if (buyerIcon) buyerIcon.innerHTML = '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.8V20h13V9.8"/><path d="M10 20v-5.5h4V20"/>';
  }

  Object.assign(en, {
    'biz.ba_title': 'See the difference for yourself',
    'biz.ba_sub': 'The same clip, before and after. Switch between them and hear the difference.',
    'biz.ba_before': 'Before',
    'biz.ba_after': 'After',
    'biz.ba_together': 'Together',
    'biz.ba_seek': 'Video position',
    'biz.ba_toggle': 'Play or pause',
    'biz.ba_mute': 'Mute',
    'biz.ba_vol': 'Volume',
    'biz.ba_full': 'Enlarge video'
  });

  // Before and after, as one merge: each set is ONE silent video holding the three versions side by side,
  // and three sound files. A button moves the picture and swaps the sound, so the time never changes and
  // nothing reloads. The three versions of a set must have the same cuts and length.
  (function () {
    var first = document.querySelector('.biz-ba');
    if (!first) return;
    var PANE = { before: 0, after: 1, together: 2 };
    var MODES = ['before', 'after', 'together'];

    var second = first.cloneNode(true);
    second.setAttribute('data-set', 'realty');
    // Each page leads with its own video
    if (REAL_ESTATE) first.parentNode.insertBefore(second, first); else first.parentNode.appendChild(second);

    var players = [];
    var ctx = null, master = null;
    var volume = 1, muted = false;
    // One volume for the whole page; squared, because hearing is not linear
    var applyVolume = function () {
      if (master) master.gain.setTargetAtTime(muted ? 0 : volume * volume, ctx.currentTime, 0.01);
      document.querySelectorAll('.biz-ba-vol').forEach(function (v) {
        v.value = Math.round(volume * 100);
        v.style.setProperty('--p', (muted ? 0 : volume * 100) + '%');
      });
      document.querySelectorAll('.biz-ba-mute').forEach(function (m) { m.classList.toggle('is-off', muted || volume === 0); });
    };
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // iPhones silence web sound when the ring switch is off, unless a normal audio element is playing
    var keepAwake = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYzLjEuMTAyAAAAAAAAAAAAAAD/83DAAAAAAAAAAAAASW5mbwAAAA8AAAAWAAAHcgAiIiIiLS0tLS04ODg4QkJCQkJNTU1NV1dXV1diYmJibGxsbGx3d3d3gYGBgYGMjIyMlpaWlpahoaGhoaurq6u2tra2tsDAwMDLy8vLy9XV1dXg4ODg4Orq6ur19fX19f////8AAAAATGF2YzYzLjEuAAAAAAAAAAAAAAAAJAQvAAAAAAAAB3I/0pgYAAAAAAAAAAAAAAAAAP/zMMQAAAADSAAAAABMQU1FVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMsRBAAADSAAAAABVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zDEgwAAA0gAAAAAVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zLEvQAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MwxL4AAANIAAAAAFVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MwxL4AAANIAAAAAFVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MyxL0AAANIAAAAAFVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMMS+AAADSAAAAABVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMMS+AAADSAAAAABVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMsS9AAADSAAAAABVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zDEvgAAA0gAAAAAVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zLEvQAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MwxL4AAANIAAAAAFVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MwxL4AAANIAAAAAFVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MyxL0AAANIAAAAAFVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMMS+AAADSAAAAABVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMMS+AAADSAAAAABVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMsS9AAADSAAAAABVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zDEvgAAA0gAAAAAVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zDEvgAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zLEvQAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MwxL4AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    keepAwake.loop = true;
    var audioContext = function () {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : volume * volume;
        master.connect(ctx.destination);
      }
      if (ctx.state !== 'running') ctx.resume();
      return ctx;
    };
    var clock = function (s) {
      s = Math.max(0, Math.floor(s || 0));
      return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    };

    [first, second].forEach(function (ba) {
      var set = ba.getAttribute('data-set');
      var base = './assets/compare/' + set;
      var frame = ba.querySelector('.biz-ba-frame');
      var video = ba.querySelector('.biz-ba-video');
      var seek = ba.querySelector('.biz-ba-seek');
      var time = ba.querySelector('.biz-ba-time');
      var tabs = ba.querySelectorAll('.biz-ba-tab');
      var flash = ba.querySelector('.biz-ba-flash');
      var pill = ba.querySelector('.biz-ba-pill');
      var placePill = function () {
        var on = ba.querySelector('.biz-ba-tab.is-on');
        if (!on || !on.offsetWidth) return;
        pill.style.width = on.offsetWidth + 'px';
        pill.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      };
      placePill();
      requestAnimationFrame(function () { requestAnimationFrame(function () { pill.classList.add('is-ready'); }); });
      window.addEventListener('resize', placePill);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
      new MutationObserver(placePill).observe(ba.querySelector('.biz-ba-tabs'), { childList: true, subtree: true, characterData: true });
      var mode = 'together';
      var buffers = null, gains = null, sources = [], loading = null, began = 0, scrubbing = false;

      video.poster = base + '.webp';

      // Full quality unless the connection or the device says otherwise; the light file is the fallback
      var stage = ba.querySelector('.biz-ba-stage');
      var hd = false, picked = null, stalls = 0;
      var canTakeHd = function () {
        var net = navigator.connection;
        if (net && (net.saveData || /(^|-)(2g|3g)$/.test(net.effectiveType || ''))) return Promise.resolve(false);
        if (!navigator.mediaCapabilities || !navigator.mediaCapabilities.decodingInfo) return Promise.resolve(true);
        return navigator.mediaCapabilities.decodingInfo({ type: 'file', video: { contentType: 'video/mp4; codecs="avc1.640033"', width: 3240, height: 1920, bitrate: 14000000, framerate: 30 } })
          .then(function (r) { return r.supported && r.smooth; })
          .catch(function () { return true; });
      };
      var pick = function () {
        if (picked) return picked;
        picked = canTakeHd().then(function (yes) {
          hd = !!yes;
          video.src = base + (hd ? '-hd' : '') + '.mp4';
        });
        return picked;
      };
      var toLight = function () {
        if (!hd) return;
        hd = false;
        var at = video.currentTime, running = !video.paused;
        video.src = base + '.mp4';
        video.addEventListener('loadedmetadata', function once() {
          video.removeEventListener('loadedmetadata', once);
          video.currentTime = at;
          if (running) video.play().catch(function () {});
        });
      };
      video.addEventListener('error', toLight);
      video.addEventListener('waiting', function () {
        if (hd && ba.classList.contains('is-started') && ++stalls >= 2) toLight();
      });

      var fetchSound = function (m) {
        return fetch(base + '-' + m + '.m4a')
          .then(function (r) { return r.arrayBuffer(); })
          .then(function (data) { return new Promise(function (ok, no) { ctx.decodeAudioData(data, ok, no); }); });
      };
      var load = function () {
        if (loading) return loading;
        loading = Promise.all(MODES.map(fetchSound)).then(function (list) {
          buffers = {}; gains = {};
          MODES.forEach(function (m, i) {
            buffers[m] = list[i];
            gains[m] = ctx.createGain();
            gains[m].gain.value = m === mode ? 1 : 0;
            gains[m].connect(master);
          });
        }).catch(function (err) { console.warn('sound did not load', err); });
        return loading;
      };
      var silence = function () {
        sources.forEach(function (s) { try { s.stop(); } catch (e) {} });
        sources = [];
      };
      var sound = function () {
        silence();
        if (!buffers || video.paused || scrubbing) return;
        var at = video.currentTime;
        began = ctx.currentTime - at;
        MODES.forEach(function (m) {
          if (at >= buffers[m].duration) return;
          var s = ctx.createBufferSource();
          s.buffer = buffers[m];
          s.connect(gains[m]);
          s.start(0, at);
          sources.push(s);
        });
      };

      var player = {
        pause: function () { video.pause(); }
      };
      players.push(player);

      var start = function () {
        audioContext();
        keepAwake.play().catch(function () {});
        players.forEach(function (p) { if (p !== player) p.pause(); });
        ba.classList.add('is-loading');
        Promise.all([load(), pick()]).then(function () {
          ba.classList.remove('is-loading');
          if (video.ended) video.currentTime = 0;
          video.play().catch(function (err) { console.warn(err); });
        });
      };

      frame.addEventListener('click', function (e) {
        if (e.target.closest('.biz-ba-bar') || ba.classList.contains('is-full')) return;
        if (video.paused) start(); else video.pause();
      });

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var next = tab.getAttribute('data-ba');
          if (next === mode) return;
          mode = next;
          tabs.forEach(function (t) {
            var on = t === tab;
            t.classList.toggle('is-on', on);
            t.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          placePill();
          video.style.transform = 'translateX(-' + (PANE[mode] * 100 / 3).toFixed(4) + '%)';
          if (!calm && stage.animate) {
            stage.animate([{ filter: 'blur(16px) brightness(1.3)' }, { filter: 'blur(0) brightness(1)' }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
            flash.textContent = tab.textContent;
            flash.animate([
              { opacity: 0, transform: 'translate(-50%, -50%) scale(.8)' },
              { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.2 },
              { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.62 },
              { opacity: 0, transform: 'translate(-50%, -50%) scale(1.06)' }
            ], { duration: 760, easing: 'ease-out' });
          }
          if (!gains) return;
          var now = ctx.currentTime;
          MODES.forEach(function (m) {
            var g = gains[m].gain;
            g.cancelScheduledValues(now);
            g.setValueAtTime(g.value, now);
            g.linearRampToValueAtTime(m === mode ? 1 : 0, now + 0.03);
          });
        });
      });

      video.addEventListener('playing', function () {
        ba.classList.add('is-playing', 'is-started');
        sound();
      });
      video.addEventListener('pause', function () { ba.classList.remove('is-playing'); silence(); });
      video.addEventListener('waiting', silence);
      video.addEventListener('seeking', silence);
      video.addEventListener('seeked', sound);
      video.addEventListener('ended', function () { ba.classList.remove('is-playing'); silence(); });
      var tip = ba.querySelector('.biz-ba-tip');
      var lastSeek = 0, ticking = false;
      var paint = function () {
        if (scrubbing || !video.duration) return;
        var part = video.currentTime / video.duration;
        seek.value = Math.round(part * 1000);
        seek.style.setProperty('--p', (part * 100).toFixed(2) + '%');
        time.textContent = clock(video.currentTime) + ' / ' + clock(video.duration);
      };
      var showLoaded = function () {
        if (!video.duration || !video.buffered.length) return;
        seek.style.setProperty('--b', (video.buffered.end(video.buffered.length - 1) / video.duration * 100).toFixed(1) + '%');
      };
      var tick = function () {
        paint();
        if (!video.paused && !video.ended) requestAnimationFrame(tick); else ticking = false;
      };
      video.addEventListener('playing', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(tick); }
      });
      video.addEventListener('progress', showLoaded);
      video.addEventListener('loadedmetadata', paint);
      video.addEventListener('timeupdate', function () {
        showLoaded();
        paint();
        // The two clocks can slowly part; bring the sound back when they do
        if (sources.length && Math.abs(ctx.currentTime - began - video.currentTime) > 0.18) sound();
      });
      var beginScrub = function () {
        scrubbing = true;
        ba.classList.add('is-scrub');
      };
      var endScrub = function () {
        if (!scrubbing) return;
        scrubbing = false;
        ba.classList.remove('is-scrub');
        if (video.duration) video.currentTime = seek.value / 1000 * video.duration;
      };
      seek.addEventListener('pointerdown', beginScrub);
      seek.addEventListener('input', function () {
        if (!scrubbing) beginScrub();
        var part = seek.value / 1000;
        var at = part * (video.duration || 0);
        seek.style.setProperty('--p', (part * 100).toFixed(2) + '%');
        time.textContent = clock(at) + ' / ' + clock(video.duration);
        tip.textContent = clock(at);
        tip.style.left = Math.min(frame.clientWidth - 30, Math.max(30, 12 + (frame.clientWidth - 24) * part)) + 'px';
        var now = Date.now();
        if (video.duration && now - lastSeek > 90) { lastSeek = now; video.currentTime = at; }
      });
      seek.addEventListener('change', endScrub);
      window.addEventListener('pointerup', endScrub);
      window.addEventListener('pointercancel', endScrub);
      ba.querySelector('.biz-ba-vol').addEventListener('input', function (e) {
        volume = e.target.value / 100;
        muted = false;
        applyVolume();
      });
      ba.querySelector('.biz-ba-mute').addEventListener('click', function () {
        if (volume === 0) { volume = 0.6; muted = false; } else muted = !muted;
        applyVolume();
      });

      // Enlarging: the real full screen where the browser has one, and a page-filling view on iPhones, which do not.
      // Either way it is the whole player that grows, so the three buttons come with it.
      var fullNow = function () { return document.fullscreenElement || document.webkitFullscreenElement; };
      var hideTimer = 0, movedAt = 0;
      var hideSoon = function () {
        clearTimeout(hideTimer);
        if (!ba.classList.contains('is-full') || video.paused) return;
        hideTimer = setTimeout(function () { if (scrubbing) hideSoon(); else ba.classList.add('is-clean'); }, 2600);
      };
      var wake = function () { ba.classList.remove('is-clean'); hideSoon(); };
      var setFull = function (on) {
        ba.classList.toggle('is-full', on);
        document.documentElement.classList.toggle('biz-ba-lock', on);
        if (on) wake(); else { clearTimeout(hideTimer); ba.classList.remove('is-clean'); }
        setTimeout(placePill, 60);
      };
      // Enlarged: the buttons leave after a moment so only the video is on screen; a tap brings them back or sends them away
      ba.addEventListener('click', function (e) {
        if (!ba.classList.contains('is-full')) return;
        if (e.target.closest('.biz-ba-tabs, .biz-ba-bar')) { wake(); return; }
        if (video.paused) { start(); wake(); return; }
        if (ba.classList.contains('is-clean')) wake();
        else if (Date.now() - movedAt > 250) { clearTimeout(hideTimer); ba.classList.add('is-clean'); }
      });
      ba.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'mouse' && ba.classList.contains('is-full')) { movedAt = Date.now(); wake(); }
      });
      video.addEventListener('playing', hideSoon);
      video.addEventListener('pause', wake);
      ba.querySelector('.biz-ba-toggle').addEventListener('click', function () {
        if (video.paused) start(); else video.pause();
      });
      ba.querySelector('.biz-ba-full').addEventListener('click', function () {
        if (ba.classList.contains('is-full')) {
          var leave = document.exitFullscreen || document.webkitExitFullscreen;
          if (fullNow() && leave) leave.call(document);
          setFull(false);
          return;
        }
        setFull(true);
        var enter = ba.requestFullscreen || ba.webkitRequestFullscreen;
        if (enter) {
          try { var asked = enter.call(ba); if (asked && asked.catch) asked.catch(function () {}); } catch (e) {}
        }
      });
      var fullChanged = function () { if (!fullNow() && ba.classList.contains('is-full')) setFull(false); };
      document.addEventListener('fullscreenchange', fullChanged);
      document.addEventListener('webkitfullscreenchange', fullChanged);

      ba._video = video;
      ba._state = function () { return { mode: mode, sources: sources.length, ctx: ctx && ctx.state, drift: sources.length ? Math.round((ctx.currentTime - began - video.currentTime) * 1000) : null, level: master ? Math.round(master.gain.value * 100) / 100 : null }; };
    });
  })();

  // The two example months: four plain weeks, each with its videos
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  document.querySelectorAll('.biz-cal').forEach(function (cal) {
    var box = cal.querySelector('.biz-weeks');
    var n = 0;
    cal.getAttribute('data-weeks').split(',').map(Number).forEach(function (count, w) {
      var row = document.createElement('div');
      row.className = 'biz-week';
      var name = document.createElement('span');
      name.setAttribute('data-i18n', 'biz.week' + (w + 1));
      name.textContent = 'الأسبوع ' + (w + 1);
      row.appendChild(name);
      var vids = document.createElement('span');
      if (count === 0) {
        vids.className = 'biz-week-none';
        vids.setAttribute('data-i18n', 'biz.week_none');
        vids.textContent = 'ولا فيديو';
      } else {
        vids.className = 'biz-week-vids';
        for (var i = 0; i < count; i++) {
          var v = document.createElement('i');
          v.className = 'biz-vid';
          v.style.setProperty('--n', n++);
          v.innerHTML = PLAY;
          vids.appendChild(v);
        }
      }
      row.appendChild(vids);
      box.appendChild(row);
    });
  });

  // One answer open at a time
  var faqs = document.querySelectorAll('.biz-faq details');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqs.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  // Phone button: appears after the top of the page, steps aside at the main buttons and the last call
  var sticky = document.getElementById('bizSticky');
  var hero = document.getElementById('hero');
  var last = document.getElementById('last');
  var mainButtons = document.querySelector('.biz-change-sec .hero-buttons');
  if (sticky && hero && last && 'IntersectionObserver' in window) {
    var heroSeen = true;
    var lastSeen = false;
    var buttonsSeen = false;
    var playerSeen = false;
    var update = function () { sticky.classList.toggle('show', !heroSeen && !lastSeen && !buttonsSeen && !playerSeen); };
    var playerGrid = document.querySelector('.biz-ba-grid');
    if (playerGrid) new IntersectionObserver(function (e) { playerSeen = e[e.length - 1].isIntersecting; update(); }).observe(playerGrid);
    new IntersectionObserver(function (e) { heroSeen = e[e.length - 1].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (e) { lastSeen = e[e.length - 1].isIntersecting; update(); }).observe(last);
    if (mainButtons) new IntersectionObserver(function (e) { buttonsSeen = e[e.length - 1].isIntersecting; update(); }).observe(mainButtons);
  }
  /* Leave your number: if a visitor forgets to message on WhatsApp, the number still reaches Khalid.
     It goes through the same mail service as the contact page, inside the message, with a stand-in
     address made from the number (the service needs an address; it never receives mail). The spare
     way is the same as on the contact page. */
  var lead = document.getElementById('bizLead');
  if (lead) {
    var MAIL_API = 'https://modayver-contracts.modayver-contracts.workers.dev';
    var WEB3FORMS_KEY = '34b0facb-8684-4bd6-839c-98284eb120de';   // public form key, safe in page code
    var leadState = 'idle';   // idle → sending → sent: one number, sent once
    var leadBtn = document.getElementById('bizLeadBtn');
    var leadError = document.getElementById('bizLeadError');
    var SAY = {
      ar: { name: 'اكتب اسمك.', phone: 'اكتب رقم واتساب صحيح.', fail: 'ما انرسل رقمك. تأكد من النت وجرّب مرة ثانية.', busy: 'جاري الإرسال…' },
      en: { name: 'Please type your name.', phone: 'Please type a valid WhatsApp number.', fail: 'Your number was not sent. Check your connection and try again.', busy: 'Sending…' }
    };
    var say = function () { return SAY[document.documentElement.lang === 'en' ? 'en' : 'ar']; };

    /* Every country, the UAE first and already chosen. One line each: code|Arabic|English.
       Some countries share a code (+1, +7, +39), so the choice is kept as the country itself. */
    var GULF = ['971|الإمارات|UAE', '966|السعودية|Saudi Arabia', '965|الكويت|Kuwait', '974|قطر|Qatar', '973|البحرين|Bahrain', '968|عُمان|Oman'];
    var ARAB = [
      '964|العراق|Iraq', '962|الأردن|Jordan', '961|لبنان|Lebanon', '963|سوريا|Syria', '970|فلسطين|Palestine', '972|فلسطين|Palestine', '20|مصر|Egypt',
      '249|السودان|Sudan', '218|ليبيا|Libya', '216|تونس|Tunisia', '213|الجزائر|Algeria', '212|المغرب|Morocco', '222|موريتانيا|Mauritania',
      '967|اليمن|Yemen', '252|الصومال|Somalia', '253|جيبوتي|Djibouti', '269|جزر القمر|Comoros'
    ];
    var WORLD = [
      '93|أفغانستان|Afghanistan', '355|ألبانيا|Albania', '376|أندورا|Andorra', '244|أنغولا|Angola', '1|أنتيغوا وبربودا|Antigua and Barbuda',
      '54|الأرجنتين|Argentina', '374|أرمينيا|Armenia', '61|أستراليا|Australia', '43|النمسا|Austria', '994|أذربيجان|Azerbaijan',
      '1|الباهاما|Bahamas', '880|بنغلاديش|Bangladesh', '1|بربادوس|Barbados', '375|بيلاروسيا|Belarus', '32|بلجيكا|Belgium',
      '501|بليز|Belize', '229|بنين|Benin', '975|بوتان|Bhutan', '591|بوليفيا|Bolivia', '387|البوسنة والهرسك|Bosnia and Herzegovina',
      '267|بوتسوانا|Botswana', '55|البرازيل|Brazil', '673|بروناي|Brunei', '359|بلغاريا|Bulgaria', '226|بوركينا فاسو|Burkina Faso',
      '257|بوروندي|Burundi', '238|الرأس الأخضر|Cape Verde', '855|كمبوديا|Cambodia', '237|الكاميرون|Cameroon', '1|كندا|Canada',
      '236|أفريقيا الوسطى|Central African Republic', '235|تشاد|Chad', '56|تشيلي|Chile', '86|الصين|China', '57|كولومبيا|Colombia',
      '242|الكونغو|Congo', '243|الكونغو الديمقراطية|DR Congo', '506|كوستاريكا|Costa Rica', '225|ساحل العاج|Ivory Coast', '385|كرواتيا|Croatia',
      '53|كوبا|Cuba', '357|قبرص|Cyprus', '420|التشيك|Czechia', '45|الدنمارك|Denmark', '1|دومينيكا|Dominica',
      '1|الدومينيكان|Dominican Republic', '593|الإكوادور|Ecuador', '503|السلفادور|El Salvador', '240|غينيا الاستوائية|Equatorial Guinea', '291|إريتريا|Eritrea',
      '372|إستونيا|Estonia', '268|إسواتيني|Eswatini', '251|إثيوبيا|Ethiopia', '679|فيجي|Fiji', '358|فنلندا|Finland',
      '33|فرنسا|France', '241|الغابون|Gabon', '220|غامبيا|Gambia', '995|جورجيا|Georgia', '49|ألمانيا|Germany',
      '233|غانا|Ghana', '30|اليونان|Greece', '1|غرينادا|Grenada', '502|غواتيمالا|Guatemala', '224|غينيا|Guinea',
      '245|غينيا بيساو|Guinea-Bissau', '592|غيانا|Guyana', '509|هايتي|Haiti', '504|هندوراس|Honduras', '852|هونغ كونغ|Hong Kong',
      '36|المجر|Hungary', '354|آيسلندا|Iceland', '91|الهند|India', '62|إندونيسيا|Indonesia', '98|إيران|Iran',
      '353|أيرلندا|Ireland', '39|إيطاليا|Italy', '1|جامايكا|Jamaica', '81|اليابان|Japan',
      '7|كازاخستان|Kazakhstan', '254|كينيا|Kenya', '686|كيريباتي|Kiribati', '383|كوسوفو|Kosovo', '996|قيرغيزستان|Kyrgyzstan',
      '856|لاوس|Laos', '371|لاتفيا|Latvia', '266|ليسوتو|Lesotho', '231|ليبيريا|Liberia', '423|ليختنشتاين|Liechtenstein',
      '370|ليتوانيا|Lithuania', '352|لوكسمبورغ|Luxembourg', '853|ماكاو|Macau', '261|مدغشقر|Madagascar', '265|مالاوي|Malawi',
      '60|ماليزيا|Malaysia', '960|المالديف|Maldives', '223|مالي|Mali', '356|مالطا|Malta', '692|جزر مارشال|Marshall Islands',
      '230|موريشيوس|Mauritius', '52|المكسيك|Mexico', '691|ميكرونيزيا|Micronesia', '373|مولدوفا|Moldova', '377|موناكو|Monaco',
      '976|منغوليا|Mongolia', '382|الجبل الأسود|Montenegro', '258|موزمبيق|Mozambique', '95|ميانمار|Myanmar', '264|ناميبيا|Namibia',
      '674|ناورو|Nauru', '977|نيبال|Nepal', '31|هولندا|Netherlands', '64|نيوزيلندا|New Zealand', '505|نيكاراغوا|Nicaragua',
      '227|النيجر|Niger', '234|نيجيريا|Nigeria', '850|كوريا الشمالية|North Korea', '389|مقدونيا الشمالية|North Macedonia', '47|النرويج|Norway',
      '92|باكستان|Pakistan', '680|بالاو|Palau', '507|بنما|Panama', '675|بابوا غينيا الجديدة|Papua New Guinea', '595|باراغواي|Paraguay',
      '51|بيرو|Peru', '63|الفلبين|Philippines', '48|بولندا|Poland', '351|البرتغال|Portugal', '1|بورتوريكو|Puerto Rico',
      '40|رومانيا|Romania', '7|روسيا|Russia', '250|رواندا|Rwanda', '1|سانت كيتس ونيفيس|Saint Kitts and Nevis', '1|سانت لوسيا|Saint Lucia',
      '1|سانت فنسنت والغرينادين|Saint Vincent and the Grenadines', '685|ساموا|Samoa', '378|سان مارينو|San Marino', '239|ساو تومي وبرينسيبي|Sao Tome and Principe', '221|السنغال|Senegal',
      '381|صربيا|Serbia', '248|سيشل|Seychelles', '232|سيراليون|Sierra Leone', '65|سنغافورة|Singapore', '421|سلوفاكيا|Slovakia',
      '386|سلوفينيا|Slovenia', '677|جزر سليمان|Solomon Islands', '27|جنوب أفريقيا|South Africa', '82|كوريا الجنوبية|South Korea', '211|جنوب السودان|South Sudan',
      '34|إسبانيا|Spain', '94|سريلانكا|Sri Lanka', '597|سورينام|Suriname', '46|السويد|Sweden', '41|سويسرا|Switzerland',
      '886|تايوان|Taiwan', '992|طاجيكستان|Tajikistan', '255|تنزانيا|Tanzania', '66|تايلاند|Thailand', '670|تيمور الشرقية|Timor-Leste',
      '228|توغو|Togo', '676|تونغا|Tonga', '1|ترينيداد وتوباغو|Trinidad and Tobago', '90|تركيا|Turkey', '993|تركمانستان|Turkmenistan',
      '688|توفالو|Tuvalu', '256|أوغندا|Uganda', '380|أوكرانيا|Ukraine', '44|بريطانيا|United Kingdom', '1|أمريكا|United States',
      '598|أوروغواي|Uruguay', '998|أوزبكستان|Uzbekistan', '678|فانواتو|Vanuatu', '39|الفاتيكان|Vatican', '58|فنزويلا|Venezuela',
      '84|فيتنام|Vietnam', '260|زامبيا|Zambia', '263|زيمبابوي|Zimbabwe'
    ];
    var readRow = function (row) { var p = row.split('|'); return { code: p[0], ar: p[1], en: p[2] }; };
    var groups = [
      { ar: 'دول الخليج', en: 'Gulf countries', rows: GULF.map(readRow) },
      { ar: 'الدول العربية', en: 'Arab countries', sorted: true, rows: ARAB.map(readRow) },
      { ar: 'باقي دول العالم', en: 'Rest of the world', sorted: true, rows: WORLD.map(readRow) }
    ];
    var codeBox = document.getElementById('bizCodeBox');
    var codeSelect = document.getElementById('bizCode');
    var chosen = groups[0].rows[0];
    var filledLang = '';
    var pageLang = function () { return document.documentElement.lang === 'en' ? 'en' : 'ar'; };
    var sortName = function (c, lang) { return lang === 'en' ? c.en : c.ar.replace(/^ال/, ''); };   // البرازيل sits under ب

    var showChoice = function () {
      document.getElementById('bizCodeName').textContent = chosen[pageLang()];
      document.getElementById('bizCodeNum').textContent = '+' + chosen.code;
    };
    var fillCountries = function () {
      var lang = pageLang();
      if (lang === filledLang) return;
      filledLang = lang;
      codeBox.dir = lang === 'en' ? 'ltr' : 'rtl';
      codeSelect.textContent = '';
      groups.forEach(function (g) {
        var box = document.createElement('optgroup');
        box.label = g[lang];
        var rows = !g.sorted ? g.rows : g.rows.slice().sort(function (a, b) {
          return sortName(a, lang).localeCompare(sortName(b, lang), lang);
        });
        rows.forEach(function (c) {
          var item = new Option(c[lang] + ' ‎+' + c.code, c.code, false, c === chosen);
          item._country = c;
          box.appendChild(item);
        });
        codeSelect.appendChild(box);
      });
      showChoice();
    };
    codeSelect.addEventListener('change', function () {
      chosen = codeSelect.options[codeSelect.selectedIndex]._country;
      showChoice();
    });
    fillCountries();
    new MutationObserver(fillCountries).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    // Arabic digits, spaces, a leading zero or 00: whatever is typed becomes one full number
    var fullNumber = function (code, typed) {
      var v = String(typed).replace(/[\u0660-\u0669]/g, function (d) { return d.charCodeAt(0) - 0x0660; })
                           .replace(/[\u06F0-\u06F9]/g, function (d) { return d.charCodeAt(0) - 0x06F0; }).trim();
      var international = /^(\+|00)/.test(v);
      var digits = v.replace(/\D/g, '');
      if (international) digits = digits.replace(/^00/, '');
      else if (code) {
        // Already has the country code? The length decides, because many local numbers start
        // with the same digits as their code (India 91…, Italy 39…, Kazakhstan 7…)
        var local = digits.replace(/^0+/, '');
        var hasCode = local.indexOf(code) === 0 && local.length - code.length >= [0, 10, 9, 7][code.length];
        digits = hasCode ? local : code + local;
      }
      return /^[1-9]\d{7,14}$/.test(digits) ? digits : '';
    };

    var showLeadError = function (text) {
      leadError.textContent = text;
      leadError.hidden = false;
    };

    lead.addEventListener('submit', function (e) {
      e.preventDefault();
      if (leadState !== 'idle') return;
      var f = lead.elements;
      var name = f['name'].value.trim();
      var number = fullNumber(f['code'].value, f['phone'].value);
      if (!name) { showLeadError(say().name); f['name'].focus(); return; }
      if (!number) { showLeadError(say().phone); f['phone'].focus(); return; }
      if (navigator.onLine === false) { showLeadError(say().fail); return; }

      leadState = 'sending';
      leadError.hidden = true;
      var label = leadBtn.textContent;
      leadBtn.disabled = true;
      leadBtn.textContent = say().busy;

      var message = 'عميل من ' + PAGE_NAME + ' ترك رقمه عشان تكلمه.\n\n' +
        'الاسم: ' + name + '\n' +
        'رقم الواتساب: +' + number + '\n' +
        'افتح المحادثة: https://wa.me/' + number +
        (document.documentElement.lang === 'en' ? '\n\nكان يتصفح الصفحة بالإنجليزية.' : '');

      var done = function () {
        if (leadState === 'sent') return;
        leadState = 'sent';
        lead.hidden = true;
        document.getElementById('bizLeadDone').hidden = false;
      };
      var failed = function (err) {
        console.error(err);
        if (leadState !== 'sending') return;
        leadState = 'idle';
        leadBtn.disabled = false;
        leadBtn.textContent = label;
        showLeadError(say().fail);
      };
      var spare = function () {
        var data = new FormData();
        data.append('access_key', WEB3FORMS_KEY);
        data.append('from_name', 'موقع مودايفر');
        data.append('subject', 'رقم عميل من ' + PAGE_NAME + ': ' + name);
        data.append('name', name);
        data.append('message', message);
        fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Accept': 'application/json' }, body: data, keepalive: true })
          .then(function (r) { return r.json(); })
          .then(function (r) {
            if (!r || String(r.success) !== 'true') throw new Error(r && r.message);
            done();
          })
          .catch(failed);
      };

      var stop = window.AbortController ? new AbortController() : null;
      var wait = setTimeout(function () { if (stop) stop.abort(); }, 8000);
      fetch(MAIL_API + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ name: name, email: 'wa' + number + '@lead.modayver.com', message: message, lang: 'ar', mv_check: f['mv_check'].value }),
        signal: stop ? stop.signal : undefined,
        keepalive: true
      })
        .then(function (r) {
          clearTimeout(wait);
          if (r.status === 429) return failed(new Error('too many messages'));
          return r.json().then(function (out) {
            if (!r.ok || !out || out.ok !== true) throw new Error((out && out.error) || 'status ' + r.status);
            done();
          });
        })
        .catch(function (err) {
          clearTimeout(wait);
          console.warn('mail service did not take it, using the spare way', err);
          spare();
        });
    });
  }
})();
