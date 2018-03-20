import * as React from 'react';
import { SetRunResult } from '../../../flowTypes';

const SetRunResult: React.SFC<SetRunResult> = ({ value, result_name }): JSX.Element => {
    const resultName = <span className="emph">{result_name}</span>;

    if (value) {
        return (
            <>
                Save {value} as {resultName}
            </>
        );
    }

    return <>Clear value for {resultName}</>;
};

export default SetRunResult;
