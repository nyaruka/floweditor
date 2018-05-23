import { Types } from '../../../config/typeConfigs';
import { Action, Channel, Field, Language, SetContactField, SetContactName, SetContactProperty } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { snakify, titleCase } from '../../../utils';
import { set_contact_name } from '../Action/Action.scss';

export type ContactProperty = Types.set_contact_name;

export const newFieldAction = ({
    uuid,
    value,
    name
}: {
    uuid: string;
    value: string;
    name: string;
}): SetContactField => ({
    type: Types.set_contact_field,
    field: {
        key: snakify(name),
        name: titleCase(name)
    },
    uuid,
    value
});

export const newPropertyAction = ({
    uuid,
    value,
    type
}: {
    uuid: string;
    value: string;
    type: AssetType;
}): SetContactProperty => {
    const action: Partial<Action> = {
        uuid
    };
    switch (type) {
        case AssetType.Name:
            return {
                ...action,
                type: Types.set_contact_name,
                name: value
            } as SetContactName;
    }
};

export const fieldToAsset = (field: Field = { key: '', name: '' }): Asset => ({
    id: field.key,
    name: field.name,
    type: AssetType.Field
});

export const assetToField = (asset: Asset): Field => ({
    key: asset.id,
    name: asset.name
});

export const propertyToAsset = (
    type: Types.set_contact_name | Types.set_contact_language | Types.set_contact_channel
): Asset => {
    switch (type) {
        case Types.set_contact_name:
            return {
                type: AssetType.Name,
                name: titleCase(AssetType.Name),
                id: AssetType.Name
            };
        case Types.set_contact_language:
            return {
                type: AssetType.Language,
                name: titleCase(AssetType.Language),
                id: AssetType.Language
            };
        case Types.set_contact_channel:
            return {
                type: AssetType.Channel,
                name: titleCase(AssetType.Channel),
                id: AssetType.Channel
            };
    }
};

export const languageToAsset = ({ iso, name }: Language) => ({
    id: iso,
    name,
    type: AssetType.Language
});

export const channelToAsset = ({ uuid, name }: Channel) => ({
    id: uuid,
    name,
    type: AssetType.Language
});
