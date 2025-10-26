<script>
  import { onMount, onDestroy } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Lenis from "lenis";
  // NOTE: You must have installed the @iconify/svelte package for this to work.
  import Icon from "@iconify/svelte";

  // ICON IMPORTS
  import { Github, Link } from "lucide-svelte"; // Kept for the link buttons

  // Register ScrollTrigger, a standard GSAP practice, inside the component scope
  gsap.registerPlugin(ScrollTrigger);

  // --- 1. UPDATED: Project data with specific Iconify icon strings ---
  const projects = [
    {
      title: "Cite Smart AI",
      image: "/projects/smartcite.png",
      description:
        "AI-powered citation explorer that visualizes paper relationships and suggests contextual citations. Built for researchers and students who need smarter, connected referencing.",
      tools: [
        { name: "Next.js", icon: "devicon:nextjs" },
        { name: "Tailwind CSS", icon: "devicon:tailwindcss" },
        { name: "Neo4J", icon: "devicon:neo4j" },
        {
          name: "AssemblyScript",
          icon: "simple-icons:assemblyscript",
          iconStyle: "color: #3178C6;",
        },
      ],
      links: {
        github: "https://github.com/m-azzam-azis/cite-smart-fe",
        deploy: "https://cite-smart-ai.vercel.app",
      },
    },
    {
      title: "Heredicheck",
      image: "/projects/heredicheck.png",
      description:
        "Predicts hereditary disease risks using Graph Neural Networks and FHIR-compliant synthetic data. trains GNNs for disease prediction, and integrates seamlessly with healthcare APIs.",
      tools: [
        { name: "Next.js", icon: "devicon:nextjs" },
        { name: "Python", icon: "devicon:python" },
        { name: "Framer Motion", icon: "gg:framer" },
        {
          name: "FHIR",
          icon: "healthicons:fhir-logo",
          iconStyle: "color: #CE2029",
        },
      ],
      links: {
        github: "https://github.com/m-azzam-azis/heredicheck",
        deploy: "https://heredicheck.vercel.app",
      },
    },
    {
      title: "Gapmap AI",
      image: "/projects/gapmap.png",
      description:
        "Transforms startup ideas into complete business plans using AI. Generates executive summaries, competitor maps, and market insights interactively.",
      tools: [
        { name: "Next.js", icon: "devicon:nextjs" },
        { name: "Supabase", icon: "devicon:supabase" },
        { name: "Perplexity", icon: "logos:perplexity-icon" },
        { name: "Framer Motion", icon: "gg:framer" },
      ],
      links: {
        github: "https://github.com/m-azzam-azis/gapmap-ai",
        deploy: "https://gapmap-ai.my.id",
      },
    },
    {
      title: "Heartbit",
      image: "/projects/heartbit.jpeg",
      description:
        "An on-chain Bitcoin inheritance protocol built on Stacks. Users set custom inactivity periods, assign recipients, and funds automatically redistribute after designated period ends",
      tools: [
        { name: "Next.js", icon: "devicon:nextjs" },
        { name: "Tailwind CSS", icon: "devicon:tailwindcss" },
        { name: "Bitcoin", icon: "logos:bitcoin" },
        {
          name: "Stacks.js",
          icon: "material-symbols-light:stacks-rounded",
          iconStyle: "color: #0090f9;",
        },
      ],
      links: {
        github: "https://github.com/m-azzam-azis/heartbit",
        deploy: "https://heartbit-omega.vercel.app",
      },
    },
  ];

  let lenisInstance;
  let scrollTriggerInstances = [];
  let rootElement; // Reference to the main scroll container

  // The original getToolIcon is no longer needed as icons are defined in `projects`
  // function getToolIcon(...) { ... }

  onMount(() => {
    // Initialize Lenis for smooth scrolling
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisInstance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenisInstance.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // Get references to the DOM elements
    const horizontalContent = document.querySelector(
      "#horizontal-scroll-content"
    );

    if (!horizontalContent) return;

    // --- Horizontal Scroll Logic Fix ---
    const totalContentWidth = horizontalContent.scrollWidth;
    const scrollDistance = totalContentWidth - window.innerWidth;
    const scrollBuffer = 50;
    const finalScrollDistance = scrollDistance + scrollBuffer;

    if (finalScrollDistance <= 0) return;

    // GSAP Timeline for Horizontal Scroll Pinning
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#pin-section",
        pin: true,
        scrub: 0.6,
        start: "top top",
        end: `+=${finalScrollDistance}`,
      },
    });

    scrollTriggerInstances.push(tl.scrollTrigger);
    tl.to("#horizontal-scroll-content", {
      x: -finalScrollDistance,
      ease: "none",
    });

    // --- Background Color Transition ---
    gsap.to(rootElement, {
      backgroundColor: "#100c08",
      ease: "none",
      scrollTrigger: {
        trigger: rootElement,
        start: "top 20%",
        end: "bottom bottom",
        scrub: true,
      },
    });
  });

  onDestroy(() => {
    if (lenisInstance) lenisInstance.destroy();
    scrollTriggerInstances.forEach((t) => t.kill());
  });
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div
  bind:this={rootElement}
  class="min-h-[300vh] bg-[#13795B] font-inter text-white opacity-100 relative"
