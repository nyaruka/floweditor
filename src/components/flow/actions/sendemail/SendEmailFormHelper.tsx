import { FormHelper, Types } from '~/config/typeConfigs';
import { SendEmail } from '~/flowTypes';
import { NodeEditorSettings, SendEmailFormState } from '~/store/nodeEditor';

export class SendEmailFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): SendEmailFormState {
        if (settings.originalAction && settings.originalAction.type === Types.send_email) {
            const action = settings.originalAction as SendEmail;
            return {
                type: action.type,
                body: { value: action.body },
                subject: { value: action.subject },
                recipients: { value: action.addresses },
                valid: true
            };
        }

        return {
            type: Types.send_email,
            body: { value: '' },
            subject: { value: '' },
            recipients: { value: [] },
            valid: true
        };
    }

    public stateToAction(actionUUID: string, formState: SendEmailFormState): SendEmail {
        return {
            addresses: formState.recipients.value,
            subject: formState.subject.value,
            body: formState.body.value,
            type: formState.type,
            uuid: actionUUID
        };
    }
}
