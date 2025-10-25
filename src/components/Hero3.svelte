<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Icon from "@iconify/svelte";

  // State for element references (like useRef in React)
  let containerRef = $state(null);
  let section1Ref = $state(null);
  let section2Ref = $state(null);
  let section3Ref = $state(null);

  // --- Positioning Logic ---
  const getIconPositionClasses = (position) => {
    // All icons MUST have 'absolute' to be positioned
    const baseClasses =
      "absolute flex flex-col items-center group transition-transform duration-500 hover:z-20 hover:scale-[1.2] cursor-pointer";

    // Detailed positions for a circling, slightly scattered effect
    const positionClasses = {
      "top-left": "top-[14%] left-[8%] -rotate-6",
      "top-right": "top-[12%] right-[10%] rotate-8",
      "bottom-left": "bottom-[12%] left-[10%] rotate-4",
      "bottom-right": "bottom-[14%] right-[8%] -rotate-10",
      top: "top-[10%] left-[50%] right-[50%]",
      bottom: "bottom-[10%] left-[50%] right-[50%] ",
    };

    return `${baseClasses} ${positionClasses[position] || ""}`;
  };

  // --- Data Definitions (Updated with New Colors) ---
  const frontendTech = [
    {
      label: "Astro",
      position: "top-left",
      color: `text-[#1F2937]`,
      icon: "devicon:astro",
    },
    {
      label: "Next.js",
      position: "top-right",
      color: `text-[#1F2937]`,
      icon: "devicon:nextjs",
    },
    {
      label: "Svelte",
      position: "bottom-left",
      color: `text-[#1F2937]`,
      icon: "devicon:svelte",
    },
    {
      label: "Tailwind",
      position: "bottom-right",
      color: `text-[#1F2937]`,
      icon: "skill-icons:tailwindcss-light",
    },
    {
      label: "GSAP",
      position: "bottom",
      color: `text-[#1F2937]`,
      icon: "simple-icons:gsap",
    },
    {
      label: "Three.js",
      position: "top",
      color: `text-[#1F2937]`,
      icon: "devicon:threejs",
    },
  ];

  const backendTech = [
    {
      label: "Node.js",
      position: "top-left",
      color: `text-[#FAF7F0]`,
      icon: "material-icon-theme:nodejs",
    },
    {
      label: "Supabase",
      position: "top-right",
      color: `text-[#FAF7F0]`,
      icon: "devicon:supabase",
    },
    {
      label: "Django",
      position: "bottom-left",
      color: `text-[#FAF7F0]`,
      icon: "skill-icons:django",
    },
    {
      label: "Stripe",
      position: "bottom-right",
      color: `text-[#FAF7F0]`,
      icon: "logos:stripe",
    },
    {
      label: "Prisma",
      position: "bottom",
      color: `text-[#FAF7F0]`,
      icon: "skill-icons:prisma",
    },
    {
      label: "Springboot",
      position: "top",
      color: `text-[#FAF7F0]`,
      icon: "logos:spring-icon",
    },
  ];

  const designTech = [
    {
      label: "Figma",
      position: "top-left",
      color: `text-[#1F2937]`,
      icon: "devicon:figma",
    },
    {
      label: "Photoshop",
      position: "top-right",
      color: `text-[#1F2937]`,
      icon: "devicon:photoshop",
    },
    {
      label: "Illustrator",
      position: "bottom-left",
      color: `text-[#1F2937]`,
      icon: "devicon:illustrator",
    },
    {
      label: "Canva",
      position: "bottom-right",
      color: `text-[#1F2937]`,
      icon: "devicon:canva",
    }, // Used canva icon as placeholder for Procreate
  ];

  // --- GSAP ScrollTrigger Logic ---
  onMount(() => {
    // Check if the necessary elements are bound
    if (!containerRef || !section1Ref || !section2Ref || !section3Ref) return;

    gsap.registerPlugin(ScrollTrigger);

    // Section 1 animation: Shrink and rotate as user scrolls
    gsap.to(section1Ref, {
      scale: 0.9,
      rotation: -3,
      borderRadius: 24,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef,
        start: "top top",
        end: "50% bottom",
        scrub: true,
      },
    });

    // Section 2 animation: Starts small/rotated, grows, then shrinks again
    const section2Timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    section2Timeline
      .fromTo(
        section2Ref,
        { scale: 0.85, rotation: 3, borderRadius: 24 },
        { scale: 1, rotation: 0, borderRadius: 0, ease: "none", duration: 1 }
      )
      .to(section2Ref, {
        scale: 0.9,
        rotation: -3,
        borderRadius: 24,
        ease: "none",
        duration: 2,
      });

    // Section 3 animation: Starts small/rotated and grows to fill the screen
    gsap.fromTo(
      section3Ref,
      { scale: 0.85, rotation: 3, borderRadius: 24 },
      {
        scale: 1,
        rotation: 0,
        borderRadius: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef,
          start: "50% bottom",
          end: "bottom bottom",
          scrub: true,
        },
      }
    );

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });
</script>

