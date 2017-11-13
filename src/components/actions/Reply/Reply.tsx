import * as React from 'react';
import { Reply } from '../../../flowTypes';

const ReplyComp: React.SFC<Reply> = ({ text }): JSX.Element => {
    if (text) {
        return <div>{text}</div>;
    }
    return <div className="placeholder">Send a message to the contact</div>;
};

export default ReplyComp;
