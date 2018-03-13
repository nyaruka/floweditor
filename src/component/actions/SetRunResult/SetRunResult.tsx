import * as React from 'react';
import { SetRunResult } from '../../../flowTypes';

const SetRunResultComp: React.SFC<SetRunResult> = ({ value, result_name }): JSX.Element => {
    const resultName = <span className="emph">{result_name}</span>;
    return value ? (
        <React.Fragment>
            Save {value} as {resultName}
        </React.Fragment>
    ) : (
        <React.Fragment>Clear value for {resultName}</React.Fragment>
    );
};

export default SetRunResultComp;
