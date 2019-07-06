import { RouterFormProps } from 'components/flow/props';
import { getTypeConfig } from 'config';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { fireEvent, render } from 'test/utils';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createRandomNode,
  createRenderNode,
  createSendMsgAction,
  getRouterFormProps
} from 'testUtils/assetCreators';
import * as utils from 'utils';

import RandomRouterForm from './RandomRouterForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<RouterFormProps>(
  RandomRouterForm,
  getRouterFormProps(createRandomNode(2))
);

describe(RandomRouterForm.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('should initialize existing random', () => {
    const props: RouterFormProps = {
      nodeSettings: {
        originalNode: createRandomNode(5)
      },
      typeConfig: getTypeConfig(Types.split_by_random),
      assetStore: null,
      updateRouter: jest.fn(),
      onTypeChange: jest.fn(),
      onClose: jest.fn()
    };

    const { baseElement } = render(<RandomRouterForm {...props} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should remove exits when shrinking', () => {
    const props: RouterFormProps = {
      nodeSettings: {
        originalNode: createRandomNode(5)
      },
      typeConfig: getTypeConfig(Types.split_by_random),
      assetStore: null,
      updateRouter: jest.fn(),
      onTypeChange: jest.fn(),
      onClose: jest.fn()
    };

    const { baseElement, getAllByTestId, getByDisplayValue, getByText } = render(
      <RandomRouterForm {...props} />
    );

    // we start off with five input boxes for our buckets
    expect(getAllByTestId('input').length).toEqual(5);

    // the second select box is our bucket, choose 3 buckets
    fireEvent.change(getAllByTestId('select')[1], {
      target: { value: 3 }
    });

    // now we should only have three input buckets
    expect(getAllByTestId('input').length).toEqual(3);
    expect(baseElement).toMatchSnapshot();

    // now lets save our form
    fireEvent.click(getByText('Ok'));

    expect(props.updateRouter).toMatchCallSnapshot();
  });

  it('should convert from a non-random node', () => {
    const { wrapper, instance, props } = setup(true, {
      nodeSettings: {
        $set: {
          originalAction: createSendMsgAction({ text: '' }),
          originalNode: createRenderNode({
            actions: [createSendMsgAction({ text: 'A message' })],
            exits: [{ uuid: utils.createUUID() }],
            ui: {
              type: Types.execute_actions,
              position: { left: 100, top: 100 }
            }
          })
        }
      }
    });

    instance.handleSave();

    // our orginal node should still only have one exit
    expect(props.nodeSettings.originalNode.node.exits.length).toBe(1);

    expect(wrapper).toMatchSnapshot();
    expect(props.updateRouter).toMatchCallSnapshot();
    expect(props.nodeSettings.originalNode).toMatchSnapshot();
  });
});
