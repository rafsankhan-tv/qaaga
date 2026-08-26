import { ProductOrder, OrderTrackingStep } from '../types';

export const generateDefaultTrackingTimeline = (
  orderDate: string,
  district: string,
  currentStatus: ProductOrder['orderStatus'] = 'PENDING'
): OrderTrackingStep[] => {
  const d = new Date(orderDate);
  const formatDate = (date: Date, hoursOffset: number = 0) => {
    const newDate = new Date(date.getTime() + hoursOffset * 60 * 60 * 1000);
    return newDate.toLocaleString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isDhaka = district.toLowerCase().includes('dhaka') || district.includes('ঢাকা');
  const cityHub = isDhaka ? 'তেজগাঁও সেন্ট্রাল হাব, ঢাকা' : `${district} ডিস্ট্রিক্ট হাব`;

  const statusHierarchy: Record<string, number> = {
    PENDING: 1,
    CONFIRMED: 2,
    PROCESSING: 3,
    SHIPPED: 4,
    OUT_FOR_DELIVERY: 5,
    DELIVERED: 6,
    COMPLETED: 6,
    CANCELLED: 0
  };

  const currentLevel = statusHierarchy[currentStatus] || 1;

  return [
    {
      stepKey: 'PENDING',
      titleBangla: 'অর্ডার সফলভাবে প্লেস হয়েছে',
      titleEnglish: 'Order Placed',
      descriptionBangla: 'আপনার অর্ডারটি QAAGA সিস্টেমে নিবন্ধিত হয়েছে এবং ভেন্ডরকে নোটিফাই করা হয়েছে।',
      timestamp: formatDate(d, 0),
      location: 'QAAGA ক্লাউড সিস্টেম',
      isCompleted: currentLevel >= 1,
      isCurrent: currentLevel === 1
    },
    {
      stepKey: 'CONFIRMED',
      titleBangla: 'অর্ডার নিশ্চিত ও ইনভেন্টরি লকড',
      titleEnglish: 'Order Confirmed',
      descriptionBangla: 'সেলার অর্ডারটি অনুমোদন করেছেন এবং স্টক বুকিং নিশ্চিত করেছেন।',
      timestamp: currentLevel >= 2 ? formatDate(d, 2) : undefined,
      location: 'অফিসিয়াল সেলার গুদাম',
      isCompleted: currentLevel >= 2,
      isCurrent: currentLevel === 2
    },
    {
      stepKey: 'PROCESSING',
      titleBangla: 'প্যাকেজিং ও কোয়ালিটি চেক (QC)',
      titleEnglish: 'QC & Packaging',
      descriptionBangla: 'প্রোডাক্ট নিখুঁতভাবে পরীক্ষা করে সিকিউরিটি বাবল র‍্যাপ দিয়ে সিল্ড করা হয়েছে।',
      timestamp: currentLevel >= 3 ? formatDate(d, 5) : undefined,
      location: 'QAAGA ফুলফিলমেন্ট হাব',
      isCompleted: currentLevel >= 3,
      isCurrent: currentLevel === 3
    },
    {
      stepKey: 'SHIPPED',
      titleBangla: 'কুরিয়ারে হস্তান্তর ও ট্র্যাকিং সক্রিয়',
      titleEnglish: 'Handed over to Courier',
      descriptionBangla: 'পার্সেলটি Steadfast Express লজিস্টিক্সে হস্তান্তর করা হয়েছে।',
      timestamp: currentLevel >= 4 ? formatDate(d, 12) : undefined,
      location: cityHub,
      isCompleted: currentLevel >= 4,
      isCurrent: currentLevel === 4
    },
    {
      stepKey: 'OUT_FOR_DELIVERY',
      titleBangla: 'রাইডার ডেলিভারির জন্য বের হয়েছে',
      titleEnglish: 'Out for Delivery',
      descriptionBangla: 'ডেলিভারি রাইডার পার্সেলটি নিয়ে আপনার ঠিকানায় রওয়ানা দিয়েছে। প্রস্তুত থাকুন।',
      timestamp: currentLevel >= 5 ? formatDate(d, 22) : undefined,
      location: `${district} এরিয়া হাব`,
      isCompleted: currentLevel >= 5,
      isCurrent: currentLevel === 5
    },
    {
      stepKey: 'DELIVERED',
      titleBangla: 'সফলভাবে ডেলিভার্ড ও হস্তান্তরিত',
      titleEnglish: 'Delivered & Completed',
      descriptionBangla: 'পণ্য গ্রাহক কর্তৃক গৃহীত হয়েছে এবং ডেলিভারি সম্পন্ন হয়েছে।',
      timestamp: currentLevel >= 6 ? formatDate(d, 24) : undefined,
      location: 'গ্রাহকের নির্ধারিত ঠিকানা',
      isCompleted: currentLevel >= 6,
      isCurrent: currentLevel >= 6
    }
  ];
};

export const SEED_ORDERS: ProductOrder[] = [
  {
    id: 'ord-seed-1',
    orderNumber: 'QAAGA-ORD-983120',
    customerId: 'user-customer-1',
    customerName: 'তাহসিন আহমেদ',
    customerPhone: '01819-876543',
    deliveryAddress: 'বাড়ি ২৪, ফ্ল্যাট ৪বি, রোড ৮/এ, ধানমন্ডি, ঢাকা ১২০৯',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    area: 'Road 8/A',
    items: [
      {
        productId: 'prod-1',
        title: 'Total Tools Industrial Heavy-Duty Impact Drill Kit (68-Piece / 850W)',
        price: 4850,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
        sellerId: 'user-seller-2'
      }
    ],
    subtotal: 4850,
    deliveryFee: 80,
    discountAmount: 0,
    totalAmount: 4930,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'SHIPPED',
    courierPartner: 'Steadfast Courier (Official QAAGA Partner)',
    trackingNumber: 'STDF-88192401',
    courierTrackingUrl: 'https://steadfast.com.bd/t/STDF-88192401',
    riderName: 'মোঃ শাকিল হোসেন',
    riderPhone: '01844-998877',
    estimatedDelivery: 'আজ সন্ধ্যা ৬:০০ - ৮:০০ টার মধ্যে',
    deliveryOtp: '4821',
    trackingTimeline: generateDefaultTrackingTimeline('2026-08-25T14:30:00Z', 'Dhaka', 'SHIPPED'),
    customerNote: 'গেটম্যানের কাছে রেখে দিলে ফোন দিবেন।',
    createdAt: '2026-08-25T14:30:00Z',
    updatedAt: '2026-08-26T08:15:00Z'
  },
  {
    id: 'ord-seed-2',
    orderNumber: 'QAAGA-ORD-772154',
    customerId: 'user-customer-1',
    customerName: 'তাহসিন আহমেদ',
    customerPhone: '01819-876543',
    deliveryAddress: 'বাড়ি ২৪, ফ্ল্যাট ৪বি, রোড ৮/এ, ধানমন্ডি, ঢাকা ১২০৯',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    area: 'Dhanmondi',
    items: [
      {
        productId: 'prod-2',
        title: 'Tuya Smart Wi-Fi 4-Gang Touch Switch with Power Monitor',
        price: 2450,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',
        sellerId: 'user-seller-1'
      }
    ],
    subtotal: 4900,
    deliveryFee: 80,
    discountAmount: 150,
    couponCode: 'QAAGA150',
    totalAmount: 4830,
    paymentMethod: 'ONLINE_BKASH',
    paymentStatus: 'PAID',
    transactionId: 'BKASH_TRX_88294103',
    orderStatus: 'DELIVERED',
    courierPartner: 'Pathao Logistics Express',
    trackingNumber: 'PTHO-772189',
    riderName: 'তানভীরুল ইসলাম',
    riderPhone: '01711-223344',
    deliveryOtp: '9182',
    trackingTimeline: generateDefaultTrackingTimeline('2026-08-24T10:00:00Z', 'Dhaka', 'DELIVERED'),
    reviewSubmitted: true,
    rating: 5,
    reviewText: 'অরিজিনাল তুয়া সুইচ পেয়েছি। বিকাশ পেমেন্টে খুব দ্রুত ২ দিনের মাথায় ডেলিভারি পেয়েছি। ধন্যবাদ QAAGA!',
    createdAt: '2026-08-24T10:00:00Z',
    updatedAt: '2026-08-25T16:45:00Z'
  }
];
