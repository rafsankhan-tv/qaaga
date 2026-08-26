export type UserRole =
  | 'GUEST'
  | 'CUSTOMER'
  | 'PROVIDER'
  | 'SELLER'
  | 'DOCTOR'
  | 'NURSE'
  | 'CAREGIVER'
  | 'HOTEL_MANAGER'
  | 'RECRUITER'
  | 'JOB_SEEKER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type AccountStatus = 'active' | 'pending_verification' | 'suspended' | 'banned';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  coverUrl?: string;
  gender: 'male' | 'female' | 'other';
  division: string;
  district: string;
  thana: string;
  area: string;
  address: string;
  roles: UserRole[];
  activeRole: UserRole;
  accountStatus: AccountStatus;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  nidOrPassport?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationArea {
  id: string;
  name: string;
  thana: string;
  district: string;
  division: string;
  zipCode?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  banglaName?: string;
  slug: string;
  iconName: string;
  description: string;
  defaultAdvancePercent: number; // e.g. 20
  minPrice: number;
  subcategories: string[];
  bannerImage: string;
  isFeatured: boolean;
  categoryType: 'SERVICE' | 'DOCTOR' | 'NURSE' | 'CAREGIVER' | 'HOTEL' | 'PRODUCT' | 'EBOOK' | 'USED' | 'JOB';
}

export interface ProviderProfile {
  id: string;
  userId: string;
  fullName: string;
  businessName?: string;
  avatarUrl: string;
  phone: string;
  email: string;
  serviceCategoryIds: string[];
  serviceNames: string[];
  serviceAreas: string[];
  district: string;
  thana: string;
  experienceYears: number;
  description: string;
  minServiceCharge: number;
  availableDays: string[];
  availableHours: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  nidDocumentUrl?: string;
  certificates: string[];
  portfolioPhotos: string[];
  portfolioVideos: string[];
  completedJobs: number;
  rating: number;
  reviewCount: number;
  hasVerificationBadge: boolean;
  createdAt: string;
}

