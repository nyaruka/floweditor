import { Types } from '../../../config/typeConfigs';
import { Action, SetContactField, SetContactName, SetContactProperty } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { snakify, titleCase } from '../../../utils';

export type ContactProperty = Types.set_contact_name;

export const newFieldAction = (uuid: string, value: string, name: string): SetContactField => ({
    type: Types.set_contact_field,
    field: {
        key: snakify(name),
        name: titleCase(name)
    },
    uuid,
    value
});

export const newPropertyAction = (
    uuid: string,
    value: string,
    type: ContactProperty
): SetContactProperty => {
    const action: Action = {
        uuid,
        type
    };
    switch (type) {
        case Types.set_contact_name:
            return {
                ...action,
                name: value
            } as SetContactName;
    }
};

export const fieldToAsset = ({ field: { key, name } }: SetContactField): Asset => ({
    id: key,
    name,
    type: AssetType.Field
});

export const propertyToAsset = (property: SetContactProperty): Asset => {
    const asset = {
        type: AssetType.Property
    };
    switch (property.type) {
        case Types.set_contact_name:
            return {
                ...asset,
                name: titleCase(property.name),
                id: property.name
            };
    }
};
