"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Camera, Star, History, Settings, Shield, LogOut, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalysisStore } from "@/store/analysis-store";
import { createClient } from "@/lib/supabase/client";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/history";

export default function ProfilePage() {
  const { faceResult, bodyResult } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [signingOut, setSigningOut] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<string>("unknown");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          email: authUser.email || "",
          name: (authUser.user_metadata?.full_name as string) || authUser.email?.split("@")[0] || "User",
        });
      }
    }
    loadUser();
    setHistory(getHistory());

    if (navigator.permissions) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        setCameraStatus(result.state);
      }).catch(() => setCameraStatus("unknown"));
    }
  }, [supabase]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleCameraManage() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setCameraStatus("granted");
    } catch {
      setCameraStatus("denied");
    }
  }

  function handleClearHistory() {
    if (window.confirm("Clear all analysis history? This cannot be undone.")) {
      clearHistory();
      setHistory([]);
    }
  }

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
            <span className="text-2xl font-display font-bold text-amber">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-espresso tracking-wider">
              {user?.name || "YOUR PROFILE"}
            </h1>
            <p className="text-base text-coffee font-body mt-1">{user?.email || "Sign in to sync data"}</p>
          </div>
          {!user && (
            <Link href="/login" className="text-sm bg-amber text-cream px-5 py-2.5 font-body tracking-wider uppercase rounded-sm shadow-gold hover:bg-amber-light transition-colors">
              SIGN IN
            </Link>
          )}
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

          {history.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <h3 className="text-sm font-body text-coffee tracking-widest uppercase font-semibold">SAVED ANALYSES</h3>
              <button
                onClick={handleClearHistory}
                className="text-xs text-burgundy hover:text-burgundy-light transition-colors font-body flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                CLEAR ALL
              </button>
            </div>
          )}

          {history.map((entry) => (
            <Link
              key={entry.id}
              href="/dashboard/history"
              className="block bg-cream p-5 border border-tan rounded-sm card-hover"
            >
              <div className="flex items-center gap-4">
                {entry.thumbnail ? (
                  <img src={entry.thumbnail} alt="" className="w-12 h-12 object-cover rounded-sm border border-tan" />
                ) : (
                  <div className="w-12 h-12 bg-parchment flex items-center justify-center rounded-sm border border-tan">
                    <Star className="w-5 h-5 text-amber/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-display font-bold text-espresso tracking-wider truncate">
                    {entry.label || "Analysis"}
                  </h4>
                  <p className="text-xs text-coffee font-body mt-0.5">
                    Score: {entry.faceScore?.toFixed(1) || "N/A"} | {entry.bodyType || "No body data"}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-coffee shrink-0" />
              </div>
            </Link>
          ))}

          {!faceResult && !bodyResult && history.length === 0 && (
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
                <p className="text-sm text-coffee font-body mt-1">
                  {cameraStatus === "granted"
                    ? "Camera access granted"
                    : cameraStatus === "denied"
                    ? "Camera access denied — enable in browser settings"
                    : "Manage webcam access for live analysis"}
                </p>
              </div>
              <button
                onClick={handleCameraManage}
                className="text-sm bg-parchment text-espresso px-4 py-2 font-body tracking-wider uppercase border border-tan hover:bg-tan/20 transition-colors rounded-sm"
              >
                {cameraStatus === "granted" ? "GRANTED" : "MANAGE"}
              </button>
            </div>
          </div>

          <div className="bg-cream p-6 border border-tan rounded-sm card-hover">
            <div className="flex items-center gap-4">
              <History className="w-5 h-5 text-coffee" />
              <div className="flex-1">
                <h4 className="text-base font-display font-bold text-espresso tracking-wider">LOCAL DATA</h4>
                <p className="text-sm text-coffee font-body mt-1">{history.length} analysis entries stored locally</p>
              </div>
              <button
                onClick={handleClearHistory}
                className="text-sm bg-parchment text-burgundy px-4 py-2 font-body tracking-wider uppercase border border-tan hover:bg-burgundy/5 transition-colors rounded-sm"
              >
                CLEAR
              </button>
            </div>
          </div>

          {user && (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full bg-cream p-6 border border-burgundy/30 rounded-sm hover:bg-burgundy/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                {signingOut ? (
                  <Loader2 className="w-5 h-5 text-burgundy animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5 text-burgundy" />
                )}
                <div className="flex-1 text-left">
                  <h4 className="text-base font-display font-bold text-burgundy tracking-wider">
                    {signingOut ? "SIGNING OUT..." : "SIGN OUT"}
                  </h4>
                  <p className="text-sm text-coffee font-body mt-1">Sign out of your account</p>
                </div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
