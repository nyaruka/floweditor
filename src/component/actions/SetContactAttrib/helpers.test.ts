import {
    createSetContactFieldAction,
    createSetContactPropertyAction
} from '../../../testUtils/assetCreators';
import { newFieldAction, newPropertyAction, propertyToAsset, fieldToAsset } from './helpers';
import { AssetType } from '../../../services/AssetService';

const setContactProperty = createSetContactPropertyAction();
const setContactField = createSetContactFieldAction();

describe('newFieldAction', () => {
    it('should return a SetContactField action', () => {
        expect(
            newFieldAction(setContactField.uuid, setContactField.value, setContactField.field.key)
        ).toEqual(setContactField);
    });
});

describe('newPropertyAction', () => {
    it('should return a new SetContactProperty action', () => {
        expect(
            newPropertyAction(
                setContactProperty.uuid,
                setContactProperty.value,
                setContactProperty.property
            )
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
        expect(propertyToAsset(setContactProperty)).toMatchSnapshot();
    });
});
