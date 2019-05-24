import { Fixy } from 'components/fixy/Fixy';
import React from 'react';
import { render } from 'test/utils';

describe(Fixy.name, () => {
  it('renders', () => {
    const { baseElement } = render(<Fixy />);
    expect(baseElement).toMatchSnapshot();
  });
});
