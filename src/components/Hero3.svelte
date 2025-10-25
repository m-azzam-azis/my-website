<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let containerRef = $state(null);
  let section1Ref = $state(null);
  let section2Ref = $state(null);
  let section3Ref = $state(null);

  const setupScrollAnimations = () => {
    if (!containerRef || !section1Ref || !section2Ref || !section3Ref) return;

    // Section 1 Animation - scales down and rotates as you scroll
    gsap.to(section1Ref, {
      scale: 0.8,
      rotateZ: -5,
      scrollTrigger: {
        trigger: containerRef,
        start: "top top",
        end: "50% top",
        scrub: 1,
        // markers: true, // Uncomment for debugging
      },
    });

    // Section 2 Animation - scales from 0.8 to 1 and rotates back
    gsap.fromTo(
      section2Ref,
      {
        scale: 0.8,
        rotateZ: 5,
      },
      {
        scale: 1,
        rotateZ: 0,
        scrollTrigger: {
          trigger: containerRef,
          start: "top top",
          end: "50% top",
          scrub: 1,
          // markers: true,
        },
      }
    );

    // Section 3 Animation - scales from 0.8 to 1 and rotates back
    gsap.fromTo(
      section3Ref,
      {
        scale: 0.8,
        rotateZ: -5,
      },
      {
        scale: 1,
        rotateZ: 0,
        scrollTrigger: {
          trigger: containerRef,
          start: "50% top",
          end: "100% top",
          scrub: 1,
          // markers: true,
        },
      }
    );
  };

  onMount(() => {
    setupScrollAnimations();

    return () => {
      if (lenis) lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });
</script>

<div bind:this={containerRef} class="relative h-[200vh]">
  <!-- Section 1 -->
  <div
    bind:this={section1Ref}
    class="sticky top-0 h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white"
    style="transform-origin: center center;"
  >
    <div class="text-center">
      <h1 class="text-8xl font-bold mb-4">Hello 1</h1>
      <p class="text-2xl opacity-80">First Section</p>
    </div>
  </div>

  <!-- Section 2 -->
  <div
    bind:this={section2Ref}
    class="sticky top-0 h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"
    style="transform-origin: center center;"
  >
    <div class="text-center">
      <h1 class="text-8xl font-bold mb-4">Hello 2</h1>
      <p class="text-2xl opacity-80">Second Section</p>
    </div>
  </div>

  <!-- Section 3 -->
  <div
    bind:this={section3Ref}
    class="sticky top-0 h-screen bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white"
    style="transform-origin: center center;"
  >
    <div class="text-center">
      <h1 class="text-8xl font-bold mb-4">Hello 3</h1>
      <p class="text-2xl opacity-80">Third Section</p>
    </div>
  </div>
</div>

<style>
  div {
    will-change: transform;
  }
</style>
