import { RouterFormProps } from 'components/flow/props';
import { Types } from 'config/interfaces';
import { HintTypes, WaitTypes } from 'flowTypes';
import { createMatchRouter, createWaitRouter } from 'testUtils/assetCreators';
import WaitRouterForm from 'components/flow/routers/wait/WaitRouterForm';
import { getTypeConfig } from 'config';
import { render, fireEvent, mock, getCallParams } from 'test/utils';
import * as React from 'react';
import * as utils from 'utils';
import { RenderNode } from 'store/flowContext';
import { getSwitchRouter } from 'components/flow/routers/helpers';
import { MEDIA_OPERAND } from 'components/nodeeditor/constants';

mock(utils, 'createUUID', utils.seededUUIDs());

const getRouterFormProps = (type: Types, originalNode: RenderNode): RouterFormProps => {
  return {
    nodeSettings: {
      originalNode
    },
    typeConfig: getTypeConfig(type),
    assetStore: null,
    updateRouter: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn()
  };
};

const colorsWait = getRouterFormProps(
  Types.wait_for_response,
  createMatchRouter(['red', 'green', 'blue'])
);

const audioWait = getRouterFormProps(
  Types.wait_for_audio,
  createWaitRouter(HintTypes.audio, 'Previous Name')
);

describe(WaitRouterForm.name, () => {
  it('should render a normal wait', () => {
    const { baseElement } = render(<WaitRouterForm {...colorsWait} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('shoud save a normal wait', () => {
    const { getByText } = render(<WaitRouterForm {...colorsWait} />);
    fireEvent.click(getByText('Ok'));
    expect(colorsWait.updateRouter).toMatchCallSnapshot();
  });

  it('should render wait for audio with previous name', () => {
    const { baseElement, getByDisplayValue } = render(<WaitRouterForm {...audioWait} />);
    getByDisplayValue('Previous Name');
    expect(baseElement).toMatchSnapshot();
  });

  it('should use the right operand for media types', () => {
    const { getByText } = render(<WaitRouterForm {...audioWait} />);
    fireEvent.click(getByText('Ok'));

    // we should have an operand that looks at attachments
    const [newNode]: [RenderNode] = getCallParams(audioWait.updateRouter);
    const router = getSwitchRouter(newNode.node);
    expect(router.operand).toEqual(MEDIA_OPERAND);

    // check the snapshot for the rest of our call
    expect(audioWait.updateRouter).toMatchCallSnapshot();
  });
});
