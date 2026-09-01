import type { BlogPost } from '../types/index.ts';

export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'ইনভার্টার বনাম নন-ইনভার্টার এসি: বিদ্যুৎ বিল বাঁচাতে কোনটি কিনবেন?',
    slug: 'inverter-vs-non-inverter-ac-buying-guide',
    excerpt: 'গ্রীষ্মের গরমে এসি কেনার আগে ইনভার্টার প্রযুক্তির সুবিধা, বিদ্যুতের মাসিক খরচ এবং টেকসই ব্র্যান্ড বাছাইয়ের প্র্যাকটিক্যাল গাইডলাইন।',
    content: `গরমের মৌসুমে বাংলাদেশে বাসা ও অফিসের জন্য সঠিক এয়ার কন্ডিশনার (AC) নির্বাচন করা অত্যন্ত গুরুত্বপূর্ণ একটি সিদ্ধান্ত। বাজারে মূলত দুই ধরনের এসি পাওয়া যায়: ইনভার্টার এবং নন-ইনভার্টার।

### ইনভার্টার এসি কীভাবে কাজ করে?
ইনভার্টার এসির কম্প্রেশার সবসময় অন বা অফ হয় না। ঘরের তাপমাত্রা কাঙ্ক্ষিত মাত্রায় পৌঁছানোর পর কম্প্রেশারের গতি স্বয়ংক্রিয়ভাবে কমে যায় এবং ধীরগতিতে ঘরকে ঠান্ডা রাখে। ফলে কম্প্রেশার বারবার স্টার্ট নিতে অতিরিক্ত বিদ্যুৎ টানে না।

### বিদ্যুৎ বিলের পার্থক্য:
- **নন-ইনভার্টার এসি:** দৈনিক ৮ ঘণ্টা চালালে মাসিক বিদ্যুৎ বিল প্রায় ৩,৫০০ - ৫,০০০ টাকা পর্যন্ত আসতে পারে।
- **ইনভার্টার এসি:** সঠিকভাবে ৩-স্টার বা ৫-স্টার ইনভার্টার চালালে বিদ্যুৎ সাশ্রয় হয় প্রায় ৪০% থেকে ৬০%, ফলে বিল আসে ১,৮০০ - ২,৮০০ টাকার মধ্যে।

### কোন পরিস্থিতিতে কোনটি কিনবেন?
1. আপনি যদি দিনে ৬ ঘণ্টার বেশি এসি চালান, তবে অবশ্যই ইনভার্টার এসি কেনা লাভজনক।
2. মাঝেমধ্যে বা গেস্ট রুমের জন্য নন-ইনভার্টার এসি বাজেট-বান্ধব বিকল্প হতে পারে।
3. নিয়মিত ৩-৪ মাস অন্তর কয়েল জেট ওয়াশ ও ফিল্টার পরিষ্কার রাখলে এসির স্থায়িত্ব ১০-১৫ বছর পর্যন্ত বৃদ্ধি পায়।`,
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    authorName: 'Engr. Kamrul Hasan',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'Chief HVAC Specialist',
    category: 'Home Appliances & Repair',
    tags: ['AC Servicing', 'Energy Saving', 'Buying Guide', 'Smart Home'],
    readTimeMinutes: 5,
    likesCount: 342,
    viewsCount: 2890,
    publishedAt: '2026-08-20T10:00:00Z',
    featured: true,
    relatedCategoryKey: 'repair'
  },
  {
    id: 'blog-2',
    title: 'ব্যবহৃত ল্যাপটপ বা ম্যাকবুক কেনার আগে যে ৫টি হার্ডওয়্যার টেস্ট অবশ্যই করবেন',
    slug: 'used-laptop-macbook-hardware-checklist-guide',
    excerpt: 'সেকেন্ড হ্যান্ড গ্যাজেট কিনতে গিয়ে প্রতারণা এড়াতে ব্যাটারি সাইকেল, ডিসপ্লে প্যানেল, থার্মাল পেস্ট ও এসএসডি হেলথ চেক করার গোপন ট্রিকস।',
    content: `ব্যবহৃত বা প্রি-ওউনড ল্যাপটপ কেনার সময় বাহ্যিক বডি দেখে আসল কন্ডিশন বোঝা সম্ভব নয়। প্রতারণা থেকে বাঁচতে নিচের ৫টি প্রফেশনাল টেস্ট নিজে করুন:

### ১. ব্যাটারি হেলথ ও সাইকেল কাউন্ট
ম্যাকবুকে 'System Report > Power' এ গিয়ে Cycle Count দেখুন (৩০০ এর নিচে থাকলে চমৎকার)। উইন্ডোজে \`powercfg /batteryreport\` কমান্ড দিয়ে ব্যাটারি ডিজাইন ক্যাপাসিটি বনাম ফুল চার্জ ক্যাপাসিটি মিলিয়ে নিন।

### ২. ক্রিস্টালডিস্কইনফো (SSD Health Check)
এসএসডি বা এনভিএমই ড্রাইভের মোট রিড/রাইট সাইকেল এবং হেলথ স্টেটাস ৯৫% এর উপরে থাকা নিরাপদ। ব্যাড সেক্টর থাকলে দ্রুত এড়িয়ে চলুন।

### ৩. ডিসপ্লে ডেড পিক্সেল ও ব্যাকলাইট ব্লিডিং
ফুলস্ক্রিনে পুরোপুরি কালো ও পুরোপুরি সাদা ব্যাকগ্রাউন্ড ওপেন করে কোণায় কোনো আলো ছড়াচ্ছে কি না (Light Bleed) বা কোনো কালার পিক্সেল আটকে আছে কি না পরখ করুন।

### ৪. হিটিং ও ফ্যান স্ট্রেস টেস্ট
FurMark বা Cinebench ৩-৫ মিনিট রান করে দেখুন ল্যাপটপ মাত্রাতিরিক্ত গরম হচ্ছে কি না বা থার্মাল থ্রোটলিং করছে কি না।

### ৫. qaaga.com এসক্রো ইন্সপেকশন
QAAGA প্ল্যাটফর্মের মাধ্যমে সেকেন্ড হ্যান্ড ল্যাপটপ বুক করলে আমাদের এক্সপার্ট ইঞ্জিনিয়ার সরাসরি ডিভাইসের সম্পূর্ণ ফিজিক্যাল ও ইন্টারনাল ডায়াগনস্টিক রিপোর্ট প্রদান করে।`,
    coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    authorName: 'Shafiqul Islam',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'Hardware & Tech Reviewer',
    category: 'Gadgets & Computing',
    tags: ['Laptop', 'MacBook', 'Second Hand', 'Hardware Test'],
    readTimeMinutes: 6,
    likesCount: 520,
    viewsCount: 4120,
    publishedAt: '2026-08-18T14:30:00Z',
    featured: true,
    relatedCategoryKey: 'products'
  },
  {
    id: 'blog-3',
    title: 'রিমোট জব ও আন্তর্জাতিক ক্লায়েন্ট পাওয়ার সেরা ই-বুক ও রোডম্যাপ',
    slug: 'remote-work-freelance-career-growth-handbook',
    excerpt: 'বাংলাদেশ থেকে ইউএসএ ও ইউরোপের রিমোট কোম্পানিতে ফুল-টাইম সফটওয়্যার, ডিজাইন ও ডিজিটাল মার্কেটিং ক্যারিয়ার গড়ার বাস্তবসম্মত কৌশল।',
    content: `গ্লোবাল রিমোট জবের বাজার এখন যেকোনো সময়ের চেয়ে উন্মুক্ত। কীভাবে নিজের প্রোফাইল আন্তর্জাতিক মানে তৈরি করবেন?

### পোর্টফোলিও ফার্স্ট স্ট্র্যাটেজি
আন্তর্জাতিক ক্লায়েন্টরা কোনো সিভি দেখে সিদ্ধান্ত নেয় না, তারা আপনার লাইভ প্রজেক্ট এবং কেস স্টাডি দেখতে চায়। গিটহাব, ড্রিবল এবং নিজস্ব কাস্টম ডোমেইন ওয়েবসাইট রাখুন।

### কমিউনিকেশন ও টাইম জোন ম্যানেজমেন্ট
রিমোট কাজে এসিনক্রোনাস (Asynchronous) কমিউনিকেশন দক্ষতা সবচেয়ে দামি। স্পষ্ট ও সংক্ষেপে কাজের অগ্রগতি রিপোর্ট করা শিখুন।

### পেমেন্ট ও ট্যাক্স লিগ্যাল প্রসেসিং
Wise, Payoneer এবং বাংলাদেশ ব্যাংকের রেমিট্যান্স ইনসেন্টিভ সুবিধার মাধ্যমে সরাসরি ব্যাংক অ্যাকাউন্টে পেমেন্ট আনা এখন ১০০% নিরাপদ। আমাদের 'The Ultimate Freelance Masterclass' ই-বুকে সম্পূর্ণ এ টু জেড রোডম্যাপ দেওয়া রয়েছে।`,
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
    authorName: 'Zubair Hossain',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'Remote Career Mentor',
    category: 'Career & Digital eBooks',
    tags: ['Freelancing', 'Remote Jobs', 'eBooks', 'Career Growth'],
    readTimeMinutes: 4,
    likesCount: 289,
    viewsCount: 1950,
    publishedAt: '2026-08-12T09:15:00Z',
    featured: false,
    relatedCategoryKey: 'ebooks'
  },
  {
    id: 'blog-4',
    title: 'বাসার ফ্রিজ ভালো রাখার সহজ ৭টি রুলস ও কম্প্রেসার সেফটি',
    slug: 'refrigerator-maintenance-and-gas-leak-prevention',
    excerpt: 'ফ্রিজের অতিরিক্ত বরফ জমা, কুলিং কমে যাওয়া এবং কম্প্রেসার নষ্ট হওয়া রোধে প্র্যাকটিক্যাল রক্ষণাবেক্ষণ টিপস।',
    content: `একটি ভালো রেফ্রিজারেটর বা ডিপ ফ্রিজ বহু বছর পর্যন্ত নির্ঝঞ্ঝাট সেবা দিতে পারে যদি কিছু নিয়ম মেনে চলা হয়:

1. **দেয়াল থেকে দূরত্ব:** ফ্রিজের পেছনের কনডেন্সার কয়েল থেকে দেয়ালের মাঝে অন্তত ৪-৬ ইঞ্চি ফাঁকা রাখুন যাতে বাতাস চলাচল করতে পারে।
2. **দরজার গ্যাসকেট রাবার পরিষ্কার:** গ্যাসকেটে ময়লা জমলে ঠান্ডা বাতাস বের হয়ে যায় এবং কম্প্রেশার টানা চলতে থাকে।
3. **গরম খাবার ফ্রিজে না রাখা:** খাবার রুম টেম্পারেচারে আসার পর ফ্রিজে ঢুকান।
4. **ভোল্টেজ স্ট্যাবিলাইজার ব্যবহার:** লো-ভোল্টেজ বা ফ্লাকচুয়েশনে কম্প্রেসার যাতে পুড়ে না যায় সেজন্য ডিজিটাল স্ট্যাবিলাইজার ব্যবহার করুন।`,
    coverImage: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80',
    authorName: 'Engr. Tanvir Ahmed',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    authorRole: 'Senior Electrical Engineer',
    category: 'Home Appliances & Repair',
    tags: ['Fridge Maintenance', 'DIY Tips', 'Electrical Safety'],
    readTimeMinutes: 4,
    likesCount: 198,
    viewsCount: 1540,
    publishedAt: '2026-08-05T11:00:00Z',
    featured: false,
    relatedCategoryKey: 'repair'
  }
];
