import * as React from 'react';
import { IReply } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

export const ReplyCompBase = ({ text }: IReply): JSX.Element => {
    if (text) {
        return <div>{text}</div>;
    }
    return <div className="placeholder">Send a message to the contact</div>;
};

export default withAction()(ReplyCompBase);

