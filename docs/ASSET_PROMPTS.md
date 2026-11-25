# Missing assets & generation prompts

The Remotion edit is complete. The only thing it can't make itself is the
**photorealistic footage**: no video-generation integration or stock-footage
licence was available in the build environment. Rather than fake a person
with illustration or CG, every scene shows a neutral, figure-free stand-in
until real footage is dropped in, and `npm run check` blocks the 4K master
until all six files are present.

| # | Timecode | File (in `public/`) | Min. length | Status |
|---|----------|---------------------|-------------|--------|
| 1 | 00:00–00:30 | `footage/scene-01-wide-establishing.mp4` | 31 s | **missing** |
| 2 | 00:30–01:00 | `footage/scene-02-front-medium.mp4` | 32 s | **missing** |
| 3 | 01:00–01:30 | `footage/scene-03-side-profile.mp4` | 32 s | **missing** |
| 4 | 01:30–02:00 | `footage/scene-04-closeup-face-hands.mp4` | 32 s | **missing** |
| 5 | 02:00–02:30 | `footage/scene-05-rear-three-quarter.mp4` | 32 s | **missing** |
| 6 | 02:30–03:00 | `footage/scene-06-pullback-reveal.mp4` | 31 s | **missing** |
| — | 00:00–03:00 | `audio/forest-ambience.m4a` | 180 s | ✅ generated (procedural, royalty-free) |

Lengths include 1 s handles on each side of the 2 s crossfades. Target spec
for every clip: **3840×2160, 16:9, 30 fps, no audio** (the edit mutes clip audio).
Lower resolutions still work. Remotion scales them up, but upscale first
(for example Topaz Video AI) for a true 4K master.

---

## 1. Lock continuity first (most important step)

Most generators make 5–10 s clips and redesign the person every time you
prompt. To keep the **same person, clothing and forest** for 3 minutes:

1. **Make one hero reference still** with an image model (prompt A below).
   Pick the best one and keep it.
2. Make **2–3 more reference stills** of the same person from other angles
   (side, back) using the hero as an image/character reference.
3. Generate **every video take image-to-video** from those stills, with the
   continuity bible pasted at the top of each prompt, and the same seed and
   character reference where the tool supports it.
4. Per scene, generate **4 continuous takes of about 9 s from the same camera position**
   and join them with `scripts/assemble-scene.sh` (1.5 s dissolves hide the
   seams between generations). Pick takes with matching light; discard any
   with face drift, extra fingers, or eyes opening.

### Continuity bible (paste at the top of every prompt)

> A woman in her early 30s with warm olive skin, natural freckles and visible
> skin texture, dark brown hair loosely tied in a low bun with a few loose
> strands framing her face, no makeup look, no jewellery. She wears a
> relaxed, long-sleeve, undyed oatmeal-beige linen shirt and matching wide
> linen trousers, soft natural creases in the fabric. Barefoot. She sits
> cross-legged (easy pose) on a folded sage-green wool blanket on a mossy
> clearing in a lush temperate forest (tall beech and fern understory,
> moss-covered roots), hands resting palms-up on her knees. Soft early-morning
> sunlight from camera-left at a low angle, gentle haze, light shafts through
> the canopy. Calm, still, unhurried. Shot on ARRI Alexa 35 with Cooke S4
> lenses, natural light, shallow depth of field, warm muted natural grade,
> subtle film grain. Photorealistic documentary cinematography, luxury
> wellness film.

### Negative prompt (where supported)

> cartoon, illustration, 3D render, CGI, anime, plastic skin, airbrushed,
> waxy, uncanny, distorted hands, extra fingers, fused fingers, deformed
> limbs, eyes opening, talking, lip movement, fast motion, jittery camera,
> handheld shake, zoom, whip pan, text, subtitles, watermark, logo, lens
> flare spam, oversaturated, HDR look, people in background, animals in
> frame, flickering, morphing, looping motion

### Prompt A: hero reference still (image model)

> [continuity bible] Medium-wide frontal portrait at eye level from about 3 m,
> 50 mm lens, f/2.8. Her eyes are gently closed, face relaxed, a faint
> calm expression. Background softly out of focus with sunlit ferns and
> warm bokeh. 16:9, ultra-detailed, photorealistic.

Make the side-profile and rear references by repeating this with "seen in
exact side profile from her left" and "seen from behind and slightly to her
right, sun ahead of her through the trees".

---

## 2. Scene prompts (image-to-video, 4 takes each)

Camera moves are deliberately slow. Remotion adds another 2–5 % eased drift
on top, so **ask the generator for the move described and nothing faster**.
Motion that must read: slow nasal breathing, about 5 s in and 5 s out (about 6 breaths/min), with
visible rise and fall of chest and abdomen, shoulders still. Light breeze moves
loose hair strands, linen sleeves and leaves.

