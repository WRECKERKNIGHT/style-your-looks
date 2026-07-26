"use client";

import { useState } from "react";
import { User, Camera, Star, History, Settings, Shield, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalysisStore } from "@/store/analysis-store";

export default function ProfilePage() {
  const { faceResult, bodyResult } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-cream p-8 border border-tan vintage-border rounded-sm"
      >
        <span className="section-number">EST. MMXXIV // PROFILE</span>
        <div className="flex items-center gap-5 mt-3">
          <div className="w-20 h-20 bg-amber/15 flex items-center justify-center border border-amber/25 rounded-full">
            <User className="w-10 h-10 text-amber" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-espresso tracking-wider">YOUR PROFILE</h1>
            <p className="text-base text-coffee font-body mt-1">View your analysis history and settings</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-parchment p-5 text-center border border-tan rounded-sm">
            <Star className="w-5 h-5 text-amber mx-auto mb-2" />
            <span className="text-2xl font-display font-bold text-espresso">
              {faceResult ? faceResult.overallScore.toFixed(1) : "--"}
            </span>
            <p className="text-sm text-coffee font-body mt-1">FaceIQ</p>
          </div>
          <div className="bg-parchment p-5 text-center border border-tan rounded-sm">
            <span className="text-2xl font-display font-bold text-espresso">
              {bodyResult ? bodyResult.bodyType.split(" ")[0] : "--"}
            </span>
            <p className="text-sm text-coffee font-body mt-1">Body Type</p>
          </div>
          <div className="bg-parchment p-5 text-center border border-tan rounded-sm">
            <span className="text-2xl font-display font-bold text-espresso">
              {faceResult ? faceResult.facialShape : "--"}
            </span>
            <p className="text-sm text-coffee font-body mt-1">Face Shape</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3.5 text-base font-body font-semibold tracking-wider uppercase transition-all rounded-sm ${
            activeTab === "history"
              ? "bg-amber text-cream shadow-gold"
              : "bg-cream text-espresso border border-tan hover:bg-tan/10"
          }`}
        >
          <History className="w-4 h-4 inline mr-2" />
          HISTORY
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3.5 text-base font-body font-semibold tracking-wider uppercase transition-all rounded-sm ${
            activeTab === "settings"
              ? "bg-amber text-cream shadow-gold"
              : "bg-cream text-espresso border border-tan hover:bg-tan/10"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          SETTINGS
        </button>
      </div>

      {activeTab === "history" && (
        <div className="space-y-4">
          {faceResult && (
            <div className="bg-cream p-6 border border-tan rounded-sm card-hover">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber/15 flex items-center justify-center border border-amber/25 rounded-full">
                  <span className="text-lg font-display font-bold text-amber">
                    {faceResult.overallScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-display font-bold text-espresso tracking-wider">FACE ANALYSIS</h4>
                  <p className="text-sm text-coffee font-body mt-1">
                    {faceResult.facialShape} face shape | {faceResult.skinTone} skin
                  </p>
                </div>
                <span className="text-sm text-coffee font-body">Just now</span>
              </div>
            </div>
          )}

          {bodyResult && (
            <div className="bg-cream p-6 border border-tan rounded-sm card-hover">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber/10 flex items-center justify-center border border-amber/25 rounded-full">
                  <span className="text-sm font-display font-bold text-amber">Body</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-display font-bold text-espresso tracking-wider">BODY ANALYSIS</h4>
                  <p className="text-sm text-coffee font-body mt-1">
                    {bodyResult.bodyType} | {bodyResult.undertone} undertone
                  </p>
                </div>
                <span className="text-sm text-coffee font-body">Just now</span>
              </div>
            </div>
          )}

          {!faceResult && !bodyResult && (
            <div className="bg-cream p-10 border border-tan rounded-sm text-center">
              <History className="w-12 h-12 text-amber/40 mx-auto mb-4" />
              <p className="text-base text-coffee font-body">No analysis history yet</p>
              <p className="text-sm text-coffee mt-2 font-body">
                Complete your first face or body analysis to see it here
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-cream p-6 border border-tan rounded-sm card-hover">
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-coffee" />
              <div className="flex-1">
                <h4 className="text-base font-display font-bold text-espresso tracking-wider">PRIVACY</h4>
                <p className="text-sm text-coffee font-body mt-1">All analysis runs in your browser. Photos never leave your device.</p>
              </div>
            </div>
          </div>

          <div className="bg-cream p-6 border border-tan rounded-sm card-hover">
            <div className="flex items-center gap-4">
              <Camera className="w-5 h-5 text-coffee" />
              <div className="flex-1">
                <h4 className="text-base font-display font-bold text-espresso tracking-wider">CAMERA PERMISSION</h4>
                <p className="text-sm text-coffee font-body mt-1">Manage webcam access for live analysis</p>
              </div>
              <button className="text-sm bg-parchment text-espresso px-4 py-2 font-body tracking-wider uppercase border border-tan hover:bg-tan/20 transition-colors rounded-sm">
                MANAGE
              </button>
            </div>
          </div>

          <div className="bg-cream p-6 border border-tan rounded-sm card-hover">
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 text-burgundy" />
              <div className="flex-1">
                <h4 className="text-base font-display font-bold text-burgundy tracking-wider">SIGN OUT</h4>
                <p className="text-sm text-coffee font-body mt-1">Sign out of your account</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
