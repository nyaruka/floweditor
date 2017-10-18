import { addCommas, snakify, toBoolMap } from './utils';

describe('utils', () => {
    describe('toBoolMap', () => {
        it('turns a string array into a bool map', () => {
            const stringArr: string[] = ['I\'m', 'a', 'string', 'array'];
            expect(toBoolMap(stringArr)).toMatchSnapshot();
        });
    });
    describe('snakify', () => {
        it('replaces spaces with underscores', () => {
            const result = 'my result name';
            expect(snakify(result)).toMatchSnapshot();
        });
    });
});
