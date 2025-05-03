import SendMsgLocalizationForm from 'components/flow/actions/localization/MsgLocalizationForm';
import { LocalizationFormProps } from 'components/flow/props';
import { Types } from 'config/interfaces';
import { LocalizedObject } from 'services/Localization';
import { composeComponentTestUtils, setupStore } from 'testUtils';
import {
  createAxiosError,
  createAxiosResponse,
  createSendMsgAction,
  Spanish
} from 'testUtils/assetCreators';

const action = createSendMsgAction();

const baseProps: LocalizationFormProps = {
  updateLocalizations: jest.fn(),
  onClose: jest.fn(),
  nodeSettings: {
    originalNode: null,
    originalAction: action
  },
  helpArticles: {},
  issues: [],
  assetStore: null
};

const { setup } = composeComponentTestUtils<LocalizationFormProps>(
  SendMsgLocalizationForm,
  baseProps
);

setupStore({ languageCode: 'spa' });

describe(SendMsgLocalizationForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('inits', () => {
    it('inits with initial values', () => {
      const localizedObject = new LocalizedObject(action, Spanish);
      localizedObject.addTranslation('text', ['¡hola!']);
      const { wrapper } = setup(true, {
        nodeSettings: { $merge: { localizations: [localizedObject] } }
      });

      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { instance, props } = setup(true, {
        $merge: { updateLocalizations: jest.fn(), onClose: jest.fn() }
      });

      instance.handleMessageUpdate('What is your favorite color?');
      instance.handleQuickRepliesUpdate(['red', 'green', 'blue']);
      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateLocalizations).toHaveBeenCalled();
      expect(props.updateLocalizations).toMatchCallSnapshot();
    });

    it('should ignore empty quick replies', () => {
      const { instance, props } = setup(true, {
        $merge: { updateLocalizations: jest.fn(), onClose: jest.fn() }
      });

      instance.handleQuickRepliesUpdate([]);
      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateLocalizations).toHaveBeenCalled();
      expect(props.updateLocalizations).toMatchCallSnapshot();
    });

    it('should allow attachment upload in progress', () => {
      const { instance } = setup(true);

      instance.handleAttachmentUploading(true);
      expect(instance.state.uploadError).toEqual('');
      expect(instance.state.uploadInProgress).toEqual(true);

      instance.handleAttachmentUploading(false);
      expect(instance.state.uploadError).toEqual('');
      expect(instance.state.uploadInProgress).toEqual(false);
    });

    it('should allow attachment upload success', () => {
      const { instance } = setup(true);
      const data = {};
      const axiosResponse = createAxiosResponse(data, 200, '');
      instance.handleAttachmentUploaded(axiosResponse);
      expect(instance.state.uploadError).toEqual('');
      expect(instance.state.uploadInProgress).toEqual(false);
    });

    it('should allow attachment upload failed - django error - unsupported file type', () => {
      const { instance } = setup(true);
      const data = { error: 'Unsupported file type' };
      const axiosResponse = createAxiosResponse(data, 200, 'OK');
      instance.handleAttachmentUploaded(axiosResponse);
      expect(instance.state.uploadError).toEqual('Unsupported file type');
      expect(instance.state.uploadInProgress).toEqual(false);
    });

    it('should allow attachment upload failed - django error - max file size', () => {
      const { instance } = setup(true);
      const data = { error: 'Limit for file uploads is 25 MB' };
      const axiosResponse = createAxiosResponse(data, 200, 'OK');
      instance.handleAttachmentUploaded(axiosResponse);
      expect(instance.state.uploadError).toEqual('Limit for file uploads is 25 MB');
      expect(instance.state.uploadInProgress).toEqual(false);
    });

    it('should allow attachment upload failed - nginx error - 500 - unexpected error', () => {
      const { instance } = setup(true);
      const axiosError = createAxiosError(500);
      instance.handleAttachmentUploadFailed(axiosError);
      expect(instance.state.uploadError).toEqual('File upload failed, please try again');
      expect(instance.state.uploadInProgress).toEqual(false);
    });

    it('should allow attachment upload failed - nginx error - 413 - max file size', () => {
      const { instance, props } = setup(true);
      const axiosError = createAxiosError(413);
      instance.handleAttachmentUploadFailed(axiosError);
      expect(instance.state.uploadError).toEqual('Limit for file uploads is 25 MB');
      expect(instance.state.uploadInProgress).toEqual(false);
    });
  });

  describe('cancel', () => {
    it('should cancel without changes', () => {
      const { instance, props } = setup(true, {
        $merge: { updateLocalizations: jest.fn(), onClose: jest.fn() }
      });
      instance.handleMessageUpdate("Don't save me bro");
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateLocalizations).not.toHaveBeenCalled();
    });
  });
});
