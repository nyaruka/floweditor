import { AttributeType } from '../../../flowTypes';
import {
    createSetContactFieldAction,
    createSetContactPropertyAction
} from '../../../testUtils/assetCreators';
import { newFieldAction, newPropertyAction, propertyToAsset, fieldToAsset } from './helpers';

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

describe('fieldToSearchResult', () => {
    it('should return a SearchResult object', () => {
        expect(fieldToAsset(setContactField)).toEqual({
            id: setContactField.field.key,
            name: setContactField.field.name,
            type: AttributeType.field
        });
    });
});

describe('propertyToSearchResult', () => {
    it('should return a SearchResult object', () => {
        expect(propertyToAsset(setContactProperty)).toMatchSnapshot();
    });
});
