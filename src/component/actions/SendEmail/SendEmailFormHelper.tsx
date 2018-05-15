import { FormHelper, Types } from '../../../config/typeConfigs';
import { SendEmail } from '../../../flowTypes';
import { SendEmailFormState } from '../../../store/nodeEditor';

export class SendEmailFormHelper implements FormHelper {
    public actionToState(action: SendEmail): SendEmailFormState {
        if (action) {
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
