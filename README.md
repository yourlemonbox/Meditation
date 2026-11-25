# Forest Breath: a 3-minute 4K breathing meditation (Remotion)

A cinematic, photorealistic breathing-meditation film built with
[Remotion](https://www.remotion.dev) 4.0.547.

* **Spec:** 3840×2160 (16:9), 30 fps, 5400 frames = exactly **180.000 s**,
  H.264 MP4 (CRF 16, BT.709, yuv420p) + AAC 320 kbps stereo.
* **Edit:** six 30 s shots joined by 2 s eased dissolves centred on each 30 s
  mark, a slow per-shot camera drift, a warm and muted grade with vignette
  and fine grain, and a 3 s fade-in and 4 s fade-out. No text, narration or subtitles.
* **Audio:** a continuous forest-ambience bed (wind, leaves, distant birds).

## ⚠️ Footage still required

The picture must come from real or photoreal generated footage. That is
**not** included (no video-generation integration or licence was available).
See **[docs/ASSET_PROMPTS.md](docs/ASSET_PROMPTS.md)** for the six files
needed and detailed generation prompts. Until they exist, each scene renders
a neutral, figure-free stand-in, and the master render is blocked.

## Setup

Requires Node.js ≥ 18 (tested on Node 22) and ffmpeg/ffprobe for the helper scripts.

```bash
npm install
npm run dev          # Remotion Studio preview at http://localhost:3000
npm run check        # verify footage + audio are present and long enough
npm run render       # checks assets, then renders out/forest-breath-4k.mp4
npm run render:preview  # 720p review cut (placeholders show timing slates)
```

Remotion downloads its own headless Chrome on first render. If that download
is blocked, point it at an installed one:
`REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell npm run render`.

## Adding footage

```bash
# join 4 generated takes of the same shot into one 4K/30fps scene file
scripts/assemble-scene.sh public/footage/scene-02-front-medium.mp4 take1.mp4 take2.mp4 take3.mp4 take4.mp4
npm run check
```

Studio and the renderer detect new files automatically. Scenes with footage
use it; the rest keep their stand-in.

## Project layout

```
src/Root.tsx              compositions (4K master + 720p preview), asset detection
src/ForestBreath.tsx      the edit: TransitionSeries of 6 shots + ambience
src/scenes.ts             timing maths and file names
src/components/           CameraMove, Grade, Shot, MissingFootage
scripts/                  check-assets, assemble-scene, generate-ambience, generate-grain
public/audio/             forest-ambience.m4a (generated, royalty-free)
public/footage/           ← drop scene-0N-*.mp4 here
.agents/skills/           official Remotion agent skills (remotion-dev/skills)
```
