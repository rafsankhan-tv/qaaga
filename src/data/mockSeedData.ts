import {
  UserProfile,
  ProviderProfile,
  DoctorProfile,
  NurseProfile,
  CaregiverProfile,
  HotelProfile,
  Product,
  EBook,
  UsedProductListing,
  JobPost,
  ServiceRequest,
  ProviderOffer,
  Booking,
  PlatformSystemSettings
} from '../types';
import {
  DEFAULT_SITE_TITLE,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_TAGLINE,
  DEFAULT_SITE_DESCRIPTION,
  FAVICON_PRESETS
} from './faviconPresets';

export const INITIAL_SYSTEM_SETTINGS: PlatformSystemSettings = {
  defaultAdvancePercent: 20,
  platformCommissionPercent: 10,
  requireAdminRequestReview: true,
  requireAdminOfferReview: true,
  requireProviderKycApproval: true,
  requireProductApproval: true,
  urgentFeeMultiplier: 1.15,
  bkashMerchantNumber: '01712-345678 (QAAGA Official)',
  supportPhone: '+880 1800-QAAGA-1',
  supportEmail: 'support@qaaga.com',

  // Site Branding & Meta Title requested by user
  siteTitle: DEFAULT_SITE_TITLE,
  siteName: DEFAULT_SITE_NAME,
  siteTagline: DEFAULT_SITE_TAGLINE,
  siteDescription: DEFAULT_SITE_DESCRIPTION,

  // Favicon Configuration
  faviconType: 'preset',
  faviconPresetId: 'qaaga-purple-q',
  faviconUrl: FAVICON_PRESETS[0].svgDataUri,
  customFaviconUpload: '',
  themeColor: '#7c3aed',
  showTaglineInBrowserTitle: true
};

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    email: 'rafsankhan.tv@gmail.com',
    fullName: 'Rafsan Khan',
    phone: '+8801711002233',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
    gender: 'male',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Gulshan',
    area: 'Gulshan 2',
    address: 'Road 45, House 12, Gulshan 2, Dhaka',
    roles: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'],
    activeRole: 'SUPER_ADMIN',
    accountStatus: 'active',
    isVerified: true,
    rating: 5.0,
    reviewCount: 42,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-24T00:00:00Z'
  },
  {
    id: 'user-customer-1',
    email: 'tahsin.ahmed@example.com',
    fullName: 'Tahsin Ahmed',
    phone: '+8801819876543',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    gender: 'male',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    area: 'Dhanmondi 1-32',
    address: 'House 24, Road 8/A, Dhanmondi, Dhaka',
    roles: ['CUSTOMER'],
    activeRole: 'CUSTOMER',
    accountStatus: 'active',
    isVerified: true,
    rating: 4.9,
    reviewCount: 14,
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  },
  {
    id: 'user-provider-1',
    email: 'kamrul.technician@gmail.com',
    fullName: 'Engr. Kamrul Hasan',
    phone: '+8801723456789',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    gender: 'male',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Mirpur',
    area: 'Mirpur 10 (Golchottor)',
    address: 'Section 10, Block C, Mirpur, Dhaka',
    roles: ['PROVIDER', 'CUSTOMER'],
    activeRole: 'PROVIDER',
    accountStatus: 'active',
    isVerified: true,
    rating: 4.95,
    reviewCount: 128,
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-08-22T14:00:00Z'
  },
  {
    id: 'user-provider-2',
    email: 'shafiq.dev@gmail.com',
    fullName: 'Shafiqul Islam',
    phone: '+8801912345678',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
    gender: 'male',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Uttara',
    area: 'Uttara Sector 1-14',
    address: 'Sector 4, Road 7, Uttara, Dhaka',
    roles: ['PROVIDER', 'CUSTOMER'],
    activeRole: 'PROVIDER',
    accountStatus: 'active',
    isVerified: true,
    rating: 4.88,
    reviewCount: 94,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-08-23T11:00:00Z'
  },
  {
    id: 'user-seller-1',
    email: 'gadgetzone.bd@gmail.com',
    fullName: 'Arifur Rahman (GadgetZone BD)',
    phone: '+8801611223344',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
    gender: 'male',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Motijheel',
    area: 'Dilkusha',
    address: 'Shop 42, Motijheel Commercial Area, Dhaka',
    roles: ['SELLER', 'CUSTOMER'],
    activeRole: 'SELLER',
    accountStatus: 'active',
    isVerified: true,
    rating: 4.92,
    reviewCount: 310,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-21T16:00:00Z'
  }
];

