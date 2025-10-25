<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Lenis from "@studio-freight/lenis";
  import NumberFlow from "@number-flow/svelte";
  import { Linkedin, Github, FileText, InstagramIcon } from "lucide-svelte";

  gsap.registerPlugin(ScrollTrigger);

  let canvasRef = $state(null);
  let sectionRef = $state(null);
  let containerRef = $state(null);
  let pageWrapperRef = $state(null);

  let scrollProgress = $state(0);
  let loadProgress = $state(0);
  let isReady = $state(false);
  let loadingComplete = $state(false);
  let animationFinished = $state(false);

  const frameCount = 218;
  const IMAGE_SRC = "/bg_photos2/bg_photo_";

  let currentFrame = $state(0);
  let images = [];
  let imageContext = null;
  let lenis = null;

  let loadedImages = 0;
  let priorityFramesLoaded = 0;
  let actualLoadProgress = 0;

  const FRAME_DURATION_VH = 350;
  const END_DURATION_VH = 200;
  const FINAL_OVERLAY_VH = 100;
  const SCROLL_HEIGHT = FRAME_DURATION_VH + END_DURATION_VH + FINAL_OVERLAY_VH;

  // Bento Grid Data
  const name = "Azzam";
  const email = "m.azzam.azis@gmail.com";

  const socials = [
    {
      name: "linkedin",
      icon: Linkedin,
      url: "https://www.linkedin.com/in/m-azzam-azis/",
    },
    { name: "github", icon: Github, url: "https://github.com/m-azzam-azis" },
    {
      name: "insta",
      icon: InstagramIcon,
      url: "https://www.instagram.com/m.azzam.azis/",
    },
  ];

  const techStack = [
    "React",
    "Svelte",
    "Node.js",
    "Tailwind",
    "Figma",
    "Python",
    "and many more...",
  ];
  const whatIBringList = [
    "Building full-stack applications",
    "Designing stunning landing pages & modern UIs",
    "Crafting clean, maintainable, and scalable code",
    "Transforming concepts into powerful digital solutions",
  ];

  const cardDecorations =
    "shadow-lg hover:shadow-xl transition-all duration-300";

  // Loading pattern for image sequence
  function generateLoadingPattern(totalFrames) {
    const maxIndex = totalFrames - 1;
    const priority = [];
    const rest = [];
    const loadedIndices = new Set();

    const addFramesAtLevel = (denominator, isPriority) => {
      const target = isPriority ? priority : rest;
      for (let i = 1; i < denominator; i += 2) {
        const idx = Math.floor((maxIndex * i) / denominator);
        if (!loadedIndices.has(idx)) {
          target.push({ index: idx });
          loadedIndices.add(idx);
        }
      }
    };

    priority.push({ index: 0 });
    priority.push({ index: maxIndex });
    loadedIndices.add(0);
    loadedIndices.add(maxIndex);
    addFramesAtLevel(2, true);
    addFramesAtLevel(4, true);
    addFramesAtLevel(8, true);
    addFramesAtLevel(16, true);

    for (let i = 0; i < totalFrames; i++) {
      if (!loadedIndices.has(i)) rest.push({ index: i });
    }

    return { priority, rest };
  }

  const loadingPattern = generateLoadingPattern(frameCount);
  const TOTAL_PRIORITY_FRAMES = loadingPattern.priority.length;

  const loadImage = (index) =>
    new Promise((resolve) => {
      const img = new Image();
      const src = `${IMAGE_SRC}${String(index).padStart(6, "0")}.webp`;
      img.onload = () => {
        loadedImages++;
        const isPriority = loadingPattern.priority.some(
          (p) => p.index === index
        );
        if (isPriority) {
          priorityFramesLoaded++;
          actualLoadProgress = Math.round(
            (priorityFramesLoaded / TOTAL_PRIORITY_FRAMES) * 100
          );
        }
        if (priorityFramesLoaded === TOTAL_PRIORITY_FRAMES)
          loadingComplete = true;
        resolve();
      };
      img.onerror = resolve;
      img.src = src;
      images[index] = img;
    });

  const loadPriorityFrames = async () => {
    await Promise.all(
      loadingPattern.priority.map(({ index }) => loadImage(index))
    );
  };

  const setupScrollAnimations = () => {
    lenis = new Lenis({ duration: 1.2 });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    const frameProxy = { current: 0 };
    const renderFrame = (index) => {
      const frame = Math.floor(index);
      const img = images[frame];
      if (img && img.complete)
        imageContext.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);
    };

    gsap.to(frameProxy, {
      current: frameCount - 1,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: `${FRAME_DURATION_VH}vh top`,
        scrub: true,
        onUpdate: (self) => {
          scrollProgress = self.progress;
          renderFrame(frameProxy.current);
        },
      },
    });

    // NEW SECTION FADE OVER
    gsap.to(".next-section", {
      yPercent: -100,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef,
        start: `${FRAME_DURATION_VH}vh top`,
        end: `${SCROLL_HEIGHT}vh top`,
        scrub: true,
        pinSpacing: false,
      },
    });

    renderFrame(0);
  };

  onMount(async () => {
    imageContext = canvasRef.getContext("2d");
    canvasRef.width = 1920;
    canvasRef.height = 1080;
    document.body.style.overflow = "hidden";

    await loadPriorityFrames();

    const progressInterval = setInterval(() => {
      loadProgress = Math.round(actualLoadProgress);
      if (loadProgress >= 100 && loadingComplete) {
        clearInterval(progressInterval);
        gsap.to(".loading-section", {
          y: "-100%",
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            animationFinished = true;
            setupScrollAnimations();
          },
        });
      }
    }, 200);
  });
