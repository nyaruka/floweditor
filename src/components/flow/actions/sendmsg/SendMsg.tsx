import * as React from 'react';
import Pill from '~/components/pill/Pill';
import { SendMsg } from '~/flowTypes';

import * as styles from './SendMsg.scss';

export const PLACEHOLDER = 'Send a message to the contact';

const SendMsgComp: React.SFC<SendMsg> = (action: SendMsg): JSX.Element => {
    if (action.text) {
        let replies = null;

        if ((action.quick_replies || []).length > 0) {
            replies = (
                <div className={styles.quickReplies}>
                    {action.quick_replies.map(reply => (
                        <Pill
                            style={{ marginLeft: 4, marginTop: 4 }}
                            maxLength={20}
                            advanced={true}
                            key={action.uuid + reply}
                            text={reply}
                        />
                    ))}
                </div>
            );
        }

        return (
            <>
                <div>
                    {action.text}
                    {action.attachments && action.attachments.length > 0 ? (
                        <span data-advanced={true} className="fe-paperclip" />
                    ) : null}
                </div>
                <div className={styles.summary}>{replies}</div>
            </>
        );
    }
    return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendMsgComp;
