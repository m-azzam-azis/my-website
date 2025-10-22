import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVideoPlayer() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const lenisRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

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

    // Lenis animation frame
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync Lenis with ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Wait for video metadata to load
    const onLoadedMetadata = () => {
      // GSAP ScrollTrigger for video scrubbing
      gsap.to(video, {
        currentTime: video.duration,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
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
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-black">
      {/* Hero Video Section - Fixed background */}
      <section ref={sectionRef} className="relative h-[1200vh]">
        {/* Fixed video background */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Video as background */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
          >
            <source src="/reversed.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>

          {/* Dark overlay for better text readability */}
          <div className="video-overlay absolute inset-0 bg-black opacity-30" />

          {/* Content over video */}
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
                  {Math.round(scrollProgress * 100)}%
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
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "GSAP ScrollTrigger",
                desc: "Perfect scroll-synced animations with scrub",
              },
              {
                title: "Lenis Smooth Scroll",
                desc: "Buttery smooth momentum scrolling",
              },
              {
                title: "600vh Section",
                desc: "Long scroll distance for detailed viewing",
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
    </div>
  );
}
