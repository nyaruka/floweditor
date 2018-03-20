import * as React from 'react';
import { SetContactField } from '../../../flowTypes';

const SetContactFieldComp: React.SFC<SetContactField> = ({ value, field_name }): JSX.Element => {
    const fieldName = <span className="emph">{field_name}</span>;

    if (value) {
        return (
            <>
                Update {fieldName} to {value}
            </>
        );
    }

    return <>Clear value for {fieldName}</>;
};

export default SetContactFieldComp;
