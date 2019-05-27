import UnicodeList, { UnicodeListProps, utfWarning } from 'components/form/textinput/UnicodeList';
import React from 'react';
import { render } from 'react-testing-library';
import { composeComponentTestUtils } from 'testUtils';

const baseProps: UnicodeListProps = {
  unicodeChars: {
    '😎': true,
    '👍': true
  }
};

const { setup } = composeComponentTestUtils<UnicodeListProps>(UnicodeList, baseProps);

describe('UnicodeList', () => {
  describe('helpers', () => {
    describe('utfWarning', () => {
      it('should pluralize "character" if passed a number other than 1', () => {
        expect(utfWarning(2).indexOf('characters') > -1).toBeTruthy();
      });

      it("shouldn't pluralize 'character' if passed the number 1", () => {
        expect(utfWarning(1).indexOf('character') > -1).toBeTruthy();
      });
    });
  });

  describe('render', () => {
    it('should render self, children with base props', () => {
      const { getByTestId } = render(<UnicodeList {...baseProps} />);
      expect(getByTestId('unicode-list-container')).toMatchSnapshot();
    });
  });
});
