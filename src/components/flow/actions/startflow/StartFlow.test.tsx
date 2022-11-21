import StartFlowComp from 'components/flow/actions/startflow/StartFlow';
import * as React from 'react';
import { render } from 'test/utils';
import { createMsgStartFlowAction } from 'testUtils/assetCreators';

const startFlowAction = createMsgStartFlowAction();

describe(StartFlowComp.name, () => {
  describe('render', () => {
    it('should render flow name', () => {
      const { baseElement, getByText } = render(<StartFlowComp {...startFlowAction} />);
      getByText(startFlowAction.flow.name);
      expect(baseElement).toMatchSnapshot();
    });
  });
});
