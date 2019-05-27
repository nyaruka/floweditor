import { MediaPlayer } from 'components/mediaplayer/MediaPlayer';
import { SayMsg } from 'flowTypes';
import * as React from 'react';

import styles from './SayMsg.module.scss';

export const PLACEHOLDER = 'Send a message to the contact';

const SayMsgComp: React.SFC<SayMsg> = (action: SayMsg): JSX.Element => {
  if (action.text) {
    return (
      <>
        <div className={styles.text}>{action.text}</div>

        {action.audio_url ? (
          <div className={styles.recording}>
            <MediaPlayer url={action.audio_url} />
          </div>
        ) : null}
      </>
    );
  }
  return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SayMsgComp;
