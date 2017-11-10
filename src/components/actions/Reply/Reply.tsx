import * as React from 'react';
import { Reply } from '../../../flowTypes';

export default ({ text }: Reply) => {
    if (text) {
        return <div>{text}</div>;
    }
    return <div className="placeholder">Send a message to the contact</div>;
};
