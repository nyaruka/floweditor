import {
    isValidURL,
    validateNumeric,
    validateNumericOrExpression,
    validate,
    validateRequired,
    validateURL,
    validateRegex,
    validateLessThan,
    validateMoreThan
} from '~/store/validators';

describe('validators', () => {
    it('validates urls', () => {
        expect(isValidURL('arst')).toBeFalsy();
        expect(isValidURL('http://www.nyaruka.com')).toBeTruthy();
    });

    it('validates', () => {
        expect(validate('arg', '5', [validateNumeric])).toMatchSnapshot();
    });

    it('validates required', () => {
        expect(validateRequired('arg', null).failures.length).toEqual(1);
        expect(validateRequired('arg', '').failures.length).toEqual(1);
        expect(validateRequired('arg', []).failures.length).toEqual(1);
        expect(validateRequired('arg', 'not missing').failures.length).toEqual(0);
    });

    it('validates numbers', () => {
        expect(validateNumeric('arg', '5').failures.length).toEqual(0);
        expect(validateNumeric('arg', 'not a number').failures.length).toEqual(1);
        expect(validateNumeric('arg', '@expressions_not_allowed').failures.length).toEqual(1);

        expect(validateNumericOrExpression('arg', '@allowed').failures.length).toEqual(0);
        expect(validateNumericOrExpression('arg', '5').failures.length).toEqual(0);
        expect(validateNumericOrExpression('arg', 'nope').failures.length).toEqual(1);
    });

    it('validates urls', () => {
        expect(validateURL('arg', 'http').failures.length).toEqual(1);
        expect(validateURL('arg', 'http://nyaruka.com').failures.length).toEqual(0);
    });

    it('validates regexes', () => {
        expect(validateRegex('arg', '.*').failures.length).toEqual(0);
        expect(validateRegex('arg', '?').failures.length).toEqual(1);
        expect(validateRegex('arg', '@contact').failures.length).toEqual(0);
    });

    it('validates ranges', () => {
        expect(validateLessThan(10, 'max')('arg', '5').failures.length).toEqual(0);
        expect(validateLessThan(10, 'max')('arg', '15').failures.length).toEqual(1);
        expect(validateMoreThan(10, 'max')('arg', '15').failures.length).toEqual(0);
        expect(validateMoreThan(10, 'max')('arg', '5').failures.length).toEqual(1);
    });
});