<div
  bind:this={containerRef}
  class={`relative h-[300vh] w-full m-0 bg-[#332421] font-sans`}
>
  <section
    bind:this={section1Ref}
    class={`section1 sticky top-0 flex h-screen w-full items-center justify-center bg-[#E6E4D9] overflow-hidden shadow-2xl origin-center border border-gray-200`}
    style={`box-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px #E6E4D9;`}
  >
    <h1
      class={`text-[10vw] font-extrabold text-[#0E5C45] uppercase tracking-[0.3em] z-10 drop-shadow-lg`}
    >
      Frontend
    </h1>

    <div class="absolute inset-0 z-0">
      {#each frontendTech as tech (tech.label)}
        <div class={getIconPositionClasses(tech.position)}>
          <Icon
            icon={tech.icon}
            width="64"
            height="64"
            class={`${tech.color} w-16 h-16 lg:size-20 group-hover:drop-shadow-xl`}
          />
          <span
            class={`text-sm font-semibold mt-1 text-[#1F2937] opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
          >
            {tech.label}
          </span>
        </div>
      {/each}
    </div>
  </section>

  <section
    bind:this={section2Ref}
    class={`section2 sticky top-0 flex h-screen w-full items-center justify-center bg-[#1E2a56] overflow-hidden shadow-2xl origin-center  `}
    style={`box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px #13795B;`}
  >
    <h1
      class={`text-[10vw] font-extrabold text-[#FAF7F0] uppercase tracking-[0.3em] z-10 drop-shadow-lg`}
    >
      Backend
    </h1>

    <div class="absolute inset-0 z-0">
      {#each backendTech as tech (tech.label)}
        <div class={getIconPositionClasses(tech.position)}>
          <Icon
            icon={tech.icon}
            width="64"
            height="64"
            class={`${tech.color} w-16 h-16 group-hover:drop-shadow-xl`}
          />
          <span
            class={`text-sm font-semibold mt-1 text-[#FAF7F0] opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
          >
            {tech.label}
          </span>
        </div>
      {/each}
    </div>
  </section>

  <section
    bind:this={section3Ref}
    class={`section3 sticky top-0 flex h-screen w-full items-center justify-center bg-[#13795B] overflow-hidden  origin-center `}
  >
    <h1
      class={`text-[10vw] font-extrabold text-[#E6E4D9] uppercase tracking-[0.3em] z-10 `}
    >
      Design
    </h1>

    <div class="absolute inset-0 z-0">
      {#each designTech as tech (tech.label)}
        <div class={getIconPositionClasses(tech.position)}>
          <Icon
            icon={tech.icon}
            width="64"
            height="64"
            class={`${tech.color} w-16 h-16 `}
          />
          <span
            class={`text-sm font-semibold mt-1 text-[#E6E4D9] opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
          >
            {tech.label}
          </span>
        </div>
      {/each}
    </div>
  </section>
</div>
