import * as React from 'react';
import { Reply } from '../../../flowTypes';

export const REPLY_LABEL = 'Send a message to the contact';

const ReplyComp: React.SFC<Reply> = ({ text }): JSX.Element => {
    if (text) {
        return <span>{text}</span>;
    }
    return <span className="placeholder">{REPLY_LABEL}</span>;
};

export default ReplyComp;
