<script>
  import NumberFlow from "@number-flow/svelte";

  /**
   * @type {number} The current loading progress (0-100).
   */
  export let loadProgress = 0;

  /**
   * @type {boolean} Controls the visibility and animation of the screen.
   * Typically set to true when the loading/intro animation is finished.
   */
  export let animationFinished = false;
</script>

{#if !animationFinished}
  <div
    class="loading-section fixed inset-0 bg-[#FAF7F0] z-50 flex items-center justify-center will-change-transform"
    style="transform: translateY(0);"
  >
    <div class="text-center overflow-hidden mb-8 ml-8">
      <div class="flex gap-1 text-9xl font-bold w-full h-full">
        <NumberFlow trend={1} value={loadProgress} />
      </div>
    </div>
  </div>
{/if}
