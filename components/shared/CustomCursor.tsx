"use client";

import { useEffect, useRef, useCallback } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);
  const isHoveringElement = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    if (!isVisible.current) {
      isVisible.current = true;
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
      if (followerRef.current) followerRef.current.style.opacity = "1";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isVisible.current = false;
    if (cursorRef.current) cursorRef.current.style.opacity = "0";
    if (followerRef.current) followerRef.current.style.opacity = "0";
  }, []);

  const handleHoverStart = useCallback(() => {
    isHoveringElement.current = true;
    if (cursorRef.current) {
      cursorRef.current.style.transform = "translate(-50%, -50%) scale(3)";
      cursorRef.current.style.background = "rgba(108, 43, 217, 0.08)";
      cursorRef.current.style.borderColor = "rgba(108, 43, 217, 0.4)";
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
      cursorRef.current.style.borderColor = "rgba(108, 43, 217, 0.6)";
    }
    if (followerRef.current) {
      followerRef.current.style.transform = "translate(-50%, -50%) scale(1)";
    }
  }, []);

  useEffect(() => {
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

    const animate = () => {
      const dx = mousePos.current.x - followerPos.current.x;
      const dy = mousePos.current.y - followerPos.current.y;
      followerPos.current.x += dx * 0.12;
      followerPos.current.y += dy * 0.12;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${mousePos.current.x}px`;
        cursorRef.current.style.top = `${mousePos.current.y}px`;
      }
      if (followerRef.current) {
        followerRef.current.style.left = `${followerPos.current.x}px`;
        followerRef.current.style.top = `${followerPos.current.y}px`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

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
  }, [handleMouseMove, handleMouseLeave, handleHoverStart, handleHoverEnd]);

  return (
    <>
      <div
        ref={followerRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "1.5px solid rgba(108, 43, 217, 0.6)",
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
          border: "1.5px solid rgba(108, 43, 217, 0.6)",
          transform: "translate(-50%, -50%)",
          transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), width 0.2s, height 0.2s, background 0.3s, border-color 0.3s, opacity 0.6s ease",
          opacity: 0,
          willChange: "transform, left, top",
        }}
      />
    </>
  );
}
