import * as React from 'react';
import { SetRunResult } from '../../../flowTypes';

const SetRunResult: React.SFC<SetRunResult> = ({ value, result_name }): JSX.Element => {
    const resultName = <span className="emph">{result_name}</span>;

    if (value) {
        return (
            <div>
                Save {value} as {resultName}
            </div>
        );
    }

    return <div>Clear value for {resultName}</div>;
};

export default SetRunResult;
