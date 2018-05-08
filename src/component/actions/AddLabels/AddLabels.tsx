import * as React from 'react';
import { AddLabels } from '../../../flowTypes';

export const MAX_TO_SHOW = 3;

const AddLabelsComp: React.SFC<AddLabels> = ({ labels }): JSX.Element => (
    <>
        {labels.reduce((labelElements, label, idx) => {
            if (idx <= MAX_TO_SHOW - 1) {
                labelElements.push(<div key={idx}>{label.name}</div>);
            } else if (idx > MAX_TO_SHOW - 1 && labelElements.length === MAX_TO_SHOW) {
                labelElements.push(<div key="ellipses">...</div>);
            }
            return labelElements;
        }, [])}
    </>
);

export default AddLabelsComp;
