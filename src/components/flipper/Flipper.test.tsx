import Flipper, { FlipperProps } from 'components/flipper/Flipper';
import * as React from 'react';
import { fireEvent, render } from 'test/utils';

const baseProps: FlipperProps = {
  front: <div>Front</div>,
  back: <div>Back</div>
};

describe(Flipper.name, () => {
  it('should render', () => {
    const { baseElement } = render(<Flipper {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should flip', () => {
    const { baseElement, getByTestId } = render(<Flipper {...baseProps} />);
    fireEvent.click(getByTestId('flip'));
    expect(baseElement).toMatchSnapshot();
  });
});
