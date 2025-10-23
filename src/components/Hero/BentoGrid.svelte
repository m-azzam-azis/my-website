<script>
  import { Linkedin, Github, FileText, InstagramIcon } from "lucide-svelte";

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

  const cardDecorations =
    "shadow-lg hover:shadow-xl transition-all duration-300";

  const whatIBringList = [
    "Building full-stack applications",
    "Designing stunning landing pages & modern UIs",
    "Crafting clean, maintainable, and scalable code",
    "Transforming concepts into powerful digital solutions",
  ];
</script>

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

        <div class="flex items-start gap-3 md:gap-4 mb-4 md:mb-6 relative z-10">
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
        <ul class="space-y-2 text-base md:text-lg text-gray-700 relative z-10">
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
          class="bg-emerald-300 hover:bg-emerald-200 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-gray-900 font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 md:gap-3 {cardDecorations} col-span-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svelte:component this={social.icon} class="w-4 h-4 md:w-5 md:h-5" />
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
