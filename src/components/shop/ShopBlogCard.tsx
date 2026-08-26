import React from 'react';
import { Clock, Eye, Heart, ArrowRight, User } from 'lucide-react';
import { BlogPost } from '../../types';

interface ShopBlogCardProps {
  post: BlogPost;
  onReadPost: (post: BlogPost) => void;
}

export const ShopBlogCard: React.FC<ShopBlogCardProps> = ({ post, onReadPost }) => {
  return (
    <div
      id={`blog-card-${post.id}`}
      onClick={() => onReadPost(post)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
          {post.category}
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock size={11} />
          <span>{post.readTimeMinutes} মিনিট</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 group-hover:text-[#4e20b8] transition-colors leading-snug">
            {post.title}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <img
              src={post.authorAvatar}
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
            <span className="line-clamp-1">{post.authorName}</span>
          </div>

          <div className="flex items-center gap-1 text-[#4e20b8] font-bold group-hover:translate-x-1 transition-transform">
            <span>পড়ুন</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
};
