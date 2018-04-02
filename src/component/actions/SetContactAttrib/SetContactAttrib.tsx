import * as React from 'react';
import { SetContactField, SetContactProperty } from '../../../flowTypes';
import { titleCase, emphasize } from '../../../utils';

type Attribute = SetContactField | SetContactProperty;

export const getFieldNameMarkup = (action: Attribute): JSX.Element => {
    if ((action as SetContactProperty).property) {
        return emphasize(titleCase((action as SetContactProperty).property));
    }
    return emphasize((action as SetContactField).field.name);
};

const SetContactAttribComp: React.SFC<Attribute> = action => {
    const fieldNameMarkup = getFieldNameMarkup(action);
    if (action.value.length) {
        return (
            <div>
                Update {fieldNameMarkup} to {emphasize(action.value)}
            </div>
        );
    }
    return <div>Clear value for {fieldNameMarkup}</div>;
};

export default SetContactAttribComp;
