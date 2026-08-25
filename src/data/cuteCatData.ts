import { CuteCatAssistantSettings } from '../types';

export interface CuteCatSkinPreset {
  id: 'orange-tabby' | 'white-kitty' | 'calico-neko' | 'lucky-black' | 'custom';
  name: string;
  badge: string;
  description: string;
  defaultAvatarUrl?: string;
}

export const CUTE_CAT_SKIN_PRESETS: CuteCatSkinPreset[] = [
  {
    id: 'orange-tabby',
    name: 'অরেঞ্জ টেবি জিঞ্জার (Orange Ginger Tabby)',
    badge: 'সবচেয়ে জনপ্রিয় 🐱',
    description: 'গোলগাল মিষ্টি অরেঞ্জ ক্যাট, চোখে সবুজ গ্লিটার ও সোনালী ঘণ্টার মালা।'
  },
  {
    id: 'white-kitty',
    name: 'হোয়াইট কিটেন চিবি (Snow White Chibi)',
    badge: 'কিউট প্রিন্সেস 🌸',
    description: 'তুষারশুভ্র তুলতুলে বিড়ালছানা, নীল মণি চোখ ও গোলাপি গাল।'
  },
  {
    id: 'calico-neko',
    name: 'ক্যালিকো লাকি ন্যাকো (Lucky Calico Neko)',
    badge: 'সৌভাগ্যের প্রতীক ✨',
    description: 'ত্রিবর্ণ লাকি জাপানিজ ক্যাট, যা সমৃদ্ধি ও আনন্দ বয়ে আনে।'
  },
  {
    id: 'lucky-black',
    name: 'মিডনাইট গোল্ডেন আই (Midnight Black Cat)',
    badge: 'রয়্যাল লুক 🐾',
    description: 'চকচকে কালো বিড়াল, উজ্জ্বল সোনালী চোখ ও লাল কলার।'
  }
];

export const INITIAL_CUTE_CAT_SETTINGS: CuteCatAssistantSettings = {
  isEnabled: true,
  catName: 'মিউ মিউ অ্যাসিস্ট্যান্ট (Mew Mew)',
  catSubtitleBangla: 'আপনার সার্বক্ষণিক সেবা সহকারী',
  catSkin: 'orange-tabby',
  bounceStyle: 'jumping',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  runSpeedSeconds: 4,
  speechIntervalSeconds: 3.5,
  messages: [
    'তুমি কি চাও আমাকে বলো? আমি খুঁজে দিচ্ছি! 🐾✨',
    'ডাক্তার সিরিয়াল, এসি মেরামত নাকি নতুন গ্যাজেট? আমাকে জিজ্ঞেস করুন! 🩺🔧',
    'আজকের সেরা অফার ও ডিসকাউন্ট জানতে আমাকে ট্যাপ করুন 🎁',
    'যেকোনো জরুরি সার্ভিসে দ্রুত টেকনিশিয়ান পেতে আমাকে বলুন ⚡',
    'হোটেল বুকিং বা ঘরে বসে অর্ডার — সব পাবেন এক ক্লিকে! 🏨🛒'
  ],
  enableFloatingOnScroll: true,
  scrollThresholdPx: 300,
  floatingPosition: 'bottom-right',
  floatingScale: 0.9,
  trackBackgroundColor: 'bg-gradient-to-r from-purple-50 via-amber-50/60 to-purple-50',
  trackBorderColor: 'border-purple-200/80',
  showPawPrints: true,
  showGrassPuff: true,
  quickChips: [
    { id: 'chip-1', label: '🩺 ডাক্তার বুকিং', view: 'doctors' },
    { id: 'chip-2', label: '❄️ এসি মেরামত', view: 'service_request', params: { categoryId: 'cat-ac-repair' } },
    { id: 'chip-3', label: '🏨 হোটেল ও রিসোর্ট', view: 'hotels' },
    { id: 'chip-4', label: '⚡ ইলেকট্রিশিয়ান', view: 'service_request', params: { categoryId: 'cat-electrician' } },
    { id: 'chip-5', label: '🛍️ ট্রেন্ডিং প্রোডাক্ট', view: 'products' },
    { id: 'chip-6', label: '💼 চাকরির সার্কুলার', view: 'jobs' }
  ]
};
