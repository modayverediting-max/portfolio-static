/* ========================================
   Sales page for business owners (modayver.com/business)
   Runs before i18n.js: it adds this page's English text, so the shared
   translations file stays untouched and the page can be removed by deleting
   its own files (business.html, business-page.html, business.css, business.js).
   ======================================== */
(function () {
  var WA = 'https://wa.me/213775051301?text=';

  // What the visitor's WhatsApp message starts with
  var MSG_AR = {
    sample: 'هلا خالد، شفت صفحتك وأبي تجربة مجانية. هذا رابط فيديو من مشروعي:',
    talk: 'هلا خالد، شفت صفحتك وأبي أكلمك عن مشروعي.',
    p1: 'هلا خالد، أبي أسأل عن باقة البداية (4 فيديوهات في الشهر).',
    p2: 'هلا خالد، أبي أسأل عن الباقة المتوسطة (8 فيديوهات في الشهر).',
    p3: 'هلا خالد، أبي أسأل عن الباقة الكاملة (12 فيديو في الشهر).'
  };
  var MSG_EN = {
    sample: 'Hi Khalid, I saw your page and I would like a free trial. Here is a link to one of my videos:',
    talk: 'Hi Khalid, I saw your page and I would like to tell you about my project.',
    p1: 'Hi Khalid, I would like to ask about the Starter package (4 videos a month).',
    p2: 'Hi Khalid, I would like to ask about the Medium package (8 videos a month).',
    p3: 'Hi Khalid, I would like to ask about the Full package (12 videos a month).'
  };

  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.setAttribute('href', WA + encodeURIComponent(MSG_AR[a.getAttribute('data-wa')]));
  });

  var en = window.TRANSLATIONS_EN = window.TRANSLATIONS_EN || {};
  Object.keys(MSG_EN).forEach(function (k) {
    en['biz.wa_' + k] = WA + encodeURIComponent(MSG_EN[k]);
  });

  Object.assign(en, {
    'biz.badge': 'For business owners in the UAE and the Gulf',
    'biz.title': 'You film on your phone.<br>I handle the rest.',
    'biz.desc': 'I turn your raw footage into videos ready to publish every month, so your customers keep seeing you and editing takes none of your time.',
    'biz.btn_sample': 'Get a free trial',
    'biz.btn_work': 'See my work',
    'biz.proof1': 'million views',
    'biz.proof2': 'videos delivered',
    'biz.proof3': 'years of experience',

    'biz.pain_title': 'Does this happen in your business?',
    'biz.pain_sub': 'You know video matters. The problem is everything that comes after filming.',
    'biz.pain1_t': 'Clips waiting on your phone',
    'biz.pain1_d': 'You film with energy, then the clips pile up because editing needs time you do not have.',
    'biz.pain2_t': 'One week on, one month gone',
    'biz.pain2_d': 'Every gap sends you back to the start and leaves your customer to whoever they see more often.',
    'biz.pain3_t': 'A good message nobody finishes',
    'biz.pain3_d': 'You have something worth saying, but viewers leave before they reach it.',
    'biz.pain4_t': 'An editor who became a new problem',
    'biz.pain4_d': 'Late delivery, daily follow-ups and endless changes. You wanted less work and got more.',

    'biz.change_title': 'Your month once we start',
    'biz.change_sub': 'What you need is a steady presence your customers see every week, not one video every now and then.',
    'biz.cal1': 'A month without a system',
    'biz.cal1_f': '3 scattered posts',
    'biz.cal2': 'A month with me',
    'biz.cal2_f': '8 videos, on schedule',
    'biz.cal_note': 'An illustration. We set the number of videos together.',
    'biz.gain1_t': 'A steady presence',
    'biz.gain1_d': 'An agreed number of videos every month, ready to publish on schedule.',
    'biz.gain2_t': 'Videos that hold attention',
    'biz.gain2_d': 'An opening that stops the scroll, tight wording and a pace that holds attention.',
    'biz.gain3_t': 'Your time stays yours',
    'biz.gain3_d': 'You will not open any software. You film, then you approve the result.',

    'biz.steps_title': 'Just three steps',
    'biz.steps_sub': 'It only takes a few minutes of your time.',
    'biz.step1_t': 'You send the footage',
    'biz.step1_d': 'One link to the clips and a line about the goal of the video. No professional camera needed.',
    'biz.step2_t': 'I work on the video',
    'biz.step2_d': 'I tighten, arrange, and add text, motion and sound. The first version reaches you within 72 hours.',
    'biz.step3_t': 'You approve and publish',
    'biz.step3_d': 'Send your notes if you have any, then receive the video ready in the size of your platform.',

    'biz.proof_title': 'I have worked with channels followed by millions',
    'biz.proof_sub': 'I have worked with big channels followed by millions of people, and I bring the same experience to your videos.',
    'biz.ch1': '900K subscribers',
    'biz.ch2': '1.81M subscribers',
    'biz.ch3': '1.55M subscribers',
    'biz.work_title': 'Ads and videos for companies and projects',
    'biz.v1': 'Ad for Yango Play',
    'biz.v2': 'Trading course',
    'biz.v3': 'Ad for the game Tahaddi Al-Mulook',
    'biz.v4': 'Ad for a PC builds store',
    'biz.v5': 'Introduction video',

    'biz.pack_title': 'Choose the number of videos that fits your business',
    'biz.pack_sub': 'Every package is monthly and includes full editing, on-screen text, sound design and getting the video ready to publish.',
    'biz.pack_unit': 'short videos a month',
    'biz.pack_unit12': 'short videos a month',
    'biz.pack_btn': 'Ask about this package',
    'biz.p1_name': 'Starter',
    'biz.p1_d': 'One video a week, for those who want to start showing up regularly.',
    'biz.p2_tag': 'My recommendation',
    'biz.p2_name': 'Medium',
    'biz.p2_d': 'Two videos a week, to build a presence your customers remember.',
    'biz.p3_name': 'Full',
    'biz.p3_d': 'Three videos a week, for those who rely on content to bring in customers.',
    'biz.pack_note': 'The price depends on the length and type of video. Tell me what you need and I will send a clear offer before any commitment.',

    'biz.try_tag': 'No commitment',
    'biz.try_title': 'Try before you decide',
    'biz.try_desc': 'Send me a link to a video you have already published and I will re-edit 15 seconds of it for free. If you like the result, we continue. If not, you lose nothing.',
    'biz.try_btn': 'Send the video link',
    'biz.try1': 'The trial is free, nothing to pay',
    'biz.try2': 'A written agreement before we start',
    'biz.try3': 'A set delivery date for every video',

    'biz.faq_title': 'Questions before we start',
    'biz.q1': 'Do I need a professional camera?',
    'biz.a1': 'No. A recent phone and good light are enough, and I send you short filming tips before we start.',
    'biz.q2': 'Do you do the filming?',
    'biz.a2': 'No, I work remotely. You or your videographer film, and all the editing is on me.',
    'biz.q3': 'How do I send the clips?',
    'biz.a3': 'With a link, such as Google Drive. You do not need any special software.',
    'biz.q4': 'How many changes can I ask for?',
    'biz.a4': 'We set the number of revisions in the agreement before we start, so there are no surprises for either side.',
    'biz.q5': 'How much does it cost?',
    'biz.a5': 'It depends on the type and number of videos. Tell me what you need and I will send a clear offer before any commitment.',
    'biz.q6': 'How do I pay?',
    'biz.a6': 'With a monthly invoice through PayPal, or another way we agree on.',

    'biz.cta_title': 'The first step is one message',
    'biz.cta_sub': 'Tell me about your business on WhatsApp and I will reply with what fits it.',
    'biz.cta_btn': 'Talk to me on WhatsApp',
    'biz.cta_other': 'Other ways to reach me'
  });

  // The two month calendars: 28 days, the days with a post light up one after another
  document.querySelectorAll('.biz-cal').forEach(function (cal) {
    var grid = cal.querySelector('.biz-cal-grid');
    var on = cal.getAttribute('data-on').split(',').map(Number);
    for (var d = 1; d <= 28; d++) {
      var day = document.createElement('i');
      var n = on.indexOf(d);
      if (n !== -1) {
        day.className = 'on';
        day.style.setProperty('--n', n);
      }
      grid.appendChild(day);
    }
  });

  // One answer open at a time
  var faqs = document.querySelectorAll('.biz-faq details');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqs.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  // Phone button: appears after the top of the page, steps aside at the last call
  var sticky = document.getElementById('bizSticky');
  var hero = document.getElementById('hero');
  var last = document.getElementById('last');
  if (sticky && hero && last && 'IntersectionObserver' in window) {
    var heroSeen = true;
    var lastSeen = false;
    var update = function () { sticky.classList.toggle('show', !heroSeen && !lastSeen); };
    new IntersectionObserver(function (e) { heroSeen = e[e.length - 1].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (e) { lastSeen = e[e.length - 1].isIntersecting; update(); }).observe(last);
  }
})();
