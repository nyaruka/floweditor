import {
    cleanMsg,
    filterOptions,
    getOptionsList,
    pluralize,
    isUnicode,
    getUnicodeChars
} from './helpers';
import { OPTIONS, GSM } from './constants';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const optionQueryMap = OPTIONS.reduce((argMap, { name }) => {
    const lastIndex = name.lastIndexOf('.');
    if (lastIndex > -1) {
        argMap[name.slice(0, lastIndex + 2)] = true;
        argMap[name.slice(0, lastIndex + 3)] = true;
        argMap[name] = true;
    } else {
        argMap[name.slice(0, 1)] = true;
        argMap[name.slice(0, 2)] = true;
        argMap[name] = true;
        argMap[`${name}.`] = true;
    }
    return argMap;
}, {});

describe('helpers >', () => {
    describe('isUnicode >', () => {
        it('should return true if arg is Unicode, false otherwise', () => {
            expect(isUnicode('😎')).toBeTruthy();
            Object.keys(GSM).forEach(key => expect(isUnicode(key)).toBeFalsy());
        });
    });

    describe('getUnicodeChars >', () => {
        it('should return an "empty" object if not passed a string containing Unicode chars', () => {
            expect(getUnicodeChars('abcd')).toEqual({});
        });

        it('should return a UnicodeCharMap if passed a string containing Unicode chars', () => {
            expect(getUnicodeChars('😃')).toEqual({ '😃': true });
        });
    });

    describe('cleanMsg >', () => {
        it('should replace specified unicode characters with their GSM counterparts', () =>
            expect(cleanMsg('“”‘’— …–')).toBe(`""''- ...-`));
    });

    describe('filterOptions >', () => {
        it('should return an empty array if not passed a query', () =>
            expect(filterOptions(OPTIONS)).toEqual([]));

        Object.keys(optionQueryMap).forEach(query =>
            it(`should filter options for "${query}"`, () =>
                expect(filterOptions(OPTIONS, query)).toMatchSnapshot())
        );
    });

    describe('pluralize', () => {
        it("should apply suffix to noun if count param isn't 1", () => {
            expect(pluralize(2, 'character')).toBe('characters');
        });

        it("shouldn't apply suffix to noun if count is 1", () => {
            expect(pluralize(1, 'character')).toBe('character');
        });
    });
});
