<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Lenis from "@studio-freight/lenis";
  import NumberFlow from "@number-flow/svelte";
  let { children } = $props();

  gsap.registerPlugin(ScrollTrigger);

  // --- STATE ---
  let loadProgress = $state(0);
  let loadingComplete = $state(false);
  let animationFinished = $state(false); // Controls the display of the loading overlay
  let loadedImages = 0;

  // --- FRAME LOADING CONFIG ---
  // The wrapper will only load a few critical frames to track initial progress.
  const frameCount = 218;
  const IMAGE_SRC = "/bg_photos2/bg_photo_";
  const CRITICAL_FRAMES = [0, Math.floor(frameCount / 2), frameCount - 1]; // First, middle, last
  const TOTAL_CRITICAL_FRAMES = CRITICAL_FRAMES.length;

  // Simple image loader used just for progress tracking
  const loadImage = (index) => {
    return new Promise((resolve) => {
      const img = new Image();
      const imageName = IMAGE_SRC + `${String(index).padStart(6, "0")}.webp`;

      img.onload = () => {
        loadedImages++;
        if (loadedImages >= TOTAL_CRITICAL_FRAMES) {
          loadingComplete = true;
        }
        resolve();
      };
      img.onerror = () => {
        loadedImages++;
        if (loadedImages >= TOTAL_CRITICAL_FRAMES) {
          loadingComplete = true;
        }
        console.error(`Failed to load frame ${index}: ${imageName}`);
        resolve();
      };
      img.src = imageName;
    });
  };

  let lenis = null;

  onMount(async () => {
    // 1. Initial Body Lock
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    // C. Setup Lenis Smooth Scroll
    lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
    });

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

    // 2. Start Loading Critical Frames
    const priorityLoadPromise = Promise.all(
      CRITICAL_FRAMES.map((i) => loadImage(i))
    );

    // 3. Progress Bar Animation
    const progressProxy = { p: 0 };
    const progressTimer = setInterval(() => {
      const target = loadingComplete
        ? 100
        : Math.min(99, Math.round((loadedImages / TOTAL_CRITICAL_FRAMES) * 90));

      gsap.to(progressProxy, {
        p: target,
        duration: 1,
        ease: "power1.out",
        onUpdate: () => {
          loadProgress = Math.round(progressProxy.p);
        },
      });

      if (loadingComplete && loadProgress >= 100) {
        clearInterval(progressTimer);
      }
    }, 250);

    await priorityLoadPromise; // Wait for critical frames to load

    // 4. Check Completion and Start Page
    const checkCompletion = setInterval(() => {
      if (loadProgress >= 100 && loadingComplete) {
        clearInterval(checkCompletion);

        // A. Remove Body Lock
        document.body.style.overflow = "";
        document.body.style.height = "";

        // B. Run Loading Screen Exit Animation
        gsap.to(".loading-section", {
          y: "-100%",
          duration: 1,
          delay: 0.25,
          ease: "power2.inOut",
          onComplete: () => {
            animationFinished = true;
          },
        });
      }
    }, 250);

    // 5. Cleanup
    return () => {
      clearInterval(progressTimer);
      if (checkCompletion) clearInterval(checkCompletion);
      if (lenis) lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  });
</script>

<div class="bg-[#FAF7F0] relative" id="main-app-wrapper">
  <!-- === 1. LOADING OVERLAY === -->
  {#if !animationFinished}
    <div
      class="loading-section fixed inset-0 bg-[#FAF7F0] z-[9999] flex items-center justify-center will-change-transform"
      style="transform: translateY(0);"
    >
      <div class="text-center overflow-hidden mb-8 ml-8">
        <div
          class="flex gap-1 text-9xl font-bold w-full h-full p-10 text-gray-900"
        >
          <NumberFlow trend={1} value={loadProgress} />
        </div>
      </div>
    </div>
  {/if}

  <!-- === 2. SLOTTED CONTENT (Hero2, Hero3, etc. render here) === -->
  <main class="relative z-0">
    {@render children()}
  </main>
</div>
