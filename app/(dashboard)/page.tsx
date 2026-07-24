"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ScanFace,
  Layers,
  Shirt,
  Palette,
  Scissors,
  Sparkles,
  Users,
  ArrowRight,
  Camera,
} from "lucide-react";

const quickActions = [
  {
    href: "/dashboard/face-analysis",
    label: "Analyze Face",
    description: "Get your FaceIQ score with detailed metrics",
    icon: ScanFace,
    color: "#C89D7C",
  },
  {
    href: "/dashboard/body-analysis",
    label: "Body & Tone",
    description: "Detect body type and skin undertone",
    icon: Layers,
    color: "#4CAF50",
  },
  {
    href: "/dashboard/virtual-tryon",
    label: "Virtual Try-On",
    description: "Preview outfits on your photo",
    icon: Shirt,
    color: "#4682B4",
  },
  {
    href: "/dashboard/grooming",
    label: "Grooming Studio",
    description: "Try beard & mustache styles virtually",
    icon: Scissors,
    color: "#9370DB",
  },
  {
    href: "/dashboard/mannequin",
    label: "Color Studio",
    description: "See outfit colors on mannequins",
    icon: Palette,
    color: "#D4A574",
  },
  {
    href: "/dashboard/community",
    label: "Rate & Share",
    description: "Get feedback from the community",
    icon: Users,
    color: "#E17055",
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[#3C2A21]">
          Welcome to AuraStyle
        </h1>
        <p className="text-[#8B7D6B] mt-1">
          Your AI-powered style assistant. Start by analyzing your features or exploring outfit recommendations.
        </p>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <Link
              href={action.href}
              className="group block bg-white rounded-2xl p-6 border border-[#E8E0D8] hover:border-[#C89D7C]/50 hover:shadow-lg hover:shadow-[#C89D7C]/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon
                    className="w-5.5 h-5.5"
                    style={{ color: action.color }}
                  />
                </div>
                <ArrowRight className="w-4 h-4 text-[#8B7D6B] group-hover:text-[#C89D7C] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-[#3C2A21] mb-1">{action.label}</h3>
              <p className="text-sm text-[#8B7D6B]">{action.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-2xl p-8 border border-[#E8E0D8]">
        <h2 className="text-lg font-semibold text-[#3C2A21] mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#C89D7C]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#C89D7C]">1</span>
            </div>
            <div>
              <h4 className="font-medium text-[#3C2A21]">Upload a clear face photo</h4>
              <p className="text-sm text-[#8B7D6B]">
                Use a front-facing photo with good lighting for the most accurate analysis.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#C89D7C]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#C89D7C]">2</span>
            </div>
            <div>
              <h4 className="font-medium text-[#3C2A21]">Get your FaceIQ score</h4>
              <p className="text-sm text-[#8B7D6B]">
                Receive detailed metrics on symmetry, proportions, jawline, and more.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#C89D7C]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#C89D7C]">3</span>
            </div>
            <div>
              <h4 className="font-medium text-[#3C2A21]">Explore style recommendations</h4>
              <p className="text-sm text-[#8B7D6B]">
                Based on your analysis, discover outfits and grooming styles that complement you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
