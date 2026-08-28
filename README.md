# QAAGA Super Marketplace 🛍️🛠️🩺

> **বাংলাদেশের অন্যতম সর্বাধুনিক মাল্টি-সার্ভিস ও ই-কমার্স প্ল্যাটফর্ম**  
> *A high-performance, modular, and scalable multi-service marketplace ecosystem built with React 19, TypeScript, Tailwind CSS v4, Node.js 20 LTS, PostgreSQL, and Gemini AI.*

---

## 📌 সূচিপত্র / Table of Contents

1. [প্রজেক্ট পরিচিতি (Project Overview)](#1-প্রজেক্ট-পরিচিতি-project-overview)
2. [টেকনোলজি স্ট্যাক (Modern Technology Stack)](#2-টেকনোলজি-স্ট্যাক-modern-technology-stack)
3. [সিস্টেম আর্কিটেকচার ও ফোল্ডার স্ট্রাকচার (System Architecture)](#3-সিস্টেম-আর্কিটেকচার-ও-ফোল্ডার-স্ট্রাকচার)
4. [লোকাল ডেভেলপমেন্ট রান করার নিয়ম (Local Development)](#4-লোকাল-ডেভেলপমেন্ট-রান-করার-নিয়ম)
5. [Vercel-এ ডেপ্লয় করার গাইড (GitHub ➔ Vercel Deployment)](#5-vercel-এ-ডেপ্লয়-করার-গাইড-github--vercel)
6. [VPS (Ubuntu / Linux) সার্ভারে ডেপ্লয় করার গাইড (GitHub ➔ VPS)](#6-vps-ubuntu--linux-সার্ভারে-ডেপ্লয়-করার-গাইড)
7. [PostgreSQL ডাটাবেস ইনিশিয়ালাইজেশন ও মাইগ্রেশন](#7-postgresql-ডাটাবেস-ইনিশিয়ালাইজেশন)
8. [ভবিষ্যতে নতুন সার্ভিস মডিউল যুক্ত করার নিয়ম (Future Module Scalability)](#8-ভবিষ্যতে-নতুন-সার্ভিস-মডিউল-যুক্ত-করার-নিয়ম)
9. [সিকিউরিটি ও প্রোডাকশন চেকলিস্ট (Security Best Practices)](#9-সিকিউরিটি-ও-প্রোডাকশন-চেকলিস্ট)

---

## 1. প্রজেক্ট পরিচিতি (Project Overview)

**QAAGA.com** একটি বহুমুখী সুপার মার্কেটপ্লেস যাতে রয়েছে:
- **অন-ডিমান্ড হোম সার্ভিসেস ও মেরামত**: এসি, ফ্রিজ, ওয়াশিং মেশিন, ইলেকট্রিশিয়ান, প্লাম্বার ইত্যাদি (২০% অগ্রিম বুকিং ফি সহ এসক্রো সিস্টেম)।
- **স্পেশালিস্ট ডাক্তার অ্যাপয়েন্টমেন্ট**: মেডিসিন, শিশু, স্ত্রী রোগ, হৃদরোগ ইত্যাদি বিশেষজ্ঞ চিকিৎসকদের চেম্বার সিরিয়াল।
- **হোম নার্সিং ও কেয়ারগিভার**: রোগী ও বয়োবৃদ্ধদের সেবায় ১২/২৪ ঘণ্টার শিফট ও মাসিক কেয়ার প্যাকেজ।
- **হোটেল ও রিসোর্ট বুকিং**: কক্সবাজার, সাজেক ভ্যালি ও সিলেটের হোটেল ও রিসোর্টে বিশেষ ছাড় সহ রুম বুকিং।
- **ই-কমার্স প্রোডাক্ট মার্কেটপ্লেস**: স্মার্টফোন, গ্যাজেট ও হোম অ্যাপ্লায়েন্স সারা দেশে ক্যাশ অন ডেলিভারি (COD)।
- **ভেরিফাইড পুরাতন কেনাবেচা মার্কেট**: সেকেন্ডহ্যান্ড ফোন, ল্যাপটপ ও হোম অ্যাপ্লায়েন্স নিরাপদ কেনাবেচা।
- **ডিজিটাল ইবুক ও পিডিএফ লাইব্রেরি**: ইসলামিক, বিসিএস প্রস্তুতি ও প্রোগ্রামিং বই ইন-অ্যাপ রিডার।
- **জব সার্কুলার ও ক্যারিয়ার পোর্টাল**: ডেলিভারি রাইডার, টেকনিশিয়ান ও অফিস নিয়োগ বিজ্ঞপ্তি।
- **পূর্ণাঙ্গ মার্চেন্ট স্টোরফ্রন্ট ও ড্যাশবোর্ড**: সেলারদের নিজস্ব দোকান, ইনভেন্টরি, অর্ডার প্রসেসিং ও বিকাশ/নগদ পে-আউট।
- **অ্যাডমিন কন্ট্রোল পোর্টাল**: রিকোয়েস্ট মডারেশন, সেলার অনুমোদন, স্লাইডার ব্যানার, এসক্রো ব্যালেন্স ও উইথড্রয়াল ম্যানেজমেন্ট।
- **সুচি ও মিউ মিউ এআই অ্যাসিস্ট্যান্ট**: জেমিনাই এআই ও লোকাল ইঞ্জিন সমন্বয়ে তৈরি বুদ্ধিমান সাপোর্ট অ্যাসিস্ট্যান্ট।

---

## 2. টেকনোলজি স্ট্যাক (Modern Technology Stack)

| কম্পোনেন্ট | ব্যবহৃত টেকনোলজি | বিবরণ |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19 + TypeScript 5.8** | টাইপ-সেফ, সুপার ফাস্ট রেন্ডারিং ও অপটিমাইজড স্টেট |
| **Styling** | **Tailwind CSS v4** | মডার্ন ইউটিলিটি ক্লাস, হাই-পারফরম্যান্স সিএসএস ইঞ্জিন |
| **Animation** | **Motion (`motion/react`)** | স্মুথ ট্রানজিশন ও মাইক্রো-ইন্টারেকশন |
| **Icons** | **Lucide React** | লাইটওয়েট ও কনসিস্টেন্ট ভেক্টর আইকন |
| **Backend Server** | **Node.js 20 LTS + Express** | সিকিউর RESTful API, সার্ভার-সাইড ভ্যালিডেশন ও প্রক্সি |
| **Database Layer** | **PostgreSQL 16 + Connection Pool** | রিলেশনাল ডাটাবেস, ইনডেক্সিং, ট্রানজ্যাকশন ও স্কেলাবিলিটি |
| **AI Engine** | **Google Gemini 3.7 Flash** | প্রেসক্রিপশন ইমেজ এনালাইসিস, ন্যাচারাল চ্যাট ও কোটেশন |
| **Container & CI/CD** | **Docker + Docker Compose** | মাল্টি-স্টেজ লাইটওয়েট কন্টেইনারাইজেশন |
| **Web Server** | **Nginx** | রিভার্স প্রক্সি, Gzip কম্প্রেশন, SSL ও রেট লিমিটার |
| **Deployment Targets** | **Vercel & Linux VPS (Ubuntu)** | ডুয়াল ডেপ্লয়মেন্ট রেডি আর্কিটেকচার |

---

## 3. সিস্টেম আর্কিটেকচার ও ফোল্ডার স্ট্রাকচার

```
qaaga-super-marketplace/
├── Dockerfile                 # মাল্টি-স্টেজ প্রোডাকশন ডকার ফাইল
├── docker-compose.yml         # অ্যাপ + PostgreSQL ১৬ অর্কেস্ট্রেশন
├── nginx.conf                 # প্রোডাকশন Nginx রিভার্স প্রক্সি কনফিগারেশন
├── vercel.json                # Vercel ডেপ্লয়মেন্ট ও রাউটিং রুলস
├── .env.example               # এনভায়রনমেন্ট ভেরিয়েবল টেমপ্লেট
├── package.json               # প্রোডাকশন বিল্ড ও ডিপেন্ডেন্সি স্ক্রিপ্ট
├── server.ts                  # সিকিউর এক্সপ্রেস ব্যাকএন্ড সার্ভার
├── tsconfig.json              # টাইপস্ক্রিপ্ট কনফিগারেশন
├── vite.config.ts             # Vite ৬ ও Tailwind v4 কনফিগারেশন
├── metadata.json              # অ্যাপ মেটাডাটা ও ক্যাপাবিলিটি
├── src/
│   ├── App.tsx                # প্রধান অ্যাপ্লিকেশন রুট ও ভিউ রাউটার
│   ├── index.css              # গ্লোবাল টেইলউইন্ড সিএসএস (@import "tailwindcss";)
│   ├── main.tsx               # ক্লায়েন্ট এন্ট্রি পয়েন্ট
│   ├── components/            # রিইউজেবল ইউআই কম্পোনেন্টস
│   │   ├── layout/            # হেডার, নেভবার, ফুটার, বটম বার
│   │   ├── common/            # বাটন, মডাল, ফর্ম কন্ট্রোলস, অ্যালার্ট
│   │   ├── shop/              # প্রোডাক্ট কার্ড, ফিল্টার, সেলার প্রোফাইল মডাল
│   │   ├── feed/              # সোশ্যাল লাইভ ফিড, পোস্ট শেয়ারিং
│   │   └── chat/              # লাইভ চ্যাট উইজেট, মেসেজিং
│   ├── db/                    # ডাটাবেস লেয়ার
│   │   ├── schema.sql         # প্রোডাকশন PostgreSQL DDL স্কিমা ও ইনডেক্স
│   │   └── database.ts        # ডাটাবেস কানেকশন পুল ও কুয়েরি সার্ভিস
│   ├── lib/                   # ইউটিলিটি ও কোর লাইব্রেরি
│   │   ├── firebase.ts        # ফায়ারবেস ক্লায়েন্ট অ্যাডাপ্টার
│   │   └── serviceRegistry.ts # এক্সটেনসিবল সার্ভিস মডিউল রেজিস্ট্রি ইঞ্জিন
│   ├── services/              # বিজনেস লজিক ও লোকাল সিঙ্ক সার্ভিস
│   │   └── marketplaceStore.ts# সেন্ট্রালাইজড মার্কেটপ্লেস স্টোর
│   ├── types/                 # সেন্ট্রালাইজড টাইপস্ক্রিপ্ট ইন্টারফেস
│   │   └── index.ts           # সকল ডাটা টাইপ ও ইনাম ডেফিনিশন
│   ├── data/                  # ইনিশিয়াল ক্যাটাগরি, ব্যানার ও সিড ডাটা
│   └── views/                 # মূল ভিউ/পেজ কম্পোনেন্টস
│       ├── HomeView.tsx
│       ├── ProductsView.tsx
│       ├── SellerStorefrontView.tsx
│       ├── SellerDashboardView.tsx
│       ├── AdminPortalView.tsx
│       ├── DoctorsView.tsx
│       ├── NurseCaregiverView.tsx
│       ├── HotelsView.tsx
│       ├── EbooksView.tsx
│       ├── JobsView.tsx
│       ├── UsedProductsView.tsx
│       └── ...
```

---

## 4. লোকাল ডেভেলপমেন্ট রান করার নিয়ম

### পূর্বশর্ত (Prerequisites):
- **Node.js**: v20.x বা তার পরবর্তী ভার্সন
- **npm** অথবা **bun**

### রান করার ধাপসমূহ:

1. **রিপোজিটরি ক্লোন করুন**:
   ```bash
   git clone https://github.com/your-username/qaaga-marketplace.git
   cd qaaga-marketplace
   ```

2. **ডিপেন্ডেন্সি ইন্সটল করুন**:
   ```bash
   npm install
   ```

3. **এনভায়রনমেন্ট কনফিগার করুন**:
   ```bash
   cp .env.example .env
   ```
   *(প্রয়োজন অনুসারে `.env` ফাইলে জেমিনাই এআই কী বা ডাটাবেস ইউআরএল সেট করুন)*

4. **ডেভেলপমেন্ট সার্ভার চালু করুন**:
   ```bash
   npm run dev
   ```
   সার্ভার চালু হবে: **`http://localhost:3000`**

5. **প্রোডাকশন বিল্ড টেস্ট করতে**:
   ```bash
   npm run build
   npm start
   ```

---

## 5. Vercel-এ ডেপ্লয় করার গাইড (GitHub ➔ Vercel)

প্রজেক্টটিতে `vercel.json` ইতিমধ্যে অপটিমাইজ করা আছে।

### ধাপ ১: GitHub রিপোজিটরিতে কোড পুশ করুন
```bash
git add .
git commit -m "Production release for QAAGA Super Marketplace"
git push origin main
```

### ধাপ ২: Vercel-এ ইমপোর্ট করুন
1. [vercel.com](https://vercel.com)-এ লগইন করে **"Add New" ➔ "Project"** সিলেক্ট করুন।
2. আপনার GitHub রিপোজিটরি পছন্দ করে **Import** ক্লিক করুন।
3. **Build and Output Settings** স্বয়ংক্রিয়ভাবে ডিটেক্ট হবে:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** সেকশনে নিচের ভেরিয়েবলগুলো যোগ করুন:
   - `GEMINI_API_KEY`: আপনার জেমিনাই এআই কী
   - `DATABASE_URL`: আপনার PostgreSQL ডাটাবেস স্ট্রিং (যেমন: Neon, Supabase বা AWS RDS)
5. **Deploy** বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে আপনার লাইভ ওয়েবসাইট প্রস্তুত হয়ে যাবে!

---

## 6. VPS (Ubuntu / Linux) সার্ভারে ডেপ্লয় করার গাইড

VPS সার্ভারে আপনি **Docker Compose** অথবা **PM2 + Nginx** উভয় পদ্ধতিতেই নিরাপদে ডেপ্লয় করতে পারেন।

### পদ্ধতি ক: Docker Compose দিয়ে ডেপ্লয় (সর্বাধিক প্রস্তাবিত)

১. **VPS সার্ভারে Docker ও Docker Compose ইন্সটল করুন**:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose git
   ```

২. **প্রজেক্ট ক্লোন করুন**:
   ```bash
   git clone https://github.com/your-username/qaaga-marketplace.git /var/www/qaaga
   cd /var/www/qaaga
   ```

৩. **`.env` ফাইল তৈরি করুন**:
   ```bash
   cp .env.example .env
   nano .env
   ```

৪. **কন্টেইনার বিল্ড ও চালু করুন**:
   ```bash
   docker-compose up -d --build
   ```
   এটি স্বয়ংক্রিয়ভাবে:
   - অ্যাপ কন্টেইনার বিল্ড ও রান করবে
   - PostgreSQL ১৬ ডাটাবেস রান করবে এবং `schema.sql` দিয়ে টেবিল ও ইনডেক্স তৈরি করবে।

---

### পদ্ধতি খ: PM2 ও Nginx দিয়ে সরাসরি ডেপ্লয়

১. **Node.js 24 LTS ও PM2 ইন্সটল করুন**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt install -y nodejs nginx postgresql postgresql-contrib
   sudo npm install -g pm2
   ```

২. **প্রজেক্ট বিল্ড করুন**:
   ```bash
   cd /var/www/qaaga
   npm ci
   npm run build
   ```

৩. **PM2 দিয়ে ব্যাকগ্রাউন্ডে রান করুন**:
   ```bash
   pm2 start npm --name "qaaga-app" -- start
   pm2 save
   pm2 startup
   ```

৪. **Nginx কনফিগারেশন সেট করুন**:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/qaaga.com
   sudo ln -s /etc/nginx/sites-available/qaaga.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

৫. **ফ্রি SSL সার্টিফিকেট (Let's Encrypt) একটিভ করুন**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d qaaga.com -d www.qaaga.com
   ```

---

## 7. PostgreSQL ডাটাবেস ইনিশিয়ালাইজেশন

সম্পূর্ণ প্রোডাকশন DDL স্কিমা `/src/db/schema.sql` ফাইলে দেওয়া আছে।

যেকোনো PostgreSQL সার্ভারে স্কিমা ইমপোর্ট করার কমান্ড:
```bash
psql -U qaaga_user -d qaaga_db -f src/db/schema.sql
```

**ডাটাবেসে অন্তর্ভুক্ত প্রধান সুবিধাসমূহ:**
- ইউজার ও আরবিক ভেরিফিকেশন (Users & Roles: Customer, Provider, Seller, Admin, Doctor, Nurse)
- সেলার ও মার্চেন্ট স্টোর ম্যানেজমেন্ট (Seller Stores, Trade License, Balances)
- এসক্রো সার্ভিসেস ও ২০% অ্যাডভান্স বুকিং ট্র্যাকিং (Service Requests, Advance Deposits)
- প্রোডাক্টস ও অর্ডার ম্যানেজমেন্ট (Products, Orders, Tracking)
- ডাক্তার, নার্সিং ও হোটেল বুকিং মডিউল
- ডিজিটাল ইবুক লাইব্রেরি ও ডাউনলোড অথরাইজার
- রিভিউ ও রেটিং সিস্টেম

---

## 8. ভবিষ্যতে নতুন সার্ভিস মডিউল যুক্ত করার নিয়ম

প্রজেক্টটিতে **`src/lib/serviceRegistry.ts`** আর্কিটেকচার যুক্ত করা হয়েছে। ভবিষ্যতে যদি আপনি নতুন যেকোনো সার্ভিস (যেমন: *অ্যাম্বুলেন্স, রেন্ট-এ-কার, হোম টিউটর, বিউটি পার্লার, ডিজিটাল ডাউনলোড*) চালু করতে চান, তাহলে মূল কোড ভাঙার প্রয়োজন নেই:

১. `src/lib/serviceRegistry.ts`-এ নতুন মডিউল অবজেক্ট যোগ করুন:
```typescript
serviceRegistry.registerModule({
  id: 'rent_a_car',
  nameBn: 'রেন্ট-এ-কার ও ড্রাইভার সার্ভিস',
  nameEn: 'Rent-A-Car & Drivers',
  categoryGroup: 'AUTOMOBILE',
  icon: 'Car',
  descriptionBn: 'ঢাকা ও আন্তঃজেলা ট্রিপের জন্য নিরাপদ গাড়ি ভাড়া',
  isActive: true,
  requiresAdvanceDeposit: true,
  depositPercentage: 20,
  pricingType: 'DAILY',
  targetView: 'service_request'
});
```
২. এটি স্বয়ংক্রিয়ভাবে সার্চবার, ক্যাটাগরি প্যানেল, এআই অ্যাসিস্ট্যান্ট এবং বুকিং ফ্লোতে ইন্টিগ্রেট হয়ে যাবে!

---

## 9. সিকিউরিটি ও প্রোডাকশন চেকলিস্ট

- [x] **No Secrets in Source Code**: কোনো এপিআই কী, পাসওয়ার্ড বা সিক্রেট কোডে হার্ডকোড করা নেই; সবই `.env` দিয়ে নিয়ন্ত্রিত।
- [x] **Server-side API Protection**: সংবেদনশীল সকল এআই কল এবং পেমেন্ট ভ্যালিডেশন নোড.জেএস সার্ভার সাইডে নিয়ন্ত্রিত।
- [x] **Safe Fallback Engine**: এআই জেমিনাই অফলাইন বা কী সেট না থাকলেও লোকাল ইন্টেলিজেন্ট ইঞ্জিন সার্বক্ষণিক সক্রিয় থাকবে।
- [x] **Escrow & Financial Safety**: ২০% অ্যাডভান্স বুকিং ফি এবং সেলার উইথড্রয়াল প্রসেসিং অ্যাডমিন দ্বারা মডারেটেড।
- [x] **XSS & Frame Protection**: সিকিউরিটি হেডার্স ও স্যানিটাইজেশন কনফিগারেশন সংযুক্ত।
- [x] **Type Safety**: TypeScript 5.8 এর স্ট্রং টাইপিং ও কম্পাইলেশন যাচাইকৃত।

---

**Crafted with dedication for QAAGA Super Marketplace — The Ultimate Multi-Service Ecosystem in Bangladesh.**
