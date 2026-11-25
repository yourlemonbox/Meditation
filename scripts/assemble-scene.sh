#!/usr/bin/env bash
# Join several generated takes (e.g. four 8–10 s clips) into one scene file
# with soft 1.5 s crossfades, conformed to 3840×2160 @ 30 fps, no audio.
#
#   scripts/assemble-scene.sh public/footage/scene-02-front-medium.mp4 take1.mp4 take2.mp4 take3.mp4 take4.mp4
#
# Takes should be the same continuous shot (same angle, person, light) — the
# crossfade hides the seam between generations, not a change of angle.
set -euo pipefail
XF=${XFADE_SECONDS:-1.5}
PRESET=${X264_PRESET:-slow}
out=$1; shift
[ $# -ge 1 ] || { echo "usage: $0 OUT.mp4 TAKE1.mp4 [TAKE2.mp4 ...]"; exit 1; }

norm="scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos,crop=3840:2160,fps=30,format=yuv420p,setsar=1"
inputs=(); filters=""; i=0
for f in "$@"; do inputs+=(-i "$f"); filters+="[$i:v]$norm[v$i];"; i=$((i+1)); done

if [ $i -eq 1 ]; then
  chain="[v0]copy[out]"
else
  prev="v0"; offset=0
  for ((k=1; k<i; k++)); do
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${@:$k:1}")
    offset=$(awk -v o="$offset" -v d="$d" -v x="$XF" 'BEGIN{printf "%.3f", o+d-x}')
    chain+="[$prev][v$k]xfade=transition=fade:duration=$XF:offset=$offset[x$k];"
    prev="x$k"
  done
  chain+="[$prev]copy[out]"
fi

ffmpeg -y "${inputs[@]}" -filter_complex "${filters}${chain}" -map "[out]" -an \
  -c:v libx264 -preset "$PRESET" -crf 14 -movflags +faststart "$out"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$out" | xargs printf "wrote %s (%.2f s)\n" "$out"
