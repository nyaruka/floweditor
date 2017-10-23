import { addCommas, snakify, toBoolMap } from './utils';

describe('utils', () => {
    describe('toBoolMap()', () => {
        it('turns a string array into a bool map', () => {
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
        it('Inserts commas into numbers where appropriate', () => {
            expect(addCommas(999)).toBe('999'); 
            expect(addCommas(10000)).toBe('10,000'); 
            expect(addCommas(10000000)).toBe('10,000,000');  
        }); 
    }); 

    describe('snakify()', () => {
        it('replaces spaces with underscores', () => {
            expect(snakify('my result name')).toBe('my_result_name');
        });
    });
});
