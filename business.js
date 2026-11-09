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
    'biz.btn_sample': 'Try the first two videos',
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
    'biz.cal1': 'Without a plan',
    'biz.cal1_f': '3 videos a month',
    'biz.cal2': 'With me',
    'biz.cal2_f': '8 videos a month',
    'biz.week1': 'Week 1',
    'biz.week2': 'Week 2',
    'biz.week3': 'Week 3',
    'biz.week4': 'Week 4',
    'biz.week_none': 'None',
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
    'biz.try_desc': 'The first two videos are a trial, with no talk of price or contracts. If you like the work, we continue and agree on a price that includes those two videos. If not, you owe nothing.',
    'biz.try_btn': 'Start the trial',
    'biz.try1': 'If you do not like the work, you pay nothing',
    'biz.try2': 'No talk of price or contracts before the two videos',
    'biz.try3': 'A set delivery date for every video',

    'biz.faq_title': 'Questions before we start',
    'biz.q1': 'Do I need a professional camera?',
    'biz.a1': 'No. A recent phone and good light are enough, and I send you short filming tips before we start.',
    'biz.q2': 'Do you do the filming?',
    'biz.a2': 'No, I work remotely. You or your videographer film, and all the editing is on me.',
    'biz.q3': 'How do I send the clips?',
    'biz.a3': 'With a link, such as Google Drive. You do not need any special software.',
    'biz.q4': 'How many changes can I ask for?',
    'biz.a4': 'We set the number of revisions together before we start, so there are no surprises for either side.',
    'biz.q5': 'How much does it cost?',
    'biz.a5': 'It depends on the type and number of videos. Tell me what you need and I will send a clear offer before any commitment.',
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

      var message = 'عميل من صفحة أصحاب الأعمال ترك رقمه عشان تكلمه.\n\n' +
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
        data.append('subject', 'رقم عميل من صفحة أصحاب الأعمال: ' + name);
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
