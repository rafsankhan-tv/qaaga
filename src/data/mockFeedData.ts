import { FeedPost, UserFollow, FeedBannerSlide } from '../types';

export const INITIAL_FEED_BANNER_SLIDES: FeedBannerSlide[] = [
  {
    id: 'feed-slide-1',
    titleBangla: 'কমিউনিটি লাইভ ফিড ও ফলোয়ার নেটওয়ার্ক',
    subtitleBangla: 'আপনি যাদের ফলো করেছেন তাদের সব নতুন স্বাস্থ্য পরামর্শ, সার্ভিস ডিসকাউন্ট, হোটেল প্যাকেজ ও চাকরির বিজ্ঞপ্তি সবার আগে সরাসরি এখানে দেখতে পাবেন।',
    badgeBangla: '🌟 লাইভ কমিউনিটি হাব',
    highlightTextBangla: '১০০% ভেরিফাইড প্রফেশনাল',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#2e1065] via-[#4e20b8] to-[#1e1b4b]',
    accentColor: '#fbbf24',
    ctaTextBangla: '+ নতুন পোস্ট / আপডেট দিন',
    targetView: 'create_post',
    secondaryCtaTextBangla: 'জনপ্রিয় প্রফেশনাল এক্সপ্লোর',
    secondaryTargetView: 'feed_explore',
    isPublished: true,
    order: 1,
    themeTag: 'community'
  },
  {
    id: 'feed-slide-2',
    titleBangla: 'অভিজ্ঞ স্পেশালিস্ট ডাক্তারদের স্বাস্থ্য বুলেটিন',
    subtitleBangla: 'বিএমডিসি ভেরিফাইড কার্ডিওলজিস্ট, মেডিসিন ও শিশু বিশেষজ্ঞদের সরাসরি পরামর্শ পড়ুন এবং চেম্বার সিরিয়াল বুকিং করুন মাত্র ১ ক্লিকে।',
    badgeBangla: '🩺 স্বাস্থ্য সচেতনতা ও সেবা',
    highlightTextBangla: 'লাইভ সিরিয়াল ওপেন',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#064e3b] via-[#047857] to-[#022c22]',
    accentColor: '#34d399',
    ctaTextBangla: 'ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং',
    targetView: 'doctors',
    secondaryCtaTextBangla: 'স্বাস্থ্য পরামর্শ পোস্টসমূহ',
    secondaryTargetView: 'feed_health',
    isPublished: true,
    order: 2,
    themeTag: 'health'
  },
  {
    id: 'feed-slide-3',
    titleBangla: 'জরুরি হোম সার্ভিস ও এসি রিপেয়ার সুপার ডিলস',
    subtitleBangla: 'প্রশিক্ষিত সার্টিফাইড টেকনিশিয়ানদের দ্বারা হোম সার্ভিস, এসি মাস্টার ওয়াশ ও ইলেকট্রিক্যাল মেরামতে উপভোগ করুন সর্বোচ্চ ২০% ক্যাশব্যাক।',
    badgeBangla: '⚡ ভেরিফাইড টেকনিশিয়ান',
    highlightTextBangla: '২০% ফ্ল্যাশ ছাড় চলমান',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#7c2d12] via-[#ea580c] to-[#431407]',
    accentColor: '#fdba74',
    ctaTextBangla: 'সার্ভিস রিকোয়েস্ট পাঠান',
    targetView: 'service_request',
    secondaryCtaTextBangla: 'টেকনিশিয়ান প্রোফাইল দেখুন',
    secondaryTargetView: 'feed_repair',
    isPublished: true,
    order: 3,
    themeTag: 'service'
  },
  {
    id: 'feed-slide-4',
    titleBangla: 'মনসুন রিসোর্ট ও ৫-স্টার হোটেল বুকিং অফার',
    subtitleBangla: 'কক্সবাজার, সিলেট ও সাজেক ভ্যালির সেরা রিসোর্টগুলোর বিশেষ রুম প্যাকেজ ও কাপল স্পেশাল ডিসকাউন্ট সীমিত সময়ের জন্য।',
    badgeBangla: '🏖️ ট্রাভেল ও স্টে ভ্যাকেশন',
    highlightTextBangla: '২৫% প্রিমিয়াম অফার',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#0c4a6e] via-[#0284c7] to-[#082f49]',
    accentColor: '#38bdf8',
    ctaTextBangla: 'হোটেল ও রিসোর্ট বুক করুন',
    targetView: 'hotels',
    secondaryCtaTextBangla: 'হোটেল নোটিস ও প্যাকেজ',
    secondaryTargetView: 'feed_hotel',
    isPublished: true,
    order: 4,
    themeTag: 'hotel'
  },
  {
    id: 'feed-slide-5',
    titleBangla: 'প্রফেশনাল ক্যারিয়ার ও নতুন চাকরির বিজ্ঞপ্তি',
    subtitleBangla: 'আইটি, স্বাস্থ্যসেবা, হোটেল ম্যানেজমেন্ট ও কর্পোরেট সেক্টরের শত শত ভেরিফাইড জব সার্কুলারে সরাসরি আবেদন করুন।',
    badgeBangla: '💼 রিক্রুটমেন্ট হাব',
    highlightTextBangla: '৫০+ নতুন ভ্যাকেন্সি',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#1e1b4b] via-[#3730a3] to-[#0f172a]',
    accentColor: '#a78bfa',
    ctaTextBangla: 'চাকরির সার্কুলার দেখুন',
    targetView: 'jobs',
    secondaryCtaTextBangla: 'জব পোস্ট অ্যালার্ট',
    secondaryTargetView: 'feed_jobs',
    isPublished: true,
    order: 5,
    themeTag: 'jobs'
  }
];

