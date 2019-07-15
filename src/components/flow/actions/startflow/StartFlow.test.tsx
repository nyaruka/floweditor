import StartFlowComp from 'components/flow/actions/startflow/StartFlow';
import * as React from 'react';
import { render } from 'test/utils';
import { createStartFlowAction } from 'testUtils/assetCreators';

const startFlowAction = createStartFlowAction();

describe(StartFlowComp.name, () => {
  describe('render', () => {
    it('should render flow name', () => {
      const { baseElement, getByText } = render(<StartFlowComp {...startFlowAction} />);
      getByText(startFlowAction.flow.name);
      expect(baseElement).toMatchSnapshot();
      // const { wrapper, props } = setup();
      // expect(wrapper.text()).toEqual(startFlowAction.flow.name);
      // expect(wrapper).toMatchSnapshot();
    });
  });
});
