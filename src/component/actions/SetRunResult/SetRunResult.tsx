import * as React from 'react';
import { SetRunResult } from '../../../flowTypes';

const SetRunResult: React.SFC<SetRunResult> = ({ value, result_name }): JSX.Element => {
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

export default SetRunResult;
