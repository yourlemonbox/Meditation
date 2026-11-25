import type {ReactNode} from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Warm, muted, natural grade + vignette + fine film grain.
 * Applied once over the whole edit so every shot (whatever generator or
 * camera it came from) sits in the same look.
 */
export const Grade = ({children, grain = true}: {readonly children: ReactNode; readonly grain?: boolean}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  // Grain texture is 1024 px; re-position it every frame so it never "sticks".
  const tile = 1024 * (width / 3840) * 2;
  const ox = Math.floor(random(`gx${frame}`) * tile);
  const oy = Math.floor(random(`gy${frame}`) * tile);

  return (
    <AbsoluteFill style={{backgroundColor: '#0d110c'}}>
      <AbsoluteFill style={{filter: 'saturate(0.86) contrast(1.04) sepia(0.10) brightness(1.01)'}}>
        {children}
      </AbsoluteFill>
      {/* Warm highlight wash (soft morning sun) */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 72% 18%, rgba(255,214,160,0.10) 0%, rgba(255,214,160,0.0) 60%)',
          mixBlendMode: 'soft-light',
        }}
      />
      {/* Lifted, slightly green-teal shadows */}
      <AbsoluteFill style={{backgroundColor: 'rgba(28,40,30,0.10)', mixBlendMode: 'lighten'}} />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(8,10,6,0.42) 100%)',
        }}
      />
      {grain ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile('textures/grain.png')})`,
            backgroundSize: `${tile}px ${tile}px`,
            backgroundPosition: `${ox}px ${oy}px`,
            mixBlendMode: 'overlay',
            opacity: 0.07,
          }}
        />
      ) : null}
      {/* Preload so the first frame has grain */}
      <Img src={staticFile('textures/grain.png')} style={{display: 'none'}} />
    </AbsoluteFill>
  );
};
