import {
    createSetContactFieldAction,
    createSetContactNameAction
} from '../../../testUtils/assetCreators';
import { newFieldAction, newPropertyAction, propertyToAsset, fieldToAsset } from './helpers';
import { AssetType } from '../../../services/AssetService';

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
                value: setContactName.name,
                type: AssetType.Name
            })
        ).toMatchSnapshot();
    });
});

describe('fieldToAsset', () => {
    it('should return a Asset object', () => {
        expect(fieldToAsset(setContactField)).toEqual({
            id: setContactField.field.key,
            name: setContactField.field.name,
            type: AssetType.Field
        });
    });
});

describe('propertyToAsset', () => {
    it('should return an Asset object', () => {
        expect(propertyToAsset(setContactName)).toMatchSnapshot();
    });
});
