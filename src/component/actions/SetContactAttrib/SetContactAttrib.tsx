import * as React from 'react';

import { Types } from '../../../config/typeConfigs';
import { SetContactField, SetContactName, SetContactProperty } from '../../../flowTypes';
import { emphasize, titleCase } from '../../../utils';

type Attribute = SetContactField | SetContactProperty;

export const getAttribNameMarkup = (action: Attribute): JSX.Element => {
    switch (action.type) {
        case Types.set_contact_field:
            return emphasize((action as SetContactField).field.name);
        case Types.set_contact_name:
            return emphasize(titleCase((action as SetContactName).name));
    }
};

const SetContactAttribComp: React.SFC<Attribute> = action => {
    const attribNameMarkup = getAttribNameMarkup(action);
    switch (action.type) {
        case Types.set_contact_field:
            return (action as SetContactField).value ? (
                <div>
                    Update {attribNameMarkup} to {emphasize(action.value)}
                </div>
            ) : (
                <div>Clear value for {attribNameMarkup}</div>
            );
        case Types.set_contact_name:
            return (action as SetContactName) ? (
                <div>
                    Update {attribNameMarkup} to {emphasize((action as SetContactName).name)}
                </div>
            ) : (
                <div>Clear value for {attribNameMarkup}</div>
            );
    }
};

export default SetContactAttribComp;
