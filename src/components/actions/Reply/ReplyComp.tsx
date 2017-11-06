import * as React from 'react';
import { IReply } from '../../../flowTypes';
import withAction from '../../Action';

// export class ReplyComp extends ActionComp<IReply> {
//     localizedKeys = ['text'];

//     renderNode(): JSX.Element {
//         var action = this.getAction();
//         if (action.text != null) {
//             return <div>{action.text}</div>;
//         } else {
//             return <div className="placeholder">Send a message to the contact</div>;
//         }
//     }
// }

const ReplyComp = ({ text }: IReply): JSX.Element => {
    if (text) {
        return <div>{text}</div>;
    }
    return <div className="placeholder">Send a message to the contact</div>;
};

export default withAction()(ReplyComp);

