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
    let value;

    switch (action.type) {
        case Types.set_contact_field:
            ({ field: { name: value } } = action as SetContactField);
            break;
        case Types.set_contact_name:
            value = AssetType.Name;
            break;
        case Types.set_contact_language:
            value = AssetType.Language;
            break;
        case Types.set_contact_channel:
            value = AssetType.Channel;
            break;
    }

    return emphasize(titleCase(value));
};

export const getActionMarkup = (
    value: string,
    attribNameMarkup: JSX.Element,
    clearValueMarkup: JSX.Element
) =>
    value ? (
        <>
            Update {attribNameMarkup} to {emphasize(value)}
        </>
    ) : (
        clearValueMarkup
    );

const SetContactAttribComp: React.SFC<Attribute> = action => {
    const attribNameMarkup = getAttribNameMarkup(action);
    const clearValueMarkup = <>Clear value for {attribNameMarkup}</>;

    let value: string;
    switch (action.type) {
        case Types.set_contact_field:
            ({ value } = action as SetContactField);
        case Types.set_contact_name:
            ({ name: value } = action as SetContactName);
            break;
        case Types.set_contact_language:
            ({ name: value } = getLanguage((action as SetContactLanguage).language));
            break;
        case Types.set_contact_channel:
            ({ channel: { name: value } } = action as SetContactChannel);
            break;
    }

    return getActionMarkup(value, attribNameMarkup, clearValueMarkup);
};

export default SetContactAttribComp;
