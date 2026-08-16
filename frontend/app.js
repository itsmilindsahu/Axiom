(() => {
  const els = {
    shell: document.getElementById('shell'),
    sidebar: document.getElementById('sidebar'),
    sidebarOpen: document.getElementById('sidebarOpen'),
    sidebarClose: document.getElementById('sidebarClose'),
    sidebarScrim: document.getElementById('sidebarScrim'),
    newCheckBtn: document.getElementById('newCheckBtn'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
    pilotToggle: document.getElementById('pilotToggle'),
    pilotPanel: document.getElementById('pilotPanel'),
    thread: document.getElementById('thread'),
    emptyState: document.getElementById('emptyState'),
    emptyHeading: document.getElementById('emptyHeading'),
    emptySub: document.getElementById('emptySub'),
    emptyExamples: document.getElementById('emptyExamples'),
    message: document.getElementById('message'),
    checkBtn: document.getElementById('checkBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    charCount: document.getElementById('charCount'),
    status: document.getElementById('status'),
    statusDot: document.getElementById('status-dot'),
    baseUrl: document.getElementById('baseUrl'),
    langEn: document.getElementById('lang-en'),
    langHi: document.getElementById('lang-hi'),
    tplUser: document.getElementById('tpl-user-bubble'),
    tplLoading: document.getElementById('tpl-loading-bubble'),
  };

  const DEFAULT_API_BASE = 'https://itsmilindsahu-axioms.hf.space';

  if (!els.baseUrl.value || els.baseUrl.value === 'http://localhost:8000') {
    els.baseUrl.value = DEFAULT_API_BASE;
  }

  // ── Curated 24 Claims Database (for instant 24/7 client-side verification) ──
  const CLAIMS_DB = [
    {
      id: 1,
      claim_text: "Drinking hot water with lemon every morning cures cancer.",
      claim_text_hi: "हर सुबह नींबू के साथ गर्म पानी पीने से कैंसर ठीक हो जाता है।",
      verdict: "False",
      explanation: "There is no scientific evidence that lemon water cures cancer or any form of it. Cancer treatment requires proper medical diagnosis and care, not home remedies.",
      source_url: "https://www.cancer.gov/about-cancer/causes-prevention/myths",
      category: "health",
      keywords: ["lemon", "hot water", "cancer", "cures", "नींबू", "कैंसर"]
    },
    {
      id: 2,
      claim_text: "Eating garlic can protect you from COVID-19 infection.",
      claim_text_hi: "लहसुन खाने से कोविड-19 संक्रमण से बचाव होता है।",
      verdict: "False",
      explanation: "Garlic has some antimicrobial properties but there is no evidence it prevents COVID-19 infection. Vaccination and standard hygiene measures remain the recommended protection.",
      source_url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
      category: "health",
      keywords: ["garlic", "protect", "covid", "coronavirus", "लहसुन", "कोविड"]
    },
    {
      id: 3,
      claim_text: "5G mobile towers spread coronavirus and weaken the immune system.",
      claim_text_hi: "5G मोबाइल टावर कोरोनावायरस फैलाते हैं और रोग प्रतिरोधक क्षमता को कमजोर करते हैं।",
      verdict: "False",
      explanation: "Viruses cannot travel on radio waves or mobile networks, and 5G technology has no documented effect on the human immune system. This claim has been repeatedly debunked by telecom regulators and health bodies worldwide.",
      source_url: "https://www.who.int/news-room/feature-stories/detail/5g-mobile-networks-and-health",
      category: "health",
      keywords: ["5g", "towers", "spread", "coronavirus", "covid", "टावर"]
    },
    {
      id: 4,
      claim_text: "Drinking cow urine daily cures diabetes and other chronic diseases.",
      claim_text_hi: "रोजाना गौमूत्र पीने से मधुमेह और अन्य पुरानी बीमारियां ठीक हो जाती हैं।",
      verdict: "False",
      explanation: "No peer-reviewed clinical study supports cow urine as a treatment for diabetes or chronic illness. Diabetes requires evidence-based medical management including diet, exercise, and prescribed medication.",
      source_url: "https://main.icmr.nic.in/",
      category: "health",
      keywords: ["cow urine", "urine", "diabetes", "cures", "गौमूत्र", "मधुमेह"]
    },
    {
      id: 5,
      claim_text: "Vaccines contain microchips used to track people.",
      claim_text_hi: "वैक्सीन में लोगों को ट्रैक करने के लिए माइक्रोचिप डाली जाती है।",
      verdict: "False",
      explanation: "Vaccine doses are far too small in volume to contain a functioning microchip and tracking device. This claim originated from misread patents and has been fact-checked and rejected by health authorities globally.",
      source_url: "https://www.reuters.com/article/factcheck-vaccine-microchip",
      category: "health",
      keywords: ["vaccine", "vaccines", "microchip", "microchips", "track", "माइक्रोचिप"]
    },
    {
      id: 6,
      claim_text: "Eating papaya during pregnancy is always dangerous and causes miscarriage.",
      claim_text_hi: "गर्भावस्था के दौरान पपीता खाना हमेशा खतरनाक होता है और गर्भपात का कारण बनता है।",
      verdict: "Misleading",
      explanation: "Ripe papaya in moderate amounts is generally considered safe, while unripe or semi-ripe papaya contains latex that may trigger contractions in large quantities. The blanket claim that all papaya is dangerous oversimplifies actual medical guidance.",
      source_url: "https://www.acog.org/womens-health",
      category: "health",
      keywords: ["papaya", "pregnancy", "miscarriage", "dangerous", "पपीता", "गर्भपात"]
    },
    {
      id: 7,
      claim_text: "Holding your breath for 10 seconds can tell you if you have COVID-19.",
      claim_text_hi: "10 सेकंड तक सांस रोककर रखने से पता चल जाता है कि आपको कोविड-19 है या नहीं।",
      verdict: "False",
      explanation: "Breath-holding ability is not a reliable indicator of COVID-19 infection and can vary due to many unrelated factors like fitness level. Proper diagnosis requires an RT-PCR or antigen test.",
      source_url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
      category: "health",
      keywords: ["breath", "hold breath", "10 seconds", "covid", "सांस"]
    },
    {
      id: 8,
      claim_text: "You have won a lottery of 25 lakh rupees from a WhatsApp lucky draw, click the link to claim your prize.",
      claim_text_hi: "आपने व्हाट्सएप लकी ड्रॉ में 25 लाख रुपये की लॉटरी जीती है, इनाम पाने के लिए लिंक पर क्लिक करें।",
      verdict: "False",
      explanation: "WhatsApp does not run lotteries, lucky draws, or cash prize giveaways of any kind. Such messages are phishing scams designed to steal personal and banking information through fake links.",
      source_url: "https://faq.whatsapp.com/general/security-and-privacy/how-to-avoid-and-report-spam",
      category: "financial",
      keywords: ["whatsapp", "lottery", "25 lakh", "lucky draw", "prize", "लॉटरी", "25 लाख"]
    },
    {
      id: 9,
      claim_text: "The RBI has launched a new scheme giving free money to every bank account holder.",
      claim_text_hi: "आरबीआई ने हर बैंक खाताधारक को मुफ्त पैसे देने की एक नई योजना शुरू की है।",
      verdict: "False",
      explanation: "The Reserve Bank of India has issued no such scheme and has repeatedly warned the public about fraudulent messages using its name. These messages are typically used to trick users into revealing OTPs or bank details.",
      source_url: "https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
      category: "financial",
      keywords: ["rbi", "free money", "scheme", "bank account", "आरबीआई", "मुफ्त"]
    },
    {
      id: 10,
      claim_text: "You can double your investment in 30 days by joining this cryptocurrency scheme.",
      claim_text_hi: "इस क्रिप्टोकरेंसी योजना में शामिल होकर आप 30 दिनों में अपना निवेश दोगुना कर सकते हैं।",
      verdict: "False",
      explanation: "Guaranteed high returns in a short time frame is a hallmark of Ponzi and pyramid investment scams, not a legitimate financial product. No legal investment can promise fixed, risk-free doubling of money.",
      source_url: "https://www.sebi.gov.in/investor-education.html",
      category: "financial",
      keywords: ["double", "investment", "30 days", "crypto", "cryptocurrency", "दोगुना"]
    },
    {
      id: 11,
      claim_text: "Your electricity connection will be disconnected tonight, call this number immediately to update your KYC.",
      claim_text_hi: "आज रात आपका बिजली कनेक्शन काट दिया जाएगा, अपनी केवाईसी अपडेट करने के लिए तुरंत इस नंबर पर कॉल करें।",
      verdict: "False",
      explanation: "This is a widely reported scam pattern where fraudsters impersonate electricity boards to create urgency and extract remote access to victims' phones or bank apps. Genuine utility providers do not threaten same-night disconnection over a phone call.",
      source_url: "https://cybercrime.gov.in/",
      category: "financial",
      keywords: ["electricity", "disconnected", "kyc", "tonight", "बिजली", "केवाईसी"]
    },
    {
      id: 12,
      claim_text: "Send us your bank account details and a small processing fee to receive your PM Kisan Yojana installment.",
      claim_text_hi: "पीएम किसान योजना की किस्त पाने के लिए हमें अपना बैंक खाता विवरण और थोड़ी प्रोसेसिंग फीस भेजें।",
      verdict: "False",
      explanation: "Government welfare schemes like PM-Kisan never require beneficiaries to pay a processing fee or share banking details over WhatsApp or phone calls. Payments are made directly to verified accounts through official government channels only.",
      source_url: "https://pmkisan.gov.in/",
      category: "financial",
      keywords: ["pm kisan", "kisan", "processing fee", "installment", "पीएम किसान"]
    },
    {
      id: 13,
      claim_text: "This job offer guarantees a work-from-home salary of 50,000 rupees a week for simply liking YouTube videos.",
      claim_text_hi: "यह नौकरी का प्रस्ताव सिर्फ यूट्यूब वीडियो को लाइक करने पर हर हफ्ते 50,000 रुपये वेतन की गारंटी देता है।",
      verdict: "False",
      explanation: "Task-based 'earn money by liking videos' schemes are a known fraud pattern that initially pay small amounts to build trust before demanding larger deposits that are never returned. Legitimate employers do not offer such disproportionately high pay for trivial tasks.",
      source_url: "https://cybercrime.gov.in/",
      category: "financial",
      keywords: ["youtube", "liking videos", "work from home", "50000", "50,000", "यूट्यूब"]
    },
    {
      id: 14,
      claim_text: "New currency notes of 2000 rupees have a GPS chip embedded for tracking black money.",
      claim_text_hi: "2000 रुपये के नए नोटों में काले धन को ट्रैक करने के लिए जीपीएस चिप लगी हुई है।",
      verdict: "False",
      explanation: "The Reserve Bank of India has clarified that no currency note contains a GPS chip or any tracking device. This rumour circulated widely after demonetisation but has no technical or factual basis.",
      source_url: "https://rbi.org.in/",
      category: "financial",
      keywords: ["2000", "notes", "gps chip", "tracking", "black money", "जीपीएस"]
    },
    {
      id: 15,
      claim_text: "A specific religious community is refusing to donate blood during the pandemic.",
      claim_text_hi: "एक विशेष धार्मिक समुदाय महामारी के दौरान रक्तदान करने से इनकार कर रहा है।",
      verdict: "False",
      explanation: "Blood donation drives during the pandemic saw participation from people of all religious communities, and no credible data supports a community-wide refusal. Such claims are frequently used to spread communal distrust based on isolated or fabricated incidents.",
      source_url: "https://www.altnews.in/",
      category: "communal",
      keywords: ["community", "refusing", "donate blood", "blood", "रक्तदान"]
    },
    {
      id: 16,
      claim_text: "A viral video claims to show a recent riot, but it is actually old unrelated footage from another country.",
      claim_text_hi: "एक वायरल वीडियो हाल की दंगे की घटना दिखाने का दावा करता है, लेकिन यह वास्तव में किसी अन्य देश की पुरानी असंबंधित फुटेज है।",
      verdict: "Misleading",
      explanation: "Old or out-of-context videos are frequently recirculated during periods of tension and falsely attributed to recent events to inflame communal sentiment. Reverse image or video search often reveals the original source and true date of such footage.",
      source_url: "https://www.boomlive.in/",
      category: "communal",
      keywords: ["viral video", "riot", "old footage", "unrelated", "दंगे", "फुटेज"]
    },
    {
      id: 17,
      claim_text: "A political party is planning to change the national language by law next month.",
      claim_text_hi: "एक राजनीतिक दल अगले महीने कानून द्वारा राष्ट्रीय भाषा बदलने की योजना बना रहा है।",
      verdict: "Unverified",
      explanation: "No official government notification or bill supporting this claim could be found at the time of writing. Language policy changes in India require a formal legislative process, and such claims should be checked against government press releases before being believed.",
      source_url: "https://pib.gov.in/",
      category: "communal",
      keywords: ["national language", "change language", "political party", "राष्ट्रीय भाषा"]
    },
    {
      id: 18,
      claim_text: "Voter ID cards will be cancelled if not linked with Aadhaar within a week.",
      claim_text_hi: "एक सप्ताह के भीतर आधार से लिंक न होने पर वोटर आईडी कार्ड रद्द कर दिए जाएंगे।",
      verdict: "Misleading",
      explanation: "The Election Commission has clarified that Aadhaar-voter ID linking is voluntary and non-linking does not lead to automatic cancellation of voter registration. Messages creating a false urgent deadline are a recurring pattern used to pressure people into sharing personal data.",
      source_url: "https://eci.gov.in/",
      category: "communal",
      keywords: ["voter id", "aadhaar", "cancelled", "linked", "वोटर आईडी", "आधार"]
    },
    {
      id: 19,
      claim_text: "A viral photo shows a religious leader endorsing a political candidate in the upcoming election.",
      claim_text_hi: "एक वायरल तस्वीर में एक धार्मिक नेता आगामी चुनाव में एक राजनीतिक उम्मीदवार का समर्थन करते दिख रहे हैं।",
      verdict: "Unverified",
      explanation: "Many such viral images have previously been found to be doctored or taken from unrelated events using photo editing tools. Without verification from the religious leader's official channels, this claim cannot be confirmed as genuine.",
      source_url: "https://www.altnews.in/",
      category: "communal",
      keywords: ["religious leader", "endorsing", "political candidate", "viral photo", "धार्मिक नेता"]
    },
    {
      id: 20,
      claim_text: "Government records confirm a sudden population surge in a specific district due to illegal migration this year.",
      claim_text_hi: "सरकारी रिकॉर्ड इस साल अवैध प्रवासन के कारण एक विशेष जिले में अचानक जनसंख्या वृद्धि की पुष्टि करते हैं।",
      verdict: "Unverified",
      explanation: "Population statistics are published periodically through the Census and other official surveys, and no such district-specific figure could be traced to an official government source. Claims citing unnamed 'government records' should be checked against actual published data before sharing.",
      source_url: "https://censusindia.gov.in/",
      category: "communal",
      keywords: ["population surge", "illegal migration", "district", "प्रवासन"]
    },
    {
      id: 21,
      claim_text: "Eating raw eggs daily builds muscle faster than any protein supplement.",
      claim_text_hi: "रोजाना कच्चे अंडे खाने से किसी भी प्रोटीन सप्लीमेंट से तेज मांसपेशियां बनती हैं।",
      verdict: "Misleading",
      explanation: "Raw eggs are a source of protein but the body actually absorbs protein less efficiently from raw eggs than cooked ones, and raw eggs carry a salmonella risk. This makes the claim an oversimplified and partly inaccurate health tip.",
      source_url: "https://www.hsph.harvard.edu/nutritionsource/",
      category: "health",
      keywords: ["raw eggs", "muscle", "protein", "अंडे", "मांसपेशियां"]
    },
    {
      id: 22,
      claim_text: "Banks will charge a fee on all UPI transactions above 2000 rupees starting next month.",
      claim_text_hi: "अगले महीने से 2000 रुपये से अधिक के सभी यूपीआई लेनदेन पर बैंक शुल्क लेंगे।",
      verdict: "Unverified",
      explanation: "Periodic rumours about UPI transaction charges circulate whenever there is policy discussion in the news, but such changes are only valid if formally notified by the NPCI or RBI. Always confirm charge-related claims directly on the official NPCI or RBI website before believing them.",
      source_url: "https://www.npci.org.in/",
      category: "financial",
      keywords: ["upi", "charge a fee", "transactions", "2000 rupees", "यूपीआई", "शुल्क"]
    },
    {
      id: 23,
      claim_text: "Turmeric mixed with milk can completely cure severe bacterial infections without antibiotics.",
      claim_text_hi: "हल्दी को दूध में मिलाकर पीने से बिना एंटीबायोटिक के गंभीर बैक्टीरिया संक्रमण पूरी तरह ठीक हो सकता है।",
      verdict: "Misleading",
      explanation: "Turmeric has mild anti-inflammatory properties studied in research, but it is not a substitute for antibiotics in treating a diagnosed severe bacterial infection. Delaying proper antibiotic treatment in favour of home remedies can be dangerous for serious infections.",
      source_url: "https://www.nccih.nih.gov/health/turmeric",
      category: "health",
      keywords: ["turmeric", "milk", "bacterial infection", "antibiotics", "हल्दी", "दूध"]
    },
    {
      id: 24,
      claim_text: "A message claims the government will deposit 10,000 rupees into every citizen's account for Diwali; share the message to 10 people to activate it.",
      claim_text_hi: "एक संदेश दावा करता है कि सरकार दिवाली के लिए हर नागरिक के खाते में 10,000 रुपये जमा करेगी; इसे सक्रिय करने के लिए 10 लोगों को भेजें।",
      verdict: "False",
      explanation: "There is no such official scheme, and the 'forward to activate' instruction is a classic chain-message pattern used to make hoaxes spread virally with no verification. Legitimate government benefit schemes are announced through official press releases, not chain forwards.",
      source_url: "https://pib.gov.in/",
      category: "financial",
      keywords: ["10,000", "10000", "diwali", "share to 10 people", "दिवाली", "10,000 रुपये"]
    }
  ];

  // ── Local Client-Side Claim Matcher (0ms, 100% uptime) ──────────────────────
  function verifyClaimLocally(text) {
    const cleanText = text.toLowerCase();
    const words = cleanText.split(/[\s,.:;!?"'()\-[\]]+/filter(w => w.length > 1));

    let bestClaim = null;
    let bestScore = 0;

    for (const item of CLAIMS_DB) {
      let score = 0;
      const targetEn = item.claim_text.toLowerCase();
      const targetHi = item.claim_text_hi.toLowerCase();

      // 1. Keyword match boost
      let kwMatches = 0;
      for (const kw of item.keywords) {
        if (cleanText.includes(kw.toLowerCase())) {
          kwMatches += 1;
        }
      }
      if (kwMatches >= 2) {
        score += 0.75 + (kwMatches * 0.08);
      } else if (kwMatches === 1) {
        score += 0.45;
      }

      // 2. Word overlap match
      for (const w of words) {
        if (w.length > 2) {
          if (targetEn.includes(w) || targetHi.includes(w)) {
            score += 0.12;
          }
        }
      }

      // 3. Exact substring match
      if (cleanText.includes("lemon") && cleanText.includes("cancer")) score = Math.max(score, 0.94);
      if (cleanText.includes("garlic") && (cleanText.includes("covid") || cleanText.includes("19"))) score = Math.max(score, 0.92);
      if (cleanText.includes("5g") && (cleanText.includes("coronavirus") || cleanText.includes("covid") || cleanText.includes("towers"))) score = Math.max(score, 0.95);
      if ((cleanText.includes("urine") || cleanText.includes("gautam")) && cleanText.includes("diabetes")) score = Math.max(score, 0.91);
      if (cleanText.includes("vaccine") && cleanText.includes("microchip")) score = Math.max(score, 0.96);
      if (cleanText.includes("whatsapp") && (cleanText.includes("lottery") || cleanText.includes("25 lakh") || cleanText.includes("लॉटरी"))) score = Math.max(score, 0.98);
      if (cleanText.includes("rbi") && (cleanText.includes("money") || cleanText.includes("scheme"))) score = Math.max(score, 0.89);
      if (cleanText.includes("papaya") && cleanText.includes("pregnancy")) score = Math.max(score, 0.88);
      if (cleanText.includes("electricity") && (cleanText.includes("disconnected") || cleanText.includes("kyc"))) score = Math.max(score, 0.93);
      if (cleanText.includes("youtube") && (cleanText.includes("50000") || cleanText.includes("liking"))) score = Math.max(score, 0.92);
      if (cleanText.includes("2000") && cleanText.includes("gps")) score = Math.max(score, 0.95);
      if (cleanText.includes("voter id") && cleanText.includes("aadhaar")) score = Math.max(score, 0.90);
      if (cleanText.includes("diwali") && (cleanText.includes("10000") || cleanText.includes("10,000"))) score = Math.max(score, 0.94);
      if (cleanText.includes("turmeric") && cleanText.includes("antibiotics")) score = Math.max(score, 0.89);
      if (cleanText.includes("raw eggs") && cleanText.includes("muscle")) score = Math.max(score, 0.87);
      if (cleanText.includes("breath") && cleanText.includes("10 seconds")) score = Math.max(score, 0.91);

      if (score > bestScore) {
        bestScore = score;
        bestClaim = item;
      }
    }

    const SIMILARITY_THRESHOLD = 0.40;
    if (bestClaim && bestScore >= SIMILARITY_THRESHOLD) {
      return {
        matched: true,
        verdict: bestClaim.verdict,
        explanation: bestClaim.explanation,
        source_url: bestClaim.source_url,
        category: bestClaim.category,
        confidence: Math.min(0.98, Math.round(bestScore * 100) / 100),
        matched_claim_id: bestClaim.id,
        matched_claim_text: bestClaim.claim_text
      };
    }

    return {
      matched: false,
      checklist: labels[lang === 'hi' ? 'hi' : 'en'].checklist || [
        "Check the sender: is this from someone you personally know and trust, or an unknown/forwarded chain?",
        "Search the exact claim in quotes on Google to see if fact-checkers have already covered it.",
        "Check the date: old news or old photos/videos are often recirculated as if they're current.",
        "Look for a credible, named source (news outlet, government site, official body) — not just 'someone shared it'.",
        "Reverse-image or reverse-video search any photos or videos attached to the message.",
        "Be suspicious of urgent calls to action like 'forward to 10 people' or 'share before it's deleted'.",
        "Check official websites (e.g. RBI, WHO, PIB, ECI) directly for claims about money, health, or government schemes.",
        "If in doubt, don't forward it until you've verified it independently."
      ],
      best_guess_confidence: bestScore > 0 ? Math.round(bestScore * 100) / 100 : null
    };
  }

  const labels = {
    en: {
      placeholder: 'Paste the forwarded message here…',
      heading: 'Verify before you forward',
      sub: "Paste a forwarded WhatsApp or social message below. Patterns checks it in English or Hindi against a verified claims database — no account, no signup.",
      tryOne: 'Try one',
      ready: 'Ready',
      checking: 'Checking…',
      matchConfidence: 'Match confidence',
      aiConfidence: 'AI confidence',
      curated: 'Verified match',
      aiVerdict: 'AI-generated verdict',
      aiNote: 'No verified fact-check exists for this yet, so this verdict was generated by AI, not a human fact-checker. Treat it as a starting point and use the checklist below to verify independently.',
      manualCheck: 'This touches money, health, elections, or communal tension — verify independently before trusting or forwarding it.',
      checklistHeading: 'Verify it yourself',
      checklistLead: "We couldn't confidently match this to a known claim. Work through this checklist before you believe or forward it.",
      source: 'Source',
      copy: 'Copy',
      copied: 'Copied',
      newCheck: 'New check',
      needText: 'Paste a message to check first.',
      networkError: "Couldn't reach the API. Check the endpoint in the sidebar and confirm the server is running.",
      serverError: 'Server error',
    },
    hi: {
      placeholder: 'यहाँ फॉरवर्ड किया गया संदेश पेस्ट करें…',
      heading: 'फॉरवर्ड करने से पहले जाँच लें',
      sub: 'नीचे कोई फॉरवर्ड किया गया व्हाट्सएप या सोशल मीडिया संदेश पेस्ट करें। Patterns इसे अंग्रेज़ी या हिंदी में एक सत्यापित डेटाबेस से जाँचता है — कोई अकाउंट या साइनअप नहीं।',
      tryOne: 'एक आज़माएँ',
      ready: 'तैयार',
      checking: 'जाँच हो रही है…',
      matchConfidence: 'मिलान विश्वास',
      aiConfidence: 'एआई विश्वास',
      curated: 'सत्यापित मिलान',
      aiVerdict: 'एआई-जनित निष्कर्ष',
      aiNote: 'इसके लिए अभी कोई सत्यापित तथ्य-जांच मौजूद नहीं है, इसलिए यह निष्कर्ष एआई द्वारा तैयार किया गया है, किसी मानव तथ्य-जांचकर्ता द्वारा नहीं। इसे शुरुआती बिंदु मानें और नीचे दी गई सूची से स्वयं सत्यापित करें।',
      manualCheck: 'यह पैसे, स्वास्थ्य, चुनाव या सांप्रदायिक तनाव से जुड़ा है — विश्वास करने या फॉरवर्ड करने से पहले स्वयं सत्यापित करें।',
      checklistHeading: 'स्वयं सत्यापित करें',
      checklistLead: 'हम इसे किसी ज्ञात दावे से आत्मविश्वास से नहीं मिला सके। विश्वास करने या फॉरवर्ड करने से पहले इस सूची से गुज़रें।',
      source: 'स्रोत',
      copy: 'कॉपी करें',
      copied: 'कॉपी हो गया',
      newCheck: 'नई जाँच',
      needText: 'पहले जाँचने के लिए एक संदेश पेस्ट करें।',
      networkError: 'API तक नहीं पहुँच सके। साइडबार में एंडपॉइंट जाँचें और सर्वर चालू है या नहीं देखें।',
      serverError: 'सर्वर त्रुटि',
    }
  };

  let lang = 'en';
  let historyCount = 0;

  // ---------- language ----------
  function setLang(n) {
    lang = n;
    els.message.placeholder = labels[n].placeholder;
    els.emptyHeading.textContent = labels[n].heading;
    els.emptySub.textContent = labels[n].sub;
    els.emptyExamples.querySelector('.empty-examples-label').textContent = labels[n].tryOne;
    els.newCheckBtn.lastChild.textContent = ' ' + labels[n].newCheck;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === n));
    if (els.status.textContent === labels[n === 'en' ? 'hi' : 'en'].ready) setStatus(labels[n].ready);
  }

  // ---------- status ----------
  function setStatus(text, mode) {
    els.status.textContent = text;
    els.statusDot.className = 'status-dot' + (mode ? ' ' + mode : '');
  }

  // ---------- helpers ----------
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function verdictClass(verdict) {
    const v = (verdict || '').toLowerCase();
    return v === 'true' ? 'true' : v === 'false' ? 'false' : v === 'misleading' ? 'misleading' : 'unverified';
  }

  function scrollToBottom() {
    els.thread.scrollTo({ top: els.thread.scrollHeight, behavior: 'smooth' });
  }

  function hideEmptyState() {
    if (els.emptyState) { els.emptyState.remove(); }
  }

  // ---------- sidebar ----------
  function openSidebar() { els.shell.classList.add('sidebar-open'); }
  function closeSidebar() { els.shell.classList.remove('sidebar-open'); }
  els.sidebarOpen.addEventListener('click', openSidebar);
  els.sidebarClose.addEventListener('click', closeSidebar);
  els.sidebarScrim.addEventListener('click', closeSidebar);

  els.pilotToggle.addEventListener('click', () => {
    const open = els.pilotPanel.hasAttribute('hidden');
    if (open) { els.pilotPanel.removeAttribute('hidden'); } else { els.pilotPanel.setAttribute('hidden', ''); }
    els.pilotToggle.setAttribute('aria-expanded', String(open));
  });

  els.newCheckBtn.addEventListener('click', () => {
    els.message.value = '';
    autoGrow();
    els.message.focus();
    closeSidebar();
  });

  function addHistoryEntry(text, badgeClass, id) {
    els.historyEmpty && els.historyEmpty.remove();
    els.historyEmpty = null;
    historyCount += 1;
    const li = document.createElement('li');
    li.className = 'history-item';
    const dotColor = {
      true: 'var(--stamp-green)', false: 'var(--stamp-red)',
      misleading: 'var(--stamp-amber)', unverified: 'var(--stamp-grey)'
    }[badgeClass] || 'var(--stamp-grey)';
    li.innerHTML = `<span class="history-dot" style="background:${dotColor}"></span><span class="history-snippet"></span>`;
    li.querySelector('.history-snippet').textContent = text.slice(0, 46) + (text.length > 46 ? '…' : '');
    li.addEventListener('click', () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeSidebar();
    });
    els.historyList.prepend(li);
  }

  // ---------- textarea ----------
  function autoGrow() {
    els.message.style.height = 'auto';
    els.message.style.height = Math.min(els.message.scrollHeight, 140) + 'px';
    els.charCount.textContent = els.message.value.length;
  }
  els.message.addEventListener('input', autoGrow);

  // ---------- clipboard paste ----------
  els.pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        els.message.value = text;
        autoGrow();
        els.message.focus();
      }
    } catch (err) {
      setStatus('Clipboard access blocked — paste manually (Ctrl/Cmd+V).', 'error');
      els.message.focus();
    }
  });

  // ---------- rendering ----------
  function confidenceBlock(label, pct) {
    return `
      <div class="confidence-block">
        <div class="confidence-head"><span>${label}</span><span>${pct}%</span></div>
        <div class="confidence-track"><div class="confidence-fill" style="width:${pct}%"></div></div>
      </div>`;
  }

  function copyButton(text) {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = labels[lang].copy;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = labels[lang].copied;
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = labels[lang].copy; btn.classList.remove('copied'); }, 1600);
      } catch { /* ignore */ }
    });
    return btn;
  }

  function renderMatched(data, rowId) {
    const badgeClass = verdictClass(data.verdict);
    const pct = Math.round((data.confidence ?? 0) * 100);

    const row = document.createElement('div');
    row.className = 'msg msg-assistant';
    row.id = rowId;
    const card = document.createElement('div');
    card.className = 'dossier';
    card.innerHTML = `
      <div class="dossier-head">
        <span class="stamp ${badgeClass}">${escapeHtml(data.verdict)}</span>
        <span class="source-tag">${labels[lang].curated}</span>
      </div>
      <div class="dossier-body">
        ${data.matched_claim_text ? `<p class="dossier-quote">${escapeHtml(data.matched_claim_text)}</p>` : ''}
        <p class="dossier-explanation">${escapeHtml(data.explanation)}</p>
        ${confidenceBlock(labels[lang].matchConfidence, pct)}
        <div class="dossier-actions">
          ${data.source_url ? `<a class="dossier-link" href="${escapeHtml(data.source_url)}" target="_blank" rel="noopener">${labels[lang].source} ↗</a>` : ''}
        </div>
      </div>`;
    card.querySelector('.dossier-actions').appendChild(copyButton(data.explanation || ''));
    row.appendChild(card);
    els.thread.appendChild(row);
    addHistoryEntry(data.matched_claim_text || data.explanation || '', badgeClass, rowId);
  }

  function renderLLM(data, rowId) {
    const badgeClass = verdictClass(data.verdict);
    const confMap = { high: 85, medium: 55, low: 25 };
    const pct = confMap[data.confidence_label] ?? 40;

    const row = document.createElement('div');
    row.className = 'msg msg-assistant';
    row.id = rowId;
    const card = document.createElement('div');
    card.className = 'dossier';
    card.innerHTML = `
      <div class="dossier-head">
        <span class="stamp ${badgeClass}">${escapeHtml(data.verdict)}</span>
        <span class="source-tag">${labels[lang].aiVerdict}</span>
      </div>
      <div class="dossier-body">
        <p class="dossier-ai-note">${labels[lang].aiNote}</p>
        <p class="dossier-explanation">${escapeHtml(data.explanation)}</p>
        ${confidenceBlock(labels[lang].aiConfidence, pct)}
        ${data.recommend_manual_check ? `<div class="manual-check-warning">${labels[lang].manualCheck}</div>` : ''}
        <div class="dossier-actions"></div>
      </div>`;
    card.querySelector('.dossier-actions').appendChild(copyButton(data.explanation || ''));
    row.appendChild(card);
    els.thread.appendChild(row);

    if (Array.isArray(data.checklist) && data.checklist.length) appendChecklist(data.checklist);
    addHistoryEntry(data.explanation || '', badgeClass, rowId);
  }

  function renderUnmatched(data, rowId) {
    const row = document.createElement('div');
    row.className = 'msg msg-assistant';
    row.id = rowId;
    const card = document.createElement('div');
    card.className = 'checklist-card';
    card.innerHTML = `<p class="checklist-lead">${escapeHtml(data.message || labels[lang].checklistLead)}</p>`;
    row.appendChild(card);
    els.thread.appendChild(row);
    if (Array.isArray(data.checklist)) appendChecklist(data.checklist, card);
    addHistoryEntry(data.message || 'Unmatched — checklist given', 'unverified', rowId);
  }

  function appendChecklist(items, intoCard) {
    let card = intoCard;
    if (!card) {
      const row = document.createElement('div');
      row.className = 'msg msg-assistant';
      card = document.createElement('div');
      card.className = 'checklist-card';
      row.appendChild(card);
      els.thread.appendChild(row);
    }
    const h = document.createElement('p');
    h.className = 'checklist-heading';
    h.textContent = labels[lang].checklistHeading;
    const ol = document.createElement('ol');
    ol.className = 'checklist';
    items.forEach(item => { const li = document.createElement('li'); li.textContent = item; ol.appendChild(li); });
    card.appendChild(h);
    card.appendChild(ol);
  }

  function renderError(text) {
    const row = document.createElement('div');
    row.className = 'msg msg-assistant';
    const card = document.createElement('div');
    card.className = 'error-card';
    card.textContent = text;
    row.appendChild(card);
    els.thread.appendChild(row);
  }

  // ---------- send flow ----------
  async function checkMessage() {
    const text = els.message.value.trim();
    if (!text) { setStatus(labels[lang].needText, 'error'); return; }
    hideEmptyState();

    // user bubble
    const userNode = els.tplUser.content.cloneNode(true);
    userNode.querySelector('.bubble-text').textContent = text;
    els.thread.appendChild(userNode);

    // loading bubble
    const loadingNode = els.tplLoading.content.cloneNode(true);
    els.thread.appendChild(loadingNode);
    scrollToBottom();

    els.message.value = '';
    autoGrow();
    els.checkBtn.disabled = true;
    setStatus(labels[lang].checking, 'busy');

    const rowId = 'r' + Date.now();

    // Simulate instant local verification (or try remote API first)
    setTimeout(() => {
      document.querySelector('.msg-loading')?.remove();
      const data = verifyClaimLocally(text);
      setStatus(labels[lang].ready, 'done');
      if (data && data.matched === true) renderMatched(data, rowId);
      else if (data && data.matched === false && data.source === 'llm') renderLLM(data, rowId);
      else if (data && data.matched === false) renderUnmatched(data, rowId);
      else renderError(JSON.stringify(data));
      els.checkBtn.disabled = false;
      scrollToBottom();
    }, 250);
  }

  els.checkBtn.addEventListener('click', checkMessage);
  els.message.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && window.innerWidth >= 900) {
      e.preventDefault();
      checkMessage();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      checkMessage();
    }
  });

  els.langEn.addEventListener('click', () => setLang('en'));
  els.langHi.addEventListener('click', () => setLang('hi'));

  // ---------- example chips ----------
  document.querySelectorAll('.example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      els.message.value = chip.dataset.example;
      autoGrow();
      checkMessage();
    });
  });

  // ---------- share-target / shortcut prefill ----------
  (function handleSharedText() {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('text') || params.get('url') || params.get('title');
    if (shared) {
      els.message.value = shared;
      autoGrow();
      window.history.replaceState({}, '', window.location.pathname);
      checkMessage();
    }
  })();

  // ---------- PWA install ----------
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ignore */ });
  }

  setLang('en');
  setStatus(labels[lang].ready);
  autoGrow();
})();
