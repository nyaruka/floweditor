import * as React from 'react';
import {
    addCommas,
    emphasize,
    getBaseLanguage,
    getLanguage,
    getLocalization,
    getSelectClass,
    hasErrorType,
    jsonEqual,
    reorderList,
    snakify,
    titleCase,
    toBoolMap,
    validUUID,
    propertyExists,
    renderIf
} from '.';
import { operatorConfigList } from '../config';
import { ContactProperties } from '../flowTypes';

const config = require('../../assets/config');
const {
    results: [{ definition: colorsFlow }]
} = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [{ actions: [sendMsgAction] }] } = colorsFlow;

describe('utils', () => {
    describe('toBoolMap', () => {
        it('should turn a string array into a bool map', () => {
            const strArr: string[] = [
                'language',
                'facebook',
                'telegram',
                'email',
                'mailto',
                'name',
                'first name',
                'phone',
                'groups',
                'uuid',
                'created by',
                'modified by',
                'org',
                'is',
                'has',
                'tel'
            ];
            const expected: { [key: string]: boolean } = {
                'created by': true,
                email: true,
                facebook: true,
                'first name': true,
                groups: true,
                has: true,
                is: true,
                language: true,
                mailto: true,
                'modified by': true,
                name: true,
                org: true,
                phone: true,
                tel: true,
                telegram: true,
                uuid: true
            };

            expect(toBoolMap(strArr)).toEqual(expected);
        });
    });

    describe('addCommas', () => {
        it('should insert commas into numbers where appropriate', () => {
            expect(addCommas(999)).toBe('999');
            expect(addCommas(10000)).toBe('10,000');
            expect(addCommas(10000000)).toBe('10,000,000');
        });
    });

    describe('snakify', () => {
        it('should replace spaces with underscores', () => {
            expect(snakify('my result name')).toBe('my_result_name');
        });
    });

    describe('validUUID', () => {
        it('matches a valid v4 UUID', () => {
            const v4 = '9ddd2483-3071-498d-bd4e-0fe9c0b2fa94';
            const v4Upper = '06FDAF8D-9905-4DA7-B94D-7BA3532D3953';

            expect(validUUID(v4)).toBeTruthy();
            expect(validUUID(v4Upper)).toBeTruthy();
        });

        it("doesn't match an invalid v4 UUID", () => {
            const v1 = '63955E30-B5DE-11E7-8F1A-0800200C9A66';
            const randStr = 'ZUBikEKpzoD7XOdo74Ux';

            expect(validUUID(v1)).toBeFalsy();
            expect(validUUID(randStr)).toBeFalsy();
        });
    });

    describe('getSelectClass', () => {
        it('should return an empty array if passed "errors" arg less than 1', () =>
            expect(getSelectClass(0)).toEqual(''));

        it("should return an array containing react-select's invalid class", () =>
            expect(getSelectClass(1)).toEqual('select-invalid'));
    });

    describe('titleCase', () =>
        it('should apply title case to each word in a given string', () =>
            ['one', 'one two', 'one two three', 'one,two', 'one, two'].forEach(str =>
                expect(titleCase(str)).toMatchSnapshot()
            )));

    describe('reorderList', () =>
        it('should reorder a given list according to index params', () =>
            expect(reorderList([1, 2, 3], 2, 0)).toEqual([3, 1, 2])));

    describe('jsonEqual', () => {
        const [anyWordOperator, allWordsOperator] = operatorConfigList;

        it('should return true if basic objects are equal in contents and order', () =>
            expect(jsonEqual(anyWordOperator, anyWordOperator)).toBeTruthy());

        it('should return false if basic objects are not equal in contents and order', () =>
            expect(jsonEqual(anyWordOperator, allWordsOperator)).toBeFalsy());
    });

    describe('hasErrorType', () => {
        it('should return false if passed an empty error list', () =>
            expect(hasErrorType([], [/argument/])).toBeFalsy());

        it('should return true if query exits in a string in the error list', () => {
            const errors = ['A category name is required.'];

            expect(hasErrorType(errors, [/category/])).toBeTruthy();
        });
    });

    describe('getBaseLanguage', () => {
        it('should return the language stored in the first key of a Languages map', () => {
            const baseLanguage = getBaseLanguage(config.languages);
            const firstKey = Object.keys(config.languages)[0];

            expect(baseLanguage.iso).toBe(firstKey);
            expect(baseLanguage.name).toBe(config.languages[firstKey]);
        });
    });

    describe('getLanguage', () => {
        it('should return specified language from Languages map if it exists in map', () => {
            const iso = Object.keys(config.languages)[0];

            expect(getLanguage(config.languages, iso)).toEqual({
                name: config.languages[iso],
                iso
            });
        });
    });

    describe('getLocalizations', () => {
        it('should return a localized object', () => {
            ['eng', 'spa', 'fre'].forEach(iso => {
                expect(
                    getLocalization(sendMsgAction, colorsFlow.localization, iso, config.languages)
                ).toMatchSnapshot();
            });
        });
    });

    describe('getLanguage', () => {
        it('should return language as Language', () => {
            Object.keys(config.languages).forEach(iso => {
                const language = getLanguage(config.languages, iso);

                expect(language).toEqual({
                    name: config.languages[iso],
                    iso
                });
                expect(language).toMatchSnapshot();
            });
        });
    });

    describe('getBaseLanguage', () => {
        it("should return Language corresponding to the first property in the Languages object it's passed", () => {
            const baseLanguage = getBaseLanguage(config.languages);

            expect(baseLanguage).toMatchSnapshot();
        });
    });

    describe('emphasize', () => {
        it('should apply emphasis style', () => {
            expect(emphasize('emboldened')).toMatchSnapshot();
        });
    });

    describe('propertyExists', () => {
        it('should return true if property exists on ContactProperties enum', () => {
            Object.keys(ContactProperties).forEach(property =>
                expect(propertyExists(property)).toBeTruthy()
            );
        });

        it('should return false if property does not exist on ContactProperties enum', () => {
            expect(propertyExists('Favorite Song')).toBeFalsy();
        });
    });

    describe('renderIf', () => {
        it('should return element if condition is truthy', () => {
            expect(renderIf(true)(<div />)).toEqual(<div />);
        });

        it('should return null if condition is falsy', () => {
            expect(renderIf(false)(<div />)).toBeNull();
        });
    });
});
