import DialRouterForm from 'components/flow/routers/dial/DialRouterForm';
import { Types } from 'config/interfaces';
import { WaitTypes } from 'flowTypes';
import * as React from 'react';
import { fireEvent, render, getUpdatedNode, fireChangeText } from 'test/utils';
import { mock } from 'testUtils';
import { createDialRouter, getRouterFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { getSwitchRouter } from '../helpers';

const routerNode = createDialRouter('0979123456', 'Dial Result');
routerNode.ui = {
  position: { left: 0, top: 0 },
  type: Types.wait_for_dial
};

const routerProps = getRouterFormProps(routerNode);

mock(utils, 'createUUID', utils.seededUUIDs());

describe(DialRouterForm.name, () => {
  it('should render', () => {
    const { baseElement } = render(<DialRouterForm {...routerProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should reuse ids on updates', () => {
    const { getByText } = render(<DialRouterForm {...routerProps} />);
    fireEvent.click(getByText('Ok'));

    expect(getUpdatedNode(routerProps).node).toEqual(routerProps.nodeSettings.originalNode.node);
  });

  it('should update wait when phone number is changed', () => {
    const { getByTestId, getByText } = render(<DialRouterForm {...routerProps} />);

    fireChangeText(getByTestId('phone'), '@fields.supervisor_phone');
    fireEvent.click(getByText('Ok'));

    const router = getSwitchRouter(getUpdatedNode(routerProps).node);
    expect(router.wait.type).toBe(WaitTypes.dial);
    expect(router.wait.phone).toBe('@fields.supervisor_phone');
    expect(routerProps.updateRouter).toMatchCallSnapshot();
  });
});