export const SEED_PROVIDERS: ProviderProfile[] = [
  {
    id: 'prov-1',
    userId: 'user-provider-1',
    fullName: 'Kamrul AC & Appliance Care',
    businessName: 'Master Cool HVAC Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    phone: '+8801723456789',
    email: 'kamrul.technician@gmail.com',
    serviceCategoryIds: ['cat-ac-repair', 'cat-refrigerator-repair', 'cat-tv-repair'],
    serviceNames: ['AC Master Jet Wash', 'Gas Refill (R22/R410/R32)', 'Compressor Replacement', 'Refrigerator PCB Fix'],
    serviceAreas: ['Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mohammadpur'],
    district: 'Dhaka',
    thana: 'Mirpur',
    experienceYears: 9,
    description: 'Certified HVAC & Appliance Engineer with 9+ years experience in Inverter AC servicing, precision gas charging, and electronic board soldering.',
    minServiceCharge: 800,
    availableDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: '8:00 AM - 10:00 PM',
    verificationStatus: 'VERIFIED',
    certificates: ['BTEB Refrigeration & Air Conditioning Trade Certificate', 'Carrier Certified HVAC Tech'],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=500&q=80'
    ],
    portfolioVideos: [],
    completedJobs: 128,
    rating: 4.95,
    reviewCount: 112,
    hasVerificationBadge: true,
    createdAt: '2026-01-15T08:30:00Z'
  },
  {
    id: 'prov-2',
    userId: 'user-provider-2',
    fullName: 'Shafiq Web & Video Studio',
    businessName: 'PixelCraft Digital Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
    phone: '+8801912345678',
    email: 'shafiq.dev@gmail.com',
    serviceCategoryIds: ['cat-web-design', 'cat-video-editing'],
    serviceNames: ['Custom React/Node Web Apps', 'Shopify E-commerce', 'YouTube 4K Video Editing', 'Motion Graphics'],
    serviceAreas: ['All Bangladesh (Remote)', 'Gulshan', 'Uttara', 'Dhanmondi'],
    district: 'Dhaka',
    thana: 'Uttara',
    experienceYears: 7,
    description: 'Senior Full-Stack Developer and Adobe Certified Video Editor delivering high-converting websites and viral short-form video edits.',
    minServiceCharge: 3000,
    availableDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    availableHours: '9:00 AM - 11:00 PM',
    verificationStatus: 'VERIFIED',
    certificates: ['Google UX Design Professional', 'Meta Certified Front-End Developer'],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=500&q=80'
    ],
    portfolioVideos: [],
    completedJobs: 94,
    rating: 4.88,
    reviewCount: 86,
    hasVerificationBadge: true,
    createdAt: '2026-02-01T09:00:00Z'
  }
];