export type ServiceRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ADMIN_REVIEW'
  | 'SENT_TO_PROVIDERS'
  | 'OFFER_RECEIVED'
  | 'OFFERS_SENT_TO_CUSTOMER'
  | 'OFFER_ACCEPTED'
  | 'AWAITING_PAYMENT'
  | 'BOOKED'
  | 'PROVIDER_ON_THE_WAY'
  | 'ARRIVED'
  | 'WORK_STARTED'
  | 'COMPLETION_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export type ProviderOfferStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ADMIN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SENT_TO_CUSTOMER'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED';

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  categoryId: string;
  categoryName: string;
  subCategory: string;
  title: string;
  description: string;
  budget?: number;
  isUrgent: boolean;
  preferredDate: string;
  preferredTime: string;
  district: string;
  thana: string;
  area: string;
  address: string; // Exact address, masked pre-payment
  images: string[];
  videoUrl?: string;
  routingMode: 'ALL_ELIGIBLE' | 'SELECTED_PROVIDERS';
  targetProviderIds: string[];
  status: ServiceRequestStatus;
  assignedProviderId?: string;
  selectedOfferId?: string;
  bookingId?: string;
  statusAuditLog: {
    status: ServiceRequestStatus;
    timestamp: string;
    note?: string;
    changedBy: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderOffer {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerPhone: string;
  providerRating: number;
  providerReviewCount: number;
  providerCompletedJobs: number;
  providerExperience: number;
  offeredPrice: number;
  serviceCharge: number;
  partsIncluded: boolean;
  estimatedDuration: string;
  earliestDate: string;
  earliestTime: string;
  offerMessage: string;
  warranty: string;
  offerExpiry: string;
  status: ProviderOfferStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  requestId: string;
  offerId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  serviceTitle: string;
  categoryName: string;
  totalAmount: number;
  advanceRate: number; // e.g. 0.20
  advancePaid: number;
  remainingAmount: number;
  remainingCollected: boolean;
  platformCommission: number;
  isPaid: boolean;
  privacyUnlocked: boolean;
  paymentGateway: string; // 'bKash' | 'Nagad' | 'SSLCommerz' | 'Card'
  transactionId: string;
  status: ServiceRequestStatus;
  otpStartCode?: string;
  workStartedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  completionConfirmedAt?: string;
  customerReviewId?: string;
  disputeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  doctorPhoto: string;
  degree: string;
  specialization: string;
  bmdcRegistration: string;
  hospitalChamber: string;
  experienceYears: number;
  consultationFee: number;
  followupFee: number;
  district: string;
  thana: string;
  area: string;
  chamberAddress: string;
  availableSchedules: {
    day: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    maxPatients: number;
  }[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface DoctorAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  hospitalChamber: string;
  customerId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  problemSummary: string;
  reportUrls: string[];
  appointmentDate: string;
  timeSlot: string;
  serialNumber: number;
  consultationFee: number;
  isPaidOnline: boolean; // 100% advance required
  transactionId: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  createdAt: string;
}

export interface NurseProfile {
  id: string;
  name: string;
  photoUrl: string;
  type: 'Home Nurse' | 'Day Nurse' | 'Night Nurse' | '24 Hour Nurse' | 'Injection/Dressing';
  services: string[];
  qualification: string;
  experienceYears: number;
  hourlyRate: number;
  dailyRate: number;
  monthlyPackageRate: number;
  district: string;
  thana: string;
  area: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface CaregiverProfile {
  id: string;
  name: string;
  photoUrl: string;
  type: 'Elderly Caregiver' | 'Patient Caregiver' | 'Child Caregiver' | 'Hospital Attendant' | 'Home Attendant';
  gender: 'male' | 'female';
  experienceYears: number;
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  shiftTypes: ('Day' | 'Night' | 'Full-time')[];
  district: string;
  thana: string;
  area: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface HotelRoom {
  id: string;
  roomType: string;
  title: string;
  bedType: string;
  capacityAdults: number;
  capacityChildren: number;
  pricePerNight: number;
  availableRooms: number;
  totalRooms: number;
  amenities: string[];
  images: string[];
}

export interface HotelProfile {
  id: string;
  managerId: string;
  name: string;
  stars: number;
  district: string;
  thana: string;
  area: string;
  address: string;
  coverImage: string;
  images: string[];
  facilities: string[];
  rules: string[];
  checkInTime: string;
  checkOutTime: string;
  rating: number;
  reviewCount: number;
  paymentMode: 'FULL_ONLINE' | 'ADVANCE_ONLY' | 'PAY_AT_HOTEL';
  rooms: HotelRoom[];
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomTitle: string;
  customerId: string;
  guestName: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomCount: number;
  adultCount: number;
  totalPrice: number;
  paymentMode: 'FULL_ONLINE' | 'ADVANCE_ONLY' | 'PAY_AT_HOTEL';
  paidAmount: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'PAY_AT_CHECKIN';
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  createdAt: string;
}

export interface SellerStore {
  id: string;
  userId: string;
  shopName: string;
  shopLogo: string;
  phone: string;
  email: string;
  nidNumber: string;
  tradeLicense?: string;
  address: string;
  district: string;
  thana: string;
  area: string;
  bankAccountInfo?: string;
  productCategories: string[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rating: number;
  totalSales: number;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerShopName: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  description: string;
  images: string[];
  videoUrl?: string;
  warranty: string;
  deliveryInfo: string;
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  createdAt: string;
}

export interface ProductOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
}

export interface ProductOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  thana: string;
  area: string;
  items: ProductOrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'ONLINE_BKASH' | 'ONLINE_CARD';
  orderStatus:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'RETURN_REQUESTED'
    | 'RETURNED';
  createdAt: string;
  updatedAt: string;
}

export interface EBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  category: string;
  price: number;
  pageCount: number;
  language: string;
  previewSnippet: string;
  fullContentSnippet: string;
  fileSizeMb: number;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  createdAt: string;
}

export interface EBookPurchase {
  id: string;
  ebookId: string;
  ebookTitle: string;
  ebookCover: string;
  userId: string;
  amountPaid: number;
  transactionId: string;
  purchaseDate: string;
  secureDownloadToken: string;
}

export interface UsedProductListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  title: string;
  category: string;
  condition: 'Brand New (Sealed)' | 'Like New' | 'Good' | 'Fair' | 'Needs Repair';
  description: string;
  price: number;
  isNegotiable: boolean;
  district: string;
  area: string;
  photos: string[];
  videoUrl?: string;
  isApproved: boolean;
  status: 'ACTIVE' | 'SOLD' | 'RESERVED';
  inquiryCount: number;
  createdAt: string;
}

export interface JobPost {
  id: string;
  recruiterId: string;
  companyName: string;
  companyLogo?: string;
  jobTitle: string;
  category: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  district: string;
  area: string;
  salaryMin: number;
  salaryMax: number;
  salaryNegotiable: boolean;
  experienceRequired: string;
  educationRequired: string;
  description: string;
  requirements: string[];
  vacancyCount: number;
  deadline: string;
  isApproved: boolean;
  applicationCount: number;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  recruiterId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAvatar?: string;
  cvUrl?: string;
  skills: string[];
  education: string;
  experience: string;
  expectedSalary: number;
  coverLetter: string;
  status: 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
  appliedAt: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  createdAt: string;
  readByReceiver: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'REQUEST_SUBMITTED'
    | 'ADMIN_APPROVED'
    | 'OFFER_RECEIVED'
    | 'OFFER_ACCEPTED'
    | 'PAYMENT_SUCCESS'
    | 'PROVIDER_ON_THE_WAY'
    | 'PROVIDER_ARRIVED'
    | 'WORK_STARTED'
    | 'COMPLETION_REQUESTED'
    | 'WORK_COMPLETED'
    | 'APPOINTMENT_CONFIRMED'
    | 'ORDER_STATUS_UPDATE'
    | 'JOB_STATUS_UPDATE';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FaviconPreset {
  id: string;
  name: string;
  nameBangla: string;
  category: 'official' | 'gold' | 'rose' | 'emerald' | 'cat' | 'minimal' | 'cyan';
  previewColor: string;
  svgDataUri: string;
}

export interface PlatformSystemSettings {
  defaultAdvancePercent: number; // e.g. 20
  platformCommissionPercent: number; // e.g. 10
  requireAdminRequestReview: boolean;
  requireAdminOfferReview: boolean;
  requireProviderKycApproval: boolean;
  requireProductApproval: boolean;
  urgentFeeMultiplier: number;
  bkashMerchantNumber: string;
  supportPhone: string;
  supportEmail: string;

  // Site Branding & Meta Title
  siteTitle: string; // e.g. "qaaga.com is Bangladesh's verified multi-service super marketplace"
  siteName: string; // e.g. "qaaga.com"
  siteTagline: string; // e.g. "Bangladesh's verified multi-service super marketplace"
  siteDescription: string;

  // Favicon Configuration
  faviconType: 'preset' | 'custom_url' | 'custom_upload' | 'default';
  faviconUrl: string; // URL or preset SVG data URI
  faviconPresetId: string;
  customFaviconUpload?: string; // Base64 data URL
  themeColor?: string;
  showTaglineInBrowserTitle?: boolean;
}

export interface HeroBannerSlide {
  id: string;
  categoryKey: 'doctor' | 'home_service' | 'hotel' | 'products' | 'repair' | 'jobs' | string;
  titleBangla: string;
  subtitleBangla: string;
  badgeBangla: string;
  ratingText?: string;
  imageUrl: string;
  targetView: string;
  themeColor: string; // Hex color for highlights and glowing ring
  accentGradient: string; // Tailwind gradient for card styling
  isActive: boolean;
  order: number;
}

export interface ShowcaseCardItem {
  id: string;
  title: string;
  subtitle: string;
  priceOrSalary: string;
  unitText?: string; // e.g. "/রাত", "/ঘণ্টা", "/দিন", "শুরু"
  rating?: string;
  reviewCount?: string;
  imageUrl: string;
  badge?: string;
  targetView: string;
  targetParams?: Record<string, any>;
  ctaText: string; // e.g. "ওপেন করুন", "প্রোফাইল দেখুন", "বিস্তারিত দেখুন", "বুকিং করুন"
  description?: string; // Full description / specs for profile modal
  features?: string[]; // Deliverables or feature checklist
  providerName?: string; // Provider or agency name
  providerRole?: string; // Role or designation
  providerAvatar?: string;
  providerPhone?: string;
  providerExperience?: string;
  portfolioImages?: string[]; // Extra gallery/demo pictures
  deliveryTime?: string; // e.g. "৩-৫ কার্যদিবস", "২৪ ঘণ্টা"
  warrantyOrGuarantee?: string; // e.g. "৩০ দিনের মানি ব্যাক গ্যারান্টি"
  advancePercent?: number; // Advance percentage e.g. 20
}

export interface CategoryShowcaseSection {
  id: string;
  categoryKey: string;
  titleEnglish: string;
  titleBangla: string;
  subtitleBangla?: string;
  bannerImage?: string; // Category related photo banner URL
  bannerTagline?: string; // Promo badge on banner e.g. "২০% অগ্রিমে বুকিং"
  iconName: string;
  themeColor: string;
  tagGroup: 'TECH' | 'HEALTH' | 'TRAVEL' | 'HOME_SERVICE' | 'COMMERCE' | 'CAREER';
  viewAllTargetView: string;
  viewAllTargetParams?: Record<string, any>;
  viewAllButtonTextBangla: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  items: ShowcaseCardItem[];
}

export interface CatQuickChip {
  id: string;
  label: string;
  view: string;
  params?: Record<string, any>;
  iconName?: string;
}

export interface FeedComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: string;
  text: string;
  createdAt: string;
}

export interface FeedPostActionCta {
  label: string;
  targetView: string;
  targetParams?: Record<string, any>;
  priceOrDiscount?: string;
  badge?: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole | string;
  authorBadge?: string;
  authorRating?: number;
  authorDistrict?: string;
  authorThana?: string;
  postType: 'UPDATE' | 'OFFER' | 'HEALTH_TIP' | 'SERVICE_SHOWCASE' | 'JOB_ALERT' | 'HOTEL_DEAL' | 'STORY';
  title?: string;
  content: string;
  images?: string[];
  tags: string[];
  categoryKey: string;
  likesCount: number;
  likedBy: string[];
  comments: FeedComment[];
  sharesCount: number;
  isPinned?: boolean;
  actionCta?: FeedPostActionCta;
  createdAt: string;
  updatedAt: string;
}

export interface UserFollow {
  id: string;
  followerId: string;
  targetId: string;
  targetName: string;
  targetAvatar: string;
  targetRole: string;
  targetBadge?: string;
  targetCategory?: string;
  targetRating?: number;
  createdAt: string;
}

export interface FeedBannerSlide {
  id: string;
  titleBangla: string;
  subtitleBangla: string;
  badgeBangla?: string;
  highlightTextBangla?: string;
  imageUrl?: string;
  bgGradient: string; // Tailwind gradient classes e.g. 'from-purple-950 via-[#4e20b8] to-slate-950'
  accentColor?: string; // hex or tailwind class for badges/glows
  ctaTextBangla: string;
  targetView: string;
  targetParams?: Record<string, any>;
  secondaryCtaTextBangla?: string;
  secondaryTargetView?: string;
  secondaryTargetParams?: Record<string, any>;
  isPublished: boolean;
  order: number;
  themeTag?: 'health' | 'service' | 'deal' | 'community' | 'hotel' | 'jobs' | 'notice';
  createdAt?: string;
}

export interface CuteCatAssistantSettings {
  isEnabled: boolean;
  catName: string;
  catSubtitleBangla: string;
  avatarUrl: string;
  secondaryAvatarUrl?: string; // e.g. sitting/resting cat for floating dock
  runSpeedSeconds: number; // Duration in seconds for running left to right
  speechIntervalSeconds: number; // Seconds between message transitions
  messages: string[]; // List of speech bubble messages
  catSkin?: 'orange-tabby' | 'white-kitty' | 'calico-neko' | 'lucky-black' | 'custom';
  bounceStyle?: 'jumping' | 'happy-bounce' | 'wiggle';
  enableFloatingOnScroll: boolean;
  scrollThresholdPx: number; // Pixels of scroll before docking (default: 320)
  floatingPosition: 'bottom-right' | 'bottom-left';
  floatingScale: number; // e.g. 0.85
  trackBackgroundColor: string;
  trackBorderColor: string;
  showPawPrints: boolean;
  showGrassPuff: boolean;
  quickChips: CatQuickChip[];
}