export const SEED_FOLLOWS: UserFollow[] = [
  {
    id: 'follow-1',
    followerId: 'user-admin',
    targetId: 'doc-1',
    targetName: 'ডাঃ ফাহমিদা সুলতানা',
    targetAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80',
    targetRole: 'DOCTOR',
    targetBadge: 'বিএমডিসি ভেরিফাইড',
    targetCategory: 'মেডিসিন ও কার্ডিওলজি',
    targetRating: 4.9,
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'follow-2',
    followerId: 'user-admin',
    targetId: 'user-provider-1',
    targetName: 'মোঃ কামরুল হাসান',
    targetAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    targetRole: 'PROVIDER',
    targetBadge: 'সার্টিফাইড এসি স্পেশালিস্ট',
    targetCategory: 'এসি ও ইলেকট্রিক্যাল',
    targetRating: 4.95,
    createdAt: '2026-08-05T12:00:00Z'
  },
  {
    id: 'follow-3',
    followerId: 'user-admin',
    targetId: 'hotel-1',
    targetName: 'সি পার্ল বিচ রিসোর্ট অ্যান্ড স্পা',
    targetAvatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&h=200&q=80',
    targetRole: 'HOTEL_MANAGER',
    targetBadge: '৫-স্টার লাক্সারি রিসোর্ট',
    targetCategory: 'হোটেল ও রিসোর্ট',
    targetRating: 4.9,
    createdAt: '2026-08-10T14:30:00Z'
  },
  {
    id: 'follow-4',
    followerId: 'user-admin',
    targetId: 'user-seller-1',
    targetName: 'GadgetZone BD',
    targetAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
    targetRole: 'SELLER',
    targetBadge: 'অথরাইজড ডিলার',
    targetCategory: 'টুলস ও হোম গ্যাজেট',
    targetRating: 4.92,
    createdAt: '2026-08-12T09:15:00Z'
  }
];

