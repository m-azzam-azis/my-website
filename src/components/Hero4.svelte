<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Lenis from "@studio-freight/lenis";

  // Component Imports
  import LoadingScreen from "./Hero/LoadingScreen.svelte";
  import BentoGrid from "./Hero/BentoGrid.svelte";

  gsap.registerPlugin(ScrollTrigger);

  // === DOM Element Refs ===
  let canvasRef = $state(null);
  let sectionRef = $state(null);
  let pageWrapperRef = $state(null);

  // === Loading and Scroll State ===
  let loadProgress = $state(0);
  let loadingComplete = $state(false);
  let animationFinished = $state(false);

  // === Image/Frame Constants and State ===
  const frameCount = 218;
  const IMAGE_SRC = "/bg_photos2/bg_photo_"; // Source path for the image sequence

  let images = [];
  let imageContext = null;
  let lenis = null;
  let isReady = $state(false);

  let loadedImages = 0;
  let priorityFramesLoaded = 0;
  let actualLoadProgress = 0;

  // === Scroll Animation Constants ===
  const FRAME_DURATION_VH = 350;
  const END_DURATION_VH = 200;
  const SCROLL_HEIGHT = FRAME_DURATION_VH + END_DURATION_VH;
  const ANIMATION_END_RATIO = FRAME_DURATION_VH / SCROLL_HEIGHT;
  const FRAME_ANIMATION_END = `${ANIMATION_END_RATIO * 100}% top`;
  const FINAL_TRANSITION_START = FRAME_ANIMATION_END;

  // === Frame Loading Logic ===

  /**
   * Generates a pattern to load frames: first/last, then priority (1/2, 1/4, 1/8, 1/16), then the rest.
   * This is crucial for smooth initial display and animation.
   */
  function generateLoadingPattern(totalFrames) {
    const maxIndex = totalFrames - 1;
    const priority = [];
    const rest = [];
    const loadedIndices = new Set();

    function addFramesAtLevel(denominator, isPriority) {
      const targetArray = isPriority ? priority : rest;
      for (let numerator = 1; numerator < denominator; numerator += 2) {
        const frameIndex = Math.floor((maxIndex * numerator) / denominator);
        if (!loadedIndices.has(frameIndex)) {
          targetArray.push({ index: frameIndex });
          loadedIndices.add(frameIndex);
        }
      }
    }

    priority.push({ index: 0 });
    loadedIndices.add(0);
    priority.push({ index: maxIndex });
    loadedIndices.add(maxIndex);

    // High Priority
    addFramesAtLevel(2, true);
    addFramesAtLevel(4, true);
    addFramesAtLevel(8, true);
    addFramesAtLevel(16, true);

    // Lower Priority (Rest)
    for (let denom = 32; denom <= 256; denom *= 2) {
      addFramesAtLevel(denom, false);
      if (maxIndex / denom < 1) break;
    }

    // Fill in the gaps
    for (let i = 0; i < totalFrames; i++) {
      if (!loadedIndices.has(i)) {
        rest.push({ index: i });
      }
    }
    return { priority, rest };
  }

  const loadingPattern = generateLoadingPattern(frameCount);
  const TOTAL_PRIORITY_FRAMES = loadingPattern.priority.length;

  /** Loads a single image and updates loading state. */
  const loadImage = (index) => {
    return new Promise((resolve) => {
      // Check if image is already loading or complete
      if (images[index] && (images[index].complete || images[index].loading)) {
        if (images[index].complete) resolve();
        return;
      }

      const img = new Image();
      img.loading = true;
      const imageName = IMAGE_SRC + `${String(index).padStart(6, "0")}.webp`;

      const updateProgress = () => {
        loadedImages++;
        img.loading = false;
        const isPriority = loadingPattern.priority.some(
          (p) => p.index === index
        );

        if (isPriority) {
          priorityFramesLoaded++;
          actualLoadProgress = Math.round(
            (priorityFramesLoaded / TOTAL_PRIORITY_FRAMES) * 100
          );
        }

        if (priorityFramesLoaded === TOTAL_PRIORITY_FRAMES) {
          loadingComplete = true;
        }

        if (index === 0 && !isReady) {
          isReady = true;
          // Initial draw of the first frame
          if (imageContext) {
            imageContext.drawImage(
              img,
              0,
              0,
              canvasRef.width,
              canvasRef.height
            );
          }
        }
        resolve();
      };

      img.onload = updateProgress;
      img.onerror = () => {
        console.error(`Failed to load frame ${index}: ${imageName}`);
        updateProgress(); // Treat load failure as completion for progress calculation
      };

      img.src = imageName;
      images[index] = img;
    });
  };

  const loadPriorityFrames = async () => {
    const priorityPromises = loadingPattern.priority.map(({ index }) =>
      loadImage(index)
    );
    await Promise.all(priorityPromises);
  };

  const loadRestFrames = async () => {
    const batchSize = 8;
    for (let i = 0; i < loadingPattern.rest.length; i += batchSize) {
      const batch = loadingPattern.rest.slice(i, i + batchSize);
      Promise.all(batch.map(({ index }) => loadImage(index))).catch((e) =>
        console.error("Batch load failed:", e)
      );
    }
  };

  // === Scroll Animation Setup ===

  const setupScrollAnimations = () => {
    if (!sectionRef || !canvasRef) return;

    // 1. Lenis Smooth Scrolling
    lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    lenis.stop(); // Keep scroll disabled until GSAP/Lenis are ready
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Canvas Frame Renderer
    const renderFrame = (index) => {
      const frameIndex = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(index))
      );
      const img = images[frameIndex];

      // Draw frame only if loaded
      if (img && img.complete && imageContext) {
        imageContext.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);
      }
    };

    const frameProxy = { current: 0 };

    // ScrollTrigger for Canvas Image Sequence
    gsap.to(frameProxy, {
      current: frameCount - 1,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: FRAME_ANIMATION_END,
        scrub: 1,
        onUpdate: (self) => {
          renderFrame(frameProxy.current);
        },
      },
    });

    // ScrollTriggers for Hero Text and Visual Effects
    gsap.to(".hero-text", {
      opacity: 0,
      y: -50,
      scale: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: "30% top",
        scrub: 1.5,
      },
    });

    gsap.to(".video-overlay", {
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: FRAME_ANIMATION_END,
        scrub: 1.5,
      },
    });

    // 3. Bento Grid & Canvas Transition
    gsap.set(".canvas-container", {
      transformStyle: "preserve-3d",
      perspective: "1000px",
    });

    gsap.set(".bento-grid", {
      transformStyle: "preserve-3d",
      transformOrigin: "center center",
    });

    const bentoTimeline = gsap.timeline({ defaults: { ease: "none" } });

    bentoTimeline.to(".bento-grid", { opacity: 1, y: 0 }, 0.05); // Quick Appearance
    bentoTimeline.to(".bento-grid", { opacity: 1, y: 0 }, 0.75); // Hold
    bentoTimeline.to(
      ".bento-grid",
      {
        y: -100,
        z: -500, // DRAMATICALLY moves away from the screen
        rotationX: -10, // Slight upward tilt as it recedes
        scale: 0.5, // Shrink significantly as it goes into the distance
        opacity: 0, // Fade out completely
      },
      1
    );

    ScrollTrigger.create({
      trigger: sectionRef,
      start: `${FINAL_TRANSITION_START}`,
      end: "bottom top",
      scrub: 1.5,
      animation: bentoTimeline,
      // Initial state is applied before the trigger starts
      onToggle: (self) => {
        if (self.isActive) {
          // --- MODIFIED INITIAL STATE ---
          gsap.set(".bento-grid", {
            opacity: 0,
            y: 50,
            z: 50, // Pushes it slightly toward the viewer at the start of the transition
          });
        }
      },
    });

    // Canvas Container Shrink/3D effect
    gsap.to(".canvas-container", {
      scale: 0.9,
      z: -100,
      y: -50,
      borderRadius: "32px",
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: sectionRef,
        start: FINAL_TRANSITION_START,
        end: "bottom top",
        scrub: 1.5,
      },
    });

    // Initial render and enable scrolling
    renderFrame(0);
    lenis.start();
  };

  // === Mount Logic (Loading and Init) ===

  onMount(async () => {
    if (!canvasRef) return;

    // Initial body lock to prevent premature scrolling
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    imageContext = canvasRef.getContext("2d");
    // Set canvas resolution for crisp images (16:9 ratio)
    canvasRef.width = 1920;
    canvasRef.height = 1080;

    // Start priority loading and background loading
    const priorityLoadPromise = loadPriorityFrames();
    loadRestFrames();

    // Smoother loading bar progress
    const progressProxy = { p: 0 };
    const progressTimer = setInterval(() => {
      const target = actualLoadProgress;

      gsap.to(progressProxy, {
        p: target,
        duration: 1,
        ease: "power1.out",
        onUpdate: () => {
          loadProgress = Math.round(progressProxy.p);
        },
      });

      if (loadProgress >= 100 && loadingComplete) {
        clearInterval(progressTimer);
      }
    }, 250);

    // Wait for critical frames to load
    await priorityLoadPromise;

    // Check for load completion and animate exit
    const checkCompletion = setInterval(() => {
      if (loadProgress >= 100 && loadingComplete) {
        clearInterval(checkCompletion);

        // Unlock body scroll and remove fixed styling
        if (pageWrapperRef) {
          pageWrapperRef.style.overflow = "";
          pageWrapperRef.style.height = "";
          pageWrapperRef.style.position = "";
          pageWrapperRef.style.width = "";
        }
        document.body.style.overflow = "";
        document.body.style.height = "";

        // Animate the loading screen out
        gsap.to(".loading-section", {
          y: "-100%",
          duration: 1,
          delay: 0.25,
          ease: "power2.inOut",
          onComplete: () => {
            animationFinished = true;
            setupScrollAnimations();
          },
        });
      }
    }, 250);

    // Cleanup function
    return () => {
      clearInterval(progressTimer);
      if (checkCompletion) clearInterval(checkCompletion);
      if (lenis) lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      images.forEach((img) => {
        if (img) img.src = "";
      });
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  });
</script>

<section
  bind:this={pageWrapperRef}
  class="bg-[#FAF7F0] relative"
  style:overflow={!animationFinished ? "hidden" : ""}
  style:height={!animationFinished ? "100vh" : ""}
  style:position={!animationFinished ? "fixed" : ""}
  style:width={!animationFinished ? "100%" : ""}
  id="main-app-wrapper"
>
  <!-- Loading screen -->
  <LoadingScreen bind:loadProgress bind:animationFinished />

  <div>
    <section
      bind:this={sectionRef}
      class="relative"
      style="height: {SCROLL_HEIGHT}vh;"
    >
      <div
        class="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#202020]"
      >
        <div
          class="canvas-container relative w-full h-full overflow-hidden transition-all"
        >
          <canvas
            bind:this={canvasRef}
            class="absolute inset-0 w-full h-full object-cover"
          ></canvas>

          <!-- Video black overlay -->
          <div
            class="vignette video-overlay absolute inset-0 bg-black opacity-30 pointer-events-none"
          ></div>
          <div
            class="vignette absolute inset-0 pointer-events-none opacity-0"
            style="background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)"
          ></div>

          <!-- Hero text -->
          <div
            class="hero-text absolute inset-0 flex flex-col items-center justify-center px-4 z-10 pointer-events-none"
          >
            <div class="text-center">
              <h1
                class="text-7xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl"
              >
                Muhammad Azzam
              </h1>
              <p class="text-2xl md:text-3xl text-white/90 mb-8 drop-shadow-lg">
                Developer • Designer • Creator
              </p>
            </div>
          </div>
        </div>

        <!-- Bento Grid Overlay -->
        <BentoGrid />
      </div>
    </section>
  </div>
</section>

<style>
  .canvas-container {
    transform-origin: center center;
    will-change: transform, border-radius;
  }
</style>
