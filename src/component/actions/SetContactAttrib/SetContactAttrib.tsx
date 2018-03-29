import * as React from 'react';
import { SetContactField, SetContactProperty } from '../../../flowTypes';

const SetContactAttribComp: React.SFC<SetContactField & SetContactProperty> = ({
    field_name,
    property_name,
    value
}) => {
    const fieldNameMarkup = <span className="emph">{field_name || property_name}</span>;
    const valueMarkup = <span className="emph">{value}</span>;
    if (value) {
        return (
            <div>
                Update {fieldNameMarkup} to {valueMarkup}
            </div>
        );
    }
    return <div>Clear value for {fieldNameMarkup}</div>;
};

export default SetContactAttribComp;
