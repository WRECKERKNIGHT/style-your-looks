"use client";

import { useEffect, useRef } from "react";

interface LandmarkOverlayProps {
  landmarks: number[][];
  width: number;
  height: number;
  className?: string;
}

const CONNECTIONS: [number, number][] = [
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
  [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397],
  [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
  [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
  [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
  [10, 338],
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154],
  [154, 155], [155, 133], [133, 173], [173, 157], [157, 158], [158, 159],
  [159, 160], [160, 161], [161, 246],
  [263, 466], [466, 388], [388, 387], [387, 386], [386, 385], [385, 384],
  [384, 398], [398, 382], [382, 381], [381, 380], [380, 374], [374, 373],
  [373, 390], [390, 249], [249, 263],
  [263, 334], [334, 296], [296, 336], [336, 293], [293, 300], [300, 283],
  [283, 282], [282, 295], [295, 285],
  [46, 53], [53, 52], [52, 65], [65, 55], [55, 70], [70, 63],
  [63, 105], [105, 66], [66, 107], [107, 55],
  [276, 353], [353, 300], [300, 293], [293, 336], [336, 296],
  [296, 334], [334, 293],
  [3, 0], [0, 39], [39, 37], [37, 167], [167, 165], [165, 53],
  [263, 466], [466, 388], [388, 387], [387, 386],
  [39, 40], [40, 185], [185, 61], [61, 146], [146, 91], [91, 181],
  [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375],
  [375, 291], [291, 409], [409, 270], [270, 269], [269, 267], [267, 0],
];

export function LandmarkOverlay({ landmarks, width, height, className }: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Draw connections
    ctx.strokeStyle = "rgba(108, 43, 217, 0.25)";
    ctx.lineWidth = 1;
    for (const [i, j] of CONNECTIONS) {
      if (landmarks[i] && landmarks[j]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[i][0] * width, landmarks[i][1] * height);
        ctx.lineTo(landmarks[j][0] * width, landmarks[j][1] * height);
        ctx.stroke();
      }
    }

    // Draw key landmark dots
    const keyPoints = [33, 263, 1, 152, 61, 291, 10, 152, 234, 454];
    for (const idx of keyPoints) {
      if (landmarks[idx]) {
        const x = landmarks[idx][0] * width;
        const y = landmarks[idx][1] * height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232, 182, 32, 0.8)";
        ctx.fill();
      }
    }

    // Draw symmetry centerline
    if (landmarks[10] && landmarks[152]) {
      const noseX = landmarks[1][0] * width;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(232, 182, 32, 0.2)";
      ctx.lineWidth = 1;
      ctx.moveTo(noseX, landmarks[10][1] * height);
      ctx.lineTo(noseX, landmarks[152][1] * height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className={`absolute inset-0 pointer-events-none ${className || ""}`}
    />
  );
}
