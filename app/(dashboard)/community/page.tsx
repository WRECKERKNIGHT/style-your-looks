"use client";

import { useState } from "react";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import { Users, Star, MessageCircle, Camera, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string;
  avgRating: number;
  ratingCount: number;
  comments: { user: string; text: string; rating: number }[];
  createdAt: string;
  user: { name: string; avatar: string };
}

const SAMPLE_POSTS: Post[] = [
  {
    id: "1",
    imageUrl: "",
    category: "outfit",
    title: "Date Night Look",
    description: "Navy blazer with cream shirt. First time trying this combo.",
    avgRating: 8.2,
    ratingCount: 24,
    comments: [
      { user: "StylePro", text: "Great color combo! The blazer fits perfectly.", rating: 9 },
      { user: "FashionFan", text: "Try rolling the sleeves for a more relaxed vibe.", rating: 7 },
    ],
    createdAt: "2h ago",
    user: { name: "Alex M.", avatar: "" },
  },
  {
    id: "2",
    imageUrl: "",
    category: "face",
    title: "New Beard Style",
    description: "Trying the Van Dyke for the first time. What do you think?",
    avgRating: 7.5,
    ratingCount: 18,
    comments: [
      { user: "GroomGuru", text: "Suits your face shape well! Keep it.", rating: 8 },
    ],
    createdAt: "5h ago",
    user: { name: "Jordan K.", avatar: "" },
  },
  {
    id: "3",
    imageUrl: "",
    category: "party",
    title: "Club Night Ready",
    description: "All black with gold accessories. Going for sleek vibes.",
    avgRating: 8.8,
    ratingCount: 31,
    comments: [
      { user: "NightOwl", text: "Fire look! The gold chain really pops.", rating: 9 },
      { user: "TrendSet", text: "Maybe add a watch for the complete look.", rating: 8 },
    ],
    createdAt: "1d ago",
    user: { name: "Sam R.", avatar: "" },
  },
  {
    id: "4",
    imageUrl: "",
    category: "grooming",
    title: "Clean Shaven vs Stubble",
    description: "Can't decide. Which one looks better for an interview?",
    avgRating: 7.0,
    ratingCount: 42,
    comments: [
      { user: "CorpStyle", text: "Go clean shaven for interviews. Stubble for casual.", rating: 7 },
    ],
    createdAt: "2d ago",
    user: { name: "Chris P.", avatar: "" },
  },
];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [newRating, setNewRating] = useState<Record<string, number>>({});

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const handleRate = (postId: string, rating: number) => {
    setNewRating((prev) => ({ ...prev, [postId]: rating }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-6 h-6 text-[#C89D7C]" />
            <h1 className="text-2xl font-bold text-[#3C2A21]">Community</h1>
          </div>
          <p className="text-[#8B7D6B]">Share your looks and get honest feedback.</p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3C2A21] text-white rounded-xl text-sm font-medium hover:bg-[#2B1E16] transition-colors"
        >
          <Camera className="w-4 h-4" />
          Share Look
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeCategory === "all"
              ? "bg-[#3C2A21] text-white"
              : "bg-white text-[#3C2A21] border border-[#E8E0D8]"
          }`}
        >
          All
        </button>
        {COMMUNITY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-[#3C2A21] text-white"
                : "bg-white text-[#3C2A21] border border-[#E8E0D8]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 pb-2">
              <div className="w-9 h-9 rounded-full bg-[#C89D7C]/20 flex items-center justify-center">
                <span className="text-sm font-bold text-[#C89D7C]">
                  {post.user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-[#3C2A21]">{post.user.name}</span>
                <span className="text-xs text-[#8B7D6B] ml-2">{post.createdAt}</span>
              </div>
              <span className="text-xs bg-[#F4EFEA] text-[#8B7D6B] px-2.5 py-1 rounded-full capitalize">
                {post.category}
              </span>
            </div>

            {/* Post Image Placeholder */}
            <div className="w-full h-64 bg-[#F4EFEA] flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-10 h-10 text-[#C89D7C]/40 mx-auto mb-2" />
                <p className="text-sm text-[#8B7D6B]">{post.title}</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm text-[#3C2A21]">{post.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#C89D7C] fill-[#C89D7C]" />
                  <span className="font-bold text-[#3C2A21]">{post.avgRating}</span>
                  <span className="text-xs text-[#8B7D6B]">({post.ratingCount})</span>
                </div>
              </div>

              {/* Rate Slider */}
              <div className="bg-[#FDFBF7] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8B7D6B]">Rate this look</span>
                  <span className="text-sm font-bold text-[#C89D7C]">
                    {newRating[post.id] || 5}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newRating[post.id] || 5}
                  onChange={(e) => handleRate(post.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-[#F4EFEA] rounded-full appearance-none cursor-pointer accent-[#C89D7C]"
                />
                <div className="flex justify-between text-[10px] text-[#8B7D6B] mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                {post.comments.map((comment, j) => (
                  <div key={j} className="bg-[#FDFBF7] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[#3C2A21]">{comment.user}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-[#C89D7C] fill-[#C89D7C]" />
                        <span className="text-xs text-[#8B7D6B]">{comment.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#8B7D6B]">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#3C2A21]">Share Your Look</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-1 hover:bg-[#F4EFEA] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#8B7D6B]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#E8E0D8] rounded-xl p-8 text-center">
                  <Upload className="w-8 h-8 text-[#C89D7C] mx-auto mb-2" />
                  <p className="text-sm text-[#8B7D6B]">Drop your photo here</p>
                </div>

                <div>
                  <label className="text-sm text-[#8B7D6B] mb-1 block">Category</label>
                  <div className="flex gap-2">
                    {COMMUNITY_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        className="flex-1 py-2 rounded-xl text-xs font-medium bg-[#F4EFEA] text-[#3C2A21] hover:bg-[#EDE5DC] transition-colors"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Give your look a title"
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E0D8] rounded-xl text-sm text-[#3C2A21] placeholder:text-[#8B7D6B] focus:outline-none focus:border-[#C89D7C]"
                />

                <textarea
                  placeholder="Describe your look..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E0D8] rounded-xl text-sm text-[#3C2A21] placeholder:text-[#8B7D6B] focus:outline-none focus:border-[#C89D7C] resize-none"
                />

                <button className="w-full py-3 bg-[#3C2A21] text-white rounded-xl font-medium hover:bg-[#2B1E16] transition-colors">
                  Share Look
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
