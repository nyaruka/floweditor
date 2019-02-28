import * as React from 'react';
import { MediaPlayer } from '~/components/mediaplayer/MediaPlayer';
import { SayMsg } from '~/flowTypes';

import * as styles from './SayMsg.scss';

export const PLACEHOLDER = 'Send a message to the contact';

const SayMsgComp: React.SFC<SayMsg> = (action: SayMsg): JSX.Element => {
    if (action.text) {
        return (
            <>
                <div className={styles.text}>{action.text}</div>

                {action.audio_url ? (
                    <div className={styles.recording}>
                        <MediaPlayer url={(action as any).mediaRoot + '/' + action.audio_url} />
                    </div>
                ) : null}
            </>
        );
    }
    return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SayMsgComp;