</script>

<!-- ================= PAGE ================= -->
<div
  bind:this={pageWrapperRef}
  class="bg-[#FAF7F0] relative"
  style:overflow={!animationFinished ? "hidden" : ""}
  style:height={!animationFinished ? "100vh" : ""}
  style:position={!animationFinished ? "fixed" : ""}
  style:width={!animationFinished ? "100%" : ""}
>
  <!-- LOADING SCREEN -->
  {#if !animationFinished}
    <div
      class="loading-section fixed inset-0 bg-[#FAF7F0] z-50 flex items-center justify-center"
    >
      <div class="text-center">
        <NumberFlow trend={1} value={loadProgress} class="text-8xl font-bold" />
      </div>
    </div>
  {/if}

  <!-- MAIN CANVAS SECTION -->
  <section
    bind:this={sectionRef}
    class="relative"
    style="height: {SCROLL_HEIGHT}vh;"
  >
    <div
      class="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black"
    >
      <div class="relative w-full h-full overflow-hidden">
        <canvas
          bind:this={canvasRef}
          class="absolute inset-0 w-full h-full object-cover"
        ></canvas>

        <div
          class="hero-text absolute inset-0 flex flex-col items-center justify-center z-10"
        >
          <h1 class="text-6xl font-bold text-white drop-shadow-2xl">
            Muhammad Azzam
          </h1>
          <p class="text-2xl text-white/90 mt-3">
            Developer • Designer • Creator
          </p>
        </div>

        <div
          class="bento-grid absolute inset-0 flex items-center justify-center opacity-0"
        ></div>
      </div>
    </div>
  </section>

  <!-- NEW SECTION (slides up over hero) -->
  <section
    class="next-section h-screen bg-[#FAF7F0] flex items-center justify-center text-gray-900 text-6xl font-bold"
  >
    <div class="p-8 text-center leading-tight">
      <p>Welcome to the Next Section ✨</p>
      <p class="text-2xl mt-4">
        This slides up and covers the hero section smoothly.
      </p>
    </div>
  </section>
</div>

<style>
  .next-section {
    position: relative;
    z-index: 20;
  }

  .sticky {
    position: sticky;
  }

  canvas {
    object-fit: cover;
  }
</style>
