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
  MessageSquare
} from 'lucide-react';
import { FeedPost } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';
import { SUGGESTED_PROFILES_TO_FOLLOW } from '../../data/mockFeedData';

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

  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorPosts, setAuthorPosts] = useState<FeedPost[]>([]);

  // Find profile details from suggested list or doctor/provider/user records
  const suggestedProfile = SUGGESTED_PROFILES_TO_FOLLOW.find(p => p.id === targetId);
  const allUsers = marketplaceStore.getUsers();
  const matchedUser = allUsers.find(u => u.id === targetId);
  const matchedDoctor = marketplaceStore.getDoctors().find(d => d.id === targetId || d.userId === targetId);
  const matchedProvider = marketplaceStore.getProviders().find(p => p.id === targetId || p.userId === targetId);
  const matchedHotel = marketplaceStore.getHotels().find(h => h.id === targetId);

  const profileName =
    suggestedProfile?.name ||
    matchedDoctor?.name ||
    matchedProvider?.fullName ||
    matchedHotel?.name ||
    matchedUser?.fullName ||
    'সার্ভিস পার্টনার';

  const profileAvatar =
    suggestedProfile?.avatar ||
    matchedDoctor?.doctorPhoto ||
    matchedProvider?.avatarUrl ||
    matchedHotel?.coverImage ||
    matchedUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';

  const profileCover =
    suggestedProfile?.cover ||
    matchedHotel?.coverImage ||
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80';

  const profileRole =
    suggestedProfile?.role ||
    (matchedDoctor ? 'DOCTOR' : matchedProvider ? 'PROVIDER' : matchedHotel ? 'HOTEL_MANAGER' : matchedUser?.activeRole || 'USER');

  const profileBadge =
    suggestedProfile?.badge ||
    (matchedDoctor ? 'বিএমডিসি ভেরিফাইড' : matchedProvider ? 'সার্টিফাইড প্রোভাইডার' : matchedHotel ? 'ভেরিফাইড হোটেল' : 'ভেরিফাইড মেম্বার');

  const profileBio =
    suggestedProfile?.bio ||
    matchedDoctor?.hospitalChamber ||
    matchedProvider?.description ||
    matchedHotel?.facilities?.slice(0, 3).join(', ') ||
    'Qaaga.com-এর ভেরিফাইড প্রফেশনাল পার্টনার।';

  const profileDistrict =
    suggestedProfile?.district ||
    matchedDoctor?.district ||
    matchedProvider?.district ||
    matchedHotel?.district ||
    matchedUser?.district ||
    'ঢাকা';

  const profileRating = suggestedProfile?.rating || matchedDoctor?.rating || matchedProvider?.rating || matchedHotel?.rating || 4.9;
  const profileReviewCount = suggestedProfile?.reviewCount || matchedDoctor?.reviewCount || matchedProvider?.reviewCount || matchedHotel?.reviewCount || 45;
  const followerCount = marketplaceStore.getFollowerCount(targetId) + (suggestedProfile?.followersCount || 150);

  useEffect(() => {
    if (targetId) {
      setIsFollowing(marketplaceStore.isFollowing(currentUserId, targetId));
      setAuthorPosts(marketplaceStore.getPostsByAuthor(targetId));
    }
  }, [targetId, currentUserId, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
        >
          <X size={18} />
        </button>

        {/* Cover Photo */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-800 overflow-hidden">
          <img
            src={profileCover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Profile Info Header */}
        <div className="relative px-6 pb-6 pt-0">
          
          {/* Avatar and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-white shrink-0">
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
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Follow / Unfollow Button */}
              <button
                onClick={handleToggleFollow}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isFollowing
                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                    : 'bg-[#4e20b8] hover:bg-[#41189e] text-white'
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
                    <span>+ ফলো করুন (Follow)</span>
                  </>
                )}
              </button>

              {/* Direct Booking / Appointment CTA */}
              <button
                onClick={handleBookAction}
                className="flex items-center gap-1.5 bg-[#ff6d00] hover:bg-[#e66200] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {profileRole === 'DOCTOR' ? (
                  <>
                    <Stethoscope size={15} />
                    <span>অ্যাপয়েন্টমেন্ট নিন</span>
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

          {/* Name & Badges */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profileName}</h2>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {profileBadge}
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">{profileBio}</p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 sm:gap-6 mt-3.5 pt-3 border-t border-slate-100 flex-wrap text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900">{profileRating}</span>
                <span className="text-slate-400">({profileReviewCount} রিভিউ)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserPlus size={14} className="text-purple-600" />
                <span className="font-bold text-slate-900">{followerCount}</span>
                <span className="text-slate-400">ফলোয়ার</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-rose-500" />
                <span className="text-slate-700">{profileDistrict}</span>
              </div>
            </div>

          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 mt-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'posts'
                  ? 'border-[#4e20b8] text-[#4e20b8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              পোস্ট ও আপডেট ({authorPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'border-[#4e20b8] text-[#4e20b8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              প্রোফাইল পরিচিতি
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4 max-h-80 overflow-y-auto pr-1">
            {activeTab === 'posts' ? (
              authorPosts.length > 0 ? (
                <div className="space-y-3">
                  {authorPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all"
                    >
                      {post.title && (
                        <h4 className="text-xs font-bold text-slate-900 mb-1">{post.title}</h4>
                      )}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {post.images && post.images.length > 0 && (
                        <div className="mt-2.5 h-32 rounded-xl overflow-hidden">
                          <img
                            src={post.images[0]}
                            alt="Post visual"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-rose-600 font-medium">
                            <Heart size={12} className="fill-rose-500" /> {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <MessageSquare size={12} /> {post.comments.length}
                          </span>
                        </div>
                        <span>{new Date(post.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  এই মুহূর্তে কোনো নতুন পোস্ট পাওয়া যায়নি।
                </div>
              )
            ) : (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">অ্যাড্রেস/চেম্বার: </span>
                    {profileDistrict}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">হেল্পলাইন/যোগাযোগ: </span>
                    +880 1800-QAAGA-1
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">সাপোর্ট ইমেইল: </span>
                    support@qaaga.com
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
