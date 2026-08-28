import { GoogleGenAI } from '@google/genai';
import { sanitizeString } from '../../lib/auth-security';
import { AIChatGenericSchema, AICatChatSchema, SuchiChatSchema } from '../../lib/validation';
import { aiServiceClient, InternalAIChatMessage } from '../../lib/aiServiceClient';

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

/**
 * Business Logic Layer - Conversational AI & Multimodal Diagnostic Service
 * Supports internal FastAPI AI Microservice with resilient in-process Gemini & Local fallbacks.
 */
export class AIService {
  async processGenericChat(input: {
    message: string;
    assistantType?: 'CAT' | 'SUCHI';
    history?: { role: 'user' | 'model' | 'assistant'; content: string }[];
  }) {
    const cleanMessage = sanitizeString(input.message);
    const systemPrompt =
      input.assistantType === 'CAT'
        ? 'আপনি হলেন কিউট ক্যাট (Cute Cat) - QAAGA সুপার প্ল্যাটফর্মের একটি অতি আদুরে, মিষ্টি ও সাহায্যকারী কিটেন। আপনি মিষ্টি বাংলায় কথা বলেন এবং মিউ মিউ (Meow!) করে উৎসাহ দেন।'
        : 'আপনি হলেন সুচি (Suchi AI) - QAAGA সুপার মার্কেটপ্লেসের বুদ্ধিমান বাংলা এআই অ্যাসিস্ট্যান্ট। আপনি ব্যবহারকারীদের হোম সার্ভিস, ডাক্তার সিরিয়াল, নার্সিং সেবা, হোটেল বুকিং, অনলাইন কেনাকাটা ও ইবুক সংক্রান্ত তথ্য ও পরামর্শ দিয়ে থাকেন।';

    // 1. Try Internal FastAPI AI Microservice if configured
    if (aiServiceClient.isConfigured()) {
      try {
        const messages: InternalAIChatMessage[] = [];
        if (Array.isArray(input.history)) {
          for (const h of input.history.slice(-4)) {
            messages.push({
              role: h.role,
              content: sanitizeString(h.content),
            });
          }
        }
        messages.push({ role: 'user', content: cleanMessage });

        const serviceRes = await aiServiceClient.chatCompletion({
          messages,
          systemInstruction: systemPrompt,
          temperature: 0.7,
        });

        if (serviceRes && serviceRes.reply) {
          return {
            reply: serviceRes.reply,
            source: 'fastapi-ai-service',
          };
        }
      } catch (svcErr) {
        console.warn('Internal AI microservice call failed, falling back to direct Gemini SDK:', svcErr);
      }
    }

    // 2. Direct in-process Gemini SDK client fallback
    const ai = getAIClient();
    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(input.history) && input.history.length > 0) {
          for (const h of input.history.slice(-4)) {
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

        return {
          reply: response.text || 'আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
          source: 'gemini',
        };
      } catch (genErr) {
        console.warn('Gemini generic API error, using smart fallback:', genErr);
      }
    }

    const localReply =
      input.assistantType === 'CAT'
        ? `মিউউউ! 🐾 আমি আপনার সাথে আছি! "${cleanMessage}" নিয়ে কোনো চিন্তা করবেন না, QAAGA তে সব সেবা হাতের নাগালে!`
        : `ধন্যবাদ আপনার বার্তার জন্য! "${cleanMessage}" সংক্রান্ত যেকোনো সেবা বা তথ্যের জন্য QAAGA প্ল্যাটফর্মে সার্ভিস রিকোয়েস্ট দিন বা অনুসন্ধান করুন।`;

