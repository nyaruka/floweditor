import * as React from 'react';
import { Action } from '../../../flowTypes';

export const PLACEHOLDER = 'Send a message to the contact';

const MissingComp: React.SFC<Action> = ({ type }): JSX.Element => {
    return <div className="placeholder">No implementation yet for {type}</div>;
};

export default MissingComp;
