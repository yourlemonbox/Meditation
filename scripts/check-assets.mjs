#!/usr/bin/env node
// Verifies every asset the 4K master needs is present and long/large enough.
// Exit code 1 if anything blocks a final render. Requires ffprobe on PATH.
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {join} from 'node:path';

const PUBLIC = join(process.cwd(), 'public');
const scenes = [
  {file: 'footage/scene-01-wide-establishing.mp4', need: 31},
  {file: 'footage/scene-02-front-medium.mp4', need: 32},
  {file: 'footage/scene-03-side-profile.mp4', need: 32},
  {file: 'footage/scene-04-closeup-face-hands.mp4', need: 32},
  {file: 'footage/scene-05-rear-three-quarter.mp4', need: 32},
  {file: 'footage/scene-06-pullback-reveal.mp4', need: 31},
];

const probe = (path) => {
  const json = execFileSync('ffprobe', [
    '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', path,
  ]).toString();
  const data = JSON.parse(json);
  const v = data.streams.find((s) => s.codec_type === 'video');
  const [n, d] = (v?.avg_frame_rate ?? '0/1').split('/').map(Number);
  return {duration: Number(data.format.duration), width: v?.width, height: v?.height, fps: d ? n / d : 0};
};

let blocking = 0;
let warnings = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const warn = (m) => (warnings++, console.log(`  ! ${m}`));
const fail = (m) => (blocking++, console.log(`  ✗ ${m}`));

console.log('Footage');
for (const s of scenes) {
  const p = join(PUBLIC, s.file);
  if (!existsSync(p)) {
    fail(`${s.file} — MISSING (see docs/ASSET_PROMPTS.md)`);
    continue;
  }
  const m = probe(p);
  const desc = `${s.file} — ${m.width}×${m.height} @ ${m.fps.toFixed(2)} fps, ${m.duration.toFixed(2)} s`;
  if (m.duration < s.need) fail(`${desc} — too short, needs ≥ ${s.need} s (30 s + crossfade handles)`);
  else ok(desc);
  if (m.width < 3840 || m.height < 2160) warn(`${s.file} is below 4K; upscale before the master for best detail`);
  if (Math.abs(m.fps - 30) > 0.05 && Math.abs(m.fps - 29.97) > 0.05)
    warn(`${s.file} is ${m.fps.toFixed(2)} fps; conform to 30 fps to avoid judder`);
  if (Math.abs(m.width / m.height - 16 / 9) > 0.01) warn(`${s.file} is not 16:9; it will be center-cropped`);
}

console.log('Audio');
const amb = join(PUBLIC, 'audio/forest-ambience.m4a');
if (!existsSync(amb)) fail('audio/forest-ambience.m4a — MISSING (run scripts/generate-ambience.py or add a licensed bed)');
else {
  const m = probe(amb);
  if (m.duration < 180) fail(`audio/forest-ambience.m4a is ${m.duration.toFixed(2)} s; needs ≥ 180 s`);
  else ok(`audio/forest-ambience.m4a — ${m.duration.toFixed(2)} s`);
}

console.log(`\n${blocking} blocking issue(s), ${warnings} warning(s).`);
process.exit(blocking ? 1 : 0);
