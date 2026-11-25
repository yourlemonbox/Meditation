import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
  readonly index: number;
  readonly title: string;
  readonly file: string;
  readonly showSlate: boolean;
};

/**
 * Stand-in used ONLY while the generated/licensed footage for a scene is
 * missing. It is an abstract, figure-free plate of dappled forest light (no
 * illustrated or synthetic person) plus an optional slate so editors can check
 * timing. `scripts/check-assets.mjs` blocks the 4K master while any of these
 * are still on the timeline.
 */
export const MissingFootage = ({index, title, file, showSlate}: Props) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const u = width / 3840;
  const t = frame / fps;

  const bokeh = new Array(26).fill(0).map((_, i) => {
    const seed = `b${index}-${i}`;
    const x = random(seed + 'x') * 100 + Math.sin(t * 0.05 + i) * 1.5;
    const y = random(seed + 'y') * 70 + Math.cos(t * 0.04 + i) * 1.2;
    const r = (60 + random(seed + 'r') * 220) * u;
    const a = 0.05 + random(seed + 'a') * 0.12 + Math.sin(t * 0.3 + i * 1.7) * 0.03;
    const warm = random(seed + 'w') > 0.5;
    return {x, y, r, a, warm};
  });

  const shaftShift = Math.sin(t * 0.06) * 3;
  const slateOpacity = interpolate(frame, [30, 60, durationInFrames - 60, durationInFrames - 30], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #2c3a22 0%, #3d4f2c 30%, #2a3a1f 62%, #1b2414 100%)',
      }}
    >
      {/* Canopy light */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(70% 55% at 68% 8%, rgba(250,226,170,0.55) 0%, rgba(200,210,140,0.18) 40%, rgba(0,0,0,0) 70%)',
        }}
      />
      {/* Sun shafts */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(${112 + shaftShift}deg, rgba(255,236,190,0.0) 0%, rgba(255,236,190,0.08) 4%, rgba(255,236,190,0.0) 9%, rgba(255,236,190,0.0) 16%)`,
          maskImage: 'linear-gradient(180deg, black 0%, black 45%, transparent 85%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Out-of-focus foliage highlights */}
      {bokeh.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.r,
            height: b.r,
            marginLeft: -b.r / 2,
            marginTop: -b.r / 2,
            borderRadius: '50%',
            background: b.warm
              ? `radial-gradient(circle, rgba(255,230,170,${b.a}) 0%, rgba(255,230,170,0) 70%)`
              : `radial-gradient(circle, rgba(190,225,150,${b.a}) 0%, rgba(190,225,150,0) 70%)`,
          }}
        />
      ))}
      {/* Moss floor */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(40,52,24,0.85) 82%, rgba(22,28,14,1) 100%)',
        }}
      />
      {showSlate ? (
        <AbsoluteFill style={{justifyContent: 'flex-end', padding: 140 * u, opacity: slateOpacity}}>
          <div
            style={{
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: 'rgba(245,240,228,0.92)',
              background: 'rgba(10,14,9,0.55)',
              padding: `${48 * u}px ${64 * u}px`,
              borderRadius: 16 * u,
              alignSelf: 'flex-start',
              maxWidth: '70%',
            }}
          >
            <div style={{fontSize: 44 * u, letterSpacing: 6 * u, opacity: 0.7}}>
              PLACEHOLDER · SCENE {index + 1} · {String(index * 30 / 60 | 0).padStart(2, '0')}:
              {String((index * 30) % 60).padStart(2, '0')}–{String(((index + 1) * 30) / 60 | 0).padStart(2, '0')}:
              {String(((index + 1) * 30) % 60).padStart(2, '0')}
            </div>
            <div style={{fontSize: 84 * u, fontWeight: 600, marginTop: 16 * u}}>{title}</div>
            <div style={{fontSize: 40 * u, marginTop: 20 * u, opacity: 0.75, fontFamily: 'Menlo, monospace'}}>
              drop footage at public/{file}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
