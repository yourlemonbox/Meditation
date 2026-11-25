import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CameraMove} from './components/CameraMove';
import {Grade} from './components/Grade';
import {Shot} from './components/Shot';
import {AMBIENCE_FILE, EDGE_SCENE, INNER_SCENE, TOTAL_FRAMES, XFADE} from './scenes';

export type ForestBreathProps = {
  /** Which scene files exist in public/footage (filled in by calculateMetadata). */
  readonly footage: boolean[];
  readonly ambienceAvailable: boolean;
  /** Show timing slates on placeholder scenes (never shown over real footage). */
  readonly showSlates: boolean;
  readonly grain: boolean;
};

// A slow, breath-like dissolve (ease-in-out) rather than a linear mix.
const dissolve = linearTiming({durationInFrames: XFADE, easing: Easing.bezier(0.45, 0, 0.55, 1)});

export const ForestBreath = ({footage, ambienceAvailable, showSlates, grain}: ForestBreathProps) => {
  const frame = useCurrentFrame();
  // Fade up from / down to black over 3 s and 4 s.
  const master = interpolate(frame, [0, 90, TOTAL_FRAMES - 120, TOTAL_FRAMES - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <AbsoluteFill style={{opacity: master}}>
        <Grade grain={grain}>
          <TransitionSeries name="Meditation shots">
            {/* 00:00–00:30 Wide establishing: slow push-in */}
            <TransitionSeries.Sequence name="1 · Wide establishing" durationInFrames={EDGE_SCENE}>
              <CameraMove scaleFrom={1.0} scaleTo={1.05} driftY={[0, -0.6]}>
                <Shot index={0} title="Wide establishing shot" available={footage[0]} showSlate={showSlates} />
              </CameraMove>
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={fade()} timing={dissolve} />

            {/* 00:30–01:00 Front medium: eyes closing, gentle lateral drift */}
            <TransitionSeries.Sequence name="2 · Front medium" durationInFrames={INNER_SCENE}>
              <CameraMove scaleFrom={1.04} scaleTo={1.07} driftX={[0.6, -0.6]}>
                <Shot index={1} title="Front-facing medium shot" available={footage[1]} showSlate={showSlates} />
              </CameraMove>
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={fade()} timing={dissolve} />

            {/* 01:00–01:30 Side profile: breathing, very slow slider move */}
            <TransitionSeries.Sequence name="3 · Side profile" durationInFrames={INNER_SCENE}>
              <CameraMove scaleFrom={1.03} scaleTo={1.05} driftX={[-0.8, 0.8]}>
                <Shot index={2} title="Side-profile breathing shot" available={footage[2]} showSlate={showSlates} />
              </CameraMove>
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={fade()} timing={dissolve} />

            {/* 01:30–02:00 Close-up: face, closed eyes, relaxed hands */}
            <TransitionSeries.Sequence name="4 · Close-up face & hands" durationInFrames={INNER_SCENE}>
              <CameraMove scaleFrom={1.02} scaleTo={1.06} driftY={[0.4, -0.4]}>
                <Shot index={3} title="Close-up: face & hands" available={footage[3]} showSlate={showSlates} />
              </CameraMove>
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={fade()} timing={dissolve} />

            {/* 02:00–02:30 Rear / three-quarter with filtered sunlight */}
            <TransitionSeries.Sequence name="5 · Rear three-quarter" durationInFrames={INNER_SCENE}>
              <CameraMove scaleFrom={1.05} scaleTo={1.03} driftX={[-0.5, 0.7]}>
                <Shot index={4} title="Rear / three-quarter, sun through trees" available={footage[4]} showSlate={showSlates} />
              </CameraMove>
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={fade()} timing={dissolve} />

            {/* 02:30–03:00 Slow pullback reveal */}
            <TransitionSeries.Sequence name="6 · Pullback reveal" durationInFrames={EDGE_SCENE}>
              <CameraMove scaleFrom={1.1} scaleTo={1.0} driftY={[-0.8, 0]}>
                <Shot index={5} title="Slow cinematic pullback" available={footage[5]} showSlate={showSlates} />
              </CameraMove>
            </TransitionSeries.Sequence>
          </TransitionSeries>
        </Grade>
      </AbsoluteFill>

      {ambienceAvailable ? (
        <Audio
          name="Forest ambience"
          src={staticFile(AMBIENCE_FILE)}
          volume={(f) =>
            interpolate(f, [0, 120, TOTAL_FRAMES - 150, TOTAL_FRAMES - 1], [0, 0.9, 0.9, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
