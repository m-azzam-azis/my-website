// Assuming 'progress' is defined and updated elsewhere (e.g., in a scroll event listener)
// Also assuming 'heroImg', 'header', 'nav', 'videoFrames', and 'frameCount' are defined globally or in scope.

/**
 * Combined logic for scroll-based animations on various elements.
 * @param {number} progress - A value typically between 0 and 1 representing the scroll position/animation progress.
 */
function updateScrollAnimation(progress) {
  // --- Video/Frame Animation (from SCR-20251023-ksow.png) ---
  const animationProgress = Math.min(progress / 0.9, 1);
  const targetFrame = Math.round(animationProgress * (frameCount - 1));
  videoFrames.frame = targetFrame;
  render();

  // Fades out the nav element between progress 0 and 0.1
  if (progress <= 0.1) {
    const navProgress = progress / 0.1;
    const opacity = 1 - navProgress;
    gsap.set(nav, { opacity });
  } else {
    gsap.set(nav, { opacity: 0 });
  }

  if (progress <= 0.25) {
    // TranslateZ animation (moves the header closer/further)
    const zProgress = progress / 0.25;
    const translateZ = zProgress * -500; // translateZ goes from 0px to -500px

    // Opacity animation (fades out the header between progress 0.2 and 0.25)
    let opacity = 1; // Starts at 1
    if (progress >= 0.2) {
      const fadeProgress = Math.min((progress - 0.2) / (0.25 - 0.2), 1);
      opacity = 1 - fadeProgress; // Opacity goes from 1 to 0
    }

    gsap.set(header, {
      transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
      opacity: opacity,
    });
  } else {
    // Header is completely hidden after progress 0.25
    gsap.set(header, { opacity: 0 });
  }

  // --- Hero Image (heroImg) Animation (from SCR-20251023-ktcx.png and SCR-20251023-ktln.png) ---

  // Part 1: Initial state before the animation begins (progress < 0.6)
  if (progress < 0.6) {
    gsap.set(heroImg, {
      transform: "translateZ(1000px)", // Far back
      opacity: 0, // Hidden
    });
  }
  // Part 2: Main animation phase (progress between 0.6 and 0.9)
  else if (progress >= 0.6 && progress <= 0.9) {
    const imgProgress = (progress - 0.6) / 0.3; // Progress from 0 to 1 over the 0.6-0.9 range

    // TranslateZ animation: moves from 1000px to 0px (comes forward)
    const translateZ = 1000 - imgProgress * 1000;

    // Opacity calculation:
    let opacity = 0; // Initialize opacity
    if (progress <= 0.8) {
      // Opacity transition phase (progress between 0.6 and 0.8)
      const opacityProgress = (progress - 0.6) / 0.2; // Progress from 0 to 1 over the 0.6-0.8 range
      opacity = opacityProgress; // Opacity goes from 0 to 1
    } else {
      // Opacity remains 1 after progress 0.8
      opacity = 1;
    }

    gsap.set(heroImg, {
      transform: `translateZ(${translateZ}px)`,
      opacity: opacity,
    });
  }
  // Part 3: Final state after the animation ends (progress > 0.9)
  else {
    // Keep the heroImg in the final position (translateZ(0px)) and visible (opacity: 1)
    gsap.set(heroImg, {
      transform: "translateZ(0px)",
      opacity: 1,
    });
  }
}

// Example usage (you would call this function on scroll/update):
// updateScrollAnimation(currentScrollProgress);
