import * as React from 'react';
import { SetContactField } from '../../../flowTypes';

const SetContactFieldComp: React.SFC<SetContactField> = ({ value, field_name }): JSX.Element => {
    const fieldName = <span className="emph">{field_name}</span>;

    if (value) {
        return (
            <div>
                Update {fieldName} to {value}
            </div>
        );
    }

    return <div>Clear value for {fieldName}</div>;
};

export default SetContactFieldComp;
