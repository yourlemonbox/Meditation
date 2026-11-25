import {staticFile} from 'remotion';

/**
 * Timeline maths
 * --------------
 * Six 30-second scenes joined by 2-second crossfades that are centred on each
 * 30-second mark (00:30, 01:00, ...). A TransitionSeries shortens the timeline
 * by each transition's length, so inner scenes are 30s + 2s and the outer two
 * are 30s + 1s:
 *   930 + 960*4 + 930 - 5*60 = 5400 frames = 180.000 s @ 30 fps
 */
export const FPS = 30;
export const TOTAL_FRAMES = 180 * FPS; // 5400
export const XFADE = 2 * FPS; // 60 frames
export const EDGE_SCENE = 30 * FPS + XFADE / 2; // 930
export const INNER_SCENE = 30 * FPS + XFADE; // 960

export const SCENE_FILES = [
  'footage/scene-01-wide-establishing.mp4',
  'footage/scene-02-front-medium.mp4',
  'footage/scene-03-side-profile.mp4',
  'footage/scene-04-closeup-face-hands.mp4',
  'footage/scene-05-rear-three-quarter.mp4',
  'footage/scene-06-pullback-reveal.mp4',
] as const;

export const AMBIENCE_FILE = 'audio/forest-ambience.m4a';

export const sceneSrc = (i: number) => staticFile(SCENE_FILES[i]);
