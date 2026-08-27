import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  checkBruteForce,
  sanitizeString,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
} from '@/lib/auth-security';
import { AIChatGenericSchema } from '@/lib/validation';

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting (Max 30 chats per 5 minutes)
    const ip = request.headers.get('x-forwarded-for') || 'ip_aichat';
    const rateCheck = checkBruteForce(`aichat_${ip}`, 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        { reply: 'অতিরিক্ত বার্তার কারণে সাময়িক বিরতি। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
        { status: 429 }
      );
    }

    // 2. Request Size Limit (Max 64KB)
    const jsonResult = await parseJsonWithLimit(request, 64 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 3. Zod Input Validation
    const validationResult = AIChatGenericSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return safeJsonResponse(
        { reply: validationResult.error.issues[0]?.message || 'অবৈধ বার্তা ফরম্যাট।' },
        { status: 400 }
      );
    }

    const { message, assistantType, history } = validationResult.data;
    const cleanMessage = sanitizeString(message);

    const systemPrompt =
      assistantType === 'CAT'
        ? 'আপনি হলেন কিউট ক্যাট (Cute Cat) - QAAGA সুপার প্ল্যাটফর্মের একটি অতি আদুরে, মিষ্টি ও সাহায্যকারী কিটেন। আপনি মিষ্টি বাংলায় কথা বলেন এবং মিউ মিউ (Meow!) করে উৎসাহ দেন।'
        : 'আপনি হলেন সুচি (Suchi AI) - QAAGA সুপার মার্কেটপ্লেসের বুদ্ধিমান বাংলা এআই অ্যাসিস্ট্যান্ট। আপনি ব্যবহারকারীদের হোম সার্ভিস, ডাক্তার সিরিয়াল, নার্সিং সেবা, হোটেল বুকিং, অনলাইন কেনাকাটা ও ইবুক সংক্রান্ত তথ্য ও পরামর্শ দিয়ে থাকেন।';

    const ai = getAIClient();
    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const h of history.slice(-4)) {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: sanitizeString(h.content) }],
            });
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${cleanMessage}` }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
        });

        return safeJsonResponse({
          reply: response.text || 'আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
        });
      } catch (genErr) {
        console.warn('Gemini generic API error, using smart fallback:', genErr);
      }
    }

    // Smart Local Fallback
    const localReply =
      assistantType === 'CAT'
        ? `মিউউউ! 🐾 আমি আপনার সাথে আছি! "${cleanMessage}" নিয়ে কোনো চিন্তা করবেন না, QAAGA তে সব সেবা হাতের নাগালে!`
        : `ধন্যবাদ আপনার বার্তার জন্য! "${cleanMessage}" সংক্রান্ত যেকোনো সেবা বা তথ্যের জন্য QAAGA প্ল্যাটফর্মে সার্ভিস রিকোয়েস্ট দিন বা অনুসন্ধান করুন।`;

    return safeJsonResponse({ reply: localReply });
  } catch (error: any) {
    return handleSecureApiError(error, 'AI generic chat route');
  }
}
