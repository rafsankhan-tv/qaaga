import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  checkBruteForce,
  sanitizeString,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
} from "@/lib/auth-security";
import { SuchiChatSchema } from "@/lib/validation";

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
    const ip = req.headers.get("x-forwarded-for") || "ip_suchi_chat";
    const rateCheck = checkBruteForce(`suchi_chat_${ip}`, 40, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        {
          success: false,
          error: "Too many messages",
          reply: "আসসালামু আলাইকুম! অতিরিক্ত অনুরোধের কারণে সাময়িক বিরতি নেওয়া হয়েছে। কিছুক্ষণ পর পুনরায় বার্তা দিন।",
        },
        { status: 429 }
      );
    }

    // 2. Request Size Limit (Max 8MB for vision image upload)
    const jsonResult = await parseJsonWithLimit(req, 8 * 1024 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 3. Zod Input Validation
    const validationResult = SuchiChatSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return safeJsonResponse(
        {
          success: false,
          error: validationResult.error.issues[0]?.message || "Invalid message payload",
        },
        { status: 400 }
      );
    }

    const { message, image, history = [] } = validationResult.data;
    const cleanMessage = sanitizeString(message || "");
    const ai = getGeminiClient();

    const suchiSystemInstruction = `You are 'সুচি' (Suchi), the friendly, highly respectful, knowledgeable, and polite Chief Virtual Customer Support Executive & Super Marketplace Guide for QAAGA Super Marketplace in Bangladesh (qaaga.com).

Role, Etiquette & Conversational Guidelines:
- Respect & Politeness (সম্মান ও ভদ্রতা): Always address the user with deep respect using 'আপনি' (Apni). Always maintain a warm, hospitable, professional, and caring tone.
- When asked "কেমন আছো", "kmn aco", "কেমন আছেন", or general wellbeing:
  Always answer politely and gratefully: e.g., "আলহামদুলিল্লাহ, আপনার দোয়ায় আমি বেশ ভালো আছি। আপনি কেমন আছেন? আশা করি ভালো ও সুস্থ আছেন। আজ আপনাকে কীভাবে সহায়তা করতে পারি বলুন।"
- Natural Conversation (স্বাভাবিক কথোপকথন): Respond naturally and pleasantly to greetings (আসসালামু আলাইকুম, নমস্কার, হ্যালো, কেমন আছেন, কী করছ, ধন্যবাদ, ভালো থেকো ইত্যাদি) without being stiff or overly rigid.
- Service Assistance (সার্ভিস সহায়তা): Whenever the user asks for or indicates a need for any service, understand their requirements clearly and provide accurate, practical guidance, prices, and booking help.

Deep Knowledge Base of QAAGA Super Marketplace:
1. Specialist Doctor Appointments:
   - 100+ verified specialist doctors in Medicine, Pediatrics (শিশু রোগ), Gynecology & Obstetrics (স্ত্রী রোগ ও প্রসূতি), Cardiology (হৃদরোগ), Orthopedics (হাড় ও জোড়া), Dermatology (চর্ম ও যৌন), ENT (নাক, কান, গলা), Surgery.
   - Chamber visit fees: ৳600 to ৳1,200.
   - Instant booking confirmation and SMS prescription record.
2. On-Demand Home Services & Technician Repairs:
   - AC Repair & Servicing: Jet wash (৳500-৳800), Master Servicing (৳1,000-৳1,500), Gas Refill & Leak fix (৳1,500-৳2,500).
   - Refrigerator & Deep Fridge repair, Washing machine repair.
   - Electrician & Wiring: Short circuit fix, switch board, fan & light installation (৳350-৳1,200).
   - Plumbing & Sanitary: Water motor, pipe leak, tap & commode installation (৳300-৳1,000).
   - Generator & Lift/Elevator repair.
   - Technicians reach the customer within 1 hour. 20% advance booking deposit required on the platform.
3. Home Nursing & Patient Caregivers:
   - Trained nurses and caregivers for elderly, post-operative, paralyzed, or newborn baby care at home.
   - 12-Hour Day/Night Shift: ৳800 - ৳1,200.
   - 24-Hour Full-day Care: ৳1,500/day.
   - Monthly Dedicated Packages: ৳18,000 - ৳25,000/month.
4. Hotels & Travel Resorts:
   - Verified luxury and budget hotels in Cox's Bazar (Sea-View Deluxe ৳2,500-৳5,500/night), Sajek Valley (Cloud View Resorts ৳3,000-৳6,000/night), Sylhet (Tea Garden Resorts), Dhaka, and Chittagong.
   - Special discounts, free breakfast, and instant room confirmation.
5. Marketplace Products & Online Gadgets:
   - Official smartphones, smartwatches, Bluetooth wireless earbuds, power banks, and home appliances.
   - Nationwide Cash on Delivery (COD) and 7-day replacement warranty.
6. Verified Used Products Market:
   - Inspected second-hand smartphones, laptops, desktop computers, and motorbikes. Direct buyer-seller deals with safety guarantee.
7. Digital eBooks & PDF Library:
   - Islamic literature, BCS & Govt Job exam preparation, Programming & Freelancing guides, Bengali Novels. Instant read inside the app.
8. Job Circulars & Career:
   - Delivery rider jobs, home service technician hiring, electrician & technician jobs, remote and office jobs with direct online apply.
9. Partner & Merchant Registration:
   - Technicians, Doctors, Hotel Owners, and Shop Sellers can register to get daily clients and boost business earnings.
10. Hotlines & Direct Support:
    - 24/7 Hotline: 09658824360
    - WhatsApp Support: +8801644985301
    - Official Email: qaaga@consultant.com

Image & Prescription Analysis Capability:
If an image is attached, inspect it carefully:
- If it is a medical prescription or test report: identify what medicine/specialist it refers to and recommend the relevant doctor department.
- If it is a broken machine, AC part, electrical board, or plumbing problem: diagnose the probable issue and recommend the exact technician service.
- If it is a hotel, product, or book: explain how the user can book or purchase it on QAAGA.

Action Suggestion:
At the very end of your response, if relevant to a specific view, append a single line:
[ACTION]{"view":"doctors"|"service_request"|"nurses"|"hotels"|"products"|"ebooks"|"used_products"|"jobs"|"partner_register"|"contact","label":"বাটন টেক্সট"}
Keep answers concise, sweet, respectful, and natural.`;

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

        const currentParts: any[] = [];

        if (image && typeof image === "string") {
          let mimeType = "image/jpeg";
          let base64Data = image;

          if (image.includes(",")) {
            const split = image.split(",");
            const match = split[0].match(/data:(.*?);base64/);
            if (match) {
              const detectedMime = match[1].toLowerCase();
              // Strict MIME allowlist for images
              if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(detectedMime)) {
                mimeType = detectedMime;
              }
            }
            base64Data = split[1];
          }

          currentParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          });
        }

        currentParts.push({
          text: cleanMessage || (image ? "দয়া করে এই ছবিটি বিশ্লেষণ করে আমাকে সাহায্য করুন।" : "আসসালামু আলাইকুম!"),
        });

        contents.push({
          role: "user",
          parts: currentParts,
        });

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: contents,
          config: {
            systemInstruction: suchiSystemInstruction,
            temperature: 0.65,
          },
        });

        let rawReply = geminiResponse.text || "আসসালামু আলাইকুম! আমি সুচি। আমি আপনার বার্তাটি পেয়েছি এবং আপনাকে সর্বোত্তম সাহায্য করতে প্রস্তুত।";

        let actionData: any = null;
        const actionMatch = rawReply.match(/\[ACTION\]\s*(\{.*\})/);
        if (actionMatch && actionMatch[1]) {
          try {
            actionData = JSON.parse(actionMatch[1]);
            rawReply = rawReply.replace(/\[ACTION\]\s*\{.*\}/, "").trim();
          } catch (e) {
            console.warn("Failed to parse action JSON", e);
          }
        }

        return safeJsonResponse({
          success: true,
          reply: rawReply,
          action: actionData,
          source: "gemini-ai",
          timestamp: new Date().toISOString(),
        });
      } catch (geminiErr: any) {
        console.warn("Suchi Gemini API call error, using smart fallback:", geminiErr?.message || geminiErr);
      }
    }

    // High Intelligence Fallback Logic for Suchi across all services
    const q = cleanMessage.toLowerCase();
    let reply = "";
    let action: any = null;

    if (image) {
      reply = "ধন্যবাদ ছবিটি পাঠানোর জন্য! আমি আপনার প্রেসক্রিপশন বা ছবিটি সফলভাবে পেয়েছি। আমাদের বিশেষজ্ঞ টিম এটি যাচাই করে উপযুক্ত ডাক্তার বা অভিজ্ঞ টেকনিশিয়ান সার্ভিস দ্রুত কনফার্ম করবে।";
      action = { view: "doctors", label: "ডাক্তার সিরিয়াল দেখুন 🩺" };
    } else if (q.includes("কেমন") || q.includes("kmn") || q.includes("kemon") || q.includes("valo aco") || q.includes("bhalo acho") || q.includes("how are you") || q.includes("valasen") || q.includes("bhalo achen")) {
      reply = "আলহামদুলিল্লাহ, আপনার দোয়ায় আমি বেশ ভালো আছি। আপনি কেমন আছেন? আশা করি আপনি ভালো ও সুস্থ আছেন। QAAGA-এর যেকোনো সার্ভিস বুকিং বা তথ্যের জন্য আমাকে নিঃসংকোচে বলতে পারেন।";
    } else if (q.includes("সালাম") || q.includes("salam") || q.includes("assalamu") || q.includes("হাই") || q.includes("হ্যালো") || q.includes("hello") || q.includes("hi")) {
      reply = "আসসালামু আলাইকুম! আমি সুচি, আপনার পার্সোনাল কাস্টমার সাপোর্ট অ্যাসিস্ট্যান্ট। আশা করি আপনি ভালো আছেন। আজ আপনাকে কীভাবে সহায়তা করতে পারি বলুন?";
    } else if (q.includes("ধন্যবাদ") || q.includes("thanks") || q.includes("thank you")) {
      reply = "আপনাকে অসংখ্য ধন্যবাদ! আপনার পাশে থাকতে পেরে আমি আনন্দিত। যেকোনো সময় যেকোনো প্রয়োজনে আমাকে ডাকবেন।";
    } else if (q.includes("কি কর") || q.includes("কী কর") || q.includes("ki koro") || q.includes("ki korcho")) {
      reply = "আমি আপনাদের সেবায় সার্বক্ষণিক প্রস্তুত আছি। ডাক্তার সিরিয়াল, এসি বা হোম সার্ভিস, নার্সিং বা হোটেল বুকিংয়ে কোনো সাহায্য লাগবে কি?";
    } else if (q.includes("ডাক্তার") || q.includes("doctor") || q.includes("সিরিয়াল") || q.includes("রোগী") || q.includes("মেডিসিন") || q.includes("প্রেসক্রিপশন")) {
      reply = "ডাক্তার অ্যাপয়েন্টমেন্টের জন্য আমাদের বিশেষজ্ঞ প্যানেলে ১০০ জনেরও বেশি ভেরিফাইড ডাক্তার রয়েছেন। মেডিসিন, শিশু, চর্ম, স্ত্রী রোগ, হৃদরোগ ও হাড়জোড়া বিশেষজ্ঞ ডাক্তারদের ফি ৬০০ থেকে ১২০০ টাকা। আপনি কোন বিশেষজ্ঞ ডাক্তার দেখাতে চান আমাকে জানান।";
      action = { view: "doctors", label: "ডাক্তারদের তালিকা দেখুন 🩺" };
    } else if (q.includes("এসি") || q.includes("ac") || q.includes("ফ্রিজ") || q.includes("সার্ভিস") || q.includes("হোম সার্ভিস") || q.includes("মিস্ত্রি") || q.includes("কাজ") || q.includes("ইলেকট্রিক") || q.includes("প্লাম্বার")) {
      reply = "আমাদের অভিজ্ঞ হোম সার্ভিস টেকনিশিয়ানরা ১ ঘণ্টার মধ্যে আপনার ঠিকানায় পৌঁছাতে প্রস্তুত। এসি ওয়াশ ও গ্যাস রিফিল, ফ্রিজ মেরামত, ইলেকট্রিক ওয়্যারিং এবং প্লাম্বিং যেকোনো প্রয়োজনে আমরা আছি। ২০% অগ্রিম দিয়ে এখনই রিকোয়েস্ট করতে পারেন।";
      action = { view: "service_request", label: "সার্ভিস রিকোয়েস্ট দিন 🛠️" };
    } else if (q.includes("নার্স") || q.includes("nurse") || q.includes("কেয়ার") || q.includes("বয়স্ক")) {
      reply = "বাসায় রোগী ও বয়োবৃদ্ধদের সেবায় আমাদের প্রশিক্ষিত হোম নার্স ও কেয়ারগিভার সার্ভিস রয়েছে। ১২ ঘণ্টার শিফট ৮০০ থেকে ১২০০ টাকা এবং ২৪ ঘণ্টার সার্বক্ষণিক সেবা ১৫০০ টাকা।";
      action = { view: "nurses", label: "হোম নার্সিং বুক করুন 💖" };
    } else if (q.includes("হোটেল") || q.includes("hotel") || q.includes("রিসোর্ট") || q.includes("কক্সবাজার") || q.includes("সাজেক") || q.includes("ভ্রমণ")) {
      reply = "কক্সবাজার সি-ভিউ ডিলক্স রুম (৳২৫০০-৳৫৫০০) ও সাজেক ভ্যালি ক্লাউড রিসোর্টে বিশেষ ছাড় চলছে! ফ্রি ব্রেকফাস্টসহ নিশ্চিত বুকিং করতে পারেন।";
      action = { view: "hotels", label: "হোটেল বুকিং দেখুন 🏨" };
    } else if (q.includes("পণ্য") || q.includes("product") || q.includes("মোবাইল") || q.includes("ঘড়ি") || q.includes("কিনব") || q.includes("শপ")) {
      reply = "ট্রেন্ডিং গ্যাজেট, স্মার্টওয়াচ ও ব্লুটুথ ইয়ারবাডস সারা দেশে ক্যাশ অন ডেলিভারি এবং ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টিসহ অর্ডার করতে পারেন।";
      action = { view: "products", label: "শপ মার্কেটপ্লেস দেখুন 🛍️" };
    } else if (q.includes("বই") || q.includes("ইবুক") || q.includes("ebook") || q.includes("পিডিএফ")) {
      reply = "আমাদের ডিজিটাল ইবুক লাইব্রেরিতে ইসলামিক বই, বিসিএস প্রস্তুতি ও প্রোগ্রামিং বই রয়েছে যা কেনার পর সরাসরি ইন-অ্যাপ রিডারে পড়তে পারবেন।";
      action = { view: "ebooks", label: "ইবুক লাইব্রেরি দেখুন 📚" };
    } else if (q.includes("পুরাতন") || q.includes("used") || q.includes("সেকেন্ড হ্যান্ড")) {
      reply = "ভেরিফাইড পুরাতন স্মার্টফোন, ল্যাপটপ ও বাইক সরাসরি সেলারের কাছ থেকে নিরাপদে কেনাবেচা করুন।";
      action = { view: "used_products", label: "পুরাতন বাজার দেখুন 🏷️" };
    } else if (q.includes("চাকরি") || q.includes("job") || q.includes("নিয়োগ")) {
      reply = "ডেলিভারি রাইডার ও হোম সার্ভিস টেকনিশিয়ানসহ বিভিন্ন চাকরির সার্কুলার রয়েছে যেখানে সরাসরি আবেদন করা যায়।";
      action = { view: "jobs", label: "জব সার্কুলার দেখুন 💼" };
    } else if (q.includes("পার্টনার") || q.includes("সেলার") || q.includes("জয়েন") || q.includes("ইনকাম")) {
      reply = "QAAGA-তে পার্টনার টেকনিশিয়ান, ডাক্তার বা সেলার হিসেবে রেজিস্ট্রেশন করে প্রতিদিন নতুন কাস্টমার পেয়ে ইনকাম বাড়ান!";
      action = { view: "partner_register", label: "পার্টনার রেজিস্ট্রেশন 🚀" };
    } else if (q.includes("নাম্বার") || q.includes("ফোন") || q.includes("call") || q.includes("whatsapp") || q.includes("হটলাইন")) {
      reply = "আমাদের সার্বক্ষণিক হটলাইন নম্বর হলো শূন্য নয় ছয় পাঁচ আট আট দুই চার তিন ছয় শূন্য এবং হোয়াটসঅ্যাপ প্লাস আট আট শূন্য এক ছয় চার চার নয় আট পাঁচ তিন শূন্য এক।";
      action = { view: "contact", label: "সরাসরি যোগাযোগ করুন 📞" };
    } else {
      reply = `আপনার বার্তাটি পেয়েছি: "${cleanMessage}"। QAAGA সুপার মার্কেটপ্লেসে ডাক্তার সিরিয়াল, এসি ও হোম সার্ভিস, নার্সিং, হোটেল বুকিং এবং কেনাকাটার সকল সুবিধা রয়েছে। আপনি কী সেবা চান আমাকে বলুন।`;
      action = { view: "service_request", label: "সব সার্ভিস দেখুন 🔍" };
    }

    return safeJsonResponse({
      success: true,
      reply: reply,
      action: action,
      source: "suchi-intelligent-core",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return handleSecureApiError(error, "Suchi Chat Route");
  }
}
