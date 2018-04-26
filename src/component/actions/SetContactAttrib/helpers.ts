import { Types } from '../../../config/typeConfigs';
import { SetContactField, SetContactProperty } from '../../../flowTypes';
import { snakify, titleCase } from '../../../utils';
import { Asset, AssetType } from '../../../services/AssetService';

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
    name: string
): SetContactProperty => ({
    type: Types.set_contact_property,
    property: snakify(name),
    uuid,
    value
});

export const fieldToAsset = ({ field: { key, name } }: SetContactField): Asset => ({
    id: key,
    name,
    type: AssetType.Field
});

export const propertyToAsset = ({ property }: SetContactProperty): Asset => ({
    id: property,
    name: titleCase(property),
    type: AssetType.Property
});
