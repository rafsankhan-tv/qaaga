import { z } from "zod";

/**
 * QAAGA Super Marketplace — Zod Validation Schemas
 * Type-safe, production-ready schemas for server-side & client-side data validation.
 */

// 1. User Authentication & Profile
export const UserRegisterSchema = z.object({
  fullName: z.string().min(2, "নাম ন্যূনতম ২ অক্ষরের হতে হবে").max(100),
  phone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন").optional().or(z.literal("")),
  password: z.string().min(6, "পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে").max(100).optional(),
  role: z.enum([
    "CUSTOMER",
    "PROVIDER",
    "SELLER",
    "ADMIN",
    "SUPER_ADMIN",
    "DOCTOR",
    "NURSE",
    "CAREGIVER",
    "HOTEL_MANAGER",
    "RECRUITER",
    "JOB_SEEKER",
    "GUEST"
  ]).default("CUSTOMER"),
  district: z.string().default("ঢাকা"),
  area: z.string().default("মিরপুর"),
  address: z.string().optional()
});

export const UserLoginSchema = z.object({
  phoneOrEmail: z.string().min(3, "ফোন নম্বর বা ইমেইল দিন").max(100),
  password: z.string().min(4, "পাসওয়ার্ড দিন").max(100)
});

export const RoleSwitchSchema = z.object({
  targetRole: z.enum([
    "CUSTOMER",
    "PROVIDER",
    "SELLER",
    "ADMIN",
    "SUPER_ADMIN",
    "DOCTOR",
    "NURSE",
    "CAREGIVER",
    "HOTEL_MANAGER",
    "RECRUITER",
    "JOB_SEEKER",
    "GUEST"
  ])
});

// 2. Service Request & Escrow Booking
export const ServiceRequestSchema = z.object({
  customerName: z.string().min(2, "গ্রাহকের নাম আবশ্যক").max(100),
  customerPhone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  categoryId: z.string().min(1, "সার্ভিস ক্যাটাগরি নির্বাচন করুন").max(50),
  title: z.string().min(3, "কাজের শিরোনাম আবশ্যক").max(150),
  description: z.string().min(5, "সমস্যার বিস্তারিত বিবরণ দিন").max(2000),
  district: z.string().min(1, "জেলা নির্বাচন করুন").max(50),
  area: z.string().min(1, "এলাকা নির্বাচন করুন").max(50),
  address: z.string().min(3, "ঠিকানা প্রদান করুন").max(300),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  budget: z.number().positive("বাজেট ০ এর চেয়ে বেশি হতে হবে").max(1000000),
  isUrgent: z.boolean().default(false)
});

// 3. E-commerce Order Checkout
export const OrderItemSchema = z.object({
  productId: z.string().min(1).max(50),
  productTitle: z.string().min(1).max(200),
  price: z.number().nonnegative().max(10000000),
  quantity: z.number().int().positive().max(1000),
  image: z.string().optional(),
  sellerId: z.string().optional()
});

export const OrderCheckoutSchema = z.object({
  customerName: z.string().min(2, "নাম প্রদান করুন").max(100),
  customerPhone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  shippingAddress: z.string().min(5, "ডেলিভারি ঠিকানা প্রদান করুন").max(300),
  district: z.string().min(1, "জেলা আবশ্যক").max(50),
  area: z.string().min(1, "এলাকা আবশ্যক").max(50),
  items: z.array(OrderItemSchema).min(1, "কার্টে অন্তত একটি পণ্য থাকতে হবে").max(100),
  subtotal: z.number().nonnegative().max(10000000),
  deliveryFee: z.number().nonnegative().max(100000).default(0),
  discountAmount: z.number().nonnegative().max(1000000).default(0),
  totalAmount: z.number().positive().max(10000000),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD", "ROCKET", "SSLCOMMERZ", "CARD"]).default("COD")
});

// 4. Payment Verification
export const PaymentVerifySchema = z.object({
  transactionId: z.string().min(4, "ট্রানজ্যাকশন আইডি ন্যূনতম ৪ অক্ষরের হতে হবে").max(60),
  paymentMethod: z.string().min(2).max(40).default("bKash"),
  amount: z.number().positive("পেমেন্ট এমাউন্ট অবশ্যই ০ এর চেয়ে বেশি হতে হবে").max(10000000),
  bookingId: z.string().max(80).optional(),
  serviceType: z.string().max(80).optional()
});

// 5. Ebook Authorization
export const EbookAuthorizeSchema = z.object({
  ebookId: z.string().min(1, "ইবুক আইডি আবশ্যক").max(80),
  userId: z.string().min(1, "ইউজার আইডি আবশ্যক").max(80),
  purchaseToken: z.string().max(200).optional()
});

// 6. AI & Chat Schemas
export const ChatHistoryItemSchema = z.object({
  role: z.enum(["user", "model", "assistant"]),
  content: z.string().max(5000)
});

export const AICatChatSchema = z.object({
  message: z.string().min(1, "Message is required").max(3000),
  history: z.array(ChatHistoryItemSchema).max(20).optional().default([]),
  context: z.record(z.string(), z.any()).optional()
});

