import SendMsgForm from 'components/flow/actions/sendmsg/SendMsgForm';
import { ActionFormProps } from 'components/flow/props';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createAxiosError,
  createAxiosResponse,
  createSendMsgAction,
  getActionFormProps
} from 'testUtils/assetCreators';
import * as utils from 'utils';

const { setup } = composeComponentTestUtils<ActionFormProps>(
  SendMsgForm,
  getActionFormProps(createSendMsgAction())
);

mock(utils, 'createUUID', utils.seededUUIDs());

describe(SendMsgForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { instance, props } = setup(true);

      instance.handleMessageUpdate('What is your favorite color?', []);
      instance.handleQuickRepliesUpdate(['red', 'green', 'blue']);
      instance.handleSendAllUpdate(true);

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

      instance.handleMessageUpdate('What is your favorite color?', []);
      instance.handleSave();

      expect(props.updateAction).toMatchCallSnapshot();
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
        $merge: { onClose: jest.fn(), updateAction: jest.fn() }
      });
      instance.handleMessageUpdate("Don't save me bro", []);
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });
});
