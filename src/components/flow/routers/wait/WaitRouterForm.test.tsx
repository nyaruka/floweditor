import { RouterFormProps } from 'components/flow/props';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { WaitTypes, HintTypes, RouterTypes, Wait } from 'flowTypes';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createRenderNode,
  getRouterFormProps,
  createMatchCase,
  createMatchRouter,
  createWaitRouter
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import WaitRouterForm from 'components/flow/routers/wait/WaitRouterForm';
import { getTypeConfig } from 'config';
import { render, fireEvent } from 'test/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createMatchRouter([]);
routerNode.node.router.wait = {
  type: WaitTypes.msg,
  hint: {
    type: HintTypes.audio
  }
};

routerNode.ui.type = Types.wait_for_audio;

const { setup } = composeComponentTestUtils<RouterFormProps>(
  WaitRouterForm,
  getRouterFormProps(routerNode)
);

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

    const { baseElement, getAllByTestId, getByText } = render(<WaitRouterForm {...props} />);
    expect(baseElement).toMatchSnapshot();

    // the second select box is our bucket, choose 3 buckets
    // fireEvent.change(getAllByTestId('select')[1], {
    // target: { value: 3 }
    // });

    // now we should only have three input buckets
    // expect(getAllByTestId('input').length).toEqual(3);
    //

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
