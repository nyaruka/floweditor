import {
  Alphanumeric,
  HeaderName,
  LessThan,
  MoreThan,
  Numeric,
  NumOrExp,
  Regex,
  Required,
  StartIsNonNumeric,
  validate,
  ValidURL
} from 'store/validators';

describe('validators', () => {
  it('validates', () => {
    expect(validate('arg', '5', [Numeric])).toMatchSnapshot();
  });

  it('validates required', () => {
    expect(Required('arg', 'not missing').failures.length).toEqual(0);
    expect(Required('arg', null).failures.length).toEqual(1);
    expect(Required('arg', '').failures.length).toEqual(1);
    expect(Required('arg', []).failures.length).toEqual(1);
  });

  it('validates numbers', () => {
    expect(Numeric('arg', '5').failures.length).toEqual(0);
    expect(Numeric('arg', '.5').failures.length).toEqual(0);
    expect(Numeric('arg', '0.5').failures.length).toEqual(0);
    expect(Numeric('arg', '1.5').failures.length).toEqual(0);
    expect(Numeric('arg', '1.5 goats').failures.length).toEqual(1);
    expect(Numeric('arg', 'not a number').failures.length).toEqual(1);
    expect(Numeric('arg', '@expressions_not_allowed').failures.length).toEqual(1);
  });

  it('validates urls', () => {
    expect(ValidURL('arg', 'http://nyaruka.com').failures.length).toEqual(0);
    expect(ValidURL('arg', 'http').failures.length).toEqual(1);
  });

  it('validates regexes', () => {
    expect(Regex('arg', '.*').failures.length).toEqual(0);
    expect(Regex('arg', '@contact').failures.length).toEqual(0);
    expect(Regex('arg', '?').failures.length).toEqual(1);
  });

  it('validates less than', () => {
    expect(LessThan(10, 'max')('arg', '5').failures.length).toEqual(0);
    expect(LessThan(10, 'max')('arg', '15').failures.length).toEqual(1);
  });

  it('validates more than', () => {
    expect(MoreThan(10, 'max')('arg', '15').failures.length).toEqual(0);
    expect(MoreThan(10, 'max')('arg', '5').failures.length).toEqual(1);
  });

  it('validates doesnt start with a number', () => {
    expect(StartIsNonNumeric('arg', 'ok5').failures.length).toEqual(0);
    expect(StartIsNonNumeric('arg', '5bad').failures.length).toEqual(1);
  });

  it('validates alphanumeric', () => {
    expect(Alphanumeric('arg', '5').failures.length).toEqual(0);
    expect(Alphanumeric('arg', 'abc').failures.length).toEqual(0);
    expect(Alphanumeric('arg', '5abc').failures.length).toEqual(0);
    expect(Alphanumeric('arg', '-23').failures.length).toEqual(0);
    expect(Alphanumeric('arg', '0.5abc').failures.length).toEqual(1);
    expect(Alphanumeric('arg', '@#!').failures.length).toEqual(1);
  });

  it('validates numeric or expression', () => {
    expect(NumOrExp('arg', '5').failures.length).toEqual(0);
    expect(NumOrExp('arg', '0.5').failures.length).toEqual(0);
    expect(NumOrExp('arg', '.5').failures.length).toEqual(0);
    expect(NumOrExp('arg', '@fields.age').failures.length).toEqual(0);
    expect(NumOrExp('arg', 'bad').failures.length).toEqual(1);
    expect(NumOrExp('arg', 'bad @fields.age').failures.length).toEqual(1);
    expect(NumOrExp('arg', 'bad 345').failures.length).toEqual(1);
  });

  it('validates http header names', () => {
    expect(HeaderName('arg', 'good-name').failures.length).toEqual(0);
    expect(HeaderName('arg', 'bad name').failures.length).toEqual(1);
    expect(HeaderName('arg', 'bad-name$').failures.length).toEqual(0);
    expect(HeaderName('arg', '#$123').failures.length).toEqual(0);
  });
});
