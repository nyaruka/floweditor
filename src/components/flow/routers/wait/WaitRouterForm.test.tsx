import { RouterFormProps } from 'components/flow/props';
import { Types } from 'config/interfaces';
import { HintTypes } from 'flowTypes';
import { createMatchRouter, createWaitRouter } from 'testUtils/assetCreators';
import WaitRouterForm from 'components/flow/routers/wait/WaitRouterForm';
import { getTypeConfig } from 'config';
import { render, fireEvent, mock } from 'test/utils';
import * as React from 'react';
import * as utils from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

describe(WaitRouterForm.name, () => {
  it('should render a normal wait', () => {
    const props: RouterFormProps = {
      nodeSettings: {
        originalNode: createMatchRouter(['red', 'green', 'blue'])
      },
      typeConfig: getTypeConfig(Types.wait_for_response),
      assetStore: null,
      updateRouter: jest.fn(),
      onTypeChange: jest.fn(),
      onClose: jest.fn()
    };

    const { baseElement, getByText } = render(<WaitRouterForm {...props} />);
    expect(baseElement).toMatchSnapshot();

    // now lets save our form
    fireEvent.click(getByText('Ok'));

    expect(props.updateRouter).toMatchCallSnapshot();
  });

  it('should render wait for audio', () => {
    const originalNode = createWaitRouter(HintTypes.audio, 'Previous Name');

    const props: RouterFormProps = {
      nodeSettings: { originalNode },
      typeConfig: getTypeConfig(Types.wait_for_audio),
      assetStore: null,
      updateRouter: jest.fn(),
      onTypeChange: jest.fn(),
      onClose: jest.fn()
    };

    const { baseElement, getByDisplayValue } = render(<WaitRouterForm {...props} />);

    // make sure we have an input with the previous name
    getByDisplayValue('Previous Name');

    expect(baseElement).toMatchSnapshot();
  });
});
