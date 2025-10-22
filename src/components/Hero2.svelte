<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Lenis from "@studio-freight/lenis";
  import { Linkedin, Github, Instagram, FileText } from "lucide-svelte";

  gsap.registerPlugin(ScrollTrigger);

  let canvasRef = $state(null);
  let sectionRef = $state(null);
  let containerRef = $state(null);
  let scrollProgress = $state(0);
  let loadProgress = $state(0);
  let isReady = $state(false);
  let loadingComplete = $state(false);
  let animationFinished = $state(false);
  let pageWrapperRef = $state(null);

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
  const END_DURATION_VH = 250;
  const SCROLL_HEIGHT = FRAME_DURATION_VH + END_DURATION_VH;
  const ANIMATION_END_RATIO = FRAME_DURATION_VH / SCROLL_HEIGHT;
  const FRAME_ANIMATION_END = `${ANIMATION_END_RATIO * 100}% top`;
  const FINAL_TRANSITION_START = FRAME_ANIMATION_END;
  const FINAL_TRANSITION_DURATION = SCROLL_HEIGHT - FRAME_DURATION_VH;

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
      name: "instagram",
      icon: Instagram,
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

  // 1. Removed universal hover:scale-[1.01] so individual items can control it.
  const cardDecorations =
    "shadow-lg hover:shadow-xl transition-all duration-300";

  // 2. What I Bring list data
  const whatIBringList = [
    "Building full-stack applications",
    "Designing stunning landing pages & modern UIs",
    "Crafting clean, maintainable, and scalable code",
    "Transforming concepts into powerful digital solutions",
  ];

  function generateLoadingPattern(totalFrames) {
    const maxIndex = totalFrames - 1;
    const priority = [];
    const rest = [];
    const loadedIndices = new Set();

    function addFramesAtLevel(denominator, isPriority) {
      const targetArray = isPriority ? priority : rest;
      const label = `1/${denominator}`;
      for (let numerator = 1; numerator < denominator; numerator += 2) {
        const frameIndex = Math.floor((maxIndex * numerator) / denominator);
        if (
          frameIndex >= 0 &&
          frameIndex < maxIndex &&
          !loadedIndices.has(frameIndex)
        ) {
          targetArray.push({ index: frameIndex, label });
          loadedIndices.add(frameIndex);
        }
      }
    }

    priority.push({ index: 0, label: "first" });
    loadedIndices.add(0);
    priority.push({ index: maxIndex, label: "last" });
    loadedIndices.add(maxIndex);

    addFramesAtLevel(2, true);
    addFramesAtLevel(4, true);
    addFramesAtLevel(8, true);
    addFramesAtLevel(16, true);

    for (let denom = 32; denom <= 256; denom *= 2) {
      addFramesAtLevel(denom, false);
      if (maxIndex / denom < 1) break;
    }

    for (let i = 0; i < totalFrames; i++) {
      if (!loadedIndices.has(i)) {
        rest.push({ index: i, label: "fill" });
      }
    }

    return { priority, rest };
  }

  const loadingPattern = generateLoadingPattern(frameCount);
  const TOTAL_PRIORITY_FRAMES = loadingPattern.priority.length;

  const loadImage = (index, label = "") => {
    return new Promise((resolve) => {
      if (images[index] && (images[index].complete || images[index].loading)) {
        if (images[index].complete) resolve();
        return;
      }

      const img = new Image();
      img.loading = true;
      const imageName = IMAGE_SRC + `${String(index).padStart(6, "0")}.webp`;

      img.onload = () => {
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
          if (imageContext) {
            imageContext.drawImage(
              images[0],
              0,
              0,
              canvasRef.width,
              canvasRef.height
            );
          }
        }

        resolve();
      };

      img.onerror = () => {
        loadedImages++;
        img.loading = false;
        console.error(`Failed to load frame ${index}: ${imageName}`);

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

        resolve();
      };

      img.src = imageName;
      images[index] = img;
    });
  };

  const loadPriorityFrames = async () => {
    const priorityPromises = loadingPattern.priority.map(({ index, label }) =>
      loadImage(index, label)
    );
    await Promise.all(priorityPromises);
  };

  const loadRestFrames = async () => {
    const batchSize = 8;
    for (let i = 0; i < loadingPattern.rest.length; i += batchSize) {
      const batch = loadingPattern.rest.slice(i, i + batchSize);
      Promise.all(
        batch.map(({ index, label }) => loadImage(index, label))
      ).catch((e) => console.error("Batch load failed:", e));
    }
  };

  const setupScrollAnimations = () => {
    if (!sectionRef || !canvasRef) return;

    lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const renderFrame = (index) => {
      const frameIndex = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(index))
      );
      const img = images[frameIndex];

      if (img && img.complete) {
        imageContext.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);
      }
      currentFrame = frameIndex;
    };

    const frameProxy = { current: 0 };

    gsap.to(frameProxy, {
      current: frameCount - 1,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: FRAME_ANIMATION_END,
        scrub: 1,
        onUpdate: (self) => {
          scrollProgress = self.progress;
          renderFrame(frameProxy.current);
        },
      },
    });

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

    gsap.to(".vignette", {
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: FRAME_ANIMATION_END,
        scrub: 1.5,
      },
    });

    gsap.set(".canvas-container", {
      transformStyle: "preserve-3d",
      perspective: "1000px",
    });

    const bentoTimeline = gsap.timeline({ defaults: { ease: "none" } });

    // 1. Quick Appearance:
    bentoTimeline.to(
      ".bento-grid",
      {
        opacity: 1,
        y: 0,
      },
      0.05
    );

    // 2. Hold (Stay visible):
    bentoTimeline.to(
      ".bento-grid",
      {
        opacity: 1,
        y: 0,
      },
      0.75
    );

    // 3. Recede:
    bentoTimeline.to(
      ".bento-grid",
      {
        y: -100,
      },
      1
    );

    ScrollTrigger.create({
      trigger: sectionRef,
      start: `${FINAL_TRANSITION_START}`,
      end: "bottom top",
      scrub: 1.5,
      animation: bentoTimeline,

      onToggle: (self) => {
        if (self.isActive) {
          gsap.set(".bento-grid", { opacity: 0, y: 50 });
        }
      },
    });

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

    renderFrame(0);
    lenis.start();
  };

  onMount(async () => {
    if (!canvasRef) return;
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    imageContext = canvasRef.getContext("2d");
    canvasRef.width = 1920;
    canvasRef.height = 1080;

    const priorityLoadPromise = loadPriorityFrames();
    loadRestFrames();

    const progressProxy = { p: 0 };
    const progressTimer = setInterval(() => {
      const target = actualLoadProgress;

      gsap.to(progressProxy, {
        p: target,
        duration: 0.4,
        ease: "power1.out",
        onUpdate: () => {
          loadProgress = Math.round(progressProxy.p);
        },
      });

      if (loadProgress >= 100 && loadingComplete) {
        clearInterval(progressTimer);
      }
    }, 100);

    await priorityLoadPromise;

    const checkCompletion = setInterval(() => {
      if (loadProgress >= 100 && loadingComplete) {
        clearInterval(checkCompletion);

        if (pageWrapperRef) {
          pageWrapperRef.style.overflow = "";
          pageWrapperRef.style.height = "";
          pageWrapperRef.style.position = "";
          pageWrapperRef.style.width = "";
        }
        document.body.style.overflow = "";
        document.body.style.height = "";

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
    }, 500);

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

  let safeLoadProgress = $derived(Math.min(loadProgress, 100));
  let hundreds = $derived(Math.floor(safeLoadProgress / 100));
  let tens = $derived(Math.floor((safeLoadProgress % 100) / 10));
  let ones = $derived(safeLoadProgress % 10);
</script>

<div
  bind:this={pageWrapperRef}
  class="bg-[#FAF7F0] relative"
  style:overflow={!animationFinished ? "hidden" : ""}
  style:height={!animationFinished ? "100vh" : ""}
  style:position={!animationFinished ? "fixed" : ""}
  style:width={!animationFinished ? "100%" : ""}
  id="main-app-wrapper"
>
  {#if !animationFinished}
    <div
      class="loading-section fixed inset-0 bg-[#FAF7F0] z-50 flex items-center justify-center will-change-transform"
      style="transform: translateY(0);"
    >
      <div class="text-center overflow-hidden mb-8 ml-8" style="height: 120px;">
        <div class="flex gap-1 text-9xl font-bold w-full h-full">
          {#if hundreds > 0}
            <div class="digit-wrapper" style="margin-right: 4px;">
              <div
                class="digit-scroll"
                style="transform: translateY({-hundreds *
                  120}px); transition: transform 10s ease-in-out;"
              >
                {#each [0, 1] as num}
                  <div
                    style="height: 120px; display: flex; align-items: center;"
                  >
                    {num}
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <div class="digit-wrapper" style="margin-right: 4px;">
            <div
              class="digit-scroll"
              style="transform: translateY({-tens *
                120}px); transition: transform 0.15s ease-out;"
            >
              {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as num}
                <div style="height: 120px; display: flex; align-items: center;">
                  {num}
                </div>
              {/each}
            </div>
          </div>

          <div class="digit-wrapper">
            <div
              class="digit-scroll"
              style="transform: translateY({-ones *
                120}px); transition: transform 0.15s ease-out;"
            >
              {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as num}
                <div style="height: 120px; display: flex; align-items: center;">
                  {num}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div bind:this={containerRef}>
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

          <div
            class="video-overlay absolute inset-0 bg-black opacity-30 pointer-events-none"
          ></div>

          <div
            class="vignette absolute inset-0 pointer-events-none opacity-0"
            style="background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)"
          ></div>

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

        <div
          class="bento-grid absolute inset-0 flex items-center justify-center p-3 md:p-6 pointer-events-none opacity-0"
        >
          <div
            class="w-full max-w-7xl max-h-screen space-y-3 md:space-y-4 relative z-10 pointer-events-auto p-3 md:p-0"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div
                class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 {cardDecorations} hover:scale-[1.01] relative overflow-hidden"
              >
                <div
                  class="absolute top-0 right-0 bg-emerald-700 text-white text-xs font-semibold py-1 px-3 rounded-2xl shadow-md animate-pulse mt-6 mr-6"
                >
                  Open for Work
                </div>

                <div
                  class="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl"
                ></div>

                <div
                  class="flex items-start gap-3 md:gap-4 mb-4 md:mb-6 relative z-10"
                >
                  <img
                    src="logo.png"
                    alt="Profile"
                    class="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover shadow-lg"
                  />
                </div>
                <h1
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight relative z-10"
                >
                  {name}
                  <br />
                  is a
                  <span
                    class="text-emerald-700 inline-block transition-transform"
                    >Freelance
                  </span>
                  <span> based in </span>
                  <span
                    class="text-emerald-700 inline-block transition-transform"
                  >
                    Indonesia GMT+7
                  </span>
                  <br />
                </h1>
              </div>

              <!-- only for desktop -->
              <div
                class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 {cardDecorations} hover:scale-[1.01] relative overflow-hidden max-md:hidden"
              >
                <div
                  class="absolute -top-10 -left-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl"
                ></div>

                <h2
                  class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative z-10 flex items-center gap-2"
                >
                  What I Bring
                </h2>
                <ul
                  class="space-y-2 text-base md:text-lg text-gray-700 relative z-10"
                >
                  {#each whatIBringList as item}
                    <li class="flex items-start gap-2">
                      <span
                        class="text-emerald-700 font-bold text-lg leading-none mt-[2px]"
                        >&gt;</span
                      >
                      <span class="leading-relaxed">{item}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            </div>

            <div class="grid grid-cols-5 gap-3 md:gap-4">
              {#each socials as social}
                <a
                  href={social.url}
                  class="bg-emerald-300 hover:bg-emerald-400 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-gray-900 font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 md:gap-3 {cardDecorations}  col-span-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon class="w-4 h-4 md:w-5 md:h-5" />
                  <span class="hidden sm:inline">{social.name}</span>
                </a>
              {/each}
              <a
                href="#resume"
                class="bg-gray-900 hover:bg-gray-700 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-white font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 {cardDecorations} hover:scale-[1.01] col-span-2"
              >
                <FileText class="w-4 h-4 md:w-5 md:h-5" />
                <span class="hidden sm:inline">Resume</span>
                <span class="sm:hidden">CV</span>
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
              <div
                class="bg-amber-50 rounded-2xl md:rounded-3xl p-6 md:p-8 md:col-span-2 {cardDecorations} hover:scale-[1.01]"
              >
                <h3
                  class="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4"
                >
                  Tech Stack
                </h3>
                <div class="flex flex-wrap gap-2">
                  {#each techStack as tech}
                    <span
                      class="px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm lg:text-base font-medium transition-all duration-300 hover:scale-105 bg-emerald-200 text-gray-900"
                    >
                      {tech}
                    </span>
                  {/each}
                </div>
              </div>

              <a
                href={`mailto:${email}`}
                class="bg-emerald-700 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center md:col-span-3 {cardDecorations} hover:scale-[1.01] hover:ring-4 hover:ring-emerald-500/50"
              >
                <h2
                  class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-4 md:mb-6"
                >
                  Have a Project in Mind?
                </h2>
                <span
                  class="bg-white hover:bg-gray-100 transition-colors text-emerald-700 px-6 py-3 md:px-10 md:py-4 rounded-full text-sm md:text-base lg:text-lg font-medium shadow-md hover:shadow-lg"
                >
                  {email}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  :global(body),
  :global(html) {
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .canvas-container {
    transform-origin: center center;
    will-change: transform, border-radius;
  }

  .digit-wrapper {
    overflow: hidden;
    height: 120px;
    display: inline-block;
  }

  .digit-scroll {
    display: flex;
    flex-direction: column;
  }

  .bg-dots-pattern {
    background-image: radial-gradient(currentColor 1px, transparent 1px);
    background-size: 20px 20px;
    color: #fcefd4;
    background-color: #fcfcfc;
  }
</style>
