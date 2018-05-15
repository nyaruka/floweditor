import { v4 as generateUUID } from 'uuid';

import { Types } from '../../../config/typeConfigs';
import {
    Action,
    Field,
    SetContactField,
    SetContactName,
    SetContactProperty
} from '../../../flowTypes';
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

export const fieldToAsset = ({
    uuid = generateUUID(),
    field = { key: '', name: '' },
    type = Types.set_contact_field
}: SetContactField): Asset => ({
    id: field.key,
    name: field.name,
    type: AssetType.Field
});

export const assetToField = (asset: Asset): Field => ({
    key: asset.id,
    name: asset.name
});

export const propertyToAsset = ({
    uuid = generateUUID(),
    name = '',
    type = Types.set_contact_name
}: SetContactProperty): Asset => {
    switch (type) {
        case Types.set_contact_name:
            return {
                type: AssetType.Name,
                name: titleCase(AssetType.Name),
                id: AssetType.Name
            };
    }
};
