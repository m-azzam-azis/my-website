<script lang="ts">
  import { onMount } from "svelte";
  import gsap from "gsap"; // ✅ This must be the actual GSAP object
  import { ScrollTrigger } from "gsap/ScrollTrigger"; // ✅ Named import, not default
  import Lenis from "astro-lenis";

  gsap.registerPlugin(ScrollTrigger);

  let videoEl: HTMLVideoElement;

  onMount(() => {
    // 🌀 Smooth scroll setup
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1, // lower = smoother
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 🔗 GSAP scroll -> video progress
    ScrollTrigger.create({
      trigger: videoEl,
      start: "top top",
      end: "bottom+=2000 top",
      scrub: true,
      onUpdate: (self) => {
        if (videoEl.duration) {
          videoEl.currentTime = self.progress * videoEl.duration;
        }
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenis.destroy();
    };
  });
</script>

<section>
  <video bind:this={videoEl} src="/video.webm" muted playsinline preload="auto"
  ></video>

  <div class="overlay">
    <div>Hello, I’m Azzam — Developer • Designer • Entrepreneur</div>
  </div>
</section>

<style>
  section {
    position: relative;
    height: 200vh; /* allows scroll */
    overflow: hidden;
  }
  video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    z-index: 2;
  }
</style>
