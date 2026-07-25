"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp, MessageCircle } from "lucide-react";

const posts = [
  {
    name: "ALEX_M",
    score: 8.4,
    tag: "NIGHT OUT",
    rating: 9.2,
    comments: 23,
    quote: "The jawline score was brutal but accurate.",
  },
  {
    name: "KIRA.S",
    score: 7.8,
    tag: "STREETWEAR",
    rating: 8.7,
    comments: 41,
    quote: "Finally a color palette that actually works.",
  },
  {
    name: "DANIEL_B",
    score: 9.1,
    tag: "FORMAL",
    rating: 9.5,
    comments: 18,
    quote: "The golden ratio breakdown blew my mind.",
  },
  {
    name: "MAYA.X",
    score: 8.0,
    tag: "CASUAL",
    rating: 8.9,
    comments: 56,
    quote: "Shared my grooming recs. Game changer.",
  },
];

export function CommunitySection() {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden bg-section-warm" id="community">
      {/* Diagonal lines — very subtle */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #B8860B 0, #B8860B 1px, transparent 0, transparent 40px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Header — left aligned */}
        <div className="mb-20 md:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="type-label text-amber/80">05 // Community</span>
            <h2 className="mt-3 type-display text-espresso">
              HONEST
              <br />
              <span className="text-gradient-gold italic">FEEDBACK.</span>
            </h2>
            <p className="mt-5 text-coffee max-w-md font-body text-base leading-relaxed">
              Real people. Real ratings. No filters, no fakery. The kind of
              feedback your friends won&apos;t give you.
            </p>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="marquee-container mb-16 md:mb-20 py-5 border-y border-tan/20">
          <div className="marquee-content">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-10 mr-10">
                {["FACE", "BODY", "STYLE", "GROOMING", "COLOR", "FIT", "VIBE", "LOOKS"].map(
                  (word) => (
                    <span
                      key={word}
                      className="text-3xl md:text-5xl font-display italic text-espresso/[0.04] tracking-tight whitespace-nowrap"
                    >
                      {word}
                      <span className="text-amber/15 mx-5">&bull;</span>
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cards — overlapping cascade */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-5">
          {posts.map((post, index) => (
            <motion.div
              key={post.name}
              className="bg-cream/70 backdrop-blur-sm border border-tan/25 p-7 group cursor-default"
              initial={{
                opacity: 0,
                y: 50,
                rotate: index % 2 === 0 ? -1.5 : 1.5,
              }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -8, transition: { duration: 0.4 } }}
            >
              {/* Tag + number */}
              <div className="flex items-center justify-between mb-5">
                <span className="type-mono text-[0.55rem] text-amber tracking-widest bg-amber/[0.08] px-2.5 py-1">
                  {post.tag}
                </span>
                <span className="type-mono text-[0.5rem] text-tan/40 tracking-widest">
                  #{String(index + 1).padStart(3, "0")}
                </span>
              </div>

              {/* Score */}
              <div className="mb-4">
                <div className="text-5xl font-display font-bold text-espresso leading-none">
                  {post.score}
                </div>
                <div className="type-mono text-[0.5rem] text-coffee/40 tracking-widest mt-2">
                  FACEIQ SCORE
                </div>
              </div>

              {/* Quote */}
              <p className="text-sm text-coffee/70 font-body italic mb-5 leading-relaxed">
                &ldquo;{post.quote}&rdquo;
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-4 border-t border-tan/15">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber" fill="#B8860B" />
                  <span className="type-mono text-[0.65rem] text-espresso">
                    {post.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-coffee/40" />
                  <span className="type-mono text-[0.65rem] text-coffee/40">
                    {post.comments}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-olive/60" />
                </div>
              </div>

              {/* User */}
              <div className="mt-4 flex items-center gap-2.5">
                <div className="w-7 h-7 bg-tan/15 border border-tan/20 flex items-center justify-center">
                  <span className="text-[0.5rem] font-mono text-espresso font-bold">
                    {post.name[0]}
                  </span>
                </div>
                <span className="type-mono text-[0.6rem] text-coffee/40">
                  {post.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
