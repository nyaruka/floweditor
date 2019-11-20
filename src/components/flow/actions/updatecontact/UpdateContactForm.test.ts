import UpdateContactForm from 'components/flow/actions/updatecontact/UpdateContactForm';
import {
  ActionFormProps,
  CHANNEL_PROPERTY,
  LANGUAGE_PROPERTY,
  NAME_PROPERTY
} from 'components/flow/props';
import { AssetType } from 'store/flowContext';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createAddGroupsAction,
  createSetContactFieldAction,
  getActionFormProps
} from 'testUtils/assetCreators';
import * as utils from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<ActionFormProps>(
  UpdateContactForm,
  getActionFormProps(createSetContactFieldAction())
);

describe(UpdateContactForm.name, () => {
  describe('render', () => {
    it('should render an empty form with different action', () => {
      const { wrapper } = setup(true, {
        $merge: {
          nodeSettings: {
            originalNode: null,
            originalAction: createAddGroupsAction()
          }
        }
      });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render an empty form with no action', () => {
      const { wrapper } = setup(true, {
        $merge: {
          nodeSettings: { originalNode: null, originalAction: null }
        }
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    let form: any;

    beforeEach(() => {
      form = setup(true);
    });

    it('should update name', () => {
      form.instance.handlePropertyChange([NAME_PROPERTY]);
      form.instance.handleNameUpdate('Rowan Seymour');
      form.instance.handleSave();
      expect(form.instance.state).toMatchSnapshot();
      expect(form.props.updateAction).toMatchCallSnapshot();
    });

    it('should update field value', () => {
      form.instance.handlePropertyChange([
        { id: 'birthday', name: 'Birthday', type: AssetType.Field }
      ]);
      form.instance.handleFieldValueUpdate('12/25/00');
      form.instance.handleSave();
      expect(form.instance.state).toMatchSnapshot();
      expect(form.props.updateAction).toMatchCallSnapshot();
    });

    it('should update language', () => {
      form.instance.handlePropertyChange([LANGUAGE_PROPERTY]);
      form.instance.handleLanguageUpdate('eng');
      form.instance.handleSave();
      expect(form.instance.state).toMatchSnapshot();
      expect(form.props.updateAction).toMatchCallSnapshot();
    });

    it('should update channel', () => {
      form.instance.handlePropertyChange([CHANNEL_PROPERTY]);
      form.instance.handleChannelUpdate([
        { id: 'channel_id', name: 'Channel Name', type: AssetType.Channel }
      ]);
      form.instance.handleSave();
      expect(form.instance.state).toMatchSnapshot();
      expect(form.props.updateAction).toMatchCallSnapshot();
    });

    it('should validate before saving', () => {
      form.instance.handlePropertyChange([CHANNEL_PROPERTY]);
      form.instance.handleChannelUpdate([null]);

      form.props.updateAction.mockClear();
      form.props.onClose.mockClear();
      form.instance.handleSave();
      expect(form.instance.state).toMatchSnapshot();
      expect(form.props.updateAction).not.toBeCalled();
      expect(form.props.onClose).not.toBeCalled();
    });

    it('should cancel changes', () => {
      form.instance.handlePropertyChange([NAME_PROPERTY]);
      form.instance.handleNameUpdate('Rowan Seymour');
      form.instance.getButtons().secondary.onClick();
      expect(form.props.updateAction).not.toBeCalled();
    });
  });

  describe('should allow switching from router', () => {
    it('to contact name', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handlePropertyChange([NAME_PROPERTY]);
      instance.handleNameUpdate('Rowan Seymour');
      instance.handleSave();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('to field value', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handlePropertyChange([{ id: 'birthday', name: 'Birthday', type: AssetType.Field }]);
      instance.handleFieldValueUpdate('12/25/00');
      instance.handleSave();
      expect(instance.state).toMatchSnapshot();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('to language', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handlePropertyChange([LANGUAGE_PROPERTY]);
      instance.handleLanguageUpdate('eng');
      instance.handleSave();
      expect(instance.state).toMatchSnapshot();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('to channel', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handlePropertyChange([CHANNEL_PROPERTY]);
      instance.handleChannelUpdate([
        { id: 'channel_id', name: 'Channel Name', type: AssetType.Channel }
      ]);
      instance.handleSave();
      expect(instance.state).toMatchSnapshot();
      expect(props.updateAction).toMatchCallSnapshot();
    });
  });
});
