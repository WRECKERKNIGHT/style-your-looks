"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { fitGlasses } from "@/lib/ml/face-landmarks";
import { segmentPerson, type PersonSegmentation } from "@/lib/ml/segmenter";
import { compositeUnderHair } from "@/lib/ml/accessory-composite";
import { GLASSES_PRODUCTS, loadProductImage, loadRemoteProductImage, type ProductItem } from "@/lib/ml/product-catalog";
import { motion } from "framer-motion";
import { Glasses, ArrowRight, Download, Trash2, Link2, Loader2 } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function AccessoriesPage() {
  const { uploadedImage, fullBodyImage, setUploadedImage, setFullBodyImage, faceResult } = useAnalysisStore();
  const currentPhoto = fullBodyImage ?? uploadedImage;
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [productCredit, setProductCredit] = useState<string>("");
  const [customName, setCustomName] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [glassesY, setGlassesY] = useState(0);
  const [glassesScale, setGlassesScale] = useState(1);
  const [hairSeg, setHairSeg] = useState<PersonSegmentation | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!currentPhoto) {
      setHairSeg(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      segmentPerson(img)
        .then((seg) => {
          if (!cancelled) setHairSeg(seg);
        })
        .catch(() => {
          if (!cancelled) setHairSeg(null);
        });
    };
    img.src = currentPhoto;
    return () => {
      cancelled = true;
    };
  }, [currentPhoto]);

  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData);
    setFullBodyImage(null);
    setSelectedProduct(null);
    productRef.current = null;
    const img = new Image();
    img.onload = () => { setLoadedImg(img); };
    img.src = imageData;
  }, [setUploadedImage, setFullBodyImage]);

  useEffect(() => {
    if (currentPhoto) {
      const img = new Image();
      img.onload = () => { setLoadedImg(img); };
      img.src = currentPhoto;
    }
  }, [currentPhoto]);

  const selectProduct = async (item: ProductItem) => {
    setIsLoading(true);
    try {
      const canvas = await loadProductImage(item);
      productRef.current = canvas;
      setSelectedProduct(item);
      setProductCredit(item.credit);
      setCustomName(null);
      addToast(`Loaded: ${item.name}`, "success");
    } catch {
      addToast(`Failed to load ${item.name}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromUrl = async () => {
    const url = productUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      addToast("Enter a full http(s) image URL", "error");
      return;
    }
    setIsLoading(true);
    try {
      const canvas = await loadRemoteProductImage(url);
      productRef.current = canvas;
      setSelectedProduct({ id: "custom", name: "Custom link", brand: "custom", category: "glasses", image: url, source: new URL(url).hostname, background: "transparent", credit: "loaded from link" });
      setProductCredit(new URL(url).hostname);
      setCustomName("Custom glasses");
      addToast("Product loaded", "success");
    } catch {
      addToast("Could not load that image — the host may block cross-origin access", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = loadedImg;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;
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
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

    const product = productRef.current;
    if (!product || !selectedProduct) return;

    let centerX: number;
    let eyeY: number;
    let totalWidth: number;
    let rotation = 0;
    if (faceResult && faceResult.landmarks.length > 362) {
      const fit = fitGlasses(faceResult.landmarks, displayWidth, displayHeight);
      centerX = fit.centerX;
      eyeY = fit.eyeY;
      totalWidth = fit.totalWidth;
      rotation = fit.rotation;
    } else {
      centerX = displayWidth * 0.5;
      eyeY = displayHeight * 0.36;
      totalWidth = displayWidth * 0.35;
    }

    const drawW = totalWidth * glassesScale * 1.12;
    const drawH = drawW * (product.height / product.width);

    const layer = document.createElement("canvas");
    layer.width = displayWidth;
    layer.height = displayHeight;
    const lctx = layer.getContext("2d");
    if (!lctx) return;
    lctx.save();
    lctx.translate(centerX, eyeY + glassesY);
    lctx.rotate(rotation);
    lctx.drawImage(product, -drawW / 2, -drawH / 2, drawW, drawH);
    lctx.restore();

    if (hairSeg) {
      const final = compositeUnderHair(img, layer, hairSeg, { displayWidth, displayHeight });
      if (final) {
        ctx.drawImage(final, 0, 0);
        return;
      }
    }
    ctx.drawImage(layer, 0, 0);
  }, [selectedProduct, glassesY, glassesScale, faceResult, hairSeg, loadedImg]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "zervey-glasses.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("Glasses preview saved", "success");
  };

  const clearSelection = () => {
    setSelectedProduct(null);
    productRef.current = null;
    setCustomName(null);
  };

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // ACCESSORIES</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Glasses className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            VIRTUAL <span className="text-gradient-aurum">GLASSES.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Bundled studio frames anchored to your detected face landmarks — or load any product link.
        </p>
      </motion.div>
      </ScrollParallax>

      {!currentPhoto ? (
        <div className="glass-card p-8">
          <ImageUploader onImageUpload={handleImageUpload} label="Upload a photo for glasses try-on" accept="face" />
        </div>
      ) : (
        <ScrollBlur blur={0} minOpacity={0.9}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
          <div ref={containerRef} className="glass-card overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full" />

            {isLoading && (
              <div className="absolute inset-0 glass-card backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-aurum)]" />
              </div>
            )}

            {selectedProduct && (
              <div className="absolute top-3 right-3 glass-card p-3 space-y-2 max-w-[240px]">
                <p className="type-label text-[var(--text-muted)]">ADJUST</p>
                <div>
                  <label className="type-mono text-[var(--text-muted)]">VERTICAL</label>
                  <input type="range" min={-30} max={30} value={glassesY}
                    onChange={(e) => setGlassesY(parseInt(e.target.value))}
                    className="w-full h-1 accent-[var(--accent-aurum)]" />
                </div>
                <div>
                  <label className="type-mono text-[var(--text-muted)]">SIZE</label>
                  <input type="range" min={0.7} max={1.3} step={0.05} value={glassesScale}
                    onChange={(e) => setGlassesScale(parseFloat(e.target.value))}
                    className="w-full h-1 accent-[var(--accent-aurum)]" />
                </div>
                <p className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest pt-1 border-t border-[var(--border-primary)]">
                  {customName ?? selectedProduct.name}
                  <br />{productCredit}
                </p>
              </div>
            )}
          </div>

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-2">SELECT FRAMES</h3>
            <p className="text-sm text-[var(--text-muted)] font-body mb-6">
              Bundled studio renders need no network — or load any public product link; studio backgrounds are removed automatically.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GLASSES_PRODUCTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectProduct(item)}
                  disabled={isLoading}
                  className={`p-3 border text-left transition-all duration-300 disabled:opacity-50 ${
                    selectedProduct?.id === item.id
                      ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                      : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[var(--bg-tertiary)] card-nexus"
                  }`}
                >
                  <div className="w-full h-16 mb-2 border border-[var(--border-primary)] bg-[var(--bg-primary)] overflow-hidden flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                  </div>
                  <p className="text-xs font-body text-[var(--text-primary)] truncate">{item.name}</p>
                  <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-1">{item.source}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
              <h4 className="type-label text-[var(--text-muted)] mb-3">OR LOAD YOUR OWN PRODUCT LINK</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] px-3">
                  <Link2 className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  <input
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadFromUrl()}
                    placeholder="https://.../glasses.png"
                    className="flex-1 bg-transparent py-3 text-sm text-[var(--text-primary)] outline-none font-body placeholder:text-[var(--text-muted)]/50"
                  />
                </div>
                <button onClick={loadFromUrl} disabled={isLoading} className="btn-outline justify-center disabled:opacity-40">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  LOAD FROM LINK
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={clearSelection} className="btn-outline flex-1 justify-center">
              <Trash2 className="w-4 h-4" />
              REMOVE
            </button>
            <button onClick={downloadResult} disabled={!selectedProduct}
              className="btn-nexus flex-1 justify-center disabled:opacity-40">
              <Download className="w-4 h-4" />
              SAVE IMAGE
            </button>
            <Link href="/dashboard/hair-preview" className="btn-nexus flex-1 justify-center">
              HAIR PREVIEW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
        </ScrollBlur>
      )}
    </div>
  );
}
