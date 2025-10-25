<script>
  import { onMount, onDestroy } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import Lenis from "lenis";

  // ICON IMPORTS
  import { Github, Link, Terminal, Cpu, Database, Code } from "lucide-svelte";

  // Register ScrollTrigger, a standard GSAP practice, inside the component scope
  gsap.registerPlugin(ScrollTrigger);

  const projects = [
    {
      title: "Cite Smart AI",
      image: "/projects/smartcite.png",
      description:
        "AI-powered citation explorer that visualizes paper relationships and suggests contextual citations. Built for researchers and students who need smarter, connected referencing.",
      tools: [
        { name: "Next.js" },
        { name: "Tailwind" },
        { name: "Supabase" },
        { name: "GraphQL" },
      ],
      links: {
        github: "https://github.com/example/citesmart",
        deploy: "https://cite-smart-ai.vercel.app",
      },
    },
    {
      title: "Heredicheck AI",
      image: "/projects/heredicheck.png",
      description:
        "Predicts hereditary disease risks using Graph Neural Networks and FHIR-compliant synthetic data. Generates patient graphs, trains GNNs for disease prediction, and integrates seamlessly with healthcare APIs.",
      tools: [
        { name: "Python" },
        { name: "Next.js" },
        { name: "Tailwind" },
        { name: "FHIR" },
        { name: "Railway" },
      ],
      links: {
        github: "https://github.com/example/heredicheck-ai",
        deploy: "https://heredicheck.vercel.app",
      },
    },
    {
      title: "Gapmap AI",
      image: "/projects/gapmap.png",
      description:
        "Transforms startup ideas into complete business plans using AI. Generates executive summaries, competitor maps, and market insights interactively.",
      tools: [{ name: "Next.js" }, { name: "Supabase" }, { name: "Sonar" }],
      links: {
        github: "https://github.com/example/gapmap-ai",
        deploy: "https://gapmap-ai.my.id",
      },
    },
    {
      title: "Heartbit",
      image: "/projects/heartbit.jpeg",
      description:
        "An on-chain Bitcoin inheritance protocol built on Stacks. Users set custom inactivity periods, assign recipients, and funds automatically redistribute if no heartbeat transaction is made. Fully on-chain and open-source for transparency and extensibility.",
      tools: [
        { name: "Next.js" },
        { name: "Tailwind" },
        { name: "Clarity" },
        { name: "Stacks.js" },
        { name: "Clarinet" },
      ],
      links: {
        github: "https://github.com/example/heartbit",
        deploy: "https://heartbit-omega.vercel.app",
      },
    },
  ];

  let lenisInstance;
  let scrollTriggerInstances = [];
  let rootElement; // Reference to the main scroll container

  // Helper function to get an icon based on tool name
  function getToolIcon(toolName) {
    const lowerName = toolName.toLowerCase();
    if (lowerName.includes("next") || lowerName.includes("tailwind"))
      return Terminal;
    if (
      lowerName.includes("clarity") ||
      lowerName.includes("rust") ||
      lowerName.includes("python")
    )
      return Code;
    if (
      lowerName.includes("stacks") ||
      lowerName.includes("near") ||
      lowerName.includes("fhir")
    )
      return Cpu;
    if (lowerName.includes("supabase") || lowerName.includes("graphql"))
      return Database;
    return Terminal; // Default icon
  }

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

    // 1. Calculate the total width of the content that needs to scroll
    const totalContentWidth = horizontalContent.scrollWidth;

    // 2. Calculate the distance the content must move to show the very last element ('More to Come')
    // This is the total content width minus the initial screen width
    const scrollDistance = totalContentWidth - window.innerWidth;

    if (scrollDistance <= 0) return;

    // GSAP Timeline for Horizontal Scroll Pinning
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#pin-section",
        pin: true,
        scrub: 0.6,
        start: "top top",
        // The total scroll duration is exactly the distance the content needs to move horizontally
        end: `+=${scrollDistance}`,
      },
    });

    scrollTriggerInstances.push(tl.scrollTrigger);
    // Animate the horizontal-scroll-content to move left by the required distance
    tl.to("#horizontal-scroll-content", { x: -scrollDistance, ease: "none" });

    // --- Background Color Transition ---
    // Change the background color from #13795B to black
    gsap.to(rootElement, {
      backgroundColor: "#100c08", // Corrected hex color
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
  class="min-h-[200vh] min-w-fit bg-[#13795B] font-inter text-white"
>
  <div
    id="pin-section"
    class="w-full h-screen bg-transparent font-inter text-white"
  >
    <div
      id="horizontal-scroll-content"
      class="flex h-full will-change-transform"
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

      <section class="project-sections flex space-x-16 p-20 items-center">
        {#each projects as project}
          <div
            class="project-card bg-white text-black rounded-3xl shadow-2xl overflow-hidden flex-shrink-0 w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw] transition-transform duration-500 hover:scale-[1.02]"
          >
            <img
              src={project.image}
              alt={project.title}
              class="w-full h-[40vh] object-cover border-b-4 border-black transition-none"
            />

            <div class="p-8 flex flex-col justify-between h-auto">
              <div>
                <h2 class="text-4xl font-bold mb-4">{project.title}</h2>
                <p
                  class="text-gray-800 text-base leading-relaxed mb-6 whitespace-normal break-words"
                >
                  {project.description}
                </p>

                <div class="flex flex-wrap gap-4 mb-6">
                  {#each project.tools as tool}
                    <div
                      class="flex items-center gap-1.5 text-sm font-semibold text-gray-700"
                    >
                      <svelte:component
                        this={getToolIcon(tool.name)}
                        size={16}
                        class="text-indigo-600"
                      />
                      <span>{tool.name}</span>
                    </div>
                  {/each}
                </div>
              </div>

              <div
                class="flex flex-wrap gap-3 mt-auto pt-4 border-t border-gray-100"
              >
                {#if project.links.github}
                  <a
                    href={project.links.github}
                    target="_blank"
                    class="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                {/if}
                {#if project.links.deploy}
                  <a
                    href={project.links.deploy}
                    target="_blank"
                    class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition"
                  >
                    <Link size={16} />
                    <span>Live Site</span>
                  </a>
                {/if}
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
    white-space: nowrap;
  }

  /* Performance optimization for the element that is being transformed */
  .will-change-transform {
    will-change: transform;
  }

  /* Project Card: Set a fixed height for consistent layout */
  .project-card {
    height: 80vh;
    width: 60vw;
  }

  /* Reset image transition to ensure it doesn't scale on hover */
  .project-card img {
    transition: none;
    transform: none;
  }
</style>
