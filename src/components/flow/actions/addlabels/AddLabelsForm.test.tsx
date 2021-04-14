import { ActionFormProps } from 'components/flow/props';
import React from 'react';
import { AssetType, RenderNode } from 'store/flowContext';
import { fireEvent, render, fireChangeText, fireTembaSelect, getCallParams } from 'test/utils';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createAddLabelsAction,
  createStartSessionAction,
  getActionFormProps,
  SubscribersGroup
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import AddLabelsForm from './AddLabelsForm';

mock(utils, 'createUUID', utils.seededUUIDs());
const props = getActionFormProps(
  createAddLabelsAction([{ name: 'My Label', uuid: utils.createUUID() }])
);

describe(AddLabelsForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { baseElement, queryByTestId } = render(<AddLabelsForm {...props} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('allows expressions', () => {
      const props = getActionFormProps(createStartSessionAction());
      const { baseElement, getByText, getByTestId } = render(<AddLabelsForm {...props} />);
      fireTembaSelect(getByTestId('temba_select_labels'), [
        {
          name: '@result.my_expression',
          expression: true
        }
      ]);

      expect(baseElement).toMatchSnapshot();

      // save our action
      fireEvent.click(getByText('Ok'));
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();

      const [addLabelAction] = getCallParams(props.updateAction);
      expect(JSON.stringify(addLabelAction)).toMatch('name_match');
    });
  });
});
