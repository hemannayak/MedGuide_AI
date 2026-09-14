"use client";

import React, { useEffect, useRef, useState } from "react";

interface ParticleTextProps {
  text: string;
  className?: string;
  particleColor?: string;
  backgroundColor?: string;
}

export const ParticleText: React.FC<ParticleTextProps> = ({
  text,
  className = "",
  particleColor = "#1C1917",
  backgroundColor = "transparent",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLowPower] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isLowPower) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = Math.min(200, window.innerHeight * 0.25));

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.min(200, window.innerHeight * 0.25);
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${Math.min(width / (text.length * 0.65), 64)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width / 2, height / 2);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const step = 4;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 128) {
            particles.push({
              x: x + (Math.random() - 0.5) * 15,
              y: y + (Math.random() - 0.5) * 15,
              originX: x,
              originY: y,
              vx: (Math.random() - 0.5) * 0.4,
              vy: (Math.random() - 0.5) * 0.4,
              size: Math.random() * 1.6 + 1,
              color: particleColor,
              alpha: Math.random() * 0.6 + 0.4,
            });
          }
        }
      }
    };

    initParticles();

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        const dx = p.originX - p.x;
        const dy = p.originY - p.y;
        p.vx += dx * 0.03;
        p.vy += dy * 0.03;

        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text, particleColor, backgroundColor]);

  if (isLowPower) {
    return (
      <div className={`py-6 text-center font-black tracking-tight text-[#0F766E] ${className}`}>
        {text}
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} className="block w-full max-w-4xl mx-auto" />
      <span className="sr-only">{text}</span>
    </div>
  );
};
