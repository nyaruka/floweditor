import * as React from 'react';
import { render } from 'test/utils';
import MountScroll from './MountScroll';

describe(MountScroll.name, () => {
  it('renders', () => {
    const { baseElement } = render(<MountScroll />);
    expect(baseElement).toMatchSnapshot();
  });
});
