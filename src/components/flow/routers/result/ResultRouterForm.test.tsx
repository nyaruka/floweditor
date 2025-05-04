import ResultRouterForm from 'components/flow/routers/result/ResultRouterForm';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { AssetType, RenderNode } from 'store/flowContext';
import { fireEvent, render, getCallParams, fireTembaSelect } from 'test/utils';
import { mock, setupStore } from 'testUtils';
import { createMatchRouter, getRouterFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { getSwitchRouter } from 'components/flow/routers/helpers';
import { InfoResult } from 'temba-components';

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

    const testResult: InfoResult = {
      categories: [],
      key: 'my_test_result',
      name: 'My Test Result',
      node_uuids: []
    };
    setupStore({ results: [testResult] });

    const { baseElement, getByText, getByTestId } = render(<ResultRouterForm {...props} />);

    // turn on delimiting
    fireEvent.click(getByText('Advanced'));

    // todo: find out how to click the checkbox in the test
    // fireEvent.click(getByTestId('delimit_result'))

    // return to main view
    // fireEvent.click(getByText('Split by Flow Result'));

    // should have delimit options
    // getByText('delimited by');
    // expect(baseElement).toMatchSnapshot();
  });

  it('should create the right operand on save', () => {
    const props = getRouterFormProps(routerNode);
    const testResult: InfoResult = {
      categories: [],
      key: 'my_test_result',
      name: 'My Test Result',
      node_uuids: []
    };
    setupStore({ results: [testResult] });

    props.nodeSettings.originalNode.ui.config = {
      operand: {
        id: 'my_test_result',
        name: 'My Test Result',
        type: AssetType.Result
      }
    };

    const { getByText, getByTestId } = render(<ResultRouterForm {...props} />);
    fireTembaSelect(getByTestId('temba_select_flow_result'), 'my_test_result');

    fireEvent.click(getByText('Ok'));

    const [renderNode]: [RenderNode] = getCallParams(props.updateRouter);
    const router = getSwitchRouter(renderNode.node);
    expect(router.operand).toEqual('@results.my_test_result');

    expect(props.updateRouter).toHaveBeenCalled();
    expect(props.updateRouter).toMatchCallSnapshot();
  });

  it('should have a fielded operand if configured', () => {
    const testResult: InfoResult = {
      categories: [],
      key: 'my_test_result',
      name: 'My Test Result',
      node_uuids: []
    };
    setupStore({ results: [testResult] });
    const props = getRouterFormProps(routerNode);

    props.nodeSettings.originalNode.ui.config = {
      operand: {
        id: 'my_test_result',
        name: 'My Test Result',
        type: AssetType.Result
      }
    };

    props.nodeSettings.originalNode.ui.type = Types.split_by_run_result_delimited;

    const { getByText, getByTestId } = render(<ResultRouterForm {...props} />);

    fireTembaSelect(getByTestId('temba_select_flow_result'), testResult);
    fireTembaSelect(getByTestId('temba_select_field_number'), '0');
    fireTembaSelect(getByTestId('temba_select_delimiter'), '+');

    fireEvent.click(getByText('Ok'));

    const [renderNode]: [RenderNode] = getCallParams(props.updateRouter);
    const router = getSwitchRouter(renderNode.node);
    expect(router.operand).toEqual('@(field(results.my_test_result, 0, "+"))');

    expect(props.updateRouter).toHaveBeenCalled();
    expect(props.updateRouter).toMatchCallSnapshot();
  });
});