export const SuchiChatSchema = z.object({
  message: z.string().max(4000).optional().default(""),
  image: z.string().max(7 * 1024 * 1024, "Image exceeds 7MB limit").optional(), // Base64 data URI limit
  history: z.array(ChatHistoryItemSchema).max(20).optional().default([])
}).refine(data => data.message?.trim().length > 0 || !!data.image, {
  message: "বার্তা অথবা ছবি প্রদান করুন"
});

export const AIChatGenericSchema = z.object({
  message: z.string().min(1, "Message is required").max(3000),
  assistantType: z.enum(["CAT", "SUCHI"]).optional().default("SUCHI"),
  history: z.array(ChatHistoryItemSchema).max(20).optional().default([])
});

// 7. Services Query Filter
export const ServicesQuerySchema = z.object({
  categoryGroup: z.string().max(50).optional().nullable(),
  search: z.string().max(100).optional().nullable()
});

// 8. Seller Store Registration & Payout
export const SellerStoreSchema = z.object({
  shopName: z.string().min(3, "দোকানের নাম আবশ্যক").max(100),
  ownerName: z.string().min(2, "মালিকের নাম আবশ্যক").max(100),
  phone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন"),
  whatsapp: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  district: z.string().min(1).max(50),
  area: z.string().min(1).max(50),
  address: z.string().min(5).max(300),
  tradeLicense: z.string().max(80).optional(),
  nidNumber: z.string().max(30).optional()
});

export const SellerPayoutSchema = z.object({
  sellerId: z.string().min(1).max(80),
  amount: z.number().min(500, "সর্বনিম্ন উইথড্রয়াল ৫০০ টাকা").max(1000000),
  paymentMethod: z.enum(["BKASH", "NAGAD", "BANK_TRANSFER"]),
  accountDetails: z.string().min(5, "অ্যাকাউন্ট নম্বর প্রদান করুন").max(100)
});

// 9. Product Creation & Listing
export const ProductCreateSchema = z.object({
  title: z.string().min(3, "পণ্যের নাম আবশ্যক").max(200),
  category: z.string().min(1, "ক্যাটাগরি আবশ্যক").max(80),
  price: z.number().positive("মূল্য অবশ্যই ধনাত্মক সংখ্যা হতে হবে").max(10000000),
  discountPrice: z.number().positive().max(10000000).optional(),
  stock: z.number().int().nonnegative().max(100000).default(1),
  description: z.string().min(10, "পণ্যের বিস্তারিত বিবরণ দিন").max(5000),
  images: z.array(z.string()).min(1, "অন্তত একটি ছবি যোগ করুন").max(10),
  sellerId: z.string().max(80).optional(),
  sellerName: z.string().max(100).optional()
});

// 10. Review & Rating Submission
export const ReviewSchema = z.object({
  targetId: z.string().min(1).max(80),
  targetType: z.enum(["PRODUCT", "SERVICE", "SELLER", "DOCTOR", "NURSE", "HOTEL", "EBOOK"]),
  userName: z.string().min(2, "আপনার নাম লিখুন").max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "মন্তব্য লিখুন").max(1000)
});

// 11. Calculate Fee Schema
export const CalculateFeeSchema = z.object({
  basePrice: z.number().nonnegative("বেস প্রাইস ০ বা তার বেশি হতে হবে").max(10000000),
  isUrgent: z.boolean().optional().default(false)
});

// 12. Query Parameter Validation Schemas
export const ProductQuerySchema = z.object({
  id: z.string().max(80).optional(),
  category: z.string().max(80).optional(),
  search: z.string().max(100).optional(),
  sellerId: z.string().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional()
});

export const DoctorQuerySchema = z.object({
  id: z.string().max(80).optional(),
  specialty: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  search: z.string().max(100).optional()
});

export const NurseQuerySchema = z.object({
  area: z.string().max(100).optional(),
  shiftType: z.string().max(100).optional()
});

export const HotelQuerySchema = z.object({
  location: z.string().max(150).optional(),
  search: z.string().max(100).optional()
});

export const EbookQuerySchema = z.object({
  id: z.string().max(80).optional(),
  category: z.string().max(100).optional(),
  search: z.string().max(100).optional()
});

export const OrderQuerySchema = z.object({
  orderId: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional()
});

export const ServiceRequestQuerySchema = z.object({
  categoryId: z.string().max(80).optional(),
  status: z.string().max(50).optional(),
  district: z.string().max(100).optional()
});

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;
export type ServiceRequestInput = z.infer<typeof ServiceRequestSchema>;
export type OrderCheckoutInput = z.infer<typeof OrderCheckoutSchema>;
export type PaymentVerifyInput = z.infer<typeof PaymentVerifySchema>;
export type EbookAuthorizeInput = z.infer<typeof EbookAuthorizeSchema>;
export type SellerStoreInput = z.infer<typeof SellerStoreSchema>;
export type SellerPayoutInput = z.infer<typeof SellerPayoutSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;
export type CalculateFeeInput = z.infer<typeof CalculateFeeSchema>;
