import { RouterFormProps } from 'components/flow/props';
import { Types } from 'config/interfaces';
import { createSubflowNode, createStartFlowAction } from 'testUtils/assetCreators';
import { getTypeConfig } from 'config';
import {
  render,
  mock,
  fireEvent,
  wait,
  fireChangeText,
  getUpdatedNode,
  getByTestId
} from 'test/utils';
import * as React from 'react';
import * as utils from 'utils';
import { RenderNode, AssetType } from 'store/flowContext';
import SubflowRouterForm from './SubflowRouterForm';
import * as external from 'external';

mock(utils, 'createUUID', utils.seededUUIDs());

const getRouterFormProps = (type: Types, originalNode: RenderNode): RouterFormProps => {
  return {
    nodeSettings: {
      originalNode
    },
    typeConfig: getTypeConfig(type),
    assetStore: { flows: { items: {}, type: AssetType.Flow } },
    updateRouter: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn()
  };
};

const subflowProps = getRouterFormProps(
  Types.split_by_subflow,
  createSubflowNode(createStartFlowAction())
);

mock(
  external,
  'fetchAsset',
  utils.fetchAsset({
    id: 'my-subflow',
    name: 'My Subflow Flow',
    type: AssetType.Flow,
    content: {
      parent_refs: ['max', 'min']
    }
  })
);

describe(SubflowRouterForm.name, () => {
  it('should render', () => {
    const { baseElement } = render(<SubflowRouterForm {...subflowProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should init parameter tab', async () => {
    const { baseElement } = render(<SubflowRouterForm {...subflowProps} />);
    // let our mount event to render our tabs
    await wait();
    expect(baseElement).toMatchSnapshot();
  });

  it('should create result actions for parameters', async () => {
    const { getByText, queryAllByTestId, getByTestId } = render(
      <SubflowRouterForm {...subflowProps} />
    );
    await wait();

    // open the parameter tab
    fireEvent.click(getByText('Parameters'));

    const min = getByTestId('min');
    const max = getByTestId('max');

    // enter some values
    fireChangeText(min, '1');
    fireChangeText(max, '100');

    fireEvent.click(getByText('Ok'));
    let actions = getUpdatedNode(subflowProps).node.actions;

    // should have a run result action for each parameter, plus an enter flow action
    expect(actions.length).toEqual(3);
    expect(actions[0].type).toEqual(Types.set_run_result);
    expect(actions[1].type).toEqual(Types.set_run_result);
    expect(actions[2].type).toEqual(Types.enter_flow);
    expect(subflowProps.updateRouter).toMatchCallSnapshot();

    // remove a parameter
    fireChangeText(min, '');
    fireEvent.click(getByText('Ok'));

    // now only two actions
    actions = getUpdatedNode(subflowProps).node.actions;
    expect(actions.length).toEqual(2);
    expect(actions[0].type).toEqual(Types.set_run_result);
    expect(actions[1].type).toEqual(Types.enter_flow);
  });
});
