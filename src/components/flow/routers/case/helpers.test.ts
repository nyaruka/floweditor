import { operatorConfigList, Operators } from '~/config/operatorConfigs';
import {
    prefix,
    composeExitName,
    getMinMax,
    isFloat,
    isInt,
    strContainsNum,
    parseNum
} from '~/components/flow/routers/case/helpers';
import { titleCase } from '~/utils';

describe('helpers', () => {
    describe('prefix', () =>
        operatorConfigList.forEach(({ verboseName, type }) =>
            it(`should prefix "${verboseName}" operator appropriately`, () => {
                if (verboseName) {
                    expect(prefix(type)).toMatchSnapshot();
                }
            })
        ));

    describe('composeExitName', () => {
        const operatorType = Operators.has_any_word;
        const strArgOperators = operatorConfigList.slice(0, 6);
        let args = [['tomato, t'], ['papayawhip'], []];

        it('should handle empty arg lists appropriately', () =>
            expect(composeExitName(operatorType, args[2], '')).toBe(''));

        it('should return the first arg in list, capitalized', () => {
            args = args.slice(0, 2);
            strArgOperators.forEach(({ type }) =>
                args.slice(0, 2).forEach(argList => {
                    const [firstArg] = argList[0].split(',');
                    expect(composeExitName(type, argList, '')).toBe(titleCase(firstArg));
                })
            );
        });

        it('should return exit name in the format "min - max" if operator', () => {
            [['1', '2'], ['', '2'], ['1', ''], []].forEach(argList => {
                expect(
                    composeExitName(Operators.has_number_between, argList, '').indexOf('-') > -1
                ).toBeTruthy();
            });
        });

        it("should return newExitName if it's truthy and operator is 'has_number_between'", () => {
            expect(composeExitName(Operators.has_number_between, ['1', '2'], 'Violet')).toBe(
                'Violet'
            );
        });
    });

    describe('getMinMax', () => {
        const emptyStrs = { min: '', max: '' };

        it('should return emtpy strings if arg param is an empty array', () => {
            expect(getMinMax([])).toEqual(emptyStrs);
        });

        it("should return empty strings if arg param doesn't contain two number-containing strings", () => {
            expect(getMinMax(['a', 'b'])).toEqual(emptyStrs);
        });

        it('should return a number-containing string MIN and empty string MAX if first arg is a number-containing string and second arg is not', () => {
            expect(getMinMax(['1', 'b'])).toEqual({ min: '1', max: '' });
        });

        it('should return an empty string MIN and number-containing string MAX if first arg is not a number-containing string and second arg is', () => {
            expect(getMinMax(['a', '2'])).toEqual({ min: '', max: '2' });
        });
    });

    describe('isFloat', () => {
        it('should return true if argument is string containing a float', () => {
            ['0.2', '.2', '+.2', '+0.2', '-.2', '-0.2', '2', '2.'].forEach(arg =>
                expect(isFloat(arg as any)).toBeTruthy()
            );
        });

        it('should return false if argument is not a string containing a float', () => {
            ['u.2', '0.2u', 'a'].forEach(arg => expect(isFloat(arg as any)).toBeFalsy());
        });
    });

    describe('isInt', () => {
        it('should return true if argument is string containing an int', () => {
            ['1', '+1', '-1'].forEach(arg => expect(isInt(arg)).toBeTruthy());
        });

        it('should return false if argument is not a string containing an int', () => {
            ['0.1', 'e24', '-.3', '5+', '5-', 'a'].forEach(arg => expect(isInt(arg)).toBeFalsy());
        });
    });

    describe('strContainsNum', () => {
        it('should return true if string contains only a float or int', () => {
            ['0.2', '.2', '+.2', '+0.2', '-.2', '-0.2', '2', '2.', '1', '+1', '-1'].forEach(arg =>
                expect(strContainsNum(arg)).toBeTruthy()
            );
        });

        it('should return false if string does not contain only a float or int', () => {
            ['a', 'e24', '2a', '0.2u', 'u.2', 'u0.2'].forEach(arg =>
                expect(strContainsNum(arg)).toBeFalsy()
            );
        });
    });

    describe('parseNum', () => {
        it('should return a float if passed a string containing only a float', () => {
            const float = parseNum('0.2');

            expect(typeof float === 'number' && isFinite(float)).toBeTruthy();
        });

        it('should return an int if passed a string containing only an int', () => {
            const int = parseNum('1');

            expect(typeof int === 'number' && isFinite(int)).toBeTruthy();
        });
    });
});
