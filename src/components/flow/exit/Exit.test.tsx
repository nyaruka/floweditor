import * as React from 'react';
import { render, fireEvent, findByText, getByText } from 'test/utils';
import { ExitComp, ExitProps } from './Exit';
import { createUUID } from 'utils';
import { Exit, FlowNode } from 'flowTypes';
import { Spanish } from 'testUtils/assetCreators';

const exit: Exit = {
  uuid: createUUID(),
  destination_uuid: createUUID()
};
const categories = [{ uuid: createUUID(), name: 'Red', exit_uuid: exit.uuid }];

const exitProps: ExitProps = {
  exit,
  categories,
  recentMessages: [],
  node: { uuid: createUUID(), actions: [], exits: [] },
  showDragHelper: false,
  translating: false,
  dragging: false,
  language: null,
  localization: null,
  segmentCount: 1000,
  plumberConnectExit: (node: FlowNode, exit: Exit) => {},
  plumberRemove: jest.fn(),
  plumberMakeSource: jest.fn(),
  plumberUpdateClass: jest.fn(),
  disconnectExit: jest.fn()
};

jest.useFakeTimers();

describe(ExitComp.name, () => {
  it('renders', () => {
    const { baseElement } = render(<ExitComp {...exitProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('shows activity', () => {
    const { baseElement, getByText } = render(
      <>
        <ExitComp
          {...exitProps}
          recentMessages={[
            { text: 'Hi Mom!', sent: new Date().toUTCString() },
            { text: 'Hi Dad!', sent: new Date().toUTCString() }
          ]}
        />
      </>
    );

    // give our portal a chance to mount
    jest.runAllTimers();

    // we have activity but we can't see our recent messages yet
    getByText('1,000');
    expect(baseElement).toMatchSnapshot(baseElement);
  });

  it('shows recent messages on mouse over', () => {
    const { baseElement, getByText, queryAllByText } = render(
      <>
        <div id="activity_recent_messages"></div>

        <ExitComp
          {...exitProps}
          recentMessages={[
            { text: 'Hi Mom!', sent: new Date().toUTCString() },
            { text: 'Hi Dad!', sent: new Date().toUTCString() }
          ]}
        />
      </>
    );

    // give our portal a chance to mount
    jest.runAllTimers();

    // now we need to mouse over our activity to see recent messages
    const activity = getByText('1,000');
    expect(queryAllByText('Recent Messages').length).toEqual(0);

    fireEvent.mouseEnter(activity);
    jest.runAllTimers();

    expect(queryAllByText('Recent Messages').length).toEqual(1);
    getByText('Hi Mom!');
    getByText('Hi Dad!');
    expect(baseElement).toMatchSnapshot();
  });

  it('shows missing localization', () => {
    const { baseElement, container } = render(
      <ExitComp {...exitProps} translating={true} language={Spanish} localization={{ spa: {} }} />
    );

    expect(container.querySelector('.missing_localization')).not.toBe(null);
    expect(baseElement).toMatchSnapshot();
  });

  it('shows localization', () => {
    const { baseElement, getByText } = render(
      <ExitComp
        {...exitProps}
        translating={true}
        language={Spanish}
        localization={{ spa: { [categories[0].uuid]: { name: ['Hola!'] } } }}
      />
    );

    getByText('Hola!');
    expect(baseElement).toMatchSnapshot();
  });
});
