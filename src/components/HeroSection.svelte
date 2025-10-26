<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { Linkedin, Github, FileText, InstagramIcon } from "lucide-svelte";

  gsap.registerPlugin(ScrollTrigger);

  let canvasRef = $state(null);
  let sectionRef = $state(null);
  let scrollProgress = $state(0);

  // --- CONFIG ---
  const frameCount = 218;
  const IMAGE_SRC = "/bg_photos2/bg_photo_";
  const FRAME_DURATION_VH = 350;
  const END_DURATION_VH = 200;
  const SCROLL_HEIGHT = FRAME_DURATION_VH + END_DURATION_VH;
  const ANIMATION_END_RATIO = FRAME_DURATION_VH / SCROLL_HEIGHT;
  const FRAME_ANIMATION_END = `${ANIMATION_END_RATIO * 100}% top`;

  let currentFrame = $state(0);
  let images = [];
  let imageContext = null;

  // --- IMAGE LOADING (Full Set, started in background after mount) ---
  let loadingInitiated = false;

  const loadImage = (index) => {
    return new Promise((resolve) => {
      // Skip if already loaded (critical frames loaded by Wrapper)
      if (images[index] && images[index].complete) {
        resolve();
        return;
      }

      const img = new Image();
      const imageName = IMAGE_SRC + `${String(index).padStart(6, "0")}.webp`;

      img.onload = () => {
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load frame ${index}: ${imageName}`);
        resolve();
      };

      img.src = imageName;
      images[index] = img;
    });
  };

  const loadAllFrames = () => {
    if (loadingInitiated) return;
    loadingInitiated = true;
    for (let i = 0; i < frameCount; i++) {
      // Start loading the rest of the frames in the background
      loadImage(i);
    }
  };

  // --- FIX: DRAW INITIAL FRAME IMMEDIATELY ---
  const drawInitialFrame = () => {
    if (!canvasRef || !imageContext) return;

    // We rely on frame 0 being pre-loaded/cached by the Wrapper.
    const img = new Image();
    const frameZeroSrc = IMAGE_SRC + `000000.webp`;

    // If the image is already in the cache (most likely)
    if (img.complete) {
      imageContext.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);
      images[0] = img; // Store for GSAP
    } else {
      // Fallback: draw when loaded
      img.onload = () => {
        imageContext.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);
        images[0] = img; // Store for GSAP
      };
      img.onerror = () => {
        // In case of error, the canvas will remain black, but we logged it.
        console.warn("Error loading frame 0. Black background visible.");
      };
    }
    // Set source. If cached, onload fires immediately.
    img.src = frameZeroSrc;
  };

  // --- SCROLL ANIMATIONS ---
  const setupScrollAnimations = () => {
    if (!sectionRef || !canvasRef) return;

    loadAllFrames(); // Start loading all frames in background

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

    // 1. Frame Animation
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

    // 2. 3D Setup
    gsap.set(".scene-container, .canvas-container", {
      transformStyle: "preserve-3d",
      perspective: "1000px",
    });
    gsap.set(" .bento-grid, .hero-text", {
      transformStyle: "preserve-3d",
    });

    // 3. Text and Bento Animations
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

    const bentoGridAnimation = (progress) => {
      /* ... (same logic) ... */
      if (progress < 0.5) {
        gsap.set(".bento-grid", {
          transform: "translateZ(1000px)",
          opacity: 0,
        });
      } else if (progress >= 0.5 && progress <= 0.7) {
        const appearProgress = (progress - 0.5) / 0.2;
        const translateZ = 1000 - appearProgress * 1000;
        let opacity = Math.min(appearProgress * 2, 1);
        gsap.set(".bento-grid", {
          transform: `translateZ(${translateZ}px)`,
          opacity: opacity,
        });
      } else if (progress > 0.7) {
        gsap.set(".bento-grid", { transform: "translateZ(0px)", opacity: 1 });
      }
    };

    gsap.timeline({
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

    renderFrame(0);
  };

  onMount(() => {
    if (!canvasRef) return;

    // 1. Canvas Setup
    imageContext = canvasRef.getContext("2d");
    canvasRef.width = 1920;
    canvasRef.height = 1080;

    // 2. FIX: Draw the first frame immediately to cover the black background.
    drawInitialFrame();

    // 3. Start Scroll Animation setup after delay
    setTimeout(() => {
      setupScrollAnimations();
    }, 1500);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      images.forEach((img) => {
        if (img) img.src = "";
      });
    };
  });

  // Bento Grid Data (moved here)
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
  const cardDecorations =
    "shadow-lg hover:shadow-xl transition-all duration-300";
  const whatIBringList = [
    "Building full-stack applications",
    "Designing stunning landing pages & modern UIs",
    "Crafting clean, maintainable, and scalable code",
    "Transforming concepts into powerful digital solutions",
  ];
</script>

<section
  bind:this={sectionRef}
  class="relative"
  style="height: {SCROLL_HEIGHT}vh;"
>
  <div
    class="scene-container sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#202020]"
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
            class="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl"
          >
            Muhammad Azzam
          </h1>
          <p class="text-lg md:text-3xl text-white/90 mb-8 drop-shadow-lg">
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
              <span class="text-emerald-700 inline-block transition-transform"
                >Freelance
              </span>
              <span> based in </span>
              <span class="text-emerald-700 inline-block transition-transform">
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
            href="https://drive.google.com/drive/folders/1ESBDTO5NwG0X1pLbpH2op6-Ga-EIpESk?usp=sharing"
            target="_blank"
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

<style>
  .canvas-container {
    transform-origin: center center;
    will-change: transform, border-radius;
  }
</style>
