"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);
  const isHoveringElement = useRef(false);
  const lastMoveRef = useRef(0);
  const lastFrameRef = useRef(0);

  const animate = useCallback(() => {
    requestRef.current = 0;

    const mouse = mousePos.current;
    const follower = followerPos.current;
    const dx = mouse.x - follower.x;
    const dy = mouse.y - follower.y;

    // Frame-rate-independent smoothing: same time-to-converge at 30fps or 120fps.
    const now = performance.now();
    const dt = Math.min(50, Math.max(1, now - lastFrameRef.current));
    lastFrameRef.current = now;
    const k = 1 - Math.pow(0.88, dt / 16.7);
    follower.x += dx * k;
    follower.y += dy * k;

    // Idle sleep: once the follower catches the pointer and nothing moves for
    // a while, stop the rAF loop entirely instead of running at 60fps forever.
    const settled = Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4;
    if (settled && now - lastMoveRef.current > 1200) {
      return;
    }

    if (cursorRef.current) {
      cursorRef.current.style.left = `${mouse.x}px`;
      cursorRef.current.style.top = `${mouse.y}px`;
    }
    if (followerRef.current) {
      followerRef.current.style.left = `${follower.x}px`;
      followerRef.current.style.top = `${follower.y}px`;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    lastMoveRef.current = performance.now();
    if (!isVisible.current) {
      isVisible.current = true;
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
      if (followerRef.current) followerRef.current.style.opacity = "1";
    }
    // Wake the follower loop from its idle sleep when the pointer moves again.
    if (requestRef.current === 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const handleMouseLeave = useCallback(() => {
    isVisible.current = false;
    if (cursorRef.current) cursorRef.current.style.opacity = "0";
    if (followerRef.current) followerRef.current.style.opacity = "0";
  }, []);

  const handleHoverStart = useCallback(() => {
    isHoveringElement.current = true;
    if (cursorRef.current) {
      cursorRef.current.style.transform = "translate(-50%, -50%) scale(3)";
      cursorRef.current.style.background = "rgba(185, 139, 86, 0.08)";
      cursorRef.current.style.borderColor = "rgba(185, 139, 86, 0.4)";
    }
    if (followerRef.current) {
      followerRef.current.style.transform = "translate(-50%, -50%) scale(0)";
    }
  }, []);

  const handleHoverEnd = useCallback(() => {
    isHoveringElement.current = false;
    if (cursorRef.current) {
      cursorRef.current.style.transform = "translate(-50%, -50%) scale(1)";
      cursorRef.current.style.background = "transparent";
      cursorRef.current.style.borderColor = "rgba(185, 139, 86, 0.6)";
    }
    if (followerRef.current) {
      followerRef.current.style.transform = "translate(-50%, -50%) scale(1)";
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const hoverableElements = document.querySelectorAll(
      "a, button, input, textarea, select, [role='button'], [tabindex]:not([tabindex='-1'])"
    );

    const addListeners = (el: Element) => {
      el.addEventListener("mouseenter", handleHoverStart);
      el.addEventListener("mouseleave", handleHoverEnd);
    };

    hoverableElements.forEach(addListeners);

    const observer = new MutationObserver(() => {
      document.querySelectorAll(
        "a, button, input, textarea, select, [role='button'], [tabindex]:not([tabindex='-1'])"
      ).forEach((el) => {
        el.removeEventListener("mouseenter", handleHoverStart);
        el.removeEventListener("mouseleave", handleHoverEnd);
        addListeners(el);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      hoverableElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleHoverStart);
        el.removeEventListener("mouseleave", handleHoverEnd);
      });
      observer.disconnect();
      cancelAnimationFrame(requestRef.current);
    };
  }, [enabled, animate, handleMouseMove, handleMouseLeave, handleHoverStart, handleHoverEnd]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={followerRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "1.5px solid rgba(185, 139, 86, 0.6)",
          transform: "translate(-50%, -50%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease",
          opacity: 0,
          willChange: "transform, left, top",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "transparent",
          border: "1.5px solid rgba(185, 139, 86, 0.6)",
          transform: "translate(-50%, -50%)",
          transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), width 0.2s, height 0.2s, background 0.3s, border-color 0.3s, opacity 0.6s ease",
          opacity: 0,
          willChange: "transform, left, top",
        }}
      />
    </>
  );
}
