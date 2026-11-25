import {CalculateMetadataFunction, Composition, Folder, staticFile} from 'remotion';
import {ForestBreath, ForestBreathProps} from './ForestBreath';
import {AMBIENCE_FILE, SCENE_FILES} from './scenes';

const exists = async (path: string) => {
  try {
    const res = await fetch(staticFile(path), {method: 'HEAD'});
    return res.ok;
  } catch {
    return false;
  }
};

// Detect which footage/audio files are present so the edit uses real media
// wherever it exists and a neutral stand-in elsewhere.
const detectAssets: CalculateMetadataFunction<ForestBreathProps> = async ({props}) => {
  const footage = await Promise.all(SCENE_FILES.map(exists));
  const ambienceAvailable = await exists(AMBIENCE_FILE);
  return {props: {...props, footage, ambienceAvailable}};
};

export const RemotionRoot = () => {
  return (
    <Folder name="Forest-Breath">
      {/* Master: 3840×2160 · 30 fps · 5400 frames = exactly 180 s */}
      <Composition
        id="ForestBreath"
        component={ForestBreath}
        durationInFrames={5400}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          footage: [false, false, false, false, false, false],
          ambienceAvailable: false,
          showSlates: false,
          grain: true,
        }}
        calculateMetadata={detectAssets}
      />
      {/* Fast 720p review cut with timing slates on any missing scene */}
      <Composition
        id="ForestBreathPreview"
        component={ForestBreath}
        durationInFrames={5400}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          footage: [false, false, false, false, false, false],
          ambienceAvailable: false,
          showSlates: true,
          grain: true,
        }}
        calculateMetadata={detectAssets}
      />
    </Folder>
  );
};
