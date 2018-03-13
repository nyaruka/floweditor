import * as React from 'react';
import { SetContactField } from '../../../flowTypes';

const SetContactFieldComp: React.SFC<SetContactField> = ({ value, field_name }): JSX.Element => {
    const fieldName = <span className="emph">{field_name}</span>;
    return value ? (
        <React.Fragment>
            Update {fieldName} to {value}
        </React.Fragment>
    ) : (
        <React.Fragment>Clear value for {fieldName}</React.Fragment>
    );
};

export default SetContactFieldComp;
