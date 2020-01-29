import { render, mock, fireEvent } from 'test/utils';
import * as React from 'react';
import ContextExplorer, { ContextExplorerProps } from './ContextExplorer';

const props: ContextExplorerProps = {
  visible: true,
  onClose: jest.fn(),
  contents: {
    day: '020120',
    temperatures: [23.2, 21.2, 20.3, 20.5, 20.11, 21.3],
    location: 'A1B2C3'
  }
};

describe(ContextExplorer.name, () => {
  it('should render', () => {
    const { baseElement, queryAllByText } = render(<ContextExplorer {...props} />);

    // root values should be visible
    expect(queryAllByText('020120').length).toBe(1);
    expect(queryAllByText('A1B2C3').length).toBe(1);
    expect(queryAllByText('[6]').length).toBe(1);

    // children should not be
    expect(queryAllByText('23.2').length).toBe(0);

    expect(baseElement).toMatchSnapshot();
  });

  it('should expand and collapse', () => {
    const { queryAllByText, getByText, baseElement } = render(<ContextExplorer {...props} />);

    // our array values shouldn't be visible
    expect(queryAllByText('0').length).toBe(0);
    expect(queryAllByText('1').length).toBe(0);
    expect(queryAllByText('2').length).toBe(0);

    // click on temperature
    const tempNode = getByText('temperatures');
    fireEvent.click(tempNode);

    // now our array values should each have a div
    expect(queryAllByText('0').length).toBe(1);
    expect(queryAllByText('1').length).toBe(1);
    expect(queryAllByText('2').length).toBe(1);

    // and the corresponding values should be visible too
    expect(queryAllByText('23.2').length).toBe(1);

    expect(baseElement).toMatchSnapshot();
  });
});
