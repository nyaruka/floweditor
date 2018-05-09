import { Types } from '../../../config/typeConfigs';
import { Action, SetContactField, SetContactName, SetContactProperty } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { snakify, titleCase } from '../../../utils';

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

export const fieldToAsset = ({ field: { key, name } }: SetContactField): Asset => ({
    id: key,
    name,
    type: AssetType.Field
});

export const propertyToAsset = (property: SetContactProperty): Asset => {
    switch (property.type) {
        case Types.set_contact_name:
            return {
                type: AssetType.Name,
                name: titleCase(AssetType.Name),
                id: AssetType.Name
            };
    }
};
