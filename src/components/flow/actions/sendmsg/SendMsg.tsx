import * as React from 'react';
import Pill from '~/components/pill/Pill';
import { SendMsg } from '~/flowTypes';

export const PLACEHOLDER = 'Send a message to the contact';

const SendMsgComp: React.SFC<SendMsg> = (action: SendMsg): JSX.Element => {
    if (action.text) {
        let replies = null;
        if (action.quick_replies) {
            replies = (
                <div>
                    {action.quick_replies.map(reply => (
                        <Pill
                            maxLength={20}
                            advanced={true}
                            text={reply}
                            key={action.uuid + reply}
                        />
                    ))}
                </div>
            );
        }

        return (
            <>
                <div>{action.text}</div>
                {replies}
            </>
        );
    }
    return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendMsgComp;
