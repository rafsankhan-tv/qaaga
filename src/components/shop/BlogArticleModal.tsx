import React, { useState } from 'react';
import {
  X,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Tag
} from 'lucide-react';
import { BlogPost } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';

interface BlogArticleModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCategory?: (categoryKey: string) => void;
}

export const BlogArticleModal: React.FC<BlogArticleModalProps> = ({
  post,
  isOpen,
  onClose,
  onNavigateToCategory
}) => {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const handleLike = () => {
    if (!liked) {
      marketplaceStore.likeBlogPost(post.id);
      setLiked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scaleUp">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
              {post.category}
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock size={13} />
              {post.readTimeMinutes} মিনিট পড়ার সময়
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">{copied ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Hero Banner */}
          <div className="relative aspect-21/9 sm:aspect-2/1 rounded-2xl overflow-hidden shadow-md">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h1 className="text-lg sm:text-2xl font-black leading-tight drop-shadow-md">
                {post.title}
              </h1>
            </div>
          </div>

          {/* Author info & metadata */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#4e20b8]"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{post.authorName}</h4>
                <p className="text-[11px] text-slate-500">{post.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {new Date(post.publishedAt).toLocaleDateString('bn-BD')}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={13} />
                {post.viewsCount.toLocaleString()} ভিউ
              </span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  liked
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Heart size={14} className={liked ? 'fill-rose-600 text-rose-600' : ''} />
                <span>{post.likesCount + (liked ? 1 : 0)} লাইক</span>
              </button>
            </div>
          </div>

          {/* Article Excerpt */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border-l-4 border-[#4e20b8] text-xs sm:text-sm font-medium text-slate-700 italic leading-relaxed">
            "{post.excerpt}"
          </div>

          {/* Article Content */}
          <div className="text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4 font-sans">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-base font-black text-slate-900 pt-3 pb-1 border-b border-slate-100">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              return (
                <p key={index} className="whitespace-pre-line text-slate-700">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Tag size={13} /> ট্যাগ:
            </span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related CTA */}
          <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl text-white flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold">এই বিষয়ে কি কোনো সার্ভিস বা পণ্য প্রয়োজন?</h4>
              <p className="text-[11px] text-purple-100">qaaga.com মার্কেটপ্লেসে রয়েছে সার্টিফাইড বিশেষজ্ঞ ও টেকনিক্যাল ইকুইপমেন্ট।</p>
            </div>
            <button
              onClick={() => {
                onClose();
                if (onNavigateToCategory && post.relatedCategoryKey) {
                  onNavigateToCategory(post.relatedCategoryKey);
                }
              }}
              className="py-2 px-3.5 rounded-xl bg-white text-[#4e20b8] font-black text-xs shrink-0 hover:bg-purple-50 transition-colors shadow-md cursor-pointer flex items-center gap-1"
            >
              <span>ব্রাউজ করুন</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