export const SEED_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-1',
    userId: 'user-doc-1',
    name: 'Prof. Dr. Mahmudul Hasan',
    doctorPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
    degree: 'MBBS, FCPS (Medicine), MACP (USA), MD (Internal Medicine)',
    specialization: 'Medicine Specialist',
    bmdcRegistration: 'BMDC A-43921',
    hospitalChamber: 'Evercare Hospital Dhaka & Popular Diagnostic Dhanmondi',
    experienceYears: 18,
    consultationFee: 1500,
    followupFee: 800,
    district: 'Dhaka',
    thana: 'Dhanmondi',
    area: 'Dhanmondi 1-32',
    chamberAddress: 'Popular Diagnostic Center, Room 402, House 16, Road 2, Dhanmondi, Dhaka',
    availableSchedules: [
      { day: 'Saturday', startTime: '05:00 PM', endTime: '09:00 PM', slotDurationMinutes: 15, maxPatients: 16 },
      { day: 'Monday', startTime: '05:00 PM', endTime: '09:00 PM', slotDurationMinutes: 15, maxPatients: 16 },
      { day: 'Wednesday', startTime: '05:00 PM', endTime: '09:00 PM', slotDurationMinutes: 15, maxPatients: 16 }
    ],
    rating: 4.96,
    reviewCount: 245,
    isVerified: true
  },
  {
    id: 'doc-2',
    userId: 'user-doc-2',
    name: 'Dr. Nusrat Jahan Chowdhury',
    doctorPhoto: 'https://images.unsplash.com/photo-1594824813576-92850f96ee75?auto=format&fit=crop&w=400&h=400&q=80',
    degree: 'MBBS, DGO, FCPS (Obstetrics & Gynecology), Fellowship In Infertility',
    specialization: 'Gynecologist & Obstetrician',
    bmdcRegistration: 'BMDC A-51084',
    hospitalChamber: 'Square Hospital & Labaid Specialized Hospital Gulshan',
    experienceYears: 14,
    consultationFee: 1200,
    followupFee: 600,
    district: 'Dhaka',
    thana: 'Gulshan',
    area: 'Gulshan 2',
    chamberAddress: 'Labaid Specialized Hospital, Level 3, Gulshan 2, Dhaka',
    availableSchedules: [
      { day: 'Sunday', startTime: '06:00 PM', endTime: '10:00 PM', slotDurationMinutes: 15, maxPatients: 16 },
      { day: 'Tuesday', startTime: '06:00 PM', endTime: '10:00 PM', slotDurationMinutes: 15, maxPatients: 16 },
      { day: 'Thursday', startTime: '06:00 PM', endTime: '10:00 PM', slotDurationMinutes: 15, maxPatients: 16 }
    ],
    rating: 4.94,
    reviewCount: 189,
    isVerified: true
  }
];

export const SEED_NURSES: NurseProfile[] = [
  {
    id: 'nurse-1',
    name: 'Shamima Akter, BSc Nurse',
    photoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&h=300&q=80',
    type: 'Home Nurse',
    services: ['IV Cannula & Injections', 'Post-Operative Wound Dressing', 'Catheter Care', 'Ryles Tube Feeding', 'Vital Monitoring'],
    qualification: 'BSc in Nursing (BSMMU Registered), Certified ICU Caregiver',
    experienceYears: 6,
    hourlyRate: 350,
    dailyRate: 2200,
    monthlyPackageRate: 48000,
    district: 'Dhaka',
    thana: 'Gulshan',
    area: 'Gulshan 2',
    rating: 4.92,
    reviewCount: 68,
    isVerified: true
  },
  {
    id: 'nurse-2',
    name: 'Md. Monir Hossain, Diploma Nurse',
    photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&h=300&q=80',
    type: '24 Hour Nurse',
    services: ['24-Hour Patient Care', 'Diabetic Injection & Insulin Chart', 'Nebulizer Setup', 'Bedridden Care'],
    qualification: 'Diploma in Nursing Science & Midwifery (Dhaka Medical College Hospital Trained)',
    experienceYears: 8,
    hourlyRate: 300,
    dailyRate: 2500,
    monthlyPackageRate: 55000,
    district: 'Dhaka',
    thana: 'Dhanmondi',
    area: 'Dhanmondi 1-32',
    rating: 4.89,
    reviewCount: 52,
    isVerified: true
  }
];

export const SEED_CAREGIVERS: CaregiverProfile[] = [
  {
    id: 'cg-1',
    name: 'Rahima Khatun',
    photoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&h=300&q=80',
    type: 'Elderly Caregiver',
    gender: 'female',
    experienceYears: 7,
    hourlyRate: 200,
    dailyRate: 1500,
    monthlyRate: 32000,
    shiftTypes: ['Day', 'Night', 'Full-time'],
    district: 'Dhaka',
    thana: 'Uttara',
    area: 'Uttara Sector 1-14',
    rating: 4.95,
    reviewCount: 47,
    isVerified: true
  },
  {
    id: 'cg-2',
    name: 'Abdul Malek',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80',
    type: 'Hospital Attendant',
    gender: 'male',
    experienceYears: 5,
    hourlyRate: 180,
    dailyRate: 1400,
    monthlyRate: 28000,
    shiftTypes: ['Day', 'Night'],
    district: 'Dhaka',
    thana: 'Mohakhali',
    area: 'TB Gate',
    rating: 4.86,
    reviewCount: 39,
    isVerified: true
  }
];

