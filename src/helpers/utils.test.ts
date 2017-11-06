import { addCommas, snakify, toBoolMap, validUUID, getDisplayName } from './utils';

describe('utils', () => {
    describe('toBoolMap()', () => {
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

    describe('snakify()', () => {
        it('should replace spaces with underscores', () => {
            expect(snakify('my result name')).toBe('my_result_name');
        });
    });

    describe('validUUID()', () => {
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

    xdescribe('getDisplayName', () => {
        it("should return a react component's display name when wrapped in an HOC", () => {});
    });
});
