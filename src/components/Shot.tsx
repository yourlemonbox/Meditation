import {Video} from '@remotion/media';
import {SCENE_FILES, sceneSrc} from '../scenes';
import {MissingFootage} from './MissingFootage';

type Props = {
  readonly index: number;
  readonly title: string;
  readonly available: boolean;
  readonly showSlate: boolean;
};

/** One scene's picture: the real footage when present, otherwise a neutral stand-in. */
export const Shot = ({index, title, available, showSlate}: Props) => {
  if (!available) {
    return <MissingFootage index={index} title={title} file={SCENE_FILES[index]} showSlate={showSlate} />;
  }
  return (
    <Video
      name={`Scene ${index + 1} footage`}
      src={sceneSrc(index)}
      muted // picture only; the edit carries one continuous ambience bed
      objectFit="cover"
      style={{width: '100%', height: '100%'}}
    />
  );
};
