"use client";

import { useState, useRef, useCallback } from "react";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import { Users, Star, Camera, X, Upload, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  user: string;
  text: string;
  rating: number;
  createdAt: string;
}

interface Post {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string;
  avgRating: number;
  ratingCount: number;
  totalRating: number;
  comments: Comment[];
  createdAt: string;
  user: { name: string };
  showComments: boolean;
}

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    imageUrl: "",
    category: "outfit",
    title: "Date Night Look",
    description: "Navy blazer with cream shirt. First time trying this combo.",
    avgRating: 8.2,
    ratingCount: 24,
    totalRating: 8.2 * 24,
    comments: [
      { id: "c1", user: "StylePro", text: "Great colour combo! The blazer fits perfectly.", rating: 9, createdAt: "2h ago" },
      { id: "c2", user: "FashionFan", text: "Try rolling the sleeves for a more relaxed vibe.", rating: 7, createdAt: "1h ago" },
    ],
    createdAt: "2h ago",
    user: { name: "Alex M." },
    showComments: false,
  },
  {
    id: "2",
    imageUrl: "",
    category: "face",
    title: "New Beard Style",
    description: "Trying the Van Dyke for the first time. What do you think?",
    avgRating: 7.5,
    ratingCount: 18,
    totalRating: 7.5 * 18,
    comments: [
      { id: "c3", user: "GroomGuru", text: "Suits your face shape well! Keep it.", rating: 8, createdAt: "5h ago" },
    ],
    createdAt: "5h ago",
    user: { name: "Jordan K." },
    showComments: false,
  },
  {
    id: "3",
    imageUrl: "",
    category: "party",
    title: "Club Night Ready",
    description: "All black with gold accessories. Going for sleek vibes.",
    avgRating: 8.8,
    ratingCount: 31,
    totalRating: 8.8 * 31,
    comments: [
      { id: "c4", user: "NightOwl", text: "Fire look! The gold chain really pops.", rating: 9, createdAt: "1d ago" },
      { id: "c5", user: "TrendSet", text: "Maybe add a watch for the complete look.", rating: 8, createdAt: "20h ago" },
    ],
    createdAt: "1d ago",
    user: { name: "Sam R." },
    showComments: false,
  },
  {
    id: "4",
    imageUrl: "",
    category: "grooming",
    title: "Clean Shaven vs Stubble",
    description: "Can't decide. Which one looks better for an interview?",
    avgRating: 7.0,
    ratingCount: 42,
    totalRating: 7.0 * 42,
    comments: [
      { id: "c6", user: "CorpStyle", text: "Go clean shaven for interviews. Stubble for casual.", rating: 7, createdAt: "2d ago" },
    ],
    createdAt: "2d ago",
    user: { name: "Chris P." },
    showComments: false,
  },
];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newRating, setNewRating] = useState<Record<string, number>>({});

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const handleRate = (postId: string, rating: number) => {
    setNewRating((prev) => ({ ...prev, [postId]: rating }));
  };

  const submitRating = (postId: string) => {
    const rating = newRating[postId] || 5;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newTotal = p.totalRating + rating;
        const newCount = p.ratingCount + 1;
        return {
          ...p,
          totalRating: newTotal,
          ratingCount: newCount,
          avgRating: Math.round((newTotal / newCount) * 10) / 10,
        };
      })
    );
    setNewRating((prev) => ({ ...prev, [postId]: 5 }));
  };

  const toggleComments = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, showComments: !p.showComments } : p))
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="section-number">EST. MMXXIV // FEED</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <Users className="w-7 h-7 text-amber" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
              COMMUNITY <span className="text-gradient-gold">FEED.</span>
            </h1>
          </div>
          <p className="text-coffee font-body text-lg max-w-lg">Share your looks and get honest feedback.</p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber text-cream text-base font-body tracking-wider uppercase hover:bg-amber-light transition-colors rounded-sm shadow-gold"
        >
          <Camera className="w-4 h-4" />
          SHARE LOOK
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-5 py-2.5 text-base font-body font-semibold whitespace-nowrap transition-all rounded-sm ${
            activeCategory === "all"
              ? "bg-amber text-cream shadow-gold"
              : "bg-cream text-espresso border border-tan hover:bg-tan/10"
          }`}
        >
          All
        </button>
        {COMMUNITY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 text-base font-body font-semibold whitespace-nowrap transition-all rounded-sm ${
              activeCategory === cat.id
                ? "bg-amber text-cream shadow-gold"
                : "bg-cream text-espresso border border-tan hover:bg-tan/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="bg-cream border border-tan overflow-hidden rounded-sm card-hover vintage-border"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 p-5 pb-3">
              <div className="w-11 h-11 bg-amber/15 flex items-center justify-center rounded-full border border-amber/25">
                <span className="text-base font-display font-bold text-amber">
                  {post.user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-base font-body font-bold text-espresso">{post.user.name}</span>
                <span className="text-sm text-coffee ml-2 font-body">{post.createdAt}</span>
              </div>
              <span className="text-xs font-body bg-parchment text-coffee px-3 py-1.5 uppercase tracking-wider border border-tan rounded-sm">
                {post.category}
              </span>
            </div>

            {/* Post Image */}
            {post.imageUrl ? (
              <img src={post.imageUrl} alt={post.title} className="w-full h-72 object-cover" />
            ) : (
              <div className="w-full h-72 bg-parchment flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-amber/40 mx-auto mb-3" />
                  <p className="text-base text-coffee font-body">{post.title}</p>
                </div>
              </div>
            )}

            <div className="p-6 space-y-4">
              <p className="text-base text-espresso font-body">{post.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber fill-amber" />
                  <span className="font-display font-bold text-espresso text-lg">{post.avgRating}</span>
                  <span className="text-sm text-coffee font-body">({post.ratingCount} ratings)</span>
                </div>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-sm text-coffee hover:text-espresso transition-colors font-body"
                >
                  <MessageSquare className="w-4 h-4" />
                  {post.comments.length}
                </button>
              </div>

              {/* Rate Slider */}
              <div className="bg-parchment p-4 border border-tan rounded-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-coffee font-body font-semibold">RATE THIS LOOK</span>
                  <span className="text-lg font-display font-bold text-amber">
                    {newRating[post.id] || 5}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newRating[post.id] || 5}
                  onChange={(e) => handleRate(post.id, parseInt(e.target.value))}
                  className="w-full h-2.5 bg-[#E8E0D8] appearance-none cursor-pointer rounded-full accent-amber"
                />
                <div className="flex justify-between text-xs text-coffee mt-2 font-body">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
                <button
                  onClick={() => submitRating(post.id)}
                  className="w-full mt-3 py-2.5 bg-amber text-cream font-body text-sm tracking-wider uppercase hover:bg-amber-light transition-colors rounded-sm"
                >
                  SUBMIT RATING
                </button>
              </div>

              {/* Comments */}
              <AnimatePresence>
                {post.showComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-parchment p-4 border border-tan rounded-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-body font-bold text-espresso">{comment.user}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                            <span className="text-sm text-coffee font-body">{comment.rating}</span>
                          </div>
                          <span className="text-xs text-coffee/50 font-body ml-auto">{comment.createdAt}</span>
                        </div>
                        <p className="text-sm text-coffee font-body">{comment.text}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPost={(post) => {
          setPosts((prev) => [post, ...prev]);
          setShowCreatePost(false);
        }}
      />
    </div>
  );
}

function CreatePostModal({
  isOpen,
  onClose,
  onPost,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPost: (post: Post) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = () => {
    if (!title.trim() || !category) return;
    onPost({
      id: Date.now().toString(),
      imageUrl,
      category,
      title: title.trim(),
      description: description.trim(),
      avgRating: 0,
      ratingCount: 0,
      totalRating: 0,
      comments: [],
      createdAt: "just now",
      user: { name: "You" },
      showComments: false,
    });
    setTitle("");
    setDescription("");
    setCategory("");
    setImageUrl("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-espresso/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-cream p-8 w-full max-w-lg border border-tan rounded-sm shadow-elegant-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-display font-bold text-espresso tracking-wider">SHARE YOUR LOOK</h2>
              <button onClick={onClose} className="p-2 hover:bg-tan/10 transition-colors rounded-sm">
                <X className="w-5 h-5 text-coffee" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Image Upload */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-sm" />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1.5 bg-espresso/60 text-cream rounded-full hover:bg-espresso/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-tan p-10 text-center rounded-sm hover:border-amber/40 transition-colors cursor-pointer"
                >
                  <Upload className="w-10 h-10 text-amber mx-auto mb-3" />
                  <p className="text-base text-coffee font-body">Drop your photo here or click to browse</p>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="text-xs font-body text-coffee tracking-widest uppercase mb-2 block font-semibold">Category</label>
                <div className="flex gap-2">
                  {COMMUNITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex-1 py-2.5 text-sm font-body font-semibold transition-colors border rounded-sm ${
                        category === cat.id
                          ? "bg-amber text-cream border-amber"
                          : "bg-parchment text-espresso hover:bg-tan/20 border-tan"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Give your look a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3.5 bg-parchment border border-tan text-base text-espresso placeholder:text-coffee font-body focus:outline-none focus:border-amber rounded-sm"
              />

              <textarea
                placeholder="Describe your look..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-3.5 bg-parchment border border-tan text-base text-espresso placeholder:text-coffee font-body focus:outline-none focus:border-amber resize-none rounded-sm"
              />

              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !category}
                className="w-full py-4 bg-amber text-cream font-body text-base tracking-wider uppercase hover:bg-amber-light transition-colors rounded-sm shadow-gold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                SHARE LOOK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
