import * as React from 'react';
import { SendMsg } from '../../../flowTypes';

export const PLACEHOLDER = 'Send a message to the contact';

const SendMsgComp: React.SFC<SendMsg> = ({ text }): JSX.Element => {
    if (text) {
        return <div>{text}</div>;
    }
    return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendMsgComp;
