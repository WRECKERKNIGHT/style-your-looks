"use client";

import { useState } from "react";
import { User, Camera, Star, History, Settings, Shield, LogOut } from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";

export default function ProfilePage() {
  const { faceResult, bodyResult } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#C89D7C]/20 flex items-center justify-center">
            <User className="w-8 h-8 text-[#C89D7C]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#3C2A21]">Your Profile</h1>
            <p className="text-sm text-[#8B7D6B]">View your analysis history and settings</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-[#FDFBF7] rounded-xl p-3 text-center">
            <Star className="w-4 h-4 text-[#C89D7C] mx-auto mb-1" />
            <span className="text-lg font-bold text-[#3C2A21]">
              {faceResult ? faceResult.overallScore.toFixed(1) : "--"}
            </span>
            <p className="text-xs text-[#8B7D6B]">FaceIQ</p>
          </div>
          <div className="bg-[#FDFBF7] rounded-xl p-3 text-center">
            <span className="text-lg font-bold text-[#3C2A21]">
              {bodyResult ? bodyResult.bodyType.split(" ")[0] : "--"}
            </span>
            <p className="text-xs text-[#8B7D6B]">Body Type</p>
          </div>
          <div className="bg-[#FDFBF7] rounded-xl p-3 text-center">
            <span className="text-lg font-bold text-[#3C2A21]">
              {faceResult ? faceResult.facialShape : "--"}
            </span>
            <p className="text-xs text-[#8B7D6B]">Face Shape</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "history"
              ? "bg-[#3C2A21] text-white"
              : "bg-white text-[#3C2A21] border border-[#E8E0D8]"
          }`}
        >
          <History className="w-4 h-4 inline mr-1.5" />
          History
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "settings"
              ? "bg-[#3C2A21] text-white"
              : "bg-white text-[#3C2A21] border border-[#E8E0D8]"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-1.5" />
          Settings
        </button>
      </div>

      {activeTab === "history" && (
        <div className="space-y-3">
          {faceResult && (
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C89D7C]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#C89D7C]">
                    {faceResult.overallScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-[#3C2A21]">Face Analysis</h4>
                  <p className="text-xs text-[#8B7D6B]">
                    {faceResult.facialShape} face shape | {faceResult.skinTone} skin
                  </p>
                </div>
                <span className="text-xs text-[#8B7D6B]">Just now</span>
              </div>
            </div>
          )}

          {bodyResult && (
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4CAF50]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#4CAF50]">Body</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-[#3C2A21]">Body Analysis</h4>
                  <p className="text-xs text-[#8B7D6B]">
                    {bodyResult.bodyType} | {bodyResult.undertone} undertone
                  </p>
                </div>
                <span className="text-xs text-[#8B7D6B]">Just now</span>
              </div>
            </div>
          )}

          {!faceResult && !bodyResult && (
            <div className="bg-white rounded-xl p-8 border border-[#E8E0D8] text-center">
              <History className="w-10 h-10 text-[#C89D7C]/40 mx-auto mb-3" />
              <p className="text-sm text-[#8B7D6B]">No analysis history yet</p>
              <p className="text-xs text-[#8B7D6B] mt-1">
                Complete your first face or body analysis to see it here
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#8B7D6B]" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#3C2A21]">Privacy</h4>
                <p className="text-xs text-[#8B7D6B]">All analysis runs in your browser. Photos never leave your device.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-[#8B7D6B]" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#3C2A21]">Camera Permission</h4>
                <p className="text-xs text-[#8B7D6B]">Manage webcam access for live analysis</p>
              </div>
              <button className="text-xs bg-[#F4EFEA] text-[#3C2A21] px-3 py-1.5 rounded-lg">
                Manage
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#E8E0D8]">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-600">Sign Out</h4>
                <p className="text-xs text-[#8B7D6B]">Sign out of your account</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
