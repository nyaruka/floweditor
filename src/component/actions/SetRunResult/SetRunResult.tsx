import * as React from 'react';
import { SetRunResult } from '../../../flowTypes';

// tslint:disable-next-line:variable-name
export const getResultNameMarkup = (name: string): JSX.Element => (
    <span className="emph">{name}</span>
);
export const getSavePlaceholder = (value: string, name: JSX.Element): JSX.Element => (
    <div>
        Save {value} as {name}
    </div>
);

export const getClearPlaceholder = (name: JSX.Element) => <div>Clear value for {name}</div>;

const SetRunResult: React.SFC<SetRunResult> = ({ value, name }): JSX.Element => {
    if (value) {
        return getSavePlaceholder(value, getResultNameMarkup(name));
    }
    return getClearPlaceholder(getResultNameMarkup(name));
};

export default SetRunResult;
