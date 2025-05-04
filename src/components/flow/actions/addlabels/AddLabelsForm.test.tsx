import * as React from 'react';

import {
  createAddLabelsAction,
  createStartSessionAction,
  getActionFormProps
} from 'testUtils/assetCreators';
import AddLabelsForm from './AddLabelsForm';
import { fireEvent, render, fireTembaSelect, getCallParams, mock } from 'test/utils';
import * as utils from 'utils';

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
