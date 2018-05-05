import * as React from 'react';
import { AddLabels } from '../../../flowTypes';

const MAX_TO_SHOW = 3;

const AddLabelsComp: React.SFC<AddLabels> = ({ labels }): JSX.Element => (
    <>
        {labels.map((label, idx) => <div key={idx}>{idx >= MAX_TO_SHOW ? '...' : label.name}</div>)}
    </>
);

export default AddLabelsComp;
