import CharCount from 'components/form/textinput/CharCount';
import React from 'react';
import { render } from 'test/utils';

describe('CharCount >', () => {
  describe('render >', () => {
    it('should display count', () => {
      const count = 67;
      const parts = 2;
      const unicodeChars = {};
      const { container } = render(
        <CharCount count={count} parts={parts} unicodeChars={unicodeChars} />
      );

      expect(container).toMatchSnapshot();
    });

    it("should render UnicodeLIst if 'unicodeChars' prop is substantive", () => {
      const count = 67;
      const parts = 2;
      const unicodeChars = {
        '💩': true,
        '🚨': true
      };
      const { getByTestId } = render(
        <CharCount count={count} parts={parts} unicodeChars={unicodeChars} />
      );

      expect(getByTestId('unicode-list')).toMatchSnapshot();
    });

    it("shouldn't render UnicodeList if 'unicodeChars' prop isn't substantive", () => {
      const count = 67;
      const parts = 2;
      const unicodeChars = {};
      const { queryByTestId } = render(
        <CharCount count={count} parts={parts} unicodeChars={unicodeChars} />
      );

      expect(queryByTestId('unicode-list')).toBeNull();
    });
  });
});
