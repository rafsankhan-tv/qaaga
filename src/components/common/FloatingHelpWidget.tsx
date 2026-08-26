import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  X,
  CheckCircle2,
  Send,
  Mic,
  Image as ImageIcon,
  Sparkles,
  Camera,
  Volume2,
  VolumeX,
  PhoneCall,
  RotateCcw,
  AudioWaveform as Waveform,
  ChevronRight,
  Bot
} from 'lucide-react';

interface ChatMsg {
  id: string;
  sender: 'suchi' | 'user';
  text: string;
  time: string;
  image?: string;
  audio?: string;
  isAudioMsg?: boolean;
  action?: {
    view: string;
    label: string;
    params?: any;
  };
  source?: string;
}

interface FloatingHelpWidgetProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const FloatingHelpWidget: React.FC<FloatingHelpWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  // Tab inside Suchi Modal: 'chat' | 'voice' | 'photo' | 'contact'
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'photo' | 'contact'>('chat');

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'm1',
      sender: 'suchi',
      text: '👋 আসসালামু আলাইকুম! আমি সুচি। ডাক্তার সিরিয়াল, হোম সার্ভিস বা যেকোনো প্রয়োজনে আমি আপনাকে কিভাবে সাহায্য করতে পারি?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Voice recording & speaking state
  const [voiceSpeechText, setVoiceSpeechText] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  // Audio Speech synthesis (Suchi Female Voice)
  const [isMuted, setIsMuted] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persistent refs to prevent Garbage Collection and ensure full sentence completion
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const speechKeepAliveTimerRef = useRef<any>(null);

  // Profile image of Suchi (Friendly professional female support representative)
  const suchiAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80';

  // Load and cache high quality voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  /**
   * Helper to convert numbers to natural Bangla words so speech synthesis doesn't crash or skip
   */
  const numberToBanglaWords = (text: string): string => {
    const banglaDigits: { [k: string]: string } = {
      '0': 'শূন্য ',
      '1': 'এক ',
      '2': 'দুই ',
      '3': 'তিন ',
      '4': 'চার ',
      '5': 'পাঁচ ',
      '6': 'ছয় ',
      '7': 'সাত ',
      '8': 'আট ',
      '9': 'নয় '
    };
    return text.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
  };

  /**
   * Stop any active speech and clear timers
   */
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speechKeepAliveTimerRef.current) {
        clearInterval(speechKeepAliveTimerRef.current);
        speechKeepAliveTimerRef.current = null;
      }
      try {
        window.speechSynthesis.cancel();
      } catch (err) {}
    }
    activeUtterancesRef.current = [];
    setIsSpeakingVoice(false);
    setActiveSpeakingMsgId(null);
  };

  /**
   * Premium Female Voice Speech Engine (Bangla & Natural Human Tonal Modulation)
   * Splits into natural sentence chunks and chains them so 100% of text is read aloud without stopping.
   */
  const speakFemaleBangla = (rawText: string, messageId?: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Reset current active voice before starting new message
    stopSpeaking();

    if (messageId) {
      setActiveSpeakingMsgId(messageId);
    }

    // 1. Clean emojis, symbols and normalize numbers
    let cleaned = rawText
      .replace(/[*#_`~]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    cleaned = numberToBanglaWords(cleaned);

    if (!cleaned) return;

    // 2. Split text into natural Bangla sentence segments (by '।', '?', '!', '\n', ',')
    // This completely eliminates Chrome/Android's 10-15s speech truncation bug.
    const rawChunks = cleaned.split(/(?<=[।?!;\n])/g);
    const chunksToSpeak: string[] = [];

    for (const chunk of rawChunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;
      // If a single sentence is still over 120 chars, sub-split by comma
      if (trimmed.length > 120) {
        const subParts = trimmed.split(/(?<=[,])/g);
        for (const sub of subParts) {
          if (sub.trim()) chunksToSpeak.push(sub.trim());
        }
      } else {
        chunksToSpeak.push(trimmed);
      }
    }

    if (chunksToSpeak.length === 0) {
      chunksToSpeak.push(cleaned);
    }

    // 3. Find the best natural feminine voice
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    const bnFemaleVoice = voices.find(
      (v) =>
        (v.lang.includes('bn') || v.lang.includes('BD') || v.lang.includes('IN')) &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('natural') ||
         v.name.toLowerCase().includes('google') ||
         v.name.toLowerCase().includes('siri') ||
         v.name.toLowerCase().includes('tania') ||
         !v.name.toLowerCase().includes('bashkar'))
    );

    const naturalFemaleVoice = voices.find(
      (v) =>
        (v.name.toLowerCase().includes('natural') ||
         v.name.toLowerCase().includes('google') ||
         v.name.toLowerCase().includes('samantha') ||
         v.name.toLowerCase().includes('zira') ||
         v.name.toLowerCase().includes('karen') ||
         v.name.toLowerCase().includes('moira') ||
         v.name.toLowerCase().includes('female')) &&
        !v.name.toLowerCase().includes('male')
    );

    setIsSpeakingVoice(true);

    // KeepAlive timer: Prevents Chrome engine from prematurely pausing active speech
    speechKeepAliveTimerRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 4000);

    let currentChunkIndex = 0;

    const playChunk = (index: number) => {
      if (index >= chunksToSpeak.length) {
        // Finished all sentences completely
        if (speechKeepAliveTimerRef.current) {
          clearInterval(speechKeepAliveTimerRef.current);
          speechKeepAliveTimerRef.current = null;
        }
        setIsSpeakingVoice(false);
        setActiveSpeakingMsgId(null);
        activeUtterancesRef.current = [];
        return;
      }

      const textChunk = chunksToSpeak[index];
      const utterance = new SpeechSynthesisUtterance(textChunk);

      // Save in persistent array to prevent JS garbage collection mid-speech
      activeUtterancesRef.current.push(utterance);

      if (bnFemaleVoice) {
        utterance.voice = bnFemaleVoice;
        utterance.lang = bnFemaleVoice.lang || 'bn-BD';
      } else if (naturalFemaleVoice) {
        utterance.voice = naturalFemaleVoice;
        utterance.lang = 'bn-BD';
      } else {
        utterance.lang = 'bn-BD';
      }

      // Natural Human Female Acoustics:
      // Rate ~0.94x creates clear, polite, natural pacing
      // Pitch 1.18x shifts into a sweet feminine vocal register without robotic harshness
      utterance.rate = 0.94;
      utterance.pitch = 1.18;
      utterance.volume = 1.0;

      utterance.onend = () => {
        currentChunkIndex++;
        playChunk(currentChunkIndex);
      };

      utterance.onerror = (e) => {
        console.warn('Utterance chunk error, continuing next chunk:', e);
        currentChunkIndex++;
        playChunk(currentChunkIndex);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Begin speaking sentence 1
    playChunk(0);
  };

  // Smart natural responses for Suchi with AI connection & automated female voice readout of the entire message
  const generateSuchiResponse = async (query: string, attachedPhoto?: string | null) => {
    setIsTyping(true);

    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text
    }));

    try {
      const response = await fetch('/api/suchi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          image: attachedPhoto || null,
          history: historyPayload
        })
      });

      const data = await response.json();
      const reply = data.reply || 'আসসালামু আলাইকুম! আমি সুচি। আমি আপনার বিষয়টি বুঝতে পেরেছি। আপনাকে কীভাবে সাহায্য করতে পারি?';
      const action = data.action;

      const newMsgId = 'suchi-' + Date.now();
      const newMsg: ChatMsg = {
        id: newMsgId,
        sender: 'suchi',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: action || undefined,
        source: data.source || 'gemini-ai'
      };

      setMessages((prev) => [...prev, newMsg]);
      setIsTyping(false);

      // Automated sweet female voice response for the entire reply
      speakFemaleBangla(reply, newMsgId);
    } catch (error) {
      console.warn('Suchi AI Fetch Error, using smart local fallback:', error);

      let reply = '';
      let action: any = null;
      const q = (query || '').toLowerCase();

      if (attachedPhoto) {
        reply = 'ধন্যবাদ ছবিটি পাঠানোর জন্য! আমি আপনার প্রেসক্রিপশন বা ছবিটি পেয়েছি। আমাদের বিশেষজ্ঞ টিম দ্রুত এটি যাচাই করে উপযুক্ত ডাক্তার বা সেবা নিশ্চিত করবে।';
        action = { view: 'doctors', label: 'ডাক্তার সিরিয়াল দেখুন 🩺' };
      } else if (q.includes('কেমন') || q.includes('kmn') || q.includes('kemon') || q.includes('valo aco') || q.includes('bhalo acho') || q.includes('how are you') || q.includes('valasen') || q.includes('bhalo achen')) {
        reply = 'আলহামদুলিল্লাহ, আপনার দোয়ায় আমি বেশ ভালো আছি। আপনি কেমন আছেন? আশা করি আপনি ভালো ও সুস্থ আছেন। QAAGA-এর যেকোনো সার্ভিস বুকিং বা তথ্যের জন্য আমাকে নিঃসংকোচে বলতে পারেন।';
      } else if (q.includes('সালাম') || q.includes('salam') || q.includes('assalamu') || q.includes('হাই') || q.includes('হ্যালো') || q.includes('hello') || q.includes('hi')) {
        reply = 'আসসালামু আলাইকুম! আমি সুচি, আপনার পার্সোনাল কাস্টমার সাপোর্ট অ্যাসিস্ট্যান্ট। আশা করি আপনি ভালো আছেন। আজ আপনাকে কীভাবে সহায়তা করতে পারি বলুন?';
      } else if (q.includes('ধন্যবাদ') || q.includes('thanks') || q.includes('thank you')) {
        reply = 'আপনাকে অসংখ্য ধন্যবাদ! আপনার পাশে থাকতে পেরে আমি আনন্দিত। যেকোনো সময় যেকোনো প্রয়োজনে আমাকে ডাকবেন।';
      } else if (q.includes('কি কর') || q.includes('কী কর') || q.includes('ki koro') || q.includes('ki korcho')) {
        reply = 'আমি আপনাদের সেবায় সার্বক্ষণিক প্রস্তুত আছি। ডাক্তার সিরিয়াল, এসি বা হোম সার্ভিস, নার্সিং বা হোটেল বুকিংয়ে কোনো সাহায্য লাগবে কি?';
      } else if (q.includes('ডাক্তার') || q.includes('doctor') || q.includes('সিরিয়াল') || q.includes('রোগী') || q.includes('প্রেসক্রিপশন')) {
        reply = 'ডাক্তার অ্যাপয়েন্টমেন্টের জন্য আমাদের বিশেষজ্ঞ প্যানেলে ১০০ জনেরও বেশি ভেরিফাইড ডাক্তার রয়েছেন। মেডিসিন, শিশু, চর্ম, স্ত্রী ও হৃদরোগ বিশেষজ্ঞ ডাক্তারদের চেম্বার ফি ৬০০ থেকে ১২০০ টাকা।';
        action = { view: 'doctors', label: 'ডাক্তারদের তালিকা দেখুন 🩺' };
      } else if (q.includes('এসি') || q.includes('ac') || q.includes('ফ্রিজ') || q.includes('সার্ভিস') || q.includes('হোম সার্ভিস') || q.includes('মিস্ত্রি') || q.includes('কাজ')) {
        reply = 'আমাদের অভিজ্ঞ হোম সার্ভিস টেকনিশিয়ানরা ১ ঘণ্টার মধ্যে আপনার ঠিকানায় পৌঁছাতে প্রস্তুত। এসি ওয়াশ ও গ্যাস রিফিল, ফ্রিজ, ইলেক্ট্রিক বা প্লাম্বিং যেকোনো প্রয়োজনে আমরা আছি।';
        action = { view: 'service_request', label: 'সার্ভিস রিকোয়েস্ট দিন 🛠️' };
      } else if (q.includes('হোটেল') || q.includes('hotel') || q.includes('রিসোর্ট') || q.includes('কক্সবাজার') || q.includes('সাজেক') || q.includes('ভ্রমণ')) {
        reply = 'কক্সবাজার বিচ ভিউ (৳২৫০০-৳৫৫০০) ও সাজেক ভ্যালি ক্লাউড রিসোর্টে বিশেষ ছাড় চলছে! ফ্রি ব্রেকফাস্টসহ নিশ্চিত বুকিং করতে পারেন।';
        action = { view: 'hotels', label: 'হোটেল বুকিং দেখুন 🏨' };
      } else if (q.includes('নাম্বার') || q.includes('ফোন') || q.includes('call') || q.includes('whatsapp') || q.includes('হটলাইন')) {
        reply = 'আমাদের অফিসিয়াল হটলাইন নম্বর হলো শূন্য নয় ছয় পাঁচ আট আট দুই চার তিন ছয় শূন্য এবং হোয়াটসঅ্যাপ প্লাস আট আট শূন্য এক ছয় চার চার নয় আট পাঁচ তিন শূন্য এক।';
        action = { view: 'contact', label: 'সরাসরি যোগাযোগ করুন 📞' };
      } else if (q.includes('নার্স') || q.includes('nurse') || q.includes('কেয়ার')) {
        reply = 'বাসায় রোগী ও বয়োবৃদ্ধদের সেবায় আমাদের অভিজ্ঞ হোম নার্স ও কেয়ারগিভার সার্ভিস রয়েছে। ১২ ঘণ্টার শিফট ৮০০ থেকে ১২০০ টাকা।';
        action = { view: 'nurses', label: 'হোম নার্সিং বুক করুন 💖' };
      } else if (q.includes('পণ্য') || q.includes('শপ') || q.includes('মোবাইল')) {
        reply = 'স্মার্টওয়াচ, ইয়ারবাডস ও হোম অ্যাপ্লায়েন্স সারা দেশে ক্যাশ অন ডেলিভারি এবং ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টিতে কিনতে পারেন।';
        action = { view: 'products', label: 'মার্কেটপ্লেস পণ্য দেখুন 🛍️' };
      } else {
        reply = `আপনার বার্তাটি পেয়েছি: "${query}"। QAAGA সুপার মার্কেটপ্লেসে ডাক্তার সিরিয়াল, এসি ও হোম সার্ভিস, নার্সিং, হোটেল বুকিং এবং কেনাকাটার সকল সুবিধা রয়েছে। আপনি কী সেবা চান আমাকে জানান।`;
        action = { view: 'service_request', label: 'সার্ভিস খুঁজুন 🔍' };
      }

      const newMsgId = 'suchi-' + Date.now();
      const newMsg: ChatMsg = {
        id: newMsgId,
        sender: 'suchi',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: action
      };

      setMessages((prev) => [...prev, newMsg]);
      setIsTyping(false);
      speakFemaleBangla(reply, newMsgId);
    }
  };

  // Handle Send Message
  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedPhoto) return;

    const userText = inputText.trim();
    const photo = selectedPhoto;

    const userMsg: ChatMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText || (photo ? 'ছবি সংযুক্ত করা হয়েছে 📷' : ''),
      image: photo || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSelectedPhoto(null);

    generateSuchiResponse(userText, photo);
  };

  // Photo Select handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
          setActiveTab('chat');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice speech-to-text recognition
  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulated voice note
      const sampleQuery = 'সুচি আপু, আমাকে ডাক্তার অ্যাপয়েন্টমেন্টে সাহায্য করুন';
      const userMsgId = 'voice-' + Date.now();
      const voiceMsg: ChatMsg = {
        id: userMsgId,
        sender: 'user',
        text: `🎤 ${sampleQuery}`,
        isAudioMsg: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, voiceMsg]);
      generateSuchiResponse(sampleQuery);
      return;
    }

    if (isVoiceListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {}
      setIsVoiceListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsVoiceListening(true);
          setVoiceSpeechText('শুনছি... আপনার প্রশ্নটি মুখে বলুন...');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceSpeechText(transcript);
          setIsVoiceListening(false);

          // Add to chat
          const userMsg: ChatMsg = {
            id: 'user-voice-' + Date.now(),
            sender: 'user',
            text: `🎤 ${transcript}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, userMsg]);
          generateSuchiResponse(transcript);
        };

        recognition.onerror = () => {
          setIsVoiceListening(false);
          setVoiceSpeechText('ভয়েস শনাক্ত করা যায়নি, আবার চেষ্টা করুন');
        };

        recognition.onend = () => {
          setIsVoiceListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.error('Speech recognition error:', e);
        setIsVoiceListening(false);
      }
    }
  };

  // If visitor closed/hidden the widget
  if (isDismissed) {
    return null;
  }

  return (
    <div className={`fixed ${isOpen ? 'z-[9999]' : 'z-50'} bottom-[74px] sm:bottom-6 left-3 sm:left-6 flex flex-col items-start gap-2 select-none font-sans`}>
      {/* Backdrop overlay on mobile when chat popup is open so it stays prominently on top */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9990] sm:hidden"
          onClick={() => {
            stopSpeaking();
            setIsOpen(false);
          }}
        />
      )}

      {/* Hidden File Input for Photos / Prescriptions */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Speech Bubble / 1 New Message Callout (Unread Notice) */}
      {!isOpen && showBubble && (
        <div
          className="relative bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl border border-emerald-200/90 max-w-[240px] sm:max-w-[270px] animate-slideUp mb-1 cursor-pointer hover:shadow-2xl transition-all group z-50"
          onClick={() => {
            setIsOpen(true);
            setShowBubble(false);
            speakFemaleBangla('আসসালামু আলাইকুম! আমি সুচি। আমি আপনাকে কিভাবে সাহায্য করতে পারি?', 'm1');
          }}
        >
          {/* Close mini bubble */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(false);
            }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-[9px] transition-colors"
            title="মেসেজ হাইড করুন"
          >
            <X size={10} />
          </button>

          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-emerald-800">সুচি (Suchi) &bull; ২৪/৭ লাইভ সাপোর্ট</span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-700 leading-snug">
            আসসালামু আলাইকুম! যেকোনো সার্ভিস বুকিং, তথ্য বা সরাসরি সহায়তার জন্য জিজ্ঞাসা করুন।
          </p>

          <div className="mt-2 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
            <span className="flex items-center gap-1 text-emerald-600">
              <Sparkles size={11} className="text-emerald-600" /> স্মার্ট এআই ও ভয়েস অ্যাসিস্ট্যান্ট
            </span>
            <span className="text-[9px] text-emerald-600 font-semibold">সহায়তা নিন &rarr;</span>
          </div>

          {/* Chat bubble tail pointing to avatar */}
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-b border-r border-emerald-200/90 rotate-45" />
        </div>
      )}

      {/* 2. Expanded Interactive Multimodal Assistant Card (Text Chat + Full Female Voice Engine + Photo + WhatsApp) */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-[92vw] sm:w-88 max-w-[360px] h-[480px] max-h-[75vh] sm:max-h-[520px] flex flex-col overflow-hidden mb-1 animate-scaleUp z-[9999] relative">
          {/* Header with Suchi's Profile, Audio Voice Toggle & Close */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-3 sm:p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={suchiAvatar}
                  alt="সুচি - কাস্টমার সাপোর্ট"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-black text-white">সুচি (Suchi)</h4>
                  <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-100 font-medium">
                  {isSpeakingVoice ? (
                    <span className="flex items-center gap-1 text-amber-300 font-bold animate-pulse">
                      <Volume2 size={12} className="animate-bounce" /> সুচি ভয়েসে বলছে...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      ভার্চুয়াল সাপোর্ট এক্সিকিউটিভ &bull; অনলাইন
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Readout Mute/Unmute */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeakingVoice) stopSpeaking();
                  setIsMuted(!isMuted);
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isMuted ? 'bg-rose-500/80 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={isMuted ? 'ভয়েস রিডআউট চালু করুন' : 'ভয়েস রিডআউট মিউট করুন'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className={isSpeakingVoice ? 'animate-bounce' : ''} />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Multimodal Quick Mode Tabs (Chat, Voice, Photo, WhatsApp/Contact) */}
          <div className="flex items-center justify-around bg-slate-100/90 border-b border-slate-200/80 px-2 py-1.5 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              <MessageCircle size={13} />
              <span>চ্যাট</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('voice');
                toggleVoiceRecording();
              }}
              className={`flex items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'voice' || isVoiceListening
                  ? 'bg-rose-500 text-white shadow-xs animate-pulse'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              <Mic size={13} />
              <span>ভয়েস বলুন</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 py-1 px-2.5 rounded-xl hover:bg-slate-200/70 text-slate-600 transition-all cursor-pointer"
            >
              <Camera size={13} />
              <span>ছবি পাঠান</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              <PhoneCall size={13} />
              <span>কল/WhatsApp</span>
            </button>
          </div>

          {/* Tab Content 1: Main Interactive Chat Body */}
          {activeTab !== 'contact' && (
            <div className="flex-1 p-3 overflow-y-auto bg-slate-50/70 space-y-2.5 text-xs">
              {/* Voice Status Pill Notice */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <Volume2 size={12} className="text-emerald-600 shrink-0" />
                  সম্পূর্ণ উত্তর সুচির স্বাভাবিক ভয়েসে শোনানো হচ্ছে
                </span>
                {isSpeakingVoice && (
                  <button
                    onClick={stopSpeaking}
                    className="text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded-md border border-rose-200 cursor-pointer hover:bg-rose-50"
                  >
                    ভয়েস থামান
                  </button>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['ডাক্তার সিরিয়াল', 'এসি সার্ভিসিং', 'হোটেল বুকিং', 'হটলাইন নম্বর'].map((pill) => (
                  <button
                    key={pill}
                    onClick={() => {
                      setInputText(pill);
                      handleSendMessage();
                    }}
                    className="whitespace-nowrap text-[10px] bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Messages Flow */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'suchi' && (
                    <img
                      src={suchiAvatar}
                      alt="সুচি"
                      className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div
                    className={`max-w-[84%] rounded-2xl p-2.5 text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                        : activeSpeakingMsgId === msg.id
                        ? 'bg-emerald-50/90 border-2 border-emerald-400 text-slate-900 rounded-tl-xs ring-2 ring-emerald-200'
                        : 'bg-white border border-emerald-100 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Attached Photo Preview */}
                    {msg.image && (
                      <div className="mb-1.5 rounded-xl overflow-hidden border border-white/20">
                        <img
                          src={msg.image}
                          alt="সংযুক্ত ছবি"
                          className="w-full max-h-36 object-cover"
                        />
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Action Navigation Target Button */}
                    {msg.action && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigate && msg.action?.view) {
                              onNavigate(msg.action.view, msg.action.params);
                              setIsOpen(false);
                              stopSpeaking();
                            }
                          }}
                          className="w-full py-1.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-[11px] shadow-sm flex items-center justify-between gap-1 transition-all cursor-pointer active:scale-95 group"
                        >
                          <span className="flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-300 animate-spin" />
                            <span>{msg.action.label || 'সার্ভিসটি দেখুন'}</span>
                          </span>
                          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}

                    <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-1">
                      {msg.sender === 'suchi' ? (
                        <button
                          onClick={() => speakFemaleBangla(msg.text, msg.id)}
                          className={`text-[10px] flex items-center gap-1 font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            activeSpeakingMsgId === msg.id
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : 'bg-emerald-100/70 hover:bg-emerald-200/90 text-emerald-800'
                          }`}
                          title="সম্পূর্ণ বার্তা ভয়েসে শুনুন"
                        >
                          <Volume2 size={11} />
                          {activeSpeakingMsgId === msg.id ? 'ভয়েস চলছে...' : 'পুরোটা শুনুন'}
                        </button>
                      ) : <span />}

                      <span
                        className={`text-[9px] ${
                          msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <img
                    src={suchiAvatar}
                    alt="সুচি উত্তর প্রস্তুত করছে"
                    className="w-5 h-5 rounded-full object-cover animate-pulse"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex gap-1 bg-white border border-emerald-100 px-2.5 py-1.5 rounded-full shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
                  </div>
                  <span className="text-emerald-700 font-medium">সুচি উত্তর প্রস্তুত করছে...</span>
                </div>
              )}

              {/* Voice Listening Bar */}
              {isVoiceListening && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 text-center text-rose-800 animate-pulse">
                  <div className="flex items-center justify-center gap-2 font-bold text-xs">
                    <Mic size={14} className="animate-bounce" />
                    <span>ভয়েস রেকর্ড হচ্ছে... আপনার প্রশ্নটি বলুন</span>
                  </div>
                  <p className="text-[10px] text-rose-600 mt-0.5">{voiceSpeechText}</p>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

          {/* Tab Content 2: Contact & Direct WhatsApp Links */}
          {activeTab === 'contact' && (
            <div className="flex-1 p-4 bg-slate-50/70 overflow-y-auto space-y-3">
              <div className="text-center mb-2">
                <h5 className="text-xs font-black text-slate-800">সুচির সাথে সরাসরি যোগাযোগ</h5>
                <p className="text-[11px] text-slate-500">আমরা সার্বক্ষণিক আপনার সহায়তায় প্রস্তুত</p>
              </div>

              {/* WhatsApp Direct Chat */}
              <a
                href="https://wa.me/8801644985301?text=%E0%A6%B9%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B2%E0%A7%8B%20%E0%A6%B8%E0%A7%81%E0%A6%9A%E0%A6%BF%2C%20%E0%A6%86%E0%A6%AE%E0%A6%BE%E0%A6%B0%20%E0%A6%8F%E0%A6%95%E0%A6%9F%E0%A6%BF%20%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%AD%E0%A6%BF%E0%A6%B8%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A7%87%20%E0%A6%9C%E0%A6%BE%E0%A6%A8%E0%A6%BE%E0%A6%B0%20%E0%A6%9B%E0%A6%BF%E0%A6%B2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <MessageCircle size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-emerald-100 font-normal">WhatsApp চ্যাট</div>
                    <div className="text-xs font-black tracking-wide">+8801644985301</div>
                  </div>
                </div>
                <Send size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Direct Phone Call */}
              <a
                href="tel:09658824360"
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100/90 border border-amber-200 text-amber-950 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#ff6d00] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Phone size={15} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[10px] font-bold text-amber-700 uppercase">হটলাইন / সরাসরি কল</div>
                  <div className="text-xs font-black text-amber-950 truncate">09658824360</div>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:qaaga@consultant.com"
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/90 border border-purple-200/70 text-purple-950 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#4e20b8] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[10px] font-bold text-purple-700 uppercase">অফিসিয়াল ইমেইল</div>
                  <div className="text-xs font-bold text-purple-950 truncate">qaaga@consultant.com</div>
                </div>
              </a>

              <button
                onClick={() => setActiveTab('chat')}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                &larr; লাইভ চ্যাটে ফিরে যান
              </button>
            </div>
          )}

          {/* Selected Photo Floating Chip above Input */}
          {selectedPhoto && activeTab !== 'contact' && (
            <div className="bg-emerald-50 border-t border-emerald-200 px-3 py-1.5 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <img
                  src={selectedPhoto}
                  alt="সিলেক্ট করা ছবি"
                  className="w-7 h-7 rounded-md object-cover border border-emerald-300"
                />
                <span className="text-[11px] font-semibold">ছবি সিলেক্ট করা হয়েছে</span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer"
              >
                রিমুভ
              </button>
            </div>
          )}

          {/* Bottom Multimodal Input Bar (Text / Voice / Photo / Send) */}
          {activeTab !== 'contact' && (
            <div className="p-2.5 bg-white border-t border-slate-200/80 flex items-center gap-1.5">
              {/* Photo Upload Icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="ছবি / প্রেসক্রিপশন আপলোড করুন"
              >
                <ImageIcon size={15} />
              </button>

              {/* Voice Speech Icon */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isVoiceListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title="ভয়েসে কথা বলুন"
              >
                <Mic size={15} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="সুচিকে মেসেজ লিখুন..."
                className="flex-1 bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-400 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none transition-all"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputText.trim() && !selectedPhoto}
                className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
                title="পাঠান"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Floating Avatar Pill (Round Shape with Female Photo 'Suchi' + 1 Unread Message Badge + "কিভাবে সাহায্য করতে পারি" + X Close button) */}
      <div className="relative group/suchi flex items-center">
        {/* Main Clickable Floating Button */}
        <button
          type="button"
          onClick={() => {
            const nextState = !isOpen;
            setIsOpen(nextState);
            setShowBubble(false);
            if (nextState) {
              speakFemaleBangla('আসসালামু আলাইকুম! আমি সুচি। আমি আপনাকে কিভাবে সাহায্য করতে পারি?', 'm1');
            } else {
              stopSpeaking();
            }
          }}
          className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white pl-1.5 pr-4 py-1.5 rounded-full shadow-xl hover:shadow-2xl border-2 border-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-emerald-500/20"
          title="সুচি - কাস্টমার সাপোর্ট এক্সিকিউটিভ (স্মার্ট এআই চ্যাট ও ভয়েস)"
        >
          {/* Round Avatar Container with Glowing Ring & 1 Message Badge */}
          <div className="relative">
            <img
              src={suchiAvatar}
              alt="সুচি - Suchi"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white shadow-md"
              referrerPolicy="no-referrer"
            />

            {/* Online Voice Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border border-white rounded-full flex items-center justify-center text-white shadow-xs">
              <Volume2 size={9} className="text-white animate-pulse" />
            </div>

            {/* '1' Unread Message Red Notification Badge */}
            <div className="absolute -top-1 -left-1 flex items-center justify-center min-w-5 h-5 px-1 bg-rose-600 text-white text-[11px] font-black rounded-full border-2 border-white shadow-md animate-bounce">
              1
            </div>
          </div>

          {/* Name & Title labels: "কিভাবে সাহায্য করতে পারি" */}
          <div className="flex flex-col items-start leading-tight text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">সুচি</span>
              <span className="text-[10px] text-emerald-200 font-medium">(Suchi)</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
              কিভাবে সাহায্য করতে পারি?
            </span>
          </div>
        </button>

        {/* Dedicated 'X' Button to Hide widget completely */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            stopSpeaking();
            setIsDismissed(true);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900/90 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer border border-white/70 transition-colors z-20"
          title="হাইড করুন (Hide)"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
};
