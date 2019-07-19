import { GSM } from 'components/form/textinput/constants';
import { cleanMsg, getUnicodeChars, isUnicode } from 'components/form/textinput/helpers';
import { AssetType } from 'store/flowContext';
import { pluralize } from 'utils';

const winkEmoji = '😉';

describe('helpers', () => {
  describe('isUnicode', () => {
    it('should return true if arg is Unicode, false otherwise', () => {
      expect(isUnicode(winkEmoji)).toBeTruthy();
      Object.keys(GSM).forEach((key: string) => expect(isUnicode(key)).toBeFalsy());
    });
  });

  describe('getUnicodeChars', () => {
    it('should return an "empty" object if not passed a string containing Unicode chars', () => {
      expect(getUnicodeChars('abcd')).toEqual({});
    });

    it('should return a UnicodeCharMap if passed a string containing Unicode chars', () => {
      expect(getUnicodeChars(winkEmoji)).toEqual({ [winkEmoji]: true });
    });
  });

  describe('cleanMsg', () => {
    it('should replace specified unicode characters with their GSM counterparts', () =>
      expect(cleanMsg('“”‘’— …–')).toBe(`""''- ...-`));
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
