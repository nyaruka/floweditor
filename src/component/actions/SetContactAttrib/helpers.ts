import { AttributeType, SetContactField, SetContactProperty } from '../../../flowTypes';
import { SearchResult } from '../../../store';
import { titleCase, snakify } from '../../../utils';

export const newFieldAction = (uuid: string, value: string, name: string): SetContactField => ({
    type: 'set_contact_field',
    field: {
        key: snakify(name),
        name: titleCase(name)
    },
    uuid,
    value
});

export const newPropertyAction = (uuid: string, value: string, name: string): SetContactProperty => ({
    type: 'set_contact_property',
    property: snakify(name),
    uuid,
    value
});

export const fieldToSearchResult = ({ field: { key, name } }: SetContactField): SearchResult => ({
    id: key,
    name,
    type: AttributeType.field
});

export const propertyToSearchResult = ({ property }: SetContactProperty): SearchResult => ({
    id: property,
    name: titleCase(property),
    type: AttributeType.property
});