export const SEED_FEED_POSTS: FeedPost[] = [
  {
    id: 'feed-post-1',
    authorId: 'doc-1',
    authorName: 'ডাঃ ফাহমিদা সুলতানা',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'DOCTOR',
    authorBadge: 'বিএমডিসি ভেরিফাইড (মেডিসিন ও কার্ডিওলজি)',
    authorRating: 4.9,
    authorDistrict: 'Dhaka',
    authorThana: 'Dhanmondi',
    postType: 'HEALTH_TIP',
    title: '❤️ হার্টের সুস্থতায় বর্ষা ও ভ্যাপসা গরমে করণীয় স্বাস্থ্য পরামর্শ',
    content: 'আসসালামু আলাইকুম। ভ্যাপসা গরমে হঠাৎ রক্তচাপ ওঠানামা এবং পানিশূন্যতার সমস্যা দেখা দিতে পারে। বিশেষ করে হাইপারটেনশন বা হৃদরোগে আক্রান্ত রোগীদের জন্য কিছু জরুরি পরামর্শ:\n\n১. প্রতিদিন পর্যাপ্ত কুসুম গরম বা স্বাভাবিক তাপমাত্রার পানি পান করুন (লবণাক্ত খাবার এড়িয়ে চলুন)।\n২. নিয়মিত ব্লাড প্রেশার মেপে চার্টে লিখে রাখুন।\n৩. অতিরিক্ত তেল-মশলাযুক্ত খাবার পরিহার করুন এবং সকালে বা বিকেলে হালকা হাঁটাহাঁটি করুন।\n\nআগামীকাল থেকে স্কয়ার হাসপাতাল চেম্বারে সকাল ১০টা থেকে দুপুর ২টা পর্যন্ত কনসালটেশন পাওয়া যাবে। সরাসরি অ্যাপয়েন্টমেন্ট বুকিং করতে নিচের বাটনে ক্লিক করুন।',
    images: [
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['HealthTips', 'Cardiology', 'DoctorAppointment', 'DhakaHealth'],
    categoryKey: 'doctor',
    likesCount: 142,
    likedBy: ['user-admin', 'user-customer-1'],
    comments: [
      {
        id: 'comment-1',
        postId: 'feed-post-1',
        userId: 'user-customer-1',
        userName: 'Tahsin Ahmed',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
        userRole: 'CUSTOMER',
        text: 'অনেক ধন্যবাদ ম্যাডাম। বাবার জন্য একটি সিরিয়াল বুকিং করলাম।',
        createdAt: '2026-08-25T08:30:00Z'
      },
      {
        id: 'comment-2',
        postId: 'feed-post-1',
        userId: 'user-admin',
        userName: 'Rafsan Khan',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
        userRole: 'SUPER_ADMIN',
        text: 'চমৎকার ও সময়োপযোগী স্বাস্থ্য সচেতনতা বার্তা! 🙏',
        createdAt: '2026-08-25T09:15:00Z'
      }
    ],
    sharesCount: 28,
    isPinned: true,
    actionCta: {
      label: 'অ্যাপয়েন্টমেন্ট বুক করুন (৳১,০০০)',
      targetView: 'doctors',
      targetParams: { doctorId: 'doc-1' },
      priceOrDiscount: '৳১,০০০ ফিক্সড ফি',
      badge: 'ইনস্ট্যান্ট স্লট কনফার্মেশন'
    },
    createdAt: '2026-08-25T07:30:00Z',
    updatedAt: '2026-08-25T07:30:00Z'
  },
  {
    id: 'feed-post-2',
    authorId: 'user-provider-1',
    authorName: 'মোঃ কামরুল হাসান',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'PROVIDER',
    authorBadge: 'সার্টিফাইড এসি ও রেফ্রিজারেশন ইঞ্জিনিয়ার (৪.৯৫ ★)',
    authorRating: 4.95,
    authorDistrict: 'Dhaka',
    authorThana: 'Mirpur',
    postType: 'OFFER',
    title: '❄️ গরমের স্পেশাল জেট-ওয়াশ এসি সার্ভিসিং ও গ্যাস চার্জ অফার (২০% ছাড়)',
    content: 'গ্রাহক ভাই ও বোনেরা, গরমের মৌসুমে এসি ওভারহিট হয়ে কুলিং কমে যাওয়া রোধে নিয়মিত জেট-ওয়াশ সার্ভিসিং অত্যন্ত জরুরি।\n\nআমরা অত্যাধুনিক ওয়াটার প্রেশার জেট দিয়ে ইনডোর ও আউটডোর ইউনিটের শতভাগ ময়লা পরিষ্কার এবং মাস্টার কেমিক্যাল ওয়াশ দিচ্ছি। সাথে রয়েছে ৩০ দিনের কুলিং গ্যারান্টি!\n\n🔹 ইনডোর + আউটডোর জেট ওয়াশ: ৳৮০০ (পূর্বে ৳১,০০০)\n🔹 ১০০% অরিজিনাল R410A / R32 গ্যাস টপ-আপ: ৳১,৫০০ থেকে শুরু\n\nঢাকা সিটির যেকোনো প্রান্তে আমাদের টিম ৩০ মিনিটে পৌঁছাবে।',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['ACService', 'HomeService', 'RepairDhaka', 'KamrulTechnician'],
    categoryKey: 'repair',
    likesCount: 96,
    likedBy: ['user-admin'],
    comments: [
      {
        id: 'comment-3',
        postId: 'feed-post-2',
        userId: 'user-admin',
        userName: 'Rafsan Khan',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
        userRole: 'SUPER_ADMIN',
        text: 'কামরুল ভাইয়ের কাজের কোয়ালিটি সত্যিই চমৎকার।',
        createdAt: '2026-08-25T09:45:00Z'
      }
    ],
    sharesCount: 19,
    actionCta: {
      label: 'এসি সার্ভিস রিকোয়েস্ট পাঠান',
      targetView: 'service_request',
      targetParams: { categoryId: 'cat-ac-repair', providerId: 'prov-1' },
      priceOrDiscount: '২০% ডিসকাউন্ট চলছে',
      badge: '৩০ দিনের সার্ভিস ওয়ারেন্টি'
    },
    createdAt: '2026-08-25T06:10:00Z',
    updatedAt: '2026-08-25T06:10:00Z'
  },
  {
    id: 'feed-post-3',
    authorId: 'hotel-1',
    authorName: 'সি পার্ল বিচ রিসোর্ট অ্যান্ড স্পা',
    authorAvatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'HOTEL_MANAGER',
    authorBadge: '৫-স্টার ইন্টারন্যাশনাল রিসোর্ট (কক্সবাজার ইনানী বিচ)',
    authorRating: 4.9,
    authorDistrict: 'Coxs Bazar',
    authorThana: 'Ukhia',
    postType: 'HOTEL_DEAL',
    title: '🌊 সি-ভিউ ডিলাক্স রুমে ২৫% স্পেশাল মনসুন ভ্যাকেশন ডিসকাউন্ট!',
    content: 'সমুদ্রের গর্জন এবং ঢেউয়ের মায়াবী দৃশ্য উপভোগ করতে চলে আসুন কক্সবাজারের সেরা ইনানী বিচে অবস্থিত Sea Pearl Beach Resort-এ।\n\nআমাদের বিশেষ অফারে থাকছে:\n✨ সি-ভিউ প্রিমিয়াম ডিলাক্স রুম\n🍳 ২ জনের কমপ্লিমেন্টারি বাফেট ব্রেকফাস্ট\n🏊‍♀️ ইনফিনিটি সুইমিং পুল ও প্রাইভেট বিচ অ্যাক্সেস\n💆 স্পা সার্ভিসে ২০% ছাড়\n\nসীমিত সময়ের অফার। এখনই বুকিং করুন ২০% অগ্রিম পেমেন্টে।',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['CoxsBazar', 'HotelDeal', 'SeaPearl', 'VacationBD'],
    categoryKey: 'hotel',
    likesCount: 215,
    likedBy: ['user-admin'],
    comments: [
      {
        id: 'comment-4',
        postId: 'feed-post-3',
        userId: 'user-customer-1',
        userName: 'Tahsin Ahmed',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
        userRole: 'CUSTOMER',
        text: 'সরাসরি হোটেল বুকিং করা যায় নাকি অগ্রিম দিতে হবে?',
        createdAt: '2026-08-25T10:00:00Z'
      }
    ],
    sharesCount: 45,
    actionCta: {
      label: 'রুম বুকিং করুন (৳৭,৫০০/রাত)',
      targetView: 'hotels',
      targetParams: { hotelId: 'hotel-1' },
      priceOrDiscount: '২৫% অফার রেট',
      badge: 'ফ্রি ব্রেকফাস্ট ও সুইমিং পুল'
    },
    createdAt: '2026-08-24T18:00:00Z',
    updatedAt: '2026-08-24T18:00:00Z'
  },
  {
    id: 'feed-post-4',
    authorId: 'user-seller-1',
    authorName: 'GadgetZone BD',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'SELLER',
    authorBadge: 'অফিসিয়াল গ্যাজেট ও টুলস ভেরিফাইড সেলার',
    authorRating: 4.92,
    authorDistrict: 'Dhaka',
    authorThana: 'Motijheel',
    postType: 'OFFER',
    title: '⚡ নতুন স্টক এরাইভাল: Bosch অরিজিনাল কর্ডলেস ড্রিল ও টুলকিট সেট',
    content: 'বাড়ি ও অফিস মেরামতের জন্য প্রফেশনাল হেভি ডিউটি Bosch 18V Cordless Drill & Screwdriver Kit এখন আমাদের কাছে পাচ্ছেন ১০০% জেনুইন অফিসিয়াল ওয়ারেন্টিসহ।\n\nঅর্ডার করলেই থাকছে:\n📦 সারা বাংলাদেশে ২-৩ দিনে হোম ডেলিভারি\n💳 ক্যাশ অন ডেলিভারির সুবিধা\n🛡️ ১ বছরের অফিসিয়াল রিপ্লেসমেন্ট গ্যারান্টি\n\nঅর্ডার করতে বা স্পেসিফিকেশন দেখতে নিচের লিঙ্কে ক্লিক করুন।',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['BoschTools', 'PowerTools', 'GadgetZone', 'ShoppingBD'],
    categoryKey: 'products',
    likesCount: 88,
    likedBy: [],
    comments: [],
    sharesCount: 14,
    actionCta: {
      label: 'প্রোডাক্ট দেখুন ও কিনুন (৳৪,৫০০)',
      targetView: 'products',
      targetParams: { productId: 'prod-1' },
      priceOrDiscount: '৳৪,৫০০ (৳৫,২০০)',
      badge: '১ বছর ওয়ারেন্টি'
    },
    createdAt: '2026-08-24T14:20:00Z',
    updatedAt: '2026-08-24T14:20:00Z'
  },
  {
    id: 'feed-post-5',
    authorId: 'user-admin',
    authorName: 'Rafsan Khan',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'SUPER_ADMIN',
    authorBadge: 'Qaaga.com প্রতিষ্ঠাতা ও অ্যাডমিন',
    authorRating: 5.0,
    authorDistrict: 'Dhaka',
    authorThana: 'Gulshan',
    postType: 'UPDATE',
    title: '🚀 Qaaga.com-এ লাইভ ফিড ও ফলোয়ার সিস্টেম চালু হলো!',
    content: 'প্রিয় সম্মানিত গ্রাহক ও সার্ভিস পার্টনারবৃন্দ,\n\nআমরা অত্যন্ত আনন্দের সাথে জানাচ্ছি যে qaaga.com প্ল্যাটফর্মে আজ নতুন "কমিউনিটি ফিড ও প্রোফাইল ফলোয়ার" ফিচার যুক্ত করা হয়েছে।\n\n🌟 এখন থেকে আপনি:\n১. পছন্দের ডাক্তার, দক্ষ টেকনিশিয়ান, টপ রেটেড হোটেল বা ভেরিফাইড সেলারদের ফলো করে রাখতে পারবেন।\n২. আপনার "Following" ট্যাবে তারা যখনই কোনো স্বাস্থ্য টিপস, নতুন সার্ভিস অফার, ডিসকাউন্ট বা জব পোস্ট করবেন সাথে সাথে দেখতে পাবেন।\n৩. সরাসরি ফিড পোস্ট থেকেই ১-ক্লিকে অ্যাপয়েন্টমেন্ট বা সার্ভিস বুকিং করতে পারবেন!\n\nসবাই ফিডটি এক্সপ্লোর করুন এবং আপনার মূল্যবান মতামত জানান। ধন্যবাদ!',
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['PlatformUpdate', 'NewFeature', 'CommunityFeed', 'QaagaOfficial'],
    categoryKey: 'general',
    likesCount: 320,
    likedBy: ['user-admin', 'user-customer-1'],
    comments: [
      {
        id: 'comment-5',
        postId: 'feed-post-5',
        userId: 'doc-1',
        userName: 'ডাঃ ফাহমিদা সুলতানা',
        userAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&h=100&q=80',
        userRole: 'DOCTOR',
        text: 'অসাধারণ উদ্যোগ! এখন রোগীদের সাথে স্বাস্থ্য বার্তা ও চেম্বার শিডিউল শেয়ার করা অনেক সহজ হবে।',
        createdAt: '2026-08-25T11:00:00Z'
      },
      {
        id: 'comment-6',
        postId: 'feed-post-5',
        userId: 'user-provider-1',
        userName: 'মোঃ কামরুল হাসান',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
        userRole: 'PROVIDER',
        text: 'খুবই সুন্দর একটি সিস্টেম হয়েছে। আমাদের কাজের আপডেট সরাসরি কাস্টমাররা দেখতে পাবেন। 👍',
        createdAt: '2026-08-25T11:20:00Z'
      }
    ],
    sharesCount: 76,
    isPinned: true,
    actionCta: {
      label: 'নতুন সার্ভিস রিকোয়েস্ট তৈরি করুন',
      targetView: 'service_request',
      badge: '১০০% নিরাপদ এসক্রো পেমেন্ট'
    },
    createdAt: '2026-08-25T12:00:00Z',
    updatedAt: '2026-08-25T12:00:00Z'
  },
  {
    id: 'feed-post-6',
    authorId: 'recruiter-1',
    authorName: 'TechCorp BD Solutions',
    authorAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'RECRUITER',
    authorBadge: 'ভেরিফাইড কর্পোরেট রিক্রুটার',
    authorRating: 4.8,
    authorDistrict: 'Dhaka',
    authorThana: 'Banani',
    postType: 'JOB_ALERT',
    title: '💼 সিনিয়র ফুল-স্ট্যাক রিয়্যাক্ট ও নোড ডেভেলপার আবশ্যক (হাইব্রিড)',
    content: 'আমাদের বনানী অফিসে অবিলম্বে একজন অভিজ্ঞ Senior Full-Stack Engineer (React, TypeScript, Node.js) আবশ্যক।\n\n📌 বেতন স্কেল: ৳৮০,০০০ - ৳১,২০,০০০ (যোগ্যতানুযায়ী)\n📌 অভিজ্ঞতা: ৩+ বছর\n📌 সুবিধা: বছরে ২ বোনাস, প্রভিডেন্ট ফান্ড, হেলথ ইন্স্যুরেন্স ও উইকেন্ড অফ।\n\nআবেদন করার শেষ সময়: ১৫ই সেপ্টেম্বর। সরাসরি সিভি জমা দিতে নিচের বাটনে ক্লিক করুন।',
    images: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['TechJobs', 'HiringDhaka', 'ReactDeveloper', 'FullStackJobs'],
    categoryKey: 'jobs',
    likesCount: 110,
    likedBy: [],
    comments: [],
    sharesCount: 32,
    actionCta: {
      label: 'চাকরির বিস্তারিত দেখুন ও আবেদন করুন',
      targetView: 'jobs',
      targetParams: { jobId: 'job-1' },
      priceOrDiscount: '৳৮০,০০০ - ৳১,২০,০০০',
      badge: 'সরাসরি এইচআর ইন্টারভিউ'
    },
    createdAt: '2026-08-24T10:00:00Z',
    updatedAt: '2026-08-24T10:00:00Z'
  }
];

export const SUGGESTED_PROFILES_TO_FOLLOW = [
  {
    id: 'doc-1',
    name: 'ডাঃ ফাহমিদা সুলতানা',
    role: 'DOCTOR',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    badge: 'বিএমডিসি ভেরিফাইড (মেডিসিন ও কার্ডিওলজি)',
    category: 'মেডিসিন ও কার্ডিওলজি',
    district: 'ঢাকা (ধানমন্ডি)',
    rating: 4.9,
    reviewCount: 180,
    followersCount: 342,
    bio: 'এমবিবিএস, এফসিপিএস (মেডিসিন)। স্কয়ার হাসপাতাল ও ধানমন্ডি চেম্বার। হৃদরোগ ও মেডিসিন বিশেষজ্ঞ।',
    targetView: 'doctors',
    targetParams: { doctorId: 'doc-1' }
  },
  {
    id: 'user-provider-1',
    name: 'মোঃ কামরুল হাসান',
    role: 'PROVIDER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    badge: 'সার্টিফাইড এসি ও ইলেকট্রিক্যাল স্পেশালিস্ট',
    category: 'এসি ও ইলেকট্রিক্যাল রিপেয়ার',
    district: 'ঢাকা (মিরপুর, উত্তরা, গুলশান)',
    rating: 4.95,
    reviewCount: 128,
    followersCount: 290,
    bio: '১২ বছরের অভিজ্ঞ সার্টিফাইড টেকনিশিয়ান। স্প্লিট, ইনভার্টার এসি ও পাওয়ার লোড সমাধান বিশেষজ্ঞ।',
    targetView: 'service_request',
    targetParams: { categoryId: 'cat-ac-repair', providerId: 'prov-1' }
  },
  {
    id: 'hotel-1',
    name: 'সি পার্ল বিচ রিসোর্ট অ্যান্ড স্পা',
    role: 'HOTEL_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    badge: '৫-স্টার লাক্সারি বিচ রিসোর্ট',
    category: 'হোটেল ও ট্রাভেল',
    district: 'কক্সবাজার (ইনানী বিচ)',
    rating: 4.9,
    reviewCount: 420,
    followersCount: 780,
    bio: 'কক্সবাজার ইনানী বিচের সবচেয়ে বড় ৫-স্টার লাক্সারি রিসোর্ট। আন্তর্জাতিক মানসম্মত আতিথেয়তা ও সুইমিং পুল।',
    targetView: 'hotels',
    targetParams: { hotelId: 'hotel-1' }
  },
  {
    id: 'user-seller-1',
    name: 'GadgetZone BD',
    role: 'SELLER',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    badge: 'অথরাইজড ডিলার ও ভেরিফাইড সেলার',
    category: 'টুলস ও গ্যাজেট শপ',
    district: 'ঢাকা (মতিঝিল ও সারা বাংলাদেশ)',
    rating: 4.92,
    reviewCount: 310,
    followersCount: 512,
    bio: 'Bosch, DeWalt এবং প্রিমিয়াম হোম রিপেয়ার টুলস ও গ্যাজেটের অথরাইজড ডিলার।',
    targetView: 'products',
    targetParams: {}
  },
  {
    id: 'doc-2',
    name: 'ডাঃ তানভীর আহমেদ',
    role: 'DOCTOR',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    badge: 'বিএমডিসি ভেরিফাইড (অর্থোপেডিক সার্জন)',
    category: 'অর্থোপেডিক ও ট্রমা কেয়ার',
    district: 'ঢাকা (উত্তরা)',
    rating: 4.88,
    reviewCount: 95,
    followersCount: 215,
    bio: 'হাড়জোড়, বাত-ব্যথা ও স্পাইনাল কেয়ার স্পেশালিস্ট। উত্তরা আধুনিক হাসপাতাল।',
    targetView: 'doctors',
    targetParams: { doctorId: 'doc-2' }
  }
];
