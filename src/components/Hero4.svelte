<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  let section1;
  let section2;
  let container; // Added a reference for the container for clarity in GSAP triggers

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Fix: Updated GSAP triggers to use the bound 'container' reference
    // and simplified the class-based triggers you had to use the element references.

    // Section 1 animation
    gsap.to(section1, {
      scale: 0.8,
      rotation: -5,
      borderRadius: 32,
      ease: "none",
      scrollTrigger: {
        trigger: container, // Use container for the overall scroll effect
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    // Section 2 animation
    gsap.fromTo(
      section2,
      { scale: 0.8, rotation: 5, borderRadius: 32 },
      {
        scale: 1,
        rotation: 0,
        borderRadius: 0,
        ease: "none",
        scrollTrigger: {
          trigger: container, // Use container for the overall scroll effect
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      }
    );
  });
</script>

<div bind:this={container} class="relative h-[200vh] w-full bg-black m-0">
  <section
    bind:this={section1}
    class="section1 sticky top-0 flex h-screen w-full flex-col items-center justify-center bg-red-700 text-white origin-center"
  >
    <p class="text-[3.5vw] mb-4 font-semibold">Scroll Perspective</p>

    <div class="flex items-center gap-4 text-[3.5vw]">
      <p>Section</p>
      <div class="relative w-[12.5vw] h-[9.375vw] overflow-hidden rounded-md">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
          alt="Mountain landscape"
          class="h-full w-full object-cover"
        />
      </div>
      <p>Transition</p>
    </div>
  </section>

  <section
    bind:this={section2}
    class="section2 sticky top-0 flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white origin-center"
  >
    <div class="text-center p-8">
      <h2 class="text-[4vw] font-bold mb-4">Second Section</h2>
      <p class="text-[1.5vw] opacity-90">
        This section scales up and rotates as you scroll
      </p>
    </div>
  </section>
</div>

<style>
  /* Ensure a clean slate on the body/html */
  :global(body, html) {
    margin: 0;
    padding: 0;
    /* This is also a common fix for rotation issues, but the container fix is more targeted */
    /* overflow-x: hidden; */
  }
</style>
