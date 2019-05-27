import * as React from 'react';
import { PlayAudio } from 'flowTypes';

const PlayAudioComp: React.SFC<PlayAudio> = (action: PlayAudio): JSX.Element => {
  return <div>{action.audio_url}</div>;
};

export default PlayAudioComp;
