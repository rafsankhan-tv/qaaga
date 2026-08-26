import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  UserCheck,
  Calendar,
  Wrench,
  Stethoscope,
  Building2,
  ShoppingBag,
  Briefcase,
  Share2,
  Heart,
  MessageSquare,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  Lock,
  ThumbsUp
} from 'lucide-react';
import { FeedPost } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';
import { SUGGESTED_PROFILES_TO_FOLLOW } from '../../data/mockFeedData';
import { SocialShareModal, ShareTargetData } from '../common/SocialShareModal';

interface FeedProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const FeedProfileModal: React.FC<FeedProfileModalProps> = ({
  isOpen,
  onClose,
  targetId,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-admin';

  // Tabs: 'posts' | 'services' | 'reviews' | 'about'
  const [activeTab, setActiveTab] = useState<'posts' | 'services' | 'reviews' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorPosts, setAuthorPosts] = useState<FeedPost[]>([]);
  
  // Interactive Comments & Reviews
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Custom User Review Form
  const [userRating, setUserRating] = useState(5);
  const [userReviewComment, setUserReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewsList, setReviewsList] = useState<Array<{
    id: string;
    userName: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
  }>>([
    {
      id: 'rev-1',
      userName: 'তানভীর আহমেদ',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '২৪ আগস্ট, ২০২৬',
      comment: 'অত্যন্ত দক্ষ এবং পেশাদার সার্ভিস। সময়মত এসে কাজ শেষ করেছেন এবং ব্যবহার খুবই অমায়িক।'
    },
    {
      id: 'rev-2',
      userName: 'শারমিন আক্তার',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '২২ আগস্ট, ২০২৬',
      comment: 'খুবই চমৎকার পরামর্শ দিয়েছেন। রোগীর প্রতি অত্যন্ত যত্নবান। শতভাগ রিকমেন্ডেড।'
    },
    {
      id: 'rev-3',
      userName: 'রাকিবুল হাসান',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '১৮ আগস্ট, ২০২৬',
      comment: 'QAAGA-এর মাধ্যমে সার্ভিস নিয়ে খুবই সন্তুষ্ট। কোয়ালিটি এবং রেট দুটোই পারফেক্ট ছিল।'
    }
  ]);

  // Social Share Sheet State
  const [shareModalData, setShareModalData] = useState<ShareTargetData | null>(null);

  // In-Profile Admin Support Chat State
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const [adminChatMessages, setAdminChatMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'admin' | 'system';
    senderName: string;
    text: string;
    time: string;
    badge?: string;
  }>>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Find profile details across all platform stores
  const suggestedProfile = SUGGESTED_PROFILES_TO_FOLLOW.find(p => p.id === targetId);
  const allUsers = marketplaceStore.getUsers();
  const matchedUser = allUsers.find(u => u.id === targetId);
  const matchedDoctor = marketplaceStore.getDoctors().find(d => d.id === targetId || d.userId === targetId);
  const matchedProvider = marketplaceStore.getProviders().find(p => p.id === targetId || p.userId === targetId);
  const matchedHotel = marketplaceStore.getHotels().find(h => h.id === targetId);
  const matchedSeller = marketplaceStore.getProducts().find(p => p.sellerId === targetId);

  const profileName =
    suggestedProfile?.name ||
    matchedDoctor?.name ||
    matchedProvider?.fullName ||
    matchedHotel?.name ||
    matchedUser?.fullName ||
    'QAAGA ভেরিফাইড প্রফেশনাল';

  const profileAvatar =
    suggestedProfile?.avatar ||
    matchedDoctor?.doctorPhoto ||
    matchedProvider?.avatarUrl ||
    matchedHotel?.coverImage ||
    matchedUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';

  const profileCover =
    suggestedProfile?.cover ||
    matchedDoctor?.doctorPhoto ||
    matchedHotel?.coverImage ||
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80';

  const profileRole =
    suggestedProfile?.role ||
    (matchedDoctor ? 'DOCTOR' : matchedProvider ? 'PROVIDER' : matchedHotel ? 'HOTEL_MANAGER' : matchedUser?.activeRole || 'USER');

  const profileBadge =
    suggestedProfile?.badge ||
    (matchedDoctor
      ? 'বিএমডিসি ভেরিফাইড (মেডিসিন ও স্পেশালিস্ট)'
      : matchedProvider
      ? 'সার্টিফাইড টেকনিশিয়ান ও এক্সপার্ট'
      : matchedHotel
      ? '৫-স্টার লাক্সারি রিসোর্ট'
      : 'ভেরিফাইড মেম্বার');

  const profileBio =
    suggestedProfile?.bio ||
    (matchedDoctor ? `${matchedDoctor.specialization} • ${matchedDoctor.degree} • ${matchedDoctor.hospitalChamber}` : undefined) ||
    matchedProvider?.description ||
    (matchedHotel ? `${matchedHotel.name} • ${matchedHotel.stars}-স্টার হোটেল ও রিসোর্ট • ${matchedHotel.address}` : undefined) ||
    'Qaaga.com-এর ভেরিফাইড ও বিশ্বস্ত সার্ভিস প্রোভাইডার। গ্রাহক সন্তুষ্টি ও সর্বোচ্চ মান নিশ্চিত করাই আমাদের অঙ্গীকার।';

  const profileDistrict =
    suggestedProfile?.district ||
    matchedDoctor?.district ||
    matchedProvider?.district ||
    matchedHotel?.district ||
    matchedUser?.district ||
    'ঢাকা';

  const profileRating = suggestedProfile?.rating || matchedDoctor?.rating || matchedProvider?.rating || matchedHotel?.rating || 4.95;
  const profileReviewCount = (suggestedProfile?.reviewCount || matchedDoctor?.reviewCount || matchedProvider?.reviewCount || matchedHotel?.reviewCount || 140) + (reviewSubmitted ? 1 : 0);
  const followerCount = marketplaceStore.getFollowerCount(targetId) + (suggestedProfile?.followersCount || 230);
  const phoneNumber = matchedProvider?.phone || '09658824360';
  const whatsappNumber = '8801644985301';

  // Load posts for this author
  useEffect(() => {
    if (targetId) {
      setIsFollowing(marketplaceStore.isFollowing(currentUserId, targetId));
      const posts = marketplaceStore.getPostsByAuthor(targetId);
      
      // If no posts in store for this specific author, generate fallback sample feed posts
      if (posts.length === 0) {
        const samplePosts: FeedPost[] = [
          {
            id: `post-gen-${targetId}-1`,
            authorId: targetId,
            authorName: profileName,
            authorAvatar: profileAvatar,
            authorRole: profileRole as any,
            authorBadge: profileBadge,
            authorRating: profileRating,
            authorDistrict: profileDistrict,
            postType: 'UPDATE',
            title: `✨ ${profileName}-এর বিশেষ আপডেট ও পরামর্শ`,
            content: `সম্মানিত গ্রাহক ও শুভানুধ্যায়ীগণ, আমরা সার্বক্ষণিক সর্বোচ্চ পেশাদারিত্ব ও সততার সাথে সেবা প্রদানে প্রতিশ্রুতিবদ্ধ। যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন অথবা নিচে অ্যাপয়েন্টমেন্ট/সার্ভিস বুকিং দিন।`,
            images: [profileCover],
            tags: ['VerifiedService', 'QaagaOfficial', 'CustomerCare'],
            categoryKey: 'general',
            likesCount: 64,
            likedBy: [],
            comments: [],
            sharesCount: 12,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setAuthorPosts(samplePosts);
      } else {
        setAuthorPosts(posts);
      }
    }
  }, [targetId, currentUserId, isOpen, profileName, profileAvatar, profileBadge, profileRating, profileDistrict, profileCover, profileRole]);

  // Handle Follow / Unfollow
  const handleToggleFollow = () => {
    const newStatus = marketplaceStore.toggleFollow(currentUserId, {
      id: targetId,
      name: profileName,
      avatar: profileAvatar,
      role: profileRole,
      badge: profileBadge,
      category: suggestedProfile?.category,
      rating: profileRating
    });
    setIsFollowing(newStatus);
  };

  // Handle Like on Author Post
  const handleToggleLike = (postId: string) => {
    marketplaceStore.toggleLikeFeedPost(postId, currentUserId);
    setAuthorPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = p.likedBy.includes(currentUserId);
          return {
            ...p,
            likedBy: isLiked ? p.likedBy.filter(id => id !== currentUserId) : [...p.likedBy, currentUserId],
            likesCount: isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1
          };
        }
        return p;
      })
    );
  };

  // Handle Comment on Author Post
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    marketplaceStore.addCommentToFeedPost(postId, {
      userId: currentUserId,
      userName: currentUser?.fullName || 'সম্মানিত গ্রাহক',
      userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      userRole: currentUser?.activeRole || 'CUSTOMER',
      text: text.trim()
    });

    setAuthorPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `comm-${Date.now()}`,
                postId,
                userId: currentUserId,
                userName: currentUser?.fullName || 'সম্মানিত গ্রাহক',
                userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
                text: text.trim(),
                createdAt: new Date().toISOString()
              }
            ]
          };
        }
        return p;
      })
    );

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Submit New Review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      userName: currentUser?.fullName || 'আপনি (ভেরিফাইড কাস্টমার)',
      avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: userRating,
      date: 'আজকে',
      comment: userReviewComment.trim()
    };

    setReviewsList(prev => [newRev, ...prev]);
    setUserReviewComment('');
    setReviewSubmitted(true);
  };

  // Open Social Share for Profile
  const handleShareProfile = () => {
    setShareModalData({
      type: 'profile',
      id: targetId,
      title: profileName,
      subtitle: `${profileBadge} • ${profileDistrict}`,
      image: profileAvatar,
      badge: 'ভেরিফাইড প্রোফাইল'
    });
  };

  // Open Social Share for Post
  const handleSharePost = (post: FeedPost) => {
    setShareModalData({
      type: 'post',
      id: post.id,
      title: post.title || `${profileName}-এর পোস্ট`,
      subtitle: post.content.slice(0, 100) + '...',
      image: (post.images && post.images[0]) || profileAvatar,
      badge: 'ফিড আপডেট'
    });
  };

  // Open In-Profile Admin Support Chat
  const handleOpenAdminChat = () => {
    setIsAdminChatOpen(true);
    if (adminChatMessages.length === 0) {
      setAdminChatMessages([
        {
          id: 'sys-init',
          sender: 'system',
          senderName: 'সেন্ট্রাল সিকিউরিটি সিস্টেম',
          text: `🛡️ QAAGA সেন্ট্রাল অ্যাডমিন ও সাপোর্ট ডেস্কে স্বাগতম। আপনি "${profileName}" (${profileBadge})-এর প্রোফাইল ইনকোয়ারি করতে এসেছেন। গ্রাহক ও আর্থিক সুরক্ষার স্বার্থে এই প্রোফাইল সংক্রান্ত সকল চ্যাট ও ডিল সরাসরি সেন্ট্রাল অ্যাডমিন মনিটর করে।`,
          time: 'সিস্টেম ভেরিফাইড'
        },
        {
          id: 'adm-welcome',
          sender: 'admin',
          senderName: 'QAAGA অ্যাডমিন সাপোর্ট',
          badge: 'অফিসিয়াল স্পেশালিস্ট',
          text: `আসসালামু আলাইকুম ${currentUser?.fullName || 'সম্মানিত গ্রাহক'}! ${profileName}-এর অ্যাপয়েন্টমেন্ট, সার্ভিস চার্জ, রেট বা কাজের এলাকা সম্পর্কে আপনার যেকোনো প্রশ্ন থাকলে জানান। আমরা তাৎক্ষণিক সহায়তা করছি।`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Send message in Admin In-Profile Chat
  const handleSendAdminChatMessage = (overrideText?: string) => {
    const text = overrideText || chatInputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      senderName: currentUser?.fullName || 'আপনি',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdminChatMessages(prev => [...prev, userMsg]);
    setChatInputText('');
    setIsChatTyping(true);

    // Save to global marketplace support store
    marketplaceStore.sendSupportMessage(
      'support-main',
      `[প্রোফাইল ইনকোয়ারি: ${profileName} (আইডি: ${targetId})]: ${text.trim()}`,
      currentUser?.fullName || 'সম্মানিত গ্রাহক'
    );

    // Simulated verified admin response
    setTimeout(() => {
      setIsChatTyping(false);
      let replyText = `ধন্যবাদ আপনার বার্তার জন্য। "${profileName}"-এর বর্তমান শিডিউল অ্যাক্টিভ আছে। আমাদের সেন্ট্রাল ডেস্ক থেকে এখনই আপনার ইনকোয়ারি প্রসেস করা হচ্ছে। আপনি চাইলে সরাসরি "সার্ভিস বুকিং" বাটনে ক্লিক করে বুকিং চূড়ান্ত করতে পারেন।`;
      
      if (text.includes('ফি') || text.includes('চার্জ') || text.includes('টাকা') || text.includes('দাম')) {
        replyText = `"${profileName}"-এর সার্ভিস রেট ও ভিজিট চার্জ QAAGA প্ল্যাটফর্মে অনুমোদিত ও নির্ধারিত। কোনো অতিরিক্ত চার্জ ছাড়াই সেন্ট্রাল এসক্রো নিরাপত্তার মাধ্যমে আপনি সার্ভিস নিতে পারবেন।`;
      } else if (text.includes('শিডিউল') || text.includes('সময়') || text.includes('কখন') || text.includes('তারিখ')) {
        replyText = `"${profileName}" নিয়মিত সকাল ৯টা থেকে রাত ৮টা পর্যন্ত সেবা দিয়ে থাকেন। আপনার সুবিধাজনক তারিখ ও সময় বুকিং ফর্মে উল্লেখ করে সাবমিট করুন।`;
      } else if (text.includes('গ্যারান্টি') || text.includes('সুরক্ষা') || text.includes('ওয়ারেন্টি')) {
        replyText = `QAAGA-এর মাধ্যমে সম্পন্ন প্রতিটি সার্ভিসে রয়েছে ১০০% মান নিয়ন্ত্রণ ও রিফান্ড গ্যারান্টি। কোনো কাজের অসন্তোষ হলে সেন্ট্রাল টিম দ্রুত সমাধান দেয়।`;
      }

      setAdminChatMessages(prev => [
        ...prev,
        {
          id: `adm-${Date.now()}`,
          sender: 'admin',
          senderName: 'QAAGA অ্যাডমিন ডেস্ক',
          badge: 'ভেরিফাইড সুপারভাইজার',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 850);
  };

  // Book / Action CTA Handler
  const handleBookAction = () => {
    onClose();
    if (suggestedProfile?.targetView) {
      onNavigate(suggestedProfile.targetView, suggestedProfile.targetParams);
    } else if (matchedDoctor) {
      onNavigate('doctors', { doctorId: matchedDoctor.id });
    } else if (matchedProvider) {
      onNavigate('service_request', { providerId: matchedProvider.id });
    } else if (matchedHotel) {
      onNavigate('hotels', { hotelId: matchedHotel.id });
    } else {
      onNavigate('service_request');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
          
          {/* Top Actions: Share & Close Buttons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md text-xs font-bold backdrop-blur-xs border border-white/20"
              title="প্রোফাইল শেয়ার করুন"
            >
              <Share2 size={14} />
              <span>প্রোফাইল শেয়ার</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-xs border border-white/20"
              title="বন্ধ করুন"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Container */}
          <div className="overflow-y-auto">
            
            {/* Profile Cover Banner */}
            <div className="relative h-44 sm:h-56 w-full bg-slate-800 overflow-hidden">
              <img
                src={profileCover}
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              
              {/* Category Pill on Banner */}
              <span className="absolute bottom-3 right-4 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-md">
                {suggestedProfile?.category || (matchedDoctor ? 'মেডিকেল ও বিশেষজ্ঞ' : matchedProvider ? 'হোম ও রিপেয়ার' : 'ভেরিফাইড সার্ভিস')}
              </span>
            </div>

            {/* Profile Info Header */}
            <div className="relative px-5 sm:px-7 pb-6 pt-0">
              
              {/* Avatar and Action Buttons Row */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
                
                {/* Avatar with Online Pulse */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl bg-white shrink-0">
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-full h-full aspect-square object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
                      }}
                    />
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-emerald-300 animate-pulse" />
                </div>

                {/* Primary Action Buttons: Follow, Chat with Admin, and Service Book */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Follow / Unfollow */}
                  <button
                    onClick={handleToggleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isFollowing
                        ? 'bg-purple-50 hover:bg-rose-50 text-[#4e20b8] hover:text-rose-600 border border-purple-200 hover:border-rose-200'
                        : 'bg-[#4e20b8] hover:bg-[#3d1796] text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={15} className="text-emerald-600" />
                        <span>ফলোয়িং (Following)</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} />
                        <span>+ ফলো করুন</span>
                      </>
                    )}
                  </button>

                  {/* Chat Option (Connects to Admin / Central Support Desk for this profile) */}
                  <button
                    onClick={handleOpenAdminChat}
                    className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-[#4e20b8] border border-purple-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    title="এই প্রোফাইলের ব্যাপারে কেন্দ্রীয় অ্যাডমিন সাপোর্ট টিমের সাথে চ্যাট করুন"
                  >
                    <MessageSquare size={15} />
                    <span>চ্যাট করুন (অ্যাডমিন ডেস্ক)</span>
                  </button>

                  {/* Booking / Appointment Main CTA */}
                  <button
                    onClick={handleBookAction}
                    className="flex items-center gap-1.5 bg-[#ff6d00] hover:bg-[#e66200] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
                  >
                    {profileRole === 'DOCTOR' ? (
                      <>
                        <Stethoscope size={15} />
                        <span>সিরিয়াল বুকিং</span>
                      </>
                    ) : profileRole === 'HOTEL_MANAGER' ? (
                      <>
                        <Building2 size={15} />
                        <span>রুম বুকিং</span>
                      </>
                    ) : (
                      <>
                        <Wrench size={15} />
                        <span>সার্ভিস বুক করুন</span>
                      </>
                    )}
                  </button>

                </div>

              </div>

              {/* Profile Identity & Credentials */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profileName}</h2>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    {profileBadge}
                  </span>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">{profileBio}</p>

                {/* Key Metrics Strip */}
                <div className="flex items-center gap-4 sm:gap-6 pt-3 border-t border-slate-100 flex-wrap text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="font-black text-slate-900">{profileRating}</span>
                    <span className="text-slate-500">({profileReviewCount} রিভিউ)</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/80">
                    <UserPlus size={14} className="text-purple-600" />
                    <span className="font-black text-slate-900">{followerCount}</span>
                    <span className="text-slate-500">ফলোয়ার</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <MapPin size={14} className="text-rose-500" />
                    <span className="text-slate-700 font-semibold">{profileDistrict}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>১০০% ভেরিফাইড প্রোফাইল</span>
                  </div>
                </div>

              </div>

              {/* Complete Tab Navigation */}
              <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 mt-6 overflow-x-auto pb-0.5">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'posts'
                      ? 'border-[#4e20b8] text-[#4e20b8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>পোস্ট ও আপডেট ({authorPosts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'services'
                      ? 'border-[#4e20b8] text-[#4e20b8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>সার্ভিস ও অফার</span>
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-[#4e20b8] text-[#4e20b8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Star size={14} className="text-amber-500" />
                  <span>রিভিউ ও রেটিং ({reviewsList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'about'
                      ? 'border-[#4e20b8] text-[#4e20b8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Award size={14} />
                  <span>বিস্তারিত পরিচিতি</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="mt-5 space-y-4">
                
                {/* TAB 1: POSTS & FEED UPDATES */}
                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    {authorPosts.map((post) => {
                      const isLiked = post.likedBy.includes(currentUserId);
                      const isCommentsOpen = expandedCommentsPostId === post.id;

                      return (
                        <div
                          key={post.id}
                          className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all"
                        >
                          {/* Post Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={profileAvatar}
                                alt={profileName}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{profileName}</h4>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Post Share Button */}
                            <button
                              onClick={() => handleSharePost(post)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#4e20b8] flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                              title="পোস্ট শেয়ার করুন"
                            >
                              <Share2 size={13} />
                              <span className="hidden sm:inline">শেয়ার</span>
                            </button>
                          </div>

                          {/* Post Title */}
                          {post.title && (
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {post.title}
                            </h3>
                          )}

                          {/* Post Content */}
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>

                          {/* Post Images */}
                          {post.images && post.images.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl overflow-hidden max-h-64">
                              {post.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt="Visual"
                                  className="w-full h-48 object-cover rounded-xl"
                                />
                              ))}
                            </div>
                          )}

                          {/* Action CTA inside post */}
                          {post.actionCta && (
                            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                              <span className="text-xs font-bold text-slate-800">
                                {post.actionCta.priceOrDiscount ? `মূল্য: ${post.actionCta.priceOrDiscount}` : post.actionCta.badge || 'স্পেশাল অফার'}
                              </span>
                              <button
                                onClick={handleBookAction}
                                className="px-3 py-1.5 bg-[#ff6d00] hover:bg-[#e66200] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                              >
                                {post.actionCta.label}
                              </button>
                            </div>
                          )}

                          {/* Post Footer Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleToggleLike(post.id)}
                                className={`flex items-center gap-1 font-semibold cursor-pointer transition-colors ${
                                  isLiked ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-rose-600'
                                }`}
                              >
                                <Heart size={15} className={isLiked ? 'fill-rose-600' : ''} />
                                <span>{post.likesCount} লাইক</span>
                              </button>

                              <button
                                onClick={() =>
                                  setExpandedCommentsPostId(isCommentsOpen ? null : post.id)
                                }
                                className="flex items-center gap-1 text-slate-600 hover:text-[#4e20b8] font-semibold cursor-pointer"
                              >
                                <MessageSquare size={15} />
                                <span>{post.comments.length} মন্তব্য</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleSharePost(post)}
                              className="text-[#4e20b8] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Share2 size={12} />
                              <span>সোশ্যাল মিডিয়ায় শেয়ার</span>
                            </button>
                          </div>

                          {/* Comments Box */}
                          {isCommentsOpen && (
                            <div className="pt-2 space-y-2 border-t border-slate-200">
                              {post.comments.map((comm) => (
                                <div key={comm.id} className="p-2 bg-white rounded-xl text-xs space-y-0.5 border border-slate-100">
                                  <span className="font-bold text-slate-900">{comm.userName}: </span>
                                  <span className="text-slate-700">{comm.text}</span>
                                </div>
                              ))}

                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="আপনার মন্তব্য লিখুন..."
                                  value={commentInputs[post.id] || ''}
                                  onChange={(e) =>
                                    setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddComment(post.id);
                                  }}
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#4e20b8]"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  className="bg-[#4e20b8] text-white p-2 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                  <Send size={13} />
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 2: SERVICES & LISTINGS */}
                {activeTab === 'services' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl border border-purple-100 space-y-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag size={15} className="text-[#4e20b8]" />
                        উপলব্ধ প্যাকেজ ও সার্ভিস
                      </h4>
                      <p className="text-xs text-slate-600">
                        সরাসরি ২০% অগ্রিম এসক্রো ডিপোজিটের মাধ্যমে নিরাপদে অর্ডার করুন। বাকি পেমেন্ট কাজ সমাপ্তির পর।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Service Card 1 */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                              জনপ্রিয়
                            </span>
                            <span className="text-xs font-black text-[#4e20b8]">৳ ৬০০ - ৳ ১,২০০</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                            {profileRole === 'DOCTOR'
                              ? 'চেম্বার কনসালটেশন ও প্রেসক্রিপশন'
                              : profileRole === 'HOTEL_MANAGER'
                              ? 'ডিলাক্স কাপল রুম (১ রাত)'
                              : 'ফুল ডায়াগনসিস ও স্পেশাল সার্ভিস'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            সম্পূর্ণ আধুনিক যন্ত্রপাতি ও অভিজ্ঞতার মাধ্যমে ১০০% নিশ্চিত সেবা প্রদান।
                          </p>
                        </div>

                        <button
                          onClick={handleBookAction}
                          className="w-full py-2 bg-[#ff6d00] hover:bg-[#e66200] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                        >
                          এখনই বুকিং করুন
                        </button>
                      </div>

                      {/* Service Card 2 */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-purple-100 text-[#4e20b8] rounded-full">
                              প্রিমিয়াম প্যাকেজ
                            </span>
                            <span className="text-xs font-black text-[#4e20b8]">৳ ২,৫০০</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                            {profileRole === 'DOCTOR'
                              ? 'ফ্যামিলি হেলথ চেকআপ ও ফলো-আপ'
                              : profileRole === 'HOTEL_MANAGER'
                              ? 'সি-ভিউ সুইট প্যাকেজ উইথ ব্রেকফাস্ট'
                              : 'মাস্টার সার্ভিসিং উইথ ৩০ দিন ওয়ারেন্টি'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            ৩০ দিনের ফ্রি ফলো-আপ এবং মানি-ব্যাক গ্যারান্টি অন্তর্ভুক্ত।
                          </p>
                        </div>

                        <button
                          onClick={handleBookAction}
                          className="w-full py-2 bg-[#4e20b8] hover:bg-[#3d1796] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                        >
                          প্যাকেজ অর্ডার করুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: REVIEWS & RATINGS */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    
                    {/* Overall Rating Overview */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <div className="text-3xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                          <Star size={26} className="text-amber-500 fill-amber-500" />
                          <span>{profileRating}</span>
                        </div>
                        <span className="text-xs text-slate-500">মোট {reviewsList.length}টি ভেরিফাইড রিভিউ থেকে প্রাপ্ত</span>
                      </div>

                      <div className="space-y-1 w-full sm:w-1/2">
                        <div className="flex items-center gap-2 text-xs">
                          <span>৫ তারকা</span>
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-full w-[92%]" />
                          </div>
                          <span className="font-bold">৯২%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span>৪ তারকা</span>
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-full w-[8%]" />
                          </div>
                          <span className="font-bold">৮%</span>
                        </div>
                      </div>
                    </div>

                    {/* Add Review Form */}
                    <form onSubmit={handleReviewSubmit} className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
                      <h4 className="text-xs font-black text-slate-900">
                        আপনার অভিজ্ঞতা শেয়ার করুন (রিভিউ দিন)
                      </h4>
                      
                      {/* Star Picker */}
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="cursor-pointer"
                          >
                            <Star
                              size={18}
                              className={star <= userRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">
                          ({userRating} তারকা রেটিং)
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        required
                        value={userReviewComment}
                        onChange={(e) => setUserReviewComment(e.target.value)}
                        placeholder="আপনার মূল্যবান অভিজ্ঞতা লিখুন..."
                        className="w-full bg-white border border-purple-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-[#4e20b8] resize-none"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#4e20b8] hover:bg-[#3d1796] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs"
                        >
                          রিভিউ পোস্ট করুন
                        </button>
                      </div>
                    </form>

                    {/* Reviews List */}
                    <div className="space-y-3">
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={rev.avatar} alt={rev.userName} className="w-7 h-7 rounded-full object-cover" />
                              <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={11} className="text-amber-500 fill-amber-500" />
                            ))}
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* TAB 4: ABOUT & VERIFICATION CREDENTIALS */}
                {activeTab === 'about' && (
                  <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-rose-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">কাজের এলাকা / কাভারেজ: </span>
                        <span>{profileDistrict}, বাংলাদেশ</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-[#4e20b8] shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">কার্যকাল ও শিডিউল: </span>
                        <span>সকাল ৯:০০ টা - রাত ৮:০০ টা (প্রতিদিন সেন্ট্রাল মনিটরিং)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">সেন্ট্রাল অ্যাডমিন মনিটরিং: </span>
                        <span>গ্রাহক সুরক্ষা ও আর্থিক নিশ্চয়তার স্বার্থে সমস্ত ডিল ও বুকিং QAAGA কেন্দ্রীয় অ্যাডমিন ডেস্ক পরিচালনা করে।</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-[#ff6d00] shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">সেন্ট্রাল হেল্পলাইন: </span>
                        <a href="tel:09658824360" className="text-[#4e20b8] font-bold hover:underline">
                          09658-824360 (QAAGA ২৪/৭ সাপোর্ট)
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-purple-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">অফিসিয়াল সাপোর্ট ইমেইল: </span>
                        <a href="mailto:support@qaaga.com" className="text-[#4e20b8] font-semibold hover:underline">
                          support@qaaga.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200">
                      <Award size={16} className="text-amber-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">নিরাপত্তা ও শতভাগ নিশ্চয়তা: </span>
                        <span>QAAGA প্ল্যাটফর্ম এসক্রো ব্যাকড ১০০% মান নিয়ন্ত্রণ ও দ্রুত সমাধান।</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* In-Profile Admin Support Chat Modal (Chat with Admin regarding this profile) */}
      {isAdminChatOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Admin Chat Top Header */}
            <div className="bg-gradient-to-r from-[#4e20b8] to-[#3b1599] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <ShieldCheck size={22} className="text-emerald-400" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#4e20b8] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm leading-tight">QAAGA অ্যাডমিন সাপোর্ট ডেস্ক</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                      লাইভ
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200">
                    ইনকোয়ারি: <span className="font-semibold text-white">{profileName}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdminChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Profile Mini Card Banner */}
            <div className="bg-purple-50/80 border-b border-purple-100 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-purple-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{profileName}</p>
                  <p className="text-[10px] text-purple-700 truncate">{profileBadge}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAdminChatOpen(false);
                  handleBookAction();
                }}
                className="px-3 py-1.5 bg-[#ff6d00] hover:bg-[#e66200] text-white text-[11px] font-black rounded-lg transition-all shrink-0 cursor-pointer shadow-xs"
              >
                বুকিং ফর্ম
              </button>
            </div>

            {/* Safety Disclaimer Banner */}
            <div className="px-3 py-2 bg-amber-50 border-b border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
              <Lock size={13} className="text-amber-600 mt-0.5 shrink-0" />
              <span>
                <strong>সেন্ট্রাল এসক্রো ও গ্রাহক সুরক্ষা:</strong> কোনো প্রতারণা এড়াতে এই প্রোফাইল সংক্রান্ত সকল ডিল ও আলাপচারিতা সরাসরি সেন্ট্রাল অ্যাডমিন তদারকি করে।
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 min-h-[260px] max-h-[360px]">
              {adminChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? 'items-end'
                      : msg.sender === 'system'
                      ? 'items-center'
                      : 'items-start'
                  }`}
                >
                  {msg.sender === 'system' ? (
                    <div className="bg-purple-100/70 border border-purple-200/80 text-purple-900 text-[11px] p-2.5 rounded-2xl max-w-[92%] text-center my-1 leading-relaxed">
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#4e20b8] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-bold text-[10px] ${msg.sender === 'user' ? 'text-purple-200' : 'text-[#4e20b8]'}`}>
                          {msg.senderName}
                        </span>
                        {msg.badge && (
                          <span className="text-[9px] bg-purple-100 text-[#4e20b8] px-1.5 py-0.2 rounded font-semibold">
                            {msg.badge}
                          </span>
                        )}
                        <span className={`text-[9px] ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}

              {isChatTyping && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-purple-600 font-medium">অ্যাডমিন উত্তর লিখছেন...</span>
                </div>
              )}
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                'বর্তমান শিডিউল ফাঁকা আছে কি?',
                'সার্ভিস চার্জ ও ফি কত?',
                'কাজের এলাকা সম্পর্কে বলুন',
                'গ্যারান্টি পলিসি কি?'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAdminChatMessage(chip)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-[#4e20b8] text-[11px] rounded-full shrink-0 transition-all cursor-pointer font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAdminChatMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="অ্যাডমিনকে আপনার বার্তা লিখুন..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#4e20b8] transition-all"
              />

              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="w-10 h-10 rounded-xl bg-[#4e20b8] hover:bg-[#3b1599] disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Reusable Social Share Modal */}
      <SocialShareModal
        isOpen={!!shareModalData}
        onClose={() => setShareModalData(null)}
        shareData={shareModalData}
      />
    </>
  );
};
