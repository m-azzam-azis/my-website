#!/bin/bash

# --- Function to get user input ---
get_input() {
    local prompt="$1"
    local default_value="$2"
    read -rp "$prompt [$default_value]: " input
    echo "${input:-$default_value}"
}

# --- Configuration ---
PADDING=6 # For 000001
# Use default system paths for FFmpeg/Magick (assuming they are installed via Homebrew)

# --- 1. Get User Input ---

INPUT_FILE=$(get_input "Enter the path to the input video file" "input.mp4")
REVERSE_VIDEO=$(get_input "Reverse the video frames (y/N)" "N")
QUALITY_PERCENT=$(get_input "WebP Quality (1-100)" "85")
OUTPUT_DIR=$(get_input "Path to the output folder" "output_frames")
FILENAME_PREFIX=$(get_input "Base name (e.g., 'bg_photo' for bg_photo_000001.webp)" "bg_photo_")

# --- 2. Input Validation ---

if [[ ! -f "$INPUT_FILE" ]]; then
    echo "Error: Input file '$INPUT_FILE' not found."
    exit 1
fi

if ! command -v ffmpeg &> /dev/null || ! command -v magick &> /dev/null; then
    echo "Error: Requires both 'ffmpeg' and 'magick' (ImageMagick) commands to be in your PATH."
    exit 1
fi

# Ensure quality is a number between 1 and 100
if ! [[ "$QUALITY_PERCENT" =~ ^[0-9]+$ ]] || (( QUALITY_PERCENT < 1 )) || (( QUALITY_PERCENT > 100 )); then
    echo "Error: Quality must be a number between 1 and 100. Using default 85."
    QUALITY_PERCENT=85
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# --- 3. Build FFmpeg Commands (Mac M1/VideoToolbox Accelerated) ---

# GPU decoding/acceleration on Mac M1 is best done using '-hwaccel videotoolbox'
# '-c:v h264_videotoolbox' can be used for encoding, but is not needed here
# since we pipe the raw frames out.

# Base FFmpeg command with Mac GPU decoding (VideoToolbox)
# Use '-hwaccel videotoolbox' for decoding acceleration
FFMPEG_BASE="ffmpeg -hide_banner -hwaccel videotoolbox -i \"$INPUT_FILE\""

# Optional filter for reversing
REVERSE_FILTER=""
# CORRECTED: Use [[ ... ]] for case-insensitive check to fix "bad substitution"
if [[ "${REVERSE_VIDEO}" =~ ^[yY]$ ]]; then
    echo "Applying 'reverse' filter..."
    REVERSE_FILTER="reverse,"
    # The reverse filter requires the entire video to be buffered/decoded first.
fi

# The primary filter chain for processing
# format=yuv420p is often required for broad compatibility
# The output is sent as uncompressed PPM stream to the pipe
# -vcodec ppm is crucial for piping to ImageMagick without compression loss
FFMPEG_FILTERS="-vf \"${REVERSE_FILTER}fps=30\" -q:v 1 -pix_fmt rgb24 -f image2pipe -vcodec ppm -"

# --- 4. Execute the Conversion ---

echo "Starting frame extraction and conversion..."
echo "Using Decoder: VideoToolbox (Apple Silicon) | WebP Quality: $QUALITY_PERCENT% | Output: $OUTPUT_DIR"

# Execute FFmpeg and pipe the uncompressed frames to ImageMagick
# - : Reads from stdin (the pipe)
# "${OUTPUT_DIR}/${FILENAME_PREFIX}%0${PADDING}d.webp" : ImageMagick's sequence naming
eval "$FFMPEG_BASE $FFMPEG_FILTERS | magick -delay 0 -loop 0 - -quality $QUALITY_PERCENT \"${OUTPUT_DIR}/${FILENAME_PREFIX}%0${PADDING}d.webp\""

EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 ]]; then
    echo ""
    echo "✅ Success! Frames are saved in the '$OUTPUT_DIR' directory."
    echo "First file name should be: ${FILENAME_PREFIX}000001.webp (ImageMagick starts numbering from 0, but since the requirement was 0001, we use 6 digits for safety, which includes the 000000.webp file)"
else
    echo ""
    echo "❌ Error: FFmpeg/ImageMagick operation failed. Check the error messages above."
    echo "If hardware acceleration still causes issues, remove '-hwaccel videotoolbox' from the FFMPEG_BASE command to use only CPU processing."
fi

exit $EXIT_CODE