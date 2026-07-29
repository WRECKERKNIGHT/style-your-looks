"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Mannequin3DProps {
  shirtColor?: string;
  trousersColor?: string;
  shoesColor?: string;
  accessoryColor?: string;
  className?: string;
  interactive?: boolean;
}

export function Mannequin3D({
  shirtColor = "#722F37",
  trousersColor = "#2C1810",
  shoesColor = "#1A1A1A",
  accessoryColor = "#B8860B",
  className = "",
  interactive = false,
}: Mannequin3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scrollRotateY = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const smoothRotateY = useSpring(scrollRotateY, { stiffness: 60, damping: 20 });
  const mannequinOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const mannequinScale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);
  const floatY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -8, 0]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    },
    [interactive]
  );

  const interactiveRotateX = interactive && isHovered ? mousePos.y * -8 : 0;
  const interactiveRotateY = interactive && isHovered ? mousePos.x * 12 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
      style={{ perspective: "1200px", perspectiveOrigin: "50% 45%" }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[600px] rounded-full bg-amber/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-burgundy/[0.03] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[200px] h-[200px] rounded-full bg-olive/[0.02] blur-[80px] pointer-events-none" />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[16px] rounded-[50%] bg-espresso/[0.12] blur-[20px] pointer-events-none" />

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] flex flex-col items-center pointer-events-none">
        <div className="w-[160px] h-[6px] rounded-t-sm" style={{ background: "linear-gradient(90deg, #C4A882, #D4C4A8, #C4A882)" }} />
        <div className="w-[140px] h-[40px] rounded-b-sm" style={{ background: "linear-gradient(180deg, #C4A882 0%, #D4C4A8 40%, #C4A882 100%)" }} />
        <div className="w-[180px] h-[8px] rounded-b-md" style={{ background: "linear-gradient(180deg, #C4A882, #A89070)" }} />
      </div>

      <motion.div
        className="relative z-10"
        style={{ opacity: mannequinOpacity, scale: mannequinScale, y: floatY }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: interactive
              ? `rotateX(${interactiveRotateX}deg) rotateY(${interactiveRotateY}deg)`
              : undefined,
          }}
        >
          <motion.div
            style={{
              rotateY: interactive ? undefined : smoothRotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <div className="relative" style={{ width: "220px", height: "460px", transformStyle: "preserve-3d" }}>
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "0px", width: "56px", height: "66px", borderRadius: "50% 50% 48% 48%", background: "linear-gradient(180deg, #FFF8F0 0%, #F5EDE0 100%)", border: "1px solid #C4A882", boxShadow: "inset 0 -4px 8px rgba(196,168,130,0.15), 0 2px 8px rgba(44,24,16,0.08)" }}>
                <div className="absolute top-[18px] left-[8px] right-[8px] h-px" style={{ background: accessoryColor, opacity: 0.25 }} />
                <div className="absolute top-[34px] left-[6px] right-[6px] h-px" style={{ background: accessoryColor, opacity: 0.18 }} />
                <div className="absolute top-[28px] left-[15px] w-[9px] h-[3px] rounded-full" style={{ background: "#C4A882", opacity: 0.5 }} />
                <div className="absolute top-[28px] right-[15px] w-[9px] h-[3px] rounded-full" style={{ background: "#C4A882", opacity: 0.5 }} />
                <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-px h-[58px]" style={{ background: accessoryColor, opacity: 0.1 }} />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "62px", width: "24px", height: "26px", background: "linear-gradient(180deg, #F5EDE0, #FFF8F0)", border: "1px solid #C4A882", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                <div className="absolute bottom-[2px] left-0 right-0 h-px" style={{ background: accessoryColor, opacity: 0.2 }} />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "84px", width: "150px", height: "20px", borderRadius: "50% 50% 0 0 / 100% 100% 0 0", background: `linear-gradient(180deg, ${shirtColor}ee, ${shirtColor})`, border: `1px solid ${accessoryColor}44`, borderBottom: "none" }} />

              <div className="absolute left-1/2 -translate-x-1/2 overflow-hidden" style={{ top: "100px", width: "118px", height: "148px", background: `linear-gradient(180deg, ${shirtColor} 0%, ${shirtColor}dd 100%)`, borderRadius: "8px 8px 4px 4px", border: `1px solid ${accessoryColor}33`, boxShadow: `inset 0 0 30px ${shirtColor}33` }}>
                <div className="absolute top-[30px] left-0 right-0 h-px" style={{ background: accessoryColor, opacity: 0.12 }} />
                <div className="absolute top-[64px] left-0 right-0 h-px" style={{ background: accessoryColor, opacity: 0.1 }} />
                <div className="absolute top-[98px] left-0 right-0 h-px" style={{ background: accessoryColor, opacity: 0.08 }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full" style={{ background: accessoryColor, opacity: 0.1 }} />
                <div className="absolute top-[22px] left-[24px] w-[30px] h-[24px] rounded-sm" style={{ border: `1px solid ${accessoryColor}18` }} />
                {[38, 60, 82, 104].map((t) => (
                  <div key={t} className="absolute left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full" style={{ top: `${t}px`, background: accessoryColor, opacity: 0.2 }} />
                ))}
              </div>

              <div className="absolute" style={{ top: "100px", left: "14px", width: "28px", height: "138px", background: `linear-gradient(180deg, ${shirtColor} 0%, ${shirtColor}cc 100%)`, borderRadius: "12px 8px 8px 14px", border: `1px solid ${accessoryColor}33`, transformOrigin: "top center" }}>
                <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-[18px] h-[20px]" style={{ borderRadius: "40% 40% 50% 50%", background: "linear-gradient(180deg, #F5EDE0, #FFF8F0)", border: "1px solid #C4A882" }} />
                <div className="absolute top-[44px] left-[4px] right-[4px] h-px" style={{ background: accessoryColor, opacity: 0.15 }} />
              </div>

              <div className="absolute" style={{ top: "100px", right: "14px", width: "28px", height: "138px", background: `linear-gradient(180deg, ${shirtColor} 0%, ${shirtColor}cc 100%)`, borderRadius: "8px 12px 14px 8px", border: `1px solid ${accessoryColor}33`, transformOrigin: "top center" }}>
                <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-[18px] h-[20px]" style={{ borderRadius: "40% 40% 50% 50%", background: "linear-gradient(180deg, #F5EDE0, #FFF8F0)", border: "1px solid #C4A882" }} />
                <div className="absolute top-[44px] left-[4px] right-[4px] h-px" style={{ background: accessoryColor, opacity: 0.15 }} />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "246px", width: "116px", height: "30px", background: `linear-gradient(180deg, ${trousersColor}ee, ${trousersColor})`, borderRadius: "0 0 20px 20px / 0 0 100% 100%", border: `1px solid ${accessoryColor}22`, borderTop: "none" }} />

              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "272px", width: "116px", height: "168px" }}>
                <div className="absolute left-0 overflow-hidden" style={{ top: "0", width: "52px", height: "168px", background: `linear-gradient(180deg, ${trousersColor} 0%, ${trousersColor}ee 100%)`, borderRadius: "2px 2px 4px 12px", border: `1px solid ${accessoryColor}22` }}>
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-px h-[148px]" style={{ background: accessoryColor, opacity: 0.08 }} />
                  <div className="absolute bottom-[6px] left-[6px] right-[6px] h-px" style={{ background: accessoryColor, opacity: 0.12 }} />
                </div>
                <div className="absolute right-0 overflow-hidden" style={{ top: "0", width: "52px", height: "168px", background: `linear-gradient(180deg, ${trousersColor} 0%, ${trousersColor}ee 100%)`, borderRadius: "2px 2px 12px 4px", border: `1px solid ${accessoryColor}22` }}>
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-px h-[148px]" style={{ background: accessoryColor, opacity: 0.08 }} />
                  <div className="absolute bottom-[6px] left-[6px] right-[6px] h-px" style={{ background: accessoryColor, opacity: 0.12 }} />
                </div>
              </div>

              <div className="absolute" style={{ bottom: "18px", left: "40px", width: "48px", height: "20px", background: `linear-gradient(180deg, ${shoesColor}, ${shoesColor}dd)`, borderRadius: "6px 6px 4px 10px", border: `1px solid ${accessoryColor}33`, boxShadow: "0 2px 6px rgba(26,26,26,0.15)" }}>
                <div className="absolute top-[4px] left-[8px] right-[12px] h-px" style={{ background: accessoryColor, opacity: 0.2 }} />
              </div>
              <div className="absolute" style={{ bottom: "18px", right: "40px", width: "48px", height: "20px", background: `linear-gradient(180deg, ${shoesColor}, ${shoesColor}dd)`, borderRadius: "6px 6px 10px 4px", border: `1px solid ${accessoryColor}33`, boxShadow: "0 2px 6px rgba(26,26,26,0.15)" }}>
                <div className="absolute top-[4px] left-[12px] right-[8px] h-px" style={{ background: accessoryColor, opacity: 0.2 }} />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "246px", width: "118px", height: "6px", background: `linear-gradient(90deg, ${accessoryColor}88, ${accessoryColor}, ${accessoryColor}88)`, borderRadius: "2px", boxShadow: `0 0 8px ${accessoryColor}33` }}>
                <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-[10px] h-[8px] rounded-[2px]" style={{ background: `linear-gradient(180deg, ${accessoryColor}, #D4A017)`, border: `1px solid ${accessoryColor}` }} />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "72px", width: "38px", height: "20px", border: `1.5px solid ${accessoryColor}55`, borderTop: "none", borderRadius: "0 0 50% 50%" }}>
                <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full" style={{ background: `linear-gradient(135deg, ${accessoryColor}, #D4A017)`, boxShadow: `0 0 6px ${accessoryColor}44` }} />
              </div>

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px" style={{ height: "460px", background: `linear-gradient(180deg, ${accessoryColor}00, ${accessoryColor}18, ${accessoryColor}00)` }} />
              {[84, 246, 360].map((t) => (
                <div key={t} className="absolute left-1/2 -translate-x-1/2" style={{ top: `${t}px`, width: "150px", height: "1px", background: `linear-gradient(90deg, ${accessoryColor}00, ${accessoryColor}15, ${accessoryColor}00)` }} />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes mannequinSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
