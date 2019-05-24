import Button, { ButtonTypes } from 'components/button/Button';
import React from 'react';
import { fireEvent, render } from 'test/utils';

describe(Button.name, () => {
  describe('render', () => {
    it('should render self, children with base props', () => {
      const { baseElement } = render(
        <Button name="Save" onClick={jest.fn()} type={ButtonTypes.primary} />
      );
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('interaction', () => {
    it('should execute onClick callback when clicked', () => {
      const onClick = jest.fn();
      const { getByText } = render(
        <Button name="Save" onClick={onClick} type={ButtonTypes.primary} />
      );

      fireEvent.click(getByText('Save'));
      expect(onClick).toHaveBeenCalled();
    });
  });
});
