import * as React from 'react';
import { SetContactField, SetContactProperty } from '../../../flowTypes';
import { titleCase } from '../../../utils';

const SetContactAttribComp: React.SFC<SetContactField & SetContactProperty> = ({
    field,
    property,
    value
}) => {
    const fieldNameMarkup = (
        <span className="emph">{(property && titleCase(property)) || field.name}</span>
    );
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
