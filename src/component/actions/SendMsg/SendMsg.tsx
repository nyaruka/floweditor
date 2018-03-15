import * as React from 'react';
import { SendMsg } from '../../../flowTypes';

const SendMsgComp: React.SFC<SendMsg> = ({ text }): JSX.Element => {
    if (text) {
        return <div>{text}</div>;
    }
    return <div className="placeholder">Send a message to the contact</div>;
};

export default SendMsgComp;
