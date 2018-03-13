import * as React from 'react';
import { SendMsg } from '../../../flowTypes';

const SendMsgComp: React.SFC<SendMsg> = ({ text }): JSX.Element =>
    text ? (
        <React.Fragment>{text}</React.Fragment>
    ) : (
        <div className="placeholder">Send a message to the contact</div>
    );

export default SendMsgComp;