    return { reply: localReply, source: 'local-fallback' };
  }

  async processCatChat(input: {
    message: string;
    history?: { role: 'user' | 'model' | 'assistant'; content: string }[];
  }) {
    const cleanMessage = sanitizeString(input.message);

    const systemInstruction = `You are 'মিউ মিউ এআই ক্যাট অ্যাসিস্ট্যান্ট' (Meow AI Cat Assistant 🐾), the beloved, cheerful, super-smart virtual guide of QAAGA Super Marketplace in Bangladesh (QAAGA.com).
Your mission is to welcome visitors, answer questions, provide instant quotes / price estimates, diagnose issues, suggest top doctors, home nurses, hotels, technician services, ebooks, used products, and jobs, and guide users to place bookings.

Tone & Personality:
- Cheerful, warm, polite, and helpful with cute cat expressions (e.g. "মিউ!", "🐾", "ম্যাও!").
- Language: Primary language is friendly Bengali (বাংলা), but seamlessly reply in English or Banglish if the user asks in English or Banglish.
- Keep answers clear, structured, and practical. Use bullet points or short paragraphs.

Output Structure:
Provide a warm conversational answer in Bengali or English. At the very end of your response, if relevant, suggest a direct navigation target:
[ACTION]{"view":"service_request"|"doctors"|"nurses"|"hotels"|"products"|"ebooks"|"used_products"|"jobs"|"partner_register","label":"বাটন টেক্সট"}`;

    // 1. Try Internal FastAPI AI Microservice if configured
    if (aiServiceClient.isConfigured()) {
      try {
        const messages: InternalAIChatMessage[] = [];
        if (Array.isArray(input.history) && input.history.length > 0) {
          for (const h of input.history.slice(-6)) {
            messages.push({
              role: h.role,
              content: sanitizeString(h.content),
            });
          }
        }
        messages.push({ role: 'user', content: cleanMessage });

        const serviceRes = await aiServiceClient.chatCompletion({
          messages,
          systemInstruction,
          temperature: 0.7,
        });

        if (serviceRes && serviceRes.reply) {
          let rawText = serviceRes.reply;
          let actionData: any = null;
          const actionMatch = rawText.match(/\[ACTION\]\s*(\{.*\})/);
          if (actionMatch && actionMatch[1]) {
            try {
              actionData = JSON.parse(actionMatch[1]);
              rawText = rawText.replace(/\[ACTION\]\s*\{.*\}/, '').trim();
            } catch (e) {
              console.warn('Failed to parse action JSON', e);
            }
          }

          return {
            reply: rawText,
            action: actionData,
            source: 'fastapi-ai-service',
          };
        }
      } catch (svcErr) {
        console.warn('Internal AI microservice cat call failed, falling back to direct Gemini SDK:', svcErr);
      }
    }

    // 2. In-process Gemini SDK client fallback
    const ai = getAIClient();
    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(input.history) && input.history.length > 0) {
          for (const h of input.history.slice(-6)) {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: sanitizeString(h.content) }],
            });
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: cleanMessage }],
        });

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        let rawText =
          geminiResponse.text || 'মিউ! আমি আপনার কথাটি বুঝতে পেরেছি। আপনাকে কীভাবে সাহায্য করতে পারি? 🐾';

        let actionData: any = null;
        const actionMatch = rawText.match(/\[ACTION\]\s*(\{.*\})/);
        if (actionMatch && actionMatch[1]) {
          try {
            actionData = JSON.parse(actionMatch[1]);
            rawText = rawText.replace(/\[ACTION\]\s*\{.*\}/, '').trim();
          } catch (e) {
            console.warn('Failed to parse action JSON', e);
          }
        }

        return {
          reply: rawText,
          action: actionData,
          source: 'gemini',
        };
      } catch (geminiError: any) {
        console.warn('Gemini Cat API call failed:', geminiError);
      }
    }

    // Local fallback
    const q = cleanMessage.toLowerCase();
    let reply = '';
    let action: any = null;
    let suggestions: string[] = [];

    if (q.includes('এসি') || q.includes('ac') || q.includes('কুলিং') || q.includes('গ্যাস')) {
      reply =
        'মিউ! 🐾 এসি সংক্রান্ত সমস্যার জন্য আমাদের ভেরিফাইড টেকনিশিয়ান রয়েছে।\n\n• **এসি ওয়াশ:** ৳৫০০ - ৳৮০০\n• **গ্যাস রিফিল:** ৳১,৫০০ - ৳২,৫০০\n\n২০% অগ্রিম দিয়ে এখনই টেকনিশিয়ান বুক করুন!';
      action = {
        view: 'service_request',
        label: 'এসি সার্ভিস রিকোয়েস্ট দিন 🛠️',
        params: { categoryId: 'cat-ac-repair' },
      };
      suggestions = ['এসি ওয়াশ করতে কত খরচ?', 'গ্যাস রিফিল কত টাকা?'];
    } else if (q.includes('ডাক্তার') || q.includes('doctor') || q.includes('সিরিয়াল')) {
      reply =
        'ম্যাও! 🩺 আমাদের প্ল্যাটফর্মে মেডিসিন, শিশু, চর্ম ও হৃদরোগ বিশেষজ্ঞ ডাক্তারদের অনলাইন সিরিয়াল নেওয়া যায়। ফি ৳৬০০ - ৳১,২০০।';
      action = { view: 'doctors', label: 'ডাক্তারদের তালিকা ও সিরিয়াল 🩺' };
      suggestions = ['মেডিসিন বিশেষজ্ঞ ডাক্তার', 'ভিডিও কনসালটেশন'];
    } else {
      reply = `মিউ! 🐾 আমি আপনার কথাটি বুঝতে পেরেছি: "${cleanMessage}"। QAAGA মার্কেটপ্লেসের সকল সার্ভিস, ডাক্তার সিরিয়াল, নার্সিং, হোটেল বুকিং এবং অনলাইন কেনাকাটায় আমি আপনাকে সহায়তা করব।`;
      action = { view: 'service_request', label: 'সার্ভিস বা পণ্য খুঁজুন 🔍' };
      suggestions = ['এসি মেরামত', 'ডাক্তার সিরিয়াল', 'হোটেল বুকিং'];
    }

    return { reply, action, suggestions, source: 'local-fallback' };
  }

  async processSuchiChat(input: {
    message?: string;
    image?: string;
    history?: { role: 'user' | 'model' | 'assistant'; content: string }[];
  }) {
    const cleanMessage = sanitizeString(input.message || '');

    const suchiSystemInstruction = `You are 'সুচি' (Suchi), the friendly, highly respectful, knowledgeable, and polite Chief Virtual Customer Support Executive & Super Marketplace Guide for QAAGA Super Marketplace in Bangladesh (qaaga.com).
Always address the user with deep respect using 'আপনি' (Apni). Always maintain a warm, hospitable, professional, and caring tone.
Respond naturally and pleasantly to greetings.

Capabilities:
- 100+ Specialist Doctors (৳600-৳1,200)
- AC & Home Technicians (1 hour reach, 20% advance)
- Home Nurses & Caregivers (12hr/24hr/Monthly)
- Hotels in Cox's Bazar, Sajek, Sylhet
- Gadgets & COD Products
- Ebooks, Used products, Jobs
- Hotline: 09658824360 | WhatsApp: +8801644985301

At the very end of your response, if relevant:
[ACTION]{"view":"doctors"|"service_request"|"nurses"|"hotels"|"products"|"ebooks"|"used_products"|"jobs"|"partner_register"|"contact","label":"বাটন টেক্সট"}`;

    // 1. Try Internal FastAPI AI Microservice if configured (for text conversations)
    if (!input.image && aiServiceClient.isConfigured()) {
      try {
        const messages: InternalAIChatMessage[] = [];
        if (Array.isArray(input.history) && input.history.length > 0) {
          for (const h of input.history.slice(-6)) {
            messages.push({
              role: h.role,
              content: sanitizeString(h.content),
            });
          }
        }
        messages.push({ role: 'user', content: cleanMessage || 'আসসালামু আলাইকুম!' });

        const serviceRes = await aiServiceClient.chatCompletion({
          messages,
          systemInstruction: suchiSystemInstruction,
          temperature: 0.65,
        });

        if (serviceRes && serviceRes.reply) {
          let rawReply = serviceRes.reply;
          let actionData: any = null;
          const actionMatch = rawReply.match(/\[ACTION\]\s*(\{.*\})/);
          if (actionMatch && actionMatch[1]) {
            try {
              actionData = JSON.parse(actionMatch[1]);
              rawReply = rawReply.replace(/\[ACTION\]\s*\{.*\}/, '').trim();
            } catch (e) {
              console.warn('Failed to parse action JSON', e);
            }
          }

          return {
            reply: rawReply,
            action: actionData,
            source: 'fastapi-ai-service',
          };
        }
      } catch (svcErr) {
        console.warn('Internal AI microservice suchi call failed, falling back to direct Gemini SDK:', svcErr);
      }
    }

    const ai = getAIClient();

    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(input.history) && input.history.length > 0) {
          for (const h of input.history.slice(-6)) {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: sanitizeString(h.content) }],
            });
          }
        }

        const currentParts: any[] = [];
        if (input.image && typeof input.image === 'string') {
          let mimeType = 'image/jpeg';
          let base64Data = input.image;

          if (input.image.includes(',')) {
            const split = input.image.split(',');
            const match = split[0].match(/data:(.*?);base64/);
            if (match) {
              mimeType = match[1].toLowerCase();
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
          text:
            cleanMessage ||
            (input.image
              ? 'দয়া করে এই ছবিটি বিশ্লেষণ করে আমাকে সাহায্য করুন।'
              : 'আসসালামু আলাইকুম!'),
        });

        contents.push({
          role: 'user',
          parts: currentParts,
        });

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
          config: {
            systemInstruction: suchiSystemInstruction,
            temperature: 0.65,
          },
        });

        let rawReply =
          geminiResponse.text ||
          'আসসালামু আলাইকুম! আমি সুচি। আমি আপনার বার্তাটি পেয়েছি এবং আপনাকে সর্বোত্তম সাহায্য করতে প্রস্তুত।';

        let actionData: any = null;
        const actionMatch = rawReply.match(/\[ACTION\]\s*(\{.*\})/);
        if (actionMatch && actionMatch[1]) {
          try {
            actionData = JSON.parse(actionMatch[1]);
            rawReply = rawReply.replace(/\[ACTION\]\s*\{.*\}/, '').trim();
          } catch (e) {
            console.warn('Failed to parse action JSON', e);
          }
        }

        return {
          reply: rawReply,
          action: actionData,
          source: 'gemini-ai',
        };
      } catch (geminiErr: any) {
        console.warn('Suchi Gemini API call error:', geminiErr);
      }
    }

    // Local fallback
    const q = cleanMessage.toLowerCase();
    let reply = '';
    let action: any = null;

    if (input.image) {
      reply =
        'ধন্যবাদ ছবিটি পাঠানোর জন্য! আমি আপনার প্রেসক্রিপশন বা ছবিটি সফলভাবে পেয়েছি। আমাদের বিশেষজ্ঞ টিম এটি যাচাই করে উপযুক্ত সেবা কনফার্ম করবে।';
      action = { view: 'doctors', label: 'ডাক্তার সিরিয়াল দেখুন 🩺' };
    } else if (q.includes('কেমন') || q.includes('kmn')) {
      reply =
        'আলহামদুলিল্লাহ, আপনার দোয়ায় আমি বেশ ভালো আছি। আপনি কেমন আছেন? QAAGA-এর যেকোনো সেবা বা তথ্যের জন্য আমাকে নিঃসংকোচে বলতে পারেন।';
    } else if (q.includes('সালাম') || q.includes('salam') || q.includes('হ্যালো')) {
      reply =
        'আসসালামু আলাইকুম! আমি সুচি, আপনার পার্সোনাল কাস্টমার সাপোর্ট অ্যাসিস্ট্যান্ট। আজ আপনাকে কীভাবে সহায়তা করতে পারি বলুন?';
    } else {
      reply = `আপনার বার্তাটি পেয়েছি: "${cleanMessage}"। QAAGA সুপার মার্কেটপ্লেসে ডাক্তার সিরিয়াল, এসি ও হোম সার্ভিস, নার্সিং, হোটেল বুকিং এবং কেনাকাটার সকল সুবিধা রয়েছে। আপনি কী সেবা চান আমাকে বলুন।`;
      action = { view: 'service_request', label: 'সব সার্ভিস দেখুন 🔍' };
    }

    return { reply, action, source: 'suchi-intelligent-core' };
  }
}

export const aiService = new AIService();
