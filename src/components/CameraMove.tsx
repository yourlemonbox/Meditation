import type {ReactNode} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
  readonly children: ReactNode;
  /** Scale at the first / last frame of the shot. */
  readonly scaleFrom: number;
  readonly scaleTo: number;
  /** Drift in % of frame width/height across the shot. */
  readonly driftX?: [number, number];
  readonly driftY?: [number, number];
};

/**
 * A slow, eased "dolly/slider" move applied on top of the footage.
 * Kept deliberately subtle (a few % over 30 s) so it reads as a gimbal drift,
 * never as a digital zoom.
 */
export const CameraMove = ({children, scaleFrom, scaleTo, driftX = [0, 0], driftY = [0, 0]}: Props) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.37, 0, 0.63, 1), // ease-in-out sine
  });
  const scale = scaleFrom + (scaleTo - scaleFrom) * t;
  const x = driftX[0] + (driftX[1] - driftX[0]) * t;
  const y = driftY[0] + (driftY[1] - driftY[0]) * t;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${x}%, ${y}%) scale(${scale})`, willChange: 'transform'}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
