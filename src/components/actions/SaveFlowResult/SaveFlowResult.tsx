import * as React from 'react';
import { SaveFlowResult } from '../../../flowTypes';

export default ({ value, result_name }: SaveFlowResult) => {
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
