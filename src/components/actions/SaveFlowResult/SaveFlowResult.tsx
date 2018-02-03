import * as React from 'react';
import { SaveFlowResult } from '../../../flowTypes';

const SaveFlowResultComp: React.SFC<SaveFlowResult> = ({
    value,
    result_name
}): JSX.Element => {
    if (value) {
        return (
            <div>
                Save {value} as <span className="emph">{result_name}</span>
            </div>
        );
    }

    return (
        <div>
            Clear value for <span className="emph">{result_name}</span>
        </div>
    );
};

export default SaveFlowResultComp;
