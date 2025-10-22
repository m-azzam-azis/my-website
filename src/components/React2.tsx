import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

export default function ImageVideoPlayer() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const lenisRef = useRef(null);
  const imagesRef = useRef([]);
  const imageContextRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const frameCount = 218; // Total frames: 000001 to 000218
  const currentFrameRef = useRef(1); // Start from frame 1

  // Preload images with priority loading
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    imageContextRef.current = context;

    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;

    const images = [];
    let loadedImages = 0;

    // Priority frames to load first (start, middle, end, and key intervals)
    const priorityFrames = [
      1, // First frame
      Math.floor(frameCount / 4) + 1,
      Math.floor(frameCount / 2) + 1,
      Math.floor((frameCount * 3) / 4) + 1,
      frameCount, // Last frame (218)
    ];

    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedImages++;
          setLoadProgress(Math.round((loadedImages / frameCount) * 100));

          // Once we have priority frames, user can start interacting
          if (priorityFrames.includes(index) && !isReady) {
            const allPriorityLoaded = priorityFrames.every(
              (i) => images[i] !== undefined
            );
            if (allPriorityLoaded) {
              setIsReady(true);
            }
          }

          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load frame ${index}`);
          resolve();
        };
        img.src = `/webp_photos/${String(index).padStart(6, "0")}.webp`;
        images[index] = img;
      });
    };

    // Load priority frames first
    const loadPriorityFrames = async () => {
      await Promise.all(priorityFrames.map((index) => loadImage(index)));

      // Draw first frame immediately
      if (images[1]) {
        context.drawImage(images[1], 0, 0, canvas.width, canvas.height);
      }
    };

    // Load remaining frames in batches
    const loadRemainingFrames = async () => {
      const batchSize = 10;
      const remainingFrames = Array.from(
        { length: frameCount },
        (_, i) => i + 1
      ).filter((i) => !priorityFrames.includes(i));

      for (let i = 0; i < remainingFrames.length; i += batchSize) {
        const batch = remainingFrames.slice(i, i + batchSize);
        await Promise.all(batch.map((index) => loadImage(index)));
      }
    };

    // Start loading
    loadPriorityFrames().then(() => {
      loadRemainingFrames();
    });

    imagesRef.current = images;

    return () => {
      images.forEach((img) => {
        if (img) img.src = "";
      });
    };
  }, [frameCount]);

  // Setup scroll animations once ready
  useEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.5,
      touchMultiplier: 2.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Render frame function
    const renderFrame = (index) => {
      const frameIndex = Math.min(frameCount, Math.max(1, Math.floor(index)));

      if (imagesRef.current[frameIndex]) {
        imageContextRef.current.drawImage(
          imagesRef.current[frameIndex],
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
      currentFrameRef.current = frameIndex;
    };

    // GSAP ScrollTrigger for image scrubbing
    gsap.to(currentFrameRef, {
      current: frameCount,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          renderFrame(currentFrameRef.current);
        },
      },
    });

    // Animate text
    gsap.to(".hero-text", {
      opacity: 0,
      y: -50,
      scale: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "30% top",
        scrub: 1,
      },
    });

    // Animate overlay darkness
    gsap.to(".video-overlay", {
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    // Animate vignette
    gsap.to(".vignette", {
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    // Render initial frame
    renderFrame(1);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isReady, frameCount]);

  return (
    <div ref={containerRef} className="bg-black">
      {/* Loading Screen */}
      {!isReady && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-white text-lg">Loading {loadProgress}%</p>
            <p className="text-white/60 text-sm mt-2">
              {loadProgress < 10
                ? "Preparing experience..."
                : "Almost ready..."}
            </p>
          </div>
        </div>
      )}

      {/* Hero Canvas Section - Fixed background */}
      <section ref={sectionRef} className="relative h-[600vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Canvas as background */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark overlay for better text readability */}
          <div className="video-overlay absolute inset-0 bg-black opacity-30" />

          {/* Content over canvas */}
          <div className="relative h-full flex flex-col items-center justify-center px-4 z-10">
            <div className="hero-text text-center">
              <h1 className="text-7xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
                Muhammad Azzam
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 mb-8 drop-shadow-lg">
                Developer • Designer • Creator
              </p>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-12 left-0 right-0 px-8 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-md rounded-full h-2 overflow-hidden shadow-lg">
                <div
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 h-full transition-all duration-300 ease-out"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-white/90 text-sm font-medium drop-shadow">
                  {Math.round(scrollProgress * 100)}% • Frame{" "}
                  {currentFrameRef.current}/{frameCount}
                </span>
              </div>
            </div>
          </div>

          {/* Animated vignette effect */}
          <div
            className="vignette absolute inset-0 pointer-events-none opacity-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
            }}
          />
        </div>
      </section>

      {/* Next Section */}
      <section className="relative min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900">
        <div className="max-w-6xl mx-auto px-4 py-32">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ultra Smooth Experience
            </h2>
            <p className="text-xl md:text-2xl text-purple-200">
              Powered by GSAP ScrollTrigger + Lenis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "Image Sequence",
                desc: "Frame-by-frame precision with instant loading",
              },
              {
                title: "Lenis Smooth Scroll",
                desc: "Buttery smooth momentum scrolling",
              },
              {
                title: "Smart Preloading",
                desc: "Priority frames load first for instant interaction",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl mb-6 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-purple-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="min-h-screen bg-gradient-to-b from-indigo-900 to-black flex items-center justify-center">
        <div className="text-center px-4">
          <h3 className="text-5xl font-bold text-white mb-6">Scroll Back Up</h3>
          <p className="text-xl text-indigo-300 mb-8">
            Feel the smoothness in both directions
          </p>
          <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300">
            <svg
              className="w-10 h-10 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
