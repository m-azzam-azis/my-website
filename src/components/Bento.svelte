<script>
  // @filename: app.svelte
  import { Linkedin, Github, Instagram, FileText } from "lucide-svelte"; // Import Svelte versions of icons

  // --- Reactive State using $state() Runes ---
  const name = "Azzam";
  const title = "Fullstack Developer & Designer";
  const company = "Freelance";
  const email = "m.azzam.azis@gmail.com";

  const socials = [
    { name: "linkedin", icon: Linkedin, url: "#" },
    { name: "github", icon: Github, url: "#" },
    { name: "instagram", icon: Instagram, url: "#" },
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

  // --- Decorations: Utility Class for Common Card Styles (Shadow & Border) ---
  const cardDecorations =
    "shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-100 hover:border-amber-200";

  const aboutMeContent = {
    intro:
      "I specialize in building full-stack applications from concept to deployment, crafting stunning landing pages that convert, and designing intuitive user experiences. Whether it's a dynamic web app, an eye-catching website, or a complete digital solution, I bring technical expertise and creative vision to every project.",
    goal: "Let's collaborate to transform your ideas into powerful digital experiences that engage users and drive results. Ready to start something extraordinary?",
  };
</script>

<div
  class="bg-gray-50 min-h-[80vh] flex items-center justify-center p-3 md:p-6 bg-dots-pattern"
>
  <style>
    .bg-dots-pattern {
      background-image: radial-gradient(currentColor 1px, transparent 1px);
      background-size: 20px 20px;
      color: #fcefd4; /* A light amber/off-white color for the dots */
      background-color: #fcfcfc;
    }
  </style>

  <div class="w-full max-w-7xl space-y-3 md:space-y-4 relative z-10">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div
        class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 {cardDecorations} hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden"
      >
        <div
          class="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl"
        ></div>

        <div class="flex items-start gap-3 md:gap-4 mb-4 md:mb-6 relative z-10">
          <img
            src="logo.png"
            alt="Profile"
            class="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover ring-4 ring-emerald-300 shadow-lg"
          />
        </div>
        <h1
          class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight relative z-10"
        >
          {name}
          <br />
          is a
          <span
            class="text-emerald-700 inline-block hover:scale-105 transition-transform"
            >{company}</span
          >
          <br />
          <span
            class="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            >{title}</span
          >
        </h1>
      </div>

      <div
        class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 {cardDecorations} hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden"
      >
        <div
          class="absolute -top-10 -left-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl"
        ></div>

        <h2
          class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative z-10 flex items-center gap-2"
        >
          <span class="w-1 h-8 bg-emerald-700 rounded-full"></span>
          About Me
        </h2>
        <p
          class="text-sm md:text-base lg:text-lg text-gray-700 mb-4 leading-relaxed relative z-10"
        >
          {aboutMeContent.intro}
        </p>
        <p
          class="text-sm md:text-base lg:text-lg text-emerald-800 font-semibold relative z-10"
        >
          {aboutMeContent.goal}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-3 md:gap-4">
      {#each socials as social}
        <a
          href={social.url}
          class="bg-emerald-300 hover:bg-emerald-400 transition-colors duration-300 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-gray-900 font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 md:gap-3 {cardDecorations}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svelte:component this={social.icon} class="w-4 h-4 md:w-5 md:h-5" />
          <span class="hidden sm:inline">{social.name}.</span>
        </a>
      {/each}
      <a
        href="#resume"
        class="bg-gray-900 hover:bg-gray-700 transition-colors duration-300 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-white font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 {cardDecorations}"
      >
        <FileText class="w-4 h-4 md:w-5 md:h-5" />
        <span class="hidden sm:inline">Resume</span>
        <span class="sm:hidden">CV</span>
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
      <div
        class="bg-amber-50 rounded-2xl md:rounded-3xl p-6 md:p-8 md:col-span-2 {cardDecorations}"
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

      <div
        class="bg-emerald-700 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center md:col-span-3 {cardDecorations} hover:ring-4 hover:ring-emerald-500/50 transition-all duration-300"
      >
        <h2
          class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-4 md:mb-6"
        >
          Have a Project in Mind? 💡
        </h2>
        <a
          href={`mailto:${email}`}
          class="bg-white hover:bg-gray-100 transition-colors text-emerald-700 px-6 py-3 md:px-10 md:py-4 rounded-full text-sm md:text-base lg:text-lg font-medium shadow-md hover:shadow-lg hover:scale-[1.05] duration-300"
        >
          {email}
        </a>
      </div>
    </div>
  </div>
</div>
