export type Language = 'en' | 'hi' | 'te';

export const translations = {
  en: {
    appName: 'MedGuide AI',
    tagline: 'Care in your language',
    eyebrow: 'YOUR RURAL HEALTH COMPANION',
    introTitle: 'Accessible health intelligence for every community.',
    introSubtitle: 'A student-led primary healthcare platform bridging language, literacy, and access barriers in rural India.',
    
    // Slide titles & details
    slide1Title: 'Understand Your Health',
    slide1Desc: 'Express your health concerns in your preferred language to receive safe, preliminary health guidance.',
    
    slide2Title: 'Understand Prescriptions',
    slide2Desc: 'Scan doctor prescriptions to organize medicines, dosages, and schedules with assisted OCR.',
    
    slide3Title: 'Keep Your Health Records Together',
    slide3Desc: 'Access your health records, timeline, prescriptions, and follow-ups in one secure place.',
    
    slide4Title: 'Care in Your Language',
    slide4Desc: 'Speak or type naturally in English, हिन्दी, or తెలుగు with voice-enabled accessibility.',

    // Audio Guide
    audioGuideBtn: '🔊 Audio Guide',
    audioGuidePlaying: 'Playing audio explanation...',
    audioGuideStop: '⏹ Stop Audio',
    audioIntro: 'Welcome to MedGuide AI. We provide preliminary healthcare guidance in your own language. You can speak your symptoms, read prescriptions, and keep health records. Tap Get Started to create a free account, or Sign In.',
    audioSignIn: 'Sign In screen. Enter your email or username and password, then tap Sign In. Tap Audio Guide anytime for spoken assistance.',
    audioRegister: 'Registration screen. Enter your nickname, username, password, choose your language, and agree to the research demonstration terms.',
    audioPermissions: 'Permissions screen. We request microphone access for voice questions, camera access for prescriptions, and consent for safe health records.',
    audioTimeline: 'Health timeline screen. Shows past consultations, prescription uploads, and care milestones chronologically.',
    audioConsent: 'Data consent settings. Control how speech and AI models assist you with complete privacy.',
    audioChat: 'AI Health Companion. Type your symptoms or press the microphone button to speak in your language.',

    next: 'Next',
    skip: 'Skip',
    getStarted: 'Get started · Create account',
    signInBtn: 'Sign In',
    registerBtn: 'Create Account',
    alreadyHaveAccount: 'Already have an account? Sign in',
    dontHaveAccount: 'Need an account? Register',
    signOut: 'Sign Out',
    save: 'Save Changes',
    back: 'Back',
    emergencyDisclaimer: 'MedGuide AI provides preliminary guidance and does not replace doctors. For emergencies, visit your nearest hospital immediately.',

    // Sign in / Sign up
    welcomeBack: 'Welcome Back',
    signInPrompt: 'Access your health timeline and companion.',
    identifierLabel: 'Email or Username',
    identifierPlaceholder: 'Enter identifier',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter password',
    displayNameLabel: 'Display Name / Nickname',
    displayNamePlaceholder: 'Your name',
    preferredLangLabel: 'Choose Language',
    agreeTerms: 'I agree to health research data processing for this demonstration.',

    // Permissions
    permissionsTitle: 'Privacy & Device Access',
    permissionsSubtitle: 'MedGuide AI only requests permissions necessary for care support.',
    micPermissionTitle: 'Microphone Access',
    micPermissionDesc: 'Required to speak your health concerns in your native language.',
    cameraPermissionTitle: 'Camera & Document Access',
    cameraPermissionDesc: 'Used to take photos of paper prescriptions for OCR extraction.',
    consentPermissionTitle: 'AI Health Processing Consent',
    consentPermissionDesc: 'Allows grounded AI assistance and structured timeline storage with zero commercial advertising.',
    grantContinue: 'Save & Continue to Care',

    // Profile & Settings
    profileTitle: 'Patient Profile',
    profileSubtitle: 'Your confidential care details and language preferences.',
    patientId: 'Patient ID',
    roleLabel: 'Account Role',
    clinicContactTitle: 'Local Health Contact',
    clinicContactDesc: 'Community Health Centre / ASHA Volunteer: Grounded rural care support.',
    futureScopeTitle: 'Future Research Scope (Roadmap)',
    futureScopePayments: '💳 Payment Systems & Subsidy Schemes: Designated Future Scope (MedGuide is non-commercial).',
    futureScopeSmartwatch: '⌚ Smartwatch & Wearable BP/Step Tracking: Designated Future Scope (IoT medical device sync).',
  },

  hi: {
    appName: 'मेडगाइड एआई',
    tagline: 'आपकी अपनी भाषा में स्वास्थ्य सेवा',
    eyebrow: 'आपका ग्रामीण स्वास्थ्य साथी',
    introTitle: 'हर समुदाय के लिए सुलभ स्वास्थ्य जानकारी।',
    introSubtitle: 'ग्रामीण भारत में भाषा और डिजिटल साक्षरता की बाधाओं को दूर करने वाला डिजिटल स्वास्थ्य मंच।',
    
    slide1Title: 'अपना स्वास्थ्य समझें',
    slide1Desc: 'सुरक्षित प्रारंभिक मार्गदर्शन प्राप्त करने के लिए अपनी पसंदीदा भाषा में स्वास्थ्य संबंधी चिंता व्यक्त करें।',
    
    slide2Title: 'दवा के पर्चे को समझें',
    slide2Desc: 'दवाइयों, खुराक और समय सारणी को व्यवस्थित करने के लिए डॉक्टर के पर्चे को स्कैन करें।',
    
    slide3Title: 'स्वास्थ्य रिकॉर्ड एक साथ रखें',
    slide3Desc: 'अपने स्वास्थ्य रिकॉर्ड, समयरेखा, पर्चे और फॉलो-अप को एक सुरक्षित स्थान पर रखें।',
    
    slide4Title: 'आपकी अपनी भाषा में देखभाल',
    slide4Desc: 'हिंदी, तेलुगु या अंग्रेजी में बोलकर या लिखकर सहजता से स्वास्थ्य संबंधी जानकारी पाएं।',

    // Audio Guide
    audioGuideBtn: '🔊 ऑडियो गाइड',
    audioGuidePlaying: 'ऑडियो मार्गदर्शन बज रहा है...',
    audioGuideStop: '⏹ ऑडियो रोकें',
    audioIntro: 'मेडगाइड एआई में आपका स्वागत है। हम आपकी अपनी भाषा में प्राथमिक स्वास्थ्य मार्गदर्शन प्रदान करते हैं। आप बोलकर सवाल पूछ सकते हैं और पर्चा समझ सकते हैं। नया खाता बनाने के लिए शुरू करें दबाएं।',
    audioSignIn: 'साइन इन स्क्रीन। अपना ईमेल या उपयोगकर्ता नाम और पासवर्ड दर्ज करें और साइन इन दबाएं।',
    audioRegister: 'पंजीकरण स्क्रीन। अपना नाम, उपयोगकर्ता नाम, पासवर्ड दर्ज करें और भाषा चुनें।',
    audioPermissions: 'अनुमतियां स्क्रीन। आवाज़ के लिए माइक और पर्चे के लिए कैमरे की अनुमति आवश्यक है।',
    audioTimeline: 'स्वास्थ्य समयरेखा स्क्रीन। आपके पिछले परामर्श, पर्चे और गतिविधियों को कालक्रमानुसार दिखाती है।',
    audioConsent: 'डेटा सहमति सेटिंग्स। नियंत्रित करें कि भाषण और एआई मॉडल आपकी गोपनीयता के साथ कैसे सहायता करते हैं।',
    audioChat: 'एआई स्वास्थ्य साथी। अपने लक्षण टाइप करें या अपनी भाषा में बोलने के लिए माइक्रोफ़ोन बटन दबाएं।',

    // Common actions
    next: 'आगे बढ़ें',
    skip: 'छोड़ें',
    getStarted: 'शुरू करें · खाता बनाएं',
    signInBtn: 'साइन इन करें',
    registerBtn: 'खाता बनाएं',
    alreadyHaveAccount: 'पहले से खाता है? साइन इन करें',
    dontHaveAccount: 'नया खाता चाहिए? पंजीकरण करें',
    signOut: 'साइन आउट',
    save: 'सहेजें',
    back: 'वापस',
    emergencyDisclaimer: 'मेडगाइड एआई प्रारंभिक मार्गदर्शन देता है और डॉक्टर का विकल्प नहीं है। आपात स्थिति में तुरंत नजदीकी अस्पताल जाएं।',

    // Sign in / Sign up
    welcomeBack: 'वापसी पर स्वागत है',
    signInPrompt: 'अपने स्वास्थ्य साथी और रिकॉर्ड्स तक पहुंचें।',
    identifierLabel: 'ईमेल या यूजरनेम',
    identifierPlaceholder: 'यूजरनेम दर्ज करें',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'पासवर्ड दर्ज करें',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'पासवर्ड दोबारा दर्ज करें',
    displayNameLabel: 'नाम / उपनाम',
    displayNamePlaceholder: 'आपका नाम',
    preferredLangLabel: 'भाषा चुनें',
    agreeTerms: 'मैं इस प्रदर्शन के लिए डेटा प्रसंस्करण से सहमत हूं।',

    // Permissions
    permissionsTitle: 'गोपनीयता और अनुमतियां',
    permissionsSubtitle: 'मेडगाइड केवल स्वास्थ्य सहायता के लिए आवश्यक अनुमतियां मांगता है।',
    micPermissionTitle: 'माइक्रोफ़ोन अनुमति',
    micPermissionDesc: 'अपनी भाषा में स्वास्थ्य संबंधी प्रश्न बोलने के लिए आवश्यक।',
    cameraPermissionTitle: 'कैमरा और दस्तावेज़',
    cameraPermissionDesc: 'दवा के पर्चे की फोटो लेने के लिए आवश्यक।',
    consentPermissionTitle: 'एआई स्वास्थ्य डेटा सहमति',
    consentPermissionDesc: 'बिना किसी व्यावसायिक विज्ञापन के सुरक्षित स्वास्थ्य सहायता के लिए।',
    grantContinue: 'सहेजें और आगे बढ़ें',

    // Profile & Settings
    profileTitle: 'रोगी प्रोफ़ाइल',
    profileSubtitle: 'आपकी गोपनीय स्वास्थ्य जानकारी और भाषा प्राथमिकता।',
    patientId: 'रोगी आईडी',
    roleLabel: 'खाता प्रकार',
    clinicContactTitle: 'स्थानीय स्वास्थ्य संपर्क',
    clinicContactDesc: 'सामुदायिक स्वास्थ्य केंद्र / आशा कार्यकर्ता संपर्क।',
    futureScopeTitle: 'भविष्य का अनुसंधान (रोडमैप)',
    futureScopePayments: '💳 भुगतान और सब्सिडी: भविष्य के अनुसंधान के रूप में नामित (गैर-व्यावसायिक)।',
    futureScopeSmartwatch: '⌚ स्मार्टवॉच और बीपी ट्रैकिंग: भविष्य के अनुसंधान के रूप में नामित (IoT डिवाइस एकीकरण)।',
  },

  te: {
    appName: 'మెడ్‌గైడ్ AI',
    tagline: 'మీ భాషలోనే ఆరోగ్య సంరక్షణ',
    eyebrow: 'మీ గ్రామీణ ఆరోగ్య సహచరుడు',
    introTitle: 'ప్రతి గ్రామానికి ప్రాథమిక ఆరోగ్య సమాచారం.',
    introSubtitle: 'గ్రామీణ ప్రాంతాలలో భాష మరియు అక్షరాస్యత అవరోధాలను తొలగించే డిజిటల్ ఆరోగ్య వేదిక.',
    
    slide1Title: 'మీ ఆరోగ్యాన్ని అర్థం చేసుకోండి',
    slide1Desc: 'సురక్షితమైన ప్రాథమిక మార్గదర్శకత్వం పొందడానికి మీ ప్రాధాన్య భాషలో ఆరోగ్య సమస్యలను వ్యక్తపరచండి.',
    
    slide2Title: 'ప్రిస్క్రిప్షన్లను అర్థం చేసుకోండి',
    slide2Desc: 'మందులు, మోతాదులు మరియు సమయాలను నిర్వహించడానికి డాక్టర్ ప్రిస్క్రిప్షన్‌ను స్కాన్ చేయండి.',
    
    slide3Title: 'ఆరోగ్య రికార్డులను భద్రపరచండి',
    slide3Desc: 'మీ ఆరోగ్య రికార్డులు, కాలక్రమం, ప్రిస్క్రిప్షన్లు మరియు ఫాలో-అప్‌లను ఒకే సురక్షిత ప్రదేశంలో ఉంచండి.',
    
    slide4Title: 'మీ భాషలోనే సంరక్షణ',
    slide4Desc: 'తెలుగు, హిందీ లేదా ఇంగ్లీషులో వాయిస్ లేదా టెక్స్ట్ ద్వారా సులభంగా సంభాషించండి.',

    // Audio Guide
    audioGuideBtn: '🔊 ఆడియో గైడ్',
    audioGuidePlaying: 'ఆడియో వివరణ వినిపిస్తోంది...',
    audioGuideStop: '⏹ ఆడియో ఆపండి',
    audioIntro: 'మెడ్‌గైడ్ AI కి స్వాగతం. మీ సొంత భాషలో ప్రాథమిక ఆరోగ్య సమాచారాన్ని అందిస్తున్నాము. మీరు మాట్లాడి సమస్యలు చెప్పవచ్చు లేదా మందుల చీటీ అర్థం చేసుకోవచ్చు. ప్రారంభించడానికి ఖాతా తెరవండి నొక్కండి.',
    audioSignIn: 'సైన్ ఇన్ పేజీ. మీ యూజర్‌నేమ్ మరియు పాస్‌వర్డ్ ఎంటర్ చేసి సైన్ ఇన్ నొక్కండి. సహాయం కోసం ఆడియో గైడ్ ఉపయోగించండి.',
    audioRegister: 'రిజిస్ట్రేషన్ పేజీ. మీ పేరు, వివరాలు, భాష ఎంచుకుని ఖాతా సృష్టించండి.',
    audioPermissions: 'అనుమతుల పేజీ. వాయిస్ కోసం మైక్రోఫోన్ మరియు ప్రిస్క్రిప్షన్ కోసం కెమెరా అనుమతి అవసరం.',
    audioTimeline: 'ఆరోగ్య టైమ్‌లైన్ పేజీ. మీ మునుపటి సంప్రదింపులు, మందుల చీటీలు మరియు ఆరోగ్య వివరాలను క్రమపద్ధతిలో చూపిస్తుంది.',
    audioConsent: 'డేటా అంగీకార సెట్టింగ్‌లు. మీ పూర్తి గోప్యతతో స్పీచ్ మరియు AI నమూనాలు ఎలా సహాయపడాలో నియంత్రించండి.',
    audioChat: 'AI ఆరోగ్య సహచరుడు. మీ లక్షణాలను టైప్ చేయండి లేదా మీ భాషలో మాట్లాడటానికి మైక్రోఫోన్ బటన్ నొక్కండి.',

    // Common actions
    next: 'తరువాత',
    skip: 'దాటవేయి',
    getStarted: 'ప్రారంభించండి · ఖాతా తెరవండి',
    signInBtn: 'సైన్ ఇన్ చేయండి',
    registerBtn: 'ఖాతా సృష్టించండి',
    alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి',
    dontHaveAccount: 'ఖాతా లేదా? నమోదు చేసుకోండి',
    signOut: 'లాగ్ అవుట్',
    save: 'సేవ్ చేయండి',
    back: 'వెనుకకు',
    emergencyDisclaimer: 'మెడ్‌గైడ్ AI ప్రాథమిక సలహాలు మాత్రమే ఇస్తుంది మరియు డాక్టర్ కాదు. అత్యవసర పరిస్థితుల్లో వెంటనే సమీప ఆసుపత్రికి వెళ్ళండి.',

    // Sign in / Sign up
    welcomeBack: 'తిరిగి స్వాగతం',
    signInPrompt: 'మీ ఆరోగ్య సమాచారం మరియు కేర్ ప్రొఫైల్ చూడండి.',
    identifierLabel: 'ఈమెయిల్ లేదా యూజర్‌నేమ్',
    identifierPlaceholder: 'వివరాలు నమోదు చేయండి',
    passwordLabel: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'పాస్‌వర్డ్ నమోదు చేయండి',
    confirmPasswordLabel: 'పాస్‌వర్డ్ నిర్ధారణ',
    confirmPasswordPlaceholder: 'పాస్‌వర్డ్ మళ్ళీ నమోదు చేయండి',
    displayNameLabel: 'పేరు / ముద్దుపేరు',
    displayNamePlaceholder: 'మీ పేరు',
    preferredLangLabel: 'భాష ఎంచుకోండి',
    agreeTerms: 'ఈ పరిశోధన ప్రదర్శన కోసం డేటా ప్రాసెసింగ్‌కు అంగీకరిస్తున్నాను.',

    // Permissions
    permissionsTitle: 'గోప్యత & అనుమతులు',
    permissionsSubtitle: 'ఆరోగ్య సంరక్షణకు అవసరమైన అనుమతులను మాత్రమే మెడ్‌గైడ్ కోరుతుంది.',
    micPermissionTitle: 'మైక్రోఫోన్ అనుమతి',
    micPermissionDesc: 'మీ సమస్యను వాయిస్ ద్వారా మాట్లాడటానికి అవసరం.',
    cameraPermissionTitle: 'కెమెరా & పత్రాల అనుమతి',
    cameraPermissionDesc: 'మందుల చీటీని ఫోటో తీసి పరిశీలించడానికి అవసరం.',
    consentPermissionTitle: 'AI ఆరోగ్య డేటా అంగీకారం',
    consentPermissionDesc: 'ఎటువంటి వాణిజ్య ప్రకటనలు లేకుండా సురక్షిత ఆరోగ్య మద్దతు కోసం.',
    grantContinue: 'సేవ్ చేసి కొనసాగించండి',

    // Profile & Settings
    profileTitle: 'రోగి ప్రొఫైల్',
    profileSubtitle: 'మీ ఆరోగ్య వివరాలు మరియు భాష ప్రాధాన్యతలు.',
    patientId: 'రోగి ఐడీ',
    roleLabel: 'ఖాతా రకం',
    clinicContactTitle: 'స్థానిక ఆరోగ్య కేంద్రం',
    clinicContactDesc: 'ప్రాథమిక ఆరోగ్య కేంద్రం / ఆశా కార్యకర్త సంరక్షణ.',
    futureScopeTitle: 'భవిష్యత్తు పరిశోధన రోడ్‌మ్యాప్',
    futureScopePayments: '💳 చెల్లింపులు & సబ్సిడీ విధానాలు: భవిష్యత్ పరిశోధనగా నిర్ణయించబడింది (లాభాపేక్ష లేనిది).',
    futureScopeSmartwatch: '⌚ స్మార్ట్‌వాచ్ & బీపీ ట్రాకింగ్: భవిష్యత్ పరిశోధనగా నిర్ణయించబడింది (IoT పరికరాల అనుసంధానం).',
  },
};

export function t(key: keyof typeof translations['en'], lang: Language = 'en'): string {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
