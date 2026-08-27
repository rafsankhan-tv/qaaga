import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  checkBruteForce,
  sanitizeString,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
} from "@/lib/auth-security";
import { AICatChatSchema } from "@/lib/validation";

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (Max 40 messages per 5 minutes per IP)
    const ip = req.headers.get("x-forwarded-for") || "ip_cat_chat";
    const rateCheck = checkBruteForce(`cat_chat_${ip}`, 40, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        {
          success: false,
          error: "Too many messages",
          reply: "মিউ! অতিরিক্ত বার্তার কারণে একটু বিশ্রাম নিচ্ছি। কিছুক্ষণ পর আবার মিউ করুন! 🐾",
        },
        { status: 429 }
      );
    }

    // 2. Request Size Limit (Max 128KB)
    const jsonResult = await parseJsonWithLimit(req, 128 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 3. Zod Input Validation
    const validationResult = AICatChatSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return safeJsonResponse(
        {
          success: false,
          error: validationResult.error.issues[0]?.message || "Invalid message format",
        },
        { status: 400 }
      );
    }

    const { message, history = [] } = validationResult.data;
    const cleanMessage = sanitizeString(message);
    const ai = getGeminiClient();

    const systemInstruction = `You are 'মিউ মিউ এআই ক্যাট অ্যাসিস্ট্যান্ট' (Meow AI Cat Assistant 🐾), the beloved, cheerful, super-smart virtual guide of QAAGA Super Marketplace in Bangladesh (QAAGA.com).
Your mission is to welcome visitors, answer questions, provide instant quotes / price estimates, diagnose issues, suggest top doctors, home nurses, hotels, technician services, ebooks, used products, and jobs, and guide users to place bookings.

Tone & Personality:
- Cheerful, warm, polite, and helpful with cute cat expressions (e.g. "মিউ!", "🐾", "ম্যাও!").
- Language: Primary language is friendly Bengali (বাংলা), but seamlessly reply in English or Banglish if the user asks in English or Banglish.
- Keep answers clear, structured, and practical. Use bullet points or short paragraphs.
- Offer actionable advice and relevant QAAGA service recommendations.

QAAGA Super Marketplace Capabilities & Catalog:
1. Services & Repairs: AC Repair & Gas Refill (৳800-৳2,500), Fridge & Washing Machine Repair, Electrician & Wiring (৳350-৳1,200), Plumbing & Sanitary, Generator & Lift repair. 20% advance booking deposit on platform.
2. Healthcare: Specialist Doctor serials (Medicine, Pediatrics/Child, Gynecology, Dermatology, Cardiology, Orthopedics) with chamber fees from ৳600-৳1,500.
3. Home Nursing & Caregiver: Post-operative patient care, elderly care, baby nursing (৳800/shift or ৳18,000/month).
4. Hotels & Travel: Luxury & Budget Hotels / Resorts in Cox's Bazar (Sea-view), Sajek Valley, Sylhet, Dhaka, Chittagong.
5. Products & Tech: Smartphones, Smartwatches, Bluetooth Earbuds, Home appliances with nationwide COD & fast delivery.
6. Verified Used Devices: Inspected secondhand phones, laptops, and bikes.
7. eBooks & PDF Library: Islamic books, BCS & Govt Job prep, Programming & Freelancing guides, Novel/Literature.
8. Jobs & Careers: Job circulars, skilled technician hiring, delivery rider jobs, remote freelancing.
9. Partner/Seller Registration: Anyone can register as a verified technician, doctor, hotel manager, or seller.

Output Structure:
Provide a warm conversational answer in Bengali or English. At the very end of your response, if relevant to what the user asked, you can optionally suggest a direct navigation target by adding a single JSON line on its own line prefixed with [ACTION]:
[ACTION]{"view":"service_request"|"doctors"|"nurses"|"hotels"|"products"|"ebooks"|"used_products"|"jobs"|"partner_register","label":"বাটন টেক্সট"}
Only output the [ACTION] line if directly relevant to a specific view.`;

    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const h of history.slice(-6)) {
            contents.push({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: sanitizeString(h.content) }],
            });
          }
        }

        contents.push({
          role: "user",
          parts: [{ text: cleanMessage }],
        });

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        let rawText = geminiResponse.text || "মিউ! আমি আপনার কথাটি বুঝতে পেরেছি। আপনাকে কীভাবে সাহায্য করতে পারি? 🐾";

        let actionData: any = null;
        const actionMatch = rawText.match(/\[ACTION\]\s*(\{.*\})/);
        if (actionMatch && actionMatch[1]) {
          try {
            actionData = JSON.parse(actionMatch[1]);
            rawText = rawText.replace(/\[ACTION\]\s*\{.*\}/, "").trim();
          } catch (e) {
            console.warn("Failed to parse action JSON", e);
          }
        }

        return safeJsonResponse({
          success: true,
          reply: rawText,
          action: actionData,
          source: "gemini",
          timestamp: new Date().toISOString(),
        });
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to local smart assistant:", geminiError?.message || geminiError);
      }
    }

    // Local Fallback Engine
    const q = cleanMessage.toLowerCase();
    let reply = "";
    let action: any = null;
    let suggestions: string[] = [];

    if (q.includes("এসি") || q.includes("ac") || q.includes("কুলিং") || q.includes("গ্যাস") || q.includes("ঠান্ডা")) {
      reply = "মিউ! 🐾 এসি সংক্রান্ত সমস্যার জন্য আমাদের ভেরিফাইড টেকনিশিয়ান রয়েছে।\n\n• **এসি বেসিক সার্ভিসিং ও ওয়াশ:** ৳৫০০ - ৳৮০০\n• **গ্যাস রিফিল ও লিক মেরামত:** ৳১,৫০০ - ৳২,৫00\n• **ইনস্টলেশন ও শিফটিং:** ৳১,২০০ - ৳২,০০০\n\nআপনি চাইলে এখনই ২০% অগ্রিম দিয়ে টেকনিশিয়ান বুক করতে পারেন!";
      action = { view: "service_request", label: "এসি সার্ভিস রিকোয়েস্ট দিন 🛠️", params: { categoryId: "cat-ac-repair" } };
      suggestions = ["এসি ওয়াশ করতে কত খরচ?", "গ্যাস রিফিল কত টাকা?", "আজকেই মিস্ত্রি আসবে?"];
    } else if (q.includes("ডাক্তার") || q.includes("doctor") || q.includes("মেডিসিন") || q.includes("জর") || q.includes("চেম্বার") || q.includes("সিরিয়াল")) {
      reply = "ম্যাও! 🩺 আমাদের প্ল্যাটফর্মে মেডিসিন, শিশু, চর্ম, স্ত্রী ও হৃদরোগ বিশেষজ্ঞ ডাক্তারদের অনলাইন সিরিয়াল নেওয়া যায়।\n\n• **চেম্বার ভিজিট ফি:** ৳৬০০ - ৳১,২০০\n• **ভিডিও কনসালটেশন:** ৳৫০০ - ৳১,০০০\n• **তাৎক্ষণিক কনফার্মেশন স্লিপ:** এসএমএস ও অ্যাপ নোটিফিকেশনে পাবেন।";
      action = { view: "doctors", label: "ডাক্তারদের তালিকা ও সিরিয়াল 🩺" };
      suggestions = ["মেডিসিন বিশেষজ্ঞ ডাক্তার", "শিশু বিশেষজ্ঞ ডাক্তার", "ভিডিও কনসালটেশন ফি কত?"];
    } else if (q.includes("নার্স") || q.includes("nurse") || q.includes("কেয়ার") || q.includes("রোগী") || q.includes("বয়স্ক")) {
      reply = "মিউ! 💖 বাসায় বয়োবৃদ্ধ বা পোস্ট-অপারেটিভ রোগীর সেবার জন্য আমাদের প্রশিক্ষিত হোম নার্স ও কেয়ারগিভার সার্ভিস রয়েছে।\n\n• **১২ ঘণ্টার ডে/নাইট ডিউটি:** ৳৮০০ - ৳১,২০০\n• **২৪ ঘণ্টার সার্বক্ষণিক সেবা:** ৳১,৫০০/দিন\n• **মাসিক প্যাকেজ:** ৳১৮,০০০ - ৳২৫,০০০";
      action = { view: "nurses", label: "হোম নার্সিং বুকিং করুন 💖" };
      suggestions = ["২৪ ঘণ্টার নার্স লাগবে", "স্যালাইন ও ইনজেকশন দেওয়ার মিস্ত্রি", "মাসিক কেয়ারগিভার ফি"];
    } else if (q.includes("হোটেল") || q.includes("hotel") || q.includes("কক্সবাজার") || q.includes("রিসোর্ট") || q.includes("সাজেক") || q.includes("সিলহেট") || q.includes("রুম")) {
      reply = "মিউ! 🏨 কক্সবাজার বিচ ভিউ, সাজেক ক্লাউড রিসোর্ট ও সিলেটের টপ রেটেড হোটেলগুলোতে স্পেশাল ডিসকাউন্ট চলছে!\n\n• **কক্সবাজার সি-ভিউ ডিলক্স রুম:** ৳২,৫০০ - ৳৫,৫০০/রাত\n• **সাজেক ভ্যালি রিসোর্ট:** ৳৩,০০০ - ৳৬,০০০/রাত\n• **ফ্রি ব্রেকফাস্ট ও সুইমিং পুল এক্সেস** সহ নিশ্চিত বুকিং।";
      action = { view: "hotels", label: "হোটেল ও রিসোর্ট বুক করুন 🏨" };
      suggestions = ["কক্সবাজার সি ভিউ হোটেল", "সাজেক ভ্যালি রিসোর্ট অফার", "কাপল রুম বুকিং"];
    } else if (q.includes("পণ্য") || q.includes("product") || q.includes("মোবাইল") || q.includes("ঘড়ি") || q.includes("কিনি") || q.includes("দাম") || q.includes("শপ")) {
      reply = "ম্যাও! 🛍️ ট্রেন্ডিং গ্যাজেট, স্মার্টওয়াচ, ব্লুটুথ ইয়ারবাডস এবং হোম অ্যাপ্লায়েন্স সরাসরি হোম ডেলিভারিতে অর্ডার করতে পারেন।\n\n• **সারা দেশে ক্যাশ অন ডেলিভারি (COD)**\n• **৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি**\n• **অরিজিনাল অফিশিয়াল ওয়ারেন্টি**";
      action = { view: "products", label: "মার্কেটপ্লেস শপিং দেখুন 🛍️" };
      suggestions = ["স্মার্টওয়াচ অফার", "ব্লুটুথ ইয়ারবাডস", "ক্যাশ অন ডেলিভারি নিয়ম"];
    } else if (q.includes("বই") || q.includes("ebook") || q.includes("ইবুক") || q.includes("পিডিএফ") || q.includes("pdf") || q.includes("পড়তে")) {
      reply = "মিউ! 📚 আমাদের ডিজিটাল ইবুক লাইব্রেরিতে ইসলামি বই, বিসিএস ও চাকরির প্রস্তুতি, প্রোগ্রামিং এবং ফ্রিকশন নোবেল পাবেন।\n\n• কেনার সাথে সাথে লাইভ ইন-অ্যাপ রিডার ও অফলাইন ডাউনলোড সুবিধা।";
      action = { view: "ebooks", label: "ইবুক লাইব্রেরি ওপেন করুন 📚" };
      suggestions = ["বিসিএস প্রস্তুতির বই", "ইসলামিক বই সমগ্র", "প্রোগ্রামিং ইবুক"];
    } else if (q.includes("পুরাতন") || q.includes("used") || q.includes("সেকেন্ড") || q.includes("ল্যাপটপ") || q.includes("বাইক")) {
      reply = "মিউ! 🏷️ ভেরিফাইড পুরাতন স্মার্টফোন, ল্যাপটপ ও হোম অ্যাপ্লায়েন্স সরাসরি সেলারের কাছ থেকে নিরাপদে কিনুন অথবা আপনার পুরাতন পণ্য বিক্রি করুন।";
      action = { view: "used_products", label: "পুরাতন কেনাবেচা মার্কেট 🏷️" };
      suggestions = ["সেকেন্ড হ্যান্ড মোবাইল", "ব্যবহৃত ল্যাপটপ", "পুরাতন জিনিস বিক্রির নিয়ম"];
    } else if (q.includes("চাকরি") || q.includes("job") || q.includes("নিয়োগ") || q.includes("কাজ") || q.includes("সার্কুলার")) {
      reply = "ম্যাও! 💼 ফুল-টাইম, পার্ট-টাইম ও টেকনিশিয়ান নিয়োগের লেটেস্ট জব সার্কুলারগুলো দেখতে পারবেন অথবা কোম্পানিতে আবেদন করতে পারবেন।";
      action = { view: "jobs", label: "জব সার্কুলার দেখুন 💼" };
      suggestions = ["ডেলিভারি রাইডার জব", "টেকনিশিয়ান জব", "রিমোট পার্ট টাইম কাজ"];
    } else if (q.includes("সেলার") || q.includes("মিস্ত্রি") || q.includes("জয়েন") || q.includes("রেজিস্ট্রেশন") || q.includes("পার্টনার") || q.includes("ইনকাম")) {
      reply = "মিউ! 🌟 আপনি কি টেকনিশিয়ান, ডাক্তার, হোটেল মালিক বা শপ ওনার? QAAGA-তে পার্টনার হিসেবে জয়েন করে প্রতিদিন নতুন কাস্টমার ও ইনকাম বাড়ান!";
      action = { view: "partner_register", label: "পার্টনার হিসেবে যুক্ত হন 🚀" };
      suggestions = ["কীভাবে সেলার একাউন্ট খুলব?", "কমিশন কত কাটে?", "ভেরিফিকেশনে কী লাগবে?"];
    } else {
      reply = `মিউ! 🐾 আমি আপনার কথাটি বুঝতে পেরেছি: "${cleanMessage}"。\n\nআমি QAAGA মার্কেটপ্লেসের সকল সার্ভিস (এসি মেরামত, ইলেকট্রিশিয়ান, প্লাম্বার), ডাক্তার অ্যাপয়েন্টমেন্ট, হোম নার্সিং, হোটেল বুকিং, অনলাইন পণ্য ও জবসের সঠিক তথ্য দিতে পারি। আপনার ঠিক কী সাহায্য লাগবে আমাকে বলুন!`;
      action = { view: "service_request", label: "সার্ভিস বা পণ্য খুঁজুন 🔍" };
      suggestions = ["এসি মেরামত মিস্ত্রি", "মেডিসিন বিশেষজ্ঞ ডাক্তার", "কক্সবাজার হোটেল অফার", "পার্টনার রেজিস্ট্রেশন"];
    }

    return safeJsonResponse({
      success: true,
      reply: reply,
      action: action,
      suggestions: suggestions,
      source: "local-assistant",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return handleSecureApiError(err, "AI Cat Chat Route");
  }
}
