import SetRunResultForm from 'components/flow/actions/setrunresult/SetRunResultForm';
import { ActionFormProps } from 'components/flow/props';
import { InfoResult } from 'temba-components';
import { composeComponentTestUtils, setupStore, mock } from 'testUtils';
import { createSetRunResultAction, getActionFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';

const result: InfoResult = {
  key: 'result_name',
  name: 'Result Name',
  categories: [],
  node_uuids: []
};

const { setup } = composeComponentTestUtils<ActionFormProps>(
  SetRunResultForm,
  getActionFormProps(createSetRunResultAction())
);

describe(SetRunResultForm.name, () => {
  describe('render', () => {
    beforeEach(() => {
      mock(utils, 'createUUID', utils.seededUUIDs());
    });

    it('should render', () => {
      setupStore({
        results: [{ categories: [], key: 'result_name', name: 'Result Name', node_uuids: [] }]
      });
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    beforeEach(() => {
      mock(utils, 'createUUID', utils.seededUUIDs());
    });
    it('should save changes', () => {
      const { instance, props } = setup(true);

      instance.handleNameUpdate(result);
      instance.handleValueUpdate('Result Value');
      instance.handleCategoryUpdate('Result Category');

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

      instance.handleNameUpdate(result);
      instance.handleValueUpdate('Result Value');
      instance.handleCategoryUpdate('Result Category');
      instance.handleSave();

      expect(props.updateAction).toMatchCallSnapshot();
    });
  });

  describe('cancel', () => {
    beforeEach(() => {
      mock(utils, 'createUUID', utils.seededUUIDs());
    });
    it('should cancel without changes', () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateAction: jest.fn() }
      });

      instance.handleNameUpdate(result);
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });
});