>
  <div class="bg-[#13795b] h-10 top-10 w-full"></div>
  <div
    id="pin-section"
    class="w-full h-screen bg-transparent font-inter text-white"
  >
    <div
      id="horizontal-scroll-content"
      class="flex h-full will-change-transform min-w-fit"
    >
      <section
        class="intro-section w-screen h-full flex flex-col items-center justify-center flex-shrink-0 bg-transparent"
      >
        <h1
          class="text-[12vw] md:text-[10vw] font-black text-white leading-none text-center"
        >
          My Projects
        </h1>
      </section>

      <section
        class="project-sections flex space-x-4 sm:space-x-8 lg:space-x-16 p-4 sm:p-8 lg:p-20 items-center"
      >
        {#each projects as project}
          <div
            class="h-[65vh] md:h-[85vh] bg-white text-black rounded-3xl shadow-2xl overflow-hidden flex-shrink-0 w-[90vw] sm:w-[70vw] md:w-[60vw] lg:w-[45vw] xl:w-[40vw] transition-transform duration-500 hover:scale-[1.02]"
          >
            <img
              src={project.image}
              alt={project.title}
              class="w-full h-[25vh] md:h-[40vh] object-cover border-b-1 border-black transition-none"
            />

            <div class="p-4 sm:p-6 lg:p-8 flex flex-col h-full gap-4">
              <div
                class="flex items-center justify-between gap-2 flex-wrap mb-2"
              >
                <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {project.title}
                </h2>

                <div class="flex flex-wrap gap-2 sm:gap-3">
                  {#if project.links.github}
                    <a
                      href={project.links.github}
                      target="_blank"
                      class="flex items-center gap-2 py-1.5 px-4 sm:py-2 bg-black text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-800 transition"
                    >
                      <Github size={16} />
                      <span class="max-md:hidden">Repo</span>
                    </a>
                  {/if}
                  {#if project.links.deploy}
                    <a
                      href={project.links.deploy}
                      target="_blank"
                      class="flex items-center gap-2 px-4 py-1.5 sm:py-2 bg-emerald-800 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition"
                    >
                      <Link size={16} />
                      <span class="max-md:hidden">Live</span>
                    </a>
                  {/if}
                </div>
              </div>
              <div class="flex-grow h-full">
                <div class="description-fixed-height">
                  <p
                    class="text-gray-800 text-sm leading-relaxed whitespace-normal break-words"
                  >
                    {project.description}
                  </p>
                </div>

                <p class="text-sm font-bold text-gray-900 mb-2">Build with:</p>

                <div class="flex flex-wrap gap-2 sm:gap-4">
                  {#each project.tools as tool}
                    <div
                      class="flex items-center gap-1.5 text-sm font-semibold text-gray-700 relative group p-1 rounded-md transition-all hover:bg-gray-100"
                    >
                      <Icon
                        icon={tool.icon}
                        width="20"
                        height="20"
                        style={tool.iconStyle ? tool.iconStyle : ""}
                        class="md:size-6"
                      />
                      <span
                        class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100 whitespace-nowrap"
                      >
                        {tool.name}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/each}

        <div
          class="w-screen h-full flex flex-col items-center justify-center text-white flex-shrink-0"
        >
          <h2 class="text-[8vw] font-bold">And More To Come...</h2>
        </div>
      </section>
    </div>
  </div>
</div>

<style>
  /* Global styles for smooth scrolling and font */
  :global(body) {
    font-family: "Inter", sans-serif;
    margin: 0;
    padding: 0;
    /* Crucial to prevent horizontal scrollbar during the horizontal pinning animation */
    overflow-x: hidden;
  }

  /* Ensures content inside the horizontal scroller doesn't wrap */
  #horizontal-scroll-content {
    /* Ensures the flex items stay on a single line */
    white-space: nowrap;
  }

  /* Performance optimization for the element that is being transformed */
  .will-change-transform {
    will-change: transform;
  }

  /* Custom class to force the description area to a fixed height (Issue 2 Fix) */
  .description-fixed-height {
    /* Set a height that accommodates the longest description without shifting other content */
    height: 100px; /* Adjust this value as needed */
    line-height: 1.5;
    /* The combination of break-words and overflow: hidden handles wrapping and cutting cleanly */
    /* overflow: hidden; */
  }
</style>
