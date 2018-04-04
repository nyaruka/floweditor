import {
    ContactProperties,
    SetContactField,
    SetContactProperty,
    SendMsg
} from '../../../flowTypes';

export const setContactProperty: SetContactProperty = {
    type: 'set_contact_property',
    uuid: '4fac7935-d13b-4b36-bf15-98075dca822a',
    property: ContactProperties.Name.toLowerCase(),
    value: 'Jane Doe'
};

export const setContactField: SetContactField = {
    type: 'set_contact_field',
    uuid: '445fc64c-2a18-47cc-89d0-15172826bfcc',
    field: {
        key: 'age',
        name: 'Age'
    },
    value: '25'
};
