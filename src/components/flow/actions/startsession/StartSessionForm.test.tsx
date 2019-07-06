import { ActionFormProps } from 'components/flow/props';
import React from 'react';
import { AssetType } from 'store/flowContext';
import { fireEvent, render } from 'test/utils';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createStartSessionAction,
  getActionFormProps,
  SubscribersGroup
} from 'testUtils/assetCreators';
import * as utils from 'utils';

import { StartSessionForm } from './StartSessionForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<ActionFormProps>(
  StartSessionForm,
  getActionFormProps(createStartSessionAction())
);

describe(StartSessionForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const props = getActionFormProps(createStartSessionAction());
      const { baseElement, getByText } = render(<StartSessionForm {...props} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('should render create new contacts', () => {
      const props = getActionFormProps(createStartSessionAction());
      const { baseElement, getByText, queryByTestId } = render(<StartSessionForm {...props} />);
      expect(baseElement).toMatchSnapshot();

      expect(queryByTestId('recipients')).not.toBeNull();

      // should have an option to create a new contact
      const checkbox = getByText('Create a new contact');
      fireEvent.click(checkbox);

      expect(queryByTestId('recipients')).toBeNull();
      expect(baseElement).toMatchSnapshot();
    });

    it('should render self, children with base props', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });

    it('should render an empty form with no action', () => {
      const { wrapper, instance } = setup(true, {
        $merge: {
          nodeSettings: { originalNode: null, originalAction: null }
        }
      });

      expect(instance.state).toMatchSnapshot();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { instance, props } = setup(true);

      instance.handleRecipientsChanged([SubscribersGroup]);
      instance.handleFlowChanged([{ id: 'my_flow', name: 'My Flow', type: AssetType.Flow }]);
      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should allow switching from router', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handleRecipientsChanged([SubscribersGroup]);
      instance.handleFlowChanged([{ id: 'my_flow', name: 'My Flow', type: AssetType.Flow }]);
      instance.handleSave();

      expect(props.updateAction).toMatchCallSnapshot();
    });
  });

  describe('cancel', () => {
    it('should cancel without changes', () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateAction: jest.fn() }
      });

      instance.handleRecipientsChanged([SubscribersGroup]);
      instance.handleFlowChanged([{ id: 'my_flow', name: 'My Flow', type: AssetType.Flow }]);
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });
});