export const SEED_HOTELS: HotelProfile[] = [
  {
    id: 'hotel-1',
    managerId: 'user-hotel-1',
    name: 'Sayeman Beach Resort Cox\'s Bazar',
    stars: 5,
    district: 'Cox\'s Bazar',
    thana: 'Cox\'s Bazar Sadar',
    area: 'Kolatoli Beach Area',
    address: 'Marine Drive Road, Kolatoli, Cox\'s Bazar',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: ['Infinity Ocean Pool', 'Free Airport Shuttle', 'Beachfront Restaurant', 'High-Speed Wi-Fi', 'Gym & Spa', '24/7 Room Service'],
    rules: ['Valid NID / Passport required at check-in', 'Check-in from 01:00 PM', 'Check-out before 11:00 AM'],
    checkInTime: '13:00',
    checkOutTime: '11:00',
    rating: 4.91,
    reviewCount: 380,
    paymentMode: 'FULL_ONLINE',
    rooms: [
      {
        id: 'room-101',
        roomType: 'Deluxe Sea View Suite',
        title: 'Panoramic Oceanfront Deluxe Suite with Private Balcony',
        bedType: '1 King Size Bed + 1 Sofa Bed',
        capacityAdults: 2,
        capacityChildren: 2,
        pricePerNight: 8500,
        availableRooms: 6,
        totalRooms: 10,
        amenities: ['Sea View Balcony', 'Bathtub & Rain Shower', 'Free Breakfast Buffet', 'Smart LED TV', 'Mini Bar'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80']
      },
      {
        id: 'room-102',
        roomType: 'Executive Hill & City View',
        title: 'Executive Twin Room with Free High Speed Wi-Fi',
        bedType: '2 Queen Beds',
        capacityAdults: 2,
        capacityChildren: 1,
        pricePerNight: 5500,
        availableRooms: 8,
        totalRooms: 15,
        amenities: ['City View', 'Workstation', 'Free Breakfast', 'Coffee Maker'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80']
      }
    ]
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sellerId: 'user-seller-1',
    sellerShopName: 'GadgetZone BD',
    title: 'Anker Soundcore Space One Active Noise Cancelling Headphones',
    sku: 'ANK-SP-01',
    category: 'Smart Gadgets & Audio',
    price: 9500,
    discountPrice: 8490,
    stock: 24,
    description: '2X stronger voice reduction, 40 hours ANC playtime, LDAC Hi-Res Wireless Audio, ultra-comfortable rotating ear cups.',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
    warranty: '18 Months Official Anker Bangladesh Warranty',
    deliveryInfo: 'Cash on Delivery inside Dhaka (24-48 hrs), All Bangladesh Courier (3-4 days)',
    rating: 4.93,
    reviewCount: 78,
    isApproved: true,
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'prod-2',
    sellerId: 'user-seller-1',
    sellerShopName: 'GadgetZone BD',
    title: 'Baseus 65W GaN5 Pro Fast Charger (3-Port Type-C + USB)',
    sku: 'BAS-GAN-65',
    category: 'Computer & Accessories',
    price: 3200,
    discountPrice: 2850,
    stock: 45,
    description: 'Ultra-compact GaN fast charger capable of powering MacBooks, iPads, iPhones, and Samsung super fast charging simultaneously.',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'],
    warranty: '6 Months Replacement Warranty',
    deliveryInfo: 'Cash on Delivery Available',
    rating: 4.88,
    reviewCount: 112,
    isApproved: true,
    createdAt: '2026-03-05T12:00:00Z'
  }
];

export const SEED_EBOOKS: EBook[] = [
  {
    id: 'ebook-1',
    title: 'Full-Stack Web Engineering with React, Node.js & Cloud Firestore',
    author: 'Engr. Tanvir Ahmed',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'Comprehensive 450-page handbook on architecting production enterprise web applications with TypeScript, security rules, and real-time state.',
    category: 'Web & Software Development',
    price: 350,
    pageCount: 450,
    language: 'Bangla & English',
    previewSnippet: 'Chapter 1: The Zero-Trust Security Mindset in Modern Web Applications...\nIn modern application development, client side validation is only for user ergonomics...',
    fullContentSnippet: 'Full Content Unlocked: Access granted via server token. Complete source code repository included in Appendix C.',
    fileSizeMb: 18.4,
    rating: 4.97,
    reviewCount: 164,
    downloadCount: 820,
    createdAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'ebook-2',
    title: 'The Ultimate Freelance & Remote Work Masterclass in Bangladesh',
    author: 'Zubair Hossain',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    description: 'Step-by-step blueprint to securing high-ticket international clients, contract negotiation, and international payout setups.',
    category: 'Freelancing & Outsourcing Guides',
    price: 250,
    pageCount: 280,
    language: 'Bangla',
    previewSnippet: 'Introduction: Why traditional job searching is changing in the digital economy...',
    fullContentSnippet: 'Complete guide on cold emailing, portfolio positioning, Upwork optimization and client retention formulas.',
    fileSizeMb: 12.1,
    rating: 4.91,
    reviewCount: 98,
    downloadCount: 650,
    createdAt: '2026-02-14T00:00:00Z'
  }
];

export const SEED_USED_PRODUCTS: UsedProductListing[] = [
  {
    id: 'used-1',
    sellerId: 'user-customer-1',
    sellerName: 'Tahsin Ahmed',
    sellerPhone: '+8801819876543',
    title: 'Apple MacBook Pro 14" M2 Pro (16GB / 512GB Space Gray)',
    category: 'Used Laptops & Desktops',
    condition: 'Like New',
    description: 'Battery health 96%, cycle count 48. Comes with original 67W MagSafe charger, box, and invoice. Used only for coding in air-conditioned room.',
    price: 155000,
    isNegotiable: true,
    district: 'Dhaka',
    area: 'Dhanmondi 1-32',
    photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    isApproved: true,
    status: 'ACTIVE',
    inquiryCount: 18,
    createdAt: '2026-08-15T14:00:00Z'
  }
];

export const SEED_JOBS: JobPost[] = [
  {
    id: 'job-1',
    recruiterId: 'user-admin',
    companyName: 'QAAGA Technologies Ltd.',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200&h=200&q=80',
    jobTitle: 'Senior Full-Stack TypeScript Engineer (React + Node.js)',
    category: 'Software & IT',
    jobType: 'Full-time',
    district: 'Dhaka',
    area: 'Gulshan 2',
    salaryMin: 90000,
    salaryMax: 140000,
    salaryNegotiable: false,
    experienceRequired: '4+ Years in React, TypeScript & Scalable Backend',
    educationRequired: 'BSc in CSE or equivalent practical expertise',
    description: 'We are seeking an experienced Full-Stack Engineer to lead development on QAAGA marketplace core routing, payment settlement adapters, and real-time messaging.',
    requirements: [
      'Strong mastery of React 19, TypeScript, and Tailwind CSS',
      'Proficiency in Node.js server architecture and Firestore data structures',
      'Experience with responsive mobile-first UI patterns and payment gateways',
      'Solid understanding of security rules and role-based access control'
    ],
    vacancyCount: 3,
    deadline: '2026-09-30',
    isApproved: true,
    applicationCount: 29,
    createdAt: '2026-08-01T10:00:00Z'
  }
];

// Sample active Service Request demonstrating the generic routing engine
export const SEED_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-101',
    customerId: 'user-customer-1',
    customerName: 'Tahsin Ahmed',
    customerPhone: '+8801819876543',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    categoryId: 'cat-ac-repair',
    categoryName: 'AC Repair & Servicing',
    subCategory: 'AC Master Jet Wash & Gas Refill',
    title: 'Gree 1.5 Ton Inverter AC Master Servicing & Cooling Check',
    description: 'AC is blowing room-temperature air and making slight rattling noise from the outdoor blower. Need deep jet wash and R410 gas pressure check before summer.',
    budget: 3500,
    isUrgent: false,
    preferredDate: '2026-08-26',
    preferredTime: '10:30 AM',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    area: 'Dhanmondi 1-32',
    address: 'House 24, Flat 4B, Road 8/A, Dhanmondi, Dhaka',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'],
    routingMode: 'ALL_ELIGIBLE',
    targetProviderIds: ['prov-1'],
    status: 'OFFERS_SENT_TO_CUSTOMER',
    statusAuditLog: [
      { status: 'SUBMITTED', timestamp: '2026-08-24T02:00:00Z', note: 'Customer submitted request', changedBy: 'Tahsin Ahmed' },
      { status: 'ADMIN_REVIEW', timestamp: '2026-08-24T02:10:00Z', note: 'Admin verified details & categorized', changedBy: 'Admin Rafsan Khan' },
      { status: 'SENT_TO_PROVIDERS', timestamp: '2026-08-24T02:15:00Z', note: 'Dispatched to 3 eligible technician providers in Dhanmondi', changedBy: 'Admin System' },
      { status: 'OFFER_RECEIVED', timestamp: '2026-08-24T03:00:00Z', note: 'Quotation submitted by Engr. Kamrul Hasan', changedBy: 'Kamrul AC Care' },
      { status: 'OFFERS_SENT_TO_CUSTOMER', timestamp: '2026-08-24T03:15:00Z', note: 'Admin approved quote and forwarded to customer', changedBy: 'Admin Rafsan Khan' }
    ],
    createdAt: '2026-08-24T02:00:00Z',
    updatedAt: '2026-08-24T03:15:00Z'
  }
];

