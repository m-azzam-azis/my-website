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
  const END_DURATION_VH = 200;
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
      name: "Insta",
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

    // FIX: Set perspective on the parent of all 3D-transforming elements
    // The closest common parent is the sticky div containing the canvas-container and bento-grid.
    // In your Svelte template, this is the div with classes "sticky top-0 h-screen w-full..."
    // We'll apply the perspective to the '.canvas-container' since it also holds the text and is a good central scene.
    gsap.set(".scene-container", {
      transformStyle: "preserve-3d",
      perspective: "1000px", // ADDED PERSPECTIVE HERE!
    });
    gsap.set(".canvas-container", {
      transformStyle: "preserve-3d",
      perspective: "1000px", // ADDED PERSPECTIVE HERE!
    });

    // Ensure all 3D elements also preserve 3D space
    gsap.set(".bento-grid, .hero-text", {
      transformStyle: "preserve-3d",
    });

    // APPLY HEADER/HERO TEXT LOGIC (progress 0 to 0.25)
    const heroTextAnimation = (progress) => {
      if (progress <= 0.25) {
        // Z-axis movement: 0 to -500
        const zProgress = progress / 0.25;
        const translateZ = zProgress * -500;

        // Opacity: 1 to 0 between 0.2 and 0.25
        let opacity = 1;
        if (progress >= 0.2) {
          const fadeProgress = Math.min((progress - 0.2) / (0.25 - 0.2), 1);
          opacity = 1 - fadeProgress;
        }

        gsap.set(".hero-text", {
          transform: `translateZ(${translateZ}px)`,
          opacity: opacity,
        });
      } else {
        gsap.set(".hero-text", { opacity: 0 });
      }
    };

    // APPLY HERO IMG/BENTO GRID LOGIC (progress 0.6 to 0.9)
    const bentoGridAnimation = (progress) => {
      // --- Phase 1: APPEAR (Progress 0.5 to 0.7) ---
      if (progress < 0.5) {
        // Initial state (Before animation starts)
        gsap.set(".bento-grid", {
          transform: "translateZ(1000px)", // Far away
          opacity: 0, // Invisible
        });
      } else if (progress >= 0.5 && progress <= 0.7) {
        // Animation to bring it forward (1000px to 0px)
        const appearProgress = (progress - 0.5) / 0.2; // 0 to 1 over the 0.5-0.7 range
        const translateZ = 1000 - appearProgress * 1000; // 1000px down to 0px

        // Opacity FADE IN (0 to 1)
        let opacity = Math.min(appearProgress * 2, 1); // Fades in quickly (0.5 to 0.6)

        gsap.set(".bento-grid", {
          transform: `translateZ(${translateZ}px)`,
          opacity: opacity,
        });
      }
      // --- Phase 2: HOLD (Progress 0.7 to 0.8) ---
      else if (progress > 0.7 && progress <= 0.8) {
        // Stay in the final position
        gsap.set(".bento-grid", {
          transform: "translateZ(0px)",
          opacity: 1,
        });
      }
      // --- Phase 3: DISAPPEAR (Progress 0.8 to 1.0) ---
      else {
        // progress > 0.8
        // Animation to push it away and fade it out
        const disappearProgress = (progress - 0.8) / 0.2; // 0 to 1 over the 0.8-1.0 range
        const translateZ = disappearProgress * -1000; // 0px up to 1000px
        const opacity = 1;

        gsap.set(".bento-grid", {
          transform: `translateZ(${translateZ}px)`,
          opacity: opacity,
        });
      }
    };

    // Update the GSAP animation to use the two new functions
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const totalProgress = self.progress;
          heroTextAnimation(totalProgress);
          bentoGridAnimation(totalProgress);
        },
      },
    });

    // Modified canvas-container animation to remove scale/z change in favor of the bento grid
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
    }, 250);

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
      <div class="text-center overflow-hidden mb-8 ml-8">
        <div class="flex gap-1 text-9xl font-bold w-full h-full p-10">
          <NumberFlow trend={1} value={loadProgress} />
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
        class=" scene-container sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#202020]"
      >
        <div
          class="canvas-container relative w-full h-full overflow-hidden transition-all"
        >
          <canvas
            bind:this={canvasRef}
            class="absolute inset-0 w-full h-full object-cover"
          ></canvas>

          <div
            class="vignette video-overlay absolute inset-0 bg-black opacity-30 pointer-events-none"
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
                  class="bg-emerald-300 hover:bg-emerald-200 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-gray-900 font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 md:gap-3 {cardDecorations}  col-span-1"
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
                class="bg-emerald-700 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center md:col-span-3 {cardDecorations} hover:scale-[1.01]"
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
  .canvas-container {
    transform-origin: center center;
    will-change: transform, border-radius;
  }
</style>
