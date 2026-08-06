"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { runVton, type GarmentType, type VtonLayer, type VtonResult } from "@/lib/ml/vton-engine";
import { loadRemoteProductImage, loadProductImage, type ProductItem, PRODUCT_CATALOG } from "@/lib/ml/product-catalog";
import { motion } from "framer-motion";
import { Shirt, Link2, Loader2, Download, RotateCcw, Layers, Ruler } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const GARMENT_TYPES: { id: GarmentType; label: string }[] = [
  { id: "top", label: "TOP" },
  { id: "jacket", label: "JACKET" },
  { id: "pants", label: "PANTS" },
];

const LAYER_TABS: { id: VtonLayer; label: string }[] = [
  { id: "original", label: "ORIGINAL" },
  { id: "warp", label: "WARP" },
  { id: "final", label: "FINAL" },
];

export default function VirtualTryOnPage() {
  const { uploadedImage, fullBodyImage, setUploadedImage } = useAnalysisStore();
  const activePhoto = fullBodyImage ?? uploadedImage;
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [garmentType, setGarmentType] = useState<GarmentType>("top");
  const [productUrl, setProductUrl] = useState("");
  const [garmentCanvas, setGarmentCanvas] = useState<HTMLCanvasElement | null>(null);
  const [garmentMeta, setGarmentMeta] = useState<{ name: string; credit: string } | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VtonResult | null>(null);
  const [layer, setLayer] = useState<VtonLayer>("final");

  const handleImageUpload = useCallback(
    (imageData: string) => {
      setUploadedImage(imageData);
      setResult(null);
      const img = new Image();
      img.onload = () => { imgRef.current = img; };
      img.src = imageData;
    },
    [setUploadedImage]
  );

  useEffect(() => {
    if (activePhoto) {
      const img = new Image();
      img.onload = () => { imgRef.current = img; };
      img.src = activePhoto;
    }
  }, [activePhoto]);

  const applyGarment = useCallback((canvas: HTMLCanvasElement, meta: { name: string; credit: string }) => {
    setGarmentCanvas(canvas);
    setGarmentMeta(meta);
    setResult(null);
    addToast(`Product loaded: ${meta.name}`, "success");
  }, [addToast]);

  const loadFromUrl = async () => {
    const url = productUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      addToast("Enter a full http(s) product image URL", "error");
      return;
    }
    setIsLoadingProduct(true);
    try {
      const canvas = await loadRemoteProductImage(url);
      if (canvas.width < 32 || canvas.height < 32) throw new Error("Image too small");
      applyGarment(canvas, { name: "Custom product", credit: new URL(url).hostname });
    } catch {
      addToast("Could not load that image — the host may block cross-origin access", "error");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const loadCatalogProduct = async (item: ProductItem) => {
    setIsLoadingProduct(true);
    try {
      const canvas = await loadProductImage(item);
      applyGarment(canvas, { name: item.name, credit: item.credit });
    } catch {
      addToast(`Failed to load ${item.name}`, "error");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const runTryOn = async () => {
    const img = imgRef.current;
    if (!img || !garmentCanvas) return;
    setIsProcessing(true);
    try {
      const res = await runVton({ photo: img, garment: garmentCanvas, type: garmentType });
      setResult(res);
      setLayer("final");
      addToast("Try-on complete — first run may take a few seconds", "success");
    } catch {
      addToast("Try-on failed — check the photo has a visible person", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !container || !img) return;

    const displayWidth = container.clientWidth;
    const displayHeight = Math.min(displayWidth * (img.height / img.width), 560);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    if (result) {
      const src = layer === "original" ? result.original : layer === "warp" ? result.warp : result.final;
      ctx.drawImage(src, 0, 0, displayWidth, displayHeight);
    } else {
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
    }
  }, [result, layer]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.download = "zervey-tryon.png";
    link.href = result.final.toDataURL("image/png");
    link.click();
    addToast("Try-on image saved", "success");
  };

  const activeProduct = garmentMeta?.name === "Custom product";

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // TRY-ON</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Shirt className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            VIRTUAL <span className="text-gradient-aurum">TRY-ON.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Real engine: pose + person segmentation + perspective warp. Load any public product image and try it on your photo.
        </p>
      </motion.div>
      </ScrollParallax>

      {!activePhoto ? (
        <div className="glass-card p-8">
          <ImageUploader onImageUpload={handleImageUpload} label="Upload a full-body photo for try-on" accept="any" />
        </div>
      ) : (
        <ScrollBlur blur={0} minOpacity={0.9}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
          <div ref={containerRef} className="glass-card overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full" />

            {isProcessing && (
              <div className="absolute inset-0 glass-card backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-7 h-7 animate-spin text-[var(--accent-aurum)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-muted)] font-body">WARPING GARMENT & MATCHING LIGHTING...</p>
                  <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-2">FIRST RUN DOWNLOADS THE SEGMENTATION MODEL</p>
                </div>
              </div>
            )}

            {result && !isProcessing && (
              <div className="absolute top-3 right-3 glass-card p-2 flex gap-1">
                {LAYER_TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLayer(t.id)}
                    className={`px-3 py-2 type-mono text-[0.55rem] tracking-widest transition-colors ${
                      layer === t.id
                        ? "bg-[var(--accent-aurum)] text-black"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {result && !isProcessing && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="w-4 h-4 text-[var(--accent-aurum)]" />
                  <h3 className="type-heading text-[var(--text-primary)] tracking-tight">FIT ANALYSIS</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                    <span className="text-sm text-[var(--text-muted)] font-body">Suggested size</span>
                    <span className="type-mono text-xl text-[var(--accent-aurum)] font-bold">{result.fitSuggestion}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                    <span className="text-sm text-[var(--text-muted)] font-body">Shoulder estimate</span>
                    <span className="type-mono text-sm text-[var(--text-primary)]">{result.shoulderCm} CM</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed pt-2">{result.fitReason}</p>
                </div>
              </div>
              <div className="glass-card p-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-[var(--accent-aurum)]" />
                  <h3 className="type-heading text-[var(--text-primary)] tracking-tight">LAYER PREVIEW</h3>
                </div>
                <p className="text-sm text-[var(--text-muted)] font-body mb-4">
                  ORIGINAL shows your photo, WARP shows the raw perspective-mapped garment, FINAL is the result clipped to your body with brightness matched.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={downloadResult} className="btn-nexus">
                    <Download className="w-4 h-4" />
                    SAVE FINAL IMAGE
                  </button>
                  <button onClick={() => { setResult(null); setGarmentCanvas(null); setGarmentMeta(null); }}
                    className="btn-outline">
                    <RotateCcw className="w-4 h-4" />
                    TRY ANOTHER
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-6">SELECT GARMENT TYPE</h3>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {GARMENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setGarmentType(t.id)}
                  className={`p-4 border text-center transition-all duration-300 ${
                    garmentType === t.id
                      ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                      : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[var(--bg-tertiary)] card-nexus"
                  }`}
                >
                  <span className="type-mono text-sm text-[var(--text-primary)] tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-2">LOAD PRODUCT</h3>
            <p className="text-sm text-[var(--text-muted)] font-body mb-6 max-w-2xl">
              Paste a public product image URL (flat-lay or isolated shots work best). Studio backgrounds are stripped automatically before warping.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] px-3">
                <Link2 className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <input
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadFromUrl()}
                  placeholder="https://.../product.png"
                  className="flex-1 bg-transparent py-3 text-sm text-[var(--text-primary)] outline-none font-body placeholder:text-[var(--text-muted)]/50"
                />
              </div>
              <button onClick={loadFromUrl} disabled={isLoadingProduct} className="btn-nexus justify-center disabled:opacity-40">
                {isLoadingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                LOAD FROM LINK
              </button>
            </div>

            <div className="mt-8">
              <h4 className="type-label text-[var(--text-muted)] mb-4">CURATED PRODUCTS FOR {garmentType.toUpperCase()}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PRODUCT_CATALOG.filter((p) => p.category === garmentType).map((item) => {
                  const isSelected = garmentMeta?.name === item.name;
                  return (
                    <button
                      key={item.id}
                      onClick={() => loadCatalogProduct(item)}
                      disabled={isLoadingProduct}
                      className={`p-4 border text-left transition-all duration-300 disabled:opacity-50 ${
                        isSelected
                          ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                          : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[var(--bg-tertiary)] card-nexus"
                      }`}
                    >
                      <div className="w-full h-16 mb-3 border border-[var(--border-primary)] bg-[var(--bg-primary)] overflow-hidden flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                      </div>
                      <p className="text-sm font-body text-[var(--text-primary)] truncate">{item.name}</p>
                      <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-1">{item.source}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="type-label text-[var(--text-muted)]">CURRENT PRODUCT</p>
                {garmentMeta ? (
                  <p className="text-sm text-[var(--text-primary)] font-body mt-1 truncate">
                    {garmentMeta.name} — <span className="text-[var(--text-muted)]">{activeProduct ? "loaded from link" : garmentMeta.credit}</span>
                  </p>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] font-body mt-1">None loaded yet</p>
                )}
              </div>
              <button onClick={runTryOn} disabled={!garmentCanvas || isProcessing}
                className="btn-nexus justify-center disabled:opacity-40">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shirt className="w-4 h-4" />}
                RUN TRY-ON
              </button>
              <button onClick={() => { const s = useAnalysisStore.getState(); s.setUploadedImage(null); s.setFullBodyImage(null); setResult(null); setGarmentCanvas(null); }}
                className="btn-outline">
                NEW PHOTO
              </button>
            </div>
          </div>
        </motion.div>
        </ScrollBlur>
      )}
    </div>
  );
}
