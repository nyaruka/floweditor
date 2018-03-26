import * as React from 'react';
import { SetContactField } from '../../../flowTypes';

// tslint:disable-next-line:variable-name
export const getFieldNameMarkup = (field_name: string) => (
    <span className="emph">{field_name}</span>
);

// tslint:disable-next-line:variable-name
export const getUpdatePlaceholder = (fieldName: JSX.Element, value: string) => (
    <div>
        Update {fieldName} to {value}
    </div>
);

export const getClearPlaceholder = (fieldName: JSX.Element) => (
    <div>Clear value for {fieldName}</div>
);

const SetContactFieldComp: React.SFC<SetContactField> = ({ value, field_name }): JSX.Element => {
    if (value) {
        return getUpdatePlaceholder(getFieldNameMarkup(field_name), value);
    }
    return getClearPlaceholder(getFieldNameMarkup(field_name));
};

export default SetContactFieldComp;
