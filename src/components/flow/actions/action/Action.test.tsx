import * as React from 'react';
import { render } from 'test/utils';

import { ActionWrapper, ActionWrapperProps } from './Action';
import {
  createExit,
  createSendMsgAction,
  English,
  createRenderNode,
  Spanish
} from 'testUtils/assetCreators';
import { AnyAction } from 'flowTypes';
import { getTypeConfig } from 'config';
import { setupStore } from 'testUtils';

const sendMsgAction = createSendMsgAction();
const localization = {
  spa: {
    [sendMsgAction.uuid]: {
      text: ['¡Hola!'],
      quick_replies: ['Sí']
    }
  }
};

const getActionWrapperProps = (action: AnyAction): ActionWrapperProps => {
  const node = createRenderNode({
    actions: [action],
    exits: [createExit()]
  });

  const actionConfig = getTypeConfig(action.type);

  const { component: ActionDiv } = actionConfig;

  if (actionConfig.massageForDisplay) {
    actionConfig.massageForDisplay(action);
  }

  return {
    scrollToAction: '',
    issues: [],
    selected: false,
    localization,
    first: true,
    action: sendMsgAction,
    render: (action: AnyAction) => <ActionDiv {...action} languages={[English, Spanish]} />,
    assetStore: {},
    renderNode: node,
    onOpenNodeEditor: jest.fn(),
    removeAction: jest.fn(),
    moveActionUp: jest.fn()
  };
};

describe('ActionWrapper', () => {
  it('renders a base language', () => {
    const { baseElement } = render(<ActionWrapper {...getActionWrapperProps(sendMsgAction)} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('can have localized quick replies when empty on default language', () => {
    setupStore({ languageCode: 'spa', isTranslating: true });
    const { baseElement, getByText } = render(
      <ActionWrapper {...getActionWrapperProps(sendMsgAction)} />
    );
    expect(baseElement).toMatchSnapshot();

    // our quick reply should be there
    getByText('Sí');
  });
});