### Scene 1: Wide establishing (00:00–00:30)
> [continuity bible] Wide establishing shot, 24 mm lens, camera at seated eye
> height about 12 m away. She is a small, centred figure in a sunlit clearing,
> framed by tall tree trunks and ferns in the foreground (soft, out of focus).
> Morning haze, volumetric light shafts falling diagonally from top-left.
> She is already seated and still, breathing slowly. Leaves and ferns sway
> gently in a light breeze. Very slow, smooth dolly forward on a slider, about
> 30 cm over the clip, perfectly stable. No cuts.

Take guidance: same frame for all four takes, so the dolly can continue across seams.
If the tool can't continue a move, generate a locked-off frame instead and let
Remotion's push-in provide the motion.

### Scene 2: Front-facing medium (00:30–01:00)
> [continuity bible] Front-facing medium shot from the waist up, 50 mm lens,
> eye level, about 2.5 m away, centred. At the start her eyes are softly open,
> looking down; she slowly and gently closes her eyes (take 1 only) and
> settles. Slow, natural breathing: chest and abdomen visibly rise and fall
> under the linen shirt. Loose hair strands drift in the breeze. Background:
> warm, defocused forest with soft sunlit bokeh. Imperceptibly slow lateral
> slider move left-to-right. Locked exposure, no flicker.

Takes 2–4: "eyes remain closed throughout" (the eye-close happens once, near 00:32).

### Scene 3: Side profile (01:00–01:30)
> [continuity bible] Exact side profile from her left, medium shot from hips to
> head, 85 mm lens, eye level. Rim light from the low morning sun behind her
> outlines her profile, nose, lips and the curve of the abdomen. Eyes closed.
> Emphasise slow, deep diaphragmatic breathing: the abdomen expands forward on
> the inhale and softly falls on the exhale; spine upright and still. Fine dust
> motes float in a light shaft. Ferns sway softly in the defocused background.
> Very slow slider move parallel to her, a few centimetres per second.

### Scene 4: Close-up, face and relaxed hands (01:30–02:00)
> [continuity bible] Intimate close-up, 100 mm macro-portrait lens, f/2.
> Start on her peaceful face with eyes closed, skin texture, freckles and fine
> baby hairs visible, soft dappled sunlight moving gently across her cheek.
> Subtle, natural micro-movements: a slow exhale through the nose, relaxed
> jaw, eyelids still. Extremely slow tilt down to her hands resting palms-up on
> her knees, fingers loosely curled, thumb and index finger lightly touching,
> the linen sleeve moving slightly in the breeze.

For the tilt, split it into takes: 2 takes face-only, 1 take of the tilt, 1 take
hands-only. Generate hands images separately if your model struggles with hands
and check every finger.

### Scene 5: Rear and three-quarter with filtered sunlight (02:00–02:30)
> [continuity bible] Camera behind her and slightly to her right (rear
> three-quarter), 35 mm lens, low height about 60 cm, 3 m away. She sits still,
> facing a bright gap in the forest; the morning sun shines through the canopy
> ahead of her, producing soft god rays and a warm halo on her hair and
> shoulders. Her back gently expands with each slow breath. Leaves flicker
> with light in the breeze. Very slow arc of the camera around her from directly
> behind to a three-quarter rear angle, smooth like a dolly on a curved track.

### Scene 6: Slow pullback reveal (02:30–03:00)
> [continuity bible] Begin on a medium-wide frontal shot of her seated, eyes
> closed, breathing slowly. The camera very slowly pulls back and rises
> slightly (a crane or drone moving at walking pace or slower), revealing more and more of the
> surrounding forest: towering trunks, ferns, mossy ground and light shafts
> through the canopy, until she is a small, still figure in a vast, peaceful
> green forest. Gentle breeze in the treetops. Perfectly smooth, stabilised
> motion. Hold the final wide frame for the last few seconds.

The last 4 s fade to black in the edit, so the final take can simply hold.

---

## 3. Licensed stock footage (alternative)

Stock libraries rarely carry six matching angles of one person, so this only works
if you license **one shoot** (same model, same session) from a single
contributor. Search terms: *"woman meditating forest cross-legged linen 4K
sequence"*, *"forest meditation morning sunlight series"* on Artgrid,
Musicbed Film, Storyblocks, Shutterstock or Adobe Stock. Check that the licence covers
your distribution (web or broadcast). Then trim each angle to the lengths above.

## 4. Audio

`public/audio/forest-ambience.m4a` is generated by
`scripts/generate-ambience.py` (seeded, 180 s, no loops). It contains soft wind, leaf rustle
and sparse distant birdsong in a diffuse forest space. For an even more
natural bed, replace it with a licensed **dawn chorus or temperate forest field recording**
(≥ 180 s, no voices or traffic), with the same filename. Suggested search: *"temperate forest
morning ambience light wind distant birds 48 kHz"*.
