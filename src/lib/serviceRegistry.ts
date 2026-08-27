/**
 * QAAGA Super Marketplace — Dynamic Service Registry & Scalability Engine
 * Allows seamless registration of new service modules, categories, workflows,
 * and permissions without breaking any existing features.
 */

export interface ServiceModuleDefinition {
  id: string;
  nameBn: string;
  nameEn: string;
  categoryGroup: 'HOME_REPAIR' | 'HEALTHCARE' | 'HOSPITALITY' | 'EDUCATION' | 'AUTOMOBILE' | 'PROFESSIONAL' | 'EMERGENCY' | 'COMMERCE';
  icon: string;
  descriptionBn: string;
  descriptionEn?: string;
  badgeText?: string;
  isPopular?: boolean;
  isActive: boolean;
  requiresAdvanceDeposit: boolean;
  depositPercentage?: number;
  pricingType: 'FIXED' | 'HOURLY' | 'DAILY' | 'CUSTOM_QUOTE' | 'COMMISSION_BASED';
  targetView: string;
  subCategories?: string[];
  searchKeywords?: string[];
}

export const CORE_SERVICE_MODULES: ServiceModuleDefinition[] = [
  // 1. Home Repair & Technicians
  {
    id: 'ac_servicing',
    nameBn: 'এসি সার্ভিসিং ও রিপেয়ার',
    nameEn: 'AC Repair & Servicing',
    categoryGroup: 'HOME_REPAIR',
    icon: 'AirVent',
    descriptionBn: 'এসি ওয়াশ, গ্যাস রিফিল, লিক মেরামত ও নতুন এসি ইনস্টলেশন',
    isPopular: true,
    isActive: true,
    requiresAdvanceDeposit: true,
    depositPercentage: 20,
    pricingType: 'CUSTOM_QUOTE',
    targetView: 'service_request',
    subCategories: ['এসি ওয়াশ', 'গ্যাস রিফিল', 'মাস্টার সার্ভিসিং', 'ইনস্টলেশন'],
    searchKeywords: ['ac', 'air conditioner', 'gas refill', 'cooling', 'এসি']
  },
  {
    id: 'electrician',
    nameBn: 'ইলেকট্রিশিয়ান ও ওয়্যারিং',
    nameEn: 'Electrician & Wiring',
    categoryGroup: 'HOME_REPAIR',
    icon: 'Zap',
    descriptionBn: 'শর্ট সার্কিট ফিক্স, সুইচ বোর্ড, ফ্যান ও লাইট ফিটিংস',
    isPopular: true,
    isActive: true,
    requiresAdvanceDeposit: true,
    depositPercentage: 20,
    pricingType: 'HOURLY',
    targetView: 'service_request',
    subCategories: ['সুইচবোর্ড', 'সার্কিট ব্রেকার', 'ফ্যান ফিটিংস', 'ওয়্যারিং'],
    searchKeywords: ['electric', 'electrician', 'wiring', 'switch', 'ইলেকট্রিক']
  },
  {
    id: 'plumber',
    nameBn: 'প্লাম্বার ও স্যানিটারি',
    nameEn: 'Plumber & Sanitary',
    categoryGroup: 'HOME_REPAIR',
    icon: 'Wrench',
    descriptionBn: 'পানির মোটর, পাইপ লিক মেরামত, ট্যাপ ও কমোড ফিটিংস',
    isPopular: true,
    isActive: true,
    requiresAdvanceDeposit: true,
    depositPercentage: 20,
    pricingType: 'CUSTOM_QUOTE',
    targetView: 'service_request',
    subCategories: ['মোটর মেরামত', 'পাইপ লিক', 'বেসিন ও কমোড', 'ট্যাপ ফিটিংস'],
    searchKeywords: ['plumber', 'pipe', 'leak', 'sanitary', 'motor', 'প্লাম্বার']
  },
  {
    id: 'fridge_washing',
    nameBn: 'ফ্রিজ ও ওয়াশিং মেশিন',
    nameEn: 'Fridge & Washing Machine',
    categoryGroup: 'HOME_REPAIR',
    icon: 'Flame',
    descriptionBn: 'ডিপ ফ্রিজ গ্যাস চার্জ, কুলিং প্রবলেম ও ওয়াশিং মেশিন সার্ভিস',
    isActive: true,
    requiresAdvanceDeposit: true,
    depositPercentage: 20,
    pricingType: 'CUSTOM_QUOTE',
    targetView: 'service_request',
    subCategories: ['ডিপ ফ্রিজ', 'নরমাল ফ্রিজ', 'অটো ওয়াশিং মেশিন'],
    searchKeywords: ['refrigerator', 'fridge', 'washing machine', 'ফ্রিজ']
  },

  // 2. Healthcare & Caregivers
  {
    id: 'specialist_doctors',
    nameBn: 'স্পেশালিস্ট ডাক্তার সিরিয়াল',
    nameEn: 'Specialist Doctors',
    categoryGroup: 'HEALTHCARE',
    icon: 'Stethoscope',
    descriptionBn: 'মেডিসিন, শিশু, স্ত্রী রোগ, কার্ডিওলজি ও চর্ম বিশেষজ্ঞ ডাক্তারদের চেম্বার সিরিয়াল',
    isPopular: true,
    isActive: true,
    requiresAdvanceDeposit: false,
    pricingType: 'FIXED',
    targetView: 'doctors',
    subCategories: ['মেডিসিন', 'শিশু রোগ', 'স্ত্রী ও প্রসূতি', 'চর্ম ও যৌন', 'কার্ডিওলজি'],
    searchKeywords: ['doctor', 'physician', 'specialist', 'chamber', 'সিরিয়াল', 'ডাক্তার']
  },
  {
    id: 'home_nursing',
    nameBn: 'হোম নার্সিং ও কেয়ারগিভার',
    nameEn: 'Home Nursing & Caregiver',
    categoryGroup: 'HEALTHCARE',
    icon: 'HeartPulse',
    descriptionBn: 'বাসায় রোগী, বয়োবৃদ্ধ ও প্যারালিসিস কেয়ারের জন্য সার্বক্ষণিক প্রশিক্ষিত নার্স',
    isPopular: true,
    isActive: true,
    requiresAdvanceDeposit: true,
    depositPercentage: 15,
    pricingType: 'DAILY',
    targetView: 'nurses',
    subCategories: ['১২ ঘণ্টার শিফট', '২৪ ঘণ্টার শিফট', 'মাসিক কেয়ার প্যাকেজ'],
    searchKeywords: ['nurse', 'caregiver', 'patient', 'elderly', 'নার্স', 'কেয়ার']
  },

  // 3. Hospitality & Travel
  {
    id: 'hotel_booking',
    nameBn: 'হোটেল ও রিসোর্ট বুকিং',
    nameEn: 'Hotels & Travel Resorts',
    categoryGroup: 'HOSPITALITY',
    icon: 'Hotel',
    descriptionBn: 'কক্সবাজার, সাজেক ভ্যালি ও সিলেটের সেরা হোটেল ও রিসোর্টে বিশেষ ছাড়',
    isPopular: true,
    isActive: true,
    requiresAdvanceDeposit: true,
    depositPercentage: 25,
    pricingType: 'DAILY',
    targetView: 'hotels',
    subCategories: ['সি-ভিউ রিসোর্ট', 'ফ্যামিলি স্যুট', 'কাপল ডিলক্স', 'লাক্সারি ভিলা'],
    searchKeywords: ['hotel', 'resort', 'coxs bazar', 'sajek', 'room', 'হোটেল']
  },

  // 4. Products & Marketplace
  {
    id: 'marketplace_shop',
    nameBn: 'মার্কেটপ্লেস পণ্য শপিং',
    nameEn: 'Product Marketplace',
    categoryGroup: 'COMMERCE',
    icon: 'ShoppingBag',
    descriptionBn: 'স্মার্টফোন, গ্যাজেট, হোম অ্যাপ্লায়েন্স সারা দেশে ক্যাশ অন ডেলিভারি',
    isPopular: true,
    isActive: true,
    requiresAdvanceDeposit: false,
    pricingType: 'FIXED',
    targetView: 'products',
    subCategories: ['স্মার্টওয়াচ', 'ইয়ারবাডস', 'মোবাইল এক্সেসরিজ', 'হোম গ্যাজেট'],
    searchKeywords: ['products', 'gadget', 'shop', 'ecommerce', 'shopping', 'পণ্য']
  },
  {
    id: 'used_marketplace',
    nameBn: 'পুরাতন কেনাবেচা বাজার',
    nameEn: 'Used & Secondhand Market',
    categoryGroup: 'COMMERCE',
    icon: 'Tag',
    descriptionBn: 'যাচাইকৃত সেকেন্ডহ্যান্ড মোবাইল, ল্যাপটপ ও হোম অ্যাপ্লায়েন্স নিরাপদ কেনাবেচা',
    isActive: true,
    requiresAdvanceDeposit: false,
    pricingType: 'CUSTOM_QUOTE',
    targetView: 'used_products',
    subCategories: ['ব্যবহৃত ফোন', 'সেকেন্ড ল্যাপটপ', 'বাইক ও এক্সেসরিজ'],
    searchKeywords: ['used', 'secondhand', 'preowned', 'পুরাতন', 'সেকেন্ড হ্যান্ড']
  },
  {
    id: 'digital_ebooks',
    nameBn: 'ডিজিটাল ইবুক ও পিডিএফ লাইব্রেরি',
    nameEn: 'eBooks & Digital Library',
    categoryGroup: 'EDUCATION',
    icon: 'BookOpen',
    descriptionBn: 'ইসলামিক বই, বিসিএস চাকরি প্রস্তুতি ও প্রোগ্রামিং ইবুক সরাসরি ইন-অ্যাপ রিডার',
    isActive: true,
    requiresAdvanceDeposit: false,
    pricingType: 'FIXED',
    targetView: 'ebooks',
    subCategories: ['ইসলামিক বই', 'বিসিএস ও সরকারি চাকরি', 'প্রোগ্রামিং ও ফ্রিল্যান্সিং'],
    searchKeywords: ['ebook', 'pdf', 'books', 'reading', 'ইবুক', 'বই']
  },
  {
    id: 'jobs_portal',
    nameBn: 'জব সার্কুলার ও ক্যারিয়ার',
    nameEn: 'Jobs & Careers Portal',
    categoryGroup: 'PROFESSIONAL',
    icon: 'Briefcase',
    descriptionBn: 'ডেলিভারি রাইডার, হোম সার্ভিস টেকনিশিয়ান ও অফিস নিয়োগ বিজ্ঞপ্তি',
    isActive: true,
    requiresAdvanceDeposit: false,
    pricingType: 'COMMISSION_BASED',
    targetView: 'jobs',
    subCategories: ['ডেলিভারি রাইডার', 'টেকনিশিয়ান নিয়োগ', 'অফিস জব', 'পার্ট টাইম'],
    searchKeywords: ['job', 'career', 'circular', 'hiring', 'চাকরি', 'নিয়োগ']
  },

  // 5. Future Scalability Expansion Modules (Pre-architected for instant activation)
  {
    id: 'emergency_ambulance',
    nameBn: 'ইমার্জেন্সি অ্যাম্বুলেন্স ও অক্সিজেন',
    nameEn: 'Emergency Ambulance & Oxygen',
    categoryGroup: 'EMERGENCY',
    icon: 'Ambulance',
    descriptionBn: '২৪/৭ তাৎক্ষণিক আইসিইউ, ফ্রিজিং ও নরমাল অ্যাম্বুলেন্স সাপোর্ট',
    isActive: false, // Ready to enable anytime
    requiresAdvanceDeposit: false,
    pricingType: 'CUSTOM_QUOTE',
    targetView: 'service_request',
    searchKeywords: ['ambulance', 'emergency', 'oxygen', 'অ্যাম্বুলেন্স']
  },
  {
    id: 'rent_a_car',
    nameBn: 'রেন্ট-এ-কার ও ড্রাইভার সার্ভিস',
    nameEn: 'Rent-A-Car & Drivers',
    categoryGroup: 'AUTOMOBILE',
    icon: 'Car',
    descriptionBn: 'ঢাকা ও আন্তঃজেলা ট্রিপের জন্য সিডান, নোয়া ও হায়েস মাইক্রোবাস ভাড়া',
    isActive: false,
    requiresAdvanceDeposit: true,
    depositPercentage: 20,
    pricingType: 'DAILY',
    targetView: 'service_request',
    searchKeywords: ['rent a car', 'driver', 'microbus', 'গাড়ি ভাড়া']
  },
  {
    id: 'home_tutor',
    nameBn: 'হোম ও অনলাইন টিউটর',
    nameEn: 'Home & Online Tutors',
    categoryGroup: 'EDUCATION',
    icon: 'GraduationCap',
    descriptionBn: 'বুয়েট, ঢাবি ও মেডিকেল শিক্ষার্থী দ্বারা বিশ্বস্ত হোম ও অনলাইন টিউশন',
    isActive: false,
    requiresAdvanceDeposit: false,
    pricingType: 'MONTHLY' as any,
    targetView: 'service_request',
    searchKeywords: ['tutor', 'tuition', 'teacher', 'টিউটর']
  },
  {
    id: 'beauty_salon',
    nameBn: 'হোম বিউটি পার্লার ও স্পা',
    nameEn: 'Home Beauty & Salon',
    categoryGroup: 'PROFESSIONAL',
    icon: 'Sparkles',
    descriptionBn: 'বাসায় এসে স্কিন কেয়ার, ব্রাইডাল মেকওভার ও হেয়ার ট্রিটমেন্ট',
    isActive: false,
    requiresAdvanceDeposit: true,
    depositPercentage: 20,
    pricingType: 'FIXED',
    targetView: 'service_request',
    searchKeywords: ['salon', 'parlor', 'bridal', 'beauty', 'পার্লার']
  }
];

class ServiceRegistry {
  private modules: Map<string, ServiceModuleDefinition> = new Map();

  constructor() {
    CORE_SERVICE_MODULES.forEach(mod => this.modules.set(mod.id, mod));
  }

  public registerModule(module: ServiceModuleDefinition): void {
    this.modules.set(module.id, module);
  }

  public getActiveModules(): ServiceModuleDefinition[] {
    return Array.from(this.modules.values()).filter(m => m.isActive);
  }

  public getAllModules(): ServiceModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  public getModuleById(id: string): ServiceModuleDefinition | undefined {
    return this.modules.get(id);
  }

  public searchModules(query: string): ServiceModuleDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getActiveModules();

    return this.getActiveModules().filter(m =>
      m.nameBn.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      m.descriptionBn.toLowerCase().includes(q) ||
      (m.searchKeywords && m.searchKeywords.some(k => k.toLowerCase().includes(q)))
    );
  }
}

export const serviceRegistry = new ServiceRegistry();
