import ExcellentParser from 'components/form/textinput/ExcellentParser';

const parser = new ExcellentParser('@', [
  'channel',
  'child',
  'parent',
  'contact',
  'date',
  'extra',
  'flow',
  'step'
]);

describe(ExcellentParser.name, () => {
  it('extracts expressions', () => {
    expect(parser.expressionContext('this @contact.na')).toBe('contact.na');
    expect(parser.expressionContext('@contact.begin')).toBe('contact.begin');
  });

  it('ignores complete expressions', () => {
    expect(parser.expressionContext('you have @(max(contact.balance, 50))')).toBeNull();
    expect(parser.expressionContext('Hi @contact.name, how are you?')).toBeNull();
  });

  it('identifies last incomplete expression', () => {
    expect(parser.expressionContext('this @contact.name is @contact.age')).toBe('contact.age');
  });

  it('identifies open functions', () => {
    expect(parser.expressionContext('you have @(max(contact.balance, 50)')).toBe(
      '(max(contact.balance, 50)'
    );
  });

  it('requires expression character', () => {
    expect(parser.expressionContext('contact.begin')).toBeNull();
  });
});
