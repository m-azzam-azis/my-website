import React, { useEffect, useRef, useState } from "react";
import { Linkedin, Github, FileText, Instagram } from "lucide-react";

const FRAME_COUNT = 218;
const IMAGE_PATH = "/bg_photos2/bg_photo_";
const SCROLL_HEIGHT_VH = 550;

const PortfolioSite = () => {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const pageWrapperRef = useRef(null);
  const heroTextRef = useRef(null);
  const bentoGridRef = useRef(null);
  const navRef = useRef(null);
  const heroImgRef = useRef(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);

  const imagesRef = useRef([]);
  const canvasContextRef = useRef(null);
  const videoFramesRef = useRef({ frame: 0 });

  // Portfolio data
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
      icon: Instagram,
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

  const whatIBringList = [
    "Building full-stack applications",
    "Designing stunning landing pages & modern UIs",
    "Crafting clean, maintainable, and scalable code",
    "Transforming concepts into powerful digital solutions",
  ];

  // Generate priority loading pattern
  const generateLoadingPattern = (totalFrames) => {
    const maxIndex = totalFrames - 1;
    const priority = [];
    const rest = [];
    const loadedIndices = new Set();

    const addFramesAtLevel = (denominator, isPriority) => {
      const targetArray = isPriority ? priority : rest;
      for (let numerator = 1; numerator < denominator; numerator += 2) {
        const frameIndex = Math.floor((maxIndex * numerator) / denominator);
        if (
          frameIndex >= 0 &&
          frameIndex < maxIndex &&
          !loadedIndices.has(frameIndex)
        ) {
          targetArray.push(frameIndex);
          loadedIndices.add(frameIndex);
        }
      }
    };

    priority.push(0);
    loadedIndices.add(0);
    priority.push(maxIndex);
    loadedIndices.add(maxIndex);

    [2, 4, 8, 16].forEach((denom) => addFramesAtLevel(denom, true));

    for (let denom = 32; denom <= 256; denom *= 2) {
      addFramesAtLevel(denom, false);
      if (maxIndex / denom < 1) break;
    }

    for (let i = 0; i < totalFrames; i++) {
      if (!loadedIndices.has(i)) {
        rest.push(i);
      }
    }

    return { priority, rest };
  };

  // Load individual image
  const loadImage = (index) => {
    return new Promise((resolve) => {
      if (imagesRef.current[index]?.complete) {
        resolve();
        return;
      }

      const img = new Image();
      const imagePath = `${IMAGE_PATH}${String(index).padStart(6, "0")}.webp`;

      img.onload = () => {
        if (index === 0 && canvasContextRef.current) {
          canvasContextRef.current.drawImage(
            img,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
        resolve();
      };

      img.onerror = () => {
        console.error(`Failed to load frame ${index}`);
        resolve();
      };

      img.src = imagePath;
      imagesRef.current[index] = img;
    });
  };

  // Render frame to canvas
  const renderFrame = (frameIndex) => {
    const safeFrameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.floor(frameIndex))
    );
    const img = imagesRef.current[safeFrameIndex];

    if (img?.complete && canvasContextRef.current) {
      canvasContextRef.current.drawImage(
        img,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
    setCurrentFrame(safeFrameIndex);
  };

  // Handle scroll animation
  const handleScroll = () => {
    if (!sectionRef.current) return;

    const sectionTop = sectionRef.current.offsetTop;
    const sectionHeight = sectionRef.current.offsetHeight;
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    const scrollStart = sectionTop;
    const scrollEnd = sectionTop + sectionHeight - windowHeight;
    const scrollRange = scrollEnd - scrollStart;

    if (scrollY < scrollStart) {
      animateAtProgress(0);
    } else if (scrollY > scrollEnd) {
      animateAtProgress(1);
    } else {
      const progress = (scrollY - scrollStart) / scrollRange;
      animateAtProgress(progress);
    }
  };

  // Main animation logic based on scroll progress
  const animateAtProgress = (progress) => {
    // Video frame animation (0% - 90%)
    if (progress < 0.9) {
      const animationProgress = Math.min(progress / 0.9, 1);
      const targetFrame = Math.round(animationProgress * (FRAME_COUNT - 1));
      videoFramesRef.current.frame = targetFrame;
      renderFrame(targetFrame);
    }

    // Header animation (0% - 25%)
    if (progress <= 0.25) {
      const headerProgress = progress / 0.25;
      const translateZ = headerProgress * -500;
      let opacity = 1;

      if (progress >= 0.2) {
        const fadeProgress = Math.min((progress - 0.2) / (0.25 - 0.2), 1);
        opacity = 1 - fadeProgress;
      }

      if (heroTextRef.current) {
        heroTextRef.current.style.transform = `translate(-50%, -50%) translateZ(${translateZ}px)`;
        heroTextRef.current.style.opacity = opacity;
      }
    } else {
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = "0";
      }
    }

    // Hero image animation (0% - 60%)
    if (progress < 0.6) {
      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `translateZ(1000px)`;
        heroImgRef.current.style.opacity = "0";
      }
    } else if (progress >= 0.6 && progress <= 0.9) {
      const imgProgress = (progress - 0.6) / 0.3;
      const translateZ = 1000 - imgProgress * 1000;

      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `translateZ(${translateZ}px)`;
        heroImgRef.current.style.opacity = "0";
      }
    }

    // Navigation animation (0% - 10%)
    if (progress <= 0.1) {
      const navProgress = progress / 0.1;
      const opacity = 1 - navProgress;

      if (navRef.current) {
        navRef.current.style.opacity = opacity;
      }
    } else {
      if (navRef.current) {
        navRef.current.style.opacity = "0";
      }
    }

    // Bento grid animation (60% - 80%)
    let bentoOpacity = 0;
    if (progress <= 0.8) {
      const opacityProgress = (progress - 0.6) / 0.2;
      bentoOpacity = opacityProgress;
    } else {
      bentoOpacity = 1;
    }

    if (bentoGridRef.current) {
      bentoGridRef.current.style.transform = `translateZ(${translateZ}px)`;
      bentoGridRef.current.style.opacity = bentoOpacity;
    } else {
      if (bentoGridRef.current) {
        bentoGridRef.current.style.transform = `translateZ(0px)`;
        bentoGridRef.current.style.opacity = "1";
      }
    }
  };

  // Initialize
  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup canvas
    canvasContextRef.current = canvasRef.current.getContext("2d");
    canvasRef.current.width = 1920;
    canvasRef.current.height = 1080;

    // Lock scroll during loading
    document.body.style.overflow = "hidden";

    // Load images
    const loadingPattern = generateLoadingPattern(FRAME_COUNT);
    let loadedCount = 0;
    const totalPriorityFrames = loadingPattern.priority.length;

    const updateProgress = () => {
      loadedCount++;
      const progress = Math.round((loadedCount / totalPriorityFrames) * 100);
      setLoadProgress(progress);

      if (loadedCount >= totalPriorityFrames) {
        setTimeout(() => {
          setIsLoading(false);
          document.body.style.overflow = "";
        }, 500);
      }
    };

    // Load priority frames
    Promise.all(
      loadingPattern.priority.map((index) =>
        loadImage(index).then(updateProgress)
      )
    ).then(() => {
      // Load rest in background
      loadingPattern.rest.forEach((index) => loadImage(index));
    });

    // Setup scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={pageWrapperRef}
      className="bg-[#FAF7F0] relative"
      style={{
        overflow: isLoading ? "hidden" : "",
        height: isLoading ? "100vh" : "",
        position: isLoading ? "fixed" : "",
        width: isLoading ? "100%" : "",
      }}
    >
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#FAF7F0] z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl font-bold">{loadProgress}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div ref={containerRef}>
        <section
          ref={sectionRef}
          className="relative"
          style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
        >
          <div
            className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#202020]"
            style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
          >
            {/* Canvas Container */}
            <div className="relative w-full h-full overflow-hidden">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black opacity-30 pointer-events-none" />

              {/* Navigation */}
              <div
                ref={navRef}
                className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none"
                style={{ opacity: 1 }}
              >
                {/* Nav content can go here */}
              </div>

              {/* Hero Text */}
              <div
                ref={heroTextRef}
                className="absolute top-1/2 left-1/2 z-10 pointer-events-none"
                style={{
                  transform: "translate(-50%, -50%)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="text-center">
                  <h1 className="text-7xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
                    Muhammad Azzam
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/90 drop-shadow-lg">
                    Developer • Designer • Creator
                  </p>
                </div>
              </div>

              {/* Hero Image */}
              <div
                ref={heroImgRef}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: 0,
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src="logo.png"
                  alt="Profile"
                  className="w-64 h-64 rounded-full object-cover shadow-2xl"
                />
              </div>

              {/* Bento Grid */}
              <div
                ref={bentoGridRef}
                className="absolute inset-0 flex items-center justify-center p-3 md:p-6 pointer-events-none"
                style={{
                  opacity: 0,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="w-full max-w-7xl space-y-3 md:space-y-4 pointer-events-auto">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {/* About Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-700 text-white text-xs font-semibold py-1 px-3 rounded-2xl shadow-md animate-pulse mt-6 mr-6">
                        Open for Work
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl" />
                      <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6 relative z-10">
                        <img
                          src="logo.png"
                          alt="Profile"
                          className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover shadow-lg"
                        />
                      </div>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight relative z-10">
                        {name}
                        <br />
                        is a <span className="text-emerald-700">Freelance</span>
                        <span> based in </span>
                        <span className="text-emerald-700">
                          Indonesia GMT+7
                        </span>
                      </h1>
                    </div>

                    {/* What I Bring Card */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] relative overflow-hidden max-md:hidden">
                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl" />
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative z-10">
                        What I Bring
                      </h2>
                      <ul className="space-y-2 text-base md:text-lg text-gray-700 relative z-10">
                        {whatIBringList.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold text-lg leading-none mt-[2px]">
                              &gt;
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Row 2 - Social Links */}
                  <div className="grid grid-cols-5 gap-3 md:gap-4">
                    {socials.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        className="bg-emerald-300 hover:bg-emerald-200 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-gray-900 font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 col-span-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <social.icon className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">{social.name}</span>
                      </a>
                    ))}
                    <a
                      href="#resume"
                      className="bg-gray-900 hover:bg-gray-700 rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-white font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] col-span-2"
                    >
                      <FileText className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Resume</span>
                      <span className="sm:hidden">CV</span>
                    </a>
                  </div>

                  {/* Row 3 - Tech Stack & CTA */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                    <div className="bg-amber-50 rounded-2xl md:rounded-3xl p-6 md:p-8 md:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                        Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm lg:text-base font-medium transition-all duration-300 hover:scale-105 bg-emerald-200 text-gray-900"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <a
                      href={`mailto:${email}`}
                      className="bg-emerald-700 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center md:col-span-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                    >
                      <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-4 md:mb-6">
                        Have a Project in Mind?
                      </h2>
                      <span className="bg-white hover:bg-gray-100 transition-colors text-emerald-700 px-6 py-3 md:px-10 md:py-4 rounded-full text-sm md:text-base lg:text-lg font-medium shadow-md hover:shadow-lg">
                        {email}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PortfolioSite;
