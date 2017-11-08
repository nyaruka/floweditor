import * as React from 'react';
import { IReply } from '../../../flowTypes';

export default ({ text }: IReply) => {
    if (text) {
        return <div>{text}</div>;
    }
    return <div className="placeholder">Send a message to the contact</div>;
};
