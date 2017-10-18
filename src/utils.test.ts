import { addCommas, snakify, toBoolMap } from './utils';

describe('utils', () => {
    describe('toBoolMap', () => {
        it('turns a string array into a bool map', () => {
            const fields: string[] = [
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
            expect(toBoolMap(fields)).toMatchSnapshot();
        });
    });
    describe('snakify', () => {
        it('replaces spaces with underscores', () => {
            const result = 'my result name';
            expect(snakify(result)).toMatchSnapshot();
        });
    });
});
