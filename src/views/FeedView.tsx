import React, { useState, useEffect } from 'react';
import {
  Users,
  Compass,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  PlusCircle,
  Stethoscope,
  Wrench,
  Building2,
  ShoppingBag,
  Briefcase,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  UserPlus,
  UserCheck,
  Tag,
  Send,
  Filter,
  Flame,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { FeedPost, UserFollow } from '../types';
import { marketplaceStore } from '../services/marketplaceStore';
import { useAuth } from '../context/AuthContext';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { FeedProfileModal } from '../components/feed/FeedProfileModal';
import { FeedBannerSlider } from '../components/feed/FeedBannerSlider';
import { SUGGESTED_PROFILES_TO_FOLLOW } from '../data/mockFeedData';
import { SocialShareModal, ShareTargetData } from '../components/common/SocialShareModal';

interface FeedViewProps {
  onNavigate: (view: string, params?: any) => void;
  initialTab?: 'following' | 'all';
}

export const FeedView: React.FC<FeedViewProps> = ({
  onNavigate,
  initialTab = 'following'
}) => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-admin';

  const [activeTab, setActiveTab] = useState<'following' | 'all'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCreatorFilter, setSelectedCreatorFilter] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followedList, setFollowedList] = useState<UserFollow[]>([]);
  
  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [profileModalTargetId, setProfileModalTargetId] = useState<string | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);
  const [shareModalData, setShareModalData] = useState<ShareTargetData | null>(null);

  // Load feed posts and follows
  const loadFeedData = () => {
    const followed = marketplaceStore.getFollowedProfiles(currentUserId);
    setFollowedList(followed);

    let feedPosts = marketplaceStore.getFeedPosts(activeTab, selectedCategory, currentUserId);
    
    // If filtered by specific creator
    if (selectedCreatorFilter) {
      feedPosts = feedPosts.filter(p => p.authorId === selectedCreatorFilter);
    }

    setPosts(feedPosts);
  };

  useEffect(() => {
    loadFeedData();
    const unsubscribe = marketplaceStore.subscribe(() => {
      loadFeedData();
    });
    return () => unsubscribe();
  }, [activeTab, selectedCategory, selectedCreatorFilter, currentUserId]);

  // Toggle Like on post
  const handleToggleLike = (postId: string) => {
    marketplaceStore.toggleLikeFeedPost(postId, currentUserId);
  };

  // Toggle Follow on profile
  const handleToggleFollow = (target: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    badge?: string;
    category?: string;
    rating?: number;
  }) => {
    marketplaceStore.toggleFollow(currentUserId, target);
  };

  // Add comment to post
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    marketplaceStore.addCommentToFeedPost(postId, {
      userId: currentUserId,
      userName: currentUser?.fullName || 'Rafsan Khan',
      userAvatar:
        currentUser?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      userRole: currentUser?.activeRole || 'SUPER_ADMIN',
      text: text.trim()
    });

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Share link handler
  const handleShare = (post: FeedPost) => {
    setShareModalData({
      type: 'post',
      id: post.id,
      title: post.title || `${post.authorName}-এর পোস্ট`,
      subtitle: post.content.slice(0, 100) + '...',
      image: (post.images && post.images[0]) || post.authorAvatar,
      badge: 'ফিড আপডেট'
    });
  };

  // Bookmark toggle
  const handleToggleBookmark = (postId: string) => {
    setBookmarkedPostIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  // Category Pills Data
  const CATEGORIES = [
    { key: 'all', label: 'সব আপডেট (All)', icon: Flame },
    { key: 'doctor', label: 'ডাক্তার ও স্বাস্থ্য', icon: Stethoscope },
    { key: 'repair', label: 'হোম ও রিপেয়ার', icon: Wrench },
    { key: 'hotel', label: 'হোটেল ও ট্রাভেল', icon: Building2 },
    { key: 'products', label: 'গ্যাজেট ও শপিং', icon: ShoppingBag },
    { key: 'jobs', label: 'জবস ও ক্যারিয়ার', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 py-4 sm:py-8 w-full max-w-full overflow-x-clip">
      
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <span>{shareToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Eye-Friendly Auto-Playing Feed Banner Slider */}
        <FeedBannerSlider
          onNavigate={onNavigate}
          onOpenCreatePost={() => setIsCreateModalOpen(true)}
          onFilterCategory={(catKey) => setSelectedCategory(catKey)}
        />

        {/* Stories / Followed Profiles Horizontal Row */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users size={15} className="text-[#4e20b8]" /> আপনার ফলোয়িং প্রোফাইল ({followedList.length} জন)
            </span>
            {selectedCreatorFilter && (
              <button
                onClick={() => setSelectedCreatorFilter(null)}
                className="text-[11px] text-[#4e20b8] font-bold hover:underline cursor-pointer"
              >
                সব পোস্ট দেখান (ফিল্টার ক্লিয়ার)
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none pr-6">
            
            {/* "All" button */}
            <button
              onClick={() => setSelectedCreatorFilter(null)}
              className={`flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer transition-all ${
                !selectedCreatorFilter ? 'scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                !selectedCreatorFilter
                  ? 'bg-gradient-to-tr from-[#4e20b8] to-[#ff6d00] text-white ring-4 ring-purple-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <Flame size={18} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800">সবাই</span>
            </button>

            {/* Followed Creators list */}
            {followedList.map((f) => {
              const isSelected = selectedCreatorFilter === f.targetId;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedCreatorFilter(isSelected ? null : f.targetId)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer transition-all ${
                    isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-sm transition-all ${
                    isSelected
                      ? 'ring-4 ring-[#ff6d00]'
                      : 'ring-2 ring-purple-300/80 hover:ring-[#4e20b8]'
                  }`}>
                    <img
                      src={f.targetAvatar}
                      alt={f.targetName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 max-w-[65px] sm:max-w-[70px] truncate text-center">
                    {f.targetName.split(' ')[0]}
                  </span>
                </button>
              );
            })}

            {/* Explore More Profiles */}
            <button
              onClick={() => setActiveTab('all')}
              className="flex flex-col items-center gap-1.5 shrink-0 opacity-70 hover:opacity-100 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-500 hover:text-[#4e20b8]">
                <UserPlus size={16} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">আরও</span>
            </button>

          </div>
        </div>

        {/* Main Feed Grid: Left (Feed Posts) & Right (Suggested Follows) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Feed Content Column (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Primary Tab Navigation & Category Pills */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 space-y-3">
              
              {/* Tab Switcher: Following vs Explore All */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
                <button
                  onClick={() => {
                    setActiveTab('following');
                    setSelectedCreatorFilter(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'following'
                      ? 'bg-white text-[#4e20b8] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={14} className="shrink-0" />
                  <span className="truncate">ফলোয়িং ({followedList.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedCreatorFilter(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white text-[#4e20b8] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Compass size={14} className="shrink-0" />
                  <span className="truncate">সব আপডেট (Explore)</span>
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pr-6">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#4e20b8] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Quick Post Creator Prompt Bar */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3 cursor-pointer hover:border-[#4e20b8] transition-all group"
            >
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80'}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
              />
              <div className="flex-1 bg-slate-100 hover:bg-slate-200/70 text-slate-500 rounded-full px-4 py-2.5 text-xs transition-all">
                আপনার কোনো নতুন নোটিস, স্বাস্থ্য টিপস বা সার্ভিস অফার আছে? এখানে শেয়ার করুন...
              </div>
              <button
                type="button"
                className="bg-[#4e20b8] group-hover:bg-[#41189e] text-white w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition-all shrink-0"
              >
                <PlusCircle size={18} />
              </button>
            </div>

            {/* Feed Posts Stream */}
            {posts.length > 0 ? (
              posts.map((post) => {
                const isLiked = post.likedBy.includes(currentUserId);
                const isBookmarked = bookmarkedPostIds.includes(post.id);
                const isAuthorFollowed = marketplaceStore.isFollowing(currentUserId, post.authorId);
                const isOwnPost = post.authorId === currentUserId;
                const isCommentsOpen = expandedCommentsPostId === post.id;

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all space-y-4"
                  >
                    
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between gap-3">
                      
                      <div className="flex items-center gap-3">
                        {/* Author Avatar with click to open profile */}
                        <button
                          onClick={() => setProfileModalTargetId(post.authorId)}
                          className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-purple-200/80 hover:ring-[#4e20b8] transition-all cursor-pointer shrink-0"
                        >
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
                            }}
                          />
                        </button>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setProfileModalTargetId(post.authorId)}
                              className="text-sm font-bold text-slate-900 hover:text-[#4e20b8] transition-colors cursor-pointer text-left"
                            >
                              {post.authorName}
                            </button>
                            {post.authorBadge && (
                              <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                <CheckCircle2 size={10} className="text-emerald-600" />
                                {post.authorBadge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {post.authorDistrict && (
                              <span className="flex items-center gap-0.5">
                                <MapPin size={11} className="text-rose-400" />
                                {post.authorDistrict}
                              </span>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={11} className="text-slate-400" />
                              {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Follow / Following Button (if not own post) */}
                      {!isOwnPost && (
                        <button
                          onClick={() =>
                            handleToggleFollow({
                              id: post.authorId,
                              name: post.authorName,
                              avatar: post.authorAvatar,
                              role: String(post.authorRole),
                              badge: post.authorBadge,
                              rating: post.authorRating
                            })
                          }
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            isAuthorFollowed
                              ? 'bg-purple-50 text-[#4e20b8] border border-purple-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                              : 'bg-[#4e20b8] text-white hover:bg-[#41189e] shadow-xs'
                          }`}
                        >
                          {isAuthorFollowed ? (
                            <>
                              <UserCheck size={13} className="text-emerald-600" />
                              <span>ফলোয়িং</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={13} />
                              <span>+ ফলো</span>
                            </>
                          )}
                        </button>
                      )}

                    </div>

                    {/* Post Title */}
                    {post.title && (
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {post.title}
                      </h3>
                    )}

                    {/* Post Content Body */}
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </div>

                    {/* Image Gallery */}
                    {post.images && post.images.length > 0 && (
                      <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                        post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                      }`}>
                        {post.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-video sm:aspect-4/3 bg-slate-900 rounded-xl overflow-hidden">
                            <img
                              src={img}
                              alt={`Visual ${idx}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#4e20b8] bg-purple-50 px-2 py-0.5 rounded-md hover:bg-purple-100 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Attached Action CTA Card (Direct Booking / Service Link) */}
                    {post.actionCta && (
                      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-purple-50/90 rounded-2xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full">
                              স্পেশাল অফার
                            </span>
                            {post.actionCta.priceOrDiscount && (
                              <span className="text-xs font-black text-rose-600">
                                {post.actionCta.priceOrDiscount}
                              </span>
                            )}
                          </div>
                          {post.actionCta.badge && (
                            <p className="text-xs text-slate-700 font-medium mt-1">
                              {post.actionCta.badge}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => onNavigate(post.actionCta!.targetView, post.actionCta!.targetParams)}
                          className="flex items-center justify-center gap-2 bg-[#ff6d00] hover:bg-[#e66200] active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
                        >
                          <span>{post.actionCta.label}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}

                    {/* Social Action Footer: Like, Comment, Share, Bookmark */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      
                      {/* Left: Like, Comment, Share */}
                      <div className="flex items-center gap-4 sm:gap-6">
                        
                        {/* Like Button */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            isLiked
                              ? 'text-rose-600 font-bold scale-105'
                              : 'text-slate-600 hover:text-rose-600'
                          }`}
                        >
                          <Heart
                            size={18}
                            className={isLiked ? 'fill-rose-500 text-rose-500' : ''}
                          />
                          <span>{post.likesCount} লাইক</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() =>
                            setExpandedCommentsPostId(isCommentsOpen ? null : post.id)
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4e20b8] transition-all cursor-pointer"
                        >
                          <MessageSquare size={17} />
                          <span>{post.comments.length} মন্তব্য</span>
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-all cursor-pointer"
                        >
                          <Share2 size={17} />
                          <span className="hidden sm:inline">শেয়ার</span>
                        </button>

                      </div>

                      {/* Right: Bookmark */}
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-500'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="পোস্ট সেভ করুন"
                      >
                        <Bookmark
                          size={17}
                          className={isBookmarked ? 'fill-amber-500' : ''}
                        />
                      </button>

                    </div>

                    {/* Comments Section Drawer */}
                    {isCommentsOpen && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
                        
                        {/* Comments List */}
                        {post.comments.length > 0 ? (
                          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-2xl"
                              >
                                <img
                                  src={comment.userAvatar}
                                  alt={comment.userName}
                                  className="w-7 h-7 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{comment.userName}</span>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(comment.createdAt).toLocaleTimeString('bn-BD', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 mt-0.5 leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-2 text-slate-400 text-xs">
                            এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি লিখুন!
                          </div>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="আপনার মন্তব্য বা প্রশ্ন লিখুন..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#4e20b8] outline-none"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                            className="bg-[#4e20b8] hover:bg-[#41189e] disabled:opacity-50 text-white p-2 rounded-xl transition-all cursor-pointer"
                          >
                            <Send size={15} />
                          </button>
                        </div>

                      </div>
                    )}

                  </article>
                );
              })
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-16 h-16 bg-purple-50 text-[#4e20b8] rounded-2xl flex items-center justify-center mx-auto">
                  <Users size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {activeTab === 'following'
                    ? 'আপনি এখনো কাউকে ফলো করেননি অথবা তাদের নতুন কোনো পোস্ট নেই'
                    : 'এই ক্যাটাগরিতে কোনো পোস্ট পাওয়া যায়নি'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  পছন্দের ডাক্তার, টেকনিশিয়ান বা হোটেল ম্যানেজারকে ফলো করে সরাসরি তাদের সব পোস্ট, নোটিস ও ডিসকাউন্ট আপডেট দেখতে পাবেন।
                </p>
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedCategory('all');
                  }}
                  className="inline-flex items-center gap-2 bg-[#4e20b8] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#41189e] cursor-pointer"
                >
                  <Compass size={14} />
                  <span>সব পোস্ট এক্সপ্লোর করুন</span>
                </button>
              </div>
            )}

          </div>

          {/* Right Sidebar Column (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Suggested Profiles to Follow */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-[#ff6d00]" />
                  জনপ্রিয় ভেরিফাইড প্রোফাইল
                </h3>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                  সুপার রেটেড
                </span>
              </div>

              <div className="space-y-3.5">
                {SUGGESTED_PROFILES_TO_FOLLOW.map((profile) => {
                  const isFollowed = marketplaceStore.isFollowing(currentUserId, profile.id);
                  return (
                    <div
                      key={profile.id}
                      className="flex items-start justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      <button
                        onClick={() => setProfileModalTargetId(profile.id)}
                        className="flex items-start gap-2.5 text-left cursor-pointer group flex-1"
                      >
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-2 ring-purple-100 group-hover:ring-[#4e20b8] transition-all shrink-0">
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#4e20b8] truncate">
                            {profile.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {profile.category}
                          </p>
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                            ★ {profile.rating} • {profile.followersCount} ফলোয়ার
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          handleToggleFollow({
                            id: profile.id,
                            name: profile.name,
                            avatar: profile.avatar,
                            role: profile.role,
                            badge: profile.badge,
                            category: profile.category,
                            rating: profile.rating
                          })
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                          isFollowed
                            ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                            : 'bg-[#4e20b8] hover:bg-[#41189e] text-white shadow-xs'
                        }`}
                      >
                        {isFollowed ? 'ফলোয়িং' : '+ ফলো'}
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Following Benefits Card */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <h4 className="text-xs font-bold">ফলোয়ার ফিডের বিশেষ সুবিধা</h4>
              </div>
              <ul className="text-xs text-purple-100 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>ডাক্তারদের নতুন চেম্বার টাইম ও পরামর্শ ইনস্ট্যান্ট পাবেন</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>সার্ভিস টেকনিশিয়ানদের ফ্ল্যাশ ডিসকাউন্ট ও ফ্রি জেট ওয়াশ অফার</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>হোটেলের মনসুন অফার ও রুম বুকিংয়ে ক্যাশব্যাক নোটিফিকেশন</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={loadFeedData}
      />

      {/* Author Profile Modal */}
      {profileModalTargetId && (
        <FeedProfileModal
          isOpen={!!profileModalTargetId}
          onClose={() => setProfileModalTargetId(null)}
          targetId={profileModalTargetId}
          onNavigate={onNavigate}
        />
      )}

      {/* Social Media & Link Share Modal */}
      <SocialShareModal
        isOpen={!!shareModalData}
        onClose={() => setShareModalData(null)}
        shareData={shareModalData}
      />

    </div>
  );
};
