import { Types } from '~/config/typeConfigs';
import { SetContactName } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { createSetContactFieldAction, createSetContactNameAction } from '~/testUtils/assetCreators';

import {
    fieldToAsset,
    newFieldAction,
    newPropertyAction,
    propertyToAsset
} from '~/components/flow/actions/setcontactattrib/helpers';

const setContactName = createSetContactNameAction();
const setContactField = createSetContactFieldAction();

describe('newFieldAction', () => {
    it('should return a SetContactField action', () => {
        expect(
            newFieldAction({
                uuid: setContactField.uuid,
                value: setContactField.value,
                name: setContactField.field.key
            })
        ).toEqual(setContactField);
    });
});

describe('newPropertyAction', () => {
    it('should return a new SetContactName action', () => {
        expect(
            newPropertyAction({
                uuid: setContactName.uuid,
                value: (setContactName as SetContactName).name,
                type: AssetType.Name
            })
        ).toMatchSnapshot();
    });
});

describe('fieldToAsset', () => {
    it('should return a Asset object', () => {
        expect(fieldToAsset(setContactField.field)).toEqual({
            id: setContactField.field.key,
            name: setContactField.field.name,
            type: AssetType.Field
        });
    });
});

describe('propertyToAsset', () => {
    it('should return an Asset object', () => {
        expect(propertyToAsset(Types.set_contact_name)).toMatchSnapshot();
    });
});
