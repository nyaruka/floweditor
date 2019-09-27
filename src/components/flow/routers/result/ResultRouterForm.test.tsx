import ResultRouterForm from 'components/flow/routers/result/ResultRouterForm';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { AssetType, RenderNode } from 'store/flowContext';
import { fireEvent, render, getCallParams } from 'test/utils';
import { mock } from 'testUtils';
import { createMatchRouter, getRouterFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { getSwitchRouter } from 'components/flow/routers/helpers';

const routerNode = createMatchRouter([]);
routerNode.ui = {
  position: { left: 0, top: 0 },
  type: Types.split_by_run_result,
  config: {
    id: 'favorite_color',
    type: AssetType.Result
  }
};

mock(utils, 'createUUID', utils.seededUUIDs());

describe(ResultRouterForm.name, () => {
  it('should render', () => {
    const { baseElement } = render(<ResultRouterForm {...getRouterFormProps(routerNode)} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should show delimit options', () => {
    const props = getRouterFormProps(routerNode);
    const { baseElement, getByText } = render(<ResultRouterForm {...props} />);

    // turn on delimiting
    fireEvent.click(getByText('Advanced'));
    fireEvent.click(getByText('Delimit Result'));

    // return to main view
    fireEvent.click(getByText('Split by Flow Result'));

    // should have delimit options
    getByText('delimited by');

    expect(baseElement).toMatchSnapshot();
  });

  it('should create the right operand on save', () => {
    const props = getRouterFormProps(routerNode);

    const testResult = {
      id: 'my_test_result',
      name: 'My Test Result',
      type: AssetType.Result
    };

    props.nodeSettings.originalNode.ui.config = {
      operand: testResult
    };

    props.assetStore.results.items = { [testResult.id]: testResult };
    const { getByText } = render(<ResultRouterForm {...props} />);

    fireEvent.click(getByText('Ok'));

    const [renderNode]: [RenderNode] = getCallParams(props.updateRouter);
    const router = getSwitchRouter(renderNode.node);
    expect(router.operand).toEqual('@results.my_test_result');

    expect(props.updateRouter).toHaveBeenCalled();
    expect(props.updateRouter).toMatchCallSnapshot();
  });

  it('should a fielded operand if configured', () => {
    const props = getRouterFormProps(routerNode);

    const testResult = {
      id: 'my_test_result',
      name: 'My Test Result',
      type: AssetType.Result
    };

    props.nodeSettings.originalNode.ui.config = {
      operand: testResult
    };

    props.assetStore.results.items = { [testResult.id]: testResult };
    props.nodeSettings.originalNode.ui.type = Types.split_by_run_result_delimited;

    const { getByText, getAllByTestId } = render(<ResultRouterForm {...props} />);

    const selects = getAllByTestId('select');
    fireEvent.change(selects[1], {
      target: { value: 0 }
    });

    fireEvent.change(selects[2], {
      target: { value: '+' }
    });

    fireEvent.click(getByText('Ok'));

    const [renderNode]: [RenderNode] = getCallParams(props.updateRouter);
    const router = getSwitchRouter(renderNode.node);
    expect(router.operand).toEqual('@(field(results.my_test_result, 0, "+"))');

    expect(props.updateRouter).toHaveBeenCalled();
    expect(props.updateRouter).toMatchCallSnapshot();
  });
});
