import * as React from 'react';

import { Types } from '../../../config/typeConfigs';
import { SetContactField, SetContactName, SetContactProperty } from '../../../flowTypes';
import { AssetType } from '../../../services/AssetService';
import { emphasize, titleCase } from '../../../utils';

type Attribute = SetContactField | SetContactProperty;

export const getAttribNameMarkup = (action: Attribute): JSX.Element => {
    switch (action.type) {
        case Types.set_contact_field:
            return emphasize((action as SetContactField).field.name);
        case Types.set_contact_name:
            return emphasize(titleCase(AssetType.Name));
    }
};

const SetContactAttribComp: React.SFC<Attribute> = action => {
    const attribNameMarkup = getAttribNameMarkup(action);
    const clearValueMarkup = <>Clear value for {attribNameMarkup}</>;
    switch (action.type) {
        case Types.set_contact_field:
            return (action as SetContactField).value ? (
                <>
                    Update {attribNameMarkup} to {emphasize(action.value)}
                </>
            ) : (
                clearValueMarkup
            );
        case Types.set_contact_name:
            return (action as SetContactName).name ? (
                <>
                    Update {attribNameMarkup} to {emphasize((action as SetContactName).name)}
                </>
            ) : (
                clearValueMarkup
            );
    }
};

export default SetContactAttribComp;
