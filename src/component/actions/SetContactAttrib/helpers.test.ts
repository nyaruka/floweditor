import {
    newFieldAction,
    newPropertyAction,
    fieldToSearchResult,
    propertyToSearchResult
} from './helpers';
import { setContactField, setContactProperty } from './__test__';
import { AttributeType } from '../../../flowTypes';
import { titleCase } from '../../../utils';

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
        ).toEqual(setContactProperty);
    });
});

describe('fieldToSearchResult', () => {
    it('should return a SearchResult object', () => {
        expect(fieldToSearchResult(setContactField)).toEqual({
            id: setContactField.field.key,
            name: setContactField.field.name,
            type: AttributeType.field
        });
    });
});

describe('propertyToSearchResult', () => {
    it('should return a SearchResult object', () => {
        expect(propertyToSearchResult(setContactProperty)).toEqual({
            id: setContactProperty.property,
            name: titleCase(setContactProperty.property),
            type: AttributeType.property
        });
    });
});
