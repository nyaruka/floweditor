import * as React from 'react';
import { SetRunResult } from '../../../flowTypes';

// tslint:disable-next-line:variable-name
export const getResultNameMarkup = (result_name: string): JSX.Element => (
    <span className="emph">{result_name}</span>
);
export const getSavePlaceholder = (value: string, resultName: JSX.Element): JSX.Element => (
    <div>
        Save {value} as {resultName}
    </div>
);

export const getClearPlaceholder = (resultName: JSX.Element) => (
    <div>Clear value for {resultName}</div>
);

const SetRunResult: React.SFC<SetRunResult> = ({ value, result_name }): JSX.Element => {
    if (value) {
        return getSavePlaceholder(value, getResultNameMarkup(result_name));
    }
    return getClearPlaceholder(getResultNameMarkup(result_name));
};

export default SetRunResult;
