import * as React from 'react';
import { ISaveFlowResult } from '../../../flowTypes';

export default ({ value, result_name }: ISaveFlowResult) => {
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
