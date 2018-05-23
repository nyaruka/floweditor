import * as React from 'react';

import { Types } from '../../../config/typeConfigs';
import {
    SetContactChannel,
    SetContactField,
    SetContactLanguage,
    SetContactName,
    SetContactProperty,
} from '../../../flowTypes';
import { AssetType } from '../../../services/AssetService';
import { emphasize, titleCase } from '../../../utils';
import { getLanguage } from '../../../utils/languageMap';

type Attribute = SetContactField | SetContactProperty;

export const getAttribNameMarkup = (action: Attribute): JSX.Element => {
    switch (action.type) {
        case Types.set_contact_field:
            return emphasize((action as SetContactField).field.name);
        case Types.set_contact_name:
            return emphasize(titleCase(AssetType.Name));
        case Types.set_contact_language:
            return emphasize(titleCase(AssetType.Language));
        case Types.set_contact_channel:
            return emphasize(titleCase(AssetType.Channel));
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
        case Types.set_contact_language:
            return (action as SetContactLanguage).language ? (
                <>
                    Update {attribNameMarkup} to{' '}
                    {emphasize(getLanguage((action as SetContactLanguage).language).name)}
                </>
            ) : (
                clearValueMarkup
            );
        case Types.set_contact_channel:
            return (action as SetContactChannel).channel ? (
                <>
                    Update {attribNameMarkup} to
                    {emphasize((action as SetContactChannel).channel.name)}
                </>
            ) : (
                clearValueMarkup
            );
    }
};

export default SetContactAttribComp;