export const SEED_OFFERS: ProviderOffer[] = [
  {
    id: 'off-501',
    requestId: 'req-101',
    providerId: 'prov-1',
    providerName: 'Kamrul AC & Appliance Care',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    providerPhone: '+8801723456789',
    providerRating: 4.95,
    providerReviewCount: 112,
    providerCompletedJobs: 128,
    providerExperience: 9,
    offeredPrice: 2800,
    serviceCharge: 1200,
    partsIncluded: true,
    estimatedDuration: '2 Hours',
    earliestDate: '2026-08-26',
    earliestTime: '10:00 AM',
    offerMessage: 'Includes High Pressure Jet Wash with chemical foam, R410 refrigerant pressure stabilization, capacitor testing, and 60 days service warranty.',
    warranty: '60 Days Free Service Warranty',
    offerExpiry: '2026-08-28T23:59:59Z',
    status: 'SENT_TO_CUSTOMER',
    adminNote: 'Verified certified HVAC engineer with 5-star track record.',
    createdAt: '2026-08-24T03:00:00Z',
    updatedAt: '2026-08-24T03:15:00Z'
  }
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'book-901',
    bookingReference: 'QAAGA-BK-98214',
    requestId: 'req-100-demo',
    offerId: 'off-demo',
    customerId: 'user-customer-1',
    customerName: 'Tahsin Ahmed',
    customerPhone: '+8801819876543',
    customerAddress: 'House 24, Flat 4B, Road 8/A, Dhanmondi, Dhaka',
    providerId: 'prov-1',
    providerName: 'Kamrul AC & Appliance Care',
    providerPhone: '+8801723456789',
    serviceTitle: 'Inverter Refrigerator Gas Charging & Relay Replacement',
    categoryName: 'Refrigerator & Deep Fridge Repair',
    totalAmount: 3500,
    advanceRate: 0.20,
    advancePaid: 700,
    remainingAmount: 2800,
    remainingCollected: false,
    platformCommission: 350,
    isPaid: true,
    privacyUnlocked: true,
    paymentGateway: 'bKash Merchant',
    transactionId: 'BKASH_TXN_99281744',
    status: 'PROVIDER_ON_THE_WAY',
    otpStartCode: '8492',
    createdAt: '2026-08-24T01:00:00Z',
    updatedAt: '2026-08-24T03:30:00Z'
  }
];
