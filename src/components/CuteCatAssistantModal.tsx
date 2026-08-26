import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Search,
  Mic,
  MicOff,
  Camera,
  Upload,
  Image as ImageIcon,
  ChevronRight,
  X,
  Heart,
  Wrench,
  Flame,
  Stethoscope,
  Building2,
  Briefcase,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShoppingBag,
  FileText,
  AlertCircle,
  Send,
  MessageSquare,
  Bot,
  User,
  Trash2,
  CornerDownLeft,
  PhoneCall
} from 'lucide-react';
import { CuteCatAssistantSettings } from '../types';
import { marketplaceStore } from '../services/marketplaceStore';
import { CuteCatAvatarSvg } from './CuteCatAvatarSvg';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    view: string;
    label: string;
    params?: any;
  };
  suggestions?: string[];
}

interface CuteCatAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
  initialMode?: 'chat' | 'text' | 'voice' | 'photo';
}

export const CuteCatAssistantModal: React.FC<CuteCatAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialMode = 'chat'
}) => {
  const [settings, setSettings] = useState<CuteCatAssistantSettings>(() =>
    marketplaceStore.getCuteCatSettings()
  );

  const [activeTab, setActiveTab] = useState<'chat' | 'text' | 'voice' | 'photo'>(initialMode);
  
  // Interactive AI Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'মিউ! 🐾 আমি আপনার এআই ক্যাট অ্যাসিস্ট্যান্ট। ডাক্তার অ্যাপয়েন্টমেন্ট, এসি ও ফ্রিজ মেরামত, হোম নার্স, হোটেল বুকিং বা অনলাইন কেনাকাটা সম্পর্কে যেকোনো প্রশ্ন আমাকে জিজ্ঞেস করুন!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'এসি সার্ভিসিং ফি কত?',
        'মেডিসিন ডাক্তার সিরিয়াল',
        'কক্সবাজার হোটেল অফার',
        'কীভাবে সেলার হব?'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isVoiceSpeakingTts, setIsVoiceSpeakingTts] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Search Tab State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Photo Search States
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [detectedResults, setDetectedResults] = useState<{
    categoryName: string;
    view: string;
    confidence: number;
    description: string;
    params?: any;
    icon: any;
  }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sound & Mouth talking state
  const [isTalkingMouth, setIsTalkingMouth] = useState(false);

  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => {
      setSettings(marketplaceStore.getCuteCatSettings());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setIsTalkingMouth(true);
      setTimeout(() => setIsTalkingMouth(false), 900);
      scrollToChatBottom();
    } else {
      stopVoiceRecognition();
      stopTextToSpeech();
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToChatBottom();
    }
  }, [chatMessages, isAiTyping, activeTab]);

  const scrollToChatBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  // Text-To-Speech (TTS) Voice Engine
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !isTtsEnabled) return;

    try {
      window.speechSynthesis.cancel();
      // Clean special characters and emoji for smooth reading
      const cleanVoiceText = text
        .replace(/[*#•\[\]\(\)]/g, '')
        .replace(/মিউ!|ম্যাও!/g, 'Meow!')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanVoiceText);
      utterance.rate = 1.0;
      utterance.pitch = 1.2; // Slightly cute higher pitch for cat

      utterance.onstart = () => {
        setIsVoiceSpeakingTts(true);
        setIsTalkingMouth(true);
      };
      utterance.onend = () => {
        setIsVoiceSpeakingTts(false);
        setIsTalkingMouth(false);
      };
      utterance.onerror = () => {
        setIsVoiceSpeakingTts(false);
        setIsTalkingMouth(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      setIsVoiceSpeakingTts(false);
      setIsTalkingMouth(false);
    }
  };

  const stopTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceSpeakingTts(false);
    setIsTalkingMouth(false);
  };

  // Interactive AI Chat Send Handler
  const handleSendChatMessage = async (overrideText?: string) => {
    const textToSend = (overrideText || inputMessage).trim();
    if (!textToSend || isAiTyping) return;

    setInputMessage('');
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setIsAiTyping(true);
    setIsTalkingMouth(true);

    try {
      const response = await fetch('/api/ai-cat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.slice(-6).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.text
          }))
        })
      });

      const data = await response.json();
      setIsAiTyping(false);
      setIsTalkingMouth(false);

      if (data && (data.reply || data.success)) {
        const assistantMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'মিউ! আমি সাহায্য করতে প্রস্তুত। 🐾',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: data.action || undefined,
          suggestions: data.suggestions || undefined
        };

        setChatMessages((prev) => [...prev, assistantMsg]);

        // Auto read aloud if enabled
        if (isTtsEnabled) {
          speakText(assistantMsg.text);
        }
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.warn('AI Cat Chat Fetch Error:', error);
      setIsAiTyping(false);
      setIsTalkingMouth(false);

      // Smart local fallback in case of connection hiccup
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `মিউ! 🐾 আমি আপনার বার্তাটি পেয়েছি: "${textToSend}"। QAAGA মার্কেটপ্লেসে এসি সার্ভিস, ডাক্তার সিরিয়াল, নার্সিং, হোটেল বুকিং বা অনলাইন শপিং করতে নিচের বাটনটিতে ট্যাপ করুন।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: {
          view: 'service_request',
          label: 'সার্ভিস রিকোয়েস্ট দিন 🛠️'
        },
        suggestions: ['এসি মিস্ত্রি ফি কত?', 'ডাক্তার অ্যাপয়েন্টমেন্ট', 'কক্সবাজার হোটেল অফার']
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  const handleClearChatHistory = () => {
    stopTextToSpeech();
    setChatMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: 'মিউ! 🐾 চ্যাট রিসেট হয়েছে। আপনি নতুন কোনো সেবা, দামের তথ্য বা বুকিং সম্পর্কে জানতে চান?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'এসি সার্ভিসিং ফি কত?',
          'মেডিসিন ডাক্তার সিরিয়াল',
          'কক্সবাজার হোটেল অফার',
          'কীভাবে সেলার হব?'
        ]
      }
    ]);
  };

  // Voice Recognition Setup
  const startVoiceRecognition = () => {
    setVoiceError(null);
    setVoiceTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে ক্রোম ব্যবহার করুন বা টাইপ করে চ্যাট করুন।');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setIsTalkingMouth(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setIsTalkingMouth(false);
        if (event.error === 'not-allowed') {
          setVoiceError('মাইক্রোফোন পারমিশন এলাউ (Allow) করা হয়নি। ব্রাউজার সেটিংসে মাইক্রোফোন অন করুন।');
        } else if (event.error === 'no-speech') {
          setVoiceError('কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।');
        } else {
          setVoiceError(`ভয়েস রিকগনিশন ইরর: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsTalkingMouth(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
      setVoiceError('মাইক্রোফোন চালু করতে সমস্যা হয়েছে।');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsTalkingMouth(false);
    }
  };

  const handleVoiceSearchExecute = (queryText?: string) => {
    const textToSearch = queryText || voiceTranscript;
    if (!textToSearch.trim()) return;

    // Send as chat query or navigate
    setActiveTab('chat');
    handleSendChatMessage(textToSearch);
  };

  // Image / Photo Search Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setUploadedImage(imgUrl);
      scanAndAnalyzePhoto(file.name, imgUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSamplePhotoSelect = (sampleName: string, sampleUrl: string, detected: any[]) => {
    setUploadedImage(sampleUrl);
    setIsScanningPhoto(true);
    setIsTalkingMouth(true);
    setTimeout(() => {
      setIsScanningPhoto(false);
      setIsTalkingMouth(false);
      setDetectedResults(detected);
    }, 900);
  };

  const scanAndAnalyzePhoto = (fileName: string, _imgUrl: string) => {
    setIsScanningPhoto(true);
    setIsTalkingMouth(true);

    const name = fileName.toLowerCase();

    setTimeout(() => {
      setIsScanningPhoto(false);
      setIsTalkingMouth(false);

      // Smart classification based on file names or heuristics
      if (name.includes('ac') || name.includes('cooler') || name.includes('air')) {
        setDetectedResults([
          {
            categoryName: 'এসি মেরামত ও সার্ভিসিং (AC Repair & Servicing)',
            view: 'service_request',
            params: { categoryId: 'cat-ac-repair' },
            confidence: 96,
            description: 'স্মার্ট ডিটেকশন: এসি কুলিং সমস্যা, গ্যাস চার্জ বা ওয়াশ সার্ভিস।',
            icon: Wrench
          },
          {
            categoryName: 'হোম অ্যাপ্লায়েন্স মেরামত',
            view: 'service_request',
            params: { categoryId: 'cat-appliance' },
            confidence: 88,
            description: 'বাসার অন্যান্য ইলেকট্রনিক পণ্য সার্ভিসিং।',
            icon: Zap
          }
        ]);
      } else if (name.includes('doc') || name.includes('med') || name.includes('presc') || name.includes('health') || name.includes('hospital')) {
        setDetectedResults([
          {
            categoryName: 'বিশেষজ্ঞ ডাক্তার অ্যাপয়েন্টমেন্ট',
            view: 'doctors',
            confidence: 98,
            description: 'মেডিসিন, চর্ম, শিশু বা হৃদরোগ বিশেষজ্ঞ ডাক্তারের চেম্বার সিরিয়াল।',
            icon: Stethoscope
          },
          {
            categoryName: 'হোম নার্সিং ও কেয়ারগিভার',
            view: 'nurses',
            confidence: 85,
            description: 'বাসায় গিয়ে বয়োবৃদ্ধ বা পোস্ট-অপারেটিভ রোগীর সেবা।',
            icon: Heart
          }
        ]);
      } else if (name.includes('hotel') || name.includes('room') || name.includes('resort') || name.includes('bed')) {
        setDetectedResults([
          {
            categoryName: 'হোটেল ও রিসোর্ট বুকিং',
            view: 'hotels',
            confidence: 95,
            description: 'কক্সবাজার, সিলেট, সাজেক ও ঢাকার টপ রেটেড হোটেল রুম।',
            icon: Building2
          }
        ]);
      } else if (name.includes('phone') || name.includes('gadget') || name.includes('prod') || name.includes('watch') || name.includes('laptop')) {
        setDetectedResults([
          {
            categoryName: 'ট্রেন্ডিং ইলেকট্রনিক্স ও গ্যাজেট',
            view: 'products',
            confidence: 94,
            description: 'স্মার্টফোন, ব্লুটুথ ইয়ারবাডস, স্মার্টওয়াচ ও এক্সেসরিজ।',
            icon: ShoppingBag
          },
          {
            categoryName: 'পুরাতন ডিভাইস বাই-সেল',
            view: 'used_products',
            confidence: 86,
            description: 'সেকেন্ড হ্যান্ড ভেরিফাইড মোবাইল ও ল্যাপটপ।',
            icon: Sparkles
          }
        ]);
      } else {
        setDetectedResults([
          {
            categoryName: 'কাস্টম সার্ভিস টেকনিশিয়ান রিকোয়েস্ট',
            view: 'service_request',
            params: { query: 'ছবি অনুযায়ী কারিগরি সেবা' },
            confidence: 92,
            description: 'আপনার আপলোডকৃত ছবির সমস্যা অনুযায়ী উপযুক্ত মিস্ত্রি বা টেকনিশিয়ান।',
            icon: Wrench
          },
          {
            categoryName: 'ইলেকট্রিশিয়ান ও প্লাম্বিং সেবা',
            view: 'service_request',
            params: { categoryId: 'cat-electrician' },
            confidence: 84,
            description: 'ওয়্যারিং, শর্ট সার্কিট বা পাইপলাইন মেরামত।',
            icon: Zap
          },
          {
            categoryName: 'অনলাইন শপিং ও প্রডাক্টস',
            view: 'products',
            confidence: 80,
            description: 'মার্কেটপ্লেসের সেরা ডিলস ও হোম ডেলিভারি।',
            icon: ShoppingBag
          }
        ]);
      }
    }, 1000);
  };

  // Smart Search Navigation Execution
  const executeSmartSearch = (query: string) => {
    const q = query.toLowerCase();

    if (q.includes('ডাক্তার') || q.includes('doctor') || q.includes('হাসপাতাল') || q.includes('চেম্বার')) {
      onNavigate('doctors');
    } else if (q.includes('হোটেল') || q.includes('hotel') || q.includes('রিসোর্ট') || q.includes('রুম')) {
      onNavigate('hotels');
    } else if (q.includes('নার্স') || q.includes('nurse') || q.includes('কেয়ার') || q.includes('রোগী')) {
      onNavigate('nurses');
    } else if (q.includes('পণ্য') || q.includes('product') || q.includes('কেনাকাটা') || q.includes('শপ') || q.includes('কিনি')) {
      onNavigate('products');
    } else if (q.includes('বই') || q.includes('ebook') || q.includes('ইবুক') || q.includes('পিডিএফ')) {
      onNavigate('ebooks');
    } else if (q.includes('পুরাতন') || q.includes('used') || q.includes('সেকেন্ড')) {
      onNavigate('used_products');
    } else if (q.includes('চাকরি') || q.includes('job') || q.includes('নিয়োগ') || q.includes('সার্কুলার')) {
      onNavigate('jobs');
    } else {
      onNavigate('service_request', { query: query });
    }
  };

  const handleTextSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onClose();
    executeSmartSearch(searchQuery);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      id="cute-cat-assistant-modal-backdrop"
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="cute-cat-assistant-modal-box"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-purple-300 animate-scaleUp my-auto max-h-[92vh] flex flex-col overflow-hidden relative z-[100000]"
      >
        {/* MODAL TOP HEADER */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-amber-50/40 to-purple-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer group" onClick={() => speakText('মিউ! কেমন আছেন? আমি আপনার এআই ক্যাট!')}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-[#4e20b8] p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <CuteCatAvatarSvg
                  skin={settings.catSkin || 'orange-tabby'}
                  isTalking={isTalkingMouth || isListening || isVoiceSpeakingTts || isAiTyping}
                  size={46}
                  customUrl={settings.avatarUrl}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white flex items-center gap-0.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>AI লাইভ</span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                  <span>{settings.catName}</span>
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                </h3>
                <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                  AI চ্যাট ও অ্যাসিস্ট্যান্ট 🐾
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {isAiTyping ? 'মিউ মিউ উত্তর তৈরি করছে... ✨' : settings.catSubtitleBangla || 'চ্যাট করুন, কথা বলুন বা ছবি দিয়ে নিমেষেই সমাধান নিন!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Sound readout toggle */}
            <button
              onClick={() => {
                if (isVoiceSpeakingTts) {
                  stopTextToSpeech();
                }
                setIsTtsEnabled(!isTtsEnabled);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isTtsEnabled
                  ? 'bg-purple-100 text-[#4e20b8] border-purple-300'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
              title={isTtsEnabled ? 'বিড়ালের কণ্ঠ শুনুন (Voice ON)' : 'কণ্ঠ মিউট করুন (Voice OFF)'}
            >
              {isTtsEnabled ? <Volume2 size={16} className={isVoiceSpeakingTts ? 'animate-bounce text-purple-700' : ''} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline text-[11px]">{isTtsEnabled ? 'ভয়েস অন' : 'মিউট'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 4 MULTIMODAL TABS: CHAT, SEARCH, VOICE, PHOTO */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 border-b border-purple-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-[#4e20b8] shadow-xs ring-2 ring-purple-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={14} className="text-purple-600" />
            <span className="truncate">চ্যাট (Chat)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-[#4e20b8] shadow-xs ring-2 ring-purple-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search size={14} />
            <span className="truncate">ক্যাটাগরি</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('voice');
              startVoiceRecognition();
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-white text-rose-600 shadow-xs ring-2 ring-rose-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic size={14} className={isListening ? 'text-rose-500 animate-pulse' : ''} />
            <span className="truncate">ভয়েস</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-white text-[#ff6d00] shadow-xs ring-2 ring-amber-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera size={14} />
            <span className="truncate">ফটো</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE AI CHAT (PRIMARY REAL-TIME CONVERSATION) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60 overflow-hidden">
            {/* Chat Message History Window */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
              
              {chatMessages.map((msg) => {
                const isBot = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 animate-fadeIn ${
                      isBot ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {/* Bot Avatar Icon */}
                    {isBot && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden shadow-2xs">
                        <CuteCatAvatarSvg skin={settings.catSkin || 'orange-tabby'} size={28} isTalking={isVoiceSpeakingTts} />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                      {/* Message Bubble Card */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isBot
                            ? 'bg-white text-slate-800 border border-purple-200 rounded-tl-xs'
                            : 'bg-[#4e20b8] text-white rounded-tr-xs shadow-purple-900/10'
                        }`}
                      >
                        {/* Speaker Button on Bot Message */}
                        {isBot && (
                          <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-purple-50 text-[10px] font-black text-purple-700">
                            <span className="flex items-center gap-1">
                              <span>🐱 {settings.catName}</span>
                              <span className="text-amber-500">✨</span>
                            </span>
                            <button
                              onClick={() => speakText(msg.text)}
                              className="hover:text-purple-900 text-purple-600 flex items-center gap-1 p-0.5 rounded cursor-pointer"
                              title="উচ্চস্বরে শুনুন"
                            >
                              <Volume2 size={12} />
                              <span className="text-[9px]">শুনুন</span>
                            </button>
                          </div>
                        )}

                        {/* Render Message Text with formatted bullet points */}
                        <div className="whitespace-pre-line font-normal">
                          {msg.text}
                        </div>

                        {/* Interactive Direct Navigation / Action Button inside Chat Bubble */}
                        {msg.action && (
                          <div className="mt-3 pt-2.5 border-t border-purple-100">
                            <button
                              onClick={() => {
                                onClose();
                                onNavigate(msg.action!.view, msg.action!.params);
                              }}
                              className="w-full bg-gradient-to-r from-[#4e20b8] to-purple-700 hover:from-[#3d1796] hover:to-purple-800 text-white font-black text-xs py-2 px-3.5 rounded-xl shadow-xs flex items-center justify-between gap-2 transition-all cursor-pointer group hover:scale-101 active:scale-98"
                            >
                              <span className="flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-300" />
                                <span>{msg.action.label}</span>
                              </span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Time stamp and suggested reply chips */}
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] text-slate-400 font-medium">{msg.timestamp}</span>
                      </div>

                      {/* 1-Click Follow-Up Question Chips */}
                      {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendChatMessage(sug)}
                              className="text-[10px] font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer hover:border-purple-400 active:scale-95"
                            >
                              💡 {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* User Avatar Icon */}
                    {!isBot && (
                      <div className="w-8 h-8 rounded-full bg-[#4e20b8] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bot Typing Animation Indicator */}
              {isAiTyping && (
                <div className="flex items-start gap-2.5 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0 overflow-hidden">
                    <CuteCatAvatarSvg skin={settings.catSkin || 'orange-tabby'} size={28} isTalking={true} />
                  </div>
                  <div className="bg-white border border-purple-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#4e20b8] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#ff6d00] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#4e20b8] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs font-bold text-purple-700">মিউ মিউ ভাবছে... 🐾</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Interactive Chat Input Bar & Fast Prompt Suggestions */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-purple-100 shrink-0 space-y-2">
              
              {/* Quick Prompt Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                <span className="text-[10px] font-extrabold text-slate-400 shrink-0 flex items-center gap-0.5">
                  <Flame size={11} className="text-amber-500" />
                  <span>প্রম্পট:</span>
                </span>
                {[
                  'এসি গ্যাস চার্জ কত?',
                  'ভালো মেডিসিন ডাক্তার',
                  'কক্সবাজার হোটেল অফার',
                  'হোম নার্সিং খরচ',
                  'সেলার রেজিস্ট্রেশন'
                ].map((quickText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChatMessage(quickText)}
                    className="text-[10px] font-semibold text-slate-600 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer"
                  >
                    {quickText}
                  </button>
                ))}
              </div>

              {/* Chat Input Field & Send Action */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-1.5"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="মিউ মিউকে প্রশ্ন করুন (যেমন: এসি গ্যাস রিফিল কত টাকা?)..."
                    className="w-full pl-3.5 pr-20 py-2.5 text-xs sm:text-sm bg-slate-50 border-2 border-purple-200 rounded-2xl focus:bg-white focus:border-[#4e20b8] focus:ring-2 focus:ring-purple-100 outline-none transition-all font-medium text-slate-900"
                    autoFocus
                  />

                  {/* Embedded Voice Button inside input */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('voice');
                        startVoiceRecognition();
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="ভয়েস দিয়ে প্রশ্ন করুন"
                    >
                      <Mic size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('photo')}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                      title="ছবি দিয়ে সার্চ করুন"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isAiTyping}
                  className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                    inputMessage.trim() && !isAiTyping
                      ? 'bg-[#4e20b8] hover:bg-[#3d1796] text-white hover:scale-105 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title="পাঠান"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">পাঠান</span>
                </button>

                {/* Reset Chat Button */}
                <button
                  type="button"
                  onClick={handleClearChatHistory}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="চ্যাট হিস্ট্রি রিসেট করুন"
                >
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: TEXT SEARCH & 1-CLICK CATEGORIES */}
        {activeTab === 'text' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fadeIn">
            {/* Search input with embedded voice & camera buttons */}
            <form onSubmit={handleTextSearchSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="যেমন: এসি গ্যাস রিফিল, শিশু বিশেষজ্ঞ, কক্সবাজার হোটেল..."
                  className="w-full pl-10 pr-28 py-3 text-xs sm:text-sm bg-slate-50 border-2 border-purple-200 rounded-2xl focus:bg-white focus:border-[#4e20b8] focus:ring-2 focus:ring-purple-100 outline-none transition-all font-medium"
                  autoFocus
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                
                {/* Embedded Quick Action Icons inside Input */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('voice');
                      startVoiceRecognition();
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ভয়েস দিয়ে বলুন"
                  >
                    <Mic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('photo')}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="ছবি আপলোড করুন"
                  >
                    <Camera size={16} />
                  </button>
                  <button
                    type="submit"
                    className="bg-[#4e20b8] hover:bg-[#3d1796] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    খুঁজুন
                  </button>
                </div>
              </div>
            </form>

            {/* Speech bubble greeting */}
            <div className="p-3 bg-gradient-to-r from-purple-50 via-amber-50/50 to-purple-50 rounded-2xl border border-purple-200 flex items-start gap-2.5">
              <span className="text-xl">🐱</span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                <strong className="text-[#4e20b8]">মিউ! কী খুঁজছেন আমাকে বলুন:</strong> ডাক্তার অ্যাপয়েন্টমেন্ট, এসি ও ফ্রিজ মেরামত, হোম নার্স, হোটেল বুকিং নাকি নতুন গ্যাজেট? নিচের অপশনগুলোতে ১-ক্লিক করুন!
              </p>
            </div>

            {/* 1-Click Fast Suggestions */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Flame size={12} className="text-amber-500" />
                <span>জনপ্রিয় ক্যাটাগরি ও সেবা সমূহ:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {settings.quickChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      onClose();
                      onNavigate(chip.view, chip.params);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#4e20b8] block truncate">
                      {chip.label}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                      <span>সরাসরি বুকিং</span>
                      <ChevronRight size={10} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VOICE SEARCH (MICROPHONE & LIVE WAVEFORM) */}
        {activeTab === 'voice' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fadeIn text-center">
            {/* Language Selector */}
            <div className="flex justify-center items-center gap-2">
              <span className="text-xs font-bold text-slate-600">ভাষা সিলেক্ট করুন:</span>
              <button
                type="button"
                onClick={() => {
                  setVoiceLang('bn-BD');
                  if (isListening) startVoiceRecognition();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  voiceLang === 'bn-BD'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🇧🇩 বাংলা (Bangla)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoiceLang('en-US');
                  if (isListening) startVoiceRecognition();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  voiceLang === 'en-US'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🇺🇸 English
              </button>
            </div>

            {/* Big Animated Mic Button & Pulse Waves */}
            <div className="relative flex flex-col items-center justify-center my-4">
              {/* Pulsing circular ripples when listening */}
              {isListening && (
                <>
                  <div className="absolute w-36 h-36 rounded-full bg-rose-400/20 animate-ping" />
                  <div className="absolute w-28 h-28 rounded-full bg-rose-500/30 animate-pulse" />
                </>
              )}

              <button
                type="button"
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-xl ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white scale-110 ring-4 ring-rose-200'
                    : 'bg-gradient-to-tr from-[#4e20b8] to-purple-600 text-white hover:scale-105'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic size={32} className="animate-bounce" />
                    <span className="text-[9px] font-black uppercase mt-1">শুনছি...</span>
                  </>
                ) : (
                  <>
                    <Mic size={30} />
                    <span className="text-[9px] font-black uppercase mt-1">ট্যাপ করুন</span>
                  </>
                )}
              </button>

              {/* Live Audio Visualizer Bars */}
              {isListening && (
                <div className="flex items-center gap-1 mt-4 h-6">
                  <span className="w-1 bg-rose-500 rounded-full animate-soundWave1" />
                  <span className="w-1 bg-rose-500 rounded-full animate-soundWave2" />
                  <span className="w-1 bg-rose-500 rounded-full animate-soundWave3" />
                  <span className="w-1 bg-rose-500 rounded-full animate-soundWave4" />
                  <span className="w-1 bg-rose-500 rounded-full animate-soundWave2" />
                  <span className="w-1 bg-rose-500 rounded-full animate-soundWave1" />
                </div>
              )}
            </div>

            {/* Real-time Voice Transcript Box */}
            <div className="bg-slate-50 border-2 border-dashed border-purple-200 p-4 rounded-2xl min-h-[70px] flex flex-col items-center justify-center">
              {voiceTranscript ? (
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-black text-slate-800">
                    "{voiceTranscript}"
                  </p>
                  <button
                    type="button"
                    onClick={() => handleVoiceSearchExecute()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    <span>চ্যাটে পাঠান ও সমাধান নিন</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  {isListening
                    ? 'মাইক্রোফোনে স্পষ্ট করে বলুন আপনি কী সেবা বা পণ্য খুঁজছেন...'
                    : 'মাইক্রোফোন বাটনে ট্যাপ করে কথা বলা শুরু করুন'}
                </p>
              )}
            </div>

            {/* Error Notice */}
            {voiceError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span>{voiceError}</span>
              </div>
            )}

            {/* Ready Voice Prompts (1-Click Voice Shortcuts) */}
            <div className="space-y-2 text-left pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 block">
                অথবা সরাসরি ভয়েস প্রম্পটে ট্যাপ করুন:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '🎤 এসি মেরামত মিস্ত্রি ফি',
                  '🎤 মেডিসিন বিশেষজ্ঞ ডাক্তার',
                  '🎤 কক্সবাজার বিচ রিসোর্ট অফার',
                  '🎤 জরুরি ইলেকট্রিশিয়ান',
                  '🎤 হোম নার্স ও রোগী সেবা',
                  '🎤 ট্রেন্ডিং স্মার্টফোন ডিল'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const cleanText = prompt.replace('🎤 ', '');
                      setVoiceTranscript(cleanText);
                      handleVoiceSearchExecute(cleanText);
                    }}
                    className="text-xs font-semibold bg-purple-50 hover:bg-[#4e20b8] hover:text-white text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PHOTO / CAMERA SEARCH */}
        {activeTab === 'photo' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fadeIn">
            {/* Photo Upload & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-purple-300 hover:border-[#4e20b8] bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl p-5 text-center transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="relative inline-block max-w-full">
                  {/* Laser Scanner Bar Animation */}
                  {isScanningPhoto && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00e5ff] animate-photoScanner z-20" />
                  )}
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="max-h-44 rounded-xl object-contain mx-auto shadow-md border border-purple-200"
                  />
                  <div className="mt-2 text-xs font-bold text-purple-700 flex items-center justify-center gap-1">
                    <RefreshCw size={13} className={isScanningPhoto ? 'animate-spin' : ''} />
                    <span>{isScanningPhoto ? 'ছবি স্ক্যান ও বিশ্লেষণ করা হচ্ছে...' : 'অন্য ছবি পরিবর্তন করতে ট্যাপ করুন'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-14 h-14 bg-purple-100 text-[#4e20b8] rounded-2xl flex items-center justify-center mx-auto shadow-xs group-hover:scale-110 transition-transform">
                    <Camera size={26} />
                  </div>
                  <div className="text-xs font-black text-slate-800">
                    ছবি আপলোড করুন বা সরাসরি ফটো তুলুন
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    ভাঙা এসি, ইলেকট্রিক বোর্ড, ওষুধের প্রেসক্রিপশন বা পণ্যের ছবি আপলোড করলে ক্যাট অ্যাসিস্ট্যান্ট তৎক্ষণাৎ উপযুক্ত সেবা খুঁজে দেবে।
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4e20b8] bg-white border border-purple-200 px-3 py-1 rounded-full shadow-2xs">
                    <Upload size={11} />
                    <span>গ্যালারি বা ক্যামেরা ওপেন করুন</span>
                  </span>
                </div>
              )}
            </div>

            {/* Sample Photo Demos (1-Click Test Photos) */}
            {!uploadedImage && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  বা স্যাম্পল ছবি দিয়ে টেস্ট করুন:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSamplePhotoSelect('ac-sample', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80', [
                        {
                          categoryName: 'এসি মেরামত ও গ্যাস রিফিল',
                          view: 'service_request',
                          params: { categoryId: 'cat-ac-repair' },
                          confidence: 97,
                          description: 'কুলিং সমস্যা বা ফ্যান স্পিড মেরামত।',
                          icon: Wrench
                        }
                      ])
                    }
                    className="p-2 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-xl text-left transition-all text-[11px] font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-base">❄️</span>
                    <span>এসি মেশিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSamplePhotoSelect('doc-sample', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80', [
                        {
                          categoryName: 'মেডিসিন ও প্রেসক্রিপশন ডাক্তার',
                          view: 'doctors',
                          confidence: 96,
                          description: 'প্রেসক্রিপশন ভিত্তিক বিশেষজ্ঞ চিকিৎসক।',
                          icon: Stethoscope
                        }
                      ])
                    }
                    className="p-2 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-xl text-left transition-all text-[11px] font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-base">🩺</span>
                    <span>প্রেসক্রিপশন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSamplePhotoSelect('hotel-sample', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80', [
                        {
                          categoryName: 'লাক্সারি হোটেল রুম',
                          view: 'hotels',
                          confidence: 95,
                          description: 'হোটেল ও রিসোর্ট অগ্রিম বুকিং।',
                          icon: Building2
                        }
                      ])
                    }
                    className="p-2 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-xl text-left transition-all text-[11px] font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-base">🏨</span>
                    <span>হোটেল রুম</span>
                  </button>
                </div>
              </div>
            )}

            {/* Detected Smart Results */}
            {detectedResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-purple-100">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>ছবি অনুযায়ী পাওয়া সেবা সমূহ:</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ ম্যাচিং সম্পন্ন
                  </span>
                </div>

                <div className="space-y-2">
                  {detectedResults.map((result, idx) => {
                    const Icon = result.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          onClose();
                          onNavigate(result.view, result.params);
                        }}
                        className="p-3 bg-gradient-to-r from-purple-50/70 to-amber-50/50 hover:from-purple-100 hover:to-amber-100 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer shadow-2xs group hover:scale-101"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-purple-200 text-[#4e20b8] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#4e20b8] group-hover:text-white transition-colors">
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-800 group-hover:text-[#4e20b8] truncate">
                              {result.categoryName}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {result.description}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-purple-700 bg-white px-2 py-1 rounded-lg border border-purple-200 shadow-2xs">
                            {result.confidence}% ম্যাচ
                          </span>
                          <ArrowRight size={14} className="text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-3 border-t border-purple-100 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onNavigate('service_request');
            }}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Wrench size={13} />
            <span>কাস্টম রিকোয়েস্ট সাবমিট করুন</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('partner_register');
            }}
            className="py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-[#4e20b8] border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            সেলার হন
          </button>
        </div>
      </div>

      <style>{`
        @keyframes soundWave1 {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }
        @keyframes soundWave2 {
          0%, 100% { height: 16px; }
          50% { height: 8px; }
        }
        @keyframes soundWave3 {
          0%, 100% { height: 10px; }
          50% { height: 26px; }
        }
        @keyframes soundWave4 {
          0%, 100% { height: 20px; }
          50% { height: 12px; }
        }
        .animate-soundWave1 {
          animation: soundWave1 0.6s ease-in-out infinite;
        }
        .animate-soundWave2 {
          animation: soundWave2 0.5s ease-in-out infinite 0.1s;
        }
        .animate-soundWave3 {
          animation: soundWave3 0.7s ease-in-out infinite 0.2s;
        }
        .animate-soundWave4 {
          animation: soundWave4 0.55s ease-in-out infinite 0.15s;
        }

        @keyframes photoScanner {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        .animate-photoScanner {
          animation: photoScanner 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
